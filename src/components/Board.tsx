import GameOver from "./GameOver";
import GameWin from "./GameWin";

const Board = ({
  isGameOver,
  isGameWin,
  score,
  restart,
  children,
}: {
  isGameOver?: boolean;
  isGameWin?: boolean;
  score: number;
  restart: () => void;
  children?: React.ReactNode;
}) => {
  return (
    <div className="board-wrapper">
      <div className={`board ${isGameOver || isGameWin ? "board--game-over" : ""}`}>
        {children}
      </div>
      {isGameWin && score !== undefined && (
        <GameWin score={score} onRestartClick={restart} />
      )}
      {isGameOver && !isGameWin && score !== undefined && (
        <GameOver score={score} onRestartClick={restart} />
      )}
    </div>
  );
};

export default Board;
