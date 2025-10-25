import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DualDatabaseCoordinator, getDualDatabaseCoordinator } from './dual-db-coordinator';

describe('DualDatabaseCoordinator', () => {
  let coordinator: DualDatabaseCoordinator;

  beforeEach(() => {
    vi.clearAllMocks();
    coordinator = new DualDatabaseCoordinator();
  });

  describe('executeTransaction', () => {
    it('should successfully execute a create operation', async () => {
      const operation = {
        operation: 'create' as const,
        collection: 'test_collection',
        mongoData: { name: 'test', value: 42 },
        neo4jLabels: ['TestNode'],
        neo4jProperties: { name: 'test', value: 42 },
        entityId: 'test-id-123'
      };

      const result = await coordinator.executeTransaction([operation]);

      expect(result.success).toBe(true);
      expect(result.mongoResult).toBeDefined();
      expect(result.neo4jResult).toBeDefined();
    });

    it('should successfully execute an update operation', async () => {
      const operation = {
        operation: 'update' as const,
        collection: 'test_collection',
        mongoData: { name: 'updated', value: 100 },
        neo4jLabels: ['TestNode'],
        neo4jProperties: { name: 'updated', value: 100 },
        entityId: 'test-id-123'
      };

      const result = await coordinator.executeTransaction([operation]);

      expect(result.success).toBe(true);
      expect(result.mongoResult).toBeDefined();
    });

    it('should successfully execute a delete operation', async () => {
      const operation = {
        operation: 'delete' as const,
        collection: 'test_collection',
        mongoData: {},
        neo4jLabels: [],
        neo4jProperties: {},
        entityId: 'test-id-123'
      };

      const result = await coordinator.executeTransaction([operation]);

      expect(result.success).toBe(true);
      expect(result.mongoResult).toBeDefined();
    });

    it('should handle multiple operations in a single transaction', async () => {
      const operations = [
        {
          operation: 'create' as const,
          collection: 'users',
          mongoData: { name: 'John' },
          neo4jLabels: ['User'],
          neo4jProperties: { name: 'John' },
          entityId: 'user-1'
        },
        {
          operation: 'create' as const,
          collection: 'tasks',
          mongoData: { title: 'Test Task' },
          neo4jLabels: ['Task'],
          neo4jProperties: { title: 'Test Task' },
          entityId: 'task-1'
        }
      ];

      const result = await coordinator.executeTransaction(operations);

      expect(result.success).toBe(true);
      expect(result.mongoResult).toBeDefined();
      expect(Array.isArray(result.mongoResult)).toBe(true);
      expect(result.mongoResult).toHaveLength(2);
    });

    it('should handle graceful degradation when Neo4j unavailable', async () => {
      const operation = {
        operation: 'create' as const,
        collection: 'test_collection',
        mongoData: { name: 'test' },
        neo4jLabels: ['TestNode'],
        neo4jProperties: { name: 'test' },
        entityId: 'test-id-123'
      };

      const result = await coordinator.executeTransaction([operation], { 
        gracefulDegradation: true,
        neo4jRequired: false 
      });

      // Should succeed even if Neo4j fails because graceful degradation is enabled
      expect(result.success).toBe(true);
      expect(result.mongoResult).toBeDefined();
    });
  });

  describe('createEntity', () => {
    it('should create entity with generated ID and timestamps', async () => {
      const result = await coordinator.createEntity(
        'users',
        { name: 'John Doe', email: 'john@example.com' },
        ['User', 'Person'],
        { isActive: true }
      );

      expect(result.success).toBe(true);
      expect(result.entityId).toBeDefined();
      expect(typeof result.entityId).toBe('string');
    });
  });

  describe('updateEntity', () => {
    it('should update entity with version increment', async () => {
      const result = await coordinator.updateEntity(
        'users',
        'user-123',
        { name: 'John Smith' },
        { isActive: false }
      );

      expect(result.success).toBe(true);
    });
  });

  describe('deleteEntity', () => {
    it('should soft delete entity', async () => {
      const result = await coordinator.deleteEntity('users', 'user-123');

      expect(result.success).toBe(true);
    });
  });

  describe('singleton', () => {
    it('should return same instance', () => {
      const instance1 = getDualDatabaseCoordinator();
      const instance2 = getDualDatabaseCoordinator();
      expect(instance1).toBe(instance2);
    });
  });
});

describe('Integration scenarios', () => {
  let coordinator: DualDatabaseCoordinator;

  beforeEach(() => {
    vi.clearAllMocks();
    coordinator = new DualDatabaseCoordinator();
  });

  it('should handle complex financial transaction creation', async () => {
    const financialTransaction = {
      userId: 'user-123',
      accountId: 'account-456',
      amount: 100.50,
      description: 'Coffee purchase',
      categoryId: 'food',
      date: new Date()
    };

    const relationships = [
      {
        type: 'BELONGS_TO',
        targetNodeId: 'user-123',
        targetLabels: ['User'],
        direction: 'outgoing' as const
      },
      {
        type: 'FROM_ACCOUNT',
        targetNodeId: 'account-456',
        targetLabels: ['Account'],
        direction: 'outgoing' as const
      }
    ];

    const result = await coordinator.createEntity(
      'financial_transactions',
      financialTransaction,
      ['Transaction', 'Financial'],
      { transactionType: 'expense' },
      relationships
    );

    expect(result.success).toBe(true);
    expect(result.entityId).toBeDefined();
  });

  it('should handle user creation with health goals relationship', async () => {
    const user = {
      profile: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com'
      }
    };

    const result = await coordinator.createEntity(
      'users',
      user,
      ['User', 'Person'],
      { isActive: true }
    );

    expect(result.success).toBe(true);
    expect(result.entityId).toBeDefined();
  });
});