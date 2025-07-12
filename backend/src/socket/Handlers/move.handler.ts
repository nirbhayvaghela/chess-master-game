import { GameStatus } from "@prisma/client";
import { getGameDetails, loadGame, saveGame } from "../../redis/ChessState";
import { db } from "../../lib/db";
import { SocketResponder } from "../../utils/SocketResponse";

export const moveHandler = (io: any, socket: any) => {
  const responder = new SocketResponder(socket);

  socket.on("move", async (data: any) => {
    try {
      const { gameId, move } = data;
      
      if (!gameId || !move?.from || !move?.to) {
        return responder.error("error", "Invalid move data");
      }

      // Load game first (fastest operation)
      const game = await loadGame(gameId);

      let moveResult;
      try {
        moveResult = game.move(move);
      } catch (error) {
        responder.error("error", "Invalid move");
        return;
      }

      // Send response IMMEDIATELY
      SocketResponder.toRoom(io, gameId, "receive-move", {
        type: "success",
        move: moveResult,
        fen: game.fen(),
        // history: history,
        status: game.isGameOver() ? "completed" : "in_progress",
        gameStatus: game.isGameOver() ? "completed" : "in_progress",
      });

      // Everything else happens in background
      setImmediate(async () => {
        try {
          // Validate user permissions (background)
          const room = await db.gameRoom.findUnique({
            where: { id: Number(gameId) },
            select: { player1Id: true, player2Id: true, status: true },
          });

          if (!room) return;

          const { history } = await getGameDetails(gameId);

          const userId = socket.userId;
          const isPlayer1 = room.player1Id === userId;
          const isPlayer2 = room.player2Id === userId;

          if (!isPlayer1 && !isPlayer2) {
            // User is not authorized, but move already sent
            console.warn(
              `Unauthorized move by user ${userId} in game ${gameId}`
            );
            return;
          }

          if (room.status === "waiting") {
            await db.gameRoom.update({
              where: { id: Number(gameId) },
              data: { status: "playing" },
            });
          }

          // Save to Redis and update database
          await Promise.all([
            saveGame(gameId, game, moveResult),
            db.gameRoom.update({
              where: { id: Number(gameId) },
              data: {
                history: JSON.stringify(history),
              },
            }),
            // Add any necessary DB updates here
          ]);
        } catch (error) {
          console.error("Background validation/save failed:", error);
        }
      });
    } catch (error) {
      responder.error("error", "Server error");
    }
  });
};
