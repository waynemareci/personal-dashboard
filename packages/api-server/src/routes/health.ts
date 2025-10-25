import { FastifyPluginAsync } from 'fastify';
import { getNeo4jConnection } from '../database/neo4j';
import { getMongoDBConnection } from '../database/mongodb';
import { logger } from '../utils/logger';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Basic health check
  fastify.get('/health', async (request, reply) => {
    const startTime = Date.now();
    
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        services: {
          neo4j: { status: 'unknown' as 'healthy' | 'unhealthy' | 'unknown' },
          mongodb: { status: 'unknown' as 'healthy' | 'unhealthy' | 'unknown' }
        }
      };

      // Check Neo4j connection
      try {
        const neo4j = getNeo4jConnection();
        const neo4jHealth = await neo4j.healthCheck();
        health.services.neo4j = {
          status: neo4jHealth.status,
          latency: neo4jHealth.latency,
          error: neo4jHealth.error
        };
      } catch (error) {
        health.services.neo4j = {
          status: 'unavailable',
          error: error instanceof Error ? error.message : 'Connection not initialized'
        };
      }

      // Check MongoDB connection
      try {
        const mongodb = getMongoDBConnection();
        const mongoHealth = await mongodb.healthCheck();
        health.services.mongodb = {
          status: mongoHealth.status,
          latency: mongoHealth.latency,
          error: mongoHealth.error
        };
      } catch (error) {
        health.services.mongodb = {
          status: 'unavailable',
          error: error instanceof Error ? error.message : 'Connection not initialized'
        };
      }

      const responseTime = Date.now() - startTime;
      const isHealthy = (health.services.neo4j.status === 'healthy' || health.services.neo4j.status === 'unavailable') &&
                        (health.services.mongodb.status === 'healthy' || health.services.mongodb.status === 'unavailable');

      reply
        .code(isHealthy ? 200 : 503)
        .header('X-Response-Time', `${responseTime}ms`)
        .send(health);

    } catch (error) {
      logger.error({ error }, 'Health check failed');
      
      reply.code(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Detailed system status
  fastify.get('/health/detailed', async (request, reply) => {
    try {
      const neo4j = getNeo4jConnection();
      const neo4jHealth = await neo4j.healthCheck();

      let mongoHealth = { status: 'unavailable', error: 'Connection not initialized' };
      try {
        const mongodb = getMongoDBConnection();
        mongoHealth = await mongodb.healthCheck();
      } catch (error) {
        mongoHealth = { 
          status: 'unavailable', 
          error: error instanceof Error ? error.message : 'Connection not initialized' 
        };
      }

      // Get database statistics
      const dbStats = await getDetailedDatabaseStats();
      const mongoStats = await getMongoDBStats();

      const detailedHealth = {
        status: (neo4jHealth.status === 'healthy' && mongoHealth.status === 'healthy') ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
          nodeVersion: process.version,
          platform: process.platform
        },
        services: {
          neo4j: neo4jHealth,
          mongodb: mongoHealth
        },
        database: {
          neo4j: dbStats,
          mongodb: mongoStats
        }
      };

      const isHealthy = neo4jHealth.status === 'healthy' && mongoHealth.status === 'healthy';
      reply.code(isHealthy ? 200 : 503).send(detailedHealth);

    } catch (error) {
      logger.error({ error }, 'Detailed health check failed');
      
      reply.code(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Database-specific health endpoint
  fastify.get('/health/database', async (request, reply) => {
    try {
      const neo4j = getNeo4jConnection();
      const health = await neo4j.healthCheck();

      if (health.status === 'healthy') {
        // Get additional database info
        const dbInfo = await getDatabaseInfo();
        
        reply.send({
          ...health,
          ...dbInfo,
          timestamp: new Date().toISOString()
        });
      } else {
        reply.code(503).send({
          ...health,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      logger.error({ error }, 'Database health check failed');
      
      reply.code(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
};

async function getDatabaseInfo() {
  try {
    const neo4j = getNeo4jConnection();
    
    // Get basic database information
    const infoQuery = `
      CALL dbms.components() YIELD name, versions, edition
      RETURN name, versions[0] as version, edition
    `;
    
    const result = await neo4j.executeQuery(infoQuery);
    const dbInfo = result.records[0];

    return {
      database: {
        name: dbInfo?.get('name') || 'neo4j',
        version: dbInfo?.get('version') || 'unknown',
        edition: dbInfo?.get('edition') || 'unknown'
      }
    };
  } catch (error) {
    logger.warn({ error }, 'Could not fetch database info');
    return {
      database: {
        name: 'neo4j',
        version: 'unknown',
        edition: 'unknown'
      }
    };
  }
}

async function getDetailedDatabaseStats() {
  try {
    const neo4j = getNeo4jConnection();
    
    // Get node and relationship counts
    const statsQuery = `
      MATCH (n)
      OPTIONAL MATCH ()-[r]->()
      RETURN count(DISTINCT n) as nodeCount, count(r) as relationshipCount
    `;
    
    const result = await neo4j.executeQuery(statsQuery);
    const stats = result.records[0];

    // Get label distribution
    const labelsQuery = `
      CALL db.labels() YIELD label
      CALL apoc.cypher.run('MATCH (n:' + label + ') RETURN count(n) as count', {})
      YIELD value
      RETURN label, value.count as count
      ORDER BY value.count DESC
    `;

    let labelStats = [];
    try {
      const labelsResult = await neo4j.executeQuery(labelsQuery);
      labelStats = labelsResult.records.map(record => ({
        label: record.get('label'),
        count: record.get('count')
      }));
    } catch (error) {
      // Fallback if APOC is not available
      logger.debug('APOC not available for detailed stats');
    }

    return {
      nodeCount: stats?.get('nodeCount')?.toNumber() || 0,
      relationshipCount: stats?.get('relationshipCount')?.toNumber() || 0,
      labelDistribution: labelStats
    };
  } catch (error) {
    logger.warn({ error }, 'Could not fetch database stats');
    return {
      nodeCount: 0,
      relationshipCount: 0,
      labelDistribution: []
    };
  }
}

async function getMongoDBStats() {
  try {
    const mongodb = getMongoDBConnection();
    const stats = await mongodb.getStats();
    return stats;
  } catch (error) {
    logger.warn({ error }, 'Could not fetch MongoDB stats');
    return {
      database: 'unknown',
      collections: 0,
      objects: 0,
      dataSize: 0,
      storageSize: 0,
      indexes: 0,
      indexSize: 0,
      error: error instanceof Error ? error.message : 'Connection not available'
    };
  }
}

export default healthRoutes;