import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import financialRoutes from './financial';

// Mock database connections
const mockCollection = {
  find: vi.fn().mockReturnValue({
    sort: vi.fn().mockReturnValue({
      skip: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([])
        })
      })
    })
  }),
  countDocuments: vi.fn().mockResolvedValue(0),
  aggregate: vi.fn().mockReturnValue({
    toArray: vi.fn().mockResolvedValue([])
  }),
  insertOne: vi.fn().mockResolvedValue({ insertedId: 'test-id' }),
  findOne: vi.fn().mockResolvedValue(null),
  updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 })
};

const mockDb = {
  collection: vi.fn().mockReturnValue(mockCollection)
};

vi.mock('../database/mongodb', () => ({
  getMongoDBConnection: () => ({
    getDatabase: () => mockDb,
    isConnected: () => true
  })
}));

vi.mock('../database/neo4j', () => ({
  getNeo4jConnection: () => ({
    executeQuery: vi.fn().mockResolvedValue({ records: [] }),
    isConnected: () => true
  })
}));

vi.mock('../database/collections', () => ({
  COLLECTIONS: {
    FINANCIAL_TRANSACTIONS: 'financial_transactions',
    FINANCIAL_ACCOUNTS: 'financial_accounts',
    MONTHLY_BUDGETS: 'monthly_budgets',
    FINANCIAL_GOALS: 'financial_goals',
    CATEGORIES: 'categories'
  }
}));

// Mock dependencies
vi.mock('../middleware/auth', () => ({
  createAuthMiddleware: () => async (request: any, reply: any) => {
    request.user = { id: 'test-user', email: 'test@example.com', role: 'user' };
  },
  requirePermission: () => async () => {}
}));

vi.mock('../database/dual-db-coordinator', () => ({
  getDualDatabaseCoordinator: () => ({
    executeOperation: vi.fn(),
    createEntity: vi.fn().mockResolvedValue({ success: true, entityId: 'test-id' }),
    updateEntity: vi.fn().mockResolvedValue({ success: true }),
    deleteEntity: vi.fn().mockResolvedValue({ success: true })
  })
}));

vi.mock('../services/sync-manager', () => ({
  getSyncManager: () => ({
    syncEntity: vi.fn().mockResolvedValue(undefined)
  })
}));

vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('Financial Routes', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();

    // Mock JWT
    fastify.decorate('jwt', {
      sign: vi.fn(),
      verify: vi.fn()
    });

    await fastify.register(financialRoutes, { prefix: '/api/financial' });
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('GET /transactions', () => {
    it('should return empty transactions list', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/financial/transactions',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data).toHaveProperty('transactions');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('hasMore');
      expect(Array.isArray(data.transactions)).toBe(true);
    });

    it('should accept query parameters', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/financial/transactions?limit=10&offset=0&accountId=acc1',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /transactions', () => {
    it('should accept valid transaction data', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/financial/transactions',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json'
        },
        payload: {
          accountId: 'acc-123',
          type: 'expense',
          amount: 100.50,
          description: 'Test transaction',
          date: new Date().toISOString()
        }
      });

      // Should return 201 for successful creation
      expect(response.statusCode).toBe(201);
    });
  });
});
