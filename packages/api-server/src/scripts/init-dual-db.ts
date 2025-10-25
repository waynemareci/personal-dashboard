#!/usr/bin/env node
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../../../.env') });

import { logger } from '../utils/logger';
import { initializeMongoDB, getMongoDBConnection } from '../database/mongodb';
import { initializeNeo4j, getNeo4jConnection } from '../database/neo4j';
import { SchemaManager } from '../database/schema';
import { CollectionManager, getCollectionManager } from '../database/collections';
import { getGracefulDegradationService } from '../database/graceful-degradation';
import { getDatabaseConfig } from '../config/database';

interface InitializationOptions {
  dropExisting?: boolean;
  seedData?: boolean;
  skipNeo4j?: boolean;
  skipMongoDB?: boolean;
}

async function initializeDualDatabase(options: InitializationOptions = {}): Promise<void> {
  const {
    dropExisting = false,
    seedData = false,
    skipNeo4j = false,
    skipMongoDB = false
  } = options;

  console.log('🚀 Initializing Personal Dashboard Dual Database System...\n');

  const config = getDatabaseConfig();
  const errors: string[] = [];

  // Initialize Neo4j
  if (!skipNeo4j) {
    try {
      console.log('📊 Initializing Neo4j Graph Database...');
      const neo4jConnection = initializeNeo4j(config.neo4j);
      await neo4jConnection.connect();
      
      const schemaManager = new SchemaManager();
      
      if (dropExisting) {
        console.log('⚠️  Clearing existing Neo4j data...');
        await neo4jConnection.executeQuery('MATCH (n) DETACH DELETE n');
      }
      
      await schemaManager.initializeSchema();
      await schemaManager.createFullTextSearchIndex();
      
      const constraints = await schemaManager.getConstraints();
      const indexes = await schemaManager.getIndexes();
      
      console.log(`✅ Neo4j initialized successfully`);
      console.log(`   - ${constraints.length} constraints created`);
      console.log(`   - ${indexes.length} indexes created\n`);
      
    } catch (error) {
      const errorMsg = `Neo4j initialization failed: ${error}`;
      console.error(`❌ ${errorMsg}`);
      errors.push(errorMsg);
    }
  } else {
    console.log('⏭️  Skipping Neo4j initialization\n');
  }

  // Initialize MongoDB
  if (!skipMongoDB) {
    try {
      console.log('🍃 Initializing MongoDB Document Database...');
      await initializeMongoDB(config.mongodb);
      
      const collectionManager = getCollectionManager();
      
      if (dropExisting) {
        console.log('⚠️  Dropping existing MongoDB collections...');
        await collectionManager.dropAllCollections();
      }
      
      await collectionManager.initializeCollections();
      
      const stats = await collectionManager.getCollectionStats();
      const collectionCount = Object.keys(stats).length;
      const totalIndexes = Object.values(stats).reduce((sum: number, stat: any) => 
        sum + (stat.indexCount || 0), 0
      );
      
      console.log(`✅ MongoDB initialized successfully`);
      console.log(`   - ${collectionCount} collections created`);
      console.log(`   - ${totalIndexes} indexes created\n`);
      
    } catch (error) {
      const errorMsg = `MongoDB initialization failed: ${error}`;
      console.error(`❌ ${errorMsg}`);
      errors.push(errorMsg);
    }
  } else {
    console.log('⏭️  Skipping MongoDB initialization\n');
  }

  // Initialize graceful degradation service
  try {
    console.log('🔄 Initializing Graceful Degradation Service...');
    const degradationService = getGracefulDegradationService({
      enableBackgroundSync: true,
      neo4jHealthCheckInterval: 30000,
      mongoHealthCheckInterval: 10000
    });
    
    // Wait a moment for initial health checks
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const serviceStatus = degradationService.getServiceStatus();
    console.log(`✅ Graceful Degradation Service initialized`);
    console.log(`   - Neo4j: ${serviceStatus.neo4j.available ? '🟢 Available' : '🔴 Unavailable'}`);
    console.log(`   - MongoDB: ${serviceStatus.mongodb.available ? '🟢 Available' : '🔴 Unavailable'}\n`);
    
  } catch (error) {
    const errorMsg = `Graceful Degradation Service initialization failed: ${error}`;
    console.error(`❌ ${errorMsg}`);
    errors.push(errorMsg);
  }

  // Seed initial data if requested
  if (seedData && errors.length === 0) {
    try {
      console.log('🌱 Seeding initial data...');
      await seedInitialData();
      console.log('✅ Initial data seeded successfully\n');
    } catch (error) {
      const errorMsg = `Data seeding failed: ${error}`;
      console.error(`❌ ${errorMsg}`);
      errors.push(errorMsg);
    }
  }

  // Summary
  console.log('📋 Initialization Summary:');
  if (errors.length === 0) {
    console.log('🎉 Dual database system initialized successfully!');
    console.log('\nReady for Personal Dashboard operations:');
    console.log('   - CRUD operations via MongoDB');
    console.log('   - Relationship discovery via Neo4j');
    console.log('   - Automatic transaction coordination');
    console.log('   - Graceful degradation when services unavailable');
  } else {
    console.log('⚠️  Initialization completed with errors:');
    errors.forEach(error => console.log(`   - ${error}`));
    process.exit(1);
  }
}

