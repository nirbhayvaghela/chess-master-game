/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "@/utils/api/apiClient";
import { API } from "@/utils/constants/apiUrls";
import { errorHandler } from "@/utils/helpers/apiErrorHandler";
import { toast } from "sonner";

export const getDashboardStats = async () => {
  let response;
  try {
    response = await apiClient.get(API.getDashboardStats);
  } catch (error: any) {
    response = error.response;
    toast.error(
      error?.response?.data?.message ??
        "Something went wrong. Please try again."
    );
    errorHandler(response.data.statusCode);
  }
  return response;
};
