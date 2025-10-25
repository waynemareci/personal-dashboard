/**
 * Database Test Helper
 *
 * Provides utilities for integration tests that require databases.
 * Gracefully skips tests when databases are not available.
 */

import { MongoClient } from 'mongodb';
import neo4j from 'neo4j-driver';

export interface DatabaseAvailability {
  mongodb: boolean;
  neo4j: boolean;
}

let cachedAvailability: DatabaseAvailability | null = null;

/**
 * Check if MongoDB is available
 */
export async function isMongoDBAvailable(): Promise<boolean> {
  try {
    const client = new MongoClient('mongodb://localhost:27017', {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000
    });

    await client.connect();
    await client.db('admin').admin().ping();
    await client.close();

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if Neo4j is available
 */
export async function isNeo4jAvailable(): Promise<boolean> {
  try {
    const driver = neo4j.driver(
      'bolt://localhost:7687',
      neo4j.auth.basic('neo4j', '10101010'),
      { maxConnectionPoolSize: 1 }
    );

    const session = driver.session();
    await session.run('RETURN 1');
    await session.close();
    await driver.close();

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check availability of all databases
 * Results are cached for the test run
 */
export async function checkDatabaseAvailability(): Promise<DatabaseAvailability> {
  if (cachedAvailability) {
    return cachedAvailability;
  }

  const [mongodb, neo4j] = await Promise.all([
    isMongoDBAvailable(),
    isNeo4jAvailable()
  ]);

  cachedAvailability = { mongodb, neo4j };
  return cachedAvailability;
}

/**
 * Skip test if MongoDB is not available
 */
export async function skipIfMongoDBUnavailable(context: any) {
  const { mongodb } = await checkDatabaseAvailability();

  if (!mongodb) {
    console.warn('⚠️  Skipping test: MongoDB is not available');
    console.warn('   Start MongoDB: docker run -d --name mongodb-test -p 27017:27017 mongo:6.0');
    context.skip();
  }
}

/**
 * Skip test if Neo4j is not available
 */
export async function skipIfNeo4jUnavailable(context: any) {
  const { neo4j } = await checkDatabaseAvailability();

  if (!neo4j) {
    console.warn('⚠️  Skipping test: Neo4j is not available');
    console.warn('   Start Neo4j: docker run -d --name neo4j-test -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/10101010 neo4j:5.12');
    context.skip();
  }
}

/**
 * Skip test if any required database is not available
 */
export async function skipIfDatabasesUnavailable(context: any, required: ('mongodb' | 'neo4j')[]) {
  const availability = await checkDatabaseAvailability();

  const unavailable = required.filter(db => !availability[db]);

  if (unavailable.length > 0) {
    console.warn(`⚠️  Skipping test: ${unavailable.join(', ')} not available`);
    console.warn('   See docs/TEST-SETUP-GUIDE.md for setup instructions');
    context.skip();
  }
}

/**
 * Print database status for test suite
 */
export async function printDatabaseStatus() {
  const availability = await checkDatabaseAvailability();

  console.log('\n📊 Database Status:');
  console.log(`   MongoDB: ${availability.mongodb ? '✅ Available' : '❌ Not available'}`);
  console.log(`   Neo4j:   ${availability.neo4j ? '✅ Available' : '❌ Not available'}`);

  if (!availability.mongodb || !availability.neo4j) {
    console.log('\n💡 To run all integration tests:');
    if (!availability.mongodb) {
      console.log('   docker run -d --name mongodb-test -p 27017:27017 mongo:6.0');
    }
    if (!availability.neo4j) {
      console.log('   docker run -d --name neo4j-test -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/10101010 neo4j:5.12');
    }
    console.log('');
  }
}

/**
 * Conditionally run test based on database availability
 */
export function testWithDatabase(
  name: string,
  database: 'mongodb' | 'neo4j' | 'both',
  fn: () => void | Promise<void>
) {
  return async function(context: any) {
    const required = database === 'both' ? ['mongodb' as const, 'neo4j' as const] : [database];
    await skipIfDatabasesUnavailable(context, required);
    return fn();
  };
}
