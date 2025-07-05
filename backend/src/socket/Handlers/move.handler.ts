import { loadGame, saveGame } from "../../redis/ChessState";
import { db } from "../../lib/db"; // optional DB usage
import { GameStatus } from "@prisma/client";

export const moveHandler = (io: any, socket: any) => {
  socket.on("move", async (data: any) => {
    const { gameId, move } = data;
    if (!gameId || !move) {
      socket.emit("error", { message: "Invalid move data" });
      return;
    }

    const game = await loadGame(gameId); // load from Redis
    const result = game.move(move); // apply move

    if (!result) {
      socket.emit("error", { message: "Invalid move" });
      return;
    }

    let status: GameStatus = "in_progress";
    let winnerId = null;
    let loserId = null;

    if (game.isCheckmate()) {
      status = "completed";
      const winnerColor = game.turn() === "w" ? "b" : "w";

      const room = await db.gameRoom.findUnique({
        where: { id: Number(gameId) },
      });
      winnerId = winnerColor === "w" ? room?.player1Id : room?.player2Id;
      loserId = winnerColor === "w" ? room?.player2Id : room?.player1Id;

      await db.gameRoom.update({
        where: { id: Number(gameId) },
        data: {
          history: JSON.stringify(game.history({ verbose: true })),
          status,
          winnerId,
          loserId,
        },
      });
    } else if (
      game.isDraw() ||
      game.isStalemate() ||
      game.isInsufficientMaterial()
    ) {
      {
        status = "draw";
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

      await saveGame(gameId, game);

      io.to(gameId).emit("receive-move", {
        move: result,
        fen: game.fen(),
        history: game.history({ verbose: true }),
        status,
        ...(winnerId ? { winnerId } : {}),
        ...(loserId ? { loserId } : {}),
      });
    }
  });
};
