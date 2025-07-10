/* eslint-disable @typescript-eslint/no-explicit-any */
import { SetStateAction, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import socket from "@/lib/socket";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { pieceUnicodeMap } from "@/utils/data";

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

type CapturedPieces = {
  black: string[];
  white: string[];
};
interface ChessBoardProp {
  roomDetails: any;
  setMoveHistory: SetState<any[]>;
  setCapturedPiecesList: SetState<CapturedPieces>;
}

export function ChessBoard({ roomDetails, setMoveHistory, setCapturedPiecesList }: ChessBoardProp) {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(roomDetails?.fen || gameRef.current.fen());
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

    socket.emit("move", {
      from: sourceSquare,
      to: targetSquare,
      promotion: "r"
    })

    return true;
  };

  useSocketEvent("receive-move", (res) => {
    const game = gameRef.current;
    const capturedPieces: CapturedPieces = {
      black: [],
      white: [],
    }

    for (const move of res.history) {
      if (move.captured) {
        if (move.color === 'b') {
          capturedPieces.white.push(pieceUnicodeMap[move.captured.toUpperCase()] || "?");
        } else {
          capturedPieces.black.push(pieceUnicodeMap[move.captured.toLowerCase()] || "?");
        }
      }
    }

    game.move(res.move);
    setFen(res.fen);
    setMoveHistory(res.history);
    setCapturedPiecesList(capturedPieces);
  });

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
