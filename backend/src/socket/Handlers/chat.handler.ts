import { db } from "../../lib/db";
import { chatSchemaType } from "../../schemas/game-room.schema";
import { addMessageToRedis } from "../../redis/Chat";
import { SocketResponder } from "../../utils/SocketResponse";


export const chatHandler = (io: any, socket: any) => {
  const responder = new SocketResponder(socket);

  socket.on("send-message", async ({ roomId, message, senderId }: chatSchemaType) => {
    if (!roomId || !message || !senderId) {
      return responder.error("error", "roomId, message and senderId are required.");
    }

    const sockets = await io.in(`room:${roomId}`).fetchSockets();
    if (!sockets || sockets.length === 0) {
      return responder.error("error", "Room not found.");
    }

    const isUserInRoom = sockets.some(
      (s: any) => s.data.userId === senderId
    );
    if (!isUserInRoom) {
      return responder.error("error", "User not in room.");
    }

    // Store message in Redis
    await addMessageToRedis(roomId, message);

    const payload = {
      type: "success",
      message,
      senderId,
      roomId,
      timestamp: new Date(),
    };

    // Broadcast to everyone in room
    io.to(`room:${roomId}`).emit("receive-chat-message", payload);

    try {
      // Save to DB (non-blocking)
      setImmediate(async () =>
        await db.message.create({
          data: {
            roomId,
            senderId,
            message,
          },
        }))
    } catch (error) {
      console.error("Error saving message to DB:", error);
      responder.error("error", "Failed to save message to database.");
    }
  });
};
