# Personal Dashboard - Dynamic Knowledge Graphs

A unified personal data management system that connects financial, health, and schedule data through Neo4j-powered relationship discovery.

## 🚀 Quick Start

```bash
# Setup project
./scripts/setup-dev.sh

# Start development environment
npm run dev

# Run tests
npm test
```

## 📱 Applications

- **Desktop** (Electron): Primary interface for deep work and analysis
- **PWA** (Next.js): Mobile-optimized progressive web app
- **Mobile** (React Native): Native mobile experience
- **Alexa Skill**: Voice interface for quick queries and data entry

## 🏗️ Architecture

- **Frontend**: React-based applications with shared component library
- **Backend**: Node.js API server with FastAPI for ML services
- **Databases**: Neo4j for relationships, MongoDB for operational data
- **Sync**: WebSocket-based real-time synchronization

## 📊 Core Features

- **Carousel Dashboard**: Swipeable subdomain navigation
- **Cross-Domain Discovery**: Automatic relationship detection
- **Graph Explorer**: Interactive visualization of data relationships
- **Real-Time Sync**: Multi-device synchronization
- **Offline Support**: PWA with IndexedDB caching

## 📚 Documentation

- [System Architecture](docs/architecture/README.md)
- [Development Setup](docs/development/setup.md)
- [API Documentation](docs/api/README.md)
- [User Guides](docs/user-guides/README.md)

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js, Fastify, Neo4j, MongoDB
- **Mobile**: React Native
- **Desktop**: Electron
- **Voice**: Alexa Skills Kit
- **Deployment**: Docker, Kubernetes, AWS/Vercel

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
