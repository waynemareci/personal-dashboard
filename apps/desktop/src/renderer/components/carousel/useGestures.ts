import { useRef, useCallback, useEffect } from 'react';
import { GestureState } from './types';

interface UseGesturesOptions {
  onDragStart: () => void;
  onDragMove: (offset: number) => void;
  onDragEnd: (velocity: number) => void;
  enabled?: boolean;
  threshold?: number;
}

export function useGestures(options: UseGesturesOptions) {
  const { onDragStart, onDragMove, onDragEnd, enabled = true, threshold = 10 } = options;

  const gestureStateRef = useRef<GestureState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,
    startTime: 0
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!enabled) return;

      gestureStateRef.current = {
        startX: clientX,
        startY: clientY,
        currentX: clientX,
        currentY: clientY,
        isDragging: false,
        startTime: Date.now()
      };
    },
    [enabled]
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!enabled) return;

      const state = gestureStateRef.current;
      state.currentX = clientX;
      state.currentY = clientY;

      const deltaX = clientX - state.startX;
      const deltaY = clientY - state.startY;

      // Check if we should start dragging
      if (!state.isDragging) {
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance > threshold) {
          // Determine if this is a horizontal swipe
          const angle = Math.abs(Math.atan2(deltaY, deltaX) * (180 / Math.PI));
          const isHorizontal = angle < 30 || angle > 150;

          if (isHorizontal) {
            state.isDragging = true;
            onDragStart();
          }
        }
      }

      // Update drag position
      if (state.isDragging) {
        onDragMove(deltaX);
      }
    },
    [enabled, threshold, onDragStart, onDragMove]
  );

  const handleEnd = useCallback(() => {
    if (!enabled) return;

    const state = gestureStateRef.current;

    if (state.isDragging) {
      // Calculate velocity
      const deltaTime = Date.now() - state.startTime;
      const deltaX = state.currentX - state.startX;
      const velocity = deltaX / deltaTime; // pixels per millisecond

      onDragEnd(velocity * 1000); // convert to pixels per second
    }

    gestureStateRef.current = {
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isDragging: false,
      startTime: 0
    };
  }, [enabled, onDragEnd]);

  // Mouse events
  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      handleStart(e.clientX, e.clientY);
    },
    [handleStart]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    },
    [handleMove]
  );

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Touch events
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    },
    [handleStart]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);

      // Prevent default only if we're dragging to allow vertical scrolling
      if (gestureStateRef.current.isDragging) {
        e.preventDefault();
      }
    },
    [handleMove]
  );

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    // Mouse events
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Touch events
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      // Cleanup mouse events
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      // Cleanup touch events
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    enabled,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  ]);

  return {
    containerRef,
    isDragging: gestureStateRef.current.isDragging
  };
}
