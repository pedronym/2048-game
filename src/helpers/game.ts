import type { Tile } from '@/@types';
import { GRID_SIZE } from '@/config/constants';

export const generateId = () => Math.random().toString(36).substring(2, 9);

export const createTile = (x: number, y: number, value?: number): Tile => ({
  id: generateId(),
  x,
  y,
  value: value ?? (Math.random() < 0.9 ? 2 : 4),
  isNew: true,
});

export const getGroups = (direction: 'up' | 'down' | 'left' | 'right') => {
  const groups: { x: number; y: number }[][] = [];
  for (let track = 0; track < GRID_SIZE; track++) {
    const group: { x: number; y: number }[] = [];
    for (let step = 0; step < GRID_SIZE; step++) {
      if (direction === 'up') {
        group.push({ x: track, y: step });
      } else if (direction === 'down') {
        group.push({ x: track, y: GRID_SIZE - 1 - step });
      } else if (direction === 'left') {
        group.push({ x: step, y: track });
      } else if (direction === 'right') {
        group.push({ x: GRID_SIZE - 1 - step, y: track });
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

export const canMoveAnywhere = (tiles: Tile[]) => {
  const grid: (number | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(null),
  );

  let filledCells = 0;

  for (const t of tiles) {
    if (t.merged) continue;
    grid[t.y][t.x] = t.value;
    filledCells++;
  }

  if (filledCells < GRID_SIZE * GRID_SIZE) return true;

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const value = grid[y][x];
      if (value === null) continue;

      if (x + 1 < GRID_SIZE && grid[y][x + 1] === value) return true;
      if (y + 1 < GRID_SIZE && grid[y + 1][x] === value) return true;
    }
  }
  return false;
};

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

export const moveTiles = (
  tiles: Tile[],
  direction: 'up' | 'down' | 'left' | 'right',
) => {
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

  return { nextTiles, mergedPairs, moved, maxDistance };
};
