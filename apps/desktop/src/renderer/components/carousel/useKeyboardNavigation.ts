import { useEffect } from 'react';
import { SubdomainConfig } from './types';

interface UseKeyboardNavigationOptions {
  enabled?: boolean;
  onNavigateNext: () => void;
  onNavigatePrevious: () => void;
  onNavigateToIndex: (index: number) => void;
  subdomains: SubdomainConfig[];
  activeIndex: number;
}

export function useKeyboardNavigation(options: UseKeyboardNavigationOptions) {
  const {
    enabled = true,
    onNavigateNext,
    onNavigatePrevious,
    onNavigateToIndex,
    subdomains,
    activeIndex
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          onNavigatePrevious();
          break;

        case 'ArrowRight':
          event.preventDefault();
          onNavigateNext();
          break;

        case 'Home':
          event.preventDefault();
          onNavigateToIndex(0);
          break;

        case 'End':
          event.preventDefault();
          onNavigateToIndex(subdomains.length - 1);
          break;

        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          // Number keys to navigate to specific subdomain
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const index = parseInt(event.key, 10) - 1;
            if (index >= 0 && index < subdomains.length) {
              onNavigateToIndex(index);
            }
          }
          break;

        case 'Tab':
          // Tab navigation with Ctrl/Cmd modifier
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            if (event.shiftKey) {
              onNavigatePrevious();
            } else {
              onNavigateNext();
            }
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    enabled,
    onNavigateNext,
    onNavigatePrevious,
    onNavigateToIndex,
    subdomains.length,
    activeIndex
  ]);
}
