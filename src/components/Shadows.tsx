import type { CSSProperties } from "react";
import type { Tile } from "../@types";
import { GRID_SIZE, ANIMATION_TIMING } from "../config/constants";

interface ShadowsProps {
  tiles: Tile[];
}

const Shadows = ({ tiles }: ShadowsProps) => {
  return (
    <>
      {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
        const row = Math.floor(i / GRID_SIZE);
        const col = i % GRID_SIZE;
        const occupyingTile = tiles.find(
          (t) => t.x === col && t.y === row && !t.merged,
        );

        const distance = occupyingTile?.distance ?? 0;
        const delay = Math.max(0, (distance - 1) * ANIMATION_TIMING);

        const style = {
          "--x": col,
          "--y": row,
          "--shadow-delay": `${delay}ms`,
        } as CSSProperties;

        return (
          <div
            key={i}
            className={`tile-shadow${occupyingTile ? " tile-shadow--active" : ""}`}
            style={style}
          />
        );
      })}
    </>
  );
};

export default Shadows;
