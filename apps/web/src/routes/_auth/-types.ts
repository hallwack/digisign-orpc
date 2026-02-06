import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().min(3),
    email: z.email(),
    password: z.string().min(8),
    confirm_password: z.string().min(8),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  emailVerified: z.boolean(),
  email: z.email(), // Added email validation
  createdAt: z.date(),
  updatedAt: z.date(),
  image: z.string().optional().nullable(), // Optional and nullable
});

export type UserSchema = z.infer<typeof userSchema>;
