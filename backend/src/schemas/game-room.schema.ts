import { z } from "zod";

const gameRoomSchema = z.object({
  name: z.string(),
  code: z.string(),
});

const joinRoomSchema = z.object({
  code: z.string(),
  userId: z.number(),
  roomId: z.number(),
});
export type JoinRoomSchemaType = z.infer<typeof joinRoomSchema>;

const LeftRoomHandler = z.object({
  roomId: z.number(),
  userId: z.number(),
});
export type LeftRoomHandlerType = z.infer<typeof LeftRoomHandler>;

const removeSpectatorSchema = z.object({
  roomId: z.number(),
  spectatorId: z.number(),
  byUserId: z.number(),
});
export type RemoveSpectatorSchemaType = z.infer<typeof removeSpectatorSchema>;

const chatSchema = z.object({
  roomId: z.number(),
  senderId: z.number(),
  message: z.string(),
  username: z.string(),
});
export type chatSchemaType = z.infer<typeof chatSchema>;


export { gameRoomSchema, joinRoomSchema, removeSpectatorSchema };
