import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { createAuthMiddleware, requirePermission } from '../middleware/auth';
import { getDualDatabaseCoordinator } from '../database/dual-db-coordinator';
import { getMongoDBConnection } from '../database/mongodb';
import { getNeo4jConnection } from '../database/neo4j';
import {
  FinancialTransactionSchema,
  FinancialAccountSchema,
  MonthlyBudgetSchema,
  FinancialGoalSchema,
  TransactionCategorySchema,
  CreateFinancialTransactionSchema,
  CreateFinancialAccountSchema,
  CreateMonthlyBudgetSchema,
  CreateFinancialGoalSchema
} from '../models/financial';
import { COLLECTIONS } from '../database/collections';
import { logger } from '../utils/logger';
import { z } from 'zod';

const financialRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const coordinator = getDualDatabaseCoordinator();
  const authMiddleware = createAuthMiddleware();

  // Add authentication to all routes
  fastify.addHook('preHandler', authMiddleware);

  // ===================================
  // FINANCIAL TRANSACTIONS
  // ===================================

  // GET /api/financial/transactions - List transactions with filtering
  fastify.get('/transactions', {
    schema: {
      tags: ['financial'],
      description: 'Get user financial transactions with filtering and pagination',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 50, minimum: 1, maximum: 100 },
          offset: { type: 'number', default: 0, minimum: 0 },
          accountId: { type: 'string' },
          categoryId: { type: 'string' },
          type: { type: 'string', enum: ['income', 'expense', 'transfer', 'investment', 'fee'] },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          minAmount: { type: 'number' },
          maxAmount: { type: 'number' },
          search: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            transactions: { type: 'array' },
            total: { type: 'number' },
            hasMore: { type: 'boolean' },
            summary: {
              type: 'object',
              properties: {
                totalIncome: { type: 'number' },
                totalExpenses: { type: 'number' },
                netAmount: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const query = request.query as any;
      const { limit = 50, offset = 0, accountId, categoryId, type, startDate, endDate, minAmount, maxAmount, search } = query;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.FINANCIAL_TRANSACTIONS);

      // Build query filters
      const filters: any = { userId: user.id, isDeleted: false };

      if (accountId) filters.accountId = accountId;
      if (categoryId) filters.categoryId = categoryId;
      if (type) filters.type = type;

      if (startDate || endDate) {
        filters.date = {};
        if (startDate) filters.date.$gte = new Date(startDate);
        if (endDate) filters.date.$lte = new Date(endDate);
      }

      if (minAmount !== undefined || maxAmount !== undefined) {
        filters.amount = {};
        if (minAmount !== undefined) filters.amount.$gte = minAmount;
        if (maxAmount !== undefined) filters.amount.$lte = maxAmount;
      }

      if (search) {
        filters.$or = [
          { description: { $regex: search, $options: 'i' } },
          { 'merchant.name': { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } }
        ];
      }

      // Get total count
      const total = await collection.countDocuments(filters);

      // Get transactions with pagination
      const transactions = await collection
        .find(filters)
        .sort({ date: -1, createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      // Calculate summary
      const summary = await collection.aggregate([
        { $match: filters },
        {
          $group: {
            _id: null,
            totalIncome: {
              $sum: {
                $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
              }
            },
            totalExpenses: {
              $sum: {
                $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
              }
            }
          }
        }
      ]).toArray();

      const summaryData = summary[0] || { totalIncome: 0, totalExpenses: 0 };
      summaryData.netAmount = summaryData.totalIncome - summaryData.totalExpenses;

      return {
        transactions,
        total,
        hasMore: offset + limit < total,
        summary: summaryData
      };
    } catch (error) {
      logger.error('Error fetching financial transactions:', error);
      return reply.status(500).send({ error: 'Failed to fetch transactions' });
    }
  });

  // POST /api/financial/transactions - Create transaction
  fastify.post('/transactions', {
    schema: {
      tags: ['financial'],
      description: 'Create a new financial transaction',
      security: [{ bearerAuth: [] }],
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
      const transactionData = CreateFinancialTransactionSchema.parse(request.body);

      // Add user context
      const fullData = {
        ...transactionData,
        userId: user.id,
        date: new Date(transactionData.date),
        postedDate: transactionData.postedDate ? new Date(transactionData.postedDate) : undefined
      };

      // Build Neo4j relationships
      const relationships = [
        {
          type: 'BELONGS_TO',
          targetNodeId: user.id,
          targetLabels: ['User'],
          direction: 'outgoing' as const
        },
        {
          type: 'FROM_ACCOUNT',
          targetNodeId: transactionData.accountId,
          targetLabels: ['Account'],
          direction: 'outgoing' as const
        }
      ];

      // Add category relationship if provided
      if (transactionData.categoryId) {
        relationships.push({
          type: 'CATEGORIZED_AS',
          targetNodeId: transactionData.categoryId,
          targetLabels: ['Category'],
          direction: 'outgoing' as const
        });
      }

      const result = await coordinator.createEntity(
        COLLECTIONS.FINANCIAL_TRANSACTIONS,
        fullData,
        ['Transaction', 'Financial'],
        {
          domain: 'financial',
          type: 'transaction',
          transactionType: transactionData.type,
          amount: transactionData.amount,
          currency: transactionData.currency || 'USD'
        },
        relationships
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
            data: { ...fullData, id: result.entityId },
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
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Validation error',
          details: error.errors
        });
      }
      logger.error('Error creating financial transaction:', error);
      return reply.status(500).send({ error: 'Failed to create transaction' });
    }
  });

  // PUT /api/financial/transactions/:id - Update transaction
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

      // Parse dates if provided
      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }
      if (updateData.postedDate) {
        updateData.postedDate = new Date(updateData.postedDate);
      }

      const result = await coordinator.updateEntity(
        COLLECTIONS.FINANCIAL_TRANSACTIONS,
        id,
        updateData,
        {
          domain: 'financial',
          type: 'transaction',
          transactionType: updateData.type,
          amount: updateData.amount,
          currency: updateData.currency
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

  // DELETE /api/financial/transactions/:id - Delete transaction
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

      const result = await coordinator.deleteEntity(COLLECTIONS.FINANCIAL_TRANSACTIONS, id);

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

  // GET /api/financial/expenses - Get expenses (convenience endpoint)
  fastify.get('/expenses', {
    schema: {
      tags: ['financial'],
      description: 'Get user expenses',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 50 },
          offset: { type: 'number', default: 0 },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' }
        }
      }
    }
  }, async (request, reply) => {
    // Forward to transactions endpoint with type filter
    const query = request.query as any;
    query.type = 'expense';
    request.query = query;
    return fastify.inject({
      method: 'GET',
      url: '/api/financial/transactions',
      query: query,
      headers: request.headers
    }).then(res => res.body);
  });

  // POST /api/financial/expenses - Create expense (convenience endpoint)
  fastify.post('/expenses', {
    schema: {
      tags: ['financial'],
      description: 'Create an expense',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const body = { ...request.body, type: 'expense' };
    return fastify.inject({
      method: 'POST',
      url: '/api/financial/transactions',
      payload: body,
      headers: request.headers
    }).then(res => {
      reply.status(res.statusCode);
      return res.body;
    });
  });

  // ===================================
  // FINANCIAL ACCOUNTS
  // ===================================

  // GET /api/financial/accounts - List accounts
  fastify.get('/accounts', {
    schema: {
      tags: ['financial'],
      description: 'Get user financial accounts',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            accounts: { type: 'array' },
            totalBalance: { type: 'number' },
            totalAssets: { type: 'number' },
            totalLiabilities: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.FINANCIAL_ACCOUNTS);

      const accounts = await collection
        .find({ userId: user.id, isDeleted: false })
        .sort({ createdAt: -1 })
        .toArray();

      // Calculate totals
      let totalAssets = 0;
      let totalLiabilities = 0;

      accounts.forEach((account: any) => {
        const balance = account.balance || 0;
        if (['checking', 'savings', 'investment'].includes(account.type)) {
          totalAssets += balance;
        } else if (['credit_card', 'loan', 'mortgage'].includes(account.type)) {
          totalLiabilities += Math.abs(balance);
        }
      });

      return {
        accounts,
        totalBalance: totalAssets - totalLiabilities,
        totalAssets,
        totalLiabilities
      };
    } catch (error) {
      logger.error('Error fetching financial accounts:', error);
      return reply.status(500).send({ error: 'Failed to fetch accounts' });
    }
  });

  // POST /api/financial/accounts - Create account
  fastify.post('/accounts', {
    schema: {
      tags: ['financial'],
      description: 'Create a new financial account',
      security: [{ bearerAuth: [] }],
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
      const accountData = CreateFinancialAccountSchema.parse(request.body);

      const fullData = {
        ...accountData,
        userId: user.id
      };

      const result = await coordinator.createEntity(
        COLLECTIONS.FINANCIAL_ACCOUNTS,
        fullData,
        ['Account', 'Financial'],
        {
          domain: 'financial',
          type: 'account',
          accountType: accountData.type,
          currency: accountData.currency || 'USD'
        },
        [
          {
            type: 'OWNS',
            targetNodeId: user.id,
            targetLabels: ['User'],
            direction: 'incoming' as const
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
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Validation error',
          details: error.errors
        });
      }
      logger.error('Error creating financial account:', error);
      return reply.status(500).send({ error: 'Failed to create account' });
    }
  });

  // PUT /api/financial/accounts/:id - Update account
  fastify.put('/accounts/:id', {
    preHandler: [requirePermission('financial:write')],
    schema: {
      tags: ['financial'],
      description: 'Update a financial account',
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

      const result = await coordinator.updateEntity(
        COLLECTIONS.FINANCIAL_ACCOUNTS,
        id,
        updateData,
        {
          domain: 'financial',
          type: 'account',
          accountType: updateData.type
        }
      );

      if (result.success) {
        return { success: true };
      } else {
        reply.status(500).send({
          error: 'Failed to update account',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error updating financial account:', error);
      return reply.status(500).send({ error: 'Failed to update account' });
    }
  });

  // DELETE /api/financial/accounts/:id - Delete account
  fastify.delete('/accounts/:id', {
    preHandler: [requirePermission('financial:delete')],
    schema: {
      tags: ['financial'],
      description: 'Delete a financial account',
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

      const result = await coordinator.deleteEntity(COLLECTIONS.FINANCIAL_ACCOUNTS, id);

      if (result.success) {
        return { success: true };
      } else {
        reply.status(500).send({
          error: 'Failed to delete account',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error deleting financial account:', error);
      return reply.status(500).send({ error: 'Failed to delete account' });
    }
  });

  // ===================================
  // BUDGETS
  // ===================================

  // GET /api/financial/budgets - List budgets
  fastify.get('/budgets', {
    schema: {
      tags: ['financial'],
      description: 'Get user monthly budgets',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          year: { type: 'number' },
          month: { type: 'number', minimum: 1, maximum: 12 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { year, month } = request.query as any;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.MONTHLY_BUDGETS);

      const filters: any = { userId: user.id, isDeleted: false };
      if (year) filters.year = year;
      if (month) filters.month = month;

      const budgets = await collection
        .find(filters)
        .sort({ year: -1, month: -1 })
        .toArray();

      return { budgets };
    } catch (error) {
      logger.error('Error fetching budgets:', error);
      return reply.status(500).send({ error: 'Failed to fetch budgets' });
    }
  });

  // POST /api/financial/budgets - Create budget
  fastify.post('/budgets', {
    schema: {
      tags: ['financial'],
      description: 'Create a monthly budget',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const budgetData = CreateMonthlyBudgetSchema.parse(request.body);

      const fullData = {
        ...budgetData,
        userId: user.id
      };

      const result = await coordinator.createEntity(
        COLLECTIONS.MONTHLY_BUDGETS,
        fullData,
        ['Budget', 'Financial'],
        {
          domain: 'financial',
          type: 'budget',
          year: budgetData.year,
          month: budgetData.month
        },
        [
          {
            type: 'BELONGS_TO',
            targetNodeId: user.id,
            targetLabels: ['User'],
            direction: 'outgoing' as const
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
          error: 'Failed to create budget',
          details: result.error?.message
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Validation error',
          details: error.errors
        });
      }
      logger.error('Error creating budget:', error);
      return reply.status(500).send({ error: 'Failed to create budget' });
    }
  });

  // PUT /api/financial/budgets/:id - Update budget
  fastify.put('/budgets/:id', {
    preHandler: [requirePermission('financial:write')],
    schema: {
      tags: ['financial'],
      description: 'Update a monthly budget',
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

      const result = await coordinator.updateEntity(
        COLLECTIONS.MONTHLY_BUDGETS,
        id,
        updateData,
        {
          domain: 'financial',
          type: 'budget'
        }
      );

      if (result.success) {
        return { success: true };
      } else {
        reply.status(500).send({
          error: 'Failed to update budget',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error updating budget:', error);
      return reply.status(500).send({ error: 'Failed to update budget' });
    }
  });

  // DELETE /api/financial/budgets/:id - Delete budget
  fastify.delete('/budgets/:id', {
    preHandler: [requirePermission('financial:delete')],
    schema: {
      tags: ['financial'],
      description: 'Delete a monthly budget',
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

      const result = await coordinator.deleteEntity(COLLECTIONS.MONTHLY_BUDGETS, id);

      if (result.success) {
        return { success: true };
      } else {
        reply.status(500).send({
          error: 'Failed to delete budget',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error deleting budget:', error);
      return reply.status(500).send({ error: 'Failed to delete budget' });
    }
  });

  // GET /api/financial/budgets/:id/status - Get budget status with alerts
  fastify.get('/budgets/:id/status', {
    schema: {
      tags: ['financial'],
      description: 'Get budget status with overspend alerts',
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

      // Get budget
      const budgetCollection = db.collection(COLLECTIONS.MONTHLY_BUDGETS);
      const budget = await budgetCollection.findOne({ id, userId: user.id, isDeleted: false });

      if (!budget) {
        return reply.status(404).send({ error: 'Budget not found' });
      }

      // Calculate actual spending for each category
      const transactionCollection = db.collection(COLLECTIONS.FINANCIAL_TRANSACTIONS);
      const startDate = new Date(budget.year, budget.month - 1, 1);
      const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59);

      const spendingByCategory = await transactionCollection.aggregate([
        {
          $match: {
            userId: user.id,
            type: 'expense',
            date: { $gte: startDate, $lte: endDate },
            isDeleted: false
          }
        },
        {
          $group: {
            _id: '$categoryId',
            spent: { $sum: '$amount' }
          }
        }
      ]).toArray();

      // Build spending map
      const spendingMap = new Map();
      spendingByCategory.forEach((item: any) => {
        spendingMap.set(item._id, item.spent);
      });

      // Check for overspending and build alerts
      const alerts = [];
      const categoryStatus = budget.categories.map((cat: any) => {
        const spent = spendingMap.get(cat.categoryId) || 0;
        const remaining = cat.budgeted - spent;
        const percentUsed = (spent / cat.budgeted) * 100;

        const status = {
          categoryId: cat.categoryId,
          budgeted: cat.budgeted,
          spent,
          remaining,
          percentUsed,
          isOverspent: remaining < 0,
          isNearLimit: percentUsed >= 80 && percentUsed < 100
        };

        if (status.isOverspent) {
          alerts.push({
            severity: 'high',
            type: 'overspend',
            categoryId: cat.categoryId,
            message: `Overspent by ${Math.abs(remaining).toFixed(2)} in this category`,
            amount: Math.abs(remaining)
          });
        } else if (status.isNearLimit) {
          alerts.push({
            severity: 'medium',
            type: 'near_limit',
            categoryId: cat.categoryId,
            message: `${percentUsed.toFixed(0)}% of budget used`,
            percentUsed
          });
        }

        return status;
      });

      // Calculate overall budget status
      const totalBudgeted = budget.totalBudgeted || 0;
      const totalSpent = Array.from(spendingMap.values()).reduce((sum: number, val: number) => sum + val, 0);
      const totalRemaining = totalBudgeted - totalSpent;

      return {
        budget: {
          id: budget.id,
          year: budget.year,
          month: budget.month,
          totalBudgeted,
          totalSpent,
          totalRemaining,
          percentUsed: (totalSpent / totalBudgeted) * 100
        },
        categoryStatus,
        alerts,
        summary: {
          categoriesOverspent: alerts.filter(a => a.type === 'overspend').length,
          categoriesNearLimit: alerts.filter(a => a.type === 'near_limit').length,
          isOverallOverspent: totalRemaining < 0
        }
      };
    } catch (error) {
      logger.error('Error fetching budget status:', error);
      return reply.status(500).send({ error: 'Failed to fetch budget status' });
    }
  });

  // ===================================
  // FINANCIAL GOALS
  // ===================================

  // GET /api/financial/goals - List financial goals
  fastify.get('/goals', {
    schema: {
      tags: ['financial'],
      description: 'Get user financial goals',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['active', 'completed', 'paused', 'cancelled'] },
          type: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { status, type } = request.query as any;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.FINANCIAL_GOALS);

      const filters: any = { userId: user.id, isDeleted: false };
      if (status) filters.status = status;
      if (type) filters.type = type;

      const goals = await collection
        .find(filters)
        .sort({ priority: -1, createdAt: -1 })
        .toArray();

      // Calculate progress for each goal
      const goalsWithProgress = goals.map((goal: any) => {
        const progress = goal.targetAmount > 0
          ? (goal.currentAmount / goal.targetAmount) * 100
          : 0;

        return {
          ...goal,
          progress: Math.min(progress, 100),
          amountRemaining: Math.max(goal.targetAmount - goal.currentAmount, 0)
        };
      });

      return { goals: goalsWithProgress };
    } catch (error) {
      logger.error('Error fetching financial goals:', error);
      return reply.status(500).send({ error: 'Failed to fetch goals' });
    }
  });

  // POST /api/financial/goals - Create financial goal
  fastify.post('/goals', {
    schema: {
      tags: ['financial'],
      description: 'Create a financial goal',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const goalData = CreateFinancialGoalSchema.parse(request.body);

      const fullData = {
        ...goalData,
        userId: user.id,
        targetDate: goalData.targetDate ? new Date(goalData.targetDate) : undefined
      };

      const result = await coordinator.createEntity(
        COLLECTIONS.FINANCIAL_GOALS,
        fullData,
        ['Goal', 'Financial'],
        {
          domain: 'financial',
          type: 'goal',
          goalType: goalData.type,
          status: goalData.status || 'active'
        },
        [
          {
            type: 'BELONGS_TO',
            targetNodeId: user.id,
            targetLabels: ['User'],
            direction: 'outgoing' as const
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
          error: 'Failed to create goal',
          details: result.error?.message
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Validation error',
          details: error.errors
        });
      }
      logger.error('Error creating financial goal:', error);
      return reply.status(500).send({ error: 'Failed to create goal' });
    }
  });

  // PUT /api/financial/goals/:id - Update financial goal
  fastify.put('/goals/:id', {
    preHandler: [requirePermission('financial:write')],
    schema: {
      tags: ['financial'],
      description: 'Update a financial goal',
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

      const result = await coordinator.updateEntity(
        COLLECTIONS.FINANCIAL_GOALS,
        id,
        updateData,
        {
          domain: 'financial',
          type: 'goal'
        }
      );

      if (result.success) {
        return { success: true };
      } else {
        reply.status(500).send({
          error: 'Failed to update goal',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error updating financial goal:', error);
      return reply.status(500).send({ error: 'Failed to update goal' });
    }
  });

  // DELETE /api/financial/goals/:id - Delete financial goal
  fastify.delete('/goals/:id', {
    preHandler: [requirePermission('financial:delete')],
    schema: {
      tags: ['financial'],
      description: 'Delete a financial goal',
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

      const result = await coordinator.deleteEntity(COLLECTIONS.FINANCIAL_GOALS, id);

      if (result.success) {
        return { success: true };
      } else {
        reply.status(500).send({
          error: 'Failed to delete goal',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error deleting financial goal:', error);
      return reply.status(500).send({ error: 'Failed to delete goal' });
    }
  });

  // ===================================
  // CATEGORIES
  // ===================================

  // GET /api/financial/categories - List categories
  fastify.get('/categories', {
    schema: {
      tags: ['financial'],
      description: 'Get transaction categories',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.CATEGORIES);

      // Get both system and user categories
      const categories = await collection
        .find({
          $or: [
            { isSystem: true },
            { userId: user.id }
          ],
          isDeleted: false
        })
        .sort({ name: 1 })
        .toArray();

      return { categories };
    } catch (error) {
      logger.error('Error fetching categories:', error);
      return reply.status(500).send({ error: 'Failed to fetch categories' });
    }
  });

  // POST /api/financial/categories - Create category
  fastify.post('/categories', {
    schema: {
      tags: ['financial'],
      description: 'Create a transaction category',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          color: { type: 'string', pattern: '^#[0-9A-F]{6}$' },
          icon: { type: 'string' },
          parentId: { type: 'string' }
        },
        required: ['name', 'color', 'icon']
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const categoryData = request.body as any;

      const fullData = {
        ...categoryData,
        userId: user.id,
        isSystem: false
      };

      const result = await coordinator.createEntity(
        COLLECTIONS.CATEGORIES,
        fullData,
        ['Category', 'Financial'],
        {
          domain: 'financial',
          type: 'category'
        },
        [
          {
            type: 'BELONGS_TO',
            targetNodeId: user.id,
            targetLabels: ['User'],
            direction: 'outgoing' as const
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
          error: 'Failed to create category',
          details: result.error?.message
        });
      }
    } catch (error) {
      logger.error('Error creating category:', error);
      return reply.status(500).send({ error: 'Failed to create category' });
    }
  });

  // POST /api/financial/categories/suggest - AI-powered category suggestion
  fastify.post('/categories/suggest', {
    schema: {
      tags: ['financial'],
      description: 'Get AI-powered category suggestions for a transaction',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          description: { type: 'string' },
          merchant: { type: 'string' },
          amount: { type: 'number' }
        },
        required: ['description']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  categoryId: { type: 'string' },
                  categoryName: { type: 'string' },
                  confidence: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { description, merchant, amount } = request.body as any;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();

      // Get user's historical transaction patterns
      const transactionCollection = db.collection(COLLECTIONS.FINANCIAL_TRANSACTIONS);
      const historicalData = await transactionCollection.aggregate([
        {
          $match: {
            userId: user.id,
            categoryId: { $exists: true, $ne: null },
            isDeleted: false
          }
        },
        {
          $group: {
            _id: {
              categoryId: '$categoryId',
              description: '$description'
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 100
        }
      ]).toArray();

      // Simple keyword matching algorithm
      const descLower = description.toLowerCase();
      const merchantLower = (merchant || '').toLowerCase();

      const categoryScores = new Map();

      // Score based on historical patterns
      historicalData.forEach((item: any) => {
        const histDesc = (item._id.description || '').toLowerCase();
        const categoryId = item._id.categoryId;

        // Check for keyword matches
        const descWords = descLower.split(/\s+/);
        const histWords = histDesc.split(/\s+/);

        let matchScore = 0;
        descWords.forEach(word => {
          if (word.length > 3 && histWords.includes(word)) {
            matchScore += 1;
          }
        });

        if (matchScore > 0) {
          const currentScore = categoryScores.get(categoryId) || 0;
          categoryScores.set(categoryId, currentScore + matchScore * item.count);
        }
      });

      // Get category details
      const categoryCollection = db.collection(COLLECTIONS.CATEGORIES);
      const sortedCategories = Array.from(categoryScores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const suggestions = [];
      for (const [categoryId, score] of sortedCategories) {
        const category = await categoryCollection.findOne({ id: categoryId });
        if (category) {
          suggestions.push({
            categoryId: category.id,
            categoryName: category.name,
            confidence: Math.min(score / 10, 1.0) // Normalize to 0-1
          });
        }
      }

      // If no matches found, return default categories based on common patterns
      if (suggestions.length === 0) {
        const keywords = {
          'grocery': ['grocery', 'supermarket', 'food', 'walmart', 'target'],
          'restaurant': ['restaurant', 'cafe', 'coffee', 'dining'],
          'gas': ['gas', 'fuel', 'shell', 'exxon', 'chevron'],
          'utilities': ['utility', 'electric', 'water', 'internet'],
          'entertainment': ['movie', 'theater', 'netflix', 'spotify']
        };

        for (const [catType, words] of Object.entries(keywords)) {
          if (words.some(word => descLower.includes(word) || merchantLower.includes(word))) {
            const category = await categoryCollection.findOne({
              name: new RegExp(catType, 'i'),
              isSystem: true
            });
            if (category) {
              suggestions.push({
                categoryId: category.id,
                categoryName: category.name,
                confidence: 0.7
              });
              break;
            }
          }
        }
      }

      return { suggestions };
    } catch (error) {
      logger.error('Error suggesting categories:', error);
      return reply.status(500).send({ error: 'Failed to suggest categories' });
    }
  });

  // ===================================
  // FINANCIAL INSIGHTS & ANALYTICS
  // ===================================

  // GET /api/financial/insights/spending-patterns - Analyze spending patterns
  fastify.get('/insights/spending-patterns', {
    schema: {
      tags: ['financial', 'insights'],
      description: 'Get spending pattern analysis across categories and time',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          groupBy: { type: 'string', enum: ['day', 'week', 'month', 'category'], default: 'month' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { startDate, endDate, groupBy = 'month' } = request.query as any;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.FINANCIAL_TRANSACTIONS);

      const filters: any = {
        userId: user.id,
        type: 'expense',
        isDeleted: false
      };

      if (startDate || endDate) {
        filters.date = {};
        if (startDate) filters.date.$gte = new Date(startDate);
        if (endDate) filters.date.$lte = new Date(endDate);
      }

      // Aggregate spending patterns
      let groupStage: any;

      switch (groupBy) {
        case 'day':
          groupStage = {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          };
          break;
        case 'week':
          groupStage = {
            year: { $year: '$date' },
            week: { $week: '$date' }
          };
          break;
        case 'month':
          groupStage = {
            year: { $year: '$date' },
            month: { $month: '$date' }
          };
          break;
        case 'category':
          groupStage = {
            categoryId: '$categoryId'
          };
          break;
      }

      const patterns = await collection.aggregate([
        { $match: filters },
        {
          $group: {
            _id: groupStage,
            totalSpent: { $sum: '$amount' },
            transactionCount: { $sum: 1 },
            avgTransaction: { $avg: '$amount' }
          }
        },
        {
          $sort: groupBy === 'category' ? { totalSpent: -1 } : { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ]).toArray();

      // Get top merchants
      const topMerchants = await collection.aggregate([
        { $match: filters },
        {
          $group: {
            _id: '$merchant.name',
            totalSpent: { $sum: '$amount' },
            transactionCount: { $sum: 1 }
          }
        },
        { $match: { _id: { $ne: null } } },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 }
      ]).toArray();

      return {
        patterns,
        topMerchants,
        summary: {
          totalExpenses: patterns.reduce((sum, p) => sum + p.totalSpent, 0),
          totalTransactions: patterns.reduce((sum, p) => sum + p.transactionCount, 0),
          avgExpense: patterns.length > 0
            ? patterns.reduce((sum, p) => sum + p.totalSpent, 0) / patterns.length
            : 0
        }
      };
    } catch (error) {
      logger.error('Error analyzing spending patterns:', error);
      return reply.status(500).send({ error: 'Failed to analyze spending patterns' });
    }
  });

  // GET /api/financial/insights/category-breakdown - Category spending analysis
  fastify.get('/insights/category-breakdown', {
    schema: {
      tags: ['financial', 'insights'],
      description: 'Get spending breakdown by category',
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
      const transactionCollection = db.collection(COLLECTIONS.FINANCIAL_TRANSACTIONS);
      const categoryCollection = db.collection(COLLECTIONS.CATEGORIES);

      const filters: any = {
        userId: user.id,
        type: 'expense',
        isDeleted: false
      };

      if (startDate || endDate) {
        filters.date = {};
        if (startDate) filters.date.$gte = new Date(startDate);
        if (endDate) filters.date.$lte = new Date(endDate);
      }

      const categorySpending = await transactionCollection.aggregate([
        { $match: filters },
        {
          $group: {
            _id: '$categoryId',
            totalSpent: { $sum: '$amount' },
            transactionCount: { $sum: 1 },
            avgTransaction: { $avg: '$amount' }
          }
        },
        { $sort: { totalSpent: -1 } }
      ]).toArray();

      // Enrich with category details
      const enriched = await Promise.all(
        categorySpending.map(async (item: any) => {
          const category = await categoryCollection.findOne({ id: item._id });
          return {
            categoryId: item._id,
            categoryName: category?.name || 'Uncategorized',
            color: category?.color,
            totalSpent: item.totalSpent,
            transactionCount: item.transactionCount,
            avgTransaction: item.avgTransaction
          };
        })
      );

      const totalSpent = enriched.reduce((sum, item) => sum + item.totalSpent, 0);

      // Add percentage
      const withPercentage = enriched.map(item => ({
        ...item,
        percentage: totalSpent > 0 ? (item.totalSpent / totalSpent) * 100 : 0
      }));

      return {
        categories: withPercentage,
        totalSpent,
        totalTransactions: enriched.reduce((sum, item) => sum + item.transactionCount, 0)
      };
    } catch (error) {
      logger.error('Error analyzing category breakdown:', error);
      return reply.status(500).send({ error: 'Failed to analyze category breakdown' });
    }
  });

  // GET /api/financial/net-worth - Calculate net worth
  fastify.get('/net-worth', {
    schema: {
      tags: ['financial'],
      description: 'Calculate user net worth from all accounts',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            netWorth: { type: 'number' },
            totalAssets: { type: 'number' },
            totalLiabilities: { type: 'number' },
            breakdown: {
              type: 'object',
              properties: {
                cash: { type: 'number' },
                investments: { type: 'number' },
                debts: { type: 'number' }
              }
            },
            accounts: { type: 'array' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.FINANCIAL_ACCOUNTS);

      const accounts = await collection
        .find({ userId: user.id, isActive: true, isDeleted: false })
        .toArray();

      let cash = 0;
      let investments = 0;
      let debts = 0;

      const accountBreakdown = accounts.map((account: any) => {
        const balance = account.balance || 0;

        switch (account.type) {
          case 'checking':
          case 'savings':
            cash += balance;
            break;
          case 'investment':
            investments += balance;
            break;
          case 'credit_card':
          case 'loan':
          case 'mortgage':
            debts += Math.abs(balance);
            break;
        }

        return {
          id: account.id,
          name: account.name,
          type: account.type,
          balance,
          institution: account.institution
        };
      });

      const totalAssets = cash + investments;
      const totalLiabilities = debts;
      const netWorth = totalAssets - totalLiabilities;

      return {
        netWorth,
        totalAssets,
        totalLiabilities,
        breakdown: {
          cash,
          investments,
          debts
        },
        accounts: accountBreakdown
      };
    } catch (error) {
      logger.error('Error calculating net worth:', error);
      return reply.status(500).send({ error: 'Failed to calculate net worth' });
    }
  });

  // GET /api/financial/insights/trends - Get financial trends
  fastify.get('/insights/trends', {
    schema: {
      tags: ['financial', 'insights'],
      description: 'Get financial trends over time',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          months: { type: 'number', default: 6, minimum: 1, maximum: 24 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { months = 6 } = request.query as any;

      const mongoConnection = getMongoDBConnection();
      const db = mongoConnection.getDatabase();
      const collection = db.collection(COLLECTIONS.FINANCIAL_TRANSACTIONS);

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const trends = await collection.aggregate([
        {
          $match: {
            userId: user.id,
            date: { $gte: startDate },
            isDeleted: false
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              type: '$type'
            },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]).toArray();

      // Organize by month
      const monthlyData = new Map();

      trends.forEach((item: any) => {
        const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;

        if (!monthlyData.has(key)) {
          monthlyData.set(key, {
            year: item._id.year,
            month: item._id.month,
            income: 0,
            expenses: 0,
            netAmount: 0
          });
        }

        const data = monthlyData.get(key);
        if (item._id.type === 'income') {
          data.income = item.total;
        } else if (item._id.type === 'expense') {
          data.expenses = item.total;
        }
        data.netAmount = data.income - data.expenses;
      });

      const monthlyTrends = Array.from(monthlyData.values()).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

      return {
        trends: monthlyTrends,
        summary: {
          avgMonthlyIncome: monthlyTrends.reduce((sum, m) => sum + m.income, 0) / monthlyTrends.length || 0,
          avgMonthlyExpenses: monthlyTrends.reduce((sum, m) => sum + m.expenses, 0) / monthlyTrends.length || 0,
          avgMonthlySavings: monthlyTrends.reduce((sum, m) => sum + m.netAmount, 0) / monthlyTrends.length || 0
        }
      };
    } catch (error) {
      logger.error('Error analyzing financial trends:', error);
      return reply.status(500).send({ error: 'Failed to analyze trends' });
    }
  });
};

export default financialRoutes;
