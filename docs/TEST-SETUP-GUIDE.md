# Test Setup Guide

This guide will help you set up and run tests for the Personal Dashboard project.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Database Setup](#database-setup)
  - [MongoDB Setup](#mongodb-setup)
  - [Neo4j Setup](#neo4j-setup)
- [Environment Configuration](#environment-configuration)
- [Running Tests](#running-tests)
- [Test Types](#test-types)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before running tests, ensure you have the following installed:

- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB (v6.0 or higher)
- Neo4j (v5.0 or higher)

## Database Setup

The test suite requires both MongoDB and Neo4j to be running for integration tests. You can either install them locally or use Docker.

### MongoDB Setup

#### Option 1: Local Installation

1. **Install MongoDB Community Edition**
   - Windows: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - macOS: `brew install mongodb-community@6.0`
   - Linux: Follow [official installation guide](https://docs.mongodb.com/manual/administration/install-on-linux/)

2. **Start MongoDB**
   ```bash
   # Windows (if installed as service, it starts automatically)
   mongod

   # macOS
   brew services start mongodb-community@6.0

   # Linux
   sudo systemctl start mongod
   ```

3. **Verify MongoDB is Running**
   ```bash
   mongosh
   # Should connect to mongodb://localhost:27017
   ```

#### Option 2: Docker

```bash
# Start MongoDB container
docker run -d \
  --name mongodb-test \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:6.0

# Verify it's running
docker ps | grep mongodb-test
```

### Neo4j Setup

#### Option 1: Neo4j Desktop

1. **Download and Install Neo4j Desktop**
   - Download from [Neo4j Download Center](https://neo4j.com/download/)
   - Create a new project
   - Create a new database with:
     - Password: `10101010` (or update `.env` file)
     - Version: 5.x

2. **Start the Database**
   - Click "Start" on your database in Neo4j Desktop
   - Default connection: `bolt://localhost:7687`

#### Option 2: Docker

```bash
# Start Neo4j container
docker run -d \
  --name neo4j-test \
  -p 7474:7474 \
  -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/10101010 \
  neo4j:5.12

# Wait for Neo4j to start (check logs)
docker logs -f neo4j-test

# Access Neo4j Browser: http://localhost:7474
# Username: neo4j
# Password: 10101010
```

#### Option 3: Neo4j AuraDB (Cloud)

1. Create free instance at [Neo4j Aura](https://neo4j.com/cloud/aura/)
2. Download connection credentials
3. Update `.env` with Aura URI and credentials

## Environment Configuration

1. **Copy the example environment file**
   ```bash
   cp .env.example .env
   ```
   (Or create `.env` if it doesn't exist)

2. **Configure Database Connections**

   Edit `.env` file:

   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/personal-dashboard

   # Neo4j Configuration
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=10101010
   NEO4J_DATABASE=neo4j

   # Redis Configuration (optional for most tests)
   REDIS_URL=redis://localhost:6379

   # API Configuration
   API_PORT=3001
   JWT_SECRET=test-jwt-secret-for-development
   JWT_REFRESH_SECRET=test-refresh-secret

   # Development Settings
   NODE_ENV=development
   LOG_LEVEL=debug
   ```

3. **Verify Database Connections**
   ```bash
   # Test MongoDB connection
   mongosh "mongodb://localhost:27017/personal-dashboard"

   # Test Neo4j connection
   cypher-shell -a bolt://localhost:7687 -u neo4j -p 10101010
   ```

## Running Tests

### Install Dependencies

```bash
# Install all dependencies
npm install

# Or install in specific workspace
npm install -w packages/api-server
```

### Run All Tests

```bash
# Run all tests across all workspaces
npm test

# Run tests in watch mode
npm run test:watch
```

### Run Tests by Workspace

```bash
# API Server tests (includes database integration tests)
npm test -w packages/api-server

# PWA tests (Jest)
npm test -w apps/pwa

# Desktop app tests (Vitest + Playwright)
npm test -w apps/desktop
```

### Run Specific Test Files

```bash
# Run a specific test file
npm test -w packages/api-server -- src/database/mongodb.test.ts

# Run tests matching a pattern
npm test -w packages/api-server -- --testNamePattern="MongoDB"

# Run tests for a specific suite
npm test -w packages/api-server -- src/routes/
```

### Run with Coverage

```bash
# Generate coverage report
npm run test:coverage

# Coverage for specific workspace
npm run test:coverage -w packages/api-server
```

## Test Types

### Unit Tests

**Location**: Throughout codebase (`.test.ts`, `.test.tsx` files)

**Requirements**: No external dependencies

**Examples**:
- `apps/pwa/lib/utils.test.ts` - Utility function tests
- `packages/api-server/src/utils/logger.test.ts` - Logger tests

**Run**: No special setup needed

```bash
npm test -- apps/pwa/lib/utils.test.ts
```

### Integration Tests

**Location**: `packages/api-server/src/database/`

**Requirements**: MongoDB and/or Neo4j running

**Examples**:
- `mongodb.test.ts` - MongoDB connection and operations
- `neo4j.test.ts` - Neo4j connection and queries
- `collections.test.ts` - MongoDB collection initialization
- `queries.test.ts` - Neo4j relationship queries
- `migrations.test.ts` - Neo4j migration system

**Run**: Ensure databases are running first

```bash
# Start databases first
# Then run integration tests
npm test -w packages/api-server -- src/database/
```

### API Route Tests

**Location**: `packages/api-server/src/routes/`

**Requirements**: Mocked authentication and database services

**Examples**:
- `financial.test.ts` - Financial API endpoints
- `health-data.test.ts` - Health metrics endpoints
- `schedule.test.ts` - Schedule and tasks endpoints
- `relationships.test.ts` - Knowledge graph endpoints

**Run**: No database required (uses mocks)

```bash
npm test -w packages/api-server -- src/routes/
```

### E2E Tests

**Location**: `apps/desktop/e2e/` (future)

**Requirements**: Full application stack running

**Status**: To be implemented

## Troubleshooting

### MongoDB Connection Issues

**Problem**: `ECONNREFUSED` or connection timeout errors

**Solutions**:
1. Verify MongoDB is running: `mongosh`
2. Check if port 27017 is in use: `netstat -ano | findstr :27017`
3. Check MongoDB logs for errors
4. Ensure no firewall blocking the connection

### Neo4j Connection Issues

**Problem**: `Failed to connect to server` or authentication errors

**Solutions**:
1. Verify Neo4j is running: Access http://localhost:7474
2. Check credentials match `.env` file
3. Ensure using `bolt://` protocol (not `neo4j://`)
4. Check Neo4j logs for errors
5. Try resetting password in Neo4j Desktop/Browser

### Test Failures Due to Missing Data

**Problem**: Tests fail because expected data doesn't exist

**Solutions**:
1. Tests should create their own test data in `beforeEach`
2. Check if test cleanup (`afterEach`) is running properly
3. Manually clear test databases:
   ```bash
   # MongoDB
   mongosh personal-dashboard --eval "db.dropDatabase()"

   # Neo4j (in cypher-shell)
   MATCH (n) DETACH DELETE n;
   ```

### Port Conflicts

**Problem**: Ports 3000, 3001, 7687, or 27017 already in use

**Solutions**:
1. Kill processes on conflicting ports:
   ```bash
   # Windows PowerShell
   Get-NetTCPConnection -LocalPort 3001 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

   # Or update ports in .env file
   ```

### Mock-Related Errors

**Problem**: `No "ClassName" export is defined on the "module" mock`

**Solutions**:
1. Check if test file is incorrectly mocking implementation modules
2. Only mock utility modules like logger, not database clients
3. Use `vi.importActual()` for partial mocks

**Example Fix**:
```typescript
// Bad - mocks the entire module
vi.mock('../database/mongodb');

// Good - only mocks the logger
vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn()
  }
}));
```

### Timeout Issues

**Problem**: Tests timeout waiting for database operations

**Solutions**:
1. Increase test timeout:
   ```typescript
   it('long running test', async () => {
     // ...
   }, 10000); // 10 second timeout
   ```
2. Check database connection is actually established
3. Ensure test data setup completes before running assertions

### Windows-Specific Issues

**Problem**: Path or command issues on Windows

**Solutions**:
1. Use PowerShell instead of CMD
2. Ensure paths use forward slashes or properly escaped backslashes
3. Run commands in Git Bash if Node scripts fail in PowerShell

## Best Practices

### 1. Database Isolation

- Each test file should use its own database name or collection
- Clean up test data in `afterEach` or `afterAll` hooks
- Never use production database credentials in tests

### 2. Test Independence

- Tests should not depend on execution order
- Each test should create its own required data
- Use `beforeEach` for setup, `afterEach` for cleanup

### 3. Mocking Strategy

- Mock external services (APIs, email, etc.)
- Don't mock database connections in integration tests
- Use actual databases for integration tests
- Use mocks for unit tests

### 4. Test Data

- Use descriptive IDs: `test-user-123`, not `user1`
- Use realistic but fake data
- Keep test data minimal but representative

### 5. Assertions

- Test one thing per test
- Use descriptive test names
- Assert on actual behavior, not implementation details

## Continuous Integration

For CI/CD pipelines (GitHub Actions, etc.):

```yaml
# Example GitHub Actions workflow
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:6.0
        ports:
          - 27017:27017

      neo4j:
        image: neo4j:5.12
        ports:
          - 7474:7474
          - 7687:7687
        env:
          NEO4J_AUTH: neo4j/10101010

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci
      - run: npm test
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Jest Documentation](https://jestjs.io/)
- [MongoDB Node Driver Docs](https://www.mongodb.com/docs/drivers/node/)
- [Neo4j JavaScript Driver Docs](https://neo4j.com/docs/javascript-manual/current/)
- [Fastify Testing Guide](https://www.fastify.io/docs/latest/Guides/Testing/)

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/yourusername/personal-dashboard/issues)
2. Review test output carefully for specific error messages
3. Check database logs for connection/query issues
4. Ensure all environment variables are correctly set
5. Create a new issue with:
   - Test command used
   - Full error output
   - Environment details (OS, Node version, etc.)
   - Database status (running/stopped)
