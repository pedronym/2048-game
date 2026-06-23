import { useEffect, useRef } from 'react';

interface UseKeysOptions {
  onKey: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

export function useKeys({ onKey }: UseKeysOptions) {
  const onKeyRef = useRef(onKey);

  useEffect(() => {
    onKeyRef.current = onKey;
  }, [onKey]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          onKeyRef.current('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          onKeyRef.current('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onKeyRef.current('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          onKeyRef.current('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
