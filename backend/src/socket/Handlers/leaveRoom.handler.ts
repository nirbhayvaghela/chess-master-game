import { db } from "../../lib/db";
import { deleteRoomMembersFromRedis } from "../../redis/RoomMembers";
import { LeftRoomHandlerType } from "../../schemas/game-room.schema";
import { SocketResponder } from "../../utils/SocketResponse";

export const LeaveRoomHandler = (io: any, socket: any) => {
  const responder = new SocketResponder(socket);

  socket.on("leave-room", async ({ roomId, userId }: LeftRoomHandlerType) => {
    try {
      if (!roomId || !userId)
        return responder.error("error", "Room ID and user ID required.");

      const user = await db.user.findUnique({ where: { id: userId } });
      const room = await db.gameRoom.findUnique({ where: { id: roomId } });

      if (!user || !room)
        return responder.error("error", "User or room not found.");

      const isSpectator = user.spectatingRoomId === roomId;
      const isPlayer1 = room.player1Id === userId;
      const isPlayer2 = room.player2Id === userId;
      const isPlayer = isPlayer1 || isPlayer2;

      await db.$transaction(async (tx) => {
        if (isSpectator) {
          await tx.user.update({
            where: { id: userId },
            data: { spectatingRoomId: null, inRoom: false },
          });

          return sendResult("spectator");
        }

        if (!isPlayer && room.status === "waiting")
          return responder.error("error", "You are not part of this room.");

        switch (room.status) {
          case "waiting":
            await tx.gameRoom.update({
              where: { id: room.id },
              data: { player1Id: null, player2Id: null, status: "waiting" },
            });

            await tx.user.update({
              where: { id: userId },
              data: { inRoom: false },
            });
            return sendResult("waiting");

          case "in_progress":
            await tx.gameRoom.update({
              where: { id: room.id },
              data: {
                player1Id: null,
                player2Id: null,
                status: "aborted",
                winnerId: null,
                loserId: null,
              },
            });
            await tx.user.updateMany({
              where: { id: { in: [room.player1Id!, room.player2Id!] } },
              data: { inRoom: false },
            });
            return sendResult("aborted");

          case "playing":
            const winnerId = isPlayer1 ? room.player2Id : room.player1Id;
            const loserId = userId;

            await tx.user.updateMany({
              where: { id: { in: [room.player1Id!, room.player2Id!] } },
              data: { inRoom: false },
            });

            await tx.gameRoom.update({
              where: { id: room.id },
              data: {
                player1Id: null,
                player2Id: null,
                winnerId,
                loserId,
                status: "completed",
              },
            });

            return sendResult("completed");

          case "completed":
            await tx.gameRoom.update({
              where: { id: room.id },
              data: {
                player1Id: null,
                player2Id: null,
                status: "closed",
                winnerId: null,
                loserId: null,
              },
            });

            await tx.user.updateMany({
              where: { id: { in: [room.player1Id!, room.player2Id!] } },
              data: { inRoom: false },
            });
            return sendResult("closed");

          default:
            await tx.user.update({
              where: { id: userId },
              data: { inRoom: false },
            });
            return sendResult();
        }
      });

      function sendResult(status?: string) {
        socket.leave(`room:${roomId}`);
        deleteRoomMembersFromRedis(roomId);

        responder.success("left-room", {
          roomStatus: status ?? room!.status,
          username: user!.username,
        });

        SocketResponder.toRoom(io, roomId, "user-left", {
          isPlayerLeft: isPlayer,
          isRoomCreatorLeft: isPlayer1,
          isPlayer2Left: isPlayer2,
          userId,
          username: user!.username,
          roomStatus: status,
        });
      }
    } catch (err: any) {
      console.error("leave-room error:", err.message);
      return responder.error("error", err.message || "Error leaving room");
    }
  });
};
