import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the root .env file
dotenv.config({ path: resolve(__dirname, '../../../.env') });

import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import { initializeNeo4j, closeNeo4jConnection } from './database/neo4j';
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
    // Try to initialize Neo4j connection (non-blocking)
    try {
      const config = getDatabaseConfig();
      const neo4j = initializeNeo4j(config.neo4j);
      await neo4j.connect();
      fastify.log.info('✅ Neo4j connection established');
    } catch (neo4jError) {
      fastify.log.warn('⚠️ Neo4j connection failed - server will start without graph database');
      fastify.log.warn('To use Neo4j features, ensure Neo4j is running and credentials are correct');
    }

    const port = parseInt(process.env.API_PORT || '3001', 10);
    const host = process.env.API_HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    console.log(`🚀 API Server running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  fastify.log.info('Received SIGTERM, shutting down gracefully...');
  await closeNeo4jConnection();
  await fastify.close();
});

process.on('SIGINT', async () => {
  fastify.log.info('Received SIGINT, shutting down gracefully...');
  await closeNeo4jConnection();
  await fastify.close();
});

start();