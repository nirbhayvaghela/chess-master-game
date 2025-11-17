/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, MutableRefObject } from "react";
import { Chess, Move, Square } from "chess.js";
import { useChessGameStore } from "@/store";

type CapturedPieces = {
  black: string[];
  white: string[];
};

interface UseGameHandlersProps {
  gameRef: MutableRefObject<Chess>;
  isPlayer1: boolean;
  isPlayer2: boolean;
  pieceUnicodeMap: Record<string, string>;
}

export const useGameHandlers = ({
  gameRef,
  isPlayer1,
  isPlayer2,
  pieceUnicodeMap,
}: UseGameHandlersProps) => {
  const [status, setStatus] = useState("");
  const { updateCapturedPiecesToStore, capturedPieces } = useChessGameStore();

  const isMyTurn = () => {
    // If game is over, no one can make moves
    if (gameRef.current.isGameOver()) return false;

    const currentTurn = gameRef.current.turn(); // 'w' or 'b'
    return (
      (currentTurn === "w" && isPlayer1) || (currentTurn === "b" && isPlayer2)
    );
  };

  const updateGameStatus = () => {
    const game = gameRef.current;

    if (game.isCheckmate()) {
      const winner = game.turn() === "w" ? "Black" : "White";
      setStatus(`Checkmate! ${winner} wins.`);
    } else if (game.isStalemate()) {
      setStatus("Stalemate!");
    } else if (game.isDraw()) {
      setStatus("Draw!");
    } else if (game.isCheck()) {
      const currentPlayer = game.turn() === "w" ? "White" : "Black";
      const checkStatus = isMyTurn()
        ? "You are in check!"
        : `${currentPlayer} is in check!`;
      setStatus(checkStatus);
    } else {
      const currentPlayer = game.turn() === "w" ? "White" : "Black";
      const turnStatus = isMyTurn() ? "Your turn" : `${currentPlayer}'s turn`;
      setStatus(turnStatus);
    }
  };

  const updateCapturedPieces = (move: Move) => {
    if (move.captured) {
      if (move.color === "b") {
        updateCapturedPiecesToStore(
          [...capturedPieces.white, move],
          capturedPieces.black
        );
      } else {
        updateCapturedPiecesToStore(capturedPieces.white, [
          ...capturedPieces.black,
          move,
        ]);
      }
    }
  };

  // Function to get possible moves for a piece
  const getPossibleMoves = (square: Square): Square[] => {
    const moves = gameRef.current.moves({ square, verbose: true });
    return moves.map((move) => move.to as Square);
  };

  return {
    status,
    isMyTurn,
    updateGameStatus,
    updateCapturedPieces,
    getPossibleMoves,
  };
};
