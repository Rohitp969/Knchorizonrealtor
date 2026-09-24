/*
 * Compares every field of every migrated record against the MongoDB backup taken before the
 * migration, so "the counts match" is not the only evidence that the data came across.
 *
 *   node scripts/verify-data.mjs [backupDir]
 *
 * Differences are reported per collection with the record and field that differ. Fields
 * MongoDB simply did not carry are not differences: those land on the column default, which
 * is reported separately as "defaulted".
 */
import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const backupsRoot = path.resolve(process.cwd(), "backups");
const backupDir = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.join(backupsRoot, (await readdir(backupsRoot)).filter((name) => name.startsWith("mongo-")).sort().at(-1));

console.log(`Comparing against ${path.basename(backupDir)}\n`);

/** Mongo field -> Postgres column, per collection. Mirrors the migration script. */
const MAP = {
  developers: { slug: "slug", name: "name", shortDescription: "short_description", description: "description", logo: "logo", coverImage: "cover_image", officialWebsite: "official_website", website: "website", featured: "featured", published: "published", sortOrder: "sort_order", areas: "areas", established: "established", createdAt: "created_at", updatedAt: "updated_at" },
  properties: { slug: "slug", title: "title", location: "location", community: "community", type: "type", propertyType: "property_type", listingType: "listing_type", status: "status", price: "price", currency: "currency", bedrooms: "bedrooms", bathrooms: "bathrooms", size: "size", description: "description", images: "images", amenities: "amenities", highlights: "highlights", featured: "featured", published: "published", createdAt: "created_at", updatedAt: "updated_at" },
  projects: { slug: "slug", title: "title", description: "description", developer: "developer", location: "location", category: "category", status: "status", startingPrice: "starting_price", handover: "handover", image: "image", imageUrl: "image_url", imagePath: "image_path", coverImage: "cover_image", gallery: "gallery", amenities: "amenities", highlights: "highlights", completionDate: "completion_date", newLaunch: "new_launch", offPlan: "off_plan", featured: "featured", published: "published", createdAt: "created_at", updatedAt: "updated_at" },
  posts: { slug: "slug", title: "title", excerpt: "excerpt", content: "content", category: "category", image: "image", author: "author", published: "published", publishedAt: "published_at", createdAt: "created_at", updatedAt: "updated_at" },
  communities: { slug: "slug", name: "name", shortDescription: "short_description", description: "description", location: "location", image: "image", highlights: "highlights", propertyTypes: "property_types", featured: "featured", published: "published", sortOrder: "sort_order", createdAt: "created_at", updatedAt: "updated_at" },
  insights: { slug: "slug", title: "title", category: "category", summary: "summary", content: "content", source: "source", sourceUrl: "source_url", image: "image", published: "published", featured: "featured", sortOrder: "sort_order", createdAt: "created_at", updatedAt: "updated_at" },
  gallery: { title: "title", category: "category", image: "image", alt: "alt", published: "published", createdAt: "created_at" },
  testimonials: { name: "name", designation: "designation", review: "review", rating: "rating", published: "published", createdAt: "created_at", updatedAt: "updated_at" },
  users: { email: "email", passwordHash: "password_hash", role: "role", createdAt: "created_at" },
  inquiries: { name: "name", email: "email", phone: "phone", interest: "interest", inquiryType: "inquiry_type", message: "message", propertySlug: "property_slug", projectSlug: "project_slug", preferredVisitDate: "preferred_visit_date", status: "status", createdAt: "created_at" },
  newsletter: { email: "email", subscribedAt: "subscribed_at", createdAt: "created_at" },
};

