import React, { Suspense, useEffect, useState } from 'react';
import { SubdomainConfig } from './types';
import { ErrorBoundary } from './ErrorBoundary';
import './SubdomainLoader.css';

interface SubdomainLoaderProps {
  subdomain: SubdomainConfig;
  isActive: boolean;
  isVisible: boolean;
}

interface LoadingSkeletonProps {
  subdomainName: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ subdomainName }) => {
  return (
    <div className="subdomain-loader-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-actions">
          <div className="skeleton-button"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
      <div className="skeleton-content">
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
      </div>
      <div className="skeleton-loader-text">
        Loading {subdomainName}...
      </div>
    </div>
  );
};

interface LoadingSpinnerProps {
  subdomainName: string;
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ subdomainName, color }) => {
  return (
    <div className="subdomain-loader-spinner">
      <div
        className="spinner-circle"
        style={{ borderTopColor: color || '#3b82f6' }}
      ></div>
      <p className="spinner-text">Loading {subdomainName}...</p>
    </div>
  );
};

export const SubdomainLoader: React.FC<SubdomainLoaderProps> = ({
  subdomain,
  isActive,
  isVisible
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState<number>(0);

  useEffect(() => {
    // Only load when becoming visible
    if (isVisible && !isLoaded && !hasError) {
      setLoadStartTime(Date.now());

      // Simulate loading delay to show loading state
      // In real implementation, this would wait for actual data fetching
      const minLoadTime = 300; // Minimum time to show loading state
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, minLoadTime);

      return () => clearTimeout(timer);
    }
  }, [isVisible, isLoaded, hasError]);

  // Log performance metrics
  useEffect(() => {
    if (isLoaded && loadStartTime > 0) {
      const loadTime = Date.now() - loadStartTime;
      console.log(`[SubdomainLoader] ${subdomain.name} loaded in ${loadTime}ms`);

      // Report to main process if available
      if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.send('analytics:subdomain-load-time', {
          subdomain: subdomain.id,
          loadTime,
          timestamp: new Date().toISOString()
        });
      }
    }
  }, [isLoaded, loadStartTime, subdomain]);

  const handleRetry = () => {
    setHasError(false);
    setIsLoaded(false);
    setLoadStartTime(Date.now());
  };

  // Don't render anything if not visible and not active
  // This helps with performance by unmounting distant subdomains
  if (!isVisible && !isActive) {
    return null;
  }

  return (
    <div
      className={`subdomain-loader ${isActive ? 'active' : ''} ${isLoaded ? 'loaded' : ''}`}
      data-subdomain={subdomain.id}
    >
      <ErrorBoundary
        subdomainName={subdomain.title}
        fallback={
          <div className="subdomain-loader-error">
            <div className="error-icon" style={{ color: subdomain.color }}>
              ⚠️
            </div>
            <h3>Failed to Load {subdomain.title}</h3>
            <p>An error occurred while loading this subdomain.</p>
            <button
              className="error-retry-button"
              onClick={handleRetry}
              style={{ backgroundColor: subdomain.color }}
            >
              Retry
            </button>
          </div>
        }
      >
        <Suspense fallback={<LoadingSkeleton subdomainName={subdomain.name} />}>
          {!isLoaded ? (
            <LoadingSpinner subdomainName={subdomain.name} color={subdomain.color} />
          ) : (
            <div className="subdomain-content-wrapper">
              {/* Render the actual subdomain component */}
              <subdomain.component />
            </div>
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

// Higher-order component for lazy loading subdomains
export function createLazySubdomain(
  importFn: () => Promise<{ default: React.ComponentType<any> }>,
  config: Omit<SubdomainConfig, 'component'>
): SubdomainConfig {
  const LazyComponent = React.lazy(importFn);

  return {
    ...config,
    component: LazyComponent
  };
}

// Preload helper for eager loading adjacent subdomains
export function preloadSubdomain(subdomain: SubdomainConfig): void {
  if (subdomain.component && (subdomain.component as any)._payload) {
    // This is a lazy component, trigger preload
    const lazyComponent = subdomain.component as any;
    if (lazyComponent._payload && typeof lazyComponent._payload._result === 'function') {
      // Call the import function to start loading
      lazyComponent._payload._result().catch((error: Error) => {
        console.error(`[SubdomainLoader] Failed to preload ${subdomain.name}:`, error);
      });
    }
  }
}
