/*
 * Keeps the website's images in Cloudinary and points the database at them. The original
 * frontend/public/images and frontend/public/brand files were migrated on 28 September 2026
 * and then removed from the repo (git history still has them); Cloudinary holds the originals.
 *
 *   node scripts/migrate-images-to-cloudinary.mjs upload        # upload every file not uploaded yet
 *   node scripts/migrate-images-to-cloudinary.mjs db            # dry run: list the DB references it would change
 *   node scripts/migrate-images-to-cloudinary.mjs db --apply    # back up, then rewrite them in one transaction
 *   node scripts/migrate-images-to-cloudinary.mjs restore backups/database/cloudinary-image-migration/<file>.json
 *
 * scripts/cloudinary-images.json is the plan and the record: one entry per image with the
 * folder it belongs in and, once uploaded, its public_id and secure URL. `local` is the image's
 * file name (its old site path). A new photo carries `source`, the licensed original's URL
 * (e.g. the Pexels download), and is uploaded straight from there; the favicon files carry a
 * `source` path beside this script (scripts/brand/), which only has to exist while a new
 * favicon file is being uploaded; `crop` ({ x, y, width,
 * height } in source pixels) keeps only that part, used to frame a portrait photo for the
 * site's landscape cards or to leave a third-party sign out. Each image becomes its own
 * asset, public_id = folder + file name, uploaded with overwrite:false, so running the upload
 * again changes nothing that is already there.
 *
 * The database step only swaps a local path (/images/x.jpg) for that file's Cloudinary URL,
 * fills the public_id columns beside it, and adds the assets to the media library. Nothing is
 * deleted. The previous value of every changed column is written to
 * backups/database/cloudinary-image-migration/ first, and
 * `restore` puts them back.
 *
 * Credentials come from backend/.env (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
 * CLOUDINARY_API_SECRET, DATABASE_URL); none of them is printed.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";
import pg from "pg";

const here = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST = path.join(here, "cloudinary-images.json");
const PUBLIC_DIR = path.resolve(here, "../../frontend/public");
const BACKUP_DIR = path.resolve(here, "../backups/database/cloudinary-image-migration");
const [command, ...rest] = process.argv.slice(2);

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const saveManifest = () => fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

function configureCloudinary() {
  const missing = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"].filter((name) => !process.env[name]?.trim());
  if (missing.length) throw new Error(`Missing ${missing.join(", ")} in backend/.env`);
  cloudinary.config({
    // Cloud names are lower case; the API refuses "ComplaintReview" for "complaintreview".
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim().toLowerCase(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
    secure: true,
  });
  return cloudinary.config().cloud_name;
}

async function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL must be set in backend/.env");
  const url = process.env.DATABASE_URL;
  const client = new pg.Client({
    connectionString: url,
    // A local database without TLS says so with sslmode=disable; Supabase always uses TLS.
    ssl: /sslmode=disable/.test(url) ? false
      : process.env.DATABASE_SSL_CA ? { ca: process.env.DATABASE_SSL_CA, rejectUnauthorized: true } : { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

/* ================================================================== upload */

