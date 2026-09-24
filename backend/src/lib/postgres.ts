import { Pool, types, type PoolClient, type QueryResultRow } from "pg";
import { logger } from "./logger.ts";

/*
 * Supabase PostgreSQL, reached through the Supavisor session pooler on 5432.
 *
 * The connection string lives in DATABASE_URL and is never written into source. TLS is
 * always on: the pooler terminates SSL, and `sslmode` in the URL (if present) is honoured
 * through `ssl` below rather than by node-postgres' own URL parsing, which ignores it.
 *
 * Session mode (5432) rather than transaction mode (6543) because the app uses prepared
 * statements and multi-statement transactions during migration, which transaction pooling
 * does not support.
 */

// numeric/int8 come back as strings by default so large values survive; every numeric
// column in this schema fits a double, and the API has always sent JSON numbers.
types.setTypeParser(types.builtins.INT8, (value) => Number(value));
types.setTypeParser(types.builtins.NUMERIC, (value) => Number(value));

let pool: Pool | undefined;

/** Strips credentials out of anything that might reach a log line. */
function safeMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown PostgreSQL error.";
  return message.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[redacted DATABASE_URL]");
}

export function getPool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL must be set before starting the KNC API.");
  }
  pool = new Pool({
    connectionString,
    /*
     * TLS is always negotiated. Supavisor presents a certificate signed by Supabase's own
     * root, which is not in the public trust store, so the chain cannot be verified against
     * the platform CAs — the connection is encrypted but the peer is unverified.
     *
     * Set DATABASE_SSL_CA to the contents of Supabase's CA certificate (Project Settings →
     * Database → SSL configuration) to turn full verification on.
     */
    ssl: process.env.DATABASE_SSL_CA
      ? { ca: process.env.DATABASE_SSL_CA, rejectUnauthorized: true }
      : { rejectUnauthorized: false },
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
  });
  pool.on("error", (error) => {
    logger.error(`PostgreSQL pool error: ${safeMessage(error)}`);
  });
  return pool;
}

export async function connectToPostgres() {
  const activePool = getPool();
  try {
    const result = await activePool.query<{ now: Date }>("select now() as now");
    logger.info("PostgreSQL connected successfully");
    return result.rows[0]?.now;
  } catch (error) {
    logger.error(`PostgreSQL connection failed: ${safeMessage(error)}`);
    throw error;
  }
}

export async function closePostgres() {
  if (!pool) return;
  const active = pool;
  pool = undefined;
  await active.end().catch(() => undefined);
}

/** Runs a parameterised statement and returns the rows. */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: readonly unknown[] = [],
): Promise<T[]> {
  const result = await getPool().query<T>(text, params as unknown[]);
  return result.rows;
}

/**
 * Runs SQL with no parameters over the simple query protocol, which is the only one that
 * accepts several statements in a single string. Used for the schema file.
 */
export async function queryScript(text: string): Promise<void> {
  await getPool().query(text);
}

/** Runs a parameterised statement and returns the first row, or undefined. */
export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: readonly unknown[] = [],
): Promise<T | undefined> {
  const rows = await query<T>(text, params);
  return rows[0];
}

/** `select count(*)` as a number. */
export async function count(text: string, params: readonly unknown[] = []): Promise<number> {
  const row = await queryOne<{ count: number }>(text, params);
  return Number(row?.count ?? 0);
}

/** Runs the callback inside a transaction on a single pooled connection. */
export async function transaction<T>(run: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const result = await run(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

/*
 * ---- Helpers shared by every repository ----
 */

/**
 * Builds the `set` clause of an update from a column -> value map, skipping undefined so a
 * PATCH only touches what it was given. Returns undefined when there is nothing to write.
 */
export function buildSet(
  columns: Record<string, unknown>,
  startIndex = 1,
): { clause: string; values: unknown[]; nextIndex: number } | undefined {
  const entries = Object.entries(columns).filter(([, value]) => value !== undefined);
  if (!entries.length) return undefined;
  const values: unknown[] = [];
  let index = startIndex;
  const clause = entries
    .map(([column, value]) => {
      values.push(value);
      return `"${column}" = $${index++}`;
    })
    .join(", ");
  return { clause, values, nextIndex: index };
}

/** Builds an `insert ... values` pair from a column -> value map. */
export function buildInsert(
  columns: Record<string, unknown>,
  startIndex = 1,
): { columns: string; placeholders: string; values: unknown[]; nextIndex: number } {
  const entries = Object.entries(columns).filter(([, value]) => value !== undefined);
  const values: unknown[] = [];
  let index = startIndex;
  const names: string[] = [];
  const placeholders: string[] = [];
  for (const [column, value] of entries) {
    names.push(`"${column}"`);
    placeholders.push(`$${index++}`);
    values.push(value);
  }
  return { columns: names.join(", "), placeholders: placeholders.join(", "), values, nextIndex: index };
}

/** A 24-character hex id, the same shape the MongoDB ObjectIds had. */
export function newId(): string {
  const bytes = new Uint8Array(12);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** True for the 24-hex ids this database uses, so a bad path parameter is a 400 not a 500. */
export function isId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{24}$/i.test(value.trim());
}
