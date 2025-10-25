import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { Db } from 'mongodb';
import { CollectionManager, getCollectionManager, COLLECTIONS } from './collections';
import { initializeMongoDB, MongoDBConnection } from './mongodb';

// Mock the logger
vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('CollectionManager', () => {
  const testConfig = {
    uri: 'mongodb://localhost:27017',
    database: 'test-collections-manager'
  };

  let mongoConnection: MongoDBConnection;
  let db: Db;
  let collectionManager: CollectionManager;

  beforeAll(async () => {
    mongoConnection = await initializeMongoDB(testConfig);
    db = mongoConnection.getDatabase();
    collectionManager = getCollectionManager();
  });

  afterAll(async () => {
    try {
      // Clean up database but don't disconnect (shared connection with other test blocks)
      if (mongoConnection && mongoConnection.getClient()) {
        const db = mongoConnection.getClient().db(testConfig.database);
        await db.dropDatabase();
        // Don't disconnect here - the connection is shared with "Index functionality tests"
      }
    } catch (error) {
      // Ignore cleanup errors
      console.warn('Cleanup error in afterAll:', error);
    }
  });

  beforeEach(async () => {
    // Drop all test collections before each test
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.dropCollection(collection.name);
    }
  });

  describe('initializeCollections', () => {
    it('should create all collections defined in COLLECTIONS', async () => {
      await collectionManager.initializeCollections();

      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);

      for (const collectionName of Object.values(COLLECTIONS)) {
        expect(collectionNames).toContain(collectionName);
      }
    });

    it('should create indexes for all collections', async () => {
      await collectionManager.initializeCollections();

      // Check a few specific collections for indexes
      const transactionsCollection = db.collection(COLLECTIONS.FINANCIAL_TRANSACTIONS);
      const transactionsIndexes = await transactionsCollection.listIndexes().toArray();

      // Should have multiple indexes (including default _id index)
      expect(transactionsIndexes.length).toBeGreaterThan(1);

      // Check for specific indexes
      const idIndex = transactionsIndexes.find(idx => idx.name === 'transactions_id_unique');
      expect(idIndex).toBeDefined();
      expect(idIndex?.unique).toBe(true);

      const userDateIndex = transactionsIndexes.find(idx => idx.name === 'transactions_user_date');
      expect(userDateIndex).toBeDefined();
    });

    it('should handle re-initialization gracefully', async () => {
      await collectionManager.initializeCollections();

      // Second initialization should not throw
      await expect(collectionManager.initializeCollections()).resolves.not.toThrow();

      const collections = await db.listCollections().toArray();
      expect(collections.length).toBeGreaterThan(0);
    });

    it('should create text search indexes', async () => {
      await collectionManager.initializeCollections();

      const transactionsCollection = db.collection(COLLECTIONS.FINANCIAL_TRANSACTIONS);
      const indexes = await transactionsCollection.listIndexes().toArray();

      const textIndex = indexes.find(idx => idx.name === 'transactions_text_search');
      expect(textIndex).toBeDefined();
    });

    it('should create geospatial indexes', async () => {
      await collectionManager.initializeCollections();

      const transactionsCollection = db.collection(COLLECTIONS.FINANCIAL_TRANSACTIONS);
      const indexes = await transactionsCollection.listIndexes().toArray();

      const geoIndex = indexes.find(idx => idx.name === 'transactions_location_geo');
      expect(geoIndex).toBeDefined();
      expect(geoIndex?.['2dsphereIndexVersion']).toBeDefined();
    });

    it('should create compound indexes', async () => {
      await collectionManager.initializeCollections();

      const tasksCollection = db.collection(COLLECTIONS.TASKS);
      const indexes = await tasksCollection.listIndexes().toArray();

      const compoundIndex = indexes.find(idx => idx.name === 'tasks_user_status_priority');
      expect(compoundIndex).toBeDefined();

      const keys = compoundIndex?.key;
      expect(keys?.userId).toBe(1);
      expect(keys?.status).toBe(1);
      expect(keys?.priority).toBe(-1);
    });
  });

  describe('getCollectionStats', () => {
    beforeEach(async () => {
      await collectionManager.initializeCollections();
    });

    it('should return stats for all collections', async () => {
      const stats = await collectionManager.getCollectionStats();

      expect(stats).toBeDefined();
      expect(Object.keys(stats).length).toBe(Object.keys(COLLECTIONS).length);

      for (const collectionName of Object.values(COLLECTIONS)) {
        expect(stats[collectionName]).toBeDefined();
        expect(stats[collectionName].documentCount).toBeDefined();
        expect(stats[collectionName].indexCount).toBeDefined();
        expect(stats[collectionName].indexes).toBeDefined();
      }
    });

    it('should include document counts', async () => {
      // Insert some test documents
      const usersCollection = db.collection(COLLECTIONS.USERS);
      await usersCollection.insertMany([
        { id: 'user1', name: 'User 1' },
        { id: 'user2', name: 'User 2' },
        { id: 'user3', name: 'User 3' }
      ]);

      const stats = await collectionManager.getCollectionStats();

      expect(stats[COLLECTIONS.USERS].documentCount).toBe(3);
    });

    it('should include index information', async () => {
      const stats = await collectionManager.getCollectionStats();

      const userStats = stats[COLLECTIONS.USERS];
      expect(userStats.indexes).toBeDefined();
      expect(Array.isArray(userStats.indexes)).toBe(true);
      expect(userStats.indexes.length).toBeGreaterThan(0);

      const emailIndex = userStats.indexes.find((idx: any) => idx.name === 'users_email_unique');
      expect(emailIndex).toBeDefined();
      expect(emailIndex.unique).toBe(true);
    });
  });

  describe('dropAllCollections', () => {
    it('should drop all collections', async () => {
      await collectionManager.initializeCollections();

      let collections = await db.listCollections().toArray();
      expect(collections.length).toBeGreaterThan(0);

      await collectionManager.dropAllCollections();

      collections = await db.listCollections().toArray();
      expect(collections.length).toBe(0);
    });

    it('should handle dropping non-existent collections', async () => {
      // Don't initialize, just drop
      await expect(collectionManager.dropAllCollections()).resolves.not.toThrow();
    });
  });

  describe('ensureCollection', () => {
    it('should create collection if it does not exist', async () => {
      const testCollectionName = 'test_ensure_collection';

      await collectionManager.ensureCollection(testCollectionName);

      const collections = await db.listCollections({ name: testCollectionName }).toArray();
      expect(collections.length).toBe(1);
      expect(collections[0].name).toBe(testCollectionName);
    });

    it('should not throw error if collection already exists', async () => {
      const testCollectionName = 'test_existing_collection';

      await db.createCollection(testCollectionName);

      await expect(collectionManager.ensureCollection(testCollectionName)).resolves.not.toThrow();

      const collections = await db.listCollections({ name: testCollectionName }).toArray();
      expect(collections.length).toBe(1);
    });
  });

  describe('COLLECTIONS constant', () => {
    it('should have all required collection names', () => {
      expect(COLLECTIONS.USERS).toBe('users');
      expect(COLLECTIONS.FINANCIAL_TRANSACTIONS).toBe('financial_transactions');
      expect(COLLECTIONS.FINANCIAL_ACCOUNTS).toBe('financial_accounts');
      expect(COLLECTIONS.MONTHLY_BUDGETS).toBe('monthly_budgets');
      expect(COLLECTIONS.FINANCIAL_GOALS).toBe('financial_goals');
      expect(COLLECTIONS.HEALTH_METRICS).toBe('health_metrics');
      expect(COLLECTIONS.MEALS).toBe('meals');
      expect(COLLECTIONS.WORKOUTS).toBe('workouts');
      expect(COLLECTIONS.HEALTH_GOALS).toBe('health_goals');
      expect(COLLECTIONS.TASKS).toBe('tasks');
      expect(COLLECTIONS.CALENDAR_EVENTS).toBe('calendar_events');
      expect(COLLECTIONS.PROJECTS).toBe('projects');
    });
  });
});

