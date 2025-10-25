import { logger } from '../utils/logger';
import { getMongoDBConnection } from './mongodb';
import { getNeo4jConnection } from './neo4j';

export interface ServiceStatus {
  neo4j: {
    available: boolean;
    lastChecked: Date;
    error?: string;
  };
  mongodb: {
    available: boolean;
    lastChecked: Date;
    error?: string;
  };
}

export interface DegradationConfig {
  neo4jHealthCheckInterval: number; // milliseconds
  mongoHealthCheckInterval: number; // milliseconds
  maxRetryAttempts: number;
  retryDelay: number; // milliseconds
  enableBackgroundSync: boolean;
  syncBatchSize: number;
}

const DEFAULT_CONFIG: DegradationConfig = {
  neo4jHealthCheckInterval: 30000, // 30 seconds
  mongoHealthCheckInterval: 10000, // 10 seconds
  maxRetryAttempts: 3,
  retryDelay: 1000,
  enableBackgroundSync: true,
  syncBatchSize: 100
};

export class GracefulDegradationService {
  private config: DegradationConfig;
  private serviceStatus: ServiceStatus;
  private healthCheckTimers: { neo4j?: NodeJS.Timeout; mongodb?: NodeJS.Timeout } = {};
  private unsyncedOperations: Array<{
    id: string;
    timestamp: Date;
    operation: 'create' | 'update' | 'delete';
    collection: string;
    entityId: string;
    neo4jLabels: string[];
    neo4jProperties: Record<string, any>;
    retryCount: number;
  }> = [];

  constructor(config: Partial<DegradationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.serviceStatus = {
      neo4j: { available: false, lastChecked: new Date() },
      mongodb: { available: false, lastChecked: new Date() }
    };

    this.startHealthChecks();
  }

  /**
   * Get current service status
   */
  getServiceStatus(): ServiceStatus {
    return { ...this.serviceStatus };
  }

  /**
   * Check if Neo4j operations should be attempted
   */
  shouldAttemptNeo4j(): boolean {
    return this.serviceStatus.neo4j.available;
  }

  /**
   * Check if MongoDB operations should be attempted
   */
  shouldAttemptMongoDB(): boolean {
    return this.serviceStatus.mongodb.available;
  }

  /**
   * Queue an operation for later sync when Neo4j becomes available
   */
  queueUnsyncedOperation(
    operation: 'create' | 'update' | 'delete',
    collection: string,
    entityId: string,
    neo4jLabels: string[],
    neo4jProperties: Record<string, any>
  ): void {
    if (!this.config.enableBackgroundSync) {
      logger.warn('Background sync disabled, skipping unsynced operation queue');
      return;
    }

    const unsyncedOp = {
      id: `${operation}_${collection}_${entityId}_${Date.now()}`,
      timestamp: new Date(),
      operation,
      collection,
      entityId,
      neo4jLabels,
      neo4jProperties,
      retryCount: 0
    };

    this.unsyncedOperations.push(unsyncedOp);
    logger.debug(`Queued unsynced operation: ${unsyncedOp.id}`);

    // Limit queue size to prevent memory issues
    if (this.unsyncedOperations.length > 1000) {
      const removed = this.unsyncedOperations.splice(0, 100);
      logger.warn(`Removed ${removed.length} old unsynced operations to prevent memory overflow`);
    }
  }

