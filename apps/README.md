# Applications

This directory contains all client-facing applications for the Personal Dashboard system.

## Applications

### 🖥️ Desktop (`desktop/`)
Electron-based desktop application providing the primary interface for deep work and data analysis.

**Key Features:**
- Carousel dashboard with all subdomains
- Advanced relationship exploration
- Keyboard-driven navigation
- Offline-first with sync

### 🌐 PWA (`pwa/`)  
Next.js-based Progressive Web App optimized for mobile and web use.

**Key Features:**
- Mobile-responsive design
- Offline capability with IndexedDB
- Quick capture forms
- Real-time sync

### 📱 Mobile (`mobile/`)
React Native application for native mobile experience.

**Key Features:**
- Native iOS/Android performance
- Biometric authentication
- Background sync
- Push notifications

### 🔊 Alexa Skill (`alexa-skill/`)
Voice interface for quick queries and data entry via Amazon Echo devices.

**Key Features:**
- Voice-driven dashboard summaries
- Quick expense/task logging
- Daily insight delivery
- Multi-turn conversations

## Development

Each app has its own README with specific setup instructions. See individual directories for details.

## Shared Dependencies

Apps share common packages from `packages/`:
- `shared-types`: TypeScript definitions
- `subdomain-framework`: Core business logic
- `api-client`: Backend communication
