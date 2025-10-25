import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import { logger } from '../utils/logger';

export interface MongoDBConfig {
  uri: string;
  database: string;
}

export class MongoDBConnection {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private config: MongoDBConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 2000; // 2 seconds

  constructor(config: MongoDBConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.client?.topology?.isConnected()) {
      logger.debug('MongoDB already connected');
      return;
    }

    try {
      const options: MongoClientOptions = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4, skip trying IPv6
      };

      this.client = new MongoClient(this.config.uri, options);
      
      logger.info(`Connecting to MongoDB at ${this.config.uri}`);
      await this.client.connect();
      
      this.db = this.client.db(this.config.database);
      
      // Test the connection
      await this.db.admin().ping();
      
      logger.info(`Successfully connected to MongoDB database: ${this.config.database}`);
      this.reconnectAttempts = 0;
      
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      await this.handleReconnection();
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      logger.info('Disconnected from MongoDB');
    }
  }

  private async handleReconnection(): Promise<void> {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      logger.warn(`MongoDB reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));
      await this.connect();
    } else {
      logger.error('Max MongoDB reconnection attempts reached');
    }
  }

  getDatabase(): Db {
    if (!this.db) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    return this.db;
  }

  getClient(): MongoClient {
    if (!this.client) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    return this.client;
  }

  async healthCheck(): Promise<{ status: string; latency?: number; error?: string }> {
    try {
      if (!this.db) {
        return { status: 'disconnected', error: 'Not connected' };
      }

      const start = Date.now();
      await this.db.admin().ping();
      const latency = Date.now() - start;

      return { status: 'healthy', latency };
    } catch (error) {
      logger.error('MongoDB health check failed:', error);
      return { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getStats(): Promise<any> {
    try {
      if (!this.db) {
        throw new Error('MongoDB not connected');
      }

      const stats = await this.db.stats();
      return {
        database: stats.db,
        collections: stats.collections,
        objects: stats.objects,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize
      };
    } catch (error) {
      logger.error('Failed to get MongoDB stats:', error);
      throw error;
    }
  }
}

// Singleton instance
let mongoConnection: MongoDBConnection | null = null;

export function getMongoDBConnection(config?: MongoDBConfig): MongoDBConnection {
  if (!mongoConnection) {
    if (!config) {
      throw new Error('MongoDB config required for initial connection');
    }
    mongoConnection = new MongoDBConnection(config);
  }
  return mongoConnection;
}

export async function initializeMongoDB(config: MongoDBConfig): Promise<MongoDBConnection> {
  const connection = getMongoDBConnection(config);
  await connection.connect();
  return connection;
}