  /**
   * Process queued operations when Neo4j becomes available
   */
  private async processUnsyncedOperations(): Promise<void> {
    if (!this.shouldAttemptNeo4j() || this.unsyncedOperations.length === 0) {
      return;
    }

    logger.info(`Processing ${this.unsyncedOperations.length} unsynced operations`);

    const batch = this.unsyncedOperations.splice(0, this.config.syncBatchSize);
    const successful: string[] = [];
    const failed: typeof batch = [];

    for (const op of batch) {
      try {
        await this.executeNeo4jOperation(op);
        successful.push(op.id);
        logger.debug(`Successfully synced operation: ${op.id}`);
      } catch (error) {
        op.retryCount++;
        if (op.retryCount < this.config.maxRetryAttempts) {
          failed.push(op);
          logger.warn(`Failed to sync operation ${op.id}, attempt ${op.retryCount}/${this.config.maxRetryAttempts}`);
        } else {
          logger.error(`Permanently failed to sync operation ${op.id} after ${op.retryCount} attempts:`, error);
        }
      }
    }

    // Re-queue failed operations for retry
    this.unsyncedOperations.unshift(...failed);

    logger.info(`Processed unsynced operations: ${successful.length} successful, ${failed.length} failed/retrying`);
  }

  /**
   * Execute a Neo4j operation for background sync
   */
  private async executeNeo4jOperation(op: {
    operation: 'create' | 'update' | 'delete';
    entityId: string;
    neo4jLabels: string[];
    neo4jProperties: Record<string, any>;
  }): Promise<void> {
    const neo4j = getNeo4jConnection();
    
    switch (op.operation) {
      case 'create':
        await this.createNeo4jNode(op.entityId, op.neo4jLabels, op.neo4jProperties);
        break;
      case 'update':
        await this.updateNeo4jNode(op.entityId, op.neo4jProperties);
        break;
      case 'delete':
        await this.deleteNeo4jNode(op.entityId);
        break;
    }
  }

  /**
   * Create Neo4j node for background sync
   */
  private async createNeo4jNode(
    entityId: string,
    labels: string[],
    properties: Record<string, any>
  ): Promise<void> {
    const neo4j = getNeo4jConnection();
    const labelsStr = labels.map(l => `:${l}`).join('');
    const propsStr = Object.keys(properties).map(key => `${key}: $${key}`).join(', ');
    
    const query = `
      MERGE (n${labelsStr} {id: $id})
      ON CREATE SET n += {${propsStr}}
      ON MATCH SET n += {${propsStr}}
      RETURN n
    `;

    const parameters = {
      id: entityId,
      ...properties
    };

    await neo4j.executeQuery(query, parameters);
  }

  /**
   * Update Neo4j node for background sync
   */
  private async updateNeo4jNode(
    entityId: string,
    properties: Record<string, any>
  ): Promise<void> {
    const neo4j = getNeo4jConnection();
    const setClause = Object.keys(properties).map(key => `n.${key} = $${key}`).join(', ');
    
    const query = `
      MATCH (n {id: $id})
      SET ${setClause}
      RETURN n
    `;

    const parameters = {
      id: entityId,
      ...properties
    };

    await neo4j.executeQuery(query, parameters);
  }

  /**
   * Delete Neo4j node for background sync
   */
  private async deleteNeo4jNode(entityId: string): Promise<void> {
    const neo4j = getNeo4jConnection();
    
    const query = `
      MATCH (n {id: $id})
      SET n.isDeleted = true, n.updatedAt = datetime()
      RETURN n
    `;

    await neo4j.executeQuery(query, { id: entityId });
  }

  /**
   * Start periodic health checks for both databases
   */
  private startHealthChecks(): void {
    // Neo4j health check
    this.healthCheckTimers.neo4j = setInterval(async () => {
      await this.checkNeo4jHealth();
    }, this.config.neo4jHealthCheckInterval);

    // MongoDB health check
    this.healthCheckTimers.mongodb = setInterval(async () => {
      await this.checkMongoDBHealth();
    }, this.config.mongoHealthCheckInterval);

    // Initial health checks
    this.checkNeo4jHealth();
    this.checkMongoDBHealth();

    logger.info('Started database health checks');
  }