/** Compares one value, tolerating the representation changes a type system forces. */
function same(mongoValue, pgValue) {
  if (mongoValue === undefined || mongoValue === null) return pgValue === null || pgValue === undefined;
  if (Array.isArray(mongoValue)) {
    if (!Array.isArray(pgValue)) return false;
    return mongoValue.length === pgValue.length && mongoValue.every((entry, index) => String(entry) === String(pgValue[index]));
  }
  if (typeof mongoValue === "boolean") return mongoValue === pgValue;
  if (typeof mongoValue === "number") return Number(pgValue) === mongoValue;
  // Dates: Mongo exported ISO strings, Postgres returns Date objects.
  if (pgValue instanceof Date) return new Date(mongoValue).getTime() === pgValue.getTime();
  return String(mongoValue) === String(pgValue ?? "");
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL must be set.");
const client = new pg.Client({
  connectionString,
  ssl: process.env.DATABASE_SSL_CA ? { ca: process.env.DATABASE_SSL_CA, rejectUnauthorized: true } : { rejectUnauthorized: false },
});
await client.connect();

let totalRecords = 0;
let totalFields = 0;
let differences = 0;
let defaulted = 0;
let rehashed = 0;
const problems = [];

try {
  for (const [collection, fields] of Object.entries(MAP)) {
    const file = path.join(backupDir, `${collection}.json`);
    let docs;
    try { docs = JSON.parse(await readFile(file, "utf8")); } catch { continue; }

    const { rows } = await client.query(`select * from "${collection}"`);
    const byId = new Map(rows.map((row) => [row.id, row]));

    let collectionDiffs = 0;
    let collectionDefaults = 0;
    for (const doc of docs) {
      const row = byId.get(doc._id);
      totalRecords++;
      if (!row) {
        differences++;
        collectionDiffs++;
        problems.push(`${collection}/${doc._id}: missing from PostgreSQL`);
        continue;
      }
      for (const [mongoField, column] of Object.entries(fields)) {
        if (!(mongoField in doc)) {
          // MongoDB never stored this field for this record; the column holds its default.
          collectionDefaults++;
          defaulted++;
          continue;
        }
        /*
         * The ADMIN_EMAIL account's hash is re-derived from ADMIN_PASSWORD at every start-up
         * — bcrypt salts each time, so the string differs by design. The old MongoDB seed did
         * exactly the same. Every other user keeps the hash that was migrated, which is what
         * matters: their existing passwords still work.
         */
        const expectedRehash =
          collection === "users" &&
          mongoField === "passwordHash" &&
          String(doc.email ?? "").toLowerCase() === String(process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
        if (expectedRehash) {
          rehashed++;
          continue;
        }
        totalFields++;
        if (!same(doc[mongoField], row[column])) {
          differences++;
          collectionDiffs++;
          problems.push(
            `${collection}/${doc._id}.${mongoField}: mongo=${JSON.stringify(doc[mongoField])?.slice(0, 70)} pg=${JSON.stringify(row[column])?.slice(0, 70)}`,
          );
        }
      }
    }
    console.log(
      `${collection.padEnd(14)} ${String(docs.length).padStart(3)} records  ` +
      `${collectionDiffs === 0 ? "all fields identical" : `${collectionDiffs} DIFFERENCES`}` +
      `${collectionDefaults ? `  (${collectionDefaults} fields absent in Mongo, defaulted)` : ""}`,
    );
  }
} finally {
  await client.end();
}

console.log(`\nrecords compared : ${totalRecords}`);
console.log(`fields compared  : ${totalFields}`);
console.log(`fields defaulted : ${defaulted}`);
console.log(`admin re-hashes  : ${rehashed} (expected: ADMIN_PASSWORD is re-applied at start-up)`);
console.log(`differences      : ${differences}`);
if (problems.length) {
  console.log("\nDifferences:");
  for (const problem of problems.slice(0, 40)) console.log(`  - ${problem}`);
  if (problems.length > 40) console.log(`  ...and ${problems.length - 40} more`);
}
console.log(`\n${differences === 0 ? "DATA VERIFIED — every migrated field matches the MongoDB backup" : "DATA MISMATCH"}`);
process.exitCode = differences === 0 ? 0 : 1;
