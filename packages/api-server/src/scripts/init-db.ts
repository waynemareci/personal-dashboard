#!/usr/bin/env node

import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the root .env file
dotenv.config({ path: resolve(__dirname, '../../../../.env') });

import { initializeNeo4j, closeNeo4jConnection } from '../database/neo4j';
import { SchemaManager } from '../database/schema';
import { MigrationManager } from '../database/migrations';
import { getDatabaseConfig } from '../config/database';
import { logger } from '../utils/logger';

async function initializeDatabase() {
  logger.info('🚀 Starting Personal Dashboard database initialization...');

  try {
    // Initialize Neo4j connection
    const config = getDatabaseConfig();
    const neo4j = initializeNeo4j(config.neo4j);
    await neo4j.connect();

    logger.info('✅ Neo4j connection established');

    // Initialize schema
    const schemaManager = new SchemaManager();
    await schemaManager.initializeSchema();
    await schemaManager.createFullTextSearchIndex();

    logger.info('✅ Schema and indexes created');

    // Run migrations
    const migrationManager = new MigrationManager();
    await migrationManager.migrate();

    logger.info('✅ Migrations applied');

    // Verify setup
    const constraints = await schemaManager.getConstraints();
    const indexes = await schemaManager.getIndexes();
    const migrationStatus = await migrationManager.getMigrationStatus();

    logger.info('📊 Database Setup Summary:');
    logger.info(`   - Constraints: ${constraints.length}`);
    logger.info(`   - Indexes: ${indexes.length}`);
    logger.info(`   - Migrations applied: ${migrationStatus.applied}/${migrationStatus.total}`);

    if (migrationStatus.pending.length > 0) {
      logger.warn('⚠️  Pending migrations:', migrationStatus.pending);
    }

    // Health check
    const health = await neo4j.healthCheck();
    if (health.status === 'healthy') {
      logger.info(`✅ Health check passed (${health.latency}ms latency)`);
    } else {
      logger.error('❌ Health check failed:', health.error);
    }

    logger.info('🎉 Database initialization completed successfully!');

  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await closeNeo4jConnection();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase().catch((error) => {
    logger.error('Failed to initialize database:', error);
    process.exit(1);
  });
}

export { initializeDatabase };