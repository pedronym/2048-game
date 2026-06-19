import GameOver from "./GameOver";

const Board = ({
  isGameOver,
  score,
  restart,
  children,
}: {
  isGameOver?: boolean;
  score?: number;
  restart?: () => void;
  children?: React.ReactNode;
}) => {
  return (
    <div className="board-wrapper">
      <div className={`board ${isGameOver ? "board--game-over" : ""}`}>
        {children}
      </div>
      {isGameOver && score !== undefined && (
        <GameOver score={score} onRestartClick={restart} />
      )}
    </div>
  );
};

export default Board;
