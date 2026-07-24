import "server-only";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

let cached: ReturnType<typeof drizzle> | null = null;

export function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  if (!isDbConfigured()) return null;
  if (!cached) {
    const sql = neon(process.env.DATABASE_URL as string);
    cached = drizzle(sql, { schema });
  }
  return cached;
}
