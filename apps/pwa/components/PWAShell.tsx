import { useEffect, useState, ReactNode } from 'react';
import Head from 'next/head';
import { initializeDB } from '../lib/db/indexeddb';
import { initializeSync } from '../lib/sync/offline-sync';
import { OfflineIndicator } from './OfflineIndicator';

interface PWAShellProps {
  children: ReactNode;
  title?: string;
}

export const PWAShell = ({ children, title = 'Personal Dashboard' }: PWAShellProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    initializePWA();
  }, []);

  const initializePWA = async () => {
    try {
      console.log('[PWA] Initializing...');

      // Initialize IndexedDB
      await initializeDB();
      console.log('[PWA] IndexedDB initialized');

      // Initialize offline sync
      initializeSync();
      console.log('[PWA] Sync manager initialized');

      // Register service worker (next-pwa handles this automatically)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          console.log('[PWA] Service Worker ready:', registration.scope);
        });
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('[PWA] Initialization error:', error);
      setInitError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  if (initError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">⚠️ Initialization Error</h1>
          <p className="text-gray-400 mb-6">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=5,user-scalable=yes,viewport-fit=cover"
        />
        <meta name="description" content="Personal Dashboard - Manage your finances, health, and schedule" />
        <meta name="keywords" content="dashboard, finance, health, productivity, pwa" />
        <title>{title}</title>

        {/* PWA primary color */}
        <meta name="theme-color" content="#3b82f6" />

        {/* Apple */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Dashboard" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />

        {/* Startup images */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-2048-2732.jpg"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1668-2388.jpg"
          media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1536-2048.jpg"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />

        {/* Android */}
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Windows */}
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content="Manage your finances, health, and schedule" />
        <meta property="og:site_name" content="Personal Dashboard" />
        <meta property="og:url" content="https://dashboard.example.com" />
        <meta property="og:image" content="/og-image.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://dashboard.example.com" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content="Manage your finances, health, and schedule" />
        <meta name="twitter:image" content="/twitter-image.png" />
      </Head>

      <div className="pwa-shell min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        {/* Main content */}
        <main className="pwa-content">
          {children}
        </main>

        {/* Offline indicator */}
        <OfflineIndicator />
      </div>
    </>
  );
};
