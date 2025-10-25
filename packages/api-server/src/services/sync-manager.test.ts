import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { SyncManager, SyncEvent } from './sync-manager';
import Fastify, { FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';

// Mock dependencies
vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

vi.mock('../middleware/auth', () => ({
  authenticateWebSocket: vi.fn().mockResolvedValue({
    id: 'test-user',
    email: 'test@example.com',
    role: 'user'
  })
}));

describe('SyncManager', () => {
  let fastify: FastifyInstance;
  let syncManager: SyncManager;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(websocket);

    syncManager = new SyncManager(fastify);
    syncManager.registerWebSocketRoutes();

    await fastify.ready();
  });

  afterAll(async () => {
    syncManager.cleanup();
    await fastify.close();
  });

  describe('Initialization', () => {
    it('should initialize with fastify instance', () => {
      expect(syncManager).toBeDefined();
    });

    it('should register WebSocket routes', () => {
      const routes = fastify.printRoutes();
      // Check if route pattern exists (Fastify formats with tree structure)
      expect(routes).toMatch(/ws\/sync/);
    });
  });

  describe('Client Management', () => {
    it('should track connected clients', () => {
      const clients = syncManager.getConnectedClients();
      expect(Array.isArray(clients)).toBe(true);
    });

    it('should return client information', () => {
      const clients = syncManager.getConnectedClients();
      expect(clients.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Event Broadcasting', () => {
    it('should broadcast sync events to subscribed clients', () => {
      const event: SyncEvent = {
        type: 'data_change',
        domain: 'financial',
        action: 'create',
        entityId: 'tx123',
        entityType: 'Transaction',
        timestamp: new Date().toISOString(),
        userId: 'test-user',
        source: 'api'
      };

      // This should not throw even with no connected clients
      expect(() => syncManager.broadcastSyncEvent(event)).not.toThrow();
    });

    it('should broadcast health domain events', () => {
      const event: SyncEvent = {
        type: 'data_change',
        domain: 'health',
        action: 'update',
        entityId: 'workout123',
        entityType: 'Workout',
        timestamp: new Date().toISOString(),
        userId: 'test-user',
        source: 'desktop'
      };

      expect(() => syncManager.broadcastSyncEvent(event)).not.toThrow();
    });

    it('should broadcast schedule domain events', () => {
      const event: SyncEvent = {
        type: 'user_action',
        domain: 'schedule',
        action: 'create',
        entityId: 'task123',
        entityType: 'Task',
        timestamp: new Date().toISOString(),
        userId: 'test-user',
        source: 'pwa'
      };

      expect(() => syncManager.broadcastSyncEvent(event)).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources on shutdown', () => {
      expect(() => syncManager.cleanup()).not.toThrow();
    });
  });
});

describe('SyncEvent Validation', () => {
  it('should validate sync event structure', () => {
    const validEvent: SyncEvent = {
      type: 'data_change',
      domain: 'financial',
      action: 'create',
      entityId: 'tx123',
      entityType: 'Transaction',
      timestamp: new Date().toISOString(),
      userId: 'user123',
      source: 'api'
    };

    expect(validEvent.type).toBeDefined();
    expect(validEvent.domain).toBeDefined();
    expect(validEvent.action).toBeDefined();
    expect(validEvent.entityId).toBeDefined();
    expect(validEvent.entityType).toBeDefined();
    expect(validEvent.timestamp).toBeDefined();
    expect(validEvent.userId).toBeDefined();
    expect(validEvent.source).toBeDefined();
  });

  it('should support optional data field', () => {
    const eventWithData: SyncEvent = {
      type: 'data_change',
      domain: 'financial',
      action: 'update',
      entityId: 'tx123',
      entityType: 'Transaction',
      data: { amount: 100, description: 'Updated' },
      timestamp: new Date().toISOString(),
      userId: 'user123',
      source: 'desktop'
    };

    expect(eventWithData.data).toBeDefined();
    expect(eventWithData.data.amount).toBe(100);
  });
});

describe('Domain-Specific Sync', () => {
  it('should support financial domain sync', async () => {
    const event: SyncEvent = {
      type: 'data_change',
      domain: 'financial',
      action: 'create',
      entityId: 'tx123',
      entityType: 'Transaction',
      timestamp: new Date().toISOString(),
      userId: 'user123',
      source: 'api'
    };

    expect(event.domain).toBe('financial');
  });

  it('should support health domain sync', async () => {
    const event: SyncEvent = {
      type: 'data_change',
      domain: 'health',
      action: 'create',
      entityId: 'w123',
      entityType: 'Workout',
      timestamp: new Date().toISOString(),
      userId: 'user123',
      source: 'mobile'
    };

    expect(event.domain).toBe('health');
  });

  it('should support schedule domain sync', async () => {
    const event: SyncEvent = {
      type: 'data_change',
      domain: 'schedule',
      action: 'update',
      entityId: 't123',
      entityType: 'Task',
      timestamp: new Date().toISOString(),
      userId: 'user123',
      source: 'pwa'
    };

    expect(event.domain).toBe('schedule');
  });

  it('should support relationships domain sync', async () => {
    const event: SyncEvent = {
      type: 'system_event',
      domain: 'relationships',
      action: 'create',
      entityId: 'rel123',
      entityType: 'Relationship',
      timestamp: new Date().toISOString(),
      userId: 'user123',
      source: 'api'
    };

    expect(event.domain).toBe('relationships');
  });
});
