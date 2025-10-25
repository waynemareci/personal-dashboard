/**
 * Carousel Types and Interfaces
 */

export interface SubdomainConfig {
  id: string;
  name: string;
  title: string;
  icon?: string;
  color: string;
  shortcut?: string;
  component: React.ComponentType<any>;
}

export interface CarouselState {
  activeIndex: number;
  isTransitioning: boolean;
  isDragging: boolean;
  dragOffset: number;
  velocity: number;
}

export interface CarouselActions {
  goToIndex: (index: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToSubdomain: (subdomainId: string) => void;
}

export interface CarouselProps {
  subdomains: SubdomainConfig[];
  initialIndex?: number;
  onSubdomainChange?: (subdomain: SubdomainConfig) => void;
  enableGestures?: boolean;
  enableKeyboard?: boolean;
  transitionDuration?: number;
  snapThreshold?: number;
}

export interface GestureState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
  startTime: number;
}

export interface NavigationIndicatorProps {
  subdomains: SubdomainConfig[];
  activeIndex: number;
  onNavigate: (index: number) => void;
}

export interface SubdomainLoaderProps {
  subdomain: SubdomainConfig;
  isActive: boolean;
  isLoading?: boolean;
  error?: Error | null;
}
