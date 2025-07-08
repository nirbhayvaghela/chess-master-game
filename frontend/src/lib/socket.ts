import { io } from "socket.io-client";
import Cookies from "js-cookie";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
  auth:{
    token: Cookies.get("accessToken") || "",
  },
  // autoConnect: false,
});

export default socket;
