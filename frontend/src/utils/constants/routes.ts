import { refreshToken } from "@/services/auth.service";

export const routes= {
    auth: {
        signIn: "/signin",
        signUp: "/signup",
        signOut: "/logout",
    },
    landingPage: "/",
    dashboard:"/dashboard",
}