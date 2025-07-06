import { CreateGameRoomSchemaType } from "@/schemas/game-room.schema";
import { createGameRoom } from "@/services/game-room.sevice";
import { useMutation } from "@tanstack/react-query";

export const useCreateGameRoom = () => {
  const response = useMutation({
    mutationKey: ["useCreateGameRoom"],
    mutationFn: async (body: CreateGameRoomSchemaType) => {
      const res = await createGameRoom(body);
      return res;
    },
  });
  return response;
};

