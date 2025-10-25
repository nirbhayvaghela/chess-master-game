
export const routes= {
    auth: {
        signIn: "/signin",
        signUp: "/signup",
        signOut: "/logout",
    },
    landingPage: "/",
    game: (id:number) => `/game/${id}`,
    waitingRoom: (id:number) => `/game/waiting/${id}`,
    dashboard:"/dashboard",
}