import { db } from "../../lib/db";
import {
  deleteRoomMembersFromRedis,
  leaveMemberFromRedis,
} from "../../redis/RoomMembers";
import { LeftRoomHandlerType } from "../../schemas/game-room.schema";
import { SocketResponder } from "../../utils/SocketResponse";

export const LeaveRoomHandler = (io: any, socket: any) => {
  const responder = new SocketResponder(socket);

  socket.on("leave-room", async ({ roomId, userId }: LeftRoomHandlerType) => {
    try {
      if (!roomId || !userId) {
        return responder.error("error", "Room ID and user ID required.");
      }

      const user = await db.user.findUnique({ where: { id: userId } });
      const room = await db.gameRoom.findUnique({ where: { id: roomId } });

      if (!user || !room) {
        return responder.error("error", "User or room not found.");
      }

      await db.$transaction(async (tx) => {
        // Case 1: Game was waiting or in progress
        if (room.status === "waiting" || room.status === "in_progress") {
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

          await tx.user.update({
            where: { id: userId },
            data: { inRoom: false },
          });

          socket.leave(`room:${roomId}`);
          await deleteRoomMembersFromRedis(roomId);
          responder.success("left-room", {
            roomStatus: "aborted",
            username: user.username,
          });

          SocketResponder.toRoom(io, roomId, "user-left", {
            userId,
            username: user.username,
            roomStatus: "aborted",
          });

          return;
        }

        // Case 2: Game was playing
        if (room.status === "playing") {
          const winnerId =
            room.player1Id === userId ? room.player2Id : room.player1Id;
          const loserId =
            room.player1Id === userId ? room.player1Id : room.player2Id;

          await tx.user.updateMany({
            where: { id: { in: [room.player1Id!, room.player2Id!] } },
            data: { inRoom: false },
          });

          const updatedRoom = await tx.gameRoom.update({
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

          await deleteRoomMembersFromRedis(roomId);

          responder.success("left-room", {
            roomStatus: updatedRoom.status,
            username: user.username,
          });

          SocketResponder.toRoom(io, roomId, "user-left", {
            userId,
            username: user.username,
            roomStatus: "aborted",
          });

          return;
        }

        // Case 3: User is spectator
        if (user.spectatingRoomId === roomId) {
          await tx.user.update({
            where: { id: userId },
            data: {
              spectatingRoomId: null,
              inRoom: false,
            },
          });

          socket.leave(`room:${roomId}`);
          await leaveMemberFromRedis(roomId, userId);
          responder.success("left-room", {
            roomStatus: room.status,
            message: "you are left the room",
          });

          SocketResponder.toRoom(io, roomId, "user-left", {
            userId,
            roomStatus: "spectator",
            message: `${user.username} is left from Game room.`,
          });

          return;
        }

        throw new Error("You are not part of this room.");
      });
    } catch (err: any) {
      console.error("leave-room error:", err.message);
      responder.error("error", err.message || "Error leaving room");
    }
  });
};

// error
// left-room
