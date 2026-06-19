import { useState } from "react";

const gameOverTips = [
  "Try to keep your highest tile locked into one corner.",
  "Avoid swiping up if your main tiles are at the bottom.",
  "Keep your rows organized from highest to lowest value.",
  "Always clear out smaller tiles first to keep the grid open.",
];

interface GameOverProps {
  score: number;
  onRestartClick: () => void;
}

const GameOver = ({ score, onRestartClick }: GameOverProps) => {
  const [randomTip] = useState(
    () => gameOverTips[Math.floor(Math.random() * gameOverTips.length)],
  );

  return (
    <div className="game-over">
      <div>
        <div className="game-over-text">Game Over</div>
        <div className="game-over-score">You scored {score}!</div>
      </div>
      <button className="btn" onClick={onRestartClick}>
        Try again
      </button>
      <p className="game-over-tip">{randomTip}</p>
    </div>
  );
};

export default GameOver;
