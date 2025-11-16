import { db } from "../../lib/db";
import { SocketResponder } from "../../utils/SocketResponse";
import { JoinRoomSchemaType } from "../../schemas/game-room.schema";
import { addRoomMemberToRedis } from "../../redis/RoomMembers";
import { GameRoom } from "@prisma/client";

export const joinRoomHandler = (io: any, socket: any) => {
  const responder = new SocketResponder(socket);

  socket.on("join-room", async ({ code, userId }: JoinRoomSchemaType) => {
    try {
      if (!code || !userId) {
        return responder.error("error", "Room code and userId are required.");
      }

      // --- Validate user ---
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) return responder.error("error", "User not found.");

      // --- Find active room ---
      const room = await db.gameRoom.findUnique({
        where: {
          roomCode: code,
          status: { notIn: ["completed", "aborted"] },
        },
      });
      if (!room) return responder.error("error", "Room not found.");
      const socketsInRoom = await io.in(`room:${room.id}`).fetchSockets();
      if (socketsInRoom.length >= 15) {
        return responder.error("room-full", "Room is full.");
      }

      // --- Determine join role ---
      let role: "player" | "spectator" = "spectator";
      let updatedRoom = room;

      if (room.player1Id === user.id || room.player2Id === user.id) {
        // Rejoining existing player
        role = "player";
      } else if (!room.player1Id) {
        // Joining as player 2
        updatedRoom = await db.gameRoom.update({
          where: { id: room.id },
          data: {
            player1Id: user.id,
            status: "waiting",
          },
        });
        role = "player";
      } else if (!room.player2Id) {
        // Joining as player 2
        updatedRoom = await db.gameRoom.update({
          where: { id: room.id },
          data: { 
            player2Id: user.id,
            status: "in_progress",
          },
        });
        role = "player";  
      } else {
        // Joining as spectator
        await db.user.update({
          where: { id: user.id },
          data: {
            spectatingRoom: { connect: { id: room.id } },
            inRoom: true,
          },
        });
        updatedRoom = (await db.gameRoom.findUnique({
          where: { id: room.id },
        })) as GameRoom;
      }

      // --- Join the socket room ---
      socket.join(`room:${room.id}`);
      socket.data.userId = user.id;

      await addRoomMemberToRedis(room.id, user.id);

      // --- Notify this user ---
      responder.success("joined-room", {
        room: updatedRoom,
        username: user.username,
        role,
      });

      // --- Broadcast join to other users ---
      const joinEvent =
        role === "spectator" ? "spectator-joined" : "user-joined";
      SocketResponder.toRoom(io, room.id, joinEvent, {
        user,
        roomStatus: updatedRoom.status,
        role,
      });

      // --- Game start events ---
      if (
        updatedRoom.status === "in_progress" &&
        updatedRoom.player2Id === user.id
      ) {
        SocketResponder.toRoom(io, updatedRoom.id, "game-start", {
          roomStatus: updatedRoom.status,
          player2: user,
        });
      }
    } catch (err: any) {
      console.error("join-room error:", err);
    }
  });
};

// --------------->
// Game room flow:
// creator -> user-joiend --> redirect to waiting room
// player2 --> userjoined --> game-started --> redirect and start own coundown
//         ---> game-staa
