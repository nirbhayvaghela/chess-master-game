import { Server, Socket } from "socket.io";
import { db } from "../../lib/db";
import { RemoveSpectatorSchemaType } from "../../schemas/game-room.schema";

export const removeSpectatorHandler = (io: Server, socket: Socket) => {
  socket.on(
    "remove-spectator",
    async ({ roomId, spectatorId, byUserId }: RemoveSpectatorSchemaType) => {
      try {
        if (!roomId || !spectatorId || !byUserId) {
          return socket.emit("error", { message: "roomId, spespectatorId and byUserId is required." });
        }

        const room = await db.gameRoom.findUnique({ where: { id: roomId } });
        if (!room) {
          return socket.emit("error", { message: "Room not found." });
        }

        if (room.player1Id !== byUserId && room.player2Id !== byUserId) {
          return socket.emit("error", {
            message: "Not authorized to remove spectators.",
          });
        }

        const spectator = await db.user.findUnique({
          where: { id: spectatorId },
        });
        if (!spectator || spectator.spectatingRoomId !== roomId) {
          return socket.emit("error", {
            message: "Spectator not in this room.",
          });
        }

        await db.user.update({
          where: { id: spectatorId },
          data: {
            spectatingRoomId: null,
            inRoom: false,
          },
        });

        const sockets = await io.in(`room:${roomId}`).fetchSockets();
        const targetSocket = sockets.find((s) => s.data.userId === spectatorId);

        if (targetSocket) {
          targetSocket.leave(`room:${roomId}`);
          targetSocket.emit("removed-from-room", {
            message: "You have been removed from the room.",
            roomId,
          });
        }

        socket.emit("spectator-removed", {
          spectatorId,
          message: "Spectator removed successfully.",
        });

        socket.to(`room:${roomId}`).emit("spectator-kicked", {
          spectatorId,
        });
      } catch (err: any) {
        console.error("remove-spectator error:", err.message);
        socket.emit("error", { message: "Error removing spectator." });
      }
    }
  );
};

// error
// removed-from-room
// spectator-removed
// spectator-kicked