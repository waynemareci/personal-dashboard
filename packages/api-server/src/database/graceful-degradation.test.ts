import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GracefulDegradationService, getGracefulDegradationService } from './graceful-degradation';

// Mock dependencies
const mockNeo4j = {
  healthCheck: vi.fn(),
  executeQuery: vi.fn()
};

const mockMongoDB = {
  healthCheck: vi.fn()
};

vi.mock('./neo4j', () => ({
  getNeo4jConnection: vi.fn(() => mockNeo4j)
}));

vi.mock('./mongodb', () => ({
  getMongoDBConnection: vi.fn(() => mockMongoDB)
}));

// Mock timers
vi.useFakeTimers();

describe('GracefulDegradationService', () => {
  let service: GracefulDegradationService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();

    // Setup default healthy responses
    mockNeo4j.healthCheck.mockResolvedValue({ status: 'healthy' });
    mockMongoDB.healthCheck.mockResolvedValue({ status: 'healthy' });
    mockNeo4j.executeQuery.mockResolvedValue({ records: [] });

    service = new GracefulDegradationService({
      neo4jHealthCheckInterval: 1000,
      mongoHealthCheckInterval: 500,
      enableBackgroundSync: true
    });
  });

  afterEach(() => {
    service.stop();
    vi.clearAllTimers();
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      const defaultService = new GracefulDegradationService();
      const status = defaultService.getServiceStatus();
      
      expect(status.neo4j.available).toBe(false);
      expect(status.mongodb.available).toBe(false);
      
      defaultService.stop();
    });

    it('should start health checks on initialization', () => {
      expect(mockNeo4j.healthCheck).toHaveBeenCalled();
      expect(mockMongoDB.healthCheck).toHaveBeenCalled();
    });
  });

  describe('service status', () => {
    it('should detect healthy services', async () => {
      // Wait for initial health checks
      await vi.runOnlyPendingTimersAsync();

      const status = service.getServiceStatus();
      expect(status.neo4j.available).toBe(true);
      expect(status.mongodb.available).toBe(true);
    });

    it('should detect unhealthy Neo4j', async () => {
      mockNeo4j.healthCheck.mockResolvedValue({ status: 'unhealthy', error: 'Connection failed' });

      await vi.runOnlyPendingTimersAsync();

      const status = service.getServiceStatus();
      expect(status.neo4j.available).toBe(false);
      expect(status.neo4j.error).toBe('Connection failed');
    });

    it('should detect Neo4j connection errors', async () => {
      mockNeo4j.healthCheck.mockRejectedValue(new Error('Network error'));

      await vi.runOnlyPendingTimersAsync();

      const status = service.getServiceStatus();
      expect(status.neo4j.available).toBe(false);
      expect(status.neo4j.error).toBe('Network error');
    });

    it('should detect unhealthy MongoDB', async () => {
      mockMongoDB.healthCheck.mockResolvedValue({ status: 'unhealthy', error: 'Timeout' });

      await vi.runOnlyPendingTimersAsync();

      const status = service.getServiceStatus();
      expect(status.mongodb.available).toBe(false);
      expect(status.mongodb.error).toBe('Timeout');
    });
  });

  describe('operation availability', () => {
    it('should allow Neo4j operations when healthy', async () => {
      await vi.runOnlyPendingTimersAsync();
      expect(service.shouldAttemptNeo4j()).toBe(true);
    });

    it('should prevent Neo4j operations when unhealthy', async () => {
      mockNeo4j.healthCheck.mockResolvedValue({ status: 'unhealthy' });
      await vi.runOnlyPendingTimersAsync();
      expect(service.shouldAttemptNeo4j()).toBe(false);
    });

    it('should allow MongoDB operations when healthy', async () => {
      await vi.runOnlyPendingTimersAsync();
      expect(service.shouldAttemptMongoDB()).toBe(true);
    });
  });

  describe('unsynced operations queue', () => {
    it('should queue operations when Neo4j unavailable', () => {
      service.queueUnsyncedOperation(
        'create',
        'users',
        'user-123',
        ['User'],
        { name: 'John Doe' }
      );

      const stats = service.getUnsyncedStats();
      expect(stats.totalQueued).toBe(1);
      expect(stats.operationTypes.create).toBe(1);
    });

    it('should not queue operations when background sync disabled', () => {
      const noSyncService = new GracefulDegradationService({ 
        enableBackgroundSync: false 
      });

      noSyncService.queueUnsyncedOperation(
        'create',
        'users',
        'user-123',
        ['User'],
        { name: 'John Doe' }
      );

      const stats = noSyncService.getUnsyncedStats();
      expect(stats.totalQueued).toBe(0);
      
      noSyncService.stop();
    });

    it('should limit queue size to prevent memory overflow', () => {
      // Queue more than 1000 operations
      for (let i = 0; i < 1100; i++) {
        service.queueUnsyncedOperation(
          'create',
          'users',
          `user-${i}`,
          ['User'],
          { name: `User ${i}` }
        );
      }

      const stats = service.getUnsyncedStats();
      expect(stats.totalQueued).toBe(1000); // Should be limited to 1000
    });

    it('should track operation statistics correctly', () => {
      service.queueUnsyncedOperation('create', 'users', 'user-1', ['User'], {});
      service.queueUnsyncedOperation('update', 'users', 'user-2', ['User'], {});
      service.queueUnsyncedOperation('create', 'tasks', 'task-1', ['Task'], {});
      service.queueUnsyncedOperation('delete', 'users', 'user-3', ['User'], {});

      const stats = service.getUnsyncedStats();
      expect(stats.totalQueued).toBe(4);
      expect(stats.operationTypes.create).toBe(2);
      expect(stats.operationTypes.update).toBe(1);
      expect(stats.operationTypes.delete).toBe(1);
      expect(stats.oldestOperation).toBeDefined();
      expect(stats.newestOperation).toBeDefined();
    });

    it('should clear unsynced operations', () => {
      service.queueUnsyncedOperation('create', 'users', 'user-1', ['User'], {});
      service.queueUnsyncedOperation('update', 'users', 'user-2', ['User'], {});

      expect(service.getUnsyncedStats().totalQueued).toBe(2);

      service.clearUnsyncedOperations();
      expect(service.getUnsyncedStats().totalQueued).toBe(0);
    });
  });

  describe('background sync processing', () => {
    beforeEach(async () => {
      // Start with Neo4j unavailable
      mockNeo4j.healthCheck.mockResolvedValue({ status: 'unhealthy' });
      await vi.runOnlyPendingTimersAsync();
    });

    it('should process queued operations when Neo4j becomes available', async () => {
      // Queue some operations while Neo4j is down
      service.queueUnsyncedOperation('create', 'users', 'user-1', ['User'], { name: 'John' });
      service.queueUnsyncedOperation('update', 'tasks', 'task-1', ['Task'], { title: 'Updated' });

      expect(service.getUnsyncedStats().totalQueued).toBe(2);

      // Neo4j becomes available
      mockNeo4j.healthCheck.mockResolvedValue({ status: 'healthy' });
      
      // Advance timer to trigger health check
      await vi.runOnlyPendingTimersAsync();

      // Operations should be processed
      expect(mockNeo4j.executeQuery).toHaveBeenCalledTimes(2);
      expect(service.getUnsyncedStats().totalQueued).toBe(0);
    });

    it('should handle sync errors and retry', async () => {
      service.queueUnsyncedOperation('create', 'users', 'user-1', ['User'], { name: 'John' });

      // First attempt fails
      mockNeo4j.executeQuery.mockRejectedValueOnce(new Error('Temporary error'));
      mockNeo4j.healthCheck.mockResolvedValue({ status: 'healthy' });

      await vi.runOnlyPendingTimersAsync();

      // Operation should be retried (still in queue)
      const stats = service.getUnsyncedStats();
      expect(stats.totalQueued).toBe(1);

      // Second health check - should retry
      mockNeo4j.executeQuery.mockResolvedValue({ records: [] });
      await vi.runOnlyPendingTimersAsync();

      // Should succeed on retry
      expect(service.getUnsyncedStats().totalQueued).toBe(0);
    });

    it('should permanently fail operations after max retries', async () => {
      const limitedRetryService = new GracefulDegradationService({
        maxRetryAttempts: 2,
        enableBackgroundSync: true
      });

      limitedRetryService.queueUnsyncedOperation('create', 'users', 'user-1', ['User'], { name: 'John' });

      // Neo4j becomes available but operations keep failing
      mockNeo4j.healthCheck.mockResolvedValue({ status: 'healthy' });
      mockNeo4j.executeQuery.mockRejectedValue(new Error('Persistent error'));

      // Process multiple health checks to exceed retry limit
      await vi.runOnlyPendingTimersAsync(); // First attempt
      await vi.runOnlyPendingTimersAsync(); // Second attempt
      await vi.runOnlyPendingTimersAsync(); // Third attempt (should be permanently failed)

      // Operation should be permanently removed after max retries
      expect(limitedRetryService.getUnsyncedStats().totalQueued).toBe(0);
      
      limitedRetryService.stop();
    });
  });

  describe('health check intervals', () => {
    it('should perform health checks at specified intervals', async () => {
      const initialCalls = mockNeo4j.healthCheck.mock.calls.length;
      
      // Advance time by one interval
      vi.advanceTimersByTime(1000);
      await vi.runOnlyPendingTimersAsync();

      expect(mockNeo4j.healthCheck.mock.calls.length).toBeGreaterThan(initialCalls);
    });

    it('should perform MongoDB health checks at different interval', async () => {
      const initialCalls = mockMongoDB.healthCheck.mock.calls.length;
      
      // Advance time by MongoDB interval
      vi.advanceTimersByTime(500);
      await vi.runOnlyPendingTimersAsync();

      expect(mockMongoDB.healthCheck.mock.calls.length).toBeGreaterThan(initialCalls);
    });
  });

  describe('service lifecycle', () => {
    it('should stop health checks when stopped', () => {
      service.stop();
      
      const neo4jCallsBefore = mockNeo4j.healthCheck.mock.calls.length;
      const mongoCallsBefore = mockMongoDB.healthCheck.mock.calls.length;

      // Advance timers - no new calls should be made
      vi.advanceTimersByTime(5000);

      expect(mockNeo4j.healthCheck.mock.calls.length).toBe(neo4jCallsBefore);
      expect(mockMongoDB.healthCheck.mock.calls.length).toBe(mongoCallsBefore);
    });
  });

  describe('singleton', () => {
    it('should return same instance', () => {
      const instance1 = getGracefulDegradationService();
      const instance2 = getGracefulDegradationService();
      expect(instance1).toBe(instance2);
      
      instance1.stop();
    });
  });
});