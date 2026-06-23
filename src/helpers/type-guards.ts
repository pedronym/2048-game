import type { GameState, Tile } from '@/@types';

export function isValidTile(tile: unknown): tile is Tile {
  if (!isObject(tile)) return false;

  return (
    isString(tile.id) &&
    isNumber(tile.x) &&
    isNumber(tile.y) &&
    isNumber(tile.value)
  );
}

export function isValidGameState(
  state: unknown,
): state is Omit<GameState, 'bestScore' | 'isMoving'> {
  if (!isObject(state)) return false;

  if (!Array.isArray(state.tiles) || !state.tiles.every(isValidTile)) {
    return false;
  }

  if (!isBoolean(state.isGameOver) || !isBoolean(state.isGameWin)) {
    return false;
  }

  if (!isNumber(state.score) || !isNumber(state.moveCount)) {
    return false;
  }

  if (!Array.isArray(state.moveHistory)) {
    return false;
  }

  if (!isValidHistory(state.moveHistory)) return false;

  return true;
}

function isValidHistory(
  history: unknown[],
): history is GameState['moveHistory'] {
  return history.every((historyEntry: unknown) => {
    if (!isObject(historyEntry)) return false;
    return (
      isNumber(historyEntry.score) &&
      Array.isArray(historyEntry.tiles) &&
      historyEntry.tiles.every(isValidTile)
    );
  });
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}
