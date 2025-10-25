import { describe, it, expect, beforeEach } from 'vitest';
import { getDatabaseConfig } from './database';

describe('Database Configuration', () => {
  beforeEach(() => {
    // Clear environment variables before each test
    delete process.env.NEO4J_URI;
    delete process.env.NEO4J_USERNAME;
    delete process.env.NEO4J_PASSWORD;
    delete process.env.NEO4J_DATABASE;
    delete process.env.MONGODB_URI;
    delete process.env.MONGODB_DATABASE;
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
  });

  it('should return default configuration when no environment variables are set', () => {
    const config = getDatabaseConfig();
    
    expect(config.neo4j.uri).toBe('bolt://localhost:7687');
    expect(config.neo4j.username).toBe('neo4j');
    expect(config.neo4j.password).toBe('password');
    expect(config.neo4j.database).toBe('neo4j');
    expect(config.mongodb.uri).toBe('mongodb://localhost:27017');
    expect(config.mongodb.database).toBe('personal_dashboard');
    expect(config.redis.host).toBe('localhost');
    expect(config.redis.port).toBe(6379);
  });

  it('should use environment variables when provided', () => {
    process.env.NEO4J_URI = 'bolt://test-host:7687';
    process.env.NEO4J_USERNAME = 'test-user';
    process.env.NEO4J_PASSWORD = 'test-password';
    process.env.NEO4J_DATABASE = 'test-db';
    process.env.MONGODB_URI = 'mongodb://test-mongo:27017';
    process.env.MONGODB_DATABASE = 'test_dashboard';
    process.env.REDIS_HOST = 'test-redis';
    process.env.REDIS_PORT = '6380';

    const config = getDatabaseConfig();
    
    expect(config.neo4j.uri).toBe('bolt://test-host:7687');
    expect(config.neo4j.username).toBe('test-user');
    expect(config.neo4j.password).toBe('test-password');
    expect(config.neo4j.database).toBe('test-db');
    expect(config.mongodb.uri).toBe('mongodb://test-mongo:27017');
    expect(config.mongodb.database).toBe('test_dashboard');
    expect(config.redis.host).toBe('test-redis');
    expect(config.redis.port).toBe(6380);
  });

  it('should handle invalid Redis port gracefully', () => {
    process.env.REDIS_PORT = 'invalid';
    
    const config = getDatabaseConfig();
    
    expect(config.redis.port).toBeNaN();
  });
});