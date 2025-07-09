import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

interface AuthSocket extends Socket {
  auth: {
    token: string;
  };
}

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
  auth: {
    token: Cookies.get("accessToken") || "",
  },
  autoConnect: false,
});

export default socket as AuthSocket;
