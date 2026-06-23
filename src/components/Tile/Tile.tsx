import type { CSSProperties } from 'react';
import { type Tile as TileType } from '@/@types';
import { ANIMATION_TIMING } from '@/config/constants';
import { Shadow } from '@/components';
import styles from './Tile.module.css';

interface TileProps {
  tile: TileType;
}

const Tile = ({ tile }: TileProps) => {
  const duration = (tile.distance ?? 0) * ANIMATION_TIMING;

  const zIndex = tile.y * 10 + tile.x;

  const style = {
    '--x': tile.x,
    '--y': tile.y,
    '--tile-timing': `${duration}ms`,
    zIndex,
  } as CSSProperties;

  const tileClasses = [
    styles.tile,
    tile.isNew && styles.tileNew,
    tile.justMerged && styles.tileMerged,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div role="gridcell" className={tileClasses} style={style}>
      <Shadow />
      <div className={`${styles.tileInner} ${styles[`tile${tile.value}`]}`}>
        <span className={styles.tileNumber}>{tile.value}</span>
      </div>
    </div>
  );
};

export default Tile;
