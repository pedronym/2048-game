import { describe, it, expect } from 'vitest';
import { isValidTile, isValidGameState } from './type-guards';
import type { Tile } from '@/@types';

describe('type-guards', () => {
  describe('isValidTile', () => {
    it('should return true for a valid tile', () => {
      const tile: Tile = { id: '1', x: 0, y: 0, value: 2 };
      expect(isValidTile(tile)).toBe(true);
    });

    it('should return false for invalid tiles', () => {
      expect(isValidTile(null)).toBe(false);
      expect(isValidTile(undefined)).toBe(false);
      expect(isValidTile({})).toBe(false);
      expect(isValidTile({ id: '1', x: '0', y: 0, value: 2 })).toBe(false);
    });
  });

  describe('isValidGameState', () => {
    it('should return true for a valid game state', () => {
      const state = {
        tiles: [],
        isGameOver: false,
        isGameWin: false,
        score: 0,
        moveCount: 0,
        moveHistory: [],
      };
      expect(isValidGameState(state)).toBe(true);
    });

    it('should return false for invalid game states', () => {
      expect(isValidGameState(null)).toBe(false);
      expect(isValidGameState({})).toBe(false);
      expect(
        isValidGameState({
          tiles: 'not array',
          isGameOver: false,
          isGameWin: false,
          score: 0,
          moveCount: 0,
          moveHistory: [],
        }),
      ).toBe(false);
    });
  });
});
