import { useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export function ChessBoard() {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [status, setStatus] = useState("");

  const updateGameStatus = () => {
    const game = gameRef.current;
    if (game.isCheckmate()) {
      setStatus(`Checkmate! ${game.turn() === "w" ? "Black" : "White"} wins.`);
    } else if (game.isDraw()) {
      setStatus("Draw!");
    } else if (game.isStalemate()) {
      setStatus("Stalemate!");
    } else {
      setStatus(`${game.turn() === "w" ? "White" : "Black"}'s turn`);
    }
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    const game = gameRef.current;

    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "r", // Auto promote to queen
    });

    if (move === null) return false; // Invalid move

    setFen(game.fen()); // Update board
    updateGameStatus(); // Check if win/draw/stalemate
    return true;
  };

  const resetGame = () => {
    gameRef.current.reset();
    setFen(gameRef.current.fen());
    setStatus("White's turn");
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-[500px]">
      {/* <h1 className="text-2xl font-bold">Chess Game</h1> */}
      <Chessboard
        position={fen}
        onPieceDrop={onDrop}
        boardWidth={500}
        animationDuration={200}
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        }}
        customDarkSquareStyle={{
          backgroundColor: "#779952",
        }}
        customLightSquareStyle={{
          backgroundColor: "#edeed1",
        }}
      />
      <p className="w-full text-lg text-center">{status}</p>
      {/* <button
        onClick={resetGame}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Restart Game
      </button> */}
    </div>
  );
}
