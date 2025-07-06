import { z } from "zod";

export const signUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      "New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
    ),
});
export type SignUpSchemaType = z.infer<typeof signUpSchema>;

export const SignInSchema = z.object({
  emailOrUsername: z
    .string()
    .min(3, "Email or Username must be at least 3 characters long"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      "Password must contain at least one lowercase, one uppercase, one number, and one special character"
    ),
});

export type SignInSchemaType = z.infer<typeof SignInSchema>;