  /**
   * Check Neo4j health and process unsynced operations if it becomes available
   */
  private async checkNeo4jHealth(): Promise<void> {
    const wasAvailable = this.serviceStatus.neo4j.available;
    
    try {
      const neo4j = getNeo4jConnection();
      const healthResult = await neo4j.healthCheck();
      
      this.serviceStatus.neo4j = {
        available: healthResult.status === 'healthy',
        lastChecked: new Date(),
        error: healthResult.error
      };

      // If Neo4j just became available, process queued operations
      if (!wasAvailable && this.serviceStatus.neo4j.available) {
        logger.info('Neo4j became available, processing unsynced operations');
        await this.processUnsyncedOperations();
      }
      // Also process operations if Neo4j is available and we have queued operations (for retries)
      else if (this.serviceStatus.neo4j.available && this.unsyncedOperations.length > 0) {
        logger.debug('Processing queued operations while Neo4j available');
        await this.processUnsyncedOperations();
      }
    } catch (error) {
      this.serviceStatus.neo4j = {
        available: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    if (wasAvailable !== this.serviceStatus.neo4j.available) {
      logger.info(`Neo4j status changed: ${wasAvailable ? 'available' : 'unavailable'} -> ${this.serviceStatus.neo4j.available ? 'available' : 'unavailable'}`);
    }
  }

  /**
   * Check MongoDB health
   */
  private async checkMongoDBHealth(): Promise<void> {
    const wasAvailable = this.serviceStatus.mongodb.available;
    
    try {
      const mongodb = getMongoDBConnection();
      const healthResult = await mongodb.healthCheck();
      
      this.serviceStatus.mongodb = {
        available: healthResult.status === 'healthy',
        lastChecked: new Date(),
        error: healthResult.error
      };
    } catch (error) {
      this.serviceStatus.mongodb = {
        available: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    if (wasAvailable !== this.serviceStatus.mongodb.available) {
      logger.info(`MongoDB status changed: ${wasAvailable ? 'available' : 'unavailable'} -> ${this.serviceStatus.mongodb.available ? 'available' : 'unavailable'}`);
    }
  }

  /**
   * Get statistics about unsynced operations
   */
  getUnsyncedStats(): {
    totalQueued: number;
    operationTypes: Record<string, number>;
    oldestOperation?: Date;
    newestOperation?: Date;
  } {
    const stats = {
      totalQueued: this.unsyncedOperations.length,
      operationTypes: {} as Record<string, number>,
      oldestOperation: undefined as Date | undefined,
      newestOperation: undefined as Date | undefined
    };

    if (this.unsyncedOperations.length > 0) {
      // Count operation types
      for (const op of this.unsyncedOperations) {
        stats.operationTypes[op.operation] = (stats.operationTypes[op.operation] || 0) + 1;
      }

      // Find oldest and newest operations
      const timestamps = this.unsyncedOperations.map(op => op.timestamp);
      stats.oldestOperation = new Date(Math.min(...timestamps.map(t => t.getTime())));
      stats.newestOperation = new Date(Math.max(...timestamps.map(t => t.getTime())));
    }

    return stats;
  }

  /**
   * Clear all unsynced operations (use with caution)
   */
  clearUnsyncedOperations(): void {
    const count = this.unsyncedOperations.length;
    this.unsyncedOperations = [];
    logger.warn(`Cleared ${count} unsynced operations`);
  }

  /**
   * Stop health checks and clean up
   */
  stop(): void {
    if (this.healthCheckTimers.neo4j) {
      clearInterval(this.healthCheckTimers.neo4j);
    }
    if (this.healthCheckTimers.mongodb) {
      clearInterval(this.healthCheckTimers.mongodb);
    }
    
    logger.info('Stopped database health checks');
  }
}

// Singleton instance
let gracefulDegradationService: GracefulDegradationService | null = null;

export function getGracefulDegradationService(config?: Partial<DegradationConfig>): GracefulDegradationService {
  if (!gracefulDegradationService) {
    gracefulDegradationService = new GracefulDegradationService(config);
  }
  return gracefulDegradationService;
}