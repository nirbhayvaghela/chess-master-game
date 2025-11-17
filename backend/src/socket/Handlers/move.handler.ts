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

      // Determine game status and winner
      let gameStatus: GameStatus = "playing";
      let winnerId: number | null = null;
      let gameOverReason: string | null = null;

      if (game.isGameOver()) {
        if (game.isCheckmate()) {
          gameStatus = "completed";
          // When checkmate occurs, the current turn is the LOSER
          // So if turn is 'w', black won. If turn is 'b', white won.
          const loserColor = game.turn(); // 'w' or 'b'
          gameOverReason = "checkmate";
          
          // We'll determine winnerId in the background after loading room data
        } else if (game.isStalemate()) {
          gameStatus = "draw";
          gameOverReason = "stalemate";
        } else if (game.isThreefoldRepetition()) {
          gameStatus = "draw";
          gameOverReason = "threefold_repetition";
        } else if (game.isInsufficientMaterial()) {
          gameStatus = "draw";
          gameOverReason = "insufficient_material";
        } else if (game.isDraw()) {
          gameStatus = "draw";
          gameOverReason = "draw";
        }
      }

      // Send response IMMEDIATELY with game status
      SocketResponder.toRoom(io, gameId, "receive-move", {
        type: "success",
        move: moveResult,
        fen: game.fen(),
        status: gameStatus,
        gameStatus: gameStatus,
        gameOverReason: gameOverReason,
        // winnerId will be sent in a follow-up event if needed
      });

      // Everything else happens in background
      setImmediate(async () => {
        try {
          // Validate user permissions and get room data
          const room = await db.gameRoom.findUnique({
            where: { id: Number(gameId) },
            select: { 
              player1Id: true, 
              player2Id: true, 
              status: true 
            },
          });

          if (!room) return;

          const { history } = await getGameDetails(gameId);

          const userId = socket.userId;
          const isPlayer1 = room.player1Id === userId;
          const isPlayer2 = room.player2Id === userId;

          if (!isPlayer1 && !isPlayer2) {
            console.warn(
              `Unauthorized move by user ${userId} in game ${gameId}`
            );
            return;
          }

          // Determine winner if game is over by checkmate
          if (gameStatus === "completed" && game.isCheckmate()) {
            // Current turn after move is the loser
            const loserColor = game.turn(); // 'w' or 'b'
            
            // White is player1, Black is player2
            if (loserColor === "w") {
              // White lost, so Black (player2) won
              winnerId = room.player2Id;
            } else {
              // Black lost, so White (player1) won
              winnerId = room.player1Id;
            }

            // Send winner notification
            SocketResponder.toRoom(io, gameId, "game-over", {
              status: gameStatus,
              winner:  winnerId === room.player1Id ? "White" : "Black",
              winnerId: winnerId,
              reason: gameOverReason,
            });
          } else if (gameStatus === "draw") {
            // Send draw notification
            SocketResponder.toRoom(io, gameId, "game-over", {
              status: gameStatus,
              winnerId: null,
              reason: gameOverReason,
            });
          }

          // Update room status if needed
          if (room.status === "waiting") {
            await db.gameRoom.update({
              where: { id: Number(gameId) },
              data: { status: "playing" },
            });
          }

          // Prepare update data
          const updateData: any = {
            history: JSON.stringify(history),
            fen: game.fen(),
          };

          // Update status and winner if game is over
          if (gameStatus === "completed" || gameStatus === "draw") {
            updateData.status = gameStatus;
            updateData.winnerId = winnerId;
            updateData.gameOverReason = gameOverReason;
          }

          // Save to Redis and update database
          await Promise.all([
            saveGame(gameId, game, moveResult),
            db.gameRoom.update({
              where: { id: Number(gameId) },
              data: {
                history: updateData.history,
                status: updateData.status,
                winnerId: updateData.winnerId,  
                loserId: winnerId
                  ? winnerId === room.player1Id
                    ? room.player2Id : room.player1Id : null,
              },
            }),
          ]);
        } catch (error) {
          console.error("Background validation/save failed:", error);
        }
      });
    } catch (error) {
      console.error("Move handler error:", error);
      responder.error("error", "Server error");
    }
  });
};