# Packages

Shared packages and libraries used across all applications.

## Packages

### 🔧 API Server (`api-server/`)
Core backend API providing REST and GraphQL endpoints.

**Features:**
- Authentication & authorization
- Subdomain API routes
- Real-time sync service
- Relationship discovery engine

### 💾 Database (`database/`)
Database schemas, migrations, and utilities for Neo4j and MongoDB.

**Features:**
- Neo4j Cypher schemas
- MongoDB collections
- Migration scripts
- Seed data

### 📝 Shared Types (`shared-types/`)
TypeScript definitions shared across frontend and backend.

**Features:**
- Entity type definitions
- API request/response types
- WebSocket message types
- Configuration types

### 🏗️ Subdomain Framework (`subdomain-framework/`)
Core framework for building modular subdomains.

**Features:**
- Subdomain registry
- Common entity patterns
- Relationship management
- Cross-domain queries

## Development

```bash
# Install all package dependencies
npm run install:packages

# Build all packages
npm run build:packages

# Test all packages
npm run test:packages

# Lint all packages
npm run lint:packages
```

## Package Dependencies

Packages follow a dependency hierarchy:
```
shared-types (base)
├── subdomain-framework
├── database
└── api-server
```
