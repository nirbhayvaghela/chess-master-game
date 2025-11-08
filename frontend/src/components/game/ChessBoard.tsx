/* eslint-disable @typescript-eslint/no-explicit-any */
import { SetStateAction, useEffect, useRef, useState } from "react";
import { Chess, Square } from "chess.js";
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
import { error } from "console";

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
  const isSpectator =
    currentUserId !== roomDetails?.player1Id &&
    currentUserId !== roomDetails?.player2Id;
  const playerColor = isPlayer1 ? "white" : isPlayer2 ? "black" : "white";
  const boardOrientation = playerColor === "white" ? "white" : "black";

  // State for piece selection and move highlighting
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [squareStyles, setSquareStyles] = useState<
    Record<string, React.CSSProperties>
  >({});

  // Use the game handlers hook
  const {
    status,
    isMyTurn,
    updateGameStatus,
    updateCapturedPieces,
    getPossibleMoves,
  } = useGameHandlers({
    gameRef,
    isPlayer1,
    isPlayer2,
    pieceUnicodeMap,
  });

  // Function to highlight squares
  const highlightSquares = (squares: Square[], selectedSquare?: Square) => {
    const newSquareStyles: Record<string, React.CSSProperties> = {};

    // Highlight selected square
    if (selectedSquare) {
      newSquareStyles[selectedSquare] = {
        backgroundColor: "rgba(255, 255, 0, 0.4)",
        border: "2px solid #ffff00",
      };
    }

    // Highlight possible moves
    squares.forEach((square) => {
      newSquareStyles[square] = {
        backgroundColor: "rgba(0, 255, 0, 0.4)",
        border: "2px solid #00ff00",
        cursor: "pointer",
      };
    });

    setSquareStyles(newSquareStyles);
  };

  // Function to clear highlights
  const clearHighlights = () => {
    setSquareStyles({});
    setSelectedSquare(null);
    setPossibleMoves([]);
  };

  // Handle square click
  const onSquareClick = (square: Square) => {
    // Don't allow moves if game is over
    if (gameRef.current.isGameOver()) return;
    if (isSpectator) return;

    // Only allow interactions if it's the player's turn
    if (!isMyTurn()) {
      toast.error("It's not your turn!");
      return;
    }

    const piece = gameRef.current.get(square);

    // If clicking on a piece of the current player's color
    if (piece && piece.color === gameRef.current.turn()) {
      // Select the piece and show possible moves
      setSelectedSquare(square);
      const moves = getPossibleMoves(square);
      setPossibleMoves(moves);
      highlightSquares(moves, square);
    } else if (selectedSquare) {
      // If a piece is selected and clicking on a possible move
      if (possibleMoves.includes(square)) {
        // Make the move
        makeMove(selectedSquare, square);
      } else {
        // Clear selection if clicking elsewhere
        clearHighlights();
      }
    }
  };

  // Function to make a move
  const makeMove = (from: Square, to: Square) => {
    socket.emit("move", {
      gameId: roomDetails.id,
      move: {
        from,
        to,
        // Add promotion logic if needed
        // promotion: "q", // Default to queen for now
      },
    });

    // Clear highlights after making a move
    clearHighlights();
  };

  // Enhanced onDrop function
  const onDrop = (sourceSquare: string, targetSquare: string) => {
    // Don't allow moves if game is over
    if (gameRef.current.isGameOver()) return false;
    if (isSpectator) return;

    // Only allow moves if it's the player's turn
    if (!isMyTurn()) {
      toast.error("It's not your turn!");
      return false;
    }

    // Check if the move is valid
    const possibleMoves = getPossibleMoves(sourceSquare as Square);
    if (!possibleMoves.includes(targetSquare as Square)) {
      toast.error("Invalid move!");
      return false;
    }

    makeMove(sourceSquare as Square, targetSquare as Square);
    socket.emit("move", {
      gameId: roomDetails.id,
      move: {
        from: sourceSquare,
        to: targetSquare,
        // Add promotion logic if needed
        // promotion: "q", // Default to queen for now
      },
    });

    clearHighlights();

    return true;
  };

  // Handle piece selection on drag start
  const onPieceDragBegin = (piece: string, sourceSquare: Square) => {
    // Don't allow dragging if game is over
    if (gameRef.current.isGameOver()) {
      return false;
    }

    // Only allow dragging if it's the player's turn
    if (!isMyTurn()) {
      return false;
    }

    // Highlight possible moves when starting to drag
    const moves = getPossibleMoves(sourceSquare);
    highlightSquares(moves, sourceSquare);
    setSelectedSquare(sourceSquare);
    setPossibleMoves(moves);
  };

  // Clear highlights when drag ends
  const onPieceDragEnd = () => {
    // Keep highlights for a moment to show the move, then clear
    setTimeout(() => {
      clearHighlights();
    }, 500);
  };

  useSocketEvent("receive-move", (res) => {
    try {
      const game = gameRef.current;

      // Apply the move to local game state
      // game.move(res.move);
      game.load(res.fen);
      setFen(res.fen);

      // Update FEN

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
    console.log(res.error, "error COrrect");
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

    // Clear highlights on game state change
    clearHighlights();
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

      {/* Game instructions */}
      <div className="text-xs text-gray-500 text-center">
        {isMyTurn() ? (
          <span>Your turn - Click on a piece to see possible moves</span>
        ) : (
          <span>Waiting for opponent's move...</span>
        )}
      </div>

      <Chessboard
        position={fen}
        onPieceDrop={onDrop}
        onSquareClick={onSquareClick}
        onPieceDragBegin={onPieceDragBegin}
        onPieceDragEnd={onPieceDragEnd}
        boardWidth={500}
        animationDuration={200}
        boardOrientation={boardOrientation}
        customSquareStyles={squareStyles}
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

      {/* Debug info - remove in production */}
      {selectedSquare && (
        <div className="text-xs text-gray-400">
          Selected: {selectedSquare} | Possible moves:{" "}
          {possibleMoves.join(", ")}
        </div>
      )}
    </div>
  );
}
