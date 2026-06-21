import Logo from '@/components/Logo/Logo';
import styles from './Header.module.css';

interface HeaderProps {
  score: number;
  bestScore: number;
  restart: () => void;
}

const Header = ({ score, bestScore, restart }: HeaderProps) => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Logo />
      </div>
      <div className={styles.controls}>
        <button className="btn" onClick={restart}>
          New Game
        </button>
      </div>
      <div className={styles.scoreContainer}>
        <div className={styles.currentScore}>
          <div className={styles.scoreLabel}>Score</div>
          <div className={styles.scoreValue}>{score}</div>
        </div>
        <div className={styles.bestScore}>
          <div className={styles.scoreLabel}>Best</div>
          <div className={styles.scoreValue}>{bestScore}</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
