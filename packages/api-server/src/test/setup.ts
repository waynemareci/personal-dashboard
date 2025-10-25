import { beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load test environment variables
dotenv.config({ path: resolve(__dirname, '../../../.env.test') });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

// NOTE: Global mocks removed to allow integration tests to use real database connections.
// Unit tests that need mocking should explicitly define their own mocks using vi.mock()
// in the test files themselves (see routes/*.test.ts and services/*.test.ts for examples).

beforeAll(() => {
  // Setup test database or mocks
  console.log('Setting up test environment...');
});

afterAll(() => {
  // Cleanup after tests
  console.log('Cleaning up test environment...');
});