import { z } from "zod";

const gameRoomSchema = z.object({
    name: z.string().trim().min(2),
    code: z.string().trim().regex(/^[A-Za-z0-9]{6}$/),
});

export { gameRoomSchema };