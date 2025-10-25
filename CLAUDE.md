# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive Product Requirements Document (PRD) for a Personal Dashboard system powered by Dynamic Knowledge Graphs. The system aims to create a unified, graph-based ecosystem where financial data, health metrics, schedules, and knowledge bases interconnect through Neo4j's relationship discovery engine.

## Architecture & Technology Stack

### Core Technologies
- **Desktop App**: Electron + React (TypeScript)
- **PWA**: Next.js (React)
- **Mobile**: React Native (future consideration)
- **Voice Interface**: Alexa Skills Kit with Lambda
- **Databases**: 
  - Neo4j (relationship/graph data)
  - MongoDB (operational data)
  - Redis (caching layer)
- **Backend**: Node.js with Fastify
- **Real-time**: WebSocket for multi-device sync

### Key Architecture Patterns
- **Dual Database Strategy**: Neo4j for relationships, MongoDB for CRUD operations
- **Event-Driven Sync**: WebSocket-based real-time synchronization
- **Subdomain Architecture**: Modular design (financial, health, schedule subdomains)
- **Cross-Platform**: Shared business logic across desktop, web, and voice interfaces

## Development Commands

### Main Development Commands
```bash
# Setup project (run once)
./scripts/setup-dev.sh

# Start all development servers
npm run dev

# Individual application development
npm run dev:api      # API server only
npm run dev:desktop  # Electron app only
npm run dev:pwa      # Next.js PWA only

# Production builds
npm run build        # Build all workspaces
```

### Testing Strategy
- **Framework**: Jest with React Testing Library for PWA, Vitest for API/Desktop
- **Coverage Target**: >70% for critical business logic
- **Integration Tests**: Required for Neo4j relationships and API endpoints
- **E2E Tests**: Critical user workflows only

### Key Test Commands
```bash
# Unit tests (all workspaces)
npm test

# Individual workspace tests
npm run test -w apps/desktop    # Vitest + Playwright E2E
npm run test -w apps/pwa        # Jest
npm run test -w packages/api-server  # Vitest

# Watch mode
npm run test:watch -w apps/pwa
npm run test:watch -w packages/api-server
```

### Code Quality & Build
```bash
# Linting
npm run lint         # ESLint across all workspaces
npm run lint -w apps/pwa  # Individual workspace

# Formatting
npm run format       # Prettier across all files

# Individual application builds
npm run build -w apps/desktop    # Electron build
npm run build -w apps/pwa        # Next.js build
npm run build -w packages/api-server  # API server build

# Desktop app packaging
npm run package -w apps/desktop  # Create distributable
```

## Critical Development Patterns

### Database Operations
- Always use transactions for cross-database operations (Neo4j + MongoDB)
- Implement rollback mechanisms for failed dual-database writes
- Neo4j relationships must be created alongside MongoDB documents

### Error Handling
- Graceful degradation when Neo4j is unavailable
- Comprehensive logging for debugging multi-device sync issues
- OAuth error handling for Alexa skill integration

### Security Requirements
- Never commit API keys or sensitive credentials
- Use environment variables for all external service configurations
- Implement proper JWT token validation
- Sanitize all user inputs for both databases

## Subdomain Structure

The system is organized into modular subdomains:
- **Financial**: Transactions, accounts, budgets, categories
- **Health**: Meals, workouts, body metrics, goals
- **Schedule**: Tasks, events, projects, time blocking

Each subdomain follows the same pattern:
- CRUD operations in MongoDB
- Relationship mapping in Neo4j
- Real-time sync capabilities
- Cross-platform interface consistency

## Development Phases

Currently targeting a phased rollout:
1. **Phase 1** (Months 1-4): Desktop app with 3 core subdomains
2. **Phase 2** (Months 5-6): PWA and mobile sync
3. **Phase 3** (Months 7-8): Alexa integration and voice commands
4. **Phase 4** (Months 9-12): Advanced features and relationship discovery

## Important Notes

- This is a solo developer project requiring pragmatic testing and development approaches
- Focus on automation for repetitive tasks while accepting some manual testing
- Prioritize core functionality over extensive feature sets in early phases
- Relationship discovery between domains is a key differentiator - ensure Neo4j integration is robust