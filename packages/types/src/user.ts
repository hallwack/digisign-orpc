import z from "zod";

import { idSchema } from "./utils";

export const userSchema = z.object({
  id: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
});

export type UserSchema = z.infer<typeof userSchema>;
