import { useReducer, useEffect, useCallback, useRef } from 'react';
import type { GameState, Tile } from '@/@types';
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

const initialState: GameState = {
  tiles: [],
  isMoving: false,
  isGameOver: false,
  isGameWin: false,
  score: 0,
  bestScore: 0,
  moveCount: 0,
  moveHistory: [],
};

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState, () => {
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
      moveCount: 0,
      moveHistory: [],
    };
  });

  const stateRef = useRef(state);
  const previousBestScoreRef = useRef(state.bestScore);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (state.bestScore !== previousBestScoreRef.current) {
      saveBestScore(state.bestScore);
      previousBestScoreRef.current = state.bestScore;
    }

    stateRef.current = state;

    if (!state.isMoving) {
      saveGameState(state);
    }
  }, [state]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--animation-timing',
      `${ANIMATION_TIMING}ms`,
    );
  }, []);

  const restart = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
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

    animationTimeoutRef.current = setTimeout(() => {
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

      const emptyCell = getRandomEmptyCell(cleanedTiles);
      if (emptyCell) {
        cleanedTiles.push(createTile(emptyCell.x, emptyCell.y));
      }

      const isGameOver = !reached2048 && !canMoveAnywhere(cleanedTiles);

      dispatch({
        type: 'END_MOVE',
        payload: { cleanedTiles, moveScore, reached2048, isGameOver },
      });
    }, ANIMATION_TIMING * maxDistance);
  }, []);

  const undo = useCallback(() => {
    const { isMoving, moveHistory, tiles } = stateRef.current;
    if (isMoving || moveHistory.length === 0) return;

    const previousState = moveHistory[moveHistory.length - 1];

    let maxDistance = 0;
    const animatedTiles = previousState.tiles.map((prevTile) => {
      const currentTile = tiles.find((t) => t.id === prevTile.id);

      const distance = currentTile
        ? Math.abs(currentTile.x - prevTile.x) +
          Math.abs(currentTile.y - prevTile.y)
        : 0;

      const isNew = currentTile ? prevTile.isNew : false;

      if (currentTile) {
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

    const animationDuration = Math.max(maxDistance * ANIMATION_TIMING, 200);
    animationTimeoutRef.current = setTimeout(() => {
      dispatch({ type: 'END_UNDO' });
    }, animationDuration);
  }, []);

  const boardRef = useRef<HTMLDivElement>(null);
  const canUndo = state.moveHistory.length > 0 && !state.isMoving;

  useSwipe({
    onSwipe: move,
    targetRef: boardRef,
  });

  useKeys({
    onKey: move,
  });

  return {
    ...state,
    restart,
    undo,
    canUndo,
    boardRef,
  };
}
