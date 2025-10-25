/**
 * Neo4j Cypher Queries for Relationship Discovery
 *
 * This module provides typed query builders and executors for
 * discovering relationships between entities across domains.
 */

export interface Entity {
  id: string;
  type: string;
  label: string;
  subdomain: string;
  properties: Record<string, any>;
  timestamp?: string;
}

export interface Relationship {
  id: string;
  type: string;
  source: string;
  target: string;
  strength: number;
  properties: Record<string, any>;
  createdAt: string;
  automatic: boolean;
}

export interface RelationshipResult {
  entity: Entity;
  relationships: Array<{
    relationship: Relationship;
    relatedEntity: Entity;
  }>;
}

export interface TemporalCorrelation {
  event1: Entity;
  event2: Entity;
  timeDiff: number;
  correlationType: string;
}

export interface GraphData {
  nodes: Array<{
    id: string;
    label: string;
    type: string;
    subdomain: string;
    properties: Record<string, any>;
  }>;
  edges: Array<{
    id: string;
    from: string;
    to: string;
    type: string;
    strength: number;
    label?: string;
  }>;
}

/**
 * Find all entities related to a given entity
 */
export function buildRelatedEntitiesQuery(entityId: string, maxDepth: number = 1) {
  return {
    query: `
      MATCH (entity:Entity {id: $entityId})-[r*1..${maxDepth}]-(related:Entity)
      WHERE entity <> related
      RETURN entity, r, related, labels(related) as types,
             reduce(strength = 0, rel in r | strength + rel.strength) as totalStrength
      ORDER BY totalStrength DESC
      LIMIT 50
    `,
    parameters: { entityId }
  };
}

/**
 * Find temporal correlations within specified time window (in seconds)
 */
export function buildTemporalCorrelationsQuery(
  entityId: string,
  timeWindow: number = 86400 // 24 hours default
) {
  return {
    query: `
      MATCH (entity:Entity {id: $entityId})-[:OCCURRED_ON]->(date1:Date)
      MATCH (event:Entity)-[:OCCURRED_ON]->(date2:Date)
      WHERE entity <> event
        AND abs(date1.timestamp - date2.timestamp) < $timeWindow
      WITH entity, event, abs(date1.timestamp - date2.timestamp) as timeDiff
      RETURN event, timeDiff, labels(event) as types
      ORDER BY timeDiff ASC
      LIMIT 20
    `,
    parameters: { entityId, timeWindow }
  };
}

/**
 * Find cross-domain relationships by subdomain
 */
export function buildCrossDomainQuery(
  sourceSubdomain: string,
  targetSubdomain?: string
) {
  const targetFilter = targetSubdomain
    ? `AND target.subdomain = $targetSubdomain`
    : `AND source.subdomain <> target.subdomain`;

  return {
    query: `
      MATCH (source:Entity {subdomain: $sourceSubdomain})-[r]-(target:Entity)
      WHERE ${targetFilter}
      RETURN source, r, target, r.strength as strength
      ORDER BY strength DESC
      LIMIT 100
    `,
    parameters: targetSubdomain
      ? { sourceSubdomain, targetSubdomain }
      : { sourceSubdomain }
  };
}

/**
 * Find relationship patterns (e.g., Transaction -> Meal correlation)
 */
export function buildPatternQuery(
  sourceType: string,
  targetType: string,
  minStrength: number = 0.5
) {
  return {
    query: `
      MATCH (source:${sourceType})-[r]-(target:${targetType})
      WHERE r.strength >= $minStrength
      RETURN source, r, target, r.strength as strength, r.type as relType
      ORDER BY strength DESC
      LIMIT 50
    `,
    parameters: { minStrength }
  };
}

/**
 * Find suggested relationships based on patterns
 */
