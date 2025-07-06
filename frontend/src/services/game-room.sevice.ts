/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateGameRoomSchemaType } from "@/schemas/game-room.schema";
import { apiClient } from "@/utils/api/apiClient";
import { API } from "@/utils/constants/apiUrls";
import { errorHandler } from "@/utils/helpers/apiErrorHandler";
import { toast } from "sonner";

export const createGameRoom = async (body: CreateGameRoomSchemaType) => {
  let response;
  try {
    response = await apiClient.post(API.createGameRoom, body);
    if (response.status === 201) {
      toast.success(response.data.message);
    }
  } catch (error: any) {
    response = error.response;
    toast.error(
      error?.response?.data?.message ??
        "Something went wrong. Please try again.",
    );
    errorHandler(response.data.statusCode);
  }
  return response;
};