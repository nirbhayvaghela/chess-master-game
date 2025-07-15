import { verifyToken } from "@/services/auth.service";
import { getGameRoomDetails } from "@/services/game-room.sevice";

export const API = {
    singUp: "/auth/signup",
    signin: "/auth/signIn",
    signout: "/auth/logout",
    verifyToken:"/auth/verify-token",
    refreshToken: "/auth/refresh-token",
    createGameRoom: "/game-room/create-room",
    getGameRoomDetails: (id:number) => `/game-room?roomId=${id}`
,
}