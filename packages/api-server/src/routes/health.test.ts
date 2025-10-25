import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import healthRoutes from './health';

// Mock the Neo4j connection
const mockNeo4jConnection = {
  healthCheck: vi.fn().mockResolvedValue({ status: 'healthy', latency: 5 })
};

vi.mock('../database/neo4j', () => ({
  getNeo4jConnection: vi.fn(() => mockNeo4jConnection)
}));

describe('Health Routes', () => {
  let app: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify({ logger: false });
    await app.register(healthRoutes);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.status).toBe('healthy');
      expect(body.timestamp).toBeDefined();
      expect(body.uptime).toBeDefined();
      expect(body.memory).toBeDefined();
      expect(body.services.neo4j.status).toBe('healthy');
      expect(body.services.neo4j.latency).toBe(5);
    });

    it('should handle Neo4j connection errors', async () => {
      mockNeo4jConnection.healthCheck.mockRejectedValueOnce(new Error('Connection failed'));

      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200); // Still returns 200 but marks as unavailable
      
      const body = JSON.parse(response.body);
      expect(body.services.neo4j.status).toBe('unavailable');
      expect(body.services.neo4j.error).toBe('Connection failed');
    });

    it('should include response time header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.headers['x-response-time']).toMatch(/\d+ms/);
    });
  });

  describe('GET /health/detailed', () => {
    it('should return detailed health information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed'
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.status).toBe('healthy');
      expect(body.system).toBeDefined();
      expect(body.system.uptime).toBeDefined();
      expect(body.system.memory).toBeDefined();
      expect(body.system.cpu).toBeDefined();
      expect(body.system.nodeVersion).toBeDefined();
      expect(body.system.platform).toBeDefined();
      expect(body.services.neo4j).toBeDefined();
      expect(body.database).toBeDefined();
    });

    it('should return 503 when Neo4j is unhealthy', async () => {
      mockNeo4jConnection.healthCheck.mockResolvedValueOnce({ status: 'unhealthy', error: 'Database down' });

      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed'
      });

      expect(response.statusCode).toBe(503);
      
      const body = JSON.parse(response.body);
      expect(body.status).toBe('unhealthy');
    });
  });

  describe('GET /health/database', () => {
    it('should return database-specific health info', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/database'
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.status).toBe('healthy');
      expect(body.latency).toBe(5);
      expect(body.timestamp).toBeDefined();
    });

    it('should return 503 when database is unhealthy', async () => {
      mockNeo4jConnection.healthCheck.mockResolvedValueOnce({ status: 'unhealthy', error: 'Connection timeout' });

      const response = await app.inject({
        method: 'GET',
        url: '/health/database'
      });

      expect(response.statusCode).toBe(503);
      
      const body = JSON.parse(response.body);
      expect(body.status).toBe('unhealthy');
      expect(body.error).toBe('Connection timeout');
    });

    it('should handle database connection errors gracefully', async () => {
      mockNeo4jConnection.healthCheck.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await app.inject({
        method: 'GET',
        url: '/health/database'
      });

      expect(response.statusCode).toBe(503);
      
      const body = JSON.parse(response.body);
      expect(body.status).toBe('unhealthy');
      expect(body.error).toBe('Database connection failed');
    });
  });
});