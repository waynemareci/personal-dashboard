# Progressive Web App (Next.js)

Mobile-optimized web application with offline capabilities and responsive design.

## Features

- **Mobile-First Design**: Touch-optimized interface
- **Offline Support**: IndexedDB caching with sync queue
- **Progressive Enhancement**: Works on all devices
- **Push Notifications**: Real-time updates
- **Install Prompt**: Add to home screen

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Architecture

```
src/
├── pages/          # Next.js pages and API routes
├── components/     # React components
├── lib/            # Utilities and services
├── hooks/          # Custom React hooks
└── styles/         # Global styles
```

## Offline Strategy

- **App Shell**: Cached for instant loading
- **API Responses**: Cached with stale-while-revalidate
- **Images**: Cached on first load
- **Sync Queue**: Offline actions queued for sync

## Service Worker

The PWA uses Workbox for:
- Precaching static assets
- Runtime caching strategies
- Background sync
- Push notification handling

## Performance

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized for mobile
- **Bundle Analysis**: `npm run analyze`

## Deployment

```bash
# Deploy to Vercel
vercel deploy

# Deploy to Netlify
npm run build && netlify deploy --prod
```