describe('Index functionality tests', () => {
  const testConfig = {
    uri: 'mongodb://localhost:27017',
    database: 'test-collections-indexes'
  };

  let mongoConnection: MongoDBConnection;
  let db: Db;
  let collectionManager: CollectionManager;

  beforeAll(async () => {
    mongoConnection = await initializeMongoDB(testConfig);
    // Connect (will skip if already connected)
    await mongoConnection.connect();
    db = mongoConnection.getDatabase();
    collectionManager = getCollectionManager();
    await collectionManager.initializeCollections();
  });

  afterAll(async () => {
    try {
      // Ensure connection is still valid before cleanup
      if (mongoConnection && mongoConnection.getClient()) {
        const db = mongoConnection.getClient().db(testConfig.database);
        await db.dropDatabase();
        await mongoConnection.disconnect();
      }
    } catch (error) {
      // Ignore cleanup errors
      console.warn('Cleanup error in afterAll:', error);
    }
  });

  it('should enforce unique constraints', async () => {
    const usersCollection = db.collection(COLLECTIONS.USERS);

    await usersCollection.insertOne({
      id: 'unique-user-1',
      profile: { email: 'test@example.com' }
    });

    // Try to insert duplicate email
    await expect(
      usersCollection.insertOne({
        id: 'unique-user-2',
        profile: { email: 'test@example.com' }
      })
    ).rejects.toThrow();
  });

  it('should allow text search on indexed fields', async () => {
    const transactionsCollection = db.collection(COLLECTIONS.FINANCIAL_TRANSACTIONS);

    await transactionsCollection.insertMany([
      { id: 'tx1', description: 'Coffee shop purchase', merchant: { name: 'Starbucks' } },
      { id: 'tx2', description: 'Grocery shopping', merchant: { name: 'Walmart' } },
      { id: 'tx3', description: 'Gas station', merchant: { name: 'Shell' } }
    ]);

    const results = await transactionsCollection
      .find({ $text: { $search: 'coffee' } })
      .toArray();

    expect(results.length).toBe(1);
    expect(results[0].description).toContain('Coffee');
  });

  it('should optimize queries with compound indexes', async () => {
    const tasksCollection = db.collection(COLLECTIONS.TASKS);

    // Insert test data
    await tasksCollection.insertMany([
      { id: 'task1', userId: 'user1', status: 'active', priority: 1, title: 'Task 1' },
      { id: 'task2', userId: 'user1', status: 'active', priority: 2, title: 'Task 2' },
      { id: 'task3', userId: 'user1', status: 'completed', priority: 1, title: 'Task 3' },
      { id: 'task4', userId: 'user2', status: 'active', priority: 1, title: 'Task 4' }
    ]);

    // Query using compound index
    const results = await tasksCollection
      .find({ userId: 'user1', status: 'active' })
      .sort({ priority: -1 })
      .toArray();

    expect(results.length).toBe(2);
    expect(results[0].priority).toBe(2); // Higher priority first
    expect(results[1].priority).toBe(1);
  });

  it('should handle sparse indexes correctly', async () => {
    const accountsCollection = db.collection(COLLECTIONS.FINANCIAL_ACCOUNTS);

    // Insert documents with and without plaidAccountId
    await accountsCollection.insertMany([
      { id: 'acc1', userId: 'user1', type: 'checking', plaidAccountId: 'plaid-123' },
      { id: 'acc2', userId: 'user1', type: 'savings' } // No plaidAccountId
    ]);

    // Both should be inserted successfully
    const count = await accountsCollection.countDocuments({});
    expect(count).toBe(2);

    // Duplicate plaidAccountId should fail
    await expect(
      accountsCollection.insertOne({
        id: 'acc3',
        userId: 'user1',
        type: 'checking',
        plaidAccountId: 'plaid-123'
      })
    ).rejects.toThrow();
  });
});

describe('getCollectionManager singleton', () => {
  it('should return the same instance', () => {
    const manager1 = getCollectionManager();
    const manager2 = getCollectionManager();

    expect(manager1).toBe(manager2);
  });
});
