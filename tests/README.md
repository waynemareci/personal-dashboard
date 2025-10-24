# Tests

Comprehensive test suite covering unit, integration, and end-to-end testing.

## Test Structure

### 🧪 Unit Tests (`unit/`)
Fast, isolated tests for individual functions and components.

- **API Tests**: Route handlers, services, utilities
- **Frontend Tests**: Components, hooks, utilities  
- **Database Tests**: Schema validation, query logic

### 🔗 Integration Tests (`integration/`)
Tests for interactions between system components.

- **Sync Tests**: Multi-device synchronization
- **Relationship Tests**: Cross-domain connections
- **API Integration**: Database to API workflows

### 🌐 E2E Tests (`e2e/`)
Full user journey tests across all platforms.

- **Desktop E2E**: Electron app workflows
- **PWA E2E**: Mobile web experience
- **Cross-Platform**: Multi-device scenarios

## Running Tests

```bash
# Run all tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests (requires running services)
npm run test:e2e

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

## Testing Strategy

- **Fast Feedback**: Unit tests run on every commit
- **Integration CI**: Run on pull requests
- **E2E Staging**: Run before deployment
- **Performance**: Benchmark critical paths

## Test Data

- **Fixtures**: Realistic sample data for testing
- **Factories**: Generate test data dynamically
- **Cleanup**: Automatic test database cleanup

## Continuous Integration

Tests run automatically on:
- Every commit (unit tests)
- Pull requests (unit + integration)
- Before deployment (full suite)
