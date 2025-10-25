import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { createAuthMiddleware, requirePermission } from '../middleware/auth';
import { getNeo4jConnection } from '../database/neo4j';
import { logger } from '../utils/logger';

const relationshipsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const authMiddleware = createAuthMiddleware();
  const neo4j = getNeo4jConnection();

  // Add authentication to all routes
  fastify.addHook('preHandler', authMiddleware);

  // Get user's knowledge graph
  fastify.get('/graph', {
    schema: {
      tags: ['relationships'],
      description: 'Get user knowledge graph with relationships',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          domain: { 
            type: 'string',
            enum: ['financial', 'health', 'schedule', 'all']
          },
          depth: { type: 'number', default: 2, minimum: 1, maximum: 5 },
          nodeLimit: { type: 'number', default: 100, maximum: 500 },
          includeDeleted: { type: 'boolean', default: false }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            nodes: { type: 'array' },
            relationships: { type: 'array' },
            metadata: {
              type: 'object',
              properties: {
                totalNodes: { type: 'number' },
                totalRelationships: { type: 'number' },
                domains: { type: 'array' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { domain = 'all', depth = 2, nodeLimit = 100, includeDeleted = false } = request.query as any;

      // Build Cypher query based on parameters
      let domainFilter = '';
      if (domain !== 'all') {
        domainFilter = `AND n.domain = $domain`;
      }

      const deletedFilter = includeDeleted ? '' : 'AND (n.isDeleted = false OR n.isDeleted IS NULL)';

      const query = `
        MATCH (u:User {id: $userId})
        MATCH (u)-[*1..${depth}]-(n)
        WHERE n <> u ${domainFilter} ${deletedFilter}
        WITH n
        LIMIT $nodeLimit
        
        OPTIONAL MATCH (n)-[r]-(connected)
        WHERE (connected.isDeleted = false OR connected.isDeleted IS NULL)
        
        RETURN 
          collect(DISTINCT {
            id: n.id,
            labels: labels(n),
            properties: properties(n)
          }) as nodes,
          collect(DISTINCT {
            id: id(r),
            type: type(r),
            startNode: startNode(r).id,
            endNode: endNode(r).id,
            properties: properties(r)
          }) as relationships
      `;

      const parameters = {
        userId: user.id,
        nodeLimit,
        ...(domain !== 'all' && { domain })
      };

      const result = await neo4j.executeQuery(query, parameters);
      
      const nodes = result.records[0]?.get('nodes') || [];
      const relationships = result.records[0]?.get('relationships') || [];

      // Calculate metadata
      const domains = [...new Set(nodes.map((n: any) => n.properties.domain).filter(Boolean))];
      
      return {
        nodes,
        relationships: relationships.filter((r: any) => r.id !== null),
        metadata: {
          totalNodes: nodes.length,
          totalRelationships: relationships.filter((r: any) => r.id !== null).length,
          domains
        }
      };
    } catch (error) {
      logger.error('Error fetching knowledge graph:', error);
      return reply.status(500).send({ error: 'Failed to fetch knowledge graph' });
    }
  });

  // Discover relationships between entities
  fastify.get('/discover', {
    schema: {
      tags: ['relationships'],
      description: 'Discover potential relationships between user data',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          fromDomain: { 
            type: 'string',
            enum: ['financial', 'health', 'schedule']
          },
          toDomain: { 
            type: 'string',
            enum: ['financial', 'health', 'schedule']
          },
          relationshipType: { type: 'string' },
          confidence: { type: 'number', minimum: 0.1, maximum: 1.0, default: 0.5 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            suggestions: { type: 'array' },
            insights: { type: 'array' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { fromDomain, toDomain, relationshipType, confidence = 0.5 } = request.query as any;

      // Example discovery queries - this would be much more sophisticated in reality
      const discoveryQueries = [
        // Find spending patterns related to health activities
        {
          condition: fromDomain === 'financial' && toDomain === 'health',
          query: `
            MATCH (u:User {id: $userId})
            MATCH (u)-[:BELONGS_TO]-(t:Transaction)
            MATCH (u)-[:PERFORMED_BY]-(w:Workout)
            WHERE t.date >= date(w.date) - duration('P1D') 
              AND t.date <= date(w.date) + duration('P1D')
              AND t.categoryId IN ['health', 'fitness', 'food']
            RETURN 
              t.id as transactionId,
              w.id as workoutId,
              t.amount as amount,
              t.description as description,
              w.type as workoutType,
              'HEALTH_SPENDING' as suggestedRelationType
            LIMIT 10
          `
        },
        // Find task completion patterns related to financial goals
        {
          condition: fromDomain === 'schedule' && toDomain === 'financial',
          query: `
            MATCH (u:User {id: $userId})
            MATCH (u)-[:ASSIGNED_TO]-(task:Task {status: 'completed'})
            MATCH (u)-[:BELONGS_TO]-(t:Transaction)
            WHERE task.completedAt >= date(t.date) - duration('P7D')
              AND task.completedAt <= date(t.date) + duration('P7D')
              AND (task.title CONTAINS 'budget' OR task.title CONTAINS 'money' OR task.title CONTAINS 'save')
            RETURN 
              task.id as taskId,
              t.id as transactionId,
              task.title as taskTitle,
              t.amount as amount,
              'FINANCIAL_GOAL_PROGRESS' as suggestedRelationType
            LIMIT 10
          `
        }
      ];

      const suggestions = [];
      const insights = [];

      for (const discoveryQuery of discoveryQueries) {
        if (!discoveryQuery.condition) continue;

        try {
          const result = await neo4j.executeQuery(discoveryQuery.query, { userId: user.id });
          
          for (const record of result.records) {
            suggestions.push({
              confidence: confidence + (Math.random() * 0.3), // Mock confidence scoring
              type: record.get('suggestedRelationType'),
              fromEntity: {
                id: record.get('transactionId') || record.get('taskId'),
                domain: fromDomain,
                description: record.get('description') || record.get('taskTitle')
              },
              toEntity: {
                id: record.get('workoutId') || record.get('transactionId'),
                domain: toDomain,
                description: record.get('workoutType') || `$${record.get('amount')}`
              },
              reason: 'Temporal and categorical correlation detected'
            });
          }
        } catch (queryError) {
          logger.warn(`Discovery query failed: ${queryError}`);
        }
      }

      // Generate insights based on existing relationships
      const insightsQuery = `
        MATCH (u:User {id: $userId})
        MATCH (u)-[*1..3]-(n)
        WHERE n.domain IS NOT NULL
        WITH n.domain as domain, count(n) as entityCount
        ORDER BY entityCount DESC
        RETURN domain, entityCount
        LIMIT 5
      `;

      try {
        const insightsResult = await neo4j.executeQuery(insightsQuery, { userId: user.id });
        
        for (const record of insightsResult.records) {
          insights.push({
            type: 'domain_distribution',
            domain: record.get('domain'),
            value: record.get('entityCount'),
            insight: `You have ${record.get('entityCount')} entities in the ${record.get('domain')} domain`
          });
        }
      } catch (insightsError) {
        logger.warn(`Insights query failed: ${insightsError}`);
      }

      return { suggestions, insights };
    } catch (error) {
      logger.error('Error discovering relationships:', error);
      return reply.status(500).send({ error: 'Failed to discover relationships' });
    }
  });

  // Create custom relationship between entities
  fastify.post('/connect', {
    preHandler: [requirePermission('relationships:write')],
    schema: {
      tags: ['relationships'],
      description: 'Create a custom relationship between two entities',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          fromEntityId: { type: 'string' },
          toEntityId: { type: 'string' },
          relationshipType: { type: 'string' },
          properties: { type: 'object' },
          strength: { type: 'number', minimum: 0.1, maximum: 1.0 }
        },
        required: ['fromEntityId', 'toEntityId', 'relationshipType']
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            relationshipId: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;
      const { fromEntityId, toEntityId, relationshipType, properties = {}, strength = 1.0 } = request.body as any;

      // Verify both entities belong to the user
      const verifyQuery = `
        MATCH (u:User {id: $userId})
        MATCH (from {id: $fromEntityId})
        MATCH (to {id: $toEntityId})
        WHERE (u)-[*1..2]-(from) AND (u)-[*1..2]-(to)
        RETURN from.id, to.id
      `;

      const verifyResult = await neo4j.executeQuery(verifyQuery, {
        userId: user.id,
        fromEntityId,
        toEntityId
      });

      if (verifyResult.records.length === 0) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Cannot create relationships between entities not owned by user'
        });
      }

      // Create the relationship
      const createQuery = `
        MATCH (from {id: $fromEntityId})
        MATCH (to {id: $toEntityId})
        CREATE (from)-[r:${relationshipType} {
          createdAt: datetime(),
          createdBy: $userId,
          strength: $strength,
          custom: true
        }]->(to)
        SET r += $properties
        RETURN id(r) as relationshipId
      `;

      const createResult = await neo4j.executeQuery(createQuery, {
        fromEntityId,
        toEntityId,
        userId: user.id,
        strength,
        properties
      });

      const relationshipId = createResult.records[0]?.get('relationshipId');

      if (relationshipId) {
        // Broadcast sync event
        const syncManager = (fastify as any).syncManager;
        if (syncManager) {
          syncManager.broadcastSyncEvent({
            type: 'data_change',
            domain: 'relationships',
            action: 'create',
            entityId: relationshipId.toString(),
            entityType: 'relationship',
            data: {
              fromEntityId,
              toEntityId,
              relationshipType,
              properties,
              strength
            },
            timestamp: new Date().toISOString(),
            userId: user.id,
            source: 'api'
          });
        }

        reply.status(201).send({
          success: true,
          relationshipId: relationshipId.toString()
        });
      } else {
        reply.status(500).send({
          error: 'Failed to create relationship'
        });
      }
    } catch (error) {
      logger.error('Error creating relationship:', error);
      return reply.status(500).send({ error: 'Failed to create relationship' });
    }
  });

  // Get relationship analytics
  fastify.get('/analytics', {
    schema: {
      tags: ['relationships'],
      description: 'Get relationship analytics and patterns',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                totalNodes: { type: 'number' },
                totalRelationships: { type: 'number' },
                domainDistribution: { type: 'object' },
                relationshipTypes: { type: 'object' }
              }
            },
            patterns: { type: 'array' },
            recommendations: { type: 'array' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;

      // Get summary statistics
      const summaryQuery = `
        MATCH (u:User {id: $userId})
        MATCH (u)-[*1..3]-(n)
        WHERE n <> u AND (n.isDeleted = false OR n.isDeleted IS NULL)
        
        WITH n
        OPTIONAL MATCH (n)-[r]-()
        
        RETURN 
          count(DISTINCT n) as totalNodes,
          count(DISTINCT r) as totalRelationships,
          collect(DISTINCT n.domain) as domains,
          collect(DISTINCT type(r)) as relationshipTypes
      `;

      const summaryResult = await neo4j.executeQuery(summaryQuery, { userId: user.id });
      const summaryRecord = summaryResult.records[0];

      const summary = {
        totalNodes: summaryRecord?.get('totalNodes') || 0,
        totalRelationships: summaryRecord?.get('totalRelationships') || 0,
        domainDistribution: {},
        relationshipTypes: {}
      };

      // TODO: Add more sophisticated analytics queries
      const patterns = [];
      const recommendations = [
        {
          type: 'data_enrichment',
          title: 'Add more health metrics',
          description: 'Connect your fitness activities with nutrition data for better insights',
          priority: 'medium'
        },
        {
          type: 'relationship_discovery',
          title: 'Link spending to goals',
          description: 'Track how your purchases align with your financial objectives',
          priority: 'high'
        }
      ];

      return {
        summary,
        patterns,
        recommendations
      };
    } catch (error) {
      logger.error('Error fetching relationship analytics:', error);
      return reply.status(500).send({ error: 'Failed to fetch analytics' });
    }
  });
};

export default relationshipsRoutes;