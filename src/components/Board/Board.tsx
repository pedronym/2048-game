import type { PropsWithChildren } from 'react';
import { Cell, GameEnd } from '@/components';
import { GRID_SIZE } from '@/config/constants';
import styles from './Board.module.css';

interface BoardProps {
  boardRef?: React.RefObject<HTMLDivElement | null>;
  score?: number;
  moveCount?: number;
  isGameOver?: boolean;
  isGameWin?: boolean;
  restart?: () => void;
}

const Board = ({
  boardRef,
  score = 0,
  moveCount = 0,
  isGameOver,
  isGameWin,
  restart,
  children,
}: PropsWithChildren<BoardProps>) => {
  return (
    <main className={styles.boardContainer} ref={boardRef}>
      <div className={styles.boardWrapper}>
        <div
          role="grid"
          aria-label="2048 Game Board"
          className={`${styles.board} ${isGameOver || isGameWin ? styles.boardGameOver : ''}`}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => (
            <Cell key={i} />
          ))}

          {children}
        </div>
        {(isGameOver || isGameWin) && (
          <GameEnd
            score={score}
            onRestartClick={restart}
            isWin={!!isGameWin}
            moveCount={moveCount}
          />
        )}
      </div>
    </main>
  );
};

export default Board;