async function upload() {
  const cloud = configureCloudinary();
  const pending = manifest.filter((entry) => !entry.url);
  console.log(`Cloudinary cloud "${cloud}": ${manifest.length} files, ${pending.length} to upload.`);
  let next = 0;
  const failures = [];
  const worker = async () => {
    while (next < pending.length) {
      const entry = pending[next++];
      // `source` is a URL, or a file kept beside this script (scripts/brand/...).
      const file = !entry.source ? path.join(PUBLIC_DIR, entry.local)
        : /^https?:\/\//.test(entry.source) ? entry.source : path.join(here, entry.source);
      try {
        if (!/^https?:\/\//.test(file) && !fs.existsSync(file)) throw new Error("file not found and no source URL");
        const name = path.basename(entry.local).replace(/\.[^.]+$/, "");
        const result = await cloudinary.uploader.upload(file, {
          folder: entry.folder,
          public_id: name,
          resource_type: "image",
          overwrite: false,
          timeout: 120_000,
          ...(entry.crop ? { transformation: [{ crop: "crop", gravity: "north_west", ...entry.crop }] } : {}),
        });
        Object.assign(entry, {
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width ?? null,
          height: result.height ?? null,
          format: result.format ?? null,
          bytes: result.bytes ?? null,
        });
        saveManifest();
        console.log(`  ${result.existing ? "already there" : "uploaded"}  ${entry.local} -> ${result.public_id}`);
      } catch (error) {
        failures.push(`${entry.local}: ${error?.message ?? error?.error?.message ?? error}`);
      }
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));

  // Every stored URL must actually serve its image.
  const broken = [];
  for (const entry of manifest.filter((item) => item.url)) {
    const response = await fetch(entry.url, { method: "HEAD" }).catch(() => undefined);
    if (!response?.ok) broken.push(`${entry.local}: ${response?.status ?? "no answer"}`);
  }
  console.log(`\nuploaded ${manifest.filter((item) => item.url).length}/${manifest.length}; failures ${failures.length}; URLs not serving ${broken.length}`);
  [...failures, ...broken].forEach((line) => console.log(`  ! ${line}`));
  if (failures.length || broken.length) process.exitCode = 1;
}

/* ================================================================== database */

// Every column that holds an image reference, and the public_id column that goes with it.
const TABLES = {
  properties: { name: "title", single: { image_url: null, image_path: null, cover_image: "cover_image_public_id" }, arrays: ["images"], galleries: ["gallery_images"] },
  projects: { name: "title", single: { image: null, image_url: null, image_path: null, cover_image: "cover_image_public_id" }, arrays: ["gallery"], galleries: ["gallery_images"] },
  posts: { name: "title", single: { image: null, image_url: null, image_path: null, cover_image: null, featured_image: "featured_image_public_id" }, arrays: [], galleries: [] },
  developers: { name: "name", single: { logo: null, cover_image: null, image_url: null, image_path: null }, arrays: [], galleries: [] },
  communities: { name: "name", single: { image: null, image_url: null, image_path: null }, arrays: [], galleries: [] },
  insights: { name: "title", single: { image: null, image_url: null }, arrays: [], galleries: [] },
  gallery: { name: "title", single: { image: "image_public_id", image_url: null, image_path: null }, arrays: [], galleries: [] },
  testimonials: { name: "name", single: { image: null }, arrays: [], galleries: [] },
  seo_meta: { name: "coalesce(page_key, id)", single: { og_image: null }, arrays: [], galleries: [] },
  seo_settings: { name: "id", single: { default_og_image: null }, arrays: [], galleries: [] },
};

function lookup() {
  const byLocal = new Map();
  for (const entry of manifest) {
    if (!entry.url) continue;
    byLocal.set(entry.local, entry);
    // The absolute form some records may hold.
    byLocal.set(`https://www.knchorizonrealtor.com${entry.local}`, entry);
    byLocal.set(`https://knchorizonrealtor.com${entry.local}`, entry);
  }
  return byLocal;
}

/** The changes for one row: { column: newValue }, plus what each column held before. */
function planRow(table, spec, row, byLocal) {
  const after = {};
  const swap = (value) => (typeof value === "string" && byLocal.has(value.trim()) ? byLocal.get(value.trim()) : undefined);
  for (const [column, idColumn] of Object.entries(spec.single)) {
    if (!(column in row)) continue;
    const entry = swap(row[column]);
    if (entry) {
      after[column] = entry.url;
      if (idColumn && idColumn in row) after[idColumn] = entry.publicId;
    }
  }
  for (const column of spec.arrays) {
    if (!Array.isArray(row[column])) continue;
    const next = row[column].map((value) => swap(value)?.url ?? value);
    if (next.some((value, index) => value !== row[column][index])) after[column] = next;
  }
  for (const column of spec.galleries) {
    if (!Array.isArray(row[column])) continue;
    const next = row[column].map((image) => {
      const entry = swap(image?.url);
      return entry ? { ...image, url: entry.url, publicId: entry.publicId } : image;
    });
    if (JSON.stringify(next) !== JSON.stringify(row[column])) after[column] = next;
  }
  // Records saved before covers were separate columns get them filled from the migrated URL.
  if (table === "properties" && !row.cover_image && (after.images ?? row.images)?.[0]) {
    const cover = (after.images ?? row.images)[0];
    const entry = manifest.find((item) => item.url === cover);
    if (entry) { after.cover_image = cover; after.cover_image_public_id = entry.publicId; }
  }
  if (table === "projects" && !row.cover_image && (after.image ?? row.image)) {
    const cover = after.image ?? row.image;
    const entry = manifest.find((item) => item.url === cover);
    if (entry) { after.cover_image = cover; after.cover_image_public_id = entry.publicId; }
  }
  if (table === "posts" && !row.featured_image && (after.image ?? row.image)) {
    const featured = after.image ?? row.image;
    const entry = manifest.find((item) => item.url === featured);
    if (entry) { after.featured_image = featured; after.featured_image_public_id = entry.publicId; }
  }
  const before = Object.fromEntries(Object.keys(after).map((column) => [column, row[column] ?? null]));
  return { after, before };
}

/** Site settings are one jsonb document; any string in it equal to a migrated path is swapped. */
function swapDeep(node, byLocal) {
  if (typeof node === "string") return byLocal.get(node.trim())?.url ?? node;
  if (Array.isArray(node)) return node.map((item) => swapDeep(item, byLocal));
  if (node && typeof node === "object") return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, swapDeep(value, byLocal)]));
  return node;
}

