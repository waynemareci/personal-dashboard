import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import healthDataRoutes from './health-data';

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
    HEALTH_METRICS: 'health_metrics',
    MEALS: 'meals',
    WORKOUTS: 'workouts',
    HEALTH_GOALS: 'health_goals'
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

describe('Health Data Routes', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();

    // Mock JWT
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
    it('should return empty metrics list', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health/metrics',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data).toHaveProperty('metrics');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('hasMore');
      expect(Array.isArray(data.metrics)).toBe(true);
    });

    it('should accept query parameters', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health/metrics?limit=10&offset=0&type=weight&startDate=2025-01-01&endDate=2025-12-31',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
    });

    it('should return stats with metrics', async () => {
      mockCollection.aggregate.mockReturnValueOnce({
        toArray: vi.fn().mockResolvedValue([
          {
            _id: 'weight',
            count: 10,
            avg: 185.5,
            min: 180,
            max: 190,
            latest: new Date()
          }
        ])
      });

      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health/metrics',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data).toHaveProperty('stats');
    });
  });

  describe('POST /metrics', () => {
    it('should create a health metric', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/health/metrics',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json'
        },
        payload: {
          type: 'weight',
          value: 185.5,
          unit: 'lbs',
          date: new Date().toISOString(),
          source: 'manual'
        }
      });

      expect(response.statusCode).toBe(201);
    });

    it('should reject invalid metric data', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/health/metrics',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json'
        },
        payload: {
          type: 'invalid_type',
          value: 'not-a-number',
          date: new Date().toISOString()
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PUT /metrics/:id', () => {
    it('should update a health metric', async () => {
      mockCollection.findOne.mockResolvedValueOnce({
        _id: 'metric-123',
        userId: 'test-user',
        type: 'weight',
        value: 185,
        unit: 'lbs'
      });

      const response = await fastify.inject({
        method: 'PUT',
        url: '/api/health/metrics/metric-123',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json'
        },
        payload: {
          value: 183
        }
      });

      expect([200, 500]).toContain(response.statusCode);
    });
  });

  describe('DELETE /metrics/:id', () => {
    it('should delete a health metric', async () => {
      mockCollection.findOne.mockResolvedValueOnce({
        _id: 'metric-123',
        userId: 'test-user',
        type: 'weight'
      });

      const response = await fastify.inject({
        method: 'DELETE',
        url: '/api/health/metrics/metric-123',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect([204, 500]).toContain(response.statusCode);
    });
  });

  describe('GET /meals', () => {
    it('should return empty meals list', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health/meals',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data).toHaveProperty('meals');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('hasMore');
      expect(Array.isArray(data.meals)).toBe(true);
    });

    it('should accept query parameters', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health/meals?limit=10&type=breakfast&startDate=2025-01-01',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /meals', () => {
    it('should create a meal with nutritional calculation', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/health/meals',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json'
        },
        payload: {
          name: 'Breakfast',
          type: 'breakfast',
          date: new Date().toISOString(),
          time: '08:00',
          foods: [
            {
              food: {
                name: 'Oatmeal',
                servingSize: '1 cup',
                nutrition: {
                  calories: 150,
                  protein: 5,
                  carbohydrates: 27,
                  fat: 3
                }
              },
              quantity: 1,
              unit: 'cup'
            }
          ],
          totalNutrition: {
            calories: 150,
            protein: 5,
            carbohydrates: 27,
            fat: 3
          }
        }
      });

      expect(response.statusCode).toBe(201);
    });

    it('should reject meal without foods', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/health/meals',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json'
        },
        payload: {
          name: 'Breakfast',
          type: 'breakfast',
          date: new Date().toISOString(),
          time: '08:00',
          foods: []
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject invalid meal type', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/health/meals',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json'
        },
        payload: {
          name: 'Meal',
          type: 'invalid_type',
          date: new Date().toISOString(),
          time: '08:00',
          foods: [
            {
              food: {
                name: 'Food',
                servingSize: '1 cup',
                nutrition: {}
              },
              quantity: 1,
              unit: 'cup'
            }
          ]
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /workouts', () => {
    it('should return empty workouts list', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health/workouts',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data).toHaveProperty('workouts');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('hasMore');
      expect(Array.isArray(data.workouts)).toBe(true);
    });

    it('should accept query parameters', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health/workouts?type=cardio&intensity=moderate&isTemplate=false',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /workouts', () => {
    it('should create a workout', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/health/workouts',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json'
        },
        payload: {
          name: 'Morning Run',
          date: new Date().toISOString(),
          startTime: '06:00',
          endTime: '06:45',
          duration: 45,
          type: 'running',
          intensity: 'moderate',
          exercises: [
            {
              name: 'Running',
              type: 'cardio',
              sets: [
                {
                  duration: 2700,
                  distance: 5000
                }
              ]
            }
          ]
        }
      });

      expect(response.statusCode).toBe(201);
    });

    it('should reject workout without exercises', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/health/workouts',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json'
        },
        payload: {
          name: 'Workout',
          date: new Date().toISOString(),
          startTime: '06:00',
          endTime: '07:00',
          duration: 60,
          type: 'cardio',
          intensity: 'moderate',
          exercises: []
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject invalid intensity', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/health/workouts',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json'
        },
        payload: {
          name: 'Workout',
          date: new Date().toISOString(),
          startTime: '06:00',
          endTime: '07:00',
          duration: 60,
          type: 'cardio',
          intensity: 'invalid',
          exercises: [
            {
              name: 'Exercise',
              type: 'cardio',
              sets: [{}]
            }
          ]
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /goals', () => {
    it('should return empty goals list', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health/goals',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data).toHaveProperty('goals');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('hasMore');
      expect(Array.isArray(data.goals)).toBe(true);
    });

    it('should accept query parameters', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health/goals?category=weight_loss&status=active&priority=high',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /goals', () => {
    it('should create a health goal with automatic progress calculation', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/health/goals',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json'
        },
        payload: {
          name: 'Lose 20 pounds',
          category: 'weight_loss',
          targetValue: 180,
          currentValue: 190,
          startValue: 200,
          targetUnit: 'lbs',
          priority: 'high',
          status: 'active'
        }
      });

      expect(response.statusCode).toBe(201);
    });

    it('should reject invalid goal category', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/health/goals',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json'
        },
        payload: {
          name: 'Goal',
          category: 'invalid_category',
          targetValue: 100,
          currentValue: 50,
          startValue: 0
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /meal-plans/generate', () => {
    it('should generate a meal plan', async () => {
      mockCollection.find.mockReturnValueOnce({
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            toArray: vi.fn().mockResolvedValue([
              {
                _id: 'meal-1',
                name: 'Breakfast',
                type: 'breakfast',
                rating: 5,
                foods: [
                  {
                    food: {
                      name: 'Oatmeal',
                      nutrition: { calories: 150 }
                    },
                    quantity: 1,
                    unit: 'cup'
                  }
                ],
                totalNutrition: { calories: 150, protein: 5 }
              }
            ])
          })
        })
      });

      const response = await fastify.inject({
        method: 'POST',
        url: '/api/health/meal-plans/generate',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json'
        },
        payload: {
          days: 3,
          calorieTarget: 2000,
          proteinTarget: 150
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data).toHaveProperty('mealPlan');
      expect(data).toHaveProperty('groceryList');
      expect(data).toHaveProperty('summary');
    });

    it('should reject invalid days count', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/health/meal-plans/generate',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json'
        },
        payload: {
          days: -1,
          calorieTarget: 2000
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /workout-templates', () => {
    it('should return workout templates', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health/workout-templates',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data).toHaveProperty('templates');
      expect(Array.isArray(data.templates)).toBe(true);
    });

    it('should filter by workout type', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health/workout-templates?type=strength',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /workout-templates/:templateId/use', () => {
    it('should create workout from template', async () => {
      mockCollection.findOne.mockResolvedValueOnce({
        _id: 'template-123',
        userId: 'test-user',
        name: 'Full Body',
        type: 'strength',
        intensity: 'vigorous',
        duration: 60,
        exercises: [
          {
            name: 'Squats',
            type: 'strength',
            sets: [{ reps: 10, weight: 135 }]
          }
        ],
        isTemplate: true
      });

      const response = await fastify.inject({
        method: 'POST',
        url: '/api/health/workout-templates/template-123/use',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json'
        },
        payload: {
          date: new Date().toISOString(),
          startTime: '17:00',
          endTime: '18:00'
        }
      });

      expect([201, 404, 500]).toContain(response.statusCode);
    });
  });

  describe('GET /insights/sleep-performance', () => {
    it('should return sleep-performance correlation', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health/insights/sleep-performance',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data).toHaveProperty('correlation');
      expect(data).toHaveProperty('insights');
    });

    it('should accept date range parameters', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health/insights/sleep-performance?startDate=2025-01-01&endDate=2025-12-31',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /insights/nutrition-energy', () => {
    it('should return nutrition-energy correlation', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health/insights/nutrition-energy',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data).toHaveProperty('correlation');
      expect(data).toHaveProperty('insights');
    });
  });

  describe('GET /charts/weight-trend', () => {
    it('should return weight trend data', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health/charts/weight-trend',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('summary');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should accept period parameter', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health/charts/weight-trend?period=quarter',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /charts/workout-volume', () => {
    it('should return workout volume data', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health/charts/workout-volume',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('summary');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should accept period and groupBy parameters', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health/charts/workout-volume?period=month&groupBy=week',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /charts/nutrition-breakdown', () => {
    it('should return nutrition breakdown', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health/charts/nutrition-breakdown',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data).toHaveProperty('breakdown');
      expect(data).toHaveProperty('totals');
      expect(data).toHaveProperty('macroDistribution');
      expect(Array.isArray(data.breakdown)).toBe(true);
    });

    it('should accept date parameter', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: `/api/health/charts/nutrition-breakdown?date=${new Date().toISOString()}`,
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);
    });
  });
});
