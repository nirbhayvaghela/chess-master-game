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
  const [gameOverReason, setGameOverReason] = useState<string | undefined>();
  const [boardWidth, setBoardWidth] = useState<number>(360);
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

  // Promotion states
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [promotionToSquare, setPromotionToSquare] = useState<Square | null>(
    null
  );

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
  // Helper to check if move is a promotion
  // ---------------------
  const isPromotion = (from: Square, to: Square): boolean => {
    const piece = gameRef.current.get(from);
    if (!piece || piece.type !== "p") return false;

    const toRank = to[1];
    return (
      (piece.color === "w" && toRank === "8") ||
      (piece.color === "b" && toRank === "1")
    );
  };

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
        // Check if this is a promotion move
        if (isPromotion(selectedSquare, square)) {
          setPendingPromotion({ from: selectedSquare, to: square });
          setPromotionToSquare(square);
          setShowPromotionDialog(true);
        } else {
          makeMove(selectedSquare, square);
        }
      } else {
        clearHighlights();
      }
    }
  };

  const makeMove = (from: Square, to: Square, promotion?: string) => {
    const moveData: any = {
      gameId: roomDetails.id,
      move: { from, to },
    };

    if (promotion) {
      moveData.move.promotion = promotion;
    }
    console.log(moveData, "moveData");
    socket.emit("move", moveData);
    clearHighlights();
  };

  // Adapted to match react-chessboard's expected signature:
  // (piece?: PromotionPieceOption, promoteFromSquare?: Square, promoteToSquare?: Square) => boolean
  const handlePromotion = (
    piece?: any,
    promoteFromSquare?: Square,
    promoteToSquare?: Square
  ): boolean => {
    const from = promoteFromSquare ?? pendingPromotion?.from;
    const to = promoteToSquare ?? pendingPromotion?.to;

    if (!from || !to) return false;

    // piece can come in different shapes depending on the chessboard implementation.
    // Normalize to a single lowercase letter representing the piece (q, r, b, n).
    let promotionPiece = "q";
    if (piece) {
      if (typeof piece === "string") {
        promotionPiece = piece.slice(-1).toLowerCase();
      } else if (typeof piece === "object") {
        // try common fields
        promotionPiece = (piece.key || piece.id || String(Object.values(piece)[0] || "q")).toString().slice(-1).toLowerCase();
      }
    }

    makeMove(from, to, promotionPiece);

    // Clear promotion state
    setPendingPromotion(null);
    setShowPromotionDialog(false);
    setPromotionToSquare(null);

    return true;
  };

  // This callback is used by react-chessboard to determine if promotion dialog should show
  const onPromotionCheck = (
    sourceSquare: Square,
    targetSquare: Square,
    piece: string
  ) => {
    return isPromotion(sourceSquare, targetSquare);
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (gameRef.current.isGameOver()) return false;
    if (isSpectator) return false;
    if (!isMyTurn()) {
      toast.error("It's not your turn!");
      return false;
    }

    const source = sourceSquare as Square;
    const target = targetSquare as Square;

    const possible = getPossibleMoves(source);
    if (!possible.includes(target)) {
      toast.error("Invalid move!");
      return false;
    }

    // Check if this is a promotion move
    if (isPromotion(source, target)) {
      setPendingPromotion({ from: source, to: target });
      setPromotionToSquare(target);
      setShowPromotionDialog(true);
      return true; // Allow the drag, promotion dialog will handle the rest
    }

    // Regular move
    makeMove(source, target);
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

  // useSocketEvent("game-over", (res) => {
  //   if (res.status === "completed") {
  //     setGameOverReason("Checkmate! " + res.winner + " wins.");
  //   } else if (res.status === "draw") {
  //     setGameOverReason("Game ended in a draw, becuae of " + res.gameOverReason + ".");
  //   }
  // });

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
      const rect = el.getBoundingClientRect();
      const margin = 16;
      const available = Math.max(120, rect.width - margin);
      setBoardWidth(Math.floor(available));
    };

    const observer = new ResizeObserver(() => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        readWidthAndSet();
        raf = 0;
      });
    });

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

      {/* Responsive container */}
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
          // Promotion props
          showPromotionDialog={showPromotionDialog}
          promotionToSquare={promotionToSquare}
          onPromotionCheck={onPromotionCheck}
          onPromotionPieceSelect={handlePromotion}
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

      <p className="w-full text-lg text-center font-semibold">
        {status}
      </p>

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
