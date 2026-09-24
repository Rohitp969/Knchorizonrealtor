/*
 * Full export of the live MongoDB database, written before anything is migrated.
 *
 * Every collection is dumped verbatim as JSON (Extended-JSON-ish: ObjectIds become their
 * hex string, Dates become ISO strings), plus a manifest with per-collection counts. This
 * is the rollback source: nothing in this script writes to or deletes from MongoDB.
 *
 *   node scripts/export-mongo.mjs [outputDir]
 */
import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { MongoClient, ObjectId } from "mongodb";

const outDir = path.resolve(
  process.cwd(),
  process.argv[2] || `backups/mongo-${new Date().toISOString().replace(/[:.]/g, "-")}`,
);

/** ObjectId -> hex string, Date -> ISO string, everything else untouched. */
function plain(value) {
  if (value instanceof ObjectId) return value.toHexString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(plain);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, plain(item)]));
  }
  return value;
}

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI must be set to export the database.");

const client = new MongoClient(uri);
await client.connect();
const db = client.db(process.env.MONGODB_DB ?? "knc_horizon");

await mkdir(outDir, { recursive: true });

const collections = (await db.listCollections().toArray()).map((entry) => entry.name).sort();
const manifest = { exportedAt: new Date().toISOString(), database: db.databaseName, collections: {} };

for (const name of collections) {
  const docs = await db.collection(name).find({}).toArray();
  const rows = docs.map((doc) => {
    const { _id, ...rest } = doc;
    return { _id: _id instanceof ObjectId ? _id.toHexString() : String(_id), ...plain(rest) };
  });
  await writeFile(path.join(outDir, `${name}.json`), JSON.stringify(rows, null, 2), "utf8");
  manifest.collections[name] = rows.length;
  console.log(`${name.padEnd(16)} ${rows.length}`);
}

await writeFile(path.join(outDir, "_manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
await client.close();

console.log(`\nBackup written to ${outDir}`);
console.log(`Total collections: ${collections.length}`);
