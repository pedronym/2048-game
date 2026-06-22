import { describe, it, expect } from 'vitest';
import { gameReducer } from './game';
import type { GameState } from '@/@types';
import { createTile } from '@/helpers/game';

describe('gameReducer', () => {
  const getInitialState = (): GameState => ({
    tiles: [],
    score: 0,
    bestScore: 100,
    isGameOver: false,
    isGameWin: false,
    isMoving: false,
    history: [],
  });

  it('handles RESTART', () => {
    const initialState = {
      ...getInitialState(),
      score: 50,
      isGameOver: true,
      isGameWin: true,
      history: [{ tiles: [], score: 10 }],
    };
    const newTiles = [createTile(0, 0, 2)];

    const nextState = gameReducer(initialState, {
      type: 'RESTART',
      payload: { initialTiles: newTiles },
    });

    expect(nextState.tiles).toEqual(newTiles);
    expect(nextState.isMoving).toBe(false);
    expect(nextState.isGameOver).toBe(false);
    expect(nextState.isGameWin).toBe(false);
    expect(nextState.score).toBe(0);
    expect(nextState.history).toEqual([]);
    // bestScore should be preserved
    expect(nextState.bestScore).toBe(100);
  });

  it('handles START_MOVE', () => {
    const initialState = getInitialState();
    const currentTiles = [createTile(0, 0, 2)];
    const nextTiles = [createTile(0, 1, 2)];

    const nextState = gameReducer(initialState, {
      type: 'START_MOVE',
      payload: {
        currentTiles,
        nextTiles,
        currentScore: 10,
      },
    });

    expect(nextState.isMoving).toBe(true);
    expect(nextState.tiles).toEqual(nextTiles);
    expect(nextState.history).toHaveLength(1);
    expect(nextState.history[0]).toEqual({ tiles: currentTiles, score: 10 });
  });

  it('handles START_MOVE with undo limit', () => {
    const initialState = {
      ...getInitialState(),
      history: Array(25).fill({ tiles: [], score: 0 }),
    };

    const nextState = gameReducer(initialState, {
      type: 'START_MOVE',
      payload: { currentTiles: [], nextTiles: [], currentScore: 0 },
    });

    // Should not exceed 25 (UNDO_LIMIT)
    expect(nextState.history.length).toBe(25);
  });

  it('handles END_MOVE', () => {
    const initialState = {
      ...getInitialState(),
      score: 50,
      bestScore: 100,
      isMoving: true,
    };
    const cleanedTiles = [createTile(0, 1, 4)];

    const nextState = gameReducer(initialState, {
      type: 'END_MOVE',
      payload: {
        cleanedTiles,
        moveScore: 20,
        reached2048: true,
        isGameOver: false,
      },
    });

    expect(nextState.isMoving).toBe(false);
    expect(nextState.tiles).toEqual(cleanedTiles);
    expect(nextState.score).toBe(70);
    expect(nextState.bestScore).toBe(100); // Because 70 is not > 100
    expect(nextState.isGameWin).toBe(true);
    expect(nextState.isGameOver).toBe(false);
  });

  it('handles END_MOVE updating best score', () => {
    const initialState = { ...getInitialState(), score: 90, bestScore: 100 };
    const nextState = gameReducer(initialState, {
      type: 'END_MOVE',
      payload: {
        cleanedTiles: [],
        moveScore: 20,
        reached2048: false,
        isGameOver: true,
      },
    });

    expect(nextState.score).toBe(110);
    expect(nextState.bestScore).toBe(110);
    expect(nextState.isGameOver).toBe(true);
  });

  it('handles START_UNDO', () => {
    const previousTiles = [createTile(0, 0, 2)];
    const historyEntry = { tiles: previousTiles, score: 30 };
    const initialState = {
      ...getInitialState(),
      score: 50,
      isGameOver: true,
      isGameWin: true,
      history: [historyEntry],
    };

    const nextState = gameReducer(initialState, {
      type: 'START_UNDO',
      payload: { animatedTiles: previousTiles, previousScore: 30 },
    });

    expect(nextState.isMoving).toBe(true);
    expect(nextState.tiles).toEqual(previousTiles);
    expect(nextState.score).toBe(30);
    expect(nextState.isGameOver).toBe(false);
    expect(nextState.isGameWin).toBe(false);
    expect(nextState.history).toHaveLength(0); // History popped
  });

  it('handles END_UNDO', () => {
    const tile1 = createTile(0, 0, 2);
    tile1.distance = 2;
    tile1.isNew = true;

    const initialState = {
      ...getInitialState(),
      isMoving: true,
      tiles: [tile1],
    };

    const nextState = gameReducer(initialState, { type: 'END_UNDO' });

    expect(nextState.isMoving).toBe(false);
    expect(nextState.tiles[0].distance).toBeUndefined();
    expect(nextState.tiles[0].isNew).toBe(false);
  });
});
