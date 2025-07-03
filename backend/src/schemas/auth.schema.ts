import { z } from "zod";

const signUpSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

 const signInSchema = z.object({
  // email: z.string().email(),
  password: z.string().min(6),
});

export {signInSchema, signUpSchema};