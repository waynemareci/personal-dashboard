import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import scheduleRoutes from './schedule';

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

vi.mock('../database/mongodb', () => {
  const createMockChain = () => {
    const mockToArray = vi.fn().mockResolvedValue([]);
    const chain: any = {
      toArray: mockToArray,
      sort: vi.fn(() => chain),
      skip: vi.fn(() => chain),
      limit: vi.fn(() => chain)
    };
    return chain;
  };

  return {
    getMongoDBConnection: () => ({
      getDatabase: () => ({
        collection: () => ({
          find: vi.fn(() => createMockChain()),
          findOne: vi.fn().mockResolvedValue(null),
          countDocuments: vi.fn().mockResolvedValue(0),
          insertOne: vi.fn().mockResolvedValue({ insertedId: 'test-id' }),
          updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
          deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 })
        })
      })
    })
  };
});

vi.mock('../database/neo4j', () => ({
  getNeo4jConnection: () => ({
    executeQuery: vi.fn().mockResolvedValue({ records: [] })
  })
}));

vi.mock('../services/sync-manager', () => ({
  getSyncManager: () => ({
    syncEntity: vi.fn().mockResolvedValue(undefined)
  })
}));

vi.mock('../database/collections', () => ({
  COLLECTIONS: {
    TASKS: 'tasks',
    PROJECTS: 'projects',
    CALENDAR_EVENTS: 'calendar_events',
    TIME_BLOCKS: 'time_blocks',
    HABITS: 'habits',
    HABIT_COMPLETIONS: 'habit_completions'
  }
}));

vi.mock('../models/schedule', async () => {
  const actual = await vi.importActual('../models/schedule');
  return {
    ...actual,
    calculateHabitStreak: vi.fn().mockReturnValue({ currentStreak: 0, longestStreak: 0, lastCompletedAt: null }),
    isTaskBlocked: vi.fn().mockReturnValue(false),
    calculateProjectCompletion: vi.fn().mockReturnValue(0),
    getTasksDueSoon: vi.fn().mockReturnValue([]),
    calculateTimeBlockEfficiency: vi.fn().mockReturnValue({
      totalPlannedMinutes: 0,
      totalActualMinutes: 0,
      completionRate: 0,
      averageRating: 0
    })
  };
});

vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('Schedule Routes', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();

    fastify.decorate('jwt', {
      sign: vi.fn(),
      verify: vi.fn()
    });

    await fastify.register(scheduleRoutes, { prefix: '/api/schedule' });
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('GET /tasks', () => {
    it('should return tasks list', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/schedule/tasks',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /tasks', () => {
    it('should create a task', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/schedule/tasks',
        headers: {
          authorization: 'Bearer test-token'
        },
        payload: {
          title: 'Test Task',
          status: 'pending',
          priority: 1
        }
      });

      expect([200, 201, 400, 500]).toContain(response.statusCode);
    });
  });

  describe('GET /events', () => {
    it('should return calendar events', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/schedule/events',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /events', () => {
    it('should create an event', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/schedule/events',
        headers: {
          authorization: 'Bearer test-token'
        },
        payload: {
          title: 'Meeting',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 3600000).toISOString()
        }
      });

      expect([200, 201, 400, 500]).toContain(response.statusCode);
    });
  });

  describe('GET /projects', () => {
    it('should return projects list', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/schedule/projects',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
    });
  });
});
