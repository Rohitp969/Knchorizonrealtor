import bcrypt from "bcryptjs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { query, queryOne, queryScript } from "./postgres.ts";
import { logger } from "./logger.ts";

/*
 * Start-up work against Supabase PostgreSQL.
 *
 * This deliberately does NOT seed content. The properties, projects, developers, posts,
 * communities, insights, gallery items and testimonials were migrated from MongoDB and are
 * real records the client owns; re-running a demo seed over them would overwrite edits made
 * through the admin console. src/lib/seed.ts is kept on disk for reference only and is no
 * longer called — see scripts/migrate-mongo-to-postgres.mjs for how the data arrived.
 *
 * What does run: the schema (create-if-missing, so a fresh environment comes up ready) and
 * the admin account named in ADMIN_EMAIL / ADMIN_PASSWORD, because without it nobody can
 * sign in to a new deployment.
 */

const schemaCandidates = [
  // Running from source (tsx / ts-node): src/lib/schema.sql sits beside this file.
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "schema.sql"),
  // Running from the bundle: the file is copied next to dist/index.mjs by the build.
  path.resolve(process.cwd(), "dist/schema.sql"),
  path.resolve(process.cwd(), "src/lib/schema.sql"),
];

async function readSchema() {
  for (const candidate of schemaCandidates) {
    try {
      return await readFile(candidate, "utf8");
    } catch {
      // try the next location
    }
  }
  return undefined;
}

export async function ensureSchema() {
  const schema = await readSchema();
  if (!schema) {
    logger.warn("schema.sql was not found; assuming the database is already migrated.");
    return;
  }
  await queryScript(schema);
  logger.info("PostgreSQL schema verified");
}

export async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email?.trim() || !password || password.startsWith("replace-with-")) return;

  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await queryOne<{ id: string }>("select id from users where lower(email) = $1", [normalizedEmail]);

  if (existing) {
    await query("update users set password_hash = $1, role = 'admin' where id = $2", [passwordHash, existing.id]);
  } else {
    await query(
      "insert into users (email, password_hash, role, created_at) values ($1, $2, 'admin', now())",
      [normalizedEmail, passwordHash],
    );
  }
  logger.info("Admin account verified");
}

export async function bootstrapDatabase() {
  await ensureSchema();
  await ensureAdminUser();
}
