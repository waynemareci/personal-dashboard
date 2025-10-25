import { useState, useCallback, useEffect, useRef } from 'react';
import { CarouselState, SubdomainConfig } from './types';

interface UseCarouselOptions {
  subdomains: SubdomainConfig[];
  initialIndex?: number;
  transitionDuration?: number;
  snapThreshold?: number;
  onSubdomainChange?: (subdomain: SubdomainConfig) => void;
}

export function useCarousel(options: UseCarouselOptions) {
  const {
    subdomains,
    initialIndex = 0,
    transitionDuration = 300,
    snapThreshold = 0.3,
    onSubdomainChange
  } = options;

  const [state, setState] = useState<CarouselState>({
    activeIndex: initialIndex,
    isTransitioning: false,
    isDragging: false,
    dragOffset: 0,
    velocity: 0
  });

  const transitionTimeoutRef = useRef<NodeJS.Timeout>();

  // Cleanup transition timeout
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Notify parent component of subdomain change
  useEffect(() => {
    if (onSubdomainChange && subdomains[state.activeIndex]) {
      onSubdomainChange(subdomains[state.activeIndex]);
    }
  }, [state.activeIndex, subdomains, onSubdomainChange]);

  // Save active index to local storage
  useEffect(() => {
    if (typeof window !== 'undefined' && window.api?.store) {
      window.api.store.set('carousel:activeIndex', state.activeIndex);
    }
  }, [state.activeIndex]);

  const goToIndex = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(index, subdomains.length - 1));

      if (clampedIndex === state.activeIndex) {
        return;
      }

      setState((prev) => ({
        ...prev,
        activeIndex: clampedIndex,
        isTransitioning: true,
        dragOffset: 0,
        velocity: 0
      }));

      // Clear any existing timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      // Reset transition state after animation completes
      transitionTimeoutRef.current = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isTransitioning: false
        }));
      }, transitionDuration);
    },
    [state.activeIndex, subdomains.length, transitionDuration]
  );

  const goToNext = useCallback(() => {
    goToIndex(state.activeIndex + 1);
  }, [state.activeIndex, goToIndex]);

  const goToPrevious = useCallback(() => {
    goToIndex(state.activeIndex - 1);
  }, [state.activeIndex, goToIndex]);

  const goToSubdomain = useCallback(
    (subdomainId: string) => {
      const index = subdomains.findIndex((s) => s.id === subdomainId);
      if (index !== -1) {
        goToIndex(index);
      }
    },
    [subdomains, goToIndex]
  );

  const startDrag = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDragging: true,
      isTransitioning: false
    }));
  }, []);

  const updateDrag = useCallback((offset: number) => {
    setState((prev) => ({
      ...prev,
      dragOffset: offset
    }));
  }, []);

  const endDrag = useCallback(
    (velocity: number) => {
      const { dragOffset } = state;
      const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;

      // Calculate if we should snap to next/previous
      const dragPercentage = Math.abs(dragOffset) / containerWidth;
      const shouldSnap = dragPercentage > snapThreshold || Math.abs(velocity) > 0.5;

      let newIndex = state.activeIndex;

      if (shouldSnap) {
        if (dragOffset < 0 && velocity < 0) {
          // Dragging/flinging left - go to next
          newIndex = Math.min(state.activeIndex + 1, subdomains.length - 1);
        } else if (dragOffset > 0 && velocity > 0) {
          // Dragging/flinging right - go to previous
          newIndex = Math.max(state.activeIndex - 1, 0);
        }
      }

      setState((prev) => ({
        ...prev,
        isDragging: false,
        dragOffset: 0,
        velocity: 0
      }));

      if (newIndex !== state.activeIndex) {
        goToIndex(newIndex);
      }
    },
    [state, subdomains.length, snapThreshold, goToIndex]
  );

  const canGoNext = state.activeIndex < subdomains.length - 1;
  const canGoPrevious = state.activeIndex > 0;

  return {
    state,
    actions: {
      goToIndex,
      goToNext,
      goToPrevious,
      goToSubdomain,
      startDrag,
      updateDrag,
      endDrag
    },
    canGoNext,
    canGoPrevious,
    activeSubdomain: subdomains[state.activeIndex]
  };
}
