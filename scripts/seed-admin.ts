/**
 * Seed script: Create or update the admin user.
 *
 * REQUIRES a running Next.js server (dev or production) because
 * Turbopack resolves @better-auth/utils/password to a different scrypt
 * implementation than tsx. Only the server's own /api/auth/sign-up/email
 * endpoint guarantees password hashes that the sign-in flow can verify.
 *
 * Usage:
 *   1. Start the server:  npm run dev
 *   2. Run:  ADMIN_EMAIL=... ADMIN_PASSWORD=... SEED_URL=http://localhost:3000 \
 *            npx tsx --env-file=.env.local scripts/seed-admin.ts
 */

import { neon } from "@neondatabase/serverless";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const dbUrl = process.env.DATABASE_URL;
  // SEED_URL is the server we're talking to. The Origin header MUST match
  // the target server's BETTER_AUTH_URL. For local dev that's http://localhost:3000.
  // For production that's https://changeyourbody.ro.
  // Derive both from the same source to keep them in sync.
  const seedUrl = process.env.SEED_URL || "http://localhost:3000";
  const origin = seedUrl;

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD env vars are required");
    process.exit(1);
  }

  if (!dbUrl) {
    console.error("DATABASE_URL env var is required");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters");
    process.exit(1);
  }

  const sql = neon(dbUrl);
  const normalizedEmail = email.toLowerCase();

  // Step 1: Clean slate — remove existing user + accounts + sessions
  await sql.query(
    "DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email = $1)",
    [normalizedEmail]
  );
  await sql.query(
    "DELETE FROM accounts WHERE user_id IN (SELECT id FROM users WHERE email = $1)",
    [normalizedEmail]
  );
  await sql.query("DELETE FROM users WHERE email = $1", [normalizedEmail]);
  console.log(`[1/4] Cleaned existing data for: ${normalizedEmail}`);

  // Step 2: Create user via the running server's signUpEmail endpoint
  // This ensures password is hashed with the server's own scrypt implementation
  const signupRes = await fetch(`${seedUrl}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify({
      name: "Daniela Cioclov",
      email: normalizedEmail,
      password,
    }),
  });

  if (!signupRes.ok) {
    const body = await signupRes.text();
    console.error(`[2/4] signUpEmail failed (${signupRes.status}): ${body}`);
    process.exit(1);
  }

  const signupData = await signupRes.json();
  console.log(`[2/4] User created: ${signupData.user.id}`);

  // Step 3: Promote to admin + mark email as verified
  await sql.query(
    "UPDATE users SET role = $1, email_verified = $2, updated_at = $3 WHERE id = $4",
    ["admin", true, new Date().toISOString(), signupData.user.id]
  );
  console.log(`[3/4] Promoted to admin`);

  // Step 4: Verify sign-in works
  const signinRes = await fetch(`${seedUrl}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify({ email: normalizedEmail, password }),
  });

  if (signinRes.ok) {
    console.log(`[4/4] Login verification: PASS`);
    console.log(`\nAdmin ready: ${normalizedEmail}`);
  } else {
    console.error(`[4/4] Login verification: FAIL (${signinRes.status})`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
