import z from "zod";

import { idSchema } from "./utils";

export const userSchema = z.object({
  id: idSchema,
  name: z.string(),
  emailVerified: z.boolean(),
  email: z.email(),
  createdAt: z.date(),
  updatedAt: z.date(),
  image: z.string().optional().nullable(),
});

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

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type UserSchema = z.infer<typeof userSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
