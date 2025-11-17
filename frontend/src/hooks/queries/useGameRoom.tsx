import { CreateGameRoomSchemaType } from "@/schemas/game-room.schema";
import {
  createGameRoom,
  getGameRoomDetails,
} from "@/services/game-room.sevice";
import { useMutation, useQuery } from "@tanstack/react-query";

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

export const useGetGameRoomDetails = (id: number) => {
  const response = useQuery({
    queryKey: ["useGetGameRoomDetails", id],
    queryFn: async () => {
      const res = await getGameRoomDetails(id);
      return res.data.data.room;
    },
    enabled: !!id, // Only run this query if id is defined
  });
  return response;
};
