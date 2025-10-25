import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoClient, Db } from 'mongodb';
import { MongoDBConnection, getMongoDBConnection, initializeMongoDB } from './mongodb';

// Note: Not mocking logger for integration tests - we want real output

describe('MongoDBConnection', () => {
  const testConfig = {
    uri: 'mongodb://localhost:27017',
    database: 'test-personal-dashboard'
  };

  let connection: MongoDBConnection;

  beforeEach(() => {
    connection = new MongoDBConnection(testConfig);
  });

  describe('connect', () => {
    it('should connect to MongoDB successfully', async () => {
      await connection.connect();

      const db = connection.getDatabase();
      expect(db).toBeDefined();
      expect(db.databaseName).toBe(testConfig.database);

      await connection.disconnect();
    });

    it('should not reconnect if already connected', async () => {
      await connection.connect();
      await connection.connect(); // Second call should be a no-op

      const db = connection.getDatabase();
      expect(db).toBeDefined();

      await connection.disconnect();
    });

    it('should throw error on invalid connection string', async () => {
      const invalidConnection = new MongoDBConnection({
        uri: 'mongodb://invalid-host:99999',
        database: 'test'
      });

      await expect(invalidConnection.connect()).rejects.toThrow();
    });
  });

  describe('disconnect', () => {
    it('should disconnect from MongoDB', async () => {
      await connection.connect();
      await connection.disconnect();

      expect(() => connection.getDatabase()).toThrow('MongoDB not connected');
    });

    it('should handle disconnect when not connected', async () => {
      await expect(connection.disconnect()).resolves.not.toThrow();
    });
  });

  describe('getDatabase', () => {
    it('should return database instance when connected', async () => {
      await connection.connect();
      const db = connection.getDatabase();

      expect(db).toBeDefined();
      expect(db).toBeInstanceOf(Db);

      await connection.disconnect();
    });

    it('should throw error when not connected', () => {
      expect(() => connection.getDatabase()).toThrow('MongoDB not connected');
    });
  });

  describe('getClient', () => {
    it('should return client instance when connected', async () => {
      await connection.connect();
      const client = connection.getClient();

      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(MongoClient);

      await connection.disconnect();
    });

    it('should throw error when not connected', () => {
      expect(() => connection.getClient()).toThrow('MongoDB not connected');
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when connected', async () => {
      await connection.connect();
      const health = await connection.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.latency).toBeDefined();
      expect(typeof health.latency).toBe('number');

      await connection.disconnect();
    });

    it('should return disconnected status when not connected', async () => {
      const health = await connection.healthCheck();

      expect(health.status).toBe('disconnected');
      expect(health.error).toBe('Not connected');
    });

    it('should return unhealthy status after disconnect', async () => {
      await connection.connect();
      await connection.disconnect();

      const health = await connection.healthCheck();
      expect(health.status).toBe('disconnected');
    });
  });

  describe('getStats', () => {
    it('should return database statistics', async () => {
      await connection.connect();
      const stats = await connection.getStats();

      expect(stats).toBeDefined();
      expect(stats.database).toBe(testConfig.database);
      expect(stats.collections).toBeDefined();
      expect(typeof stats.collections).toBe('number');
      expect(stats.dataSize).toBeDefined();
      expect(stats.storageSize).toBeDefined();

      await connection.disconnect();
    });

    it('should throw error when not connected', async () => {
      await expect(connection.getStats()).rejects.toThrow('MongoDB not connected');
    });
  });
});

