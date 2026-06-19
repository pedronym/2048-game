import { useState, useEffect, useCallback, useRef } from "react";
import type { Tile } from "../@types";

import { GRID_SIZE, ANIMATION_TIMING } from "../config/constants";

// Helper to generate a unique random ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper to instantiate a new tile
const createTile = (x: number, y: number, value?: number): Tile => ({
  id: generateId(),
  x,
  y,
  value: value ?? (Math.random() < 0.9 ? 2 : 4),
  isNew: true,
});

// Helper to get coordinates groups based on movement direction
const getGroups = (direction: "up" | "down" | "left" | "right") => {
  const groups: { x: number; y: number }[][] = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    const group: { x: number; y: number }[] = [];
    for (let j = 0; j < GRID_SIZE; j++) {
      if (direction === "up") {
        group.push({ x: i, y: j });
      } else if (direction === "down") {
        group.push({ x: i, y: GRID_SIZE - 1 - j });
      } else if (direction === "left") {
        group.push({ x: j, y: i });
      } else if (direction === "right") {
        group.push({ x: GRID_SIZE - 1 - j, y: i });
      }
    }
    groups.push(group);
  }
  return groups;
};

// Helper to find a non-merged tile at coordinates
const getTileAt = (tiles: Tile[], x: number, y: number) => {
  return tiles.find((t) => t.x === x && t.y === y && !t.merged);
};

// Helper to find empty cells
const getRandomEmptyCell = (tiles: Tile[]) => {
  const occupied = new Set(
    tiles.filter((t) => !t.merged).map((t) => `${t.x},${t.y}`),
  );
  const emptyCells: { x: number; y: number }[] = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (!occupied.has(`${x},${y}`)) {
        emptyCells.push({ x, y });
      }
    }
  }
  if (emptyCells.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  return emptyCells[randomIndex];
};

// Check if any moves are possible
const canMoveAnywhere = (tiles: Tile[]) => {
  // Build a grid from the current non-merged tiles
  const grid: (number | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(null),
  );

  let filledCells = 0;
  for (const t of tiles) {
    if (t.merged) continue;
    grid[t.y][t.x] = t.value;
    filledCells++;
  }

  // If there are empty cells, a move is always possible
  if (filledCells < GRID_SIZE * GRID_SIZE) return true;

  // Check if any adjacent cells share the same value
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const value = grid[y][x];
      if (value === null) continue;

      // Check right neighbor
      if (x + 1 < GRID_SIZE && grid[y][x + 1] === value) return true;
      // Check down neighbor
      if (y + 1 < GRID_SIZE && grid[y + 1][x] === value) return true;
    }
  }
  return false;
};

// Helper to generate initial two tiles
const generateInitialTiles = (): Tile[] => {
  const tile1 = createTile(
    Math.floor(Math.random() * GRID_SIZE),
    Math.floor(Math.random() * GRID_SIZE),
  );
  let tile2 = createTile(
    Math.floor(Math.random() * GRID_SIZE),
    Math.floor(Math.random() * GRID_SIZE),
  );
  while (tile1.x === tile2.x && tile1.y === tile2.y) {
    tile2 = createTile(
      Math.floor(Math.random() * GRID_SIZE),
      Math.floor(Math.random() * GRID_SIZE),
    );
  }
  return [tile1, tile2];
};