async function migrateDatabase(apply) {
  const byLocal = lookup();
  if (!byLocal.size) throw new Error("Nothing uploaded yet: run `upload` first.");
  const client = await db();
  const changes = [];
  try {
    for (const [table, spec] of Object.entries(TABLES)) {
      const rows = (await client.query(`select ${spec.name} as knc_label, * from "${table}"`)).rows;
      for (const row of rows) {
        const { after, before } = planRow(table, spec, row, byLocal);
        if (Object.keys(after).length) changes.push({ table, id: row.id, label: String(row.knc_label), before, after });
      }
    }
    for (const row of (await client.query(`select id, key, value from settings`)).rows) {
      const next = swapDeep(row.value, byLocal);
      if (JSON.stringify(next) !== JSON.stringify(row.value)) changes.push({ table: "settings", id: row.id, label: row.key, before: { value: row.value }, after: { value: next } });
    }
    const existingMedia = new Set((await client.query(`select url from media`)).rows.map((row) => row.url));
    const newMedia = manifest.filter((entry) => entry.url && !existingMedia.has(entry.url));

    const perTable = {};
    for (const change of changes) perTable[change.table] = (perTable[change.table] ?? 0) + 1;
    console.log(`Rows to update: ${changes.length} ${JSON.stringify(perTable)}; media library rows to add: ${newMedia.length}`);
    for (const change of changes) {
      console.log(`  ${change.table} "${change.label}": ${Object.keys(change.after).join(", ")}`);
    }
    if (!apply) {
      console.log("\nDry run. Nothing was written. Add --apply to make these changes.");
      return;
    }

    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const backupFile = path.join(BACKUP_DIR, `cloudinary-image-migration-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    fs.writeFileSync(backupFile, JSON.stringify({ createdAt: new Date().toISOString(), changes, mediaUrls: newMedia.map((entry) => entry.url) }, null, 2));
    console.log(`\nBackup of every value about to change: ${path.relative(process.cwd(), backupFile)}`);

    await client.query("begin");
    for (const change of changes) {
      const columns = Object.keys(change.after);
      const jsonColumns = new Set(["gallery_images", "value"]);
      const values = columns.map((column) => (jsonColumns.has(column) ? JSON.stringify(change.after[column]) : change.after[column]));
      const set = columns.map((column, index) => `"${column}" = $${index + 1}${jsonColumns.has(column) ? "::jsonb" : ""}`).join(", ");
      await client.query(`update "${change.table}" set ${set} where id = $${columns.length + 1}`, [...values, change.id]);
    }
    for (const entry of newMedia) {
      await client.query(
        `insert into media (url, public_id, filename, mimetype, size, folder, width, height, format, created_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())`,
        [entry.url, entry.publicId, path.basename(entry.local), entry.format === "svg" ? "image/svg+xml" : `image/${entry.format === "jpg" ? "jpeg" : entry.format}`, entry.bytes, entry.folder, entry.width, entry.height, entry.format],
      );
    }
    await client.query("commit");

    // Planning again must now find nothing left to change.
    let left = 0;
    for (const [table, spec] of Object.entries(TABLES)) {
      for (const row of (await client.query(`select * from "${table}"`)).rows) {
        if (Object.keys(planRow(table, spec, row, byLocal).after).length) left++;
      }
    }
    for (const row of (await client.query(`select value from settings`)).rows) {
      if (JSON.stringify(swapDeep(row.value, byLocal)) !== JSON.stringify(row.value)) left++;
    }
    console.log(`Done: ${changes.length} rows updated, ${newMedia.length} media rows added; rows still to change: ${left}.`);
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

async function restore(file) {
  if (!file) throw new Error("Name the backup file: restore backups/database/cloudinary-image-migration/cloudinary-image-migration-....json");
  const backup = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
  const client = await db();
  try {
    await client.query("begin");
    for (const change of backup.changes) {
      const columns = Object.keys(change.before);
      const jsonColumns = new Set(["gallery_images", "value"]);
      const values = columns.map((column) => (jsonColumns.has(column) && change.before[column] !== null ? JSON.stringify(change.before[column]) : change.before[column]));
      const set = columns.map((column, index) => `"${column}" = $${index + 1}${jsonColumns.has(column) ? "::jsonb" : ""}`).join(", ");
      await client.query(`update "${change.table}" set ${set} where id = $${columns.length + 1}`, [...values, change.id]);
    }
    if (backup.mediaUrls?.length) await client.query(`delete from media where url = any($1::text[])`, [backup.mediaUrls]);
    await client.query("commit");
    console.log(`Restored ${backup.changes.length} rows and removed the ${backup.mediaUrls?.length ?? 0} media rows the migration added.`);
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

try {
  if (command === "upload") await upload();
  else if (command === "db") await migrateDatabase(rest.includes("--apply"));
  else if (command === "restore") await restore(rest[0]);
  else console.log("Usage: node scripts/migrate-images-to-cloudinary.mjs upload | db [--apply] | restore <backup.json>");
} catch (error) {
  console.error(`Failed: ${error.message}`);
  process.exitCode = 1;
}
