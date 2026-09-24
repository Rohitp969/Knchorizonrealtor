/*
 * Creates the Supabase PostgreSQL schema. Idempotent: every statement is
 * `create ... if not exists`, so running it again on a populated database changes nothing.
 *
 *   node scripts/apply-schema.mjs
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const sqlPath = path.resolve(process.cwd(), "src/lib/schema.sql");
const sql = await readFile(sqlPath, "utf8");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL must be set to apply the schema.");

const client = new pg.Client({
  connectionString,
  ssl: process.env.DATABASE_SSL_CA
    ? { ca: process.env.DATABASE_SSL_CA, rejectUnauthorized: true }
    : { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query(sql);
  const { rows } = await client.query(`
    select table_name,
           (select count(*) from information_schema.columns c
             where c.table_schema = 'public' and c.table_name = t.table_name) as columns
      from information_schema.tables t
     where table_schema = 'public' and table_type = 'BASE TABLE'
     order by table_name
  `);
  console.log("Tables in public schema:");
  for (const row of rows) console.log(`  ${row.table_name.padEnd(14)} ${row.columns} columns`);

  const { rows: indexes } = await client.query(
    `select count(*)::int as n from pg_indexes where schemaname = 'public'`,
  );
  console.log(`Indexes: ${indexes[0].n}`);
} finally {
  await client.end();
}
