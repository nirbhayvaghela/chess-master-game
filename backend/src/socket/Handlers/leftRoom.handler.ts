import { db } from "../../lib/db";
import { LeftRoomHandlerType } from "../../schemas/game-room.schema";

export const LeftRoomHandler = (io: any, socket: any) => {
  socket.on("leave-room", async ({ roomId, userId }: LeftRoomHandlerType) => {
    try {
      if (!roomId || !userId) {
        return socket.emit("error", {
          message: "Room ID and user ID required.",
        });
      }

      const user = await db.user.findUnique({ where: { id: userId } });
      const room = await db.gameRoom.findUnique({ where: { id: roomId } });

      if (!user || !room) {
        return socket.emit("error", { message: "User or room not found." });
      }

      let updatedRoom;

      await db.$transaction(async (tx) => {
        if (room.player1Id === userId && !room.player2Id) {
          updatedRoom = await tx.gameRoom.update({
            where: { id: room.id },
            data: {
              player1Id: null,
              status: "aborted",
              winnerId: null,
              loserId: null,
            },
          });

          await tx.user.update({
            where: { id: userId },
            data: { inRoom: false },
          });

          socket.leave(`room:${roomId}`);
          socket.emit("left-room", {
            message: "Game aborted",
            room: updatedRoom,
          });
          socket
            .to(`room:${roomId}`)
            .emit("user-left", { userId, reason: "aborted" });
          return;
        }

        if (room.player2Id) {
          const winnerId = room.player1Id === userId ? room.player2Id : room.player1Id;
          const loserId = room.player1Id === userId ? room.player1Id : room.player2Id;

          await tx.user.updateMany({
            where: { id: { in: [room.player1Id!, room.player2Id] } },
            data: { inRoom: false },
          });

          updatedRoom = await tx.gameRoom.update({
            where: { id: room.id },
            data: {
              player1Id: null,
              player2Id: null,
              winnerId,
              loserId,
              status: "completed",
            },
          });

          await tx.user.updateMany({
            where: { spectatingRoomId: roomId },
            data: { spectatingRoomId: null },
          });

          socket.leave(`room:${roomId}`);
          socket.emit("left-room", {
            message: "Game completed",
            room: updatedRoom,
          });
          socket
            .to(`room:${roomId}`)
            .emit("user-left", { userId, reason: "completed" });
          return;
        }  

        if (user.spectatingRoomId === roomId) {
          await tx.user.update({
            where: { id: userId },
            data: {
              spectatingRoomId: null,
              inRoom: false,
            },
          });

          socket.leave(`room:${roomId}`);
          socket.emit("left-room", { message: "Left as spectator", room });
          socket
            .to(`room:${roomId}`)
            .emit("user-left", { userId, reason: "spectator" });
          return;
        }

        throw new Error("You are not part of this room.");
      });
    } catch (err:any) {
      console.error("leave-room error:", err.message);
      socket.emit("error", { message: err.message || "Error leaving room" });
    }
  });
};


// error
// left-room