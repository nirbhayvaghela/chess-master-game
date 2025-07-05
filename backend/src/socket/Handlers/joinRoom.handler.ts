import { db } from "../../lib/db";
import { JoinRoomSchemaType } from "../../schemas/game-room.schema";

export const joinRoomHandler = (io: any, socket: any) => {
  socket.on("join-room", async ({ code, userId, roomId }: JoinRoomSchemaType) => {
      try {
        if (!code || !userId || !roomId) {
          return socket.emit("error", {
            message: "Room code and userId are required.",
          });
        }

        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) return socket.emit("error", { message: "User not found." });
        if (user.inRoom) {
          return socket.emit("error", {
            message: "Already in a room. Leave first.",
          });
        }

        const room = await db.gameRoom.findUnique({
          where: { roomCode: code },
        });
        if (!room) {
          return socket.emit("error", { message: "Room not found." });
        }

        let updatedRoom;
        if (!room.player2Id) {
          updatedRoom = await db.gameRoom.update({
            where: { id: room.id },
            data: {
              player2Id: user.id,
              status: "in_progress",
            },
          });
        } else {
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

        await db.user.update({
          where: { id: user.id },
          data: { inRoom: true },
        });

        const socketsInRoom = await io.in(roomId).fetchSockets();
        if (socketsInRoom.length >= 15) {
          socket.emit("room-full", "Room is full");
          return;
        }
        socket.join(`room:${room.id}`);
        socket.data.userId = user.id; 

        // Notify others
        socket.to(`room:${room.id}`).emit("user-joined", {
          userId: user.id,
          role: !room.player2Id ? "player" : "spectator",
        });

        // Send confirmation to this user
        socket.emit("joined-room", {
          room: updatedRoom,
          role: !room.player2Id ? "player" : "spectator",
        });
      } catch (err) {
        socket.emit("error", { message: "Failed to join room." });
      }
    }
  );
};

// error
// room-full
// joied-room
// user-joined