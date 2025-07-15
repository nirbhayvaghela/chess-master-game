import { LocalStorageGetItem } from "@/utils/helpers/storageHelper";
import { io, Socket } from "socket.io-client";

interface AuthSocket extends Socket {
  auth: {
    token: string;
  };
}

const token = LocalStorageGetItem("userData")?.accessToken;

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
  auth: {
    token: token || "",
  },
  autoConnect: false,
});

export default socket as AuthSocket;
