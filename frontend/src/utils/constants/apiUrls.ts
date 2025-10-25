
export const API = {
    singUp: "/auth/signup",
    signin: "/auth/signIn",
    signout: "/auth/logout",
    verifyToken:"/auth/verify-token",
    refreshToken: "/auth/refresh-token",
    createGameRoom: "/game-room/create-room",
    getGameRoomDetails: (id:number) => `/game-room?roomId=${id}`,
    getDashboardStats: "/dashboard",
}