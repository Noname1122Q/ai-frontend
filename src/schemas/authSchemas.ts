import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Please enter a valid email!"),
  password: z.string().min(6, "Password must be atleast 6 characters!"),
});

export type SignupFormValues = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email!"),
  password: z.string().min(6, "Password must be atleast 6 characters!"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
