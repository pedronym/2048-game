import { useEffect, useRef, type RefObject } from "react";

export type SwipeDirection = "up" | "down" | "left" | "right";

interface UseSwipeOptions {
  onSwipe: (direction: SwipeDirection) => void;
  threshold?: number;
  targetRef?: RefObject<HTMLElement | null>;
}

export function useSwipe({ onSwipe, threshold = 30, targetRef }: UseSwipeOptions) {
  const onSwipeRef = useRef(onSwipe);

  useEffect(() => {
    onSwipeRef.current = onSwipe;
  }, [onSwipe]);

  useEffect(() => {
    const targetElement = targetRef ? targetRef.current : window;
    if (!targetElement) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent | Event) => {
      const touchEvent = e as TouchEvent;
      if (touchEvent.touches && touchEvent.touches.length > 0) {
        touchStartX = touchEvent.touches[0].clientX;
        touchStartY = touchEvent.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent | Event) => {
      const touchEvent = e as TouchEvent;
      if (!touchStartX || !touchStartY || !touchEvent.changedTouches || touchEvent.changedTouches.length === 0) return;

      const touchEndX = touchEvent.changedTouches[0].clientX;
      const touchEndY = touchEvent.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0) onSwipeRef.current("right");
          else onSwipeRef.current("left");
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0) onSwipeRef.current("down");
          else onSwipeRef.current("up");
        }
      }

      touchStartX = 0;
      touchStartY = 0;
    };

    targetElement.addEventListener("touchstart", handleTouchStart, { passive: false });
    targetElement.addEventListener("touchend", handleTouchEnd);

    return () => {
      targetElement.removeEventListener("touchstart", handleTouchStart);
      targetElement.removeEventListener("touchend", handleTouchEnd);
    };
  }, [threshold, targetRef]);
}
