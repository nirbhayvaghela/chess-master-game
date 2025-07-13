import { Server, Socket } from "socket.io";
import { db } from "../../lib/db";
import { RemoveSpectatorSchemaType } from "../../schemas/game-room.schema";
import { SocketResponder } from "../../utils/SocketResponse";
import { leaveMemberFromRedis } from "../../redis/RoomMembers";
import { AuthenticatedSocket } from "..";

export const removeSpectatorHandler = (
  io: Server,
  socket: AuthenticatedSocket
) => {
  const responder = new SocketResponder(socket);

  socket.on(
    "remove-spectator",
    async ({ roomId, spectatorId, byUserId }: RemoveSpectatorSchemaType) => {
      try {
        if (!roomId || !spectatorId || !byUserId) {
          return responder.error(
            "error",
            "roomId, spectatorId, and byUserId are required."
          );
        }

        const room = await db.gameRoom.findUnique({ where: { id: roomId } });
        if (!room) {
          return responder.error("error", "Room not found.");
        }

        const isAuthorized =
          room.player1Id === byUserId || room.player2Id === byUserId;
        if (!isAuthorized) {
          return responder.error(
            "error",
            "Not authorized to remove spectators."
          );
        }

        const spectator = await db.user.findUnique({
          where: { id: spectatorId },
        });

        if (!spectator || spectator.spectatingRoomId !== roomId) {
          return responder.error("error", "Spectator not in this room.");
        }

        // Update spectator in DB
        await db.user.update({
          where: { id: spectatorId },
          data: {
            spectatingRoomId: null,
            inRoom: false,
          },
        });

        // Remove socket from room
        const sockets = await io.in(`room:${roomId}`).fetchSockets();
        const targetSocket = sockets.find((s) => s.data.userId === spectatorId);

        if (targetSocket) {
          const targetResponder = new SocketResponder(targetSocket);
          targetResponder.success("removed-from-room", {
            roomId,
            message: `You have been removed from the room by ${socket.user.username}`,
          });
          targetSocket.leave(`room:${roomId}`);
          await leaveMemberFromRedis(roomId, spectatorId);
        }

        // Notify the remover
        responder.success("spectator-removed", {
          spectatorId,
          message: "Spectator removed successfully.",
        });

        // Notify others in the room
        SocketResponder.toRoom(io, roomId, "spectator-kicked", {
          message: `${spectator.username} is kicked off by ${socket.user.username}.`,
          spectatorId,
        });
      } catch (err: any) {
        console.error("remove-spectator error:", err.message);
        responder.error("error", "Error removing spectator.");
      }
    }
  );
};
