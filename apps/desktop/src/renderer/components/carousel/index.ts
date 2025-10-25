/**
 * Carousel Navigation System
 *
 * A complete carousel-based navigation system for the Personal Dashboard.
 * Features include:
 * - Swipeable navigation between subdomains
 * - Touch/trackpad gesture support
 * - Keyboard navigation with shortcuts
 * - Visual navigation indicators
 * - Loading states and error boundaries
 * - Deep linking integration
 * - State persistence
 * - Responsive design
 */

// Main Carousel Component
export { Carousel, createSubdomainConfig } from './Carousel';
export type { CarouselProps } from './Carousel';

// Types
export type {
  SubdomainConfig,
  CarouselState,
  GestureState,
  UseCarouselOptions,
  UseGesturesOptions,
  NavigationIndicatorProps
} from './types';

// Hooks
export { useCarousel } from './useCarousel';
export { useGestures } from './useGestures';
export { useKeyboardNavigation } from './useKeyboardNavigation';

// Components
export { NavigationIndicators } from './NavigationIndicators';
export { SubdomainLoader, createLazySubdomain, preloadSubdomain } from './SubdomainLoader';
export { ErrorBoundary } from './ErrorBoundary';

// CSS imports (these will be bundled by Vite)
import './Carousel.css';
import './NavigationIndicators.css';
import './SubdomainLoader.css';
import './ErrorBoundary.css';
