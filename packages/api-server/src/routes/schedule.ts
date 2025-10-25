import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ZodError } from 'zod';
import { createAuthMiddleware, requirePermission } from '../middleware/auth';
import { getDualDatabaseCoordinator } from '../database/dual-db-coordinator';
import { getMongoDBConnection } from '../database/mongodb';
import { getNeo4jConnection } from '../database/neo4j';
import { COLLECTIONS } from '../database/collections';
import { getSyncManager } from '../services/sync-manager';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
  CreateCalendarEventSchema,
  UpdateCalendarEventSchema,
  CreateDeepWorkBlockSchema,
  UpdateDeepWorkBlockSchema,
  CreateHabitSchema,
  UpdateHabitSchema,
  CreateHabitCompletionSchema,
  calculateHabitStreak,
  isTaskBlocked,
  calculateProjectCompletion,
  getTasksDueSoon,
  calculateTimeBlockEfficiency
} from '../models/schedule';
import { logger } from '../utils/logger';

const scheduleRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const coordinator = getDualDatabaseCoordinator();
  const authMiddleware = createAuthMiddleware();

  // Add authentication to all routes
  fastify.addHook('preHandler', authMiddleware);

  // ===================================
  // TASKS
  // ===================================

  // GET /api/schedule/tasks - List tasks with filtering
  fastify.get('/tasks', {
    schema: {
      tags: ['schedule'],
      description: 'Get user tasks with advanced filtering',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 50, minimum: 1, maximum: 100 },
          offset: { type: 'number', default: 0, minimum: 0 },
          status: {
            type: 'string',
            enum: ['todo', 'in_progress', 'blocked', 'completed', 'cancelled', 'archived']
          },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          category: { type: 'string' },
          projectId: { type: 'string' },
          dueAfter: { type: 'string' },
          dueBefore: { type: 'string' },
          overdue: { type: 'boolean' },
          search: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const {
        limit = 50,
        offset = 0,
        status,
        priority,
        category,
        projectId,
        dueAfter,
        dueBefore,
        overdue,
        search
      } = request.query as any;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.TASKS);

      // Build filters
      const filters: any = { userId: user.id, isDeleted: false };

      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (category) filters.category = category;
      if (projectId) filters.projectId = projectId;

      if (dueAfter || dueBefore || overdue) {
        filters.dueDate = {};
        if (dueAfter) filters.dueDate.$gte = new Date(dueAfter);
        if (dueBefore) filters.dueDate.$lte = new Date(dueBefore);
        if (overdue) filters.dueDate.$lt = new Date();
      }

      if (search) {
        filters.$text = { $search: search };
      }

      // Get tasks with pagination
      const tasks = await collection
        .find(filters)
        .sort({ priority: -1, dueDate: 1, createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      const total = await collection.countDocuments(filters);

      // Calculate task statistics
      const allTasks = await collection
        .find({ userId: user.id, isDeleted: false })
        .toArray();

      const stats = {
        total: allTasks.length,
        todo: allTasks.filter((t: any) => t.status === 'todo').length,
        inProgress: allTasks.filter((t: any) => t.status === 'in_progress').length,
        completed: allTasks.filter((t: any) => t.status === 'completed').length,
        overdue: allTasks.filter((t: any) =>
          t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
        ).length
      };

      return {
        tasks,
        total,
        hasMore: offset + limit < total,
        stats
      };
    } catch (error) {
      logger.error('Error fetching tasks:', error);
      return reply.status(500).send({ error: 'Failed to fetch tasks' });
    }
  });

  // POST /api/schedule/tasks - Create task
  fastify.post('/tasks', {
    schema: {
      tags: ['schedule'],
      description: 'Create a new task',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const taskData = CreateTaskSchema.parse(request.body);

      const fullData = {
        ...taskData,
        userId: user.id,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        startDate: taskData.startDate ? new Date(taskData.startDate) : undefined
      };

      // Build relationships
      const relationships = [
        {
          type: 'ASSIGNED_TO',
          targetNodeId: user.id,
          targetLabels: ['User'],
          direction: 'incoming'
        }
      ];

      if (taskData.projectId) {
        relationships.push({
          type: 'PART_OF',
          targetNodeId: taskData.projectId,
          targetLabels: ['Project'],
          direction: 'outgoing'
        });
      }

      if (taskData.dependencies && taskData.dependencies.length > 0) {
        for (const depId of taskData.dependencies) {
          relationships.push({
            type: 'DEPENDS_ON',
            targetNodeId: depId,
            targetLabels: ['Task'],
            direction: 'outgoing'
          });
        }
      }

      const result = await coordinator.createEntity(
        COLLECTIONS.TASKS,
        fullData,
        ['Task', 'Schedule'],
        {
          domain: 'schedule',
          type: 'task',
          status: taskData.status,
          priority: taskData.priority
        },
        relationships
      );

      if (result.success && result.entityId) {
        const syncManager = getSyncManager();
        await syncManager.syncEntity(result.entityId, 'schedule', 'task', 'create');

        return reply.status(201).send({
          id: result.entityId,
          success: true
        });
      } else {
        return reply.status(500).send({
          error: 'Failed to create task',
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
      logger.error('Error creating task:', error);
      return reply.status(500).send({ error: 'Failed to create task' });
    }
  });

  // PUT /api/schedule/tasks/:id - Update task
  fastify.put('/tasks/:id', {
    preHandler: [requirePermission('schedule:write')],
    schema: {
      tags: ['schedule'],
      description: 'Update a task',
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
      const updateData = UpdateTaskSchema.parse(request.body);

      if (updateData.dueDate) {
        (updateData as any).dueDate = new Date(updateData.dueDate);
      }
      if (updateData.startDate) {
        (updateData as any).startDate = new Date(updateData.startDate);
      }
      if (updateData.status === 'completed' && !(updateData as any).completedAt) {
        (updateData as any).completedAt = new Date();
      }

      const result = await coordinator.updateEntity(
        COLLECTIONS.TASKS,
        id,
        updateData,
        {
          domain: 'schedule',
          type: 'task'
        }
      );

      if (result.success) {
        const syncManager = getSyncManager();
        await syncManager.syncEntity(id, 'schedule', 'task', 'update');
        return { success: true };
      } else {
        return reply.status(500).send({
          error: 'Failed to update task',
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
      logger.error('Error updating task:', error);
      return reply.status(500).send({ error: 'Failed to update task' });
    }
  });

  // DELETE /api/schedule/tasks/:id - Delete task
  fastify.delete('/tasks/:id', {
    preHandler: [requirePermission('schedule:write')],
    schema: {
      tags: ['schedule'],
      description: 'Delete a task',
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

      const result = await coordinator.deleteEntity(COLLECTIONS.TASKS, id);

      if (result.success) {
        const syncManager = getSyncManager();
        await syncManager.syncEntity(id, 'schedule', 'task', 'delete');
        return reply.status(204).send();
      } else {
        return reply.status(500).send({
          error: 'Failed to delete task',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error deleting task:', error);
      return reply.status(500).send({ error: 'Failed to delete task' });
    }
  });

  // GET /api/schedule/tasks/:id/dependencies - Get task dependencies
  fastify.get('/tasks/:id/dependencies', {
    schema: {
      tags: ['schedule'],
      description: 'Get task dependencies and blockers',
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

      const neo4jConnection = getNeo4jConnection();

      // Get dependencies (tasks this task depends on)
      const dependenciesQuery = `
        MATCH (task:Task {id: $taskId})-[:DEPENDS_ON]->(dep:Task)
        RETURN dep
      `;

      // Get dependents (tasks that depend on this task)
      const dependentsQuery = `
        MATCH (dependent:Task)-[:DEPENDS_ON]->(task:Task {id: $taskId})
        RETURN dependent
      `;

      const [depResult, dependendentResult] = await Promise.all([
        neo4jConnection.executeQuery(dependenciesQuery, { taskId: id }),
        neo4jConnection.executeQuery(dependentsQuery, { taskId: id })
      ]);

      const dependencies = depResult.records.map(r => r.get('dep').properties);
      const dependents = dependendentResult.records.map(r => r.get('dependent').properties);

      // Check if task is blocked
      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.TASKS);

      const task = await collection.findOne({ id, userId: user.id, isDeleted: false });
      if (!task) {
        return reply.status(404).send({ error: 'Task not found' });
      }

      const allTasks = await collection.find({ userId: user.id, isDeleted: false }).toArray();
      const blocked = isTaskBlocked(task as any, allTasks as any);

      return {
        dependencies,
        dependents,
        isBlocked: blocked,
        blockingTasks: blocked
          ? dependencies.filter(d => d.status !== 'completed')
          : []
      };
    } catch (error) {
      logger.error('Error fetching task dependencies:', error);
      return reply.status(500).send({ error: 'Failed to fetch task dependencies' });
    }
  });

  // ===================================
  // PROJECTS
  // ===================================

  // GET /api/schedule/projects - List projects
  fastify.get('/projects', {
    schema: {
      tags: ['schedule'],
      description: 'Get user projects',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 50, minimum: 1, maximum: 100 },
          offset: { type: 'number', default: 0, minimum: 0 },
          status: {
            type: 'string',
            enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived']
          },
          category: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { limit = 50, offset = 0, status, category } = request.query as any;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const projectsCollection = db.collection(COLLECTIONS.PROJECTS);
      const tasksCollection = db.collection(COLLECTIONS.TASKS);

      // Build filters
      const filters: any = { userId: user.id, isDeleted: false };
      if (status) filters.status = status;
      if (category) filters.category = category;

      // Get projects
      const projects = await projectsCollection
        .find(filters)
        .sort({ priority: -1, createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      // Calculate completion for each project
      const projectsWithCompletion = await Promise.all(
        projects.map(async (project: any) => {
          const projectTasks = await tasksCollection
            .find({ projectId: project.id, isDeleted: false })
            .toArray();

          const completion = calculateProjectCompletion(projectTasks as any);

          return {
            ...project,
            taskCount: projectTasks.length,
            completion
          };
        })
      );

      const total = await projectsCollection.countDocuments(filters);

      return {
        projects: projectsWithCompletion,
        total,
        hasMore: offset + limit < total
      };
    } catch (error) {
      logger.error('Error fetching projects:', error);
      return reply.status(500).send({ error: 'Failed to fetch projects' });
    }
  });

  // POST /api/schedule/projects - Create project
  fastify.post('/projects', {
    schema: {
      tags: ['schedule'],
      description: 'Create a new project',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const projectData = CreateProjectSchema.parse(request.body);

      const fullData = {
        ...projectData,
        userId: user.id,
        startDate: projectData.startDate ? new Date(projectData.startDate) : undefined,
        dueDate: projectData.dueDate ? new Date(projectData.dueDate) : undefined
      };

      const relationships = [
        {
          type: 'OWNS',
          targetNodeId: user.id,
          targetLabels: ['User'],
          direction: 'incoming'
        }
      ];

      if (projectData.parentProjectId) {
        relationships.push({
          type: 'SUBPROJECT_OF',
          targetNodeId: projectData.parentProjectId,
          targetLabels: ['Project'],
          direction: 'outgoing'
        });
      }

      const result = await coordinator.createEntity(
        COLLECTIONS.PROJECTS,
        fullData,
        ['Project', 'Schedule'],
        {
          domain: 'schedule',
          type: 'project',
          status: projectData.status,
          priority: projectData.priority
        },
        relationships
      );

      if (result.success && result.entityId) {
        const syncManager = getSyncManager();
        await syncManager.syncEntity(result.entityId, 'schedule', 'project', 'create');

        return reply.status(201).send({
          id: result.entityId,
          success: true
        });
      } else {
        return reply.status(500).send({
          error: 'Failed to create project',
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
      logger.error('Error creating project:', error);
      return reply.status(500).send({ error: 'Failed to create project' });
    }
  });

  // PUT /api/schedule/projects/:id - Update project
  fastify.put('/projects/:id', {
    preHandler: [requirePermission('schedule:write')],
    schema: {
      tags: ['schedule'],
      description: 'Update a project',
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
      const updateData = UpdateProjectSchema.parse(request.body);

      if (updateData.startDate) {
        (updateData as any).startDate = new Date(updateData.startDate);
      }
      if (updateData.dueDate) {
        (updateData as any).dueDate = new Date(updateData.dueDate);
      }
      if (updateData.status === 'completed' && !(updateData as any).completedAt) {
        (updateData as any).completedAt = new Date();
      }

      const result = await coordinator.updateEntity(
        COLLECTIONS.PROJECTS,
        id,
        updateData,
        {
          domain: 'schedule',
          type: 'project'
        }
      );

      if (result.success) {
        const syncManager = getSyncManager();
        await syncManager.syncEntity(id, 'schedule', 'project', 'update');
        return { success: true };
      } else {
        return reply.status(500).send({
          error: 'Failed to update project',
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
      logger.error('Error updating project:', error);
      return reply.status(500).send({ error: 'Failed to update project' });
    }
  });

  // DELETE /api/schedule/projects/:id - Delete project
  fastify.delete('/projects/:id', {
    preHandler: [requirePermission('schedule:write')],
    schema: {
      tags: ['schedule'],
      description: 'Delete a project',
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

      const result = await coordinator.deleteEntity(COLLECTIONS.PROJECTS, id);

      if (result.success) {
        const syncManager = getSyncManager();
        await syncManager.syncEntity(id, 'schedule', 'project', 'delete');
        return reply.status(204).send();
      } else {
        return reply.status(500).send({
          error: 'Failed to delete project',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error deleting project:', error);
      return reply.status(500).send({ error: 'Failed to delete project' });
    }
  });

  // GET /api/schedule/projects/:id/tasks - Get project tasks
  fastify.get('/projects/:id/tasks', {
    schema: {
      tags: ['schedule'],
      description: 'Get all tasks for a project',
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

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.TASKS);

      const tasks = await collection
        .find({ projectId: id, userId: user.id, isDeleted: false })
        .sort({ priority: -1, dueDate: 1 })
        .toArray();

      const completion = calculateProjectCompletion(tasks as any);

      return {
        tasks,
        total: tasks.length,
        completion
      };
    } catch (error) {
      logger.error('Error fetching project tasks:', error);
      return reply.status(500).send({ error: 'Failed to fetch project tasks' });
    }
  });

  // ===================================
  // CALENDAR EVENTS
  // ===================================

  // GET /api/schedule/events - List calendar events
  fastify.get('/events', {
    schema: {
      tags: ['schedule'],
      description: 'Get calendar events',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          type: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { startDate, endDate, type } = request.query as any;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.CALENDAR_EVENTS);

      const filters: any = { userId: user.id, isDeleted: false };

      if (startDate || endDate) {
        filters.startDate = {};
        if (startDate) filters.startDate.$gte = new Date(startDate);
        if (endDate) filters.startDate.$lte = new Date(endDate);
      }

      if (type) filters.type = type;

      const events = await collection
        .find(filters)
        .sort({ startDate: 1 })
        .toArray();

      return { events };
    } catch (error) {
      logger.error('Error fetching events:', error);
      return reply.status(500).send({ error: 'Failed to fetch events' });
    }
  });

  // POST /api/schedule/events - Create calendar event
  fastify.post('/events', {
    schema: {
      tags: ['schedule'],
      description: 'Create a calendar event',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const eventData = CreateCalendarEventSchema.parse(request.body);

      const fullData = {
        ...eventData,
        userId: user.id,
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate)
      };

      const result = await coordinator.createEntity(
        COLLECTIONS.CALENDAR_EVENTS,
        fullData,
        ['Event', 'Schedule'],
        {
          domain: 'schedule',
          type: 'event',
          eventType: eventData.type
        },
        [
          {
            type: 'SCHEDULED_BY',
            targetNodeId: user.id,
            targetLabels: ['User'],
            direction: 'incoming'
          }
        ]
      );

      if (result.success && result.entityId) {
        const syncManager = getSyncManager();
        await syncManager.syncEntity(result.entityId, 'schedule', 'event', 'create');

        return reply.status(201).send({
          id: result.entityId,
          success: true
        });
      } else {
        return reply.status(500).send({
          error: 'Failed to create event',
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
      logger.error('Error creating event:', error);
      return reply.status(500).send({ error: 'Failed to create event' });
    }
  });

  // ===================================
  // TIME BLOCKS (Deep Work)
  // ===================================

  // GET /api/schedule/time-blocks - List time blocks
  fastify.get('/time-blocks', {
    schema: {
      tags: ['schedule'],
      description: 'Get time blocks for deep work',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          type: { type: 'string' },
          completed: { type: 'boolean' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { startDate, endDate, type, completed } = request.query as any;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.TIME_BLOCKS);

      const filters: any = { userId: user.id, isDeleted: false };

      if (startDate || endDate) {
        filters.date = {};
        if (startDate) filters.date.$gte = new Date(startDate);
        if (endDate) filters.date.$lte = new Date(endDate);
      }

      if (type) filters.type = type;
      if (completed !== undefined) filters.completed = completed;

      const timeBlocks = await collection
        .find(filters)
        .sort({ date: -1, startTime: 1 })
        .toArray();

      const efficiency = calculateTimeBlockEfficiency(timeBlocks as any);

      return {
        timeBlocks,
        efficiency
      };
    } catch (error) {
      logger.error('Error fetching time blocks:', error);
      return reply.status(500).send({ error: 'Failed to fetch time blocks' });
    }
  });

  // POST /api/schedule/time-blocks - Create time block
  fastify.post('/time-blocks', {
    schema: {
      tags: ['schedule'],
      description: 'Create a time block for deep work',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const blockData = CreateDeepWorkBlockSchema.parse(request.body);

      const fullData = {
        ...blockData,
        userId: user.id,
        date: new Date(blockData.date)
      };

      const relationships = [
        {
          type: 'SCHEDULED_BY',
          targetNodeId: user.id,
          targetLabels: ['User'],
          direction: 'incoming'
        }
      ];

      if (blockData.taskId) {
        relationships.push({
          type: 'BLOCKS_TIME_FOR',
          targetNodeId: blockData.taskId,
          targetLabels: ['Task'],
          direction: 'outgoing'
        });
      }

      const result = await coordinator.createEntity(
        COLLECTIONS.TIME_BLOCKS,
        fullData,
        ['TimeBlock', 'Schedule'],
        {
          domain: 'schedule',
          type: 'time_block',
          blockType: blockData.type
        },
        relationships
      );

      if (result.success && result.entityId) {
        const syncManager = getSyncManager();
        await syncManager.syncEntity(result.entityId, 'schedule', 'time_block', 'create');

        return reply.status(201).send({
          id: result.entityId,
          success: true
        });
      } else {
        return reply.status(500).send({
          error: 'Failed to create time block',
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
      logger.error('Error creating time block:', error);
      return reply.status(500).send({ error: 'Failed to create time block' });
    }
  });

  // PUT /api/schedule/time-blocks/:id - Update time block
  fastify.put('/time-blocks/:id', {
    preHandler: [requirePermission('schedule:write')],
    schema: {
      tags: ['schedule'],
      description: 'Update a time block',
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
      const updateData = UpdateDeepWorkBlockSchema.parse(request.body);

      if (updateData.date) {
        (updateData as any).date = new Date(updateData.date);
      }

      const result = await coordinator.updateEntity(
        COLLECTIONS.TIME_BLOCKS,
        id,
        updateData,
        {
          domain: 'schedule',
          type: 'time_block'
        }
      );

      if (result.success) {
        const syncManager = getSyncManager();
        await syncManager.syncEntity(id, 'schedule', 'time_block', 'update');
        return { success: true };
      } else {
        return reply.status(500).send({
          error: 'Failed to update time block',
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
      logger.error('Error updating time block:', error);
      return reply.status(500).send({ error: 'Failed to update time block' });
    }
  });

  // ===================================
  // HABITS
  // ===================================

  // GET /api/schedule/habits - List habits
  fastify.get('/habits', {
    schema: {
      tags: ['schedule'],
      description: 'Get user habits',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          frequency: { type: 'string' },
          isActive: { type: 'boolean' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { category, frequency, isActive } = request.query as any;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const habitsCollection = db.collection(COLLECTIONS.HABITS);
      const completionsCollection = db.collection(COLLECTIONS.HABIT_COMPLETIONS);

      const filters: any = { userId: user.id, isDeleted: false };
      if (category) filters.category = category;
      if (frequency) filters.frequency = frequency;
      if (isActive !== undefined) filters.isActive = isActive;

      const habits = await habitsCollection
        .find(filters)
        .sort({ createdAt: -1 })
        .toArray();

      // Calculate streaks for each habit
      const habitsWithStreaks = await Promise.all(
        habits.map(async (habit: any) => {
          const completions = await completionsCollection
            .find({ habitId: habit.id })
            .sort({ date: -1 })
            .toArray();

          const streakInfo = calculateHabitStreak(
            completions as any,
            habit.frequency,
            habit.targetCount,
            habit.targetDaysOfWeek
          );

          return {
            ...habit,
            ...streakInfo
          };
        })
      );

      return { habits: habitsWithStreaks };
    } catch (error) {
      logger.error('Error fetching habits:', error);
      return reply.status(500).send({ error: 'Failed to fetch habits' });
    }
  });

  // POST /api/schedule/habits - Create habit
  fastify.post('/habits', {
    schema: {
      tags: ['schedule'],
      description: 'Create a new habit',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const habitData = CreateHabitSchema.parse(request.body);

      const fullData = {
        ...habitData,
        userId: user.id,
        startDate: new Date(habitData.startDate),
        endDate: habitData.endDate ? new Date(habitData.endDate) : undefined,
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0
      };

      const result = await coordinator.createEntity(
        COLLECTIONS.HABITS,
        fullData,
        ['Habit', 'Schedule'],
        {
          domain: 'schedule',
          type: 'habit',
          category: habitData.category,
          frequency: habitData.frequency
        },
        [
          {
            type: 'TRACKS',
            targetNodeId: user.id,
            targetLabels: ['User'],
            direction: 'incoming'
          }
        ]
      );

      if (result.success && result.entityId) {
        const syncManager = getSyncManager();
        await syncManager.syncEntity(result.entityId, 'schedule', 'habit', 'create');

        return reply.status(201).send({
          id: result.entityId,
          success: true
        });
      } else {
        return reply.status(500).send({
          error: 'Failed to create habit',
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
      logger.error('Error creating habit:', error);
      return reply.status(500).send({ error: 'Failed to create habit' });
    }
  });

  // POST /api/schedule/habits/:id/complete - Mark habit as completed
  fastify.post('/habits/:id/complete', {
    schema: {
      tags: ['schedule'],
      description: 'Mark a habit as completed',
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
      const completionData = CreateHabitCompletionSchema.parse(request.body);

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const habitsCollection = db.collection(COLLECTIONS.HABITS);
      const completionsCollection = db.collection(COLLECTIONS.HABIT_COMPLETIONS);

      // Verify habit exists
      const habit = await habitsCollection.findOne({ id, userId: user.id, isDeleted: false });
      if (!habit) {
        return reply.status(404).send({ error: 'Habit not found' });
      }

      const fullData = {
        ...completionData,
        habitId: id,
        userId: user.id,
        completedAt: new Date(completionData.completedAt),
        date: new Date(completionData.date)
      };

      const result = await coordinator.createEntity(
        COLLECTIONS.HABIT_COMPLETIONS,
        fullData,
        ['HabitCompletion', 'Schedule'],
        {
          domain: 'schedule',
          type: 'habit_completion'
        },
        [
          {
            type: 'COMPLETES',
            targetNodeId: id,
            targetLabels: ['Habit'],
            direction: 'outgoing'
          }
        ]
      );

      if (result.success && result.entityId) {
        // Recalculate streaks
        const completions = await completionsCollection
          .find({ habitId: id })
          .sort({ date: -1 })
          .toArray();

        const streakInfo = calculateHabitStreak(
          completions as any,
          habit.frequency,
          habit.targetCount,
          habit.targetDaysOfWeek
        );

        // Update habit with new streak info
        await habitsCollection.updateOne(
          { id },
          {
            $set: {
              currentStreak: streakInfo.currentStreak,
              longestStreak: streakInfo.longestStreak,
              totalCompletions: completions.length
            }
          }
        );

        const syncManager = getSyncManager();
        await syncManager.syncEntity(id, 'schedule', 'habit', 'update');

        return reply.status(201).send({
          id: result.entityId,
          success: true,
          ...streakInfo
        });
      } else {
        return reply.status(500).send({
          error: 'Failed to record habit completion',
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
      logger.error('Error recording habit completion:', error);
      return reply.status(500).send({ error: 'Failed to record habit completion' });
    }
  });

  // GET /api/schedule/habits/:id/completions - Get habit completion history
  fastify.get('/habits/:id/completions', {
    schema: {
      tags: ['schedule'],
      description: 'Get habit completion history',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string' },
          endDate: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { id } = request.params as any;
      const { startDate, endDate } = request.query as any;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.HABIT_COMPLETIONS);

      const filters: any = { habitId: id, userId: user.id, isDeleted: false };

      if (startDate || endDate) {
        filters.date = {};
        if (startDate) filters.date.$gte = new Date(startDate);
        if (endDate) filters.date.$lte = new Date(endDate);
      }

      const completions = await collection
        .find(filters)
        .sort({ date: -1 })
        .toArray();

      return { completions };
    } catch (error) {
      logger.error('Error fetching habit completions:', error);
      return reply.status(500).send({ error: 'Failed to fetch habit completions' });
    }
  });

  // ===================================
  // PRODUCTIVITY INSIGHTS
  // ===================================

  // GET /api/schedule/insights/productivity - Productivity analysis
  fastify.get('/insights/productivity', {
    schema: {
      tags: ['schedule'],
      description: 'Get productivity insights and patterns',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          period: { type: 'string', enum: ['week', 'month', 'quarter'], default: 'month' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { period = 'month' } = request.query as any;

      const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();

      // Task completion rate
      const tasksCollection = db.collection(COLLECTIONS.TASKS);
      const allTasks = await tasksCollection
        .find({
          userId: user.id,
          isDeleted: false,
          createdAt: { $gte: startDate }
        })
        .toArray();

      const completedTasks = allTasks.filter((t: any) => t.status === 'completed');
      const completionRate = allTasks.length > 0
        ? (completedTasks.length / allTasks.length) * 100
        : 0;

      // Time blocking efficiency
      const timeBlocksCollection = db.collection(COLLECTIONS.TIME_BLOCKS);
      const timeBlocks = await timeBlocksCollection
        .find({
          userId: user.id,
          isDeleted: false,
          date: { $gte: startDate }
        })
        .toArray();

      const efficiency = calculateTimeBlockEfficiency(timeBlocks as any);

      // Habit consistency
      const habitsCollection = db.collection(COLLECTIONS.HABITS);
      const completionsCollection = db.collection(COLLECTIONS.HABIT_COMPLETIONS);

      const activeHabits = await habitsCollection
        .find({ userId: user.id, isActive: true, isDeleted: false })
        .toArray();

      const habitStats = await Promise.all(
        activeHabits.map(async (habit: any) => {
          const completions = await completionsCollection
            .find({
              habitId: habit.id,
              date: { $gte: startDate }
            })
            .toArray();

          const expectedCompletions = period === 'week' ? 7 : period === 'month' ? 30 : 90;
          const consistency = (completions.length / expectedCompletions) * 100;

          return {
            habitId: habit.id,
            habitName: habit.name,
            completions: completions.length,
            consistency: Math.round(consistency)
          };
        })
      );

      const avgHabitConsistency = habitStats.length > 0
        ? habitStats.reduce((sum, h) => sum + h.consistency, 0) / habitStats.length
        : 0;

      return {
        period,
        taskCompletionRate: Math.round(completionRate),
        timeBlockingEfficiency: efficiency,
        habitConsistency: Math.round(avgHabitConsistency),
        taskStats: {
          total: allTasks.length,
          completed: completedTasks.length,
          inProgress: allTasks.filter((t: any) => t.status === 'in_progress').length,
          overdue: allTasks.filter((t: any) =>
            t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
          ).length
        },
        habitStats
      };
    } catch (error) {
      logger.error('Error generating productivity insights:', error);
      return reply.status(500).send({ error: 'Failed to generate productivity insights' });
    }
  });

  // GET /api/schedule/insights/time-patterns - Time usage patterns
  fastify.get('/insights/time-patterns', {
    schema: {
      tags: ['schedule'],
      description: 'Analyze time usage patterns using Neo4j',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const neo4jConnection = getNeo4jConnection();

      // Find most productive time blocks
      const query = `
        MATCH (user:User {id: $userId})-[:SCHEDULED_BY]-(tb:TimeBlock)
        WHERE tb.completed = true AND tb.rating IS NOT NULL
        WITH tb.type as blockType,
             avg(tb.rating) as avgRating,
             count(tb) as blockCount
        RETURN blockType, avgRating, blockCount
        ORDER BY avgRating DESC
        LIMIT 5
      `;

      const result = await neo4jConnection.executeQuery(query, { userId: user.id });

      const patterns = result.records.map(record => ({
        blockType: record.get('blockType'),
        avgRating: record.get('avgRating'),
        blockCount: record.get('blockCount').toNumber()
      }));

      return { patterns };
    } catch (error) {
      logger.error('Error analyzing time patterns:', error);
      return reply.status(500).send({ error: 'Failed to analyze time patterns' });
    }
  });

  // GET /api/schedule/insights/task-dependencies - Task dependency analysis
  fastify.get('/insights/task-dependencies', {
    schema: {
      tags: ['schedule'],
      description: 'Analyze task dependencies and potential bottlenecks',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const neo4jConnection = getNeo4jConnection();

      // Find tasks with most dependencies (potential bottlenecks)
      const query = `
        MATCH (user:User {id: $userId})-[:ASSIGNED_TO]-(task:Task)
        WHERE task.status <> 'completed'
        OPTIONAL MATCH (task)-[:DEPENDS_ON]->(dep:Task)
        WITH task, count(dep) as depCount
        WHERE depCount > 0
        RETURN task.id as taskId,
               task.title as taskTitle,
               task.status as status,
               depCount
        ORDER BY depCount DESC
        LIMIT 10
      `;

      const result = await neo4jConnection.executeQuery(query, { userId: user.id });

      const bottlenecks = result.records.map(record => ({
        taskId: record.get('taskId'),
        taskTitle: record.get('taskTitle'),
        status: record.get('status'),
        dependencyCount: record.get('depCount').toNumber()
      }));

      return { bottlenecks };
    } catch (error) {
      logger.error('Error analyzing task dependencies:', error);
      return reply.status(500).send({ error: 'Failed to analyze task dependencies' });
    }
  });
};

export default scheduleRoutes;
