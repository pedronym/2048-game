import { describe, it, expect } from 'vitest';
import {
  getTileAt,
  getRandomEmptyCell,
  canMoveAnywhere,
  moveTiles,
  createTile,
} from './game';
import type { Tile } from '@/@types';
import { GRID_SIZE } from '@/config/constants';

describe('game helpers', () => {
  describe('getTileAt', () => {
    it('returns the correct tile when it exists and is not merged', () => {
      const tile = createTile(1, 2, 2);
      expect(getTileAt([tile], 1, 2)).toEqual(tile);
    });

    it('returns undefined if tile does not exist at coordinates', () => {
      const tile = createTile(1, 2, 2);
      expect(getTileAt([tile], 0, 0)).toBeUndefined();
    });

    it('returns undefined if the tile at coordinates is merged', () => {
      const tile = createTile(1, 2, 2);
      tile.merged = true;
      expect(getTileAt([tile], 1, 2)).toBeUndefined();
    });
  });

  describe('getRandomEmptyCell', () => {
    it('returns null if the board is full', () => {
      const fullBoard: Tile[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
          fullBoard.push(createTile(x, y, 2));
        }
      }
      expect(getRandomEmptyCell(fullBoard)).toBeNull();
    });

    it('returns a valid empty coordinate', () => {
      const nearlyFullBoard: Tile[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
          if (x === GRID_SIZE - 1 && y === GRID_SIZE - 1) continue;
          nearlyFullBoard.push(createTile(x, y, 2));
        }
      }

      const emptyCell = getRandomEmptyCell(nearlyFullBoard);
      expect(emptyCell).toEqual({ x: GRID_SIZE - 1, y: GRID_SIZE - 1 });
    });
  });

  describe('canMoveAnywhere', () => {
    it('returns true if the board is not full', () => {
      const board = [createTile(0, 0, 2)];
      expect(canMoveAnywhere(board)).toBe(true);
    });

    it('returns true if the board is full but there are adjacent matching tiles', () => {
      const fullBoard: Tile[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
          // Fill with 2s and 4s in an alternating pattern that has ONE match
          const val = (x + y) % 2 === 0 ? 2 : 4;
          fullBoard.push(createTile(x, y, val));
        }
      }
      // Force an adjacent match
      fullBoard[0].value = 2;
      fullBoard[1].value = 2;

      expect(canMoveAnywhere(fullBoard)).toBe(true);
    });

    it('returns false if the board is full and no adjacent tiles match', () => {
      const fullBoard: Tile[] = [];
      let valCounter = 1;
      for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
          // Unique values to ensure no matches
          fullBoard.push(createTile(x, y, valCounter++));
        }
      }

      expect(canMoveAnywhere(fullBoard)).toBe(false);
    });
  });

  describe('moveTiles', () => {
    it('slides a single tile to the edge', () => {
      const tile = createTile(1, 1, 2);

      const { nextTiles, moved } = moveTiles([tile], 'left');

      expect(moved).toBe(true);
      expect(nextTiles[0].x).toBe(0);
      expect(nextTiles[0].y).toBe(1);
      expect(nextTiles[0].value).toBe(2);
    });

    it('merges two adjacent identical tiles', () => {
      const tile1 = createTile(0, 0, 2);
      const tile2 = createTile(1, 0, 2);

      const { nextTiles, mergedPairs, moved } = moveTiles(
        [tile1, tile2],
        'left',
      );

      expect(moved).toBe(true);
      expect(mergedPairs.length).toBe(1);

      // Target tile stays at 0,0, but gets marked differently or the source tile moves to 0,0
      const sourceTile = nextTiles.find((t) => t.id === tile2.id);
      const targetTile = nextTiles.find((t) => t.id === tile1.id);

      expect(sourceTile?.x).toBe(0);
      expect(sourceTile?.merged).toBe(true); // Source gets marked as merged
      expect(targetTile?.x).toBe(0);
      expect(targetTile?.merged).toBeFalsy();
    });

    it('stops sliding when hitting a different tile', () => {
      const tile1 = createTile(0, 0, 2);
      const tile2 = createTile(2, 0, 4);

      const { nextTiles, moved } = moveTiles([tile1, tile2], 'left');

      expect(moved).toBe(true);
      const movedTile = nextTiles.find((t) => t.id === tile2.id);

      // Should stop at 1,0 because 0,0 is taken by tile1
      expect(movedTile?.x).toBe(1);
      expect(movedTile?.y).toBe(0);
    });

    it('does not merge a tile that was already merged in the same move', () => {
      // Let's do 2, 2, 2, 2 -> moving left should result in 4, 4
      const t1 = createTile(0, 0, 2);
      const t2 = createTile(1, 0, 2);
      const t3 = createTile(2, 0, 2);
      const t4 = createTile(3, 0, 2);

      const { nextTiles, mergedPairs } = moveTiles([t1, t2, t3, t4], 'left');

      expect(mergedPairs.length).toBe(2);

      const t2Moved = nextTiles.find((t) => t.id === t2.id);
      const t4Moved = nextTiles.find((t) => t.id === t4.id);

      // t2 merges into t1 at 0,0
      expect(t2Moved?.x).toBe(0);
      expect(t2Moved?.merged).toBe(true);

      // t4 merges into t3 at 1,0 (since t3 slides to 1,0)
      expect(t4Moved?.x).toBe(1);
      expect(t4Moved?.merged).toBe(true);
    });
  });
});
