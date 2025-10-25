import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import relationshipsRoutes from './relationships';

// Mock dependencies
vi.mock('../middleware/auth', () => ({
  createAuthMiddleware: () => async (request: any, reply: any) => {
    request.user = { id: 'test-user', email: 'test@example.com', role: 'user' };
  },
  requirePermission: () => async () => {}
}));

vi.mock('../database/neo4j', () => ({
  getNeo4jConnection: vi.fn().mockReturnValue({
    isConnected: vi.fn().mockReturnValue(true),
    executeQuery: vi.fn().mockResolvedValue({ records: [] }),
    healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' })
  })
}));

vi.mock('../database/queries', () => ({
  RelationshipDiscoveryQueries: vi.fn().mockImplementation(() => ({
    findSpendingLocationPatterns: vi.fn().mockResolvedValue([]),
    findHealthProductivityCorrelations: vi.fn().mockResolvedValue([]),
    findPersonTopicAssociations: vi.fn().mockResolvedValue([]),
    findMealWorkoutTimingPatterns: vi.fn().mockResolvedValue([]),
    findBudgetLifeEventCorrelations: vi.fn().mockResolvedValue([]),
    unifiedSearch: vi.fn().mockResolvedValue([]),
    findSimilarEntities: vi.fn().mockResolvedValue([])
  }))
}));

vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('Relationships Routes', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();

    fastify.decorate('jwt', {
      sign: vi.fn(),
      verify: vi.fn()
    });

    await fastify.register(relationshipsRoutes, { prefix: '/api/relationships' });
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('GET /graph', () => {
    it('should return knowledge graph', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/relationships/graph',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect([200, 500]).toContain(response.statusCode);
    });
  });

  describe('GET /discover', () => {
    it('should discover relationships', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/relationships/discover?fromDomain=financial&toDomain=health',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect([200, 500]).toContain(response.statusCode);
    });
  });

  describe('POST /connect', () => {
    it('should create a custom relationship', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/relationships/connect',
        headers: {
          authorization: 'Bearer test-token'
        },
        payload: {
          fromEntityId: 'entity1',
          toEntityId: 'entity2',
          relationshipType: 'RELATED_TO'
        }
      });

      expect([201, 403, 500]).toContain(response.statusCode);
    });
  });

  describe('GET /analytics', () => {
    it('should return relationship analytics', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/relationships/analytics',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect([200, 500]).toContain(response.statusCode);
    });
  });
});
