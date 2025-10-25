import { WebSocket } from 'ws';
import { FastifyInstance } from 'fastify';
import { logger } from '../utils/logger';
import { AuthUser, authenticateWebSocket } from '../middleware/auth';

export interface SyncEvent {
  type: 'data_change' | 'user_action' | 'system_event';
  domain: 'financial' | 'health' | 'schedule' | 'relationships';
  action: 'create' | 'update' | 'delete';
  entityId: string;
  entityType: string;
  data?: any;
  timestamp: string;
  userId: string;
  source: 'desktop' | 'pwa' | 'mobile' | 'api';
}

interface ConnectedClient {
  id: string;
  user: AuthUser;
  socket: WebSocket;
  subscribedDomains: string[];
  deviceType: string;
  lastPing: Date;
}

export class SyncManager {
  private clients = new Map<string, ConnectedClient>();
  private fastify: FastifyInstance;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.startPingInterval();
  }

  /**
   * Register WebSocket routes and handlers
   */
  registerWebSocketRoutes() {
    this.fastify.register(async (fastify) => {
      // Main sync WebSocket endpoint
      fastify.get('/ws/sync', { 
        websocket: true,
        schema: {
          tags: ['websocket'],
          description: 'Real-time synchronization WebSocket endpoint',
          querystring: {
            type: 'object',
            properties: {
              token: { type: 'string', description: 'JWT authentication token' },
              device: { type: 'string', description: 'Device type (desktop/pwa/mobile)' }
            }
          }
        }
      }, async (connection, request) => {
        await this.handleWebSocketConnection(connection, request);
      });

      // Domain-specific sync endpoints
      const domains = ['financial', 'health', 'schedule', 'relationships'];
      
      for (const domain of domains) {
        fastify.get(`/ws/sync/${domain}`, { 
          websocket: true,
          schema: {
            tags: ['websocket'],
            description: `Real-time synchronization for ${domain} domain`,
            querystring: {
              type: 'object',
              properties: {
                token: { type: 'string', description: 'JWT authentication token' },
                device: { type: 'string', description: 'Device type (desktop/pwa/mobile)' }
              }
            }
          }
        }, async (connection, request) => {
          await this.handleDomainWebSocketConnection(connection, request, domain);
        });
      }
    });
  }

  /**
   * Handle new WebSocket connection
   */
  private async handleWebSocketConnection(connection: any, request: any) {
    try {
      // Authenticate user
      const user = await authenticateWebSocket(request);
      if (!user) {
        logger.warn('Unauthorized WebSocket connection attempt');
        connection.socket.close(1008, 'Unauthorized');
        return;
      }

      const clientId = this.generateClientId();
      const deviceType = (request.query?.device as string) || 'unknown';

      const client: ConnectedClient = {
        id: clientId,
        user,
        socket: connection.socket,
        subscribedDomains: ['financial', 'health', 'schedule', 'relationships'],
        deviceType,
        lastPing: new Date()
      };

      this.clients.set(clientId, client);

      logger.info(`WebSocket client connected: ${user.email} (${clientId}) from ${deviceType}`);

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'system_event',
        domain: 'system' as any,
        action: 'connect' as any,
        entityId: clientId,
        entityType: 'connection',
        data: {
          message: 'Connected to Personal Dashboard sync server',
          clientId,
          subscribedDomains: client.subscribedDomains
        },
        timestamp: new Date().toISOString(),
        userId: user.id,
        source: deviceType as any
      });

      // Handle messages
      connection.socket.on('message', (message: Buffer) => {
        this.handleClientMessage(clientId, message);
      });

      // Handle connection close
      connection.socket.on('close', () => {
        this.handleClientDisconnect(clientId);
      });

      // Handle errors
      connection.socket.on('error', (error: Error) => {
        logger.error(`WebSocket error for client ${clientId}:`, error);
        this.handleClientDisconnect(clientId);
      });

      // Update ping timestamp on pong
      connection.socket.on('pong', () => {
        const client = this.clients.get(clientId);
        if (client) {
          client.lastPing = new Date();
        }
      });

    } catch (error) {
      logger.error('Error handling WebSocket connection:', error);
      connection.socket.close(1011, 'Internal server error');
    }
  }

  /**
   * Handle domain-specific WebSocket connection
   */
  private async handleDomainWebSocketConnection(connection: any, request: any, domain: string) {
    try {
      const user = await authenticateWebSocket(request);
      if (!user) {
        logger.warn(`Unauthorized ${domain} WebSocket connection attempt`);
        connection.socket.close(1008, 'Unauthorized');
        return;
      }

      const clientId = this.generateClientId();
      const deviceType = (request.query?.device as string) || 'unknown';

      const client: ConnectedClient = {
        id: clientId,
        user,
        socket: connection.socket,
        subscribedDomains: [domain],
        deviceType,
        lastPing: new Date()
      };

      this.clients.set(clientId, client);

      logger.info(`${domain} WebSocket client connected: ${user.email} (${clientId})`);

      // Similar event handling as main connection
      connection.socket.on('message', (message: Buffer) => {
        this.handleClientMessage(clientId, message);
      });

      connection.socket.on('close', () => {
        this.handleClientDisconnect(clientId);
      });

      connection.socket.on('error', (error: Error) => {
        logger.error(`${domain} WebSocket error for client ${clientId}:`, error);
        this.handleClientDisconnect(clientId);
      });

    } catch (error) {
      logger.error(`Error handling ${domain} WebSocket connection:`, error);
      connection.socket.close(1011, 'Internal server error');
    }
  }

  /**
   * Handle incoming client message
   */
  private handleClientMessage(clientId: string, message: Buffer) {
    try {
      const client = this.clients.get(clientId);
      if (!client) return;

      const data = JSON.parse(message.toString());
      
      // Handle different message types
      switch (data.type) {
        case 'ping':
          client.lastPing = new Date();
          this.sendToClient(clientId, { ...data, type: 'pong' });
          break;
          
        case 'subscribe':
          this.handleSubscription(clientId, data);
          break;
          
        case 'unsubscribe':
          this.handleUnsubscription(clientId, data);
          break;
          
        case 'sync_request':
          this.handleSyncRequest(clientId, data);
          break;
          
        default:
          logger.debug(`Unknown message type from client ${clientId}: ${data.type}`);
      }
    } catch (error) {
      logger.error(`Error processing message from client ${clientId}:`, error);
    }
  }

  /**
   * Handle client subscription to domains
   */
  private handleSubscription(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const domains = Array.isArray(data.domains) ? data.domains : [data.domain];
    const validDomains = domains.filter((d: string) => 
      ['financial', 'health', 'schedule', 'relationships'].includes(d)
    );

    for (const domain of validDomains) {
      if (!client.subscribedDomains.includes(domain)) {
        client.subscribedDomains.push(domain);
      }
    }

    logger.debug(`Client ${clientId} subscribed to domains: ${validDomains.join(', ')}`);

    this.sendToClient(clientId, {
      type: 'system_event',
      domain: 'system' as any,
      action: 'subscribe' as any,
      entityId: clientId,
      entityType: 'subscription',
      data: { subscribedDomains: client.subscribedDomains },
      timestamp: new Date().toISOString(),
      userId: client.user.id,
      source: client.deviceType as any
    });
  }

  /**
   * Handle client unsubscription from domains
   */
  private handleUnsubscription(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const domains = Array.isArray(data.domains) ? data.domains : [data.domain];
    
    for (const domain of domains) {
      const index = client.subscribedDomains.indexOf(domain);
      if (index > -1) {
        client.subscribedDomains.splice(index, 1);
      }
    }

    logger.debug(`Client ${clientId} unsubscribed from domains: ${domains.join(', ')}`);
  }

  /**
   * Handle sync request from client
   */
  private handleSyncRequest(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // TODO: Implement actual sync logic based on last sync timestamp
    // For now, acknowledge the sync request
    this.sendToClient(clientId, {
      type: 'system_event',
      domain: data.domain || 'system' as any,
      action: 'sync_complete' as any,
      entityId: data.entityId || 'all',
      entityType: 'sync',
      data: { 
        lastSyncTime: data.lastSyncTime,
        newSyncTime: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      userId: client.user.id,
      source: 'api'
    });
  }

  /**
   * Handle client disconnect
   */
  private handleClientDisconnect(clientId: string) {
    const client = this.clients.get(clientId);
    if (client) {
      logger.info(`WebSocket client disconnected: ${client.user.email} (${clientId})`);
      this.clients.delete(clientId);
    }
  }

  /**
   * Broadcast sync event to relevant clients
   */
  broadcastSyncEvent(event: SyncEvent) {
    let broadcastCount = 0;

    for (const [clientId, client] of this.clients) {
      // Check if client is subscribed to this domain
      if (!client.subscribedDomains.includes(event.domain)) {
        continue;
      }

      // Don't send event back to the originating user (optional)
      if (client.user.id === event.userId) {
        continue;
      }

      this.sendToClient(clientId, event);
      broadcastCount++;
    }

    logger.debug(`Broadcasted ${event.domain} ${event.action} event to ${broadcastCount} clients`);
  }

  /**
   * Send message to specific client
   */
  private sendToClient(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (!client || client.socket.readyState !== client.socket.OPEN) {
      return false;
    }

    try {
      client.socket.send(JSON.stringify(data));
      return true;
    } catch (error) {
      logger.error(`Failed to send message to client ${clientId}:`, error);
      this.handleClientDisconnect(clientId);
      return false;
    }
  }

  /**
   * Get connected clients info
   */
  getConnectedClients() {
    return Array.from(this.clients.values()).map(client => ({
      id: client.id,
      userId: client.user.id,
      email: client.user.email,
      deviceType: client.deviceType,
      subscribedDomains: client.subscribedDomains,
      lastPing: client.lastPing,
      connected: client.socket.readyState === client.socket.OPEN
    }));
  }

  /**
   * Start ping interval to check client health
   */
  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      const now = new Date();
      const timeout = 60000; // 60 seconds

      for (const [clientId, client] of this.clients) {
        if (now.getTime() - client.lastPing.getTime() > timeout) {
          logger.warn(`Client ${clientId} ping timeout, disconnecting`);
          this.handleClientDisconnect(clientId);
        } else if (client.socket.readyState === client.socket.OPEN) {
          try {
            client.socket.ping();
          } catch (error) {
            logger.error(`Failed to ping client ${clientId}:`, error);
            this.handleClientDisconnect(clientId);
          }
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sync a specific entity to connected clients
   */
  async syncEntity(
    entityId: string,
    domain: 'financial' | 'health' | 'schedule' | 'relationships',
    entityType: string,
    action: 'create' | 'update' | 'delete',
    data?: any
  ) {
    const syncEvent: SyncEvent = {
      type: 'data_change',
      domain,
      action,
      entityId,
      entityType,
      data,
      timestamp: new Date().toISOString(),
      userId: '', // Will be set when broadcasting to specific users
      source: 'api'
    };

    this.broadcastSyncEvent(syncEvent);
    logger.debug(`Synced ${entityType} entity ${entityId} (${action}) in ${domain} domain`);
  }

  /**
   * Cleanup sync manager
   */
  cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    // Close all client connections
    for (const [clientId, client] of this.clients) {
      try {
        client.socket.close(1001, 'Server shutting down');
      } catch (error) {
        logger.error(`Error closing connection for client ${clientId}:`, error);
      }
    }

    this.clients.clear();
    logger.info('SyncManager cleanup completed');
  }
}

// Singleton instance
let syncManagerInstance: SyncManager | null = null;

/**
 * Create and configure sync manager
 */
export function createSyncManager(fastify: FastifyInstance): SyncManager {
  const syncManager = new SyncManager(fastify);
  syncManager.registerWebSocketRoutes();
  syncManagerInstance = syncManager;
  return syncManager;
}

/**
 * Get the singleton sync manager instance
 * @throws Error if sync manager hasn't been created yet
 */
export function getSyncManager(): SyncManager {
  if (!syncManagerInstance) {
    throw new Error('SyncManager not initialized. Call createSyncManager first.');
  }
  return syncManagerInstance;
}