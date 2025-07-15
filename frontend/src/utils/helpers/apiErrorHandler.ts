// import { RefreshToken } from "./isAuthenticated";

import { toast } from "sonner";
import { refreshAccessToken } from "@/services/auth.service";
import { routes } from "../constants/routes";
import { LocalStorageRemoveItem } from "./storageHelper";

enum ErrorCode {
  TokenExpired = 410, // Expired token
  Unauthorized = 401, // Token is completely invalid, redirect to login
  // PasswordExpired = 410, // Custom error for password expiration
}

export const errorHandler = async (code: number) => {
  if (code === ErrorCode.TokenExpired || code === ErrorCode.Unauthorized) {
    // const refreshToken = Cookies.get("refreshToken");
    
    // const res = await refreshAccessToken({ refreshToken });

    if(code === ErrorCode.Unauthorized) {
      // Cookies.remove("accessToken");
      // Cookies.remove("refreshToken");
      LocalStorageRemoveItem("userData");
      toast.error("Token expired. Please login again.");
      window.location.href = routes.auth.signIn; 
    }
  }
};
