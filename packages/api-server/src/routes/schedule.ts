import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { createAuthMiddleware, requirePermission } from '../middleware/auth';
import { getDualDatabaseCoordinator } from '../database/dual-db-coordinator';
import { TaskSchema, CalendarEventSchema, ProjectSchema } from '../models/schedule';
import { logger } from '../utils/logger';

const scheduleRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const coordinator = getDualDatabaseCoordinator();
  const authMiddleware = createAuthMiddleware();

  // Add authentication to all routes
  fastify.addHook('preHandler', authMiddleware);

  // Tasks
  fastify.get('/tasks', {
    schema: {
      tags: ['schedule'],
      description: 'Get user tasks',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 50 },
          offset: { type: 'number', default: 0 },
          status: { 
            type: 'string',
            enum: ['todo', 'in_progress', 'completed', 'blocked']
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'urgent']
          },
          projectId: { type: 'string' },
          dueDate: { type: 'string', format: 'date' },
          overdue: { type: 'boolean' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            tasks: { type: 'array' },
            total: { type: 'number' },
            hasMore: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { limit = 50, offset = 0, status, priority, projectId, dueDate, overdue } = request.query as any;

      // TODO: Implement actual database query with filters
      const tasks = [];
      const total = 0;

      return {
        tasks,
        total,
        hasMore: offset + limit < total
      };
    } catch (error) {
      logger.error('Error fetching tasks:', error);
      return reply.status(500).send({ error: 'Failed to fetch tasks' });
    }
  });

  fastify.post('/tasks', {
    schema: {
      tags: ['schedule'],
      description: 'Create a new task',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['todo', 'in_progress', 'completed', 'blocked'], default: 'todo' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
          category: { type: 'string', enum: ['work', 'personal', 'health', 'finance', 'learning', 'social', 'household', 'creative', 'travel', 'other'] },
          dueDate: { type: 'string', format: 'date-time' },
          estimatedDuration: { type: 'number' },
          projectId: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          notes: { type: 'string' }
        },
        required: ['title']
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
      const taskData = request.body as any;

      taskData.userId = user.id;

      // Build relationships
      const relationships = [
        {
          type: 'ASSIGNED_TO',
          targetNodeId: user.id,
          targetLabels: ['User'],
          direction: 'outgoing'
        }
      ];

      // Add project relationship if specified
      if (taskData.projectId) {
        relationships.push({
          type: 'BELONGS_TO_PROJECT',
          targetNodeId: taskData.projectId,
          targetLabels: ['Project'],
          direction: 'outgoing'
        });
      }

      const result = await coordinator.createEntity(
        'tasks',
        taskData,
        ['Task', 'Schedule'],
        {
          domain: 'schedule',
          type: 'task',
          ...taskData
        },
        relationships
      );

      if (result.success && result.entityId) {
        // Broadcast sync event
        const syncManager = (fastify as any).syncManager;
        if (syncManager) {
          syncManager.broadcastSyncEvent({
            type: 'data_change',
            domain: 'schedule',
            action: 'create',
            entityId: result.entityId,
            entityType: 'task',
            data: { ...taskData, id: result.entityId },
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
          error: 'Failed to create task',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error creating task:', error);
      return reply.status(500).send({ error: 'Failed to create task' });
    }
  });

  fastify.put('/tasks/:id', {
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
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['todo', 'in_progress', 'completed', 'blocked'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          category: { type: 'string', enum: ['work', 'personal', 'health', 'finance', 'learning', 'social', 'household', 'creative', 'travel', 'other'] },
          dueDate: { type: 'string', format: 'date-time' },
          estimatedDuration: { type: 'number' },
          projectId: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          notes: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { id } = request.params as any;
      const updateData = request.body as any;

      const result = await coordinator.updateEntity(
        'tasks',
        id,
        updateData,
        {
          domain: 'schedule',
          type: 'task',
          ...updateData
        }
      );

      if (result.success) {
        // Broadcast sync event
        const syncManager = (fastify as any).syncManager;
        if (syncManager) {
          syncManager.broadcastSyncEvent({
            type: 'data_change',
            domain: 'schedule',
            action: 'update',
            entityId: id,
            entityType: 'task',
            data: updateData,
            timestamp: new Date().toISOString(),
            userId: user.id,
            source: 'api'
          });
        }

        return { success: true };
      } else {
        reply.status(500).send({
          error: 'Failed to update task',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error updating task:', error);
      return reply.status(500).send({ error: 'Failed to update task' });
    }
  });

  fastify.delete('/tasks/:id', {
    preHandler: [requirePermission('schedule:delete')],
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
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { id } = request.params as any;

      const result = await coordinator.deleteEntity('tasks', id);

      if (result.success) {
        // Broadcast sync event
        const syncManager = (fastify as any).syncManager;
        if (syncManager) {
          syncManager.broadcastSyncEvent({
            type: 'data_change',
            domain: 'schedule',
            action: 'delete',
            entityId: id,
            entityType: 'task',
            timestamp: new Date().toISOString(),
            userId: user.id,
            source: 'api'
          });
        }

        return { success: true };
      } else {
        reply.status(500).send({
          error: 'Failed to delete task',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error deleting task:', error);
      return reply.status(500).send({ error: 'Failed to delete task' });
    }
  });

  // Events
  fastify.get('/events', {
    schema: {
      tags: ['schedule'],
      description: 'Get user events',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 50 },
          offset: { type: 'number', default: 0 },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          type: { 
            type: 'string',
            enum: ['meeting', 'appointment', 'reminder', 'deadline']
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            events: { type: 'array' },
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
      const events = [];
      const total = 0;

      return { events, total, hasMore: false };
    } catch (error) {
      logger.error('Error fetching events:', error);
      return reply.status(500).send({ error: 'Failed to fetch events' });
    }
  });

  fastify.post('/events', {
    schema: {
      tags: ['schedule'],
      description: 'Create a new event',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string', enum: ['meeting', 'appointment', 'deadline', 'reminder', 'birthday', 'holiday', 'vacation', 'conference', 'social', 'personal', 'other'] },
          status: { type: 'string', enum: ['confirmed', 'tentative', 'cancelled', 'no_show'], default: 'confirmed' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          location: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              address: { type: 'string' },
              coordinates: {
                type: 'object',
                properties: {
                  latitude: { type: 'number' },
                  longitude: { type: 'number' }
                }
              }
            }
          },
          isRecurring: { type: 'boolean', default: false },
          tags: { type: 'array', items: { type: 'string' } },
          notes: { type: 'string' }
        },
        required: ['title', 'type', 'startDate', 'endDate']
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
      const eventData = request.body as any;

      eventData.userId = user.id;

      const result = await coordinator.createEntity(
        'events',
        eventData,
        ['Event', 'Schedule'],
        {
          domain: 'schedule',
          type: 'event',
          ...eventData
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
        // Broadcast sync event
        const syncManager = (fastify as any).syncManager;
        if (syncManager) {
          syncManager.broadcastSyncEvent({
            type: 'data_change',
            domain: 'schedule',
            action: 'create',
            entityId: result.entityId,
            entityType: 'event',
            data: { ...eventData, id: result.entityId },
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
          error: 'Failed to create event',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error creating event:', error);
      return reply.status(500).send({ error: 'Failed to create event' });
    }
  });

  // Projects
  fastify.get('/projects', {
    schema: {
      tags: ['schedule'],
      description: 'Get user projects',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            projects: { type: 'array' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      
      // TODO: Implement actual database query
      const projects = [];

      return { projects };
    } catch (error) {
      logger.error('Error fetching projects:', error);
      return reply.status(500).send({ error: 'Failed to fetch projects' });
    }
  });

  fastify.post('/projects', {
    schema: {
      tags: ['schedule'],
      description: 'Create a new project',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string', enum: ['work', 'personal', 'health', 'finance', 'learning', 'social', 'household', 'creative', 'travel', 'other'] },
          status: { type: 'string', enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived'], default: 'planning' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
          startDate: { type: 'string', format: 'date-time' },
          dueDate: { type: 'string', format: 'date-time' },
          progress: { type: 'number', minimum: 0, maximum: 100, default: 0 },
          tags: { type: 'array', items: { type: 'string' } },
          goals: { type: 'array', items: { type: 'string' } }
        },
        required: ['name', 'category']
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
      const projectData = request.body as any;

      projectData.userId = user.id;

      const result = await coordinator.createEntity(
        'projects',
        projectData,
        ['Project', 'Schedule'],
        {
          domain: 'schedule',
          type: 'project',
          ...projectData
        },
        [
          {
            type: 'OWNS',
            targetNodeId: user.id,
            targetLabels: ['User'],
            direction: 'incoming'
          }
        ]
      );

      if (result.success && result.entityId) {
        reply.status(201).send({
          id: result.entityId,
          success: true
        });
      } else {
        reply.status(500).send({
          error: 'Failed to create project',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error creating project:', error);
      return reply.status(500).send({ error: 'Failed to create project' });
    }
  });
};

export default scheduleRoutes;