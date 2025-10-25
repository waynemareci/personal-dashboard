import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { createAuthMiddleware, requirePermission } from '../middleware/auth';
import { getDualDatabaseCoordinator } from '../database/dual-db-coordinator';
import { FinancialTransactionSchema, FinancialAccountSchema } from '../models/financial';
import { logger } from '../utils/logger';

const financialRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const coordinator = getDualDatabaseCoordinator();
  const authMiddleware = createAuthMiddleware();

  // Add authentication to all routes
  fastify.addHook('preHandler', authMiddleware);

  // Financial Transactions
  fastify.get('/transactions', {
    schema: {
      tags: ['financial'],
      description: 'Get user financial transactions',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 50 },
          offset: { type: 'number', default: 0 },
          accountId: { type: 'string' },
          categoryId: { type: 'string' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            transactions: { type: 'array' },
            total: { type: 'number' },
            hasMore: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { limit = 50, offset = 0, accountId, categoryId, startDate, endDate } = request.query as any;

      // Build query filters
      const filters: any = { userId: user.id, isDeleted: false };
      if (accountId) filters.accountId = accountId;
      if (categoryId) filters.categoryId = categoryId;
      if (startDate || endDate) {
        filters.date = {};
        if (startDate) filters.date.$gte = new Date(startDate);
        if (endDate) filters.date.$lte = new Date(endDate);
      }

      // TODO: Implement actual database query
      // For now, return mock data
      const transactions = [];
      const total = 0;

      return {
        transactions,
        total,
        hasMore: offset + limit < total
      };
    } catch (error) {
      logger.error('Error fetching financial transactions:', error);
      return reply.status(500).send({ error: 'Failed to fetch transactions' });
    }
  });

  fastify.post('/transactions', {
    schema: {
      tags: ['financial'],
      description: 'Create a new financial transaction',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          accountId: { type: 'string' },
          amount: { type: 'number' },
          currency: { type: 'string', default: 'USD' },
          description: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          categoryId: { type: 'string' },
          subcategoryId: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          location: { type: 'string' },
          notes: { type: 'string' }
        },
        required: ['amount', 'description', 'date']
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
      const transactionData = request.body as any;

      // Add user context
      transactionData.userId = user.id;

      const result = await coordinator.createEntity(
        'financial_transactions',
        transactionData,
        ['Transaction', 'Financial'],
        {
          domain: 'financial',
          type: 'transaction',
          ...transactionData
        },
        [
          {
            type: 'BELONGS_TO',
            targetNodeId: user.id,
            targetLabels: ['User'],
            direction: 'outgoing'
          },
          {
            type: 'FROM_ACCOUNT',
            targetNodeId: transactionData.accountId,
            targetLabels: ['Account'],
            direction: 'outgoing'
          }
        ]
      );

      if (result.success && result.entityId) {
        // Broadcast sync event
        const syncManager = (fastify as any).syncManager;
        if (syncManager) {
          syncManager.broadcastSyncEvent({
            type: 'data_change',
            domain: 'financial',
            action: 'create',
            entityId: result.entityId,
            entityType: 'transaction',
            data: { ...transactionData, id: result.entityId },
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
          error: 'Failed to create transaction',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error creating financial transaction:', error);
      return reply.status(500).send({ error: 'Failed to create transaction' });
    }
  });

  fastify.put('/transactions/:id', {
    preHandler: [requirePermission('financial:write')],
    schema: {
      tags: ['financial'],
      description: 'Update a financial transaction',
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
          accountId: { type: 'string' },
          amount: { type: 'number' },
          currency: { type: 'string' },
          description: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          categoryId: { type: 'string' },
          subcategoryId: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          location: { type: 'string' },
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
        'financial_transactions',
        id,
        updateData,
        {
          domain: 'financial',
          type: 'transaction',
          ...updateData
        }
      );

      if (result.success) {
        // Broadcast sync event
        const syncManager = (fastify as any).syncManager;
        if (syncManager) {
          syncManager.broadcastSyncEvent({
            type: 'data_change',
            domain: 'financial',
            action: 'update',
            entityId: id,
            entityType: 'transaction',
            data: updateData,
            timestamp: new Date().toISOString(),
            userId: user.id,
            source: 'api'
          });
        }

        return { success: true };
      } else {
        reply.status(500).send({
          error: 'Failed to update transaction',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error updating financial transaction:', error);
      return reply.status(500).send({ error: 'Failed to update transaction' });
    }
  });

  fastify.delete('/transactions/:id', {
    preHandler: [requirePermission('financial:delete')],
    schema: {
      tags: ['financial'],
      description: 'Delete a financial transaction',
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

      const result = await coordinator.deleteEntity('financial_transactions', id);

      if (result.success) {
        // Broadcast sync event
        const syncManager = (fastify as any).syncManager;
        if (syncManager) {
          syncManager.broadcastSyncEvent({
            type: 'data_change',
            domain: 'financial',
            action: 'delete',
            entityId: id,
            entityType: 'transaction',
            timestamp: new Date().toISOString(),
            userId: user.id,
            source: 'api'
          });
        }

        return { success: true };
      } else {
        reply.status(500).send({
          error: 'Failed to delete transaction',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error deleting financial transaction:', error);
      return reply.status(500).send({ error: 'Failed to delete transaction' });
    }
  });

  // Financial Accounts
  fastify.get('/accounts', {
    schema: {
      tags: ['financial'],
      description: 'Get user financial accounts',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            accounts: { type: 'array' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      
      // TODO: Implement actual database query
      const accounts = [];

      return { accounts };
    } catch (error) {
      logger.error('Error fetching financial accounts:', error);
      return reply.status(500).send({ error: 'Failed to fetch accounts' });
    }
  });

  fastify.post('/accounts', {
    schema: {
      tags: ['financial'],
      description: 'Create a new financial account',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['checking', 'savings', 'credit', 'investment', 'loan'] },
          institution: { type: 'string' },
          accountNumber: { type: 'string' },
          currency: { type: 'string', default: 'USD' },
          initialBalance: { type: 'number', default: 0 },
          isActive: { type: 'boolean', default: true }
        },
        required: ['name', 'type', 'institution']
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
      const accountData = request.body as any;

      accountData.userId = user.id;

      const result = await coordinator.createEntity(
        'financial_accounts',
        accountData,
        ['Account', 'Financial'],
        {
          domain: 'financial',
          type: 'account',
          ...accountData
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
          error: 'Failed to create account',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error creating financial account:', error);
      return reply.status(500).send({ error: 'Failed to create account' });
    }
  });
};

export default financialRoutes;