async function seedInitialData(): Promise<void> {
  const { getDualDatabaseCoordinator } = await import('../database/dual-db-coordinator');
  const coordinator = getDualDatabaseCoordinator();

  // Seed default user
  const defaultUser = {
    profile: {
      firstName: 'Demo',
      lastName: 'User', 
      email: 'demo@personal-dashboard.com',
      phone: '+1-555-0123'
    },
    preferences: {
      theme: 'auto' as const,
      language: 'en',
      timezone: 'UTC',
      currency: 'USD',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      dashboard: {
        widgets: ['financial', 'health', 'schedule'],
        layout: 'grid' as const
      }
    },
    status: 'active' as const,
    roles: ['user', 'demo']
  };

  const userResult = await coordinator.createEntity(
    'users',
    defaultUser,
    ['User', 'Person'],
    { 
      isDemo: true,
      createdBy: 'system',
      region: 'US'
    }
  );

  if (!userResult.success || !userResult.entityId) {
    throw new Error('Failed to create demo user');
  }

  console.log(`   - Created demo user: ${userResult.entityId}`);

  // Seed sample financial account
  const demoAccount = {
    userId: userResult.entityId,
    name: 'Demo Checking Account',
    type: 'checking' as const,
    institution: 'Demo Bank',
    balance: 5000.00,
    currency: 'USD',
    isActive: true,
    syncEnabled: false
  };

  const accountResult = await coordinator.createEntity(
    'financial_accounts',
    demoAccount,
    ['Account', 'Financial'],
    { 
      accountType: 'checking',
      isDemo: true
    },
    [{
      type: 'OWNS',
      targetNodeId: userResult.entityId,
      targetLabels: ['User'],
      direction: 'incoming'
    }]
  );

  if (accountResult.success && accountResult.entityId) {
    console.log(`   - Created demo account: ${accountResult.entityId}`);
  }

  // Seed sample health goal
  const healthGoal = {
    userId: userResult.entityId,
    name: 'Daily Steps Goal',
    description: 'Walk 10,000 steps per day',
    category: 'endurance' as const,
    targetValue: 10000,
    targetUnit: 'steps',
    currentValue: 0,
    startValue: 0,
    frequency: 'daily' as const,
    priority: 'medium' as const,
    status: 'active' as const,
    progress: 0
  };

  const goalResult = await coordinator.createEntity(
    'health_goals',
    healthGoal,
    ['Goal', 'Health'],
    { 
      goalType: 'fitness',
      isDemo: true
    },
    [{
      type: 'HAS_GOAL',
      targetNodeId: userResult.entityId,
      targetLabels: ['User'],
      direction: 'incoming'
    }]
  );

  if (goalResult.success && goalResult.entityId) {
    console.log(`   - Created demo health goal: ${goalResult.entityId}`);
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options: InitializationOptions = {};

  // Parse command line arguments
  if (args.includes('--drop-existing')) {
    options.dropExisting = true;
    console.log('⚠️  WARNING: This will drop all existing data!');
  }

  if (args.includes('--seed-data')) {
    options.seedData = true;
  }

  if (args.includes('--skip-neo4j')) {
    options.skipNeo4j = true;
  }

  if (args.includes('--skip-mongodb')) {
    options.skipMongoDB = true;
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Personal Dashboard Dual Database Initialization

Usage: npm run init:dual-db [options]

Options:
  --drop-existing    Drop all existing data before initialization
  --seed-data        Seed initial demo data after initialization
  --skip-neo4j       Skip Neo4j initialization
  --skip-mongodb     Skip MongoDB initialization
  --help, -h         Show this help message

Examples:
  npm run init:dual-db                           # Initialize both databases
  npm run init:dual-db --seed-data               # Initialize and seed demo data
  npm run init:dual-db --drop-existing --seed-data  # Fresh start with demo data
  npm run init:dual-db --skip-neo4j              # Initialize MongoDB only
    `);
    process.exit(0);
  }

  initializeDualDatabase(options)
    .then(() => {
      console.log('\n🏁 Database initialization completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Database initialization failed:', error);
      process.exit(1);
    });
}

export { initializeDualDatabase, seedInitialData };