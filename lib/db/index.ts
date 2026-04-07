import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Defer connection creation to avoid build-time errors when DATABASE_URL
// is not set (e.g., during `next build` in CI without secrets).
function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local or your deployment environment."
    );
  }
  const sql = neon(url);
  return drizzle({ client: sql, schema });
}

type DbType = ReturnType<typeof createDb>;
let _db: DbType | null = null;

export const db = new Proxy({} as DbType, {
  get(_target, prop, receiver) {
    if (!_db) _db = createDb();
    return Reflect.get(_db, prop, receiver);
  },
});
