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

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

type CapturedPieces = {
  black: string[];
  white: string[];
};

interface ChessBoardProp {
  roomDetails: any;
  setMoveHistory: SetState<any[]>;
  setCapturedPiecesList: SetState<CapturedPieces>;
  currentUserId?: number; // Add current user ID
}

export function ChessBoard({
  roomDetails,
  setMoveHistory,
  setCapturedPiecesList,
  currentUserId,
}: ChessBoardProp) {
  const gameRef = useRef(new Chess());
  const userData = LocalStorageGetItem("userData");
  const navigate = useNavigate();
  const [fen, setFen] = useState(roomDetails?.fen || gameRef.current.fen());
  const [status, setStatus] = useState("");

  // Determine player color and board orientation
  const isPlayer1 = currentUserId === roomDetails?.player1Id;
  const isPlayer2 = currentUserId === roomDetails?.player2Id;
  const playerColor = isPlayer1 ? "white" : isPlayer2 ? "black" : "white";
  const boardOrientation = playerColor === "white" ? "white" : "black";

  // Check if it's current player's turn
  const isMyTurn = () => {
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
    } else if (game.isDraw()) {
      setStatus("Draw!");
    } else if (game.isStalemate()) {
      setStatus("Stalemate!");
    } else {
      const currentPlayer = game.turn() === "w" ? "White" : "Black";
      const turnStatus = isMyTurn() ? "Your turn" : `${currentPlayer}'s turn`;
      setStatus(turnStatus);
    }
  };

  const updateCapturedPieces = (history: any[]) => {
    const capturedPieces: CapturedPieces = {
      black: [],
      white: [],
    };

    for (const move of history) {
      if (move.captured) {
        if (move.color === "b") {
          // Black captured a white piece
          capturedPieces.white.push(
            pieceUnicodeMap[move.captured.toUpperCase()] || "?"
          );
        } else {
          // White captured a black piece
          capturedPieces.black.push(
            pieceUnicodeMap[move.captured.toLowerCase()] || "?"
          );
        }
      }
    }

    setCapturedPiecesList(capturedPieces);
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    // Don't allow moves if game is over
    if (gameRef.current.isGameOver()) {
      return false;
    }

    // gameRef.current.move({
    //   from: sourceSquare,
    //   to: targetSquare,
    //   promotion: "q", // Default to queen for now
    // });

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
      setMoveHistory(res.history);

      // Update captured pieces
      updateCapturedPieces(res.history);

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
    if (roomDetails?.fen) {
      gameRef.current.load(roomDetails.fen);
      setFen(roomDetails.fen);
    }

    // Update initial status
    updateGameStatus();
  }, [roomDetails]);

  useEffect(() => {
    setMoveHistory(roomDetails?.history || []);
    if (!socket.connected) {
      socket.connect();
      if (roomDetails?.roomCode && userData?.id) {
        socket.emit("join-room", {
          code: roomDetails.roomCode,
          userId: userData.id,
        });
      }
    }

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
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
