import { Board, Header, Footer, Tile } from '@/components';
import { useGame } from '@/hooks/useGame';

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
    moveCount,
  } = useGame();

  return (
    <>
      <Header score={score} bestScore={bestScore} restart={restart} />

      <Board
        boardRef={boardRef}
        score={score}
        moveCount={moveCount}
        isGameOver={isGameOver}
        isGameWin={isGameWin}
        restart={restart}
      >
        {tiles.map((tile) => (
          <Tile key={tile.id} tile={tile} />
        ))}
      </Board>

      <Footer undo={undo} canUndo={canUndo} />
    </>
  );
};

export default Game;
