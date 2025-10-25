import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the root .env file
dotenv.config({ path: resolve(__dirname, '../../../.env') });

import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { initializeNeo4j, closeNeo4jConnection } from './database/neo4j';
import { initializeMongoDB, getMongoDBConnection } from './database/mongodb';
import { getCollectionManager } from './database/collections';
import { getGracefulDegradationService } from './database/graceful-degradation';
import { getDatabaseConfig } from './config/database';
import healthRoutes from './routes/health';
import financialRoutes from './routes/financial';
import healthDataRoutes from './routes/health-data';
import scheduleRoutes from './routes/schedule';
import relationshipsRoutes from './routes/relationships';
import { createSyncManager } from './services/sync-manager';
import { createAuthMiddleware } from './middleware/auth';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    } : undefined
  }
});

// Register security plugins first
fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
});

fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

// Register API documentation
fastify.register(swagger, {
  swagger: {
    info: {
      title: 'Personal Dashboard API',
      description: 'Graph-powered Personal Dashboard with Real-time Synchronization',
      version: '1.0.0'
    },
    host: `localhost:${process.env.API_PORT || 3001}`,
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header'
      }
    },
    tags: [
      { name: 'health', description: 'Health check endpoints' },
      { name: 'auth', description: 'Authentication endpoints' },
      { name: 'financial', description: 'Financial data endpoints' },
      { name: 'health-data', description: 'Health metrics endpoints' },
      { name: 'schedule', description: 'Schedule and tasks endpoints' },
      { name: 'relationships', description: 'Knowledge graph relationships' },
      { name: 'websocket', description: 'WebSocket endpoints' },
      { name: 'admin', description: 'Admin endpoints' }
    ]
  }
});

fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  }
});

// Register CORS
fastify.register(cors, {
  origin: process.env.NODE_ENV === 'development' ? true : [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173'
  ],
  credentials: true
});

// Register JWT
fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production-this-should-be-a-long-random-string'
});

// Register WebSocket
fastify.register(websocket);

// Initialize sync manager (this will register WebSocket routes)
let syncManager: any;

// Register health routes (system health checks)
fastify.register(healthRoutes);

// Register domain-specific API routes
fastify.register(financialRoutes, { prefix: '/api/financial' });
fastify.register(healthDataRoutes, { prefix: '/api/health' });
fastify.register(scheduleRoutes, { prefix: '/api/schedule' });
fastify.register(relationshipsRoutes, { prefix: '/api/relationships' });

// Auth routes
fastify.register(async function (fastify) {
  fastify.post('/auth/login', {
    schema: {
      tags: ['auth'],
      description: 'Login with email and password',
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        },
        required: ['email', 'password']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            refreshToken: { type: 'string' },
            user: { type: 'object' }
          }
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    // TODO: Implement actual authentication logic
    const { email, password } = request.body as any;
    
    // Mock authentication for development
    if (email && password) {
      const token = fastify.jwt.sign({
        sub: 'user_123',
        email,
        role: 'user',
        permissions: ['financial:read', 'financial:write', 'health:read', 'health:write', 'schedule:read', 'schedule:write']
      });

      return {
        token,
        refreshToken: 'refresh_' + token,
        user: {
          id: 'user_123',
          email,
          role: 'user'
        }
      };
    }

    return reply.status(401).send({ error: 'Invalid credentials' });
  });

  fastify.post('/auth/refresh', {
    schema: {
      tags: ['auth'],
      description: 'Refresh authentication token',
      body: {
        type: 'object',
        properties: {
          refreshToken: { type: 'string' }
        },
        required: ['refreshToken']
      }
    }
  }, async (request, reply) => {
    // TODO: Implement refresh token logic
    return reply.status(501).send({ error: 'Refresh token not implemented' });
  });
});

// General API routes
fastify.get('/api/v1/status', {
  schema: {
    tags: ['health'],
    description: 'API server status',
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          version: { type: 'string' },
          environment: { type: 'string' },
          timestamp: { type: 'string' },
          uptime: { type: 'number' }
        }
      }
    }
  }
}, async (request, reply) => {
  return {
    message: 'Personal Dashboard API Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
});

