import { z } from "zod";

const gameRoomSchema = z.object({
  name: z.string(),
  code: z.string(),
});

const joinRoomSchema = z.object({
  code: z.string(),
});

export { gameRoomSchema, joinRoomSchema };
