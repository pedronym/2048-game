import GameEnd from '@/components/GameEnd/GameEnd';
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
