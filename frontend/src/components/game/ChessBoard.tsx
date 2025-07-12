/* eslint-disable @typescript-eslint/no-explicit-any */
import { SetStateAction, useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import socket from "@/lib/socket";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { pieceUnicodeMap } from "@/utils/data";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { routes } from "@/utils/constants/routes";
import { LocalStorageGetItem } from "@/utils/helpers/storageHelper";
import { useGameHandlers } from "@/hooks/useGameHandlers";
import { useChessGameStore } from "@/store";
import { add, set } from "date-fns";

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

type CapturedPieces = {
  black: string[];
  white: string[];
};

interface ChessBoardProp {
  roomDetails: any;
  currentUserId?: number;
}

export function ChessBoard({ roomDetails, currentUserId }: ChessBoardProp) {
  const gameRef = useRef(new Chess());
  const userData = LocalStorageGetItem("userData");
  const { fen, setFen, moveHistory, addMove } = useChessGameStore();
  const isPlayer1 = currentUserId === roomDetails?.player1Id;
  const isPlayer2 = currentUserId === roomDetails?.player2Id;
  const playerColor = isPlayer1 ? "white" : isPlayer2 ? "black" : "white";
  const boardOrientation = playerColor === "white" ? "white" : "black";

  // Use the game handlers hook
  const { status, isMyTurn, updateGameStatus, updateCapturedPieces } =
    useGameHandlers({
      gameRef,
      isPlayer1,
      isPlayer2,
      pieceUnicodeMap,
    });

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    // Don't allow moves if game is over
    if (gameRef.current.isGameOver()) {
      return false;
    }

    // Only allow moves if it's the player's turn
    if (!isMyTurn()) {
      toast.error("It's not your turn!");
      return false;
    }
    
    socket.emit("move", {
      gameId: roomDetails.id,
      move: {
        from: sourceSquare,
        to: targetSquare,
        // Add promotion logic if needed
        // promotion: "q", // Default to queen for now
      },
    });

    return true;
  };

  useSocketEvent("receive-move", (res) => {
    try {
      const game = gameRef.current;

      // Apply the move to local game state
      game.move(res.move);

      // Update FEN
      setFen(res.fen);

      // Update move history
      addMove(res.move);

      // Update captured pieces
      updateCapturedPieces(res.move);

      // Update game status
      updateGameStatus();

      // Handle end game scenarios
      if (res.status === "completed") {
        if (res.winnerId) {
          toast.success(`Game completed! Winner: ${res.winnerId}`);
        }
      } else if (res.status === "draw") {
        toast.info("Game ended in a draw!");
      }
    } catch (error) {
      console.error("Error processing move:", error);
      toast.error("Error processing move");
    }
  });

  useSocketEvent("error", (res) => {
    toast.error(res.message || "An error occurred");
  });

  useEffect(() => {
    // Initialize game state
    setFen(roomDetails.fen || gameRef.current.fen());
    if (roomDetails?.fen) {
      gameRef.current.load(roomDetails.fen);
      setFen(roomDetails.fen);
    }

    // Update initial status
    updateGameStatus();
  }, [roomDetails]);

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-[500px]">
      {/* Player info */}
      <div className="w-full flex justify-between items-center text-sm text-gray-600">
        <span>
          You are playing as: <strong>{playerColor}</strong>
        </span>
        <span>Room ID: {roomDetails?.id}</span>
      </div>

      <Chessboard
        position={fen}
        onPieceDrop={onDrop}
        boardWidth={500}
        animationDuration={200}
        boardOrientation={boardOrientation}
        arePiecesDraggable={isMyTurn()} // Only allow dragging on player's turn
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
      <p className="w-full text-lg text-center font-semibold">{status}</p>
    </div>
  );
}
