import type { Tile, GameState } from '@/@types';

export type GameAction =
  | { type: 'RESTART'; payload: { initialTiles: Tile[] } }
  | {
      type: 'START_MOVE';
      payload: {
        nextTiles: Tile[];
        currentTiles: Tile[];
        currentScore: number;
      };
    }
  | {
      type: 'END_MOVE';
      payload: {
        cleanedTiles: Tile[];
        moveScore: number;
        reached2048: boolean;
        isGameOver: boolean;
      };
    }
  | {
      type: 'START_UNDO';
      payload: { animatedTiles: Tile[]; previousScore: number };
    }
  | { type: 'END_UNDO' };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'RESTART':
      return {
        ...state,
        tiles: action.payload.initialTiles,
        isMoving: false,
        isGameOver: false,
        isGameWin: false,
        score: 0,
        history: [],
      };
    case 'START_MOVE':
      return {
        ...state,
        isMoving: true,
        tiles: action.payload.nextTiles,
        history: [
          ...state.history,
          {
            tiles: action.payload.currentTiles.map((t) => ({ ...t })),
            score: action.payload.currentScore,
          },
        ],
      };
    case 'END_MOVE': {
      const newScore = state.score + action.payload.moveScore;
      return {
        ...state,
        isMoving: false,
        tiles: action.payload.cleanedTiles,
        score: newScore,
        bestScore: Math.max(state.bestScore, newScore),
        isGameWin: action.payload.reached2048 ? true : state.isGameWin,
        isGameOver: action.payload.isGameOver,
      };
    }
    case 'START_UNDO':
      return {
        ...state,
        isMoving: true,
        tiles: action.payload.animatedTiles,
        score: action.payload.previousScore,
        isGameOver: false,
        isGameWin: false,
        history: state.history.slice(0, -1),
      };
    case 'END_UNDO':
      return {
        ...state,
        isMoving: false,
        tiles: state.tiles.map((t) => ({
          ...t,
          distance: undefined,
          isNew: false,
        })),
      };
    default:
      return state;
  }
}
