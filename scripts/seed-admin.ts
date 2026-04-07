/**
 * Seed script: Create the initial admin user.
 *
 * Usage:
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... DATABASE_URL=... npx tsx scripts/seed-admin.ts
 *
 * Or with .env.local loaded:
 *   npx tsx --env-file=.env.local scripts/seed-admin.ts
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import * as schema from "../lib/db/schema";

const { users, accounts } = schema;

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const dbUrl = process.env.DATABASE_URL;

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD env vars are required");
    process.exit(1);
  }

  if (!dbUrl) {
    console.error("DATABASE_URL env var is required");
    process.exit(1);
  }

  const sql = neon(dbUrl);
  const db = drizzle({ client: sql, schema });

  const normalizedEmail = email.toLowerCase();

  // Check if user exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing.length > 0) {
    const user = existing[0];
    if (user.role === "admin") {
      console.log(`Admin user already exists: ${normalizedEmail} — skipping`);
      return;
    }
    // Upgrade to admin
    await db
      .update(users)
      .set({ role: "admin", updatedAt: new Date() })
      .where(eq(users.id, user.id));
    console.log(`Upgraded existing user to admin: ${normalizedEmail}`);
    return;
  }

  // Create admin user
  const userId = crypto.randomUUID();
  const hashedPw = await hashPassword(password);

  await db.insert(users).values({
    id: userId,
    email: normalizedEmail,
    name: "Daniela Cioclov",
    emailVerified: true,
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create credential account with password
  await db.insert(accounts).values({
    id: crypto.randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: hashedPw,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(`Admin user created: ${normalizedEmail} (${userId})`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
