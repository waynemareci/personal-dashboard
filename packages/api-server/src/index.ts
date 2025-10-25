import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the root .env file
dotenv.config({ path: resolve(__dirname, '../../../.env') });

import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import { initializeNeo4j, closeNeo4jConnection } from './database/neo4j';
import { initializeMongoDB, getMongoDBConnection } from './database/mongodb';
import { getCollectionManager } from './database/collections';
import { getGracefulDegradationService } from './database/graceful-degradation';
import { getDatabaseConfig } from './config/database';
import healthRoutes from './routes/health';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

// Register plugins
fastify.register(cors, {
  origin: process.env.NODE_ENV === 'development' ? true : false
});

fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production'
});

fastify.register(websocket);

// Register health routes
fastify.register(healthRoutes);

// API routes
fastify.get('/api/v1/status', async (request, reply) => {
  return {
    message: 'Personal Dashboard API Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };
});

// WebSocket route for real-time sync
fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    connection.socket.on('message', (message: string | Buffer) => {
      console.log('Received message:', message.toString());
      connection.socket.send('Echo: ' + message);
    });
  });
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
  
  await fastify.close();
});

start();