import neo4j, { Driver, Session, Result } from 'neo4j-driver';
import { logger } from '../utils/logger';

export interface Neo4jConfig {
  uri: string;
  username: string;
  password: string;
  database: string;
}

export class Neo4jConnection {
  private driver: Driver | null = null;
  private config: Neo4jConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 2;
  private reconnectDelay = 1000; // 1 second

  constructor(config: Neo4jConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      this.driver = neo4j.driver(
        this.config.uri,
        neo4j.auth.basic(this.config.username, this.config.password),
        {
          maxConnectionPoolSize: 50,
          connectionAcquisitionTimeout: 30000, // 30 seconds
          maxTransactionRetryTime: 15000, // 15 seconds
          logging: {
            level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
            logger: (level, message) => logger.info({ level, message }, 'Neo4j Driver')
          }
        }
      );

      // Test the connection
      await this.verifyConnection();
      logger.info('Neo4j connection established successfully');
      this.reconnectAttempts = 0;
    } catch (error) {
      logger.error({ error }, 'Failed to connect to Neo4j');
      await this.handleReconnection();
    }
  }

  private async verifyConnection(): Promise<void> {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized');
    }

    const session = this.driver.session({ database: this.config.database });
    try {
      await session.run('RETURN 1');
      logger.info('Neo4j connection verified');
    } finally {
      await session.close();
    }
  }

  private async handleReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached. Neo4j connection failed.');
      throw new Error('Neo4j connection failed after maximum retry attempts');
    }

    this.reconnectAttempts++;
    logger.warn(`Attempting to reconnect to Neo4j (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));
    await this.connect();
  }

  async getSession(database?: string): Promise<Session> {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized. Call connect() first.');
    }

    return this.driver.session({ 
      database: database || this.config.database,
      defaultAccessMode: neo4j.session.WRITE
    });
  }

  async executeQuery(
    query: string, 
    parameters?: Record<string, any>,
    database?: string
  ): Promise<Result> {
    const session = await this.getSession(database);
    try {
      logger.debug({ query, parameters }, 'Executing Neo4j query');
      return await session.run(query, parameters);
    } catch (error) {
      logger.error({ error, query, parameters }, 'Neo4j query failed');
      throw error;
    } finally {
      await session.close();
    }
  }

  async executeTransaction<T>(
    work: (tx: any) => Promise<T>,
    database?: string
  ): Promise<T> {
    const session = await this.getSession(database);
    try {
      return await session.executeWrite(work);
    } catch (error) {
      logger.error({ error }, 'Neo4j transaction failed');
      throw error;
    } finally {
      await session.close();
    }
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number; error?: string }> {
    try {
      const startTime = Date.now();
      await this.verifyConnection();
      const latency = Date.now() - startTime;
      
      return { status: 'healthy', latency };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
      logger.info('Neo4j connection closed');
    }
  }

  getDriver(): Driver | null {
    return this.driver;
  }

  isConnected(): boolean {
    return this.driver !== null;
  }
}

// Singleton instance
let neo4jConnection: Neo4jConnection | null = null;

export function initializeNeo4j(config: Neo4jConfig): Neo4jConnection {
  if (!neo4jConnection) {
    neo4jConnection = new Neo4jConnection(config);
  }
  return neo4jConnection;
}

export function getNeo4jConnection(): Neo4jConnection {
  if (!neo4jConnection) {
    throw new Error('Neo4j connection not initialized. Call initializeNeo4j() first.');
  }
  return neo4jConnection;
}

// Graceful shutdown handler
export async function closeNeo4jConnection(): Promise<void> {
  if (neo4jConnection) {
    await neo4jConnection.close();
    neo4jConnection = null;
  }
}