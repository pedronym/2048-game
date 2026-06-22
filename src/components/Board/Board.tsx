import { Cell, GameEnd } from '@/components';
import { GRID_SIZE } from '@/config/constants';
import styles from './Board.module.css';

const Board = ({
  isGameOver,
  isGameWin,
  score,
  restart,
  children,
  boardRef,
  historyLength,
}: {
  isGameOver?: boolean;
  isGameWin?: boolean;
  score: number;
  restart: () => void;
  children?: React.ReactNode;
  boardRef?: React.RefObject<HTMLDivElement | null>;
  historyLength?: number;
}) => {
  return (
    <main className={styles.boardContainer} ref={boardRef}>
      <div className={styles.boardWrapper}>
        <div
          className={`${styles.board} ${isGameOver || isGameWin ? styles.boardGameOver : ''}`}
        >
          {/* Board Cells */}
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
            historyLength={historyLength}
          />
        )}
      </div>
    </main>
  );
};

export default Board;
