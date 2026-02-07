import { drizzle } from "drizzle-orm/node-postgres";

import { env } from "@digisign/env/server";

import * as schema from "./tables";

export const db = drizzle(env.DATABASE_URL, { schema });
