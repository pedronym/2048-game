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
