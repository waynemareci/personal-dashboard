import { beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load test environment variables
dotenv.config({ path: resolve(__dirname, '../../../.env.test') });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

// Mock Neo4j driver for tests
const mockNeo4jConnection = {
  connect: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  executeQuery: vi.fn().mockResolvedValue({ records: [] }),
  executeTransaction: vi.fn().mockResolvedValue(undefined),
  healthCheck: vi.fn().mockResolvedValue({ status: 'healthy', latency: 1 }),
  getSession: vi.fn().mockReturnValue({
    run: vi.fn().mockResolvedValue({ records: [] }),
    close: vi.fn().mockResolvedValue(undefined),
    executeWrite: vi.fn().mockResolvedValue(undefined)
  }),
  isConnected: vi.fn().mockReturnValue(true)
};

// Mock the Neo4j connection module
vi.mock('../database/neo4j', () => ({
  initializeNeo4j: vi.fn().mockReturnValue(mockNeo4jConnection),
  getNeo4jConnection: vi.fn().mockReturnValue(mockNeo4jConnection),
  closeNeo4jConnection: vi.fn().mockResolvedValue(undefined)
}));

beforeAll(() => {
  // Setup test database or mocks
  console.log('Setting up test environment...');
});

afterAll(() => {
  // Cleanup after tests
  console.log('Cleaning up test environment...');
});