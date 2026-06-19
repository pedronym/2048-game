import type { CSSProperties } from "react";
import { type Tile as TileType } from "../@types";
import { ANIMATION_TIMING } from "../config/constants";

interface TileProps {
  tile: TileType;
}

const Tile = ({ tile }: TileProps) => {
  const duration = (tile.distance ?? 0) * ANIMATION_TIMING;

  const style = {
    "--x": tile.x,
    "--y": tile.y,
    "--tile-timing": `${duration}ms`,
  } as CSSProperties;

  const tileClasses = [
    "tile",
    tile.isNew && "tile--new",
    tile.justMerged && "tile--merged",
    tile.merged && "tile--retiring",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={tileClasses} style={style}>
      <div className={`tile-inner tile-${tile.value}`}>{tile.value}</div>
    </div>
  );
};

export default Tile;