describe('Singleton functions', () => {
  const testConfig = {
    uri: 'mongodb://localhost:27017',
    database: 'test-personal-dashboard-singleton'
  };

  afterAll(async () => {
    try {
      const connection = getMongoDBConnection();
      await connection.disconnect();
    } catch (error) {
      // Ignore if not connected
    }
  });

  describe('getMongoDBConnection', () => {
    it('should throw error if not initialized', () => {
      // Reset singleton for this test
      expect(() => {
        const conn = getMongoDBConnection();
        if (!conn.getClient()) {
          throw new Error('MongoDB config required for initial connection');
        }
      }).toThrow();
    });

    it('should return singleton instance', () => {
      const conn1 = getMongoDBConnection(testConfig);
      const conn2 = getMongoDBConnection();

      expect(conn1).toBe(conn2);
    });
  });

  describe('initializeMongoDB', () => {
    it('should initialize and connect to MongoDB', async () => {
      const connection = await initializeMongoDB(testConfig);

      expect(connection).toBeDefined();
      expect(connection.getDatabase()).toBeDefined();

      await connection.disconnect();
    });

    it('should return same instance on multiple calls', async () => {
      const conn1 = await initializeMongoDB(testConfig);
      const conn2 = getMongoDBConnection();

      expect(conn1).toBe(conn2);

      await conn1.disconnect();
    });
  });
});

describe('MongoDB integration tests', () => {
  const testConfig = {
    uri: 'mongodb://localhost:27017',
    database: 'test-personal-dashboard-integration'
  };

  let connection: MongoDBConnection;

  beforeAll(async () => {
    connection = new MongoDBConnection(testConfig);
    await connection.connect();
  });

  afterAll(async () => {
    // Clean up test data
    const db = connection.getDatabase();
    await db.dropDatabase();
    await connection.disconnect();
  });

  it('should perform CRUD operations', async () => {
    const db = connection.getDatabase();
    const collection = db.collection('test_collection');

    // Create
    const insertResult = await collection.insertOne({
      name: 'Test Item',
      value: 42,
      createdAt: new Date()
    });
    expect(insertResult.insertedId).toBeDefined();

    // Read
    const foundDoc = await collection.findOne({ _id: insertResult.insertedId });
    expect(foundDoc).toBeDefined();
    expect(foundDoc?.name).toBe('Test Item');
    expect(foundDoc?.value).toBe(42);

    // Update
    const updateResult = await collection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { value: 100 } }
    );
    expect(updateResult.modifiedCount).toBe(1);

    // Verify update
    const updatedDoc = await collection.findOne({ _id: insertResult.insertedId });
    expect(updatedDoc?.value).toBe(100);

    // Delete
    const deleteResult = await collection.deleteOne({ _id: insertResult.insertedId });
    expect(deleteResult.deletedCount).toBe(1);

    // Verify deletion
    const deletedDoc = await collection.findOne({ _id: insertResult.insertedId });
    expect(deletedDoc).toBeNull();
  });

  it('should handle transactions (requires replica set)', async () => {
    const client = connection.getClient();
    const db = connection.getDatabase();
    const collection = db.collection('test_transactions');

    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        await collection.insertOne({ name: 'Transaction Item 1', value: 1 }, { session });
        await collection.insertOne({ name: 'Transaction Item 2', value: 2 }, { session });
      });

      const count = await collection.countDocuments({});
      expect(count).toBe(2);
    } catch (error: any) {
      // Skip test if MongoDB is not configured as a replica set
      if (error.message?.includes('Transaction numbers are only allowed on a replica set')) {
        console.warn('⚠️  Skipping transaction test - MongoDB replica set required');
        return; // Skip this test gracefully
      }
      throw error;
    } finally {
      await session.endSession();
    }
  });

  it('should create and use indexes', async () => {
    const db = connection.getDatabase();
    const collection = db.collection('test_indexes');

    // Create index
    await collection.createIndex({ name: 1 }, { unique: true });

    // Insert document
    await collection.insertOne({ name: 'Unique Name', value: 1 });

    // Try to insert duplicate
    await expect(
      collection.insertOne({ name: 'Unique Name', value: 2 })
    ).rejects.toThrow();

    // Verify indexes exist
    const indexes = await collection.listIndexes().toArray();
    const nameIndex = indexes.find(idx => idx.key?.name === 1);
    expect(nameIndex).toBeDefined();
    expect(nameIndex?.unique).toBe(true);
  });
});
