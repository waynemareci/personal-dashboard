import React, { useEffect, useRef, useCallback } from 'react';
import { SubdomainConfig } from './types';
import { useCarousel } from './useCarousel';
import { useGestures } from './useGestures';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import { NavigationIndicators } from './NavigationIndicators';
import { SubdomainLoader, preloadSubdomain } from './SubdomainLoader';
import './Carousel.css';

export interface CarouselProps {
  subdomains: SubdomainConfig[];
  initialSubdomainId?: string;
  enableGestures?: boolean;
  enableKeyboardNav?: boolean;
  transitionDuration?: number;
  snapThreshold?: number;
  persistState?: boolean;
  onSubdomainChange?: (subdomain: SubdomainConfig, index: number) => void;
}

export const Carousel: React.FC<CarouselProps> = ({
  subdomains,
  initialSubdomainId,
  enableGestures = true,
  enableKeyboardNav = true,
  transitionDuration = 300,
  snapThreshold = 0.25,
  persistState = true,
  onSubdomainChange
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  // Get initial index from ID
  const initialIndex = initialSubdomainId
    ? subdomains.findIndex(s => s.id === initialSubdomainId)
    : undefined;

  // Initialize carousel state management
  const { state, actions } = useCarousel({
    subdomains,
    initialIndex: initialIndex !== -1 ? initialIndex : undefined,
    transitionDuration,
    snapThreshold,
    persistState
  });

  // Set up gesture handling
  const { containerRef, isDragging } = useGestures({
    enabled: enableGestures && !state.isTransitioning,
    threshold: 10,
    onDragStart: actions.startDrag,
    onDragMove: actions.updateDrag,
    onDragEnd: actions.endDrag
  });

  // Set up keyboard navigation
  useKeyboardNavigation({
    enabled: enableKeyboardNav,
    onNavigateNext: actions.goToNext,
    onNavigatePrevious: actions.goToPrevious,
    onNavigateToIndex: actions.goToIndex,
    subdomains,
    activeIndex: state.activeIndex
  });

  // Assign the gesture ref to our carousel ref
  useEffect(() => {
    if (carouselRef.current && containerRef) {
      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = carouselRef.current;
    }
  }, [containerRef]);

  // Notify parent component of subdomain changes
  useEffect(() => {
    if (onSubdomainChange) {
      onSubdomainChange(subdomains[state.activeIndex], state.activeIndex);
    }
  }, [state.activeIndex, subdomains, onSubdomainChange]);

  // Preload adjacent subdomains for better performance
  useEffect(() => {
    const adjacentIndices = [
      state.activeIndex - 1,
      state.activeIndex + 1
    ].filter(i => i >= 0 && i < subdomains.length);

    adjacentIndices.forEach(index => {
      preloadSubdomain(subdomains[index]);
    });
  }, [state.activeIndex, subdomains]);

  // Listen for navigation events from IPC (deep linking)
  useEffect(() => {
    if (!window.api?.on) return;

    const handleNavigate = (subdomainId: string, params?: Record<string, any>) => {
      const index = subdomains.findIndex(s => s.id === subdomainId);
      if (index !== -1) {
        actions.goToIndex(index);
        console.log(`[Carousel] Navigated to ${subdomainId} via deep link`, params);
      }
    };

    window.api.on('navigate', handleNavigate);

    return () => {
      if (window.api?.off) {
        window.api.off('navigate', handleNavigate);
      }
    };
  }, [subdomains, actions]);

  // Calculate transform for carousel container
  const getTransform = useCallback((): string => {
    let offset = -state.activeIndex * 100;

    // Apply drag offset if dragging
    if (state.isDragging && carouselRef.current) {
      const dragPercentage = (state.dragOffset / carouselRef.current.offsetWidth) * 100;
      offset += dragPercentage;
    }

    return `translateX(${offset}%)`;
  }, [state.activeIndex, state.isDragging, state.dragOffset]);

  // Determine which subdomains should be rendered
  // We render active + 1 on each side for smooth transitions
  const getVisibleSubdomains = useCallback((): Set<number> => {
    const visible = new Set<number>();
    const range = 1; // Number of subdomains to keep loaded on each side

    for (let i = state.activeIndex - range; i <= state.activeIndex + range; i++) {
      if (i >= 0 && i < subdomains.length) {
        visible.add(i);
      }
    }

    return visible;
  }, [state.activeIndex, subdomains.length]);

  const visibleSubdomains = getVisibleSubdomains();

  return (
    <div className="carousel-wrapper">
      {/* Navigation Indicators */}
      <NavigationIndicators
        subdomains={subdomains}
        activeIndex={state.activeIndex}
        onNavigate={actions.goToIndex}
      />

      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className={`carousel-container ${state.isDragging ? 'dragging' : ''} ${state.isTransitioning ? 'transitioning' : ''}`}
        style={{
          transform: getTransform(),
          transition: state.isDragging || !state.isTransitioning
            ? 'none'
            : `transform ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
        }}
        role="region"
        aria-label="Subdomain carousel"
        aria-live="polite"
      >
        {subdomains.map((subdomain, index) => {
          const isActive = index === state.activeIndex;
          const isVisible = visibleSubdomains.has(index);

          return (
            <div
              key={subdomain.id}
              className={`carousel-slide ${isActive ? 'active' : ''}`}
              role="tabpanel"
              id={`panel-${subdomain.id}`}
              aria-labelledby={`tab-${subdomain.id}`}
              aria-hidden={!isActive}
              data-subdomain={subdomain.id}
            >
              <SubdomainLoader
                subdomain={subdomain}
                isActive={isActive}
                isVisible={isVisible}
              />
            </div>
          );
        })}
      </div>

      {/* Drag indicator */}
      {state.isDragging && (
        <div className="carousel-drag-indicator">
          <div className="drag-progress" style={{
            width: `${Math.abs(state.dragOffset / (carouselRef.current?.offsetWidth || 1)) * 100}%`,
            backgroundColor: state.dragOffset > 0
              ? subdomains[Math.max(0, state.activeIndex - 1)]?.color
              : subdomains[Math.min(subdomains.length - 1, state.activeIndex + 1)]?.color
          }} />
        </div>
      )}
    </div>
  );
};

// Export convenience function for creating subdomain configurations
export function createSubdomainConfig(
  config: Omit<SubdomainConfig, 'id'> & { id?: string }
): SubdomainConfig {
  return {
    id: config.id || config.name.toLowerCase().replace(/\s+/g, '-'),
    ...config
  } as SubdomainConfig;
}

// Export all types and hooks for external use
export * from './types';
export { useCarousel } from './useCarousel';
export { useGestures } from './useGestures';
export { useKeyboardNavigation } from './useKeyboardNavigation';
export { NavigationIndicators } from './NavigationIndicators';
export { SubdomainLoader, createLazySubdomain, preloadSubdomain } from './SubdomainLoader';
export { ErrorBoundary } from './ErrorBoundary';
