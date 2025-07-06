// import { RefreshToken } from "./isAuthenticated";

import { toast } from "sonner";
import { routes } from "../constants/routes";
import { API } from "../constants/apiUrls";

enum ErrorCode {
  TokenExpired = 410, // Expired token
  Unauthorized = 401, // Token is completely invalid, redirect to login
  // PasswordExpired = 410, // Custom error for password expiration
}

export const errorHandler = async (code: number) => {
  if (code === ErrorCode.TokenExpired || code === ErrorCode.Unauthorized) {
    // window.location.href = `${import.meta.env.VITE_WEB_URL}/login`;
    const res = fetch(`${API.refreshToken}`, {
      method: "POST",
    });
    console.log((res));
    // window.location.href = `${routes.auth.signIn}`;
    toast.error("Token expired. Please login again.");
    // localStorage.clear();
    // await logout();.
  }
 
};


