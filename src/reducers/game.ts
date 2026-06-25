import type { Tile, GameState } from '@/@types';

type RestartAction = { type: 'RESTART'; payload: { initialTiles: Tile[] } };

type StartMoveAction = {
  type: 'START_MOVE';
  payload: {
    nextTiles: Tile[];
    currentTiles: Tile[];
    currentScore: number;
  };
};

type EndMoveAction = {
  type: 'END_MOVE';
  payload: {
    cleanedTiles: Tile[];
    moveScore: number;
    reached2048: boolean;
    isGameOver: boolean;
  };
};

type StartUndoAction = {
  type: 'START_UNDO';
  payload: { animatedTiles: Tile[]; previousScore: number };
};

type EndUndoAction = { type: 'END_UNDO' };

export type GameAction =
  | RestartAction
  | StartMoveAction
  | EndMoveAction
  | StartUndoAction
  | EndUndoAction;

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
        moveCount: 0,
        moveHistory: [],
      };
    case 'START_MOVE':
      return {
        ...state,
        isMoving: true,
        moveCount: state.moveCount + 1,
        tiles: action.payload.nextTiles,
        moveHistory: [
          ...state.moveHistory,
          {
            tiles: action.payload.currentTiles,
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
        moveCount: Math.max(0, state.moveCount - 1),
        tiles: action.payload.animatedTiles,
        score: action.payload.previousScore,
        isGameOver: false,
        isGameWin: false,
        moveHistory: state.moveHistory.slice(0, -1),
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
