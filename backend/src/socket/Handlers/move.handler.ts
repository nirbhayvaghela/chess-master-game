import { GameStatus } from "@prisma/client";
import { loadGame, saveGame } from "../../redis/ChessState";
import { db } from "../../lib/db";
import { SocketResponder } from "../../utils/SocketResponse";

export const moveHandler = (io: any, socket: any) => {
  const responder = new SocketResponder(socket);

  socket.on("move", async (data: any) => {
    try {
      const { gameId, move } = data;

      // Validate input
      if (!gameId || !move) {
        return responder.error("error", "Invalid move data");
      }

      // Get room details to validate player
      const room = await db.gameRoom.findUnique({
        where: { id: Number(gameId) },
      });

      if (!room) {
        return responder.error("error", "Game room not found");
      }

      // Check if user is a player in this room
      const userId = socket.userId; // Assuming you have user ID in socket
      const isPlayer1 = room.player1Id === userId;
      const isPlayer2 = room.player2Id === userId;

      if (!isPlayer1 && !isPlayer2) {
        return responder.error("error", "You are not a player in this game");
      }

      // Load game state from Redis
      let game;
      try {
        game = await loadGame(gameId);
      } catch (error) {
        console.error("Failed to load game:", error);
        return responder.error("error", "Failed to load game state");
      }

      // Check if it's the player's turn
      const currentTurn = game.turn(); // 'w' or 'b'
      const isPlayerTurn =
        (currentTurn === "w" && isPlayer1) ||
        (currentTurn === "b" && isPlayer2);
      console.log(isPlayer1, isPlayer2, userId);

      if (!isPlayerTurn) {
        return responder.error("error", "It's not your turn");
      }

      // Attempt the move with detailed error handling
      let result;
      try {
        // First validate the move format
        if (!move.from || !move.to) {
          return responder.error(
            "error",
            "Invalid move format: missing from/to squares"
          );
        }

        // Check if the move is valid by attempting it
        result = game.move(move);

        if (!result) {
          // Get more specific error by checking various conditions
          const piece = game.get(move.from);

          if (!piece) {
            return responder.error(
              "error",
              `No piece found on square ${move.from}`
            );
          }

          if (piece.color !== currentTurn) {
            return responder.error(
              "error",
              `Cannot move opponent's piece from ${move.from}`
            );
          }

          // Check if the destination square is valid
          const moveStr = `${move.from}${move.to}`;
          const possibleMoves = game.moves({
            square: move.from,
            verbose: true,
          });

          if (possibleMoves.length === 0) {
            return responder.error(
              "error",
              `No legal moves available for piece on ${move.from}`
            );
          }

          const isValidDestination = possibleMoves.some(
            (m) => m.to === move.to
          );
          if (!isValidDestination) {
            return responder.error(
              "error",
              `Invalid move: ${move.from} to ${move.to}. Piece cannot move to that square`
            );
          }

          // If we get here, it's some other invalid move reason
          return responder.error(
            "error",
            `Invalid move: ${move.from} to ${move.to}`
          );
        }
      } catch (moveError: any) {
        console.error("Move execution error:", moveError);

        // Handle specific chess.js errors
        if (moveError.message) {
          return responder.error("error", `Invalid move: ${moveError.message}`);
        }

        return responder.error(
          "error",
          `Invalid move: ${move.from} to ${move.to}`
        );
      }

      // Save to Redis (fast)
      try {
        await saveGame(gameId, game);
      } catch (error) {
        console.error("Failed to save game:", error);
        // Don't return error here, the move was successful
      }

      let status: GameStatus = "in_progress";
      let winnerId: number | null = null;
      let loserId: number | null = null;

      // Check for endgame condition
      if (game.isCheckmate()) {
        status = "completed";
        const winnerColor = game.turn() === "w" ? "b" : "w"; // previous turn won
        winnerId = winnerColor === "w" ? room.player1Id : room.player2Id;
        loserId = winnerColor === "w" ? room.player2Id : room.player1Id;
      } else if (
        game.isDraw() ||
        game.isStalemate() ||
        game.isInsufficientMaterial()
      ) {
        status = "draw";
      }

      const isFirstMove = game.history().length === 1;

      // Emit move to all clients in room
      SocketResponder.toRoom(io, gameId, "receive-move", {
        type: "success",
        move: result,
        fen: game.fen(),
        history: game.history({ verbose: true }),
        status,
        gameStatus: status, // Add this for frontend clarity
        ...(winnerId ? { winnerId } : {}),
        ...(loserId ? { loserId } : {}),
      });

      // Background DB updates
      setImmediate(async () => {
        try {
          if (isFirstMove) {
            await db.gameRoom.update({
              where: { id: Number(gameId) },
              data: { status: "playing" },
            });
          }

          if (status === "completed" || status === "draw") {
            await db.gameRoom.update({
              where: { id: Number(gameId) },
              data: {
                history: JSON.stringify(game.history({ verbose: true })),
                status,
                winnerId,
                loserId,
              },
            });
          }
        } catch (error) {
          console.error("Background DB operation failed:", error);
        }
      });
    } catch (error) {
      console.error("Move handler error:", error);
      // Only generic errors that aren't move-related should reach here
      responder.error("error", "Server error occurred while processing move");
    }
  });
};
