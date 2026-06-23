import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  saveBestScore,
  loadBestScore,
  saveGameState,
  loadGameState,
} from './storage';
import { type GameState } from '@/@types';

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
vi.stubGlobal('localStorage', mockLocalStorage);

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('bestScore', () => {
    it('should save and load best score correctly', () => {
      saveBestScore(1500);
      expect(loadBestScore()).toBe(1500);
    });

    it('should return 0 when no best score exists', () => {
      expect(loadBestScore()).toBe(0);
    });

    it('should return 0 when data is corrupted', () => {
      localStorage.setItem('bestScore', 'invalid_base64!');
      expect(loadBestScore()).toBe(0);
    });
  });

  describe('gameState', () => {
    it('should save and load game state correctly', () => {
      const state = {
        tiles: [],
        isGameOver: false,
        isGameWin: false,
        score: 100,
        bestScore: 200,
        moveCount: 5,
        moveHistory: [],
        isMoving: false,
      };

      saveGameState(state as GameState);
      const loaded = loadGameState();

      expect(loaded).toBeDefined();
      expect(loaded?.score).toBe(100);
      expect(loaded?.moveCount).toBe(5);
    });

    it('should return null when no game state exists', () => {
      expect(loadGameState()).toBeNull();
    });

    it('should remove state and return null when data is invalid', () => {
      const invalidData = btoa(JSON.stringify({ invalid: 'state' }));
      localStorage.setItem('gameState', invalidData);

      expect(loadGameState()).toBeNull();
      expect(localStorage.getItem('gameState')).toBeNull();
    });

    it('should return null when data is corrupted', () => {
      localStorage.setItem('gameState', 'invalid_base64!');
      expect(loadGameState()).toBeNull();
    });
  });
});
