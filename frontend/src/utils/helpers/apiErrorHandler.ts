// import { RefreshToken } from "./isAuthenticated";

import { toast } from "sonner";
import Cookies from "js-cookie";
import { refreshAccessToken } from "@/services/auth.service";

enum ErrorCode {
  TokenExpired = 410, // Expired token
  Unauthorized = 401, // Token is completely invalid, redirect to login
  // PasswordExpired = 410, // Custom error for password expiration
}

export const errorHandler = async (code: number) => {
  if (code === ErrorCode.TokenExpired || code === ErrorCode.Unauthorized) {
    const refreshToken = Cookies.get("refreshToken");
    await refreshAccessToken({ refreshToken });
    toast.error("Token expired. Please login again.");
  }
};
