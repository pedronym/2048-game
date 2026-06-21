export interface Tile {
  id: string;
  x: number;
  y: number;
  value: number;
  merged?: boolean;
  distance?: number;
  isNew?: boolean;
  justMerged?: boolean;
}

export type GameState = {
  tiles: Tile[];
  isMoving: boolean;
  isGameOver: boolean;
  isGameWin: boolean;
  score: number;
  bestScore: number;
  history: { tiles: Tile[]; score: number }[];
};
