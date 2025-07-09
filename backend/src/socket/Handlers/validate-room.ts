// socket.on("validate-room-access", async ({ roomId }) => {
//   const userId = socket.user?.id;

import { isUserInRedisRoom } from "../../redis/RoomMembers";
import { SocketResponder } from "../../utils/SocketResponse";

export const validateRoomHandler = (io: any, socket: any) => {
  const responder = new SocketResponder(socket);

  socket.on("validate-room-access", async ({ roomId }: { roomId: number }) => {
    const userId = socket.user?.id;

    if (!userId) {
      responder.error("error", "User not authenticated.");
    }

    const isMember = await isUserInRedisRoom(roomId, userId);

    if (isMember) {
      responder.emit("room-access", {
        accessStatus: true,
        message: "You have access to this room.",
      });
    } else {
      responder.emit("room-access",{
        accessStatus: false,
        message: "You do not have access to this room.",
      });
    }
  });
};
