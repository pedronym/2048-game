

interface GameWinProps {
  score: number;
  onRestartClick: () => void;
}

const GameWin = ({ score, onRestartClick }: GameWinProps) => {
  return (
    <div className="game-over">
      <div>
        <div className="game-over-text">You won!</div>
        <div className="game-over-score">You scored {score}!</div>
      </div>
      <button className="btn" onClick={onRestartClick}>
        Play again
      </button>
    </div>
  );
};

export default GameWin;
