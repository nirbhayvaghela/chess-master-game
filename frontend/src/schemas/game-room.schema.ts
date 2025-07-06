import z from "zod";

export const createGamRoomSchema = z.object({
  name: z.string(),
  code: z.string().regex(/^\d{6}$/, "Code must be exactly 6 digits"),
});
export type CreateGameRoomSchemaType = z.infer<typeof createGamRoomSchema>;