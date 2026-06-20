import { useReducer, useEffect, useCallback, useRef } from "react";
import type { Tile } from "../@types";

import { useSwipe } from "./useSwipe";
import { useKeys } from "./useKeys";
import { ANIMATION_TIMING } from "../config/constants";

import {
  createTile,
  getGroups,
  getTileAt,
  getRandomEmptyCell,
  canMoveAnywhere,
  generateInitialTiles,
} from "../helpers/game";
import {
  loadBestScore,
  saveBestScore,
  loadGameState,
  saveGameState,
} from "../helpers/storage";
import { gameReducer } from "../reducers/game";

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
      gameOver: false,
      gameWin: false,
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
    dispatch({ type: "RESTART", payload: { initialTiles: generateInitialTiles() } });
  }, []);

  const move = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      const { tiles, isMoving, gameOver, gameWin, score } = stateRef.current;
      if (isMoving || gameOver || gameWin) return;

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

      dispatch({
        type: "START_MOVE",
        payload: { nextTiles, currentTiles: tiles, currentScore: score },
      });

      // Phase 2: Run cleanups and value doubling after the longest slide finishes
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
          type: "END_MOVE",
          payload: { cleanedTiles, moveScore, reached2048, isGameOver },
        });
      }, ANIMATION_TIMING * maxDistance);
    },
    [],
  );

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
        ? Math.abs(currentTile.x - prevTile.x) + Math.abs(currentTile.y - prevTile.y)
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
      type: "START_UNDO",
      payload: { animatedTiles, previousScore: previousState.score },
    });

    // Phase 2: Clear animation properties after they finish
    const animationDuration = Math.max(maxDistance * ANIMATION_TIMING, 200);
    setTimeout(() => {
      dispatch({ type: "END_UNDO" });
    }, animationDuration);
  }, []);

  const canUndo = state.history.length > 0 && !state.isMoving;

  return { ...state, restart, undo, canUndo, boardRef };
}