export function useGame() {
  const [tiles, setTiles] = useState<Tile[]>(generateInitialTiles);
  const [isMoving, setIsMoving] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<{ tiles: Tile[]; score: number }[]>(
    [],
  );

  // Initialize/Restart the board
  const restart = useCallback(() => {
    setTiles(generateInitialTiles());
    setGameOver(false);
    setIsMoving(false);
    setScore(0);
    setHistory([]);
  }, []);

  const move = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (isMoving || gameOver) return;

      let moved = false;
      let maxDistance = 0;
      const nextTiles: Tile[] = tiles.map((t) => ({
        ...t,
        justMerged: false,
        isNew: false,
      }));
      const groups = getGroups(direction);
      const alreadyMergedIds = new Set<string>();
      const mergedPairs: { sourceId: string; targetId: string }[] = [];

      groups.forEach((group) => {
        for (let i = 1; i < group.length; i++) {
          const cell = group[i];
          const tileIndex = nextTiles.findIndex(
            (t) => t.x === cell.x && t.y === cell.y && !t.merged,
          );
          if (tileIndex === -1) continue;
          const tile = nextTiles[tileIndex];

          let lastValidCell: { x: number; y: number } | null = null;
          let mergeTargetTile: Tile | null = null;

          // Search in sliding direction
          for (let j = i - 1; j >= 0; j--) {
            const moveToCell = group[j];
            const targetTile = getTileAt(nextTiles, moveToCell.x, moveToCell.y);

            if (!targetTile) {
              lastValidCell = moveToCell;
            } else {
              if (
                targetTile.value === tile.value &&
                !alreadyMergedIds.has(targetTile.id)
              ) {
                lastValidCell = moveToCell;
                mergeTargetTile = targetTile;
              }
              break;
            }
          }

          if (lastValidCell) {
            moved = true;
            const distance =
              Math.abs(lastValidCell.x - tile.x) +
              Math.abs(lastValidCell.y - tile.y);
            maxDistance = Math.max(maxDistance, distance);

            if (mergeTargetTile) {
              // Update coordinate to target and mark tile for deletion post-animation
              nextTiles[tileIndex] = {
                ...tile,
                x: lastValidCell.x,
                y: lastValidCell.y,
                merged: true,
                distance,
              };
              mergedPairs.push({
                sourceId: tile.id,
                targetId: mergeTargetTile.id,
              });
              alreadyMergedIds.add(mergeTargetTile.id);
            } else {
              // Regular slide
              nextTiles[tileIndex] = {
                ...tile,
                x: lastValidCell.x,
                y: lastValidCell.y,
                distance,
              };
            }
          }
        }
      });

      if (!moved) return;

      setHistory((prev) => [
        ...prev,
        {
          tiles: tiles.map((t) => ({ ...t })),
          score,
        },
      ]);

      setIsMoving(true);
      setTiles(nextTiles);

      // Phase 2: Run cleanups and value doubling after the longest slide finishes
      setTimeout(() => {
        let cleanedTiles = nextTiles.filter((t) => !t.merged);

        let moveScore = 0;
        cleanedTiles = cleanedTiles.map((tile): Tile => {
          const pair = mergedPairs.find((p) => p.targetId === tile.id);
          if (pair) {
            const newValue = tile.value * 2;
            moveScore += newValue;
            return {
              ...tile,
              value: newValue,
              merged: false,
              distance: undefined,
              isNew: false,
              justMerged: true,
            };
          }
          return {
            ...tile,
            merged: false,
            distance: undefined,
            isNew: false,
            justMerged: false,
          };
        });

        if (moveScore > 0) {
          setScore((prev) => prev + moveScore);
        }

        // 3. Spawn a new random tile (isNew is set by createTile)
        const emptyCell = getRandomEmptyCell(cleanedTiles);
        if (emptyCell) {
          cleanedTiles.push(createTile(emptyCell.x, emptyCell.y));
        }

        // 4. Verify checkmate
        if (!canMoveAnywhere(cleanedTiles)) {
          setGameOver(true);
        }

        setTiles(cleanedTiles);
        setIsMoving(false);
      }, ANIMATION_TIMING * maxDistance);
    },
    [tiles, isMoving, gameOver, score],
  );

  // Keep a mutable reference of the current move function to avoid event listener thrashing
  const moveRef = useRef(move);
  useEffect(() => {
    moveRef.current = move;
  });

  // Global keyboard input listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          moveRef.current("up");
          break;
        case "ArrowDown":
          moveRef.current("down");
          break;
        case "ArrowLeft":
          moveRef.current("left");
          break;
        case "ArrowRight":
          moveRef.current("right");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const undo = useCallback(() => {
    if (isMoving || history.length === 0) return;

    const previousState = history[history.length - 1];

    let maxDistance = 0;
    const animatedTiles = previousState.tiles.map((prevTile) => {
      const currentTile = tiles.find((t) => t.id === prevTile.id);
      let distance = 0;
      let isNew = prevTile.isNew;

      if (currentTile) {
        // Calculate reverse distance for surviving tiles to trigger CSS slide transition
        distance =
          Math.abs(currentTile.x - prevTile.x) +
          Math.abs(currentTile.y - prevTile.y);
        maxDistance = Math.max(maxDistance, distance);
      } else {
        // Tile was removed (e.g. it merged into another tile). Make it pop in nicely.
        isNew = true;
      }

      return {
        ...prevTile,
        distance: distance > 0 ? distance : undefined,
        isNew,
        justMerged: false,
      };
    });

    setIsMoving(true);
    setTiles(animatedTiles);
    setScore(previousState.score);
    setGameOver(false);
    setHistory((prev) => prev.slice(0, -1));

    // Phase 2: Clear animation properties after they finish
    const animationDuration = Math.max(maxDistance * ANIMATION_TIMING, 200);
    setTimeout(() => {
      setTiles((current) =>
        current.map((t) => ({
          ...t,
          distance: undefined,
          isNew: false,
        })),
      );
      setIsMoving(false);
    }, animationDuration);
  }, [history, isMoving, tiles]);

  const canUndo = history.length > 0 && !isMoving;

  return { tiles, score, gameOver, restart, undo, canUndo };
}
