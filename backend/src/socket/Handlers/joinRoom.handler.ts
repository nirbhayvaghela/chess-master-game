import { db } from "../../lib/db";
import { SocketResponder } from "../../utils/SocketResponse";
import { JoinRoomSchemaType } from "../../schemas/game-room.schema";
import redisClient from "../../redis";
import { addRoomMemberToRedis } from "../../redis/RoomMembers";
import { GameRoom } from "@prisma/client";

export const joinRoomHandler = (io: any, socket: any) => {
  const responder = new SocketResponder(socket);

  socket.on("join-room", async ({ code, userId }: JoinRoomSchemaType) => {
    try {
      if (!code || !userId) {
        return responder.error("error", "Room code and userId are required.");
      }

      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) return responder.error("error", "User not found.");

      const room = await db.gameRoom.findUnique({
        where: { roomCode: code },
      });
      if (!room) {
        return responder.error("error", "Room not found.");
      }

      // const isUserInRoom = await isUserInRedisRoom(room.id, user.id);
      // if (isUserInRoom) {
      //   return responder.error("error", "Already in a room. Leave first.");
      // }

      let role: "player" | "spectator" = "spectator";
      let updatedRoom: GameRoom | null;

      // Case 1: Rejoining as creator
      if (room.player1Id === user.id || room.player2Id === user.id) {
        role = "player";
        updatedRoom = room;
      }
      // Case 2: Joining as player 2
      else if (!room.player2Id) {
        updatedRoom = await db.gameRoom.update({
          where: { id: room.id },
          data: {
            player2Id: user.id,
            status: "in_progress",
          },
        });

        role = "player";

        // // Notify player1 that player2 joined
        // SocketResponder.toRoom(io, room.id, "game-start", {
        //   roomStatus: updatedRoom.status,
        //   player2: user,
        // });
      }

      // Case 3: Joining as spectator
      else {
        await db.user.update({
          where: { id: user.id },
          data: {
            spectatingRoom: { connect: { id: room.id } },
            inRoom: true,
          },
        });

        updatedRoom = await db.gameRoom.findUnique({
          where: { id: room.id },
        });
      }

      // // Update user as inRoom
      // await db.user.update({
      //   where: { id: user.id },
      //   data: { inRoom: true },
      // });

      // Check for max socket connections
      const socketsInRoom = await io.in(`room:${room.id}`).fetchSockets();
      if (socketsInRoom.length >= 15) {
        return responder.error("room-full", "Room is full.");
      }

      // Join socket room
      socket.join(`room:${room.id}`);
      socket.data.userId = user.id;

      await addRoomMemberToRedis(room.id, user.id);

      // Confirm to this user
      responder.success("joined-room", {
        room: updatedRoom,
        username: user.username,
        role,
      });

      if (updatedRoom?.status === "in_progress") {
        // Notify all users in the room that the game has started
        SocketResponder.toRoom(io, room.id, "game-start", {
          roomStatus: updatedRoom.status,
          player2: user,
        });
      }

      SocketResponder.toRoom(io, room.id, "user-joined", {
        user,
        roomStatus: room.status,
        role,
      });
    } catch (err: any) {
      console.error("join-room error:", err.message);
      responder.error("error", err.message || "Failed to join room.");
    }
  });
};

// --------------->
// Game room flow:
// creator -> user-joiend --> redirect to waiting room
// player2 --> userjoined --> game-started --> redirect and start own coundown
//         ---> game-staa
