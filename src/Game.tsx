import { useEffect } from "react";
import Board from "./components/Board";
import Cell from "./components/Cell";
import Logo from "./components/Logo";
import Shadows from "./components/Shadows";
import Tile from "./components/Tile";
import { useGame } from "./hooks/useGame";
import { GRID_SIZE, ANIMATION_TIMING } from "./config/constants";
import "./Game.css";

const Game = () => {
  const { tiles, score, bestScore, gameOver, gameWin, restart, undo, canUndo, boardRef } = useGame();

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--animation-timing",
      `${ANIMATION_TIMING}ms`,
    );
  }, []);

  return (
    <>
      <header className="header">
        <div className="header-logo">
          <Logo />
        </div>
        <div className="header-score">
          <div className="current-score">
            <div className="score-label">Score</div>
            <div className="score-value">{score}</div>
          </div>
          <div className="best-score">
            <div className="score-label">Best</div>
            <div className="score-value">{bestScore}</div>
          </div>
        </div>
        <div className="header-controls">
          <button className="btn" onClick={restart}>
            New Game
          </button>
        </div>
      </header>

      <main className="board-container" ref={boardRef as React.RefObject<HTMLDivElement>}>
        <Board isGameOver={gameOver} isGameWin={gameWin} score={score} restart={restart}>
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => (
            <Cell key={i} />
          ))}
          <Shadows tiles={tiles} />
          {tiles.map((tile) => (
            <Tile key={tile.id} tile={tile} />
          ))}
        </Board>
      </main>

      <footer className="footer">
        <button className="btn" onClick={undo} disabled={!canUndo}>
          Undo
        </button>
        <p>© {new Date().getFullYear()} Bluedot. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Game;
