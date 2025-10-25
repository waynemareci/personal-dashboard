import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { createAuthMiddleware, requirePermission } from '../middleware/auth';
import { getDualDatabaseCoordinator } from '../database/dual-db-coordinator';
import { HealthMetricSchema, WorkoutSchema, MealSchema } from '../models/health';
import { logger } from '../utils/logger';

const healthDataRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const coordinator = getDualDatabaseCoordinator();
  const authMiddleware = createAuthMiddleware();

  // Add authentication to all routes
  fastify.addHook('preHandler', authMiddleware);

  // Health Metrics
  fastify.get('/metrics', {
    schema: {
      tags: ['health-data'],
      description: 'Get user health metrics',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 50 },
          offset: { type: 'number', default: 0 },
          metricType: { 
            type: 'string',
            enum: ['weight', 'body_fat', 'muscle_mass', 'blood_pressure', 'heart_rate', 'sleep', 'steps', 'calories']
          },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            metrics: { type: 'array' },
            total: { type: 'number' },
            hasMore: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { limit = 50, offset = 0, metricType, startDate, endDate } = request.query as any;

      // TODO: Implement actual database query
      const metrics = [];
      const total = 0;

      return {
        metrics,
        total,
        hasMore: offset + limit < total
      };
    } catch (error) {
      logger.error('Error fetching health metrics:', error);
      return reply.status(500).send({ error: 'Failed to fetch health metrics' });
    }
  });

  fastify.post('/metrics', {
    schema: {
      tags: ['health-data'],
      description: 'Record a new health metric',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          type: { 
            type: 'string', 
            enum: ['weight', 'body_fat', 'muscle_mass', 'blood_pressure', 'heart_rate', 'sleep', 'steps', 'calories']
          },
          value: { type: 'number' },
          unit: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          notes: { type: 'string' },
          source: { type: 'string' },
          metadata: { type: 'object' }
        },
        required: ['type', 'value', 'unit', 'date']
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            success: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const metricData = request.body as any;

      metricData.userId = user.id;

      const result = await coordinator.createEntity(
        'health_metrics',
        metricData,
        ['HealthMetric', 'Health'],
        {
          domain: 'health',
          type: 'metric',
          metricType: metricData.type,
          ...metricData
        },
        [
          {
            type: 'MEASURED_BY',
            targetNodeId: user.id,
            targetLabels: ['User'],
            direction: 'incoming'
          }
        ]
      );

      if (result.success && result.entityId) {
        // Broadcast sync event
        const syncManager = (fastify as any).syncManager;
        if (syncManager) {
          syncManager.broadcastSyncEvent({
            type: 'data_change',
            domain: 'health',
            action: 'create',
            entityId: result.entityId,
            entityType: 'health_metric',
            data: { ...metricData, id: result.entityId },
            timestamp: new Date().toISOString(),
            userId: user.id,
            source: 'api'
          });
        }

        reply.status(201).send({
          id: result.entityId,
          success: true
        });
      } else {
        reply.status(500).send({
          error: 'Failed to record health metric',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error recording health metric:', error);
      return reply.status(500).send({ error: 'Failed to record health metric' });
    }
  });

  // Workouts
  fastify.get('/workouts', {
    schema: {
      tags: ['health-data'],
      description: 'Get user workouts',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 50 },
          offset: { type: 'number', default: 0 },
          workoutType: { type: 'string' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            workouts: { type: 'array' },
            total: { type: 'number' },
            hasMore: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      
      // TODO: Implement actual database query
      const workouts = [];
      const total = 0;

      return { workouts, total, hasMore: false };
    } catch (error) {
      logger.error('Error fetching workouts:', error);
      return reply.status(500).send({ error: 'Failed to fetch workouts' });
    }
  });

  fastify.post('/workouts', {
    schema: {
      tags: ['health-data'],
      description: 'Record a new workout',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          name: { type: 'string' },
          duration: { type: 'number' },
          date: { type: 'string', format: 'date-time' },
          caloriesBurned: { type: 'number' },
          intensity: { type: 'string', enum: ['low', 'medium', 'high'] },
          notes: { type: 'string' },
          exercises: { 
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                sets: { type: 'number' },
                reps: { type: 'number' },
                weight: { type: 'number' },
                duration: { type: 'number' }
              }
            }
          }
        },
        required: ['type', 'name', 'duration', 'date']
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            success: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const workoutData = request.body as any;

      workoutData.userId = user.id;

      const result = await coordinator.createEntity(
        'workouts',
        workoutData,
        ['Workout', 'Health'],
        {
          domain: 'health',
          type: 'workout',
          ...workoutData
        },
        [
          {
            type: 'PERFORMED_BY',
            targetNodeId: user.id,
            targetLabels: ['User'],
            direction: 'incoming'
          }
        ]
      );

      if (result.success && result.entityId) {
        // Broadcast sync event
        const syncManager = (fastify as any).syncManager;
        if (syncManager) {
          syncManager.broadcastSyncEvent({
            type: 'data_change',
            domain: 'health',
            action: 'create',
            entityId: result.entityId,
            entityType: 'workout',
            data: { ...workoutData, id: result.entityId },
            timestamp: new Date().toISOString(),
            userId: user.id,
            source: 'api'
          });
        }

        reply.status(201).send({
          id: result.entityId,
          success: true
        });
      } else {
        reply.status(500).send({
          error: 'Failed to record workout',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error recording workout:', error);
      return reply.status(500).send({ error: 'Failed to record workout' });
    }
  });

  // Meals
  fastify.get('/meals', {
    schema: {
      tags: ['health-data'],
      description: 'Get user meals',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 50 },
          offset: { type: 'number', default: 0 },
          mealType: { 
            type: 'string',
            enum: ['breakfast', 'lunch', 'dinner', 'snack']
          },
          date: { type: 'string', format: 'date' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            meals: { type: 'array' },
            total: { type: 'number' },
            hasMore: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      
      // TODO: Implement actual database query
      const meals = [];
      const total = 0;

      return { meals, total, hasMore: false };
    } catch (error) {
      logger.error('Error fetching meals:', error);
      return reply.status(500).send({ error: 'Failed to fetch meals' });
    }
  });

  fastify.post('/meals', {
    schema: {
      tags: ['health-data'],
      description: 'Record a new meal',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
          name: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          calories: { type: 'number' },
          nutrition: {
            type: 'object',
            properties: {
              protein: { type: 'number' },
              carbs: { type: 'number' },
              fat: { type: 'number' },
              fiber: { type: 'number' },
              sugar: { type: 'number' }
            }
          },
          foods: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                quantity: { type: 'number' },
                unit: { type: 'string' }
              }
            }
          },
          notes: { type: 'string' }
        },
        required: ['type', 'name', 'date']
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            success: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const mealData = request.body as any;

      mealData.userId = user.id;

      const result = await coordinator.createEntity(
        'meals',
        mealData,
        ['Meal', 'Health'],
        {
          domain: 'health',
          type: 'meal',
          ...mealData
        },
        [
          {
            type: 'CONSUMED_BY',
            targetNodeId: user.id,
            targetLabels: ['User'],
            direction: 'incoming'
          }
        ]
      );

      if (result.success && result.entityId) {
        // Broadcast sync event
        const syncManager = (fastify as any).syncManager;
        if (syncManager) {
          syncManager.broadcastSyncEvent({
            type: 'data_change',
            domain: 'health',
            action: 'create',
            entityId: result.entityId,
            entityType: 'meal',
            data: { ...mealData, id: result.entityId },
            timestamp: new Date().toISOString(),
            userId: user.id,
            source: 'api'
          });
        }

        reply.status(201).send({
          id: result.entityId,
          success: true
        });
      } else {
        reply.status(500).send({
          error: 'Failed to record meal',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error recording meal:', error);
      return reply.status(500).send({ error: 'Failed to record meal' });
    }
  });
};

export default healthDataRoutes;