export function buildSuggestedRelationshipsQuery(entityId: string) {
  return {
    query: `
      MATCH (entity:Entity {id: $entityId})
      MATCH (similar:Entity)
      WHERE entity <> similar
        AND entity.subdomain = similar.subdomain
        AND NOT (entity)-[]-(similar)
      WITH entity, similar,
           gds.similarity.cosine(
             [entity.timestamp, entity.amount],
             [similar.timestamp, similar.amount]
           ) as similarity
      WHERE similarity > 0.7
      RETURN similar, similarity
      ORDER BY similarity DESC
      LIMIT 10
    `,
    parameters: { entityId }
  };
}

/**
 * Get entity neighborhood for graph visualization
 */
export function buildNeighborhoodQuery(
  entityId: string,
  depth: number = 2,
  relationshipTypes?: string[]
) {
  const typeFilter = relationshipTypes && relationshipTypes.length > 0
    ? `AND type(r) IN $relationshipTypes`
    : '';

  return {
    query: `
      MATCH path = (entity:Entity {id: $entityId})-[r*1..${depth}]-(neighbor:Entity)
      WHERE entity <> neighbor ${typeFilter}
      WITH entity, relationships(path) as rels, nodes(path) as nodes
      UNWIND rels as r
      UNWIND nodes as n
      RETURN DISTINCT
        n as node,
        r as relationship,
        startNode(r) as source,
        endNode(r) as target
    `,
    parameters: relationshipTypes
      ? { entityId, relationshipTypes }
      : { entityId }
  };
}

/**
 * Find relationship insights (e.g., spending patterns correlating with workout days)
 */
export function buildInsightsQuery(
  subdomain: string,
  startDate: Date,
  endDate: Date
) {
  return {
    query: `
      MATCH (entity:Entity {subdomain: $subdomain})-[r]-(related:Entity)
      WHERE entity.timestamp >= $startDate
        AND entity.timestamp <= $endDate
      WITH related.subdomain as targetSubdomain,
           type(r) as relType,
           count(r) as frequency,
           avg(r.strength) as avgStrength
      RETURN targetSubdomain, relType, frequency, avgStrength
      ORDER BY frequency DESC, avgStrength DESC
      LIMIT 10
    `,
    parameters: {
      subdomain,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }
  };
}

/**
 * Create a new relationship between entities
 */
export function buildCreateRelationshipQuery(
  sourceId: string,
  targetId: string,
  relationshipType: string,
  properties: Record<string, any> = {}
) {
  return {
    query: `
      MATCH (source:Entity {id: $sourceId})
      MATCH (target:Entity {id: $targetId})
      CREATE (source)-[r:${relationshipType} $properties]->(target)
      RETURN r
    `,
    parameters: {
      sourceId,
      targetId,
      properties: {
        ...properties,
        strength: properties.strength || 0.5,
        automatic: false,
        createdAt: new Date().toISOString()
      }
    }
  };
}

/**
 * Delete a relationship
 */
export function buildDeleteRelationshipQuery(relationshipId: string) {
  return {
    query: `
      MATCH ()-[r]->()
      WHERE id(r) = $relationshipId
      DELETE r
    `,
    parameters: { relationshipId }
  };
}

/**
 * Update relationship strength
 */
export function buildUpdateRelationshipStrengthQuery(
  relationshipId: string,
  strength: number
) {
  return {
    query: `
      MATCH ()-[r]->()
      WHERE id(r) = $relationshipId
      SET r.strength = $strength, r.updatedAt = $timestamp
      RETURN r
    `,
    parameters: {
      relationshipId,
      strength,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Find shortest path between two entities
 */
export function buildShortestPathQuery(sourceId: string, targetId: string) {
  return {
    query: `
      MATCH (source:Entity {id: $sourceId})
      MATCH (target:Entity {id: $targetId})
      MATCH path = shortestPath((source)-[*..6]-(target))
      RETURN path, length(path) as pathLength,
             [rel in relationships(path) | type(rel)] as relationshipTypes
    `,
    parameters: { sourceId, targetId }
  };
}

/**
 * Find common connections between entities
 */
export function buildCommonConnectionsQuery(entityIds: string[]) {
  return {
    query: `
      MATCH (e1:Entity)-[r1]-(common:Entity)-[r2]-(e2:Entity)
      WHERE e1.id IN $entityIds
        AND e2.id IN $entityIds
        AND e1 <> e2
        AND e1 <> common
        AND e2 <> common
      WITH common, collect(DISTINCT e1.id) as connectedEntities,
           count(DISTINCT e1) as connectionCount
      WHERE connectionCount >= 2
      RETURN common, connectedEntities, connectionCount
      ORDER BY connectionCount DESC
      LIMIT 20
    `,
    parameters: { entityIds }
  };
}

/**
 * Execute a Neo4j query via the API
 */
export async function executeQuery<T = any>(
  query: string,
  parameters: Record<string, any>
): Promise<T[]> {
  try {
    const apiUrl = window.api?.store?.get('apiUrl') || 'http://localhost:3001';

    const response = await fetch(`${apiUrl}/api/neo4j/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, parameters })
    });

    if (!response.ok) {
      throw new Error(`Query failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.records || [];
  } catch (error) {
    console.error('[Neo4j] Query execution failed:', error);
    throw error;
  }
}

/**
 * High-level API for relationship discovery
 */
export const RelationshipQueries = {
  /**
   * Get all relationships for an entity
   */
  async getRelatedEntities(entityId: string, maxDepth: number = 1): Promise<RelationshipResult> {
    const { query, parameters } = buildRelatedEntitiesQuery(entityId, maxDepth);
    const results = await executeQuery(query, parameters);

    // Transform results into structured format
    const entity = results[0]?.entity;
    const relationships = results.map(r => ({
      relationship: r.r,
      relatedEntity: r.related
    }));

    return { entity, relationships };
  },

  /**
   * Get temporal correlations
   */
  async getTemporalCorrelations(
    entityId: string,
    timeWindow: number = 86400
  ): Promise<TemporalCorrelation[]> {
    const { query, parameters } = buildTemporalCorrelationsQuery(entityId, timeWindow);
    return executeQuery(query, parameters);
  },

  /**
   * Get graph data for visualization
   */
  async getGraphData(
    entityId: string,
    depth: number = 2,
    relationshipTypes?: string[]
  ): Promise<GraphData> {
    const { query, parameters } = buildNeighborhoodQuery(entityId, depth, relationshipTypes);
    const results = await executeQuery(query, parameters);

    // Transform to vis-network format
    const nodes = new Map();
    const edges = new Map();

    results.forEach(r => {
      // Add nodes
      if (r.node && !nodes.has(r.node.id)) {
        nodes.set(r.node.id, {
          id: r.node.id,
          label: r.node.label || r.node.id,
          type: r.node.type,
          subdomain: r.node.subdomain,
          properties: r.node.properties
        });
      }

      // Add edges
      if (r.relationship && r.source && r.target) {
        const edgeId = `${r.source.id}-${r.target.id}`;
        if (!edges.has(edgeId)) {
          edges.set(edgeId, {
            id: edgeId,
            from: r.source.id,
            to: r.target.id,
            type: r.relationship.type,
            strength: r.relationship.strength || 0.5,
            label: r.relationship.type
          });
        }
      }
    });

    return {
      nodes: Array.from(nodes.values()),
      edges: Array.from(edges.values())
    };
  },

  /**
   * Create a new relationship
   */
  async createRelationship(
    sourceId: string,
    targetId: string,
    relationshipType: string,
    properties?: Record<string, any>
  ): Promise<Relationship> {
    const { query, parameters } = buildCreateRelationshipQuery(
      sourceId,
      targetId,
      relationshipType,
      properties
    );
    const results = await executeQuery(query, parameters);
    return results[0]?.r;
  },

  /**
   * Get insights for a subdomain
   */
  async getInsights(
    subdomain: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    const { query, parameters } = buildInsightsQuery(subdomain, startDate, endDate);
    return executeQuery(query, parameters);
  }
};
