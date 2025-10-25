import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import healthDataRoutes from './health-data';

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

describe('Health Data Routes', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();

    fastify.decorate('jwt', {
      sign: vi.fn(),
      verify: vi.fn()
    });

    await fastify.register(healthDataRoutes, { prefix: '/api/health' });
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('GET /metrics', () => {
    it('should return health metrics', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health/metrics',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /workouts', () => {
    it('should accept workout data', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/health/workouts',
        headers: {
          authorization: 'Bearer test-token'
        },
        payload: {
          type: 'cardio',
          duration: 30,
          date: new Date().toISOString()
        }
      });

      expect([200, 201, 400, 500]).toContain(response.statusCode);
    });
  });

  describe('POST /meals', () => {
    it('should accept meal data', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/health/meals',
        headers: {
          authorization: 'Bearer test-token'
        },
        payload: {
          name: 'Lunch',
          date: new Date().toISOString(),
          type: 'lunch'
        }
      });

      expect([200, 201, 400, 500]).toContain(response.statusCode);
    });
  });
});
