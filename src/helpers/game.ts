import type { Tile } from "../@types";
import { GRID_SIZE } from "../config/constants";

export const generateId = () => Math.random().toString(36).substring(2, 9);

export const createTile = (x: number, y: number, value?: number): Tile => ({
  id: generateId(),
  x,
  y,
  value: value ?? (Math.random() < 0.9 ? 2 : 4),
  isNew: true,
});

// Helper to get coordinates groups based on movement direction
export const getGroups = (direction: "up" | "down" | "left" | "right") => {
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

export const getTileAt = (tiles: Tile[], x: number, y: number) => {
  return tiles.find((t) => t.x === x && t.y === y && !t.merged);
};

export const getRandomEmptyCell = (tiles: Tile[]) => {
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
export const canMoveAnywhere = (tiles: Tile[]) => {
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
export const generateInitialTiles = (): Tile[] => {
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
