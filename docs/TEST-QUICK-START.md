# Test Quick Start

Quick reference for running tests. See [TEST-SETUP-GUIDE.md](./TEST-SETUP-GUIDE.md) for detailed instructions.

## Prerequisites

```bash
# Ensure databases are running
# MongoDB: mongosh
# Neo4j: http://localhost:7474
```

## Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Start MongoDB (Docker)
docker run -d --name mongodb-test -p 27017:27017 mongo:6.0

# 3. Start Neo4j (Docker)
docker run -d --name neo4j-test -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/10101010 neo4j:5.12

# 4. Configure environment
cp .env.example .env
# Edit .env with database credentials

# 5. Run tests
npm test
```

## Common Commands

### Run All Tests
```bash
npm test                          # All workspaces
npm test -w packages/api-server   # API server only
npm test -w apps/pwa              # PWA only
npm test -w apps/desktop          # Desktop only
```

### Run Specific Tests
```bash
# By file
npm test -w packages/api-server -- src/database/mongodb.test.ts

# By pattern
npm test -- --testNamePattern="MongoDB"

# By directory
npm test -w packages/api-server -- src/routes/
```

### Watch Mode
```bash
npm run test:watch                        # All tests
npm run test:watch -w packages/api-server # API server only
```

### Coverage
```bash
npm run test:coverage                        # All tests
npm run test:coverage -w packages/api-server # API server only
```

## Test Organization

```
packages/api-server/src/
├── database/
│   ├── mongodb.test.ts           # ✅ Requires MongoDB
│   ├── neo4j.test.ts             # ✅ Requires Neo4j
│   ├── collections.test.ts       # ✅ Requires MongoDB
│   ├── queries.test.ts           # ✅ Requires Neo4j + test data
│   ├── migrations.test.ts        # ✅ Requires Neo4j
│   ├── dual-db-coordinator.test.ts
│   ├── graceful-degradation.test.ts
│   └── schema.test.ts
├── routes/
│   ├── financial.test.ts         # ⚡ Mocked
│   ├── health-data.test.ts       # ⚡ Mocked
│   ├── schedule.test.ts          # ⚡ Mocked
│   ├── relationships.test.ts     # ⚡ Mocked (requires Neo4j mock)
│   └── health.test.ts            # ⚡ Mocked
├── services/
│   └── sync-manager.test.ts      # ⚡ Mocked
├── config/
│   └── database.test.ts          # ⚡ Unit test
└── utils/
    └── logger.test.ts            # ⚡ Unit test

apps/pwa/
├── __tests__/
│   └── index.test.tsx
├── components/ui/
│   └── Button.test.tsx
└── lib/
    └── utils.test.ts

apps/desktop/src/renderer/
├── components/common/
│   └── Button.test.tsx
└── utils/
    └── utils.test.ts
```

Legend:
- ✅ Integration test - requires database
- ⚡ Unit/Mock test - no database needed

## Troubleshooting

### Tests Fail with Connection Errors
```bash
# Check if databases are running
mongosh                    # MongoDB
curl http://localhost:7474 # Neo4j Browser

# Restart databases
docker restart mongodb-test neo4j-test
```

### Clear Test Data
```bash
# MongoDB
mongosh personal-dashboard --eval "db.dropDatabase()"

# Neo4j (in cypher-shell or Neo4j Browser)
MATCH (n) DETACH DELETE n;
```

### Kill Processes on Ports
```bash
# Windows PowerShell
Get-NetTCPConnection -LocalPort 3001 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Unix/Linux
lsof -ti:3001 | xargs kill -9
```

### Update Test Dependencies
```bash
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom
```

## Environment Variables

Minimum required in `.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/personal-dashboard
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=10101010
NEO4J_DATABASE=neo4j

# API
API_PORT=3001
JWT_SECRET=test-secret
NODE_ENV=development
```

## Test Status

Current test coverage by workspace:

| Workspace | Tests | Status |
|-----------|-------|--------|
| API Server | 100+ | ⚠️ Requires databases |
| PWA | 19 | ✅ Passing |
| Desktop | 2 | ✅ Passing |

## CI/CD

Tests automatically run on:
- Every push to main branch
- Every pull request
- Nightly builds

Check workflow status: `.github/workflows/test.yml`

## Next Steps

1. ✅ Ensure databases are running
2. ✅ Run `npm test` to verify setup
3. ✅ Check failing tests in output
4. ✅ Review [TEST-SETUP-GUIDE.md](./TEST-SETUP-GUIDE.md) for details
5. ✅ Fix any configuration issues
6. ✅ Run tests in watch mode during development

## Tips

- **Speed up tests**: Run only the tests you're working on
- **Debug tests**: Use `--testNamePattern` to isolate specific tests
- **Coverage target**: Aim for >70% on critical business logic
- **Integration tests**: Run less frequently (slower, require DB)
- **Unit tests**: Run constantly in watch mode (fast, no dependencies)

For detailed troubleshooting, see [TEST-SETUP-GUIDE.md](./TEST-SETUP-GUIDE.md).
