import { ClientSession } from 'mongodb';
import { Session } from 'neo4j-driver';
import { logger } from '../utils/logger';
import { getMongoDBConnection } from './mongodb';
import { getNeo4jConnection } from './neo4j';
import { DualDbEntity, Neo4jNodeRef } from '../models/base';
import { v4 as uuidv4 } from 'uuid';

// Transaction types
export type TransactionOperation = 'create' | 'update' | 'delete';

export interface DualDbWriteOperation {
  operation: TransactionOperation;
  collection: string;
  mongoData: any;
  neo4jLabels: string[];
  neo4jProperties: Record<string, any>;
  neo4jRelationships?: Neo4jRelationship[];
  entityId: string;
}

export interface Neo4jRelationship {
  type: string;
  targetNodeId: string;
  targetLabels: string[];
  properties?: Record<string, any>;
  direction: 'outgoing' | 'incoming';
}

export interface TransactionResult {
  success: boolean;
  mongoResult?: any;
  neo4jResult?: any;
  error?: Error;
  rollbackPerformed?: boolean;
}

export class DualDatabaseCoordinator {
  private mongodb = getMongoDBConnection();
  private neo4j = getNeo4jConnection();

  /**
   * Execute a coordinated transaction across MongoDB and Neo4j
   */
  async executeTransaction(
    operations: DualDbWriteOperation[],
    options: {
      retryAttempts?: number;
      gracefulDegradation?: boolean;
      neo4jRequired?: boolean;
    } = {}
  ): Promise<TransactionResult> {
    const {
      retryAttempts = 3,
      gracefulDegradation = true,
      neo4jRequired = false
    } = options;

    let mongoSession: ClientSession | undefined;
    let neo4jSession: Session | undefined;
    let attempt = 0;

    while (attempt < retryAttempts) {
      try {
        attempt++;
        logger.debug(`Dual-database transaction attempt ${attempt}/${retryAttempts}`);

        // Start MongoDB transaction
        mongoSession = this.mongodb.getClient().startSession();
        await mongoSession.startTransaction();

        // Start Neo4j transaction
        try {
          neo4jSession = this.neo4j.getDriver().session();
          const neo4jTx = neo4jSession.beginTransaction();
          // Store transaction reference for later use
          (neo4jSession as any).currentTransaction = neo4jTx;
        } catch (neo4jError) {
          if (!gracefulDegradation || neo4jRequired) {
            throw new Error(`Neo4j transaction start failed: ${neo4jError}`);
          }
          logger.warn('Neo4j unavailable, continuing with MongoDB only');
          neo4jSession = undefined;
        }

        const mongoResults = [];
        const neo4jResults = [];

        // Execute all operations
        for (const op of operations) {
          const result = await this.executeOperation(op, mongoSession, neo4jSession);
          mongoResults.push(result.mongoResult);
          if (result.neo4jResult) {
            neo4jResults.push(result.neo4jResult);
          }
        }

        // Commit transactions
        await mongoSession.commitTransaction();
        if (neo4jSession && (neo4jSession as any).currentTransaction) {
          await (neo4jSession as any).currentTransaction.commit();
        }

        logger.info('Dual-database transaction completed successfully');
        return {
          success: true,
          mongoResult: mongoResults,
          neo4jResult: neo4jResults
        };

      } catch (error) {
        logger.error(`Dual-database transaction attempt ${attempt} failed:`, error);

        // Rollback transactions
        await this.rollbackTransaction(mongoSession, neo4jSession);

        if (attempt >= retryAttempts) {
          return {
            success: false,
            error: error instanceof Error ? error : new Error(String(error)),
            rollbackPerformed: true
          };
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } finally {
        // Clean up sessions
        if (mongoSession) {
          await mongoSession.endSession();
        }
        if (neo4jSession) {
          await neo4jSession.close();
        }
      }
    }

    return {
      success: false,
      error: new Error('Max retry attempts exceeded'),
      rollbackPerformed: true
    };
  }

  /**
   * Execute a single operation in the dual-database transaction
   */
  private async executeOperation(
    operation: DualDbWriteOperation,
    mongoSession: ClientSession,
    neo4jSession?: Session
  ): Promise<{ mongoResult: any; neo4jResult?: any }> {
    const { collection, mongoData, neo4jLabels, neo4jProperties, neo4jRelationships } = operation;

    // Execute MongoDB operation
    const mongoDb = this.mongodb.getDatabase();
    const mongoCollection = mongoDb.collection(collection);

    let mongoResult;
    switch (operation.operation) {
      case 'create':
        mongoResult = await mongoCollection.insertOne(mongoData, { session: mongoSession });
        break;
      case 'update':
        mongoResult = await mongoCollection.updateOne(
          { id: operation.entityId },
          { $set: mongoData },
          { session: mongoSession }
        );
        break;
      case 'delete':
        mongoResult = await mongoCollection.updateOne(
          { id: operation.entityId },
          { $set: { isDeleted: true, updatedAt: new Date() } },
          { session: mongoSession }
        );
        break;
    }

    let neo4jResult;
    if (neo4jSession) {
      // Execute Neo4j operation
      neo4jResult = await this.executeNeo4jOperation(
        operation,
        neo4jSession
      );
    }

    return { mongoResult, neo4jResult };
  }

  /**
   * Execute Neo4j-specific operation
   */
  private async executeNeo4jOperation(
    operation: DualDbWriteOperation,
    session: Session
  ): Promise<any> {
    const { entityId, neo4jLabels, neo4jProperties, neo4jRelationships } = operation;
    const neo4jTx = (session as any).currentTransaction;

    if (!neo4jTx) {
      throw new Error('No active Neo4j transaction found');
    }

    switch (operation.operation) {
      case 'create':
        return await this.createNeo4jNode(neo4jTx, entityId, neo4jLabels, neo4jProperties, neo4jRelationships);
      case 'update':
        return await this.updateNeo4jNode(neo4jTx, entityId, neo4jProperties, neo4jRelationships);
      case 'delete':
        return await this.deleteNeo4jNode(neo4jTx, entityId);
    }
  }

  /**
   * Create Neo4j node with relationships
   */
  private async createNeo4jNode(
    transaction: any,
    entityId: string,
    labels: string[],
    properties: Record<string, any>,
    relationships?: Neo4jRelationship[]
  ): Promise<any> {
    const labelsStr = labels.map(l => `:${l}`).join('');
    const propsStr = Object.keys(properties).map(key => `${key}: $${key}`).join(', ');
    
    const query = `
      CREATE (n${labelsStr} {id: $id, ${propsStr}})
      RETURN n
    `;

    const parameters = {
      id: entityId,
      ...properties
    };

    const result = await transaction.run(query, parameters);

    // Create relationships if specified
    if (relationships && relationships.length > 0) {
      for (const rel of relationships) {
        await this.createNeo4jRelationship(transaction, entityId, rel);
      }
    }

    return result.records[0]?.get('n');
  }

  /**
   * Update Neo4j node
   */
  private async updateNeo4jNode(
    transaction: any,
    entityId: string,
    properties: Record<string, any>,
    relationships?: Neo4jRelationship[]
  ): Promise<any> {
    const setClause = Object.keys(properties).map(key => `n.${key} = $${key}`).join(', ');
    
    const query = `
      MATCH (n {id: $id})
      SET ${setClause}, n.updatedAt = datetime()
      RETURN n
    `;

    const parameters = {
      id: entityId,
      ...properties
    };

    const result = await transaction.run(query, parameters);

    // Handle relationship updates if specified
    if (relationships && relationships.length > 0) {
      for (const rel of relationships) {
        await this.createNeo4jRelationship(transaction, entityId, rel);
      }
    }

    return result.records[0]?.get('n');
  }

  /**
   * Soft delete Neo4j node
   */
  private async deleteNeo4jNode(transaction: any, entityId: string): Promise<any> {
    const query = `
      MATCH (n {id: $id})
      SET n.isDeleted = true, n.updatedAt = datetime()
      RETURN n
    `;

    const result = await transaction.run(query, { id: entityId });
    return result.records[0]?.get('n');
  }

  /**
   * Create Neo4j relationship
   */
  private async createNeo4jRelationship(
    transaction: any,
    fromNodeId: string,
    relationship: Neo4jRelationship
  ): Promise<void> {
    const { type, targetNodeId, properties = {}, direction } = relationship;
    const propsStr = Object.keys(properties).length > 0 
      ? `{${Object.keys(properties).map(key => `${key}: $${key}`).join(', ')}}`
      : '';

    let query;
    if (direction === 'outgoing') {
      query = `
        MATCH (from {id: $fromId}), (to {id: $toId})
        CREATE (from)-[:${type} ${propsStr}]->(to)
      `;
    } else {
      query = `
        MATCH (from {id: $fromId}), (to {id: $toId})
        CREATE (to)-[:${type} ${propsStr}]->(from)
      `;
    }

    const parameters = {
      fromId: fromNodeId,
      toId: targetNodeId,
      ...properties
    };

    await transaction.run(query, parameters);
  }

  /**
   * Rollback both database transactions
   */
  private async rollbackTransaction(
    mongoSession?: ClientSession,
    neo4jSession?: Session
  ): Promise<void> {
    const errors = [];

    // Rollback MongoDB transaction
    if (mongoSession) {
      try {
        await mongoSession.abortTransaction();
        logger.info('MongoDB transaction rolled back');
      } catch (error) {
        logger.error('MongoDB rollback failed:', error);
        errors.push(error);
      }
    }

    // Rollback Neo4j transaction
    if (neo4jSession) {
      try {
        const neo4jTx = (neo4jSession as any).currentTransaction;
        if (neo4jTx && typeof neo4jTx.rollback === 'function') {
          await neo4jTx.rollback();
        }
        logger.info('Neo4j transaction rolled back');
      } catch (error) {
        logger.error('Neo4j rollback failed:', error);
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Rollback partially failed: ${errors.map(e => e.message).join(', ')}`);
    }
  }

  /**
   * Create a dual-database entity with automatic ID generation and timestamps
   */
  async createEntity<T extends DualDbEntity>(
    collection: string,
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt' | '_id' | 'version' | 'neo4jRef'>,
    neo4jLabels: string[],
    neo4jProperties?: Record<string, any>,
    neo4jRelationships?: Neo4jRelationship[],
    options?: { gracefulDegradation?: boolean; neo4jRequired?: boolean }
  ): Promise<TransactionResult & { entityId?: string }> {
    const entityId = uuidv4();
    const now = new Date();

    const mongoData: T = {
      ...data,
      id: entityId,
      createdAt: now,
      updatedAt: now,
      version: 1,
      isDeleted: false
    } as T;

    const finalNeo4jProperties = {
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      version: 1,
      isDeleted: false,
      ...neo4jProperties
    };

    const operation: DualDbWriteOperation = {
      operation: 'create',
      collection,
      mongoData,
      neo4jLabels,
      neo4jProperties: finalNeo4jProperties,
      neo4jRelationships,
      entityId
    };

    const result = await this.executeTransaction([operation], options);
    
    return {
      ...result,
      entityId: result.success ? entityId : undefined
    };
  }

  /**
   * Update a dual-database entity
   */
  async updateEntity<T extends Partial<DualDbEntity>>(
    collection: string,
    entityId: string,
    data: T,
    neo4jProperties?: Record<string, any>,
    neo4jRelationships?: Neo4jRelationship[],
    options?: { gracefulDegradation?: boolean; neo4jRequired?: boolean }
  ): Promise<TransactionResult> {
    const now = new Date();

    const mongoData = {
      ...data,
      updatedAt: now,
      $inc: { version: 1 }
    };

    const finalNeo4jProperties = {
      updatedAt: now.toISOString(),
      ...neo4jProperties
    };

    const operation: DualDbWriteOperation = {
      operation: 'update',
      collection,
      mongoData,
      neo4jLabels: [], // Not needed for updates
      neo4jProperties: finalNeo4jProperties,
      neo4jRelationships,
      entityId
    };

    return await this.executeTransaction([operation], options);
  }

  /**
   * Soft delete a dual-database entity
   */
  async deleteEntity(
    collection: string,
    entityId: string,
    options?: { gracefulDegradation?: boolean; neo4jRequired?: boolean }
  ): Promise<TransactionResult> {
    const operation: DualDbWriteOperation = {
      operation: 'delete',
      collection,
      mongoData: {},
      neo4jLabels: [],
      neo4jProperties: {},
      entityId
    };

    return await this.executeTransaction([operation], options);
  }
}

// Singleton instance
let dualDbCoordinator: DualDatabaseCoordinator | null = null;

export function getDualDatabaseCoordinator(): DualDatabaseCoordinator {
  if (!dualDbCoordinator) {
    dualDbCoordinator = new DualDatabaseCoordinator();
  }
  return dualDbCoordinator;
}