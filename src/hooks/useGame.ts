import { useReducer, useEffect, useCallback, useRef } from 'react';
import type { Tile } from '@/@types';

import { useSwipe } from '@/hooks/useSwipe';
import { useKeys } from '@/hooks/useKeys';
import { ANIMATION_TIMING } from '@/config/constants';

import {
  createTile,
  getRandomEmptyCell,
  canMoveAnywhere,
  generateInitialTiles,
  moveTiles,
} from '@/helpers/game';
import {
  loadBestScore,
  saveBestScore,
  loadGameState,
  saveGameState,
} from '@/helpers/storage';
import { gameReducer } from '@/reducers/game';

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => {
    const loadedState = loadGameState();
    if (loadedState) {
      return {
        ...loadedState,
        bestScore: loadBestScore(),
      };
    }

    return {
      tiles: generateInitialTiles(),
      isMoving: false,
      isGameOver: false,
      isGameWin: false,
      score: 0,
      bestScore: loadBestScore(),
      history: [],
    };
  });

  useEffect(() => {
    saveBestScore(state.bestScore);
    if (!state.isMoving) {
      saveGameState(state);
    }
  }, [state]);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Initialize/Restart the board
  const restart = useCallback(() => {
    dispatch({
      type: 'RESTART',
      payload: { initialTiles: generateInitialTiles() },
    });
  }, []);

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const { tiles, isMoving, isGameOver, isGameWin, score } = stateRef.current;
    if (isMoving || isGameOver || isGameWin) return;

    const { nextTiles, mergedPairs, moved, maxDistance } = moveTiles(
      tiles,
      direction,
    );

    if (!moved) return;

    dispatch({
      type: 'START_MOVE',
      payload: { nextTiles, currentTiles: tiles, currentScore: score },
    });

    // Run cleanups and value doubling after the longest slide finishes
    setTimeout(() => {
      let cleanedTiles = nextTiles.filter((t) => !t.merged);

      let moveScore = 0;
      let reached2048 = false;
      cleanedTiles = cleanedTiles.map((tile): Tile => {
        const pair = mergedPairs.find((p) => p.targetId === tile.id);

        if (pair) {
          const newValue = tile.value * 2;
          moveScore += newValue;

          if (newValue === 2048) {
            reached2048 = true;
          }

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

      // 3. Spawn a new random tile (isNew is set by createTile)
      const emptyCell = getRandomEmptyCell(cleanedTiles);
      if (emptyCell) {
        cleanedTiles.push(createTile(emptyCell.x, emptyCell.y));
      }

      // 4. Verify checkmate
      const isGameOver = !reached2048 && !canMoveAnywhere(cleanedTiles);

      dispatch({
        type: 'END_MOVE',
        payload: { cleanedTiles, moveScore, reached2048, isGameOver },
      });
    }, ANIMATION_TIMING * maxDistance);
  }, []);

  const boardRef = useRef<HTMLDivElement>(null);

  useSwipe({
    onSwipe: move,
    targetRef: boardRef,
  });

  useKeys({
    onKey: move,
  });

  const undo = useCallback(() => {
    const { isMoving, history, tiles } = stateRef.current;
    if (isMoving || history.length === 0) return;

    const previousState = history[history.length - 1];

    let maxDistance = 0;
    const animatedTiles = previousState.tiles.map((prevTile) => {
      const currentTile = tiles.find((t) => t.id === prevTile.id);

      const distance = currentTile
        ? Math.abs(currentTile.x - prevTile.x) +
          Math.abs(currentTile.y - prevTile.y)
        : 0;

      const isNew = currentTile ? prevTile.isNew : true;

      if (currentTile) {
        // Calculate reverse distance for surviving tiles to trigger CSS slide transition
        maxDistance = Math.max(maxDistance, distance);
      }

      return {
        ...prevTile,
        distance: distance > 0 ? distance : undefined,
        isNew,
        justMerged: false,
      };
    });

    dispatch({
      type: 'START_UNDO',
      payload: { animatedTiles, previousScore: previousState.score },
    });

    // Phase 2: Clear animation properties after they finish
    const animationDuration = Math.max(maxDistance * ANIMATION_TIMING, 200);
    setTimeout(() => {
      dispatch({ type: 'END_UNDO' });
    }, animationDuration);
  }, []);

  const canUndo = state.history.length > 0 && !state.isMoving;

  return {
    ...state,
    historyLength: state.history.length,
    restart,
    undo,
    canUndo,
    boardRef,
  };
}
