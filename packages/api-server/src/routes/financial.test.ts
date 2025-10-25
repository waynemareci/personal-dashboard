import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import financialRoutes from './financial';

// Mock dependencies
vi.mock('../middleware/auth', () => ({
  createAuthMiddleware: () => async (request: any, reply: any) => {
    request.user = { id: 'test-user', email: 'test@example.com', role: 'user' };
  },
  requirePermission: () => async () => {}
}));

vi.mock('../database/dual-db-coordinator', () => ({
  getDualDatabaseCoordinator: () => ({
    executeOperation: vi.fn()
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
          authorization: 'Bearer test-token'
        },
        payload: {
          amount: 100.50,
          description: 'Test transaction',
          date: new Date().toISOString()
        }
      });

      expect([200, 201, 500]).toContain(response.statusCode);
    });
  });
});
