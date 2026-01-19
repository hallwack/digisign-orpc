import { sql, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

export function toBoolean(value: string) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return false;
}

export function lowerSql(value: AnyPgColumn): SQL {
  return sql`lower(${value})`;
}
