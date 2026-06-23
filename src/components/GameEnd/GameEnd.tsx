import { useState } from 'react';
import styles from './GameEnd.module.css';

const gameOverTips = [
  'Try to keep your highest tile locked into one corner.',
  'Avoid swiping up if your main tiles are at the bottom.',
  'Keep your rows organized from highest to lowest value.',
  'Clear out smaller tiles first to keep the grid open.',
];

interface GameEndProps {
  isWin: boolean;
  score: number;
  onRestartClick?: () => void;
  moveCount?: number;
}

const GameEnd = ({
  score = 0,
  moveCount = 0,
  isWin,
  onRestartClick,
}: GameEndProps) => {
  const [randomTip] = useState(
    () => gameOverTips[Math.floor(Math.random() * gameOverTips.length)],
  );

  return (
    <div className={styles.gameEnd} role="alert">
      <div>
        <div className={styles.gameEndText}>
          {isWin ? 'You win!' : 'Game Over'}
        </div>
        <div className={styles.gameEndScore}>
          {isWin
            ? `You scored ${score} in ${moveCount} moves!`
            : `You scored ${score}!`}
        </div>
      </div>
      <button className="btn" onClick={onRestartClick} autoFocus>
        {isWin ? 'Play again' : 'Try again'}
      </button>
      {!isWin && <p className={styles.gameEndTip}>{randomTip}</p>}
    </div>
  );
};

export default GameEnd;
