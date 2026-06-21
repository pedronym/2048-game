import { useEffect } from 'react';
import { Board, Cell, Header, Footer, Tile } from '@/components';
import { useGame } from '@/hooks/useGame';
import { GRID_SIZE, ANIMATION_TIMING } from '@/config/constants';

const Game = () => {
  const {
    tiles,
    score,
    bestScore,
    isGameOver,
    isGameWin,
    restart,
    undo,
    canUndo,
    boardRef,
    historyLength,
  } = useGame();

  // Sets a CSS variable for the animation speed timing
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--animation-timing',
      `${ANIMATION_TIMING}ms`,
    );
  }, []);

  return (
    <>
      <Header score={score} bestScore={bestScore} restart={restart} />

      <Board
        isGameOver={isGameOver}
        isGameWin={isGameWin}
        score={score}
        restart={restart}
        boardRef={boardRef}
        historyLength={historyLength}
      >
        {/* Board Cells */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => (
          <Cell key={i} />
        ))}

        {/* Tiles */}
        {tiles.map((tile) => (
          <Tile key={tile.id} tile={tile} />
        ))}
      </Board>

      <Footer undo={undo} canUndo={canUndo} />
    </>
  );
};

export default Game;
