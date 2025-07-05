import { db } from "../../lib/db";
import { chatSchemaType } from "../../schemas/game-room.schema";
import { setMessageToRedis } from "../../redis/ChatHistory";

export const chatHandler = (io: any, socket: any) => {
  socket.on(
    "send-message",
    async ({ roomId, message, senderId }: chatSchemaType) => {
      try {
        if (!roomId || !message || !senderId) {
          return socket.emit("error", {
            message: "roomId, message and senderId are required.",
          });
        }

        const sockets = await io.in(`room:${roomId}`).fetchSockets();
        if (!sockets || sockets.length === 0) {
          return socket.emit("error", { message: "Room not found." });
        }

        const isUserInRoom = sockets.some(
          (s: any) => s.data.userId === senderId
        );
        if (!isUserInRoom) {
          return socket.emit("error", { message: "User not in Room." });
        }

        await setMessageToRedis(roomId, message);

        io.to(`room:${roomId}`).emit("receive-chat-message", {
          message,
          senderId,
          roomId,
          timestamp: new Date(),
        });

        db.message.create({
          data: {
            roomId: roomId,
            senderId: senderId,
            message: message,
          },
        });
      } catch (error) {
        console.error("Chat error:", error);
        socket.emit("error", {
          message: "An error occurred while sending the message.",
        });
      }
    }
  );
};
