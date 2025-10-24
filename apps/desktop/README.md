# Desktop Application (Electron + React)

The primary interface for Personal Dashboard, built with Electron and React.

## Features

- **Carousel Navigation**: Horizontal subdomain switching
- **Relationship Sidebar**: Cross-domain connection explorer  
- **Graph Visualizer**: Interactive Neo4j data visualization
- **Keyboard Shortcuts**: Power-user navigation
- **Real-time Sync**: WebSocket-based updates

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Package for distribution
npm run package
```

## Architecture

```
src/
├── main/           # Electron main process
├── renderer/       # React frontend
├── shared/         # Shared utilities
└── preload/        # Preload scripts
```

## Key Components

- `carousel/`: Main dashboard navigation
- `relationship-sidebar/`: Cross-domain relationships
- `subdomains/`: Financial, Health, Schedule modules
- `graph-explorer/`: Neo4j visualization

## Keyboard Shortcuts

- `←/→`: Navigate carousel
- `Cmd/Ctrl+1,2,3`: Jump to subdomain
- `Cmd/Ctrl+K`: Global search
- `R`: Toggle relationships sidebar

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test in production build
npm run test:prod
```
