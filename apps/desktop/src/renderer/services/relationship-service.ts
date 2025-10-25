/**
 * Relationship Service
 *
 * Manages relationship operations, caching, and real-time updates via WebSocket.
 */

import { RelationshipQueries, GraphData, Entity, Relationship } from './neo4j-queries';
import { EventEmitter } from 'events';

export interface RelationshipUpdate {
  type: 'created' | 'updated' | 'deleted';
  relationshipId: string;
  sourceId: string;
  targetId: string;
  relationshipType: string;
  timestamp: string;
}

export interface EntityUpdate {
  type: 'created' | 'updated' | 'deleted';
  entityId: string;
  entityType: string;
  subdomain: string;
  timestamp: string;
}

/**
 * Relationship Service with caching and real-time updates
 */
export class RelationshipService extends EventEmitter {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes
  private wsConnection: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;

  constructor() {
    super();
    this.initializeWebSocket();
  }

  /**
   * Initialize WebSocket connection for real-time updates
   */
  private initializeWebSocket(): void {
    try {
      const wsUrl = window.api?.store?.get('wsUrl') || 'ws://localhost:3001';

      this.wsConnection = new WebSocket(wsUrl);

      this.wsConnection.onopen = () => {
        console.log('[RelationshipService] WebSocket connected');
        this.isConnected = true;
        this.emit('connected');

        // Subscribe to relationship updates
        this.send({
          type: 'subscribe',
          channels: ['relationships', 'entities']
        });
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('[RelationshipService] Failed to parse WebSocket message:', error);
        }
      };

      this.wsConnection.onerror = (error) => {
        console.error('[RelationshipService] WebSocket error:', error);
        this.emit('error', error);
      };

      this.wsConnection.onclose = () => {
        console.log('[RelationshipService] WebSocket disconnected');
        this.isConnected = false;
        this.emit('disconnected');
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('[RelationshipService] Failed to initialize WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule WebSocket reconnection
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      console.log('[RelationshipService] Attempting to reconnect...');
      this.reconnectTimer = null;
      this.initializeWebSocket();
    }, 5000); // Retry after 5 seconds
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'relationship_created':
      case 'relationship_updated':
      case 'relationship_deleted':
        this.handleRelationshipUpdate(message);
        break;

      case 'entity_created':
      case 'entity_updated':
      case 'entity_deleted':
        this.handleEntityUpdate(message);
        break;

      case 'data_change':
        // Invalidate cache for affected entity
        if (message.entityId) {
          this.invalidateCache(message.entityId);
        }
        this.emit('data_change', message);
        break;

      default:
        console.log('[RelationshipService] Unknown message type:', message.type);
    }
  }

  /**
   * Handle relationship updates
   */
  private handleRelationshipUpdate(message: RelationshipUpdate): void {
    console.log('[RelationshipService] Relationship update:', message);

    // Invalidate cache for affected entities
    this.invalidateCache(message.sourceId);
    this.invalidateCache(message.targetId);

    // Emit event for listeners
    this.emit('relationship_update', message);
  }

  /**
   * Handle entity updates
   */
  private handleEntityUpdate(message: EntityUpdate): void {
    console.log('[RelationshipService] Entity update:', message);

    // Invalidate cache for affected entity
    this.invalidateCache(message.entityId);

    // Emit event for listeners
    this.emit('entity_update', message);
  }

  /**
   * Send message via WebSocket
   */
  private send(message: any): void {
    if (this.wsConnection && this.isConnected) {
      this.wsConnection.send(JSON.stringify(message));
    }
  }

  /**
   * Get cached data or fetch if expired
   */
  private async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as T;
    }

    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * Invalidate cache for a specific entity
   */
  private invalidateCache(entityId: string): void {
    // Remove all cache entries related to this entity
    for (const key of this.cache.keys()) {
      if (key.includes(entityId)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get related entities for an entity (with caching)
   */
  public async getRelatedEntities(entityId: string, maxDepth: number = 1) {
    const cacheKey = `related:${entityId}:${maxDepth}`;
    return this.getOrFetch(cacheKey, () =>
      RelationshipQueries.getRelatedEntities(entityId, maxDepth)
    );
  }

  /**
   * Get graph data for visualization (with caching)
   */
  public async getGraphData(
    entityId: string,
    depth: number = 2,
    relationshipTypes?: string[]
  ): Promise<GraphData> {
    const cacheKey = `graph:${entityId}:${depth}:${relationshipTypes?.join(',')}`;
    return this.getOrFetch(cacheKey, () =>
      RelationshipQueries.getGraphData(entityId, depth, relationshipTypes)
    );
  }

  /**
   * Get temporal correlations
   */
  public async getTemporalCorrelations(
    entityId: string,
    timeWindow: number = 86400
  ) {
    const cacheKey = `temporal:${entityId}:${timeWindow}`;
    return this.getOrFetch(cacheKey, () =>
      RelationshipQueries.getTemporalCorrelations(entityId, timeWindow)
    );
  }

  /**
   * Get insights for a subdomain
   */
  public async getInsights(
    subdomain: string,
    startDate: Date,
    endDate: Date
  ) {
    const cacheKey = `insights:${subdomain}:${startDate.toISOString()}:${endDate.toISOString()}`;
    return this.getOrFetch(cacheKey, () =>
      RelationshipQueries.getInsights(subdomain, startDate, endDate)
    );
  }

  /**
   * Create a new relationship
   */
  public async createRelationship(
    sourceId: string,
    targetId: string,
    relationshipType: string,
    properties?: Record<string, any>
  ): Promise<Relationship> {
    const relationship = await RelationshipQueries.createRelationship(
      sourceId,
      targetId,
      relationshipType,
      properties
    );

    // Invalidate cache
    this.invalidateCache(sourceId);
    this.invalidateCache(targetId);

    // Emit event
    this.emit('relationship_created', {
      relationshipId: relationship.id,
      sourceId,
      targetId,
      relationshipType
    });

    return relationship;
  }

  /**
   * Disconnect WebSocket
   */
  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }

    this.isConnected = false;
  }

  /**
   * Check if WebSocket is connected
   */
  public isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
let relationshipServiceInstance: RelationshipService | null = null;

/**
 * Get the singleton relationship service instance
 */
export function getRelationshipService(): RelationshipService {
  if (!relationshipServiceInstance) {
    relationshipServiceInstance = new RelationshipService();
  }
  return relationshipServiceInstance;
}

/**
 * React hook for using the relationship service
 */
export function useRelationshipService() {
  return getRelationshipService();
}
