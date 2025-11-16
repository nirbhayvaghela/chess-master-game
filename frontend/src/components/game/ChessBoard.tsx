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
import { cn } from "@/lib/utils";

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

interface ChessBoardProp {
  roomDetails: any;
  currentUserId?: number;
  className?: string;
}

export function ChessBoard({
  roomDetails,
  currentUserId,
  className,
}: ChessBoardProp) {
  const gameRef = useRef(new Chess());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [boardWidth, setBoardWidth] = useState<number>(360); // sensible default for small screens
  const { fen, setFen, moveHistory, addMove } = useChessGameStore();
  const isPlayer1 = currentUserId === roomDetails?.player1Id;
  const isPlayer2 = currentUserId === roomDetails?.player2Id;
  const isSpectator =
    currentUserId !== roomDetails?.player1Id &&
    currentUserId !== roomDetails?.player2Id;
  const playerColor = isPlayer1 ? "white" : isPlayer2 ? "black" : "white";
  const boardOrientation = playerColor === "white" ? "white" : "black";

  // Selection / highlighting
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [squareStyles, setSquareStyles] = useState<
    Record<string, React.CSSProperties>
  >({});

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

  // ---------------------
  // Highlight helpers
  // ---------------------
  const highlightSquares = (squares: Square[], selectedSquare?: Square) => {
    const newSquareStyles: Record<string, React.CSSProperties> = {};

    if (selectedSquare) {
      newSquareStyles[selectedSquare] = {
        backgroundColor: "rgba(255, 255, 0, 0.4)",
        border: "2px solid #ffff00",
      };
    }

    squares.forEach((square) => {
      newSquareStyles[square] = {
        backgroundColor: "rgba(0, 255, 0, 0.18)",
        border: "2px solid rgba(0,255,0,0.6)",
        cursor: "pointer",
      };
    });

    setSquareStyles(newSquareStyles);
  };

  const clearHighlights = () => {
    setSquareStyles({});
    setSelectedSquare(null);
    setPossibleMoves([]);
  };

  // ---------------------
  // Click / drag handlers
  // ---------------------
  const onSquareClick = (square: Square) => {
    if (gameRef.current.isGameOver()) return;
    if (isSpectator) return;
    if (!isMyTurn()) {
      toast.error("It's not your turn!");
      return;
    }

    const piece = gameRef.current.get(square);

    if (piece && piece.color === gameRef.current.turn()) {
      setSelectedSquare(square);
      const moves = getPossibleMoves(square);
      setPossibleMoves(moves);
      highlightSquares(moves, square);
    } else if (selectedSquare) {
      if (possibleMoves.includes(square)) {
        // makeMove emits to socket
        makeMove(selectedSquare, square);
      } else {
        clearHighlights();
      }
    }
  };

  const makeMove = (from: Square, to: Square) => {
    // Single emit of the move
    socket.emit("move", {
      gameId: roomDetails.id,
      move: { from, to },
    });

    clearHighlights();
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (gameRef.current.isGameOver()) return false;
    if (isSpectator) return false;
    if (!isMyTurn()) {
      toast.error("It's not your turn!");
      return false;
    }

    const possible = getPossibleMoves(sourceSquare as Square);
    if (!possible.includes(targetSquare as Square)) {
      toast.error("Invalid move!");
      return false;
    }

    // call makeMove (this will emit once)
    makeMove(sourceSquare as Square, targetSquare as Square);

    return true;
  };

  const onPieceDragBegin = (piece: string, sourceSquare: Square) => {
    if (gameRef.current.isGameOver()) return false;
    if (!isMyTurn()) return false;

    const moves = getPossibleMoves(sourceSquare);
    highlightSquares(moves, sourceSquare);
    setSelectedSquare(sourceSquare);
    setPossibleMoves(moves);

    return true;
  };

  const onPieceDragEnd = () => {
    // keep highlights briefly then clear
    setTimeout(() => clearHighlights(), 450);
  };

  // ---------------------
  // Socket events
  // ---------------------
  useSocketEvent("receive-move", (res) => {
    try {
      // Apply new FEN and update UI
      if (res.fen) {
        gameRef.current.load(res.fen);
        setFen(res.fen);
      }

      if (res.move) addMove(res.move);
      if (res.move) updateCapturedPieces(res.move);

      updateGameStatus();

      if (res.status === "completed" && res.winnerId) {
        toast.success(`Game completed! Winner: ${res.winnerId}`);
      } else if (res.status === "draw") {
        toast.info("Game ended in a draw!");
      }
    } catch (err) {
      console.error("Error processing move:", err);
      toast.error("Error processing move");
    }
  });

  useSocketEvent("error", (res) => {
    toast.error(res.message || "An error occurred");
  });

  // ---------------------
  // Init on roomDetails change
  // ---------------------
  useEffect(() => {
    setFen(roomDetails?.fen || gameRef.current.fen());
    if (roomDetails?.fen) {
      gameRef.current.load(roomDetails.fen);
      setFen(roomDetails.fen);
    }
    updateGameStatus();
    clearHighlights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomDetails]);

  // ---------------------
  // Responsive board sizing using ResizeObserver
  // ---------------------
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let raf = 0;
    const readWidthAndSet = () => {
      // measure width and leave small margin (16px) so board never touches viewport edges
      const rect = el.getBoundingClientRect();
      const margin = 16;
      const available = Math.max(120, rect.width - margin); // minimum 120px
      setBoardWidth(Math.floor(available));
    };

    const observer = new ResizeObserver(() => {
      // throttle via rAF
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        readWidthAndSet();
        raf = 0;
      });
    });

    // initial read
    readWidthAndSet();
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className={cn("flex flex-col items-center gap-4 p-4 w-[100%]", className)}
    >
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

      {/* Responsive container: full width but capped to 500px */}
      <div ref={containerRef} className="w-full max-w-[500px]">
        <Chessboard
          position={fen}
          onPieceDrop={onDrop}
          onSquareClick={onSquareClick}
          onPieceDragBegin={onPieceDragBegin}
          onPieceDragEnd={onPieceDragEnd}
          boardWidth={boardWidth}
          animationDuration={200}
          boardOrientation={boardOrientation}
          customSquareStyles={squareStyles}
          arePiecesDraggable={isMyTurn()}
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
      </div>

      <p className="w-full text-lg text-center font-semibold">{status}</p>

      {/* Debug info - remove in production */}
      {selectedSquare && (
        <div className="text-xs text-gray-400">
          Selected: {selectedSquare} | Possible moves: {possibleMoves.join(", ")}
        </div>
      )}
    </div>
  );
}
