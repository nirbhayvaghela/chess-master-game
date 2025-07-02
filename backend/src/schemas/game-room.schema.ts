import { z } from "zod";

const gameRoomSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters long"),
    code: z.string().trim().regex(/^\d{6}$/, "Code must be exactly 6 digits"),
});


export { gameRoomSchema };