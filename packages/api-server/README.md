# Personal Dashboard API Server

Fastify-based API server with dual-database architecture (MongoDB + Neo4j) and real-time WebSocket synchronization.

## Features

- **Dual Database Architecture**: MongoDB for operational data, Neo4j for relationship graphs
- **Real-time Sync**: WebSocket-based multi-device synchronization
- **Graceful Degradation**: Continues operation even when databases are unavailable
- **Transaction Coordination**: Ensures consistency across both databases
- **Domain-Driven Design**: Organized by business domains (financial, health, schedule)
- **Comprehensive API Documentation**: Auto-generated Swagger/OpenAPI docs

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6.0+
- Neo4j 5.0+

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Start development server
npm run dev
```

The API will be available at http://localhost:3001

API Documentation: http://localhost:3001/docs

## API Endpoints

### Health & Status

- `GET /health` - Health check endpoint
- `GET /api/v1/status` - API server status

### Authentication

- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh authentication token

### Financial Domain

- `GET /api/financial/transactions` - Get user transactions
- `POST /api/financial/transactions` - Create transaction
- `GET /api/financial/accounts` - Get user accounts
- `POST /api/financial/accounts` - Create account

### Health Domain

- `GET /api/health/metrics` - Get health metrics
- `POST /api/health/metrics` - Record health metric
- `GET /api/health/workouts` - Get workouts
- `POST /api/health/workouts` - Create workout
- `GET /api/health/meals` - Get meals
- `POST /api/health/meals` - Record meal

### Schedule Domain

- `GET /api/schedule/tasks` - Get tasks
- `POST /api/schedule/tasks` - Create task
- `GET /api/schedule/events` - Get calendar events
- `POST /api/schedule/events` - Create event
- `GET /api/schedule/projects` - Get projects
- `POST /api/schedule/projects` - Create project

### Relationships (Knowledge Graph)

- `GET /api/relationships/graph` - Get user's knowledge graph
- `GET /api/relationships/discover` - Discover relationship patterns
- `POST /api/relationships/connect` - Create custom relationship
- `GET /api/relationships/analytics` - Get relationship analytics

### WebSocket

- `WS /ws/sync` - Main synchronization endpoint
- `WS /ws/sync/financial` - Financial domain sync
- `WS /ws/sync/health` - Health domain sync
- `WS /ws/sync/schedule` - Schedule domain sync
- `WS /ws/sync/relationships` - Relationships domain sync

## Architecture

### Database Strategy

**MongoDB** (Operational Data)
- Fast CRUD operations
- Document storage for entities
- Indexed collections for quick queries
- Transaction support for consistency

**Neo4j** (Relationship Data)
- Graph-based relationships
- Pattern discovery across domains
- Cross-domain insights
- Temporal relationship tracking

### Directory Structure

```
src/
├── config/              # Configuration management
│   └── database.ts      # Database connection config
├── database/            # Database layer
│   ├── mongodb.ts       # MongoDB connection
│   ├── neo4j.ts         # Neo4j connection
│   ├── collections.ts   # MongoDB collections & indexes
│   ├── queries.ts       # Neo4j relationship queries
│   ├── migrations.ts    # Neo4j migration system
│   ├── schema.ts        # Schema definitions
│   ├── dual-db-coordinator.ts  # Dual-DB transactions
│   └── graceful-degradation.ts # Failover handling
├── routes/              # API route handlers
│   ├── health.ts        # Health check routes
│   ├── financial.ts     # Financial API
│   ├── health-data.ts   # Health metrics API
│   ├── schedule.ts      # Schedule/tasks API
│   └── relationships.ts # Knowledge graph API
├── services/            # Business logic
│   └── sync-manager.ts  # Real-time sync management
├── middleware/          # Express/Fastify middleware
│   └── auth.ts          # Authentication middleware
├── models/              # Data models & types
│   └── financial.ts     # Financial domain models
├── utils/               # Utility functions
│   └── logger.ts        # Logging utility
└── index.ts             # Application entry point
```

## Testing

### Test Suite

We have comprehensive test coverage across multiple layers:

**Integration Tests** (require databases):
- `mongodb.test.ts` - MongoDB operations
- `neo4j.test.ts` - Neo4j queries & transactions
- `collections.test.ts` - Collection initialization
- `queries.test.ts` - Relationship discovery
- `migrations.test.ts` - Migration system

**Unit Tests** (mocked):
- `financial.test.ts` - Financial routes
- `health-data.test.ts` - Health routes
- `schedule.test.ts` - Schedule routes
- `relationships.test.ts` - Relationship routes
- `sync-manager.test.ts` - WebSocket sync
- `logger.test.ts` - Logging utilities
- `database.test.ts` - Config management

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# Specific test file
npm test -- src/database/mongodb.test.ts

# Integration tests only (requires databases)
npm test -- src/database/

# Unit tests only (no databases needed)
npm test -- src/routes/
```

### Test Setup

See [../../docs/TEST-SETUP-GUIDE.md](../../docs/TEST-SETUP-GUIDE.md) for detailed setup instructions.

**Quick Setup**:

1. Start MongoDB:
   ```bash
   docker run -d --name mongodb-test -p 27017:27017 mongo:6.0
   ```

2. Start Neo4j:
   ```bash
   docker run -d --name neo4j-test -p 7474:7474 -p 7687:7687 \
     -e NEO4J_AUTH=neo4j/10101010 neo4j:5.12
   ```

3. Run tests:
   ```bash
   npm test
   ```

## Development

### Start Development Server

```bash
npm run dev
```

Server will restart automatically on file changes.

### Environment Variables

Required in `.env`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/personal-dashboard

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=10101010
NEO4J_DATABASE=neo4j

# Redis (optional)
REDIS_URL=redis://localhost:6379

# API
API_PORT=3001
API_HOST=0.0.0.0
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Environment
NODE_ENV=development
LOG_LEVEL=debug
```

### Building for Production

```bash
# Build
npm run build

# Start production server
npm start
```

## Database Management

### MongoDB Collections

Automatically initialized on startup:
- `users` - User accounts
- `financial_transactions` - Financial transactions
- `financial_accounts` - Bank/credit accounts
- `monthly_budgets` - Budget tracking
- `health_metrics` - Health measurements
- `meals` - Nutrition tracking
- `workouts` - Exercise sessions
- `tasks` - Todo items
- `calendar_events` - Calendar entries
- `projects` - Project management

### Neo4j Migrations

```bash
# Run migrations
npm run migrate

# Create new migration
npm run migrate:create "migration_name"

# Check migration status
npm run migrate:status
```

### Manual Database Operations

**MongoDB**:
```bash
# Connect to MongoDB
mongosh "mongodb://localhost:27017/personal-dashboard"

# List collections
show collections

# Drop database (careful!)
db.dropDatabase()
```

**Neo4j**:
```bash
# Connect to Neo4j
cypher-shell -a bolt://localhost:7687 -u neo4j -p 10101010

# View schema
CALL db.schema.visualization();

# Clear all data (careful!)
MATCH (n) DETACH DELETE n;
```

## API Authentication

All API endpoints (except `/health` and `/auth/*`) require JWT authentication.

### Getting a Token

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "token": "eyJhbGc...",
  "refreshToken": "refresh_eyJhbGc...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### Using the Token

```bash
curl http://localhost:3001/api/financial/transactions \
  -H "Authorization: Bearer eyJhbGc..."
```

## WebSocket Connection

### Connect to Sync Server

```javascript
const ws = new WebSocket('ws://localhost:3001/ws/sync?token=YOUR_JWT_TOKEN&device=desktop');

ws.onopen = () => {
  console.log('Connected to sync server');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Sync event:', data);
};
```

### Subscribe to Domains

```javascript
ws.send(JSON.stringify({
  type: 'subscribe',
  domains: ['financial', 'health']
}));
```

### Sync Event Format

```json
{
  "type": "data_change",
  "domain": "financial",
  "action": "create",
  "entityId": "tx_123",
  "entityType": "Transaction",
  "data": {
    "amount": 100.50,
    "description": "Coffee shop"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "userId": "user_123",
  "source": "desktop"
}
```

## Troubleshooting

### Server Won't Start

1. Check if ports are in use:
   ```bash
   netstat -ano | findstr :3001
   ```

2. Verify environment variables are set correctly

3. Check database connections:
   ```bash
   mongosh
   curl http://localhost:7474
   ```

### Tests Failing

See [TEST-SETUP-GUIDE.md](../../docs/TEST-SETUP-GUIDE.md) for detailed troubleshooting.

Quick checks:
- Are databases running?
- Is `.env` configured correctly?
- Run `npm install` to update dependencies

### Database Connection Errors

**MongoDB**:
- Verify MongoDB is running: `mongosh`
- Check connection string in `.env`
- Ensure no firewall blocking port 27017

**Neo4j**:
- Verify Neo4j is running: `http://localhost:7474`
- Check credentials in `.env` match Neo4j
- Ensure using `bolt://` protocol

## Performance

### Caching

Redis integration for caching (optional):
```env
REDIS_URL=redis://localhost:6379
```

### Rate Limiting

Default: 100 requests per minute per IP

Configure in `src/index.ts`:
```typescript
fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});
```

### Connection Pooling

**MongoDB**: Max 10 connections
**Neo4j**: Max 50 connections

Adjust in `src/database/mongodb.ts` and `src/database/neo4j.ts`

## Contributing

1. Create feature branch from `master`
2. Write tests for new features
3. Ensure all tests pass: `npm test`
4. Update API documentation
5. Submit pull request

## License

See [LICENSE](../../LICENSE) file in repository root.

## Support

- Documentation: [/docs](../../docs/)
- Issues: [GitHub Issues](https://github.com/yourusername/personal-dashboard/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/personal-dashboard/discussions)