// Get connected clients info (admin only)
fastify.get('/api/v1/sync/clients', {
  preHandler: [createAuthMiddleware(), async (request, reply) => {
    const user = (request as any).user;
    if (user?.role !== 'admin') {
      return reply.status(403).send({ error: 'Admin access required' });
    }
  }],
  schema: {
    tags: ['admin'],
    description: 'Get connected WebSocket clients',
    security: [{ bearerAuth: [] }],
    response: {
      200: {
        type: 'object',
        properties: {
          clients: { type: 'array' },
          totalConnected: { type: 'number' }
        }
      },
      403: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  const clients = syncManager ? syncManager.getConnectedClients() : [];
  return {
    clients,
    totalConnected: clients.length
  };
});

const start = async () => {
  try {
    const config = getDatabaseConfig();

    // Try to initialize Neo4j connection (non-blocking)
    try {
      const neo4j = initializeNeo4j(config.neo4j);
      await neo4j.connect();
      fastify.log.info('✅ Neo4j connection established');
    } catch (neo4jError) {
      fastify.log.warn('⚠️ Neo4j connection failed - server will start without graph database');
      fastify.log.warn('To use Neo4j features, ensure Neo4j is running and credentials are correct');
    }

    // Try to initialize MongoDB connection (non-blocking)
    try {
      const mongodb = await initializeMongoDB(config.mongodb);
      fastify.log.info('✅ MongoDB connection established');

      // Initialize MongoDB collections and indexes
      try {
        const collectionManager = getCollectionManager();
        await collectionManager.initializeCollections();
        fastify.log.info('✅ MongoDB collections and indexes initialized');
      } catch (collectionError) {
        fastify.log.warn('⚠️ MongoDB collections initialization failed - some features may not work optimally');
      }
    } catch (mongoError) {
      fastify.log.warn('⚠️ MongoDB connection failed - server will start without document database');
      fastify.log.warn('To use MongoDB features, ensure MongoDB is running and accessible');
    }

    // Initialize graceful degradation service
    try {
      const gracefulDegradation = getGracefulDegradationService({
        enableBackgroundSync: process.env.NODE_ENV !== 'test',
        neo4jHealthCheckInterval: 30000, // 30 seconds
        mongoHealthCheckInterval: 10000  // 10 seconds
      });
      fastify.log.info('✅ Graceful degradation service initialized');
    } catch (degradationError) {
      fastify.log.warn('⚠️ Graceful degradation service initialization failed');
    }

    // Initialize sync manager for real-time synchronization
    try {
      syncManager = createSyncManager(fastify);
      (fastify as any).syncManager = syncManager; // Make available to routes
      fastify.log.info('✅ Real-time sync manager initialized');
    } catch (syncError) {
      fastify.log.warn('⚠️ Sync manager initialization failed');
    }

    const port = parseInt(process.env.API_PORT || '3001', 10);
    const host = process.env.API_HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    console.log(`🚀 API Server running on http://${host}:${port}`);
    console.log(`📊 Dual-database system: Neo4j + MongoDB with transaction coordination`);
    console.log(`🔄 Graceful degradation enabled for high availability`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  fastify.log.info('Received SIGTERM, shutting down gracefully...');
  await closeNeo4jConnection();
  
  try {
    const mongodb = getMongoDBConnection();
    await mongodb.disconnect();
  } catch (error) {
    // MongoDB connection might not be initialized
  }

  try {
    const gracefulDegradation = getGracefulDegradationService();
    gracefulDegradation.stop();
  } catch (error) {
    // Graceful degradation service might not be initialized
  }

  try {
    if (syncManager) {
      syncManager.cleanup();
    }
  } catch (error) {
    // Sync manager might not be initialized
  }
  
  await fastify.close();
});

process.on('SIGINT', async () => {
  fastify.log.info('Received SIGINT, shutting down gracefully...');
  await closeNeo4jConnection();
  
  try {
    const mongodb = getMongoDBConnection();
    await mongodb.disconnect();
  } catch (error) {
    // MongoDB connection might not be initialized
  }

  try {
    const gracefulDegradation = getGracefulDegradationService();
    gracefulDegradation.stop();
  } catch (error) {
    // Graceful degradation service might not be initialized
  }

  try {
    if (syncManager) {
      syncManager.cleanup();
    }
  } catch (error) {
    // Sync manager might not be initialized
  }
  
  await fastify.close();
});

start();