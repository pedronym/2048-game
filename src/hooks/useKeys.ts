import { useEffect, useRef } from "react";

interface UseKeysOptions {
  onKey: (direction: "up" | "down" | "left" | "right") => void;
}

export function useKeys({ onKey }: UseKeysOptions) {
  const onKeyRef = useRef(onKey);

  useEffect(() => {
    onKeyRef.current = onKey;
  }, [onKey]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          onKeyRef.current("up");
          break;
        case "ArrowDown":
          onKeyRef.current("down");
          break;
        case "ArrowLeft":
          onKeyRef.current("left");
          break;
        case "ArrowRight":
          onKeyRef.current("right");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
