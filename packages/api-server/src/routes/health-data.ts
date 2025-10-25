import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ZodError } from 'zod';
import { createAuthMiddleware, requirePermission } from '../middleware/auth';
import { getDualDatabaseCoordinator } from '../database/dual-db-coordinator';
import { getMongoDBConnection } from '../database/mongodb';
import { getNeo4jConnection } from '../database/neo4j';
import { COLLECTIONS } from '../database/collections';
import { getSyncManager } from '../services/sync-manager';
import {
  CreateHealthMetricSchema,
  CreateMealSchema,
  CreateWorkoutSchema,
  CreateHealthGoalSchema
} from '../models/health';
import { logger } from '../utils/logger';

const healthDataRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const coordinator = getDualDatabaseCoordinator();
  const authMiddleware = createAuthMiddleware();

  // Add authentication to all routes
  fastify.addHook('preHandler', authMiddleware);

  // ===================================
  // HEALTH METRICS
  // ===================================

  // GET /api/health/metrics - List health metrics with filtering
  fastify.get('/metrics', {
    schema: {
      tags: ['health-data'],
      description: 'Get user health metrics with filtering',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 50, minimum: 1, maximum: 100 },
          offset: { type: 'number', default: 0, minimum: 0 },
          type: { type: 'string' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          source: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { limit = 50, offset = 0, type, startDate, endDate, source } = request.query as any;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.HEALTH_METRICS);

      // Build filters
      const filters: any = { userId: user.id, isDeleted: false };
      if (type) filters.type = type;
      if (source) filters.source = source;

      if (startDate || endDate) {
        filters.date = {};
        if (startDate) filters.date.$gte = new Date(startDate);
        if (endDate) filters.date.$lte = new Date(endDate);
      }

      // Get metrics with pagination
      const metrics = await collection
        .find(filters)
        .sort({ date: -1, createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      const total = await collection.countDocuments(filters);

      // Calculate summary stats
      const stats = await collection.aggregate([
        { $match: filters },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            avg: { $avg: '$value' },
            min: { $min: '$value' },
            max: { $max: '$value' },
            latest: { $max: '$date' }
          }
        }
      ]).toArray();

      return {
        metrics,
        total,
        hasMore: offset + limit < total,
        stats
      };
    } catch (error) {
      logger.error('Error fetching health metrics:', error);
      return reply.status(500).send({ error: 'Failed to fetch health metrics' });
    }
  });

  // POST /api/health/metrics - Create health metric
  fastify.post('/metrics', {
    schema: {
      tags: ['health-data'],
      description: 'Record a new health metric',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const metricData = CreateHealthMetricSchema.parse(request.body);

      const fullData = {
        ...metricData,
        userId: user.id,
        date: new Date(metricData.date)
      };

      const result = await coordinator.createEntity(
        COLLECTIONS.HEALTH_METRICS,
        fullData,
        ['HealthMetric', 'Health'],
        {
          domain: 'health',
          type: 'metric',
          metricType: metricData.type,
          value: metricData.value,
          unit: metricData.unit
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
        const syncManager = getSyncManager();
        await syncManager.syncEntity(result.entityId, 'health', 'metric', 'create');

        return reply.status(201).send({
          id: result.entityId,
          success: true
        });
      } else {
        return reply.status(500).send({
          error: 'Failed to record health metric',
          details: result.error?.message
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          error: 'Validation error',
          details: error.errors
        });
      }
      logger.error('Error recording health metric:', error);
      return reply.status(500).send({ error: 'Failed to record health metric' });
    }
  });

  // PUT /api/health/metrics/:id - Update health metric
  fastify.put('/metrics/:id', {
    preHandler: [requirePermission('health:write')],
    schema: {
      tags: ['health-data'],
      description: 'Update a health metric',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { id } = request.params as any;
      const updateData = request.body as any;

      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }

      const result = await coordinator.updateEntity(
        COLLECTIONS.HEALTH_METRICS,
        id,
        updateData,
        {
          domain: 'health',
          type: 'metric',
          metricType: updateData.type
        }
      );

      if (result.success) {
        const syncManager = getSyncManager();
        await syncManager.syncEntity(id, 'health', 'metric', 'update');
        return { success: true };
      } else {
        return reply.status(500).send({
          error: 'Failed to update health metric',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error updating health metric:', error);
      return reply.status(500).send({ error: 'Failed to update health metric' });
    }
  });

  // DELETE /api/health/metrics/:id - Delete health metric
  fastify.delete('/metrics/:id', {
    preHandler: [requirePermission('health:write')],
    schema: {
      tags: ['health-data'],
      description: 'Delete a health metric',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;

      const result = await coordinator.deleteEntity(COLLECTIONS.HEALTH_METRICS, id);

      if (result.success) {
        const syncManager = getSyncManager();
        await syncManager.syncEntity(id, 'health', 'metric', 'delete');
        return reply.status(204).send();
      } else {
        return reply.status(500).send({
          error: 'Failed to delete health metric',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error deleting health metric:', error);
      return reply.status(500).send({ error: 'Failed to delete health metric' });
    }
  });

  // ===================================
  // MEALS
  // ===================================

  // GET /api/health/meals - List meals with filtering
  fastify.get('/meals', {
    schema: {
      tags: ['health-data'],
      description: 'Get user meals with filtering',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 50, minimum: 1, maximum: 100 },
          offset: { type: 'number', default: 0, minimum: 0 },
          type: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack', 'drink'] },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          search: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { limit = 50, offset = 0, type, startDate, endDate, search } = request.query as any;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.MEALS);

      // Build filters
      const filters: any = { userId: user.id, isDeleted: false };
      if (type) filters.type = type;

      if (startDate || endDate) {
        filters.date = {};
        if (startDate) filters.date.$gte = new Date(startDate);
        if (endDate) filters.date.$lte = new Date(endDate);
      }

      if (search) {
        filters.$or = [
          { name: { $regex: search, $options: 'i' } },
          { 'foods.food.name': { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } }
        ];
      }

      // Get meals with pagination
      const meals = await collection
        .find(filters)
        .sort({ date: -1, time: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      const total = await collection.countDocuments(filters);

      // Calculate nutritional summary
      const nutritionSummary = await collection.aggregate([
        { $match: filters },
        {
          $group: {
            _id: null,
            totalCalories: { $sum: '$totalNutrition.calories' },
            totalProtein: { $sum: '$totalNutrition.protein' },
            totalCarbs: { $sum: '$totalNutrition.carbohydrates' },
            totalFat: { $sum: '$totalNutrition.fat' },
            mealCount: { $sum: 1 }
          }
        }
      ]).toArray();

      return {
        meals,
        total,
        hasMore: offset + limit < total,
        nutritionSummary: nutritionSummary[0] || null
      };
    } catch (error) {
      logger.error('Error fetching meals:', error);
      return reply.status(500).send({ error: 'Failed to fetch meals' });
    }
  });

  // POST /api/health/meals - Create meal with nutritional calculation
  fastify.post('/meals', {
    schema: {
      tags: ['health-data'],
      description: 'Record a new meal with automatic nutritional calculation',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const mealData = CreateMealSchema.parse(request.body);

      // Calculate total nutrition from foods
      const totalNutrition = {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0
      };

      mealData.foods.forEach(foodEntry => {
        const nutrition = foodEntry.food.nutrition;
        if (nutrition.calories) totalNutrition.calories += nutrition.calories * foodEntry.quantity;
        if (nutrition.protein) totalNutrition.protein += nutrition.protein * foodEntry.quantity;
        if (nutrition.carbohydrates) totalNutrition.carbohydrates += nutrition.carbohydrates * foodEntry.quantity;
        if (nutrition.fat) totalNutrition.fat += nutrition.fat * foodEntry.quantity;
        if (nutrition.fiber) totalNutrition.fiber += nutrition.fiber * foodEntry.quantity;
        if (nutrition.sugar) totalNutrition.sugar += nutrition.sugar * foodEntry.quantity;
        if (nutrition.sodium) totalNutrition.sodium += nutrition.sodium * foodEntry.quantity;
      });

      const fullData = {
        ...mealData,
        userId: user.id,
        date: new Date(mealData.date),
        totalNutrition
      };

      // Create relationships for each food ingredient
      const relationships = [
        {
          type: 'CONSUMED_BY',
          targetNodeId: user.id,
          targetLabels: ['User'],
          direction: 'incoming'
        }
      ];

      const result = await coordinator.createEntity(
        COLLECTIONS.MEALS,
        fullData,
        ['Meal', 'Health'],
        {
          domain: 'health',
          type: 'meal',
          mealType: mealData.type,
          calories: totalNutrition.calories
        },
        relationships
      );

      if (result.success && result.entityId) {
        const syncManager = getSyncManager();
        await syncManager.syncEntity(result.entityId, 'health', 'meal', 'create');

        return reply.status(201).send({
          id: result.entityId,
          success: true,
          nutrition: totalNutrition
        });
      } else {
        return reply.status(500).send({
          error: 'Failed to record meal',
          details: result.error?.message
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          error: 'Validation error',
          details: error.errors
        });
      }
      logger.error('Error recording meal:', error);
      return reply.status(500).send({ error: 'Failed to record meal' });
    }
  });

  // PUT /api/health/meals/:id - Update meal
  fastify.put('/meals/:id', {
    preHandler: [requirePermission('health:write')],
    schema: {
      tags: ['health-data'],
      description: 'Update a meal',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const updateData = request.body as any;

      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }

      // Recalculate nutrition if foods changed
      if (updateData.foods) {
        const totalNutrition = {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0
        };

        updateData.foods.forEach((foodEntry: any) => {
          const nutrition = foodEntry.food.nutrition;
          if (nutrition.calories) totalNutrition.calories += nutrition.calories * foodEntry.quantity;
          if (nutrition.protein) totalNutrition.protein += nutrition.protein * foodEntry.quantity;
          if (nutrition.carbohydrates) totalNutrition.carbohydrates += nutrition.carbohydrates * foodEntry.quantity;
          if (nutrition.fat) totalNutrition.fat += nutrition.fat * foodEntry.quantity;
          if (nutrition.fiber) totalNutrition.fiber += nutrition.fiber * foodEntry.quantity;
          if (nutrition.sugar) totalNutrition.sugar += nutrition.sugar * foodEntry.quantity;
          if (nutrition.sodium) totalNutrition.sodium += nutrition.sodium * foodEntry.quantity;
        });

        updateData.totalNutrition = totalNutrition;
      }

      const result = await coordinator.updateEntity(
        COLLECTIONS.MEALS,
        id,
        updateData,
        {
          domain: 'health',
          type: 'meal'
        }
      );

      if (result.success) {
        const syncManager = getSyncManager();
        await syncManager.syncEntity(id, 'health', 'meal', 'update');
        return { success: true };
      } else {
        return reply.status(500).send({
          error: 'Failed to update meal',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error updating meal:', error);
      return reply.status(500).send({ error: 'Failed to update meal' });
    }
  });

  // DELETE /api/health/meals/:id - Delete meal
  fastify.delete('/meals/:id', {
    preHandler: [requirePermission('health:write')],
    schema: {
      tags: ['health-data'],
      description: 'Delete a meal',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;

      const result = await coordinator.deleteEntity(COLLECTIONS.MEALS, id);

      if (result.success) {
        const syncManager = getSyncManager();
        await syncManager.syncEntity(id, 'health', 'meal', 'delete');
        return { success: true };
      } else {
        return reply.status(500).send({
          error: 'Failed to delete meal',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error deleting meal:', error);
      return reply.status(500).send({ error: 'Failed to delete meal' });
    }
  });

  // ===================================
  // WORKOUTS
  // ===================================

  // GET /api/health/workouts - List workouts with filtering
  fastify.get('/workouts', {
    schema: {
      tags: ['health-data'],
      description: 'Get user workouts with filtering',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 50, minimum: 1, maximum: 100 },
          offset: { type: 'number', default: 0, minimum: 0 },
          type: { type: 'string' },
          intensity: { type: 'string', enum: ['light', 'moderate', 'vigorous', 'very_vigorous'] },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          isTemplate: { type: 'boolean' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { limit = 50, offset = 0, type, intensity, startDate, endDate, isTemplate } = request.query as any;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.WORKOUTS);

      // Build filters
      const filters: any = { userId: user.id, isDeleted: false };
      if (type) filters.type = type;
      if (intensity) filters.intensity = intensity;
      if (isTemplate !== undefined) filters.isTemplate = isTemplate;

      if (startDate || endDate) {
        filters.date = {};
        if (startDate) filters.date.$gte = new Date(startDate);
        if (endDate) filters.date.$lte = new Date(endDate);
      }

      // Get workouts with pagination
      const workouts = await collection
        .find(filters)
        .sort({ date: -1, startTime: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      const total = await collection.countDocuments(filters);

      // Calculate workout stats
      const stats = await collection.aggregate([
        { $match: filters },
        {
          $group: {
            _id: null,
            totalWorkouts: { $sum: 1 },
            totalDuration: { $sum: '$duration' },
            totalCalories: { $sum: '$caloriesBurned' },
            avgDuration: { $avg: '$duration' },
            avgCalories: { $avg: '$caloriesBurned' }
          }
        }
      ]).toArray();

      return {
        workouts,
        total,
        hasMore: offset + limit < total,
        stats: stats[0] || null
      };
    } catch (error) {
      logger.error('Error fetching workouts:', error);
      return reply.status(500).send({ error: 'Failed to fetch workouts' });
    }
  });

  // POST /api/health/workouts - Create workout
  fastify.post('/workouts', {
    schema: {
      tags: ['health-data'],
      description: 'Record a new workout',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const workoutData = CreateWorkoutSchema.parse(request.body);

      const fullData = {
        ...workoutData,
        userId: user.id,
        date: new Date(workoutData.date)
      };

      // Create relationships for exercises
      const relationships = [
        {
          type: 'PERFORMED_BY',
          targetNodeId: user.id,
          targetLabels: ['User'],
          direction: 'incoming'
        }
      ];

      const result = await coordinator.createEntity(
        COLLECTIONS.WORKOUTS,
        fullData,
        ['Workout', 'Health'],
        {
          domain: 'health',
          type: 'workout',
          workoutType: workoutData.type,
          intensity: workoutData.intensity,
          duration: workoutData.duration
        },
        relationships
      );

      if (result.success && result.entityId) {
        const syncManager = getSyncManager();
        await syncManager.syncEntity(result.entityId, 'health', 'workout', 'create');

        return reply.status(201).send({
          id: result.entityId,
          success: true
        });
      } else {
        return reply.status(500).send({
          error: 'Failed to record workout',
          details: result.error?.message
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          error: 'Validation error',
          details: error.errors
        });
      }
      logger.error('Error recording workout:', error);
      return reply.status(500).send({ error: 'Failed to record workout' });
    }
  });

  // PUT /api/health/workouts/:id - Update workout
  fastify.put('/workouts/:id', {
    preHandler: [requirePermission('health:write')],
    schema: {
      tags: ['health-data'],
      description: 'Update a workout',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const updateData = request.body as any;

      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }

      const result = await coordinator.updateEntity(
        COLLECTIONS.WORKOUTS,
        id,
        updateData,
        {
          domain: 'health',
          type: 'workout'
        }
      );

      if (result.success) {
        const syncManager = getSyncManager();
        await syncManager.syncEntity(id, 'health', 'workout', 'update');
        return { success: true };
      } else {
        return reply.status(500).send({
          error: 'Failed to update workout',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error updating workout:', error);
      return reply.status(500).send({ error: 'Failed to update workout' });
    }
  });

  // DELETE /api/health/workouts/:id - Delete workout
  fastify.delete('/workouts/:id', {
    preHandler: [requirePermission('health:write')],
    schema: {
      tags: ['health-data'],
      description: 'Delete a workout',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;

      const result = await coordinator.deleteEntity(COLLECTIONS.WORKOUTS, id);

      if (result.success) {
        const syncManager = getSyncManager();
        await syncManager.syncEntity(id, 'health', 'workout', 'delete');
        return { success: true };
      } else {
        return reply.status(500).send({
          error: 'Failed to delete workout',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error deleting workout:', error);
      return reply.status(500).send({ error: 'Failed to delete workout' });
    }
  });

  // ===================================
  // HEALTH GOALS
  // ===================================

  // GET /api/health/goals - List health goals
  fastify.get('/goals', {
    schema: {
      tags: ['health-data'],
      description: 'Get user health goals',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 50, minimum: 1, maximum: 100 },
          offset: { type: 'number', default: 0, minimum: 0 },
          category: { type: 'string' },
          status: { type: 'string', enum: ['active', 'completed', 'paused', 'cancelled'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { limit = 50, offset = 0, category, status, priority } = request.query as any;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.HEALTH_GOALS);

      // Build filters
      const filters: any = { userId: user.id, isDeleted: false };
      if (category) filters.category = category;
      if (status) filters.status = status;
      if (priority) filters.priority = priority;

      // Get goals with pagination
      const goals = await collection
        .find(filters)
        .sort({ priority: -1, createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      const total = await collection.countDocuments(filters);

      // Calculate overall progress
      const summary = {
        totalGoals: total,
        activeGoals: goals.filter((g: any) => g.status === 'active').length,
        completedGoals: goals.filter((g: any) => g.status === 'completed').length,
        avgProgress: goals.reduce((sum: number, g: any) => sum + (g.progress || 0), 0) / (goals.length || 1)
      };

      return {
        goals,
        total,
        hasMore: offset + limit < total,
        summary
      };
    } catch (error) {
      logger.error('Error fetching health goals:', error);
      return reply.status(500).send({ error: 'Failed to fetch health goals' });
    }
  });

  // POST /api/health/goals - Create health goal
  fastify.post('/goals', {
    schema: {
      tags: ['health-data'],
      description: 'Create a new health goal',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const goalData = CreateHealthGoalSchema.parse(request.body);

      // Calculate initial progress
      let progress = 0;
      if (goalData.currentValue && goalData.targetValue && goalData.startValue) {
        const totalChange = goalData.targetValue - goalData.startValue;
        const currentChange = goalData.currentValue - goalData.startValue;
        progress = Math.min(100, Math.max(0, (currentChange / totalChange) * 100));
      }

      const fullData = {
        ...goalData,
        userId: user.id,
        targetDate: goalData.targetDate ? new Date(goalData.targetDate) : undefined,
        progress
      };

      const result = await coordinator.createEntity(
        COLLECTIONS.HEALTH_GOALS,
        fullData,
        ['HealthGoal', 'Goal', 'Health'],
        {
          domain: 'health',
          type: 'goal',
          category: goalData.category,
          priority: goalData.priority
        },
        [
          {
            type: 'HAS_GOAL',
            targetNodeId: user.id,
            targetLabels: ['User'],
            direction: 'incoming'
          }
        ]
      );

      if (result.success && result.entityId) {
        const syncManager = getSyncManager();
        await syncManager.syncEntity(result.entityId, 'health', 'goal', 'create');

        return reply.status(201).send({
          id: result.entityId,
          success: true,
          progress
        });
      } else {
        return reply.status(500).send({
          error: 'Failed to create health goal',
          details: result.error?.message
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          error: 'Validation error',
          details: error.errors
        });
      }
      logger.error('Error creating health goal:', error);
      return reply.status(500).send({ error: 'Failed to create health goal' });
    }
  });

  // PUT /api/health/goals/:id - Update health goal
  fastify.put('/goals/:id', {
    preHandler: [requirePermission('health:write')],
    schema: {
      tags: ['health-data'],
      description: 'Update a health goal',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const updateData = request.body as any;

      if (updateData.targetDate) {
        updateData.targetDate = new Date(updateData.targetDate);
      }

      // Recalculate progress if values changed
      if (updateData.currentValue || updateData.targetValue || updateData.startValue) {
        const mongoConnection = getMongoDBConnection();
        const db = mongoConnection.getDatabase();
        const collection = db.collection(COLLECTIONS.HEALTH_GOALS);

        const existingGoal = await collection.findOne({ id, isDeleted: false });
        if (existingGoal) {
          const currentValue = updateData.currentValue ?? existingGoal.currentValue;
          const targetValue = updateData.targetValue ?? existingGoal.targetValue;
          const startValue = updateData.startValue ?? existingGoal.startValue;

          if (currentValue && targetValue && startValue) {
            const totalChange = targetValue - startValue;
            const currentChange = currentValue - startValue;
            updateData.progress = Math.min(100, Math.max(0, (currentChange / totalChange) * 100));
          }
        }
      }

      const result = await coordinator.updateEntity(
        COLLECTIONS.HEALTH_GOALS,
        id,
        updateData,
        {
          domain: 'health',
          type: 'goal'
        }
      );

      if (result.success) {
        const syncManager = getSyncManager();
        await syncManager.syncEntity(id, 'health', 'goal', 'update');
        return { success: true };
      } else {
        return reply.status(500).send({
          error: 'Failed to update health goal',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error updating health goal:', error);
      return reply.status(500).send({ error: 'Failed to update health goal' });
    }
  });

  // DELETE /api/health/goals/:id - Delete health goal
  fastify.delete('/goals/:id', {
    preHandler: [requirePermission('health:write')],
    schema: {
      tags: ['health-data'],
      description: 'Delete a health goal',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;

      const result = await coordinator.deleteEntity(COLLECTIONS.HEALTH_GOALS, id);

      if (result.success) {
        const syncManager = getSyncManager();
        await syncManager.syncEntity(id, 'health', 'goal', 'delete');
        return { success: true };
      } else {
        return reply.status(500).send({
          error: 'Failed to delete health goal',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error deleting health goal:', error);
      return reply.status(500).send({ error: 'Failed to delete health goal' });
    }
  });

  // ===================================
  // MEAL PLANNING
  // ===================================

  // POST /api/health/meal-plans/generate - Generate meal plan with grocery list
  fastify.post('/meal-plans/generate', {
    schema: {
      tags: ['health-data'],
      description: 'Generate a meal plan with grocery list',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          days: { type: 'number', minimum: 1, maximum: 14 },
          calorieTarget: { type: 'number' },
          proteinTarget: { type: 'number' },
          preferences: {
            type: 'object',
            properties: {
              dietaryRestrictions: { type: 'array', items: { type: 'string' } },
              excludedIngredients: { type: 'array', items: { type: 'string' } },
              preferredCuisines: { type: 'array', items: { type: 'string' } }
            }
          }
        },
        required: ['days']
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { days, calorieTarget, proteinTarget, preferences } = request.body as any;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const mealsCollection = db.collection(COLLECTIONS.MEALS);

      // Get user's historical meals for recommendations
      const historicalMeals = await mealsCollection
        .find({ userId: user.id, isDeleted: false, rating: { $gte: 4 } })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

      // Generate meal plan (simplified algorithm)
      const mealPlan = [];
      const groceryList = new Map();

      for (let day = 0; day < days; day++) {
        const dayPlan = {
          day: day + 1,
          date: new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          meals: {
            breakfast: null,
            lunch: null,
            dinner: null,
            snacks: []
          },
          totalCalories: 0,
          totalProtein: 0
        };

        // Select meals from history or generate new suggestions
        if (historicalMeals.length > 0) {
          // Use historical meals as templates
          const breakfasts = historicalMeals.filter((m: any) => m.type === 'breakfast');
          const lunches = historicalMeals.filter((m: any) => m.type === 'lunch');
          const dinners = historicalMeals.filter((m: any) => m.type === 'dinner');

          if (breakfasts.length > 0) {
            const selected = breakfasts[Math.floor(Math.random() * breakfasts.length)];
            dayPlan.meals.breakfast = selected;
            dayPlan.totalCalories += selected.totalNutrition?.calories || 0;
            dayPlan.totalProtein += selected.totalNutrition?.protein || 0;

            // Add ingredients to grocery list
            selected.foods?.forEach((food: any) => {
              const key = food.food.name;
              const existing = groceryList.get(key) || { name: key, quantity: 0, unit: food.unit };
              existing.quantity += food.quantity;
              groceryList.set(key, existing);
            });
          }

          if (lunches.length > 0) {
            const selected = lunches[Math.floor(Math.random() * lunches.length)];
            dayPlan.meals.lunch = selected;
            dayPlan.totalCalories += selected.totalNutrition?.calories || 0;
            dayPlan.totalProtein += selected.totalNutrition?.protein || 0;

            selected.foods?.forEach((food: any) => {
              const key = food.food.name;
              const existing = groceryList.get(key) || { name: key, quantity: 0, unit: food.unit };
              existing.quantity += food.quantity;
              groceryList.set(key, existing);
            });
          }

          if (dinners.length > 0) {
            const selected = dinners[Math.floor(Math.random() * dinners.length)];
            dayPlan.meals.dinner = selected;
            dayPlan.totalCalories += selected.totalNutrition?.calories || 0;
            dayPlan.totalProtein += selected.totalNutrition?.protein || 0;

            selected.foods?.forEach((food: any) => {
              const key = food.food.name;
              const existing = groceryList.get(key) || { name: key, quantity: 0, unit: food.unit };
              existing.quantity += food.quantity;
              groceryList.set(key, existing);
            });
          }
        }

        mealPlan.push(dayPlan);
      }

      return {
        mealPlan,
        groceryList: Array.from(groceryList.values()),
        summary: {
          totalDays: days,
          avgDailyCalories: mealPlan.reduce((sum, day) => sum + day.totalCalories, 0) / days,
          avgDailyProtein: mealPlan.reduce((sum, day) => sum + day.totalProtein, 0) / days
        }
      };
    } catch (error) {
      logger.error('Error generating meal plan:', error);
      return reply.status(500).send({ error: 'Failed to generate meal plan' });
    }
  });

  // ===================================
  // WORKOUT TEMPLATES
  // ===================================

  // GET /api/health/workout-templates - List workout templates
  fastify.get('/workout-templates', {
    schema: {
      tags: ['health-data'],
      description: 'Get workout templates',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          intensity: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { type, intensity } = request.query as any;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.WORKOUTS);

      // Build filters - user templates OR system templates
      const userFilter: any = { userId: user.id, isTemplate: true, isDeleted: false };
      const systemFilter: any = { isTemplate: true, userId: { $exists: false } };

      // Add type/intensity filters if provided
      if (type) {
        userFilter.type = type;
        systemFilter.type = type;
      }
      if (intensity) {
        userFilter.intensity = intensity;
        systemFilter.intensity = intensity;
      }

      // Get templates matching either user or system filter
      const filters = { $or: [userFilter, systemFilter] };

      // Get templates
      const templates = await collection
        .find(filters)
        .sort({ name: 1 })
        .skip(0)
        .limit(1000) // Large limit to get all templates
        .toArray();

      return {
        templates
      };
    } catch (error) {
      logger.error('Error fetching workout templates:', error);
      return reply.status(500).send({ error: 'Failed to fetch workout templates' });
    }
  });

  // POST /api/health/workout-templates - Create workout template
  fastify.post('/workout-templates', {
    schema: {
      tags: ['health-data'],
      description: 'Create a workout template',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const templateData = request.body as any;

      templateData.userId = user.id;
      templateData.isTemplate = true;
      templateData.date = new Date(); // Template date doesn't matter

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.WORKOUTS);

      const result = await collection.insertOne(templateData);

      if (result.insertedId) {
        return reply.status(201).send({
          id: result.insertedId.toString(),
          success: true
        });
      } else {
        return reply.status(500).send({ error: 'Failed to create workout template' });
      }
    } catch (error) {
      logger.error('Error creating workout template:', error);
      return reply.status(500).send({ error: 'Failed to create workout template' });
    }
  });

  // ===================================
  // HEALTH INSIGHTS & CORRELATIONS
  // ===================================

  // GET /api/health/insights/sleep-performance - Sleep and workout performance correlation
  fastify.get('/insights/sleep-performance', {
    schema: {
      tags: ['health-data'],
      description: 'Analyze correlation between sleep and workout performance',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { startDate, endDate } = request.query as any;

      const neo4jConnection = getNeo4jConnection();

      const query = `
        MATCH (user:User {id: $userId})-[:MEASURED_BY]->(sleep:HealthMetric {type: 'sleep_hours'})
        MATCH (user)-[:PERFORMED_BY]->(workout:Workout)
        WHERE sleep.date = workout.date
          AND sleep.date >= datetime($startDate)
          AND sleep.date <= datetime($endDate)
        WITH sleep.value as sleepHours,
             workout.caloriesBurned as calories,
             workout.rating as rating,
             workout.intensity as intensity,
             workout.date as date
        RETURN sleepHours,
               avg(calories) as avgCalories,
               avg(rating) as avgRating,
               count(*) as workoutCount,
               collect(intensity) as intensities
        ORDER BY sleepHours
      `;

      const result = await neo4jConnection.executeQuery(query, {
        userId: user.id,
        startDate: startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: endDate || new Date().toISOString()
      });

      const correlation = result.records.map(record => ({
        sleepHours: record.get('sleepHours'),
        avgCalories: record.get('avgCalories'),
        avgRating: record.get('avgRating'),
        workoutCount: record.get('workoutCount').toNumber(),
        intensities: record.get('intensities')
      }));

      return {
        correlation,
        insights: generateSleepPerformanceInsights(correlation)
      };
    } catch (error) {
      logger.error('Error analyzing sleep-performance correlation:', error);
      return reply.status(500).send({ error: 'Failed to analyze correlation' });
    }
  });

  // GET /api/health/insights/nutrition-energy - Nutrition and energy level correlation
  fastify.get('/insights/nutrition-energy', {
    schema: {
      tags: ['health-data'],
      description: 'Analyze correlation between nutrition and energy levels',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { startDate, endDate } = request.query as any;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();

      // Get meals and energy metrics grouped by day
      const mealsCollection = db.collection(COLLECTIONS.MEALS);
      const metricsCollection = db.collection(COLLECTIONS.HEALTH_METRICS);

      const dateFilter = {
        date: {
          $gte: new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000),
          $lte: new Date(endDate || Date.now())
        }
      };

      const dailyNutrition = await mealsCollection.aggregate([
        {
          $match: {
            userId: user.id,
            isDeleted: false,
            ...dateFilter
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            totalCalories: { $sum: '$totalNutrition.calories' },
            totalProtein: { $sum: '$totalNutrition.protein' },
            totalCarbs: { $sum: '$totalNutrition.carbohydrates' },
            totalFat: { $sum: '$totalNutrition.fat' }
          }
        }
      ]).toArray();

      const dailyEnergy = await metricsCollection.aggregate([
        {
          $match: {
            userId: user.id,
            type: 'energy_level',
            isDeleted: false,
            ...dateFilter
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            avgEnergy: { $avg: '$value' },
            count: { $sum: 1 }
          }
        }
      ]).toArray();

      // Merge nutrition and energy data
      const correlation = dailyNutrition.map(nutrition => {
        const energy = dailyEnergy.find(e => e._id === nutrition._id);
        return {
          date: nutrition._id,
          calories: nutrition.totalCalories,
          protein: nutrition.totalProtein,
          carbs: nutrition.totalCarbs,
          fat: nutrition.totalFat,
          energyLevel: energy?.avgEnergy || null
        };
      }).filter(item => item.energyLevel !== null);

      return {
        correlation,
        insights: generateNutritionEnergyInsights(correlation)
      };
    } catch (error) {
      logger.error('Error analyzing nutrition-energy correlation:', error);
      return reply.status(500).send({ error: 'Failed to analyze correlation' });
    }
  });

  // ===================================
  // DATA VISUALIZATION
  // ===================================

  // GET /api/health/charts/weight-trend - Weight trend data for charts
  fastify.get('/charts/weight-trend', {
    schema: {
      tags: ['health-data'],
      description: 'Get weight trend data for visualization',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          period: { type: 'string', enum: ['week', 'month', 'quarter', 'year'], default: 'month' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { period = 'month' } = request.query as any;

      const days = period === 'week' ? 7 : period === 'month' ? 30 : period === 'quarter' ? 90 : 365;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.HEALTH_METRICS);

      const weightData = await collection
        .find({
          userId: user.id,
          type: 'weight',
          isDeleted: false,
          date: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
        })
        .sort({ date: 1 })
        .skip(0)
        .limit(1000) // Large limit to get all data points in period
        .toArray();

      // Calculate trend line
      const trendData = weightData.map((w: any, index) => ({
        date: w.date,
        weight: w.value,
        unit: w.unit
      }));

      return {
        data: trendData,
        summary: {
          current: trendData.length > 0 ? trendData[trendData.length - 1]?.weight : null,
          previous: trendData.length > 0 ? trendData[0]?.weight : null,
          change: trendData.length >= 2 ? trendData[trendData.length - 1].weight - trendData[0].weight : 0,
          avgWeight: trendData.length > 0 ? trendData.reduce((sum, d) => sum + d.weight, 0) / trendData.length : 0
        }
      };
    } catch (error) {
      logger.error('Error fetching weight trend:', error);
      return reply.status(500).send({ error: 'Failed to fetch weight trend' });
    }
  });

  // GET /api/health/charts/workout-volume - Workout volume trend
  fastify.get('/charts/workout-volume', {
    schema: {
      tags: ['health-data'],
      description: 'Get workout volume trend for visualization',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          period: { type: 'string', enum: ['week', 'month', 'quarter', 'year'], default: 'month' },
          groupBy: { type: 'string', enum: ['day', 'week', 'month'], default: 'week' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { period = 'month', groupBy = 'week' } = request.query as any;

      const days = period === 'week' ? 7 : period === 'month' ? 30 : period === 'quarter' ? 90 : 365;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.WORKOUTS);

      let groupStage: any;
      if (groupBy === 'day') {
        groupStage = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
      } else if (groupBy === 'week') {
        groupStage = { $dateToString: { format: '%Y-W%V', date: '$date' } };
      } else {
        groupStage = { $dateToString: { format: '%Y-%m', date: '$date' } };
      }

      const volumeData = await collection.aggregate([
        {
          $match: {
            userId: user.id,
            isDeleted: false,
            date: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: groupStage,
            totalDuration: { $sum: '$duration' },
            totalCalories: { $sum: '$caloriesBurned' },
            workoutCount: { $sum: 1 },
            avgIntensity: {
              $avg: {
                $switch: {
                  branches: [
                    { case: { $eq: ['$intensity', 'light'] }, then: 1 },
                    { case: { $eq: ['$intensity', 'moderate'] }, then: 2 },
                    { case: { $eq: ['$intensity', 'vigorous'] }, then: 3 },
                    { case: { $eq: ['$intensity', 'very_vigorous'] }, then: 4 }
                  ],
                  default: 0
                }
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray();

      return {
        data: volumeData.map(v => ({
          period: v._id,
          duration: v.totalDuration,
          calories: v.totalCalories,
          workoutCount: v.workoutCount,
          avgIntensity: v.avgIntensity
        })),
        summary: {
          totalWorkouts: volumeData.reduce((sum, v) => sum + v.workoutCount, 0),
          totalDuration: volumeData.reduce((sum, v) => sum + v.totalDuration, 0),
          totalCalories: volumeData.reduce((sum, v) => sum + v.totalCalories, 0)
        }
      };
    } catch (error) {
      logger.error('Error fetching workout volume:', error);
      return reply.status(500).send({ error: 'Failed to fetch workout volume' });
    }
  });

  // GET /api/health/charts/nutrition-breakdown - Daily nutrition breakdown
  fastify.get('/charts/nutrition-breakdown', {
    schema: {
      tags: ['health-data'],
      description: 'Get nutrition breakdown for visualization',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          date: { type: 'string' } // Accept any date string format (ISO, date-only, etc.)
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { date } = request.query as any;

      const targetDate = date ? new Date(date) : new Date();
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.MEALS);

      const breakdown = await collection.aggregate([
        {
          $match: {
            userId: user.id,
            isDeleted: false,
            date: { $gte: startOfDay, $lte: endOfDay }
          }
        },
        {
          $group: {
            _id: '$type',
            totalCalories: { $sum: '$totalNutrition.calories' },
            totalProtein: { $sum: '$totalNutrition.protein' },
            totalCarbs: { $sum: '$totalNutrition.carbohydrates' },
            totalFat: { $sum: '$totalNutrition.fat' },
            meals: { $push: '$$ROOT' }
          }
        }
      ]).toArray();

      const totals = {
        calories: breakdown.reduce((sum, b) => sum + (b.totalCalories || 0), 0),
        protein: breakdown.reduce((sum, b) => sum + (b.totalProtein || 0), 0),
        carbs: breakdown.reduce((sum, b) => sum + (b.totalCarbs || 0), 0),
        fat: breakdown.reduce((sum, b) => sum + (b.totalFat || 0), 0)
      };

      return {
        breakdown: breakdown.map(b => ({
          mealType: b._id,
          calories: b.totalCalories,
          protein: b.totalProtein,
          carbs: b.totalCarbs,
          fat: b.totalFat,
          mealCount: b.meals.length
        })),
        totals,
        macroDistribution: {
          protein: (totals.protein * 4) / totals.calories * 100 || 0,
          carbs: (totals.carbs * 4) / totals.calories * 100 || 0,
          fat: (totals.fat * 9) / totals.calories * 100 || 0
        }
      };
    } catch (error) {
      logger.error('Error fetching nutrition breakdown:', error);
      return reply.status(500).send({ error: 'Failed to fetch nutrition breakdown' });
    }
  });
};

// Helper functions for generating insights
function generateSleepPerformanceInsights(correlation: any[]): any {
  if (correlation.length === 0) {
    return { message: 'Not enough data to generate insights' };
  }

  const insights = [];

  // Find optimal sleep hours
  const sortedByRating = [...correlation].sort((a, b) => b.avgRating - a.avgRating);
  if (sortedByRating.length > 0 && sortedByRating[0].avgRating > 3) {
    insights.push({
      type: 'optimal_sleep',
      message: `Your best workout performances occur with around ${sortedByRating[0].sleepHours} hours of sleep`,
      data: sortedByRating[0]
    });
  }

  // Check for sleep deprivation impact
  const lowSleep = correlation.filter(c => c.sleepHours < 6);
  if (lowSleep.length > 0) {
    const avgRatingLowSleep = lowSleep.reduce((sum, c) => sum + c.avgRating, 0) / lowSleep.length;
    const avgRatingAllSleep = correlation.reduce((sum, c) => sum + c.avgRating, 0) / correlation.length;

    if (avgRatingLowSleep < avgRatingAllSleep) {
      insights.push({
        type: 'sleep_deprivation',
        message: `Workouts after less than 6 hours of sleep have ${Math.round((1 - avgRatingLowSleep / avgRatingAllSleep) * 100)}% lower performance ratings`,
        data: { avgRatingLowSleep, avgRatingAllSleep }
      });
    }
  }

  return { insights };
}

function generateNutritionEnergyInsights(correlation: any[]): any {
  if (correlation.length === 0) {
    return { message: 'Not enough data to generate insights' };
  }

  const insights = [];

  // Analyze protein impact
  const sortedByProtein = [...correlation].sort((a, b) => b.protein - a.protein);
  const highProteinDays = sortedByProtein.slice(0, Math.ceil(sortedByProtein.length * 0.3));
  const avgEnergyHighProtein = highProteinDays.reduce((sum, d) => sum + d.energyLevel, 0) / highProteinDays.length;
  const avgEnergyAll = correlation.reduce((sum, d) => sum + d.energyLevel, 0) / correlation.length;

  if (avgEnergyHighProtein > avgEnergyAll * 1.1) {
    insights.push({
      type: 'protein_energy',
      message: `Days with higher protein intake (avg ${Math.round(highProteinDays.reduce((sum, d) => sum + d.protein, 0) / highProteinDays.length)}g) show ${Math.round((avgEnergyHighProtein / avgEnergyAll - 1) * 100)}% better energy levels`,
      data: { avgEnergyHighProtein, avgEnergyAll }
    });
  }

  // Analyze calorie impact
  const sortedByCalories = [...correlation].sort((a, b) => a.calories - b.calories);
  const lowCalorieDays = sortedByCalories.slice(0, Math.ceil(sortedByCalories.length * 0.3));
  const avgEnergyLowCalories = lowCalorieDays.reduce((sum, d) => sum + d.energyLevel, 0) / lowCalorieDays.length;

  if (avgEnergyLowCalories < avgEnergyAll * 0.9) {
    insights.push({
      type: 'calorie_energy',
      message: `Days with lower calorie intake (under ${Math.round(lowCalorieDays[lowCalorieDays.length - 1].calories)} cal) show ${Math.round((1 - avgEnergyLowCalories / avgEnergyAll) * 100)}% lower energy levels`,
      data: { avgEnergyLowCalories, avgEnergyAll }
    });
  }

  return { insights };
}

export default healthDataRoutes;
