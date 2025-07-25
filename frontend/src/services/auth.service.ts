/* eslint-disable @typescript-eslint/no-explicit-any */
import { SignInSchemaType, SignUpSchemaType } from "@/schemas/auth.schema";
import { apiClient } from "@/utils/api/apiClient";
import { API } from "@/utils/constants/apiUrls";
import { errorHandler } from "@/utils/helpers/apiErrorHandler";
import { toast } from "sonner";

export const signIn = async (body: SignInSchemaType) => {
  let response;
  try {
    response = await apiClient.post(API.signin, body);
    if (response.status === 200) {
      toast.success(response.data.message);
    }
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

export const signUp = async (body: SignUpSchemaType) => {
  let response;
  try {
    response = await apiClient.post(API.singUp, body);
    if (response.status === 200) {
      toast.success(response.data.message);
    }
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

export const logOut = async (body: any) => {
  let response;
  try {
    response = await apiClient.post(API.signout, body);
    if (response.status === 200) {
      toast.success(response.data.message);
    }
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

export const refreshAccessToken = async (body: { refreshToken: string }) => {
  let response;
  try {
    response = await apiClient.post(API.refreshToken, body);
    if (response.status === 200) {
      toast.success(response.data.message);
    }
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

export const verifyToken = async () => {
  let response;
  try {
    response = await apiClient.get(API.verifyToken);
    // if (response.status === 200) {
    //   toast.success(response.data.message);
    // }
  } catch (error: any) {
    response = error.response;
    toast.error(
      error?.response?.data?.message ??
        "Something went wrong. Please try again."
    );
    // errorHandler(response.data.statusCode);
  }
  return response;
}
