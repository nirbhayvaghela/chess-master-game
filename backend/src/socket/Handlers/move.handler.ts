import { GameStatus } from "@prisma/client";
import { loadGame, saveGame } from "../../redis/ChessState";
import { db } from "../../lib/db";
import { SocketResponder } from "../../utils/SocketResponse";

export const moveHandler = (io: any, socket: any) => {
  const responder = new SocketResponder(socket);

  socket.on("move", async (data: any) => {
    const { gameId, move } = data;

    // Validate input
    if (!gameId || !move) {
      return responder.error("error", "Invalid move data");
    }

    // Load game state from Redis
    const game = await loadGame(gameId);
    const result = game.move(move);

    if (!result) {
      return responder.error("error", "Invalid move");
    }

    // Save to Redis (fast)
    await saveGame(gameId, game);

    let status: GameStatus = "in_progress";
    let winnerId: number | null = null;
    let loserId: number | null = null;

    // Check for endgame condition
    if (game.isCheckmate()) {
      status = "completed";
      const winnerColor = game.turn() === "w" ? "b" : "w"; // previous turn won

      const room = await db.gameRoom.findUnique({
        where: { id: Number(gameId) },
      });

      if (room) {
        winnerId = winnerColor === "w" ? room.player1Id : room.player2Id;
        loserId = winnerColor === "w" ? room.player2Id : room.player1Id;
      }
    } else if (
      game.isDraw() ||
      game.isStalemate() ||
      game.isInsufficientMaterial()
    ) {
      status = "draw";
    }

    const isFirstMove = game.history().length === 1;

    // Emit move to all clients in room
    io.to(gameId).emit("receive-move", {
      type: "success",
      move: result,
      fen: game.fen(),
      history: game.history({ verbose: true }),
      status,
      ...(winnerId ? { winnerId } : {}),
      ...(loserId ? { loserId } : {}),
    });

    //  Background DB updates
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
        responder.error("error", "Server failed to update game result.");
        // Or send to admin dashboard/logging system
      }
    });
  });
};
