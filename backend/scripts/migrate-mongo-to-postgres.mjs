/*
 * Copies every MongoDB document into Supabase PostgreSQL.
 *
 * Read-only against MongoDB: nothing is dropped, updated or deleted there, so Mongo stays
 * the rollback source until the Postgres side is signed off.
 *
 * Idempotent: rows are upserted on their primary key, which is the original ObjectId hex,
 * so re-running reconciles rather than duplicating. Tables are migrated parents-first so
 * the foreign keys resolve.
 *
 *   node scripts/migrate-mongo-to-postgres.mjs          # migrate + verify
 *   node scripts/migrate-mongo-to-postgres.mjs --verify # verify counts only, write nothing
 */
import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";
import pg from "pg";

const verifyOnly = process.argv.includes("--verify");

/* ---------- helpers ---------- */

const hex = (value) => {
  if (value instanceof ObjectId) return value.toHexString();
  if (typeof value === "string" && /^[0-9a-f]{24}$/i.test(value)) return value.toLowerCase();
  return undefined;
};

const text = (value) => (value === undefined || value === null ? undefined : String(value));
const trimmed = (value) => {
  const asText = text(value);
  return asText === undefined ? undefined : asText.trim();
};
const num = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};
const int = (value) => {
  const parsed = num(value);
  return parsed === undefined ? undefined : Math.trunc(parsed);
};
const bool = (value) => (typeof value === "boolean" ? value : undefined);
const date = (value) => {
  if (!value) return undefined;
  const parsed = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};
/** Mongo stored these as arrays of strings; anything else is coerced or dropped. */
const list = (value) => {
  if (!Array.isArray(value)) return undefined;
  return value.map((entry) => String(entry)).filter((entry) => entry.length > 0);
};

/** Drops undefined so a missing Mongo field falls through to the column default. */
const defined = (row) => Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined));

/* ---------- per-collection mapping ---------- */

const MAPPERS = {
  developers: (doc) => ({
    id: hex(doc._id),
    slug: trimmed(doc.slug),
    name: trimmed(doc.name),
    short_description: trimmed(doc.shortDescription),
    description: text(doc.description),
    logo: trimmed(doc.logo),
    cover_image: trimmed(doc.coverImage),
    image_url: trimmed(doc.imageUrl),
    image_path: trimmed(doc.imagePath),
    official_website: trimmed(doc.officialWebsite),
    website: trimmed(doc.website ?? doc.officialWebsite),
    featured: bool(doc.featured),
    published: bool(doc.published),
    sort_order: int(doc.sortOrder),
    areas: list(doc.areas),
    established: trimmed(doc.established),
    created_at: date(doc.createdAt),
    updated_at: date(doc.updatedAt ?? doc.createdAt),
  }),

  properties: (doc) => ({
    id: hex(doc._id),
    slug: trimmed(doc.slug),
    title: trimmed(doc.title),
    location: text(doc.location),
    city: trimmed(doc.city),
    state: trimmed(doc.state),
    community: text(doc.community),
    type: text(doc.type),
    property_type: trimmed(doc.propertyType),
    listing_type: trimmed(doc.listingType),
    status: text(doc.status),
    price: num(doc.price),
    currency: trimmed(doc.currency),
    bedrooms: int(doc.bedrooms),
    bathrooms: int(doc.bathrooms),
    size: num(doc.size),
    area: num(doc.area),
    description: text(doc.description),
    images: list(doc.images),
    image_url: trimmed(doc.imageUrl),
    image_path: trimmed(doc.imagePath),
    amenities: list(doc.amenities),
    highlights: list(doc.highlights),
    featured: bool(doc.featured),
    published: bool(doc.published),
    created_at: date(doc.createdAt),
    updated_at: date(doc.updatedAt ?? doc.createdAt),
  }),

  projects: (doc) => ({
    id: hex(doc._id),
    slug: trimmed(doc.slug),
    title: trimmed(doc.title),
    description: text(doc.description),
    developer: text(doc.developer),
    location: text(doc.location),
    category: trimmed(doc.category),
    status: trimmed(doc.status),
    starting_price: num(doc.startingPrice),
    handover: text(doc.handover),
    image: text(doc.image),
    image_url: trimmed(doc.imageUrl),
    image_path: trimmed(doc.imagePath),
    cover_image: trimmed(doc.coverImage),
    gallery: list(doc.gallery),
    amenities: list(doc.amenities),
    highlights: list(doc.highlights),
    completion_date: trimmed(doc.completionDate),
    new_launch: bool(doc.newLaunch),
    off_plan: bool(doc.offPlan),
    featured: bool(doc.featured),
    published: bool(doc.published),
    created_at: date(doc.createdAt),
    updated_at: date(doc.updatedAt ?? doc.createdAt),
  }),

  posts: (doc) => ({
    id: hex(doc._id),
    slug: trimmed(doc.slug),
    title: trimmed(doc.title),
    excerpt: text(doc.excerpt),
    content: text(doc.content),
    category: trimmed(doc.category),
    cover_image: trimmed(doc.coverImage),
    image: text(doc.image),
    image_url: trimmed(doc.imageUrl),
    image_path: trimmed(doc.imagePath),
    featured_image: trimmed(doc.featuredImage),
    author: trimmed(doc.author),
    published: bool(doc.published),
    status: trimmed(doc.status),
    published_at: date(doc.publishedAt ?? doc.createdAt),
    seo_title: trimmed(doc.seoTitle),
    seo_description: trimmed(doc.seoDescription),
    created_at: date(doc.createdAt),
    updated_at: date(doc.updatedAt ?? doc.createdAt),
  }),

  communities: (doc) => ({
    id: hex(doc._id),
    slug: trimmed(doc.slug),
    name: trimmed(doc.name),
    short_description: trimmed(doc.shortDescription),
    description: text(doc.description),
    location: trimmed(doc.location),
    image: trimmed(doc.image),
    image_url: trimmed(doc.imageUrl),
    image_path: trimmed(doc.imagePath),
    highlights: list(doc.highlights),
    property_types: list(doc.propertyTypes),
    featured: bool(doc.featured),
    published: bool(doc.published),
    sort_order: int(doc.sortOrder),
    created_at: date(doc.createdAt),
    updated_at: date(doc.updatedAt ?? doc.createdAt),
  }),

  insights: (doc) => ({
    id: hex(doc._id),
    slug: trimmed(doc.slug),
    title: trimmed(doc.title),
    category: trimmed(doc.category),
    summary: text(doc.summary),
    content: text(doc.content),
    source: trimmed(doc.source),
    source_url: trimmed(doc.sourceUrl),
    date: trimmed(doc.date),
    image: trimmed(doc.image),
    image_url: trimmed(doc.imageUrl),
    published: bool(doc.published),
    featured: bool(doc.featured),
    sort_order: int(doc.sortOrder),
    created_at: date(doc.createdAt),
    updated_at: date(doc.updatedAt ?? doc.createdAt),
  }),

  gallery: (doc) => ({
    id: hex(doc._id),
    title: trimmed(doc.title),
    category: trimmed(doc.category),
    image: text(doc.image),
    image_url: trimmed(doc.imageUrl),
    image_path: trimmed(doc.imagePath),
    alt: text(doc.alt),
    published: bool(doc.published),
    created_at: date(doc.createdAt),
  }),

  testimonials: (doc) => ({
    id: hex(doc._id),
    name: trimmed(doc.name),
    designation: trimmed(doc.designation),
    image: trimmed(doc.image),
    review: text(doc.review),
    rating: int(doc.rating),
    published: bool(doc.published),
    created_at: date(doc.createdAt),
    updated_at: date(doc.updatedAt),
  }),

  users: (doc) => ({
    id: hex(doc._id),
    name: trimmed(doc.name),
    email: trimmed(doc.email)?.toLowerCase(),
    password_hash: text(doc.passwordHash),
    role: ["admin", "agent", "user"].includes(doc.role) ? doc.role : "user",
    created_at: date(doc.createdAt),
  }),

  inquiries: (doc) => ({
    id: hex(doc._id),
    name: trimmed(doc.name),
    email: trimmed(doc.email)?.toLowerCase(),
    phone: trimmed(doc.phone),
    interest: text(doc.interest),
    inquiry_type: trimmed(doc.inquiryType),
    message: text(doc.message),
    budget: trimmed(doc.budget),
    property_type: trimmed(doc.propertyType),
    location: trimmed(doc.location),
    property_slug: trimmed(doc.propertySlug),
    project_slug: trimmed(doc.projectSlug),
    property_id: hex(doc.property),
    project_id: hex(doc.project),
    preferred_visit_date: trimmed(doc.preferredVisitDate),
    status: ["new", "contacted", "closed"].includes(doc.status) ? doc.status : "new",
    created_at: date(doc.createdAt),
  }),

  newsletter: (doc) => ({
    id: hex(doc._id),
    email: trimmed(doc.email)?.toLowerCase(),
    subscribed_at: date(doc.subscribedAt),
    created_at: date(doc.createdAt ?? doc.subscribedAt),
  }),

  media: (doc) => ({
    id: hex(doc._id),
    url: text(doc.url),
    public_id: trimmed(doc.publicId),
    filename: trimmed(doc.filename),
    mimetype: trimmed(doc.mimetype),
    size: int(doc.size),
    folder: trimmed(doc.folder),
    created_at: date(doc.createdAt),
  }),

  settings: (doc) => ({
    id: hex(doc._id),
    key: trimmed(doc.key),
    value: JSON.stringify(doc.value ?? {}),
    created_at: date(doc.createdAt),
    updated_at: date(doc.updatedAt ?? doc.createdAt),
  }),
};

/** Parents before children, so the foreign keys have something to point at. */
const ORDER = [
  "developers",
  "properties",
  "projects",
  "posts",
  "communities",
  "insights",
  "gallery",
  "testimonials",
  "users",
  "inquiries",
  "newsletter",
  "media",
  "settings",
];

/* ---------- run ---------- */

const mongoUri = process.env.MONGODB_URI;
const connectionString = process.env.DATABASE_URL;
if (!mongoUri) throw new Error("MONGODB_URI must be set.");
if (!connectionString) throw new Error("DATABASE_URL must be set.");

const mongo = new MongoClient(mongoUri);
await mongo.connect();
const mongoDb = mongo.db(process.env.MONGODB_DB ?? "knc_horizon");

const pgClient = new pg.Client({
  connectionString,
  ssl: process.env.DATABASE_SSL_CA
    ? { ca: process.env.DATABASE_SSL_CA, rejectUnauthorized: true }
    : { rejectUnauthorized: false },
});
await pgClient.connect();

const summary = [];
let migrationFailures = 0;

try {
  if (!verifyOnly) {
    for (const collection of ORDER) {
      const mapper = MAPPERS[collection];
      const docs = await mongoDb.collection(collection).find({}).toArray();
      let written = 0;
      let skipped = 0;

      for (const doc of docs) {
        const row = defined(mapper(doc));
        if (!row.id) {
          skipped++;
          console.warn(`  ${collection}: skipped a document without a usable id`);
          continue;
        }
        const columns = Object.keys(row);
        const values = columns.map((column) => row[column]);
        const placeholders = columns.map((_, index) => `$${index + 1}`);
        // Upsert on the primary key: re-running reconciles instead of duplicating, and the
        // columns a document does not carry keep whatever the table default gave them.
        const updates = columns
          .filter((column) => column !== "id")
          .map((column) => `"${column}" = excluded."${column}"`);
        const sql =
          `insert into "${collection}" (${columns.map((c) => `"${c}"`).join(", ")}) ` +
          `values (${placeholders.join(", ")}) ` +
          (updates.length ? `on conflict (id) do update set ${updates.join(", ")}` : "on conflict (id) do nothing");
        try {
          await pgClient.query(sql, values);
          written++;
        } catch (error) {
          migrationFailures++;
          console.error(`  ${collection}/${row.id}: ${error.message}`);
        }
      }
      console.log(`${collection.padEnd(14)} read ${String(docs.length).padStart(4)}  written ${String(written).padStart(4)}${skipped ? `  skipped ${skipped}` : ""}`);
    }

    /*
     * Resolve the relationships the document model only carried as free text.
     * Developer names are matched the way the API already matches them: full name, the name
     * without a trailing "Properties"/"Realty", or the slug — case-insensitively.
     */
    const linkedDevelopers = await pgClient.query(`
      update projects p
         set developer_slug = d.slug
        from developers d
       where p.developer_slug is distinct from d.slug
         and (
              lower(btrim(p.developer)) = lower(d.name)
           or lower(btrim(p.developer)) = lower(regexp_replace(d.name, '\\s+(Properties|Realty)$', '', 'i'))
           or lower(btrim(p.developer)) = lower(d.slug)
         )
    `);
    console.log(`\nprojects.developer_slug linked: ${linkedDevelopers.rowCount}`);

    /*
     * Enquiries keep the slug the form submitted. "azure-house-palm-jumeirah" was renamed to
     * "palm-jumeirah-azure" before this migration and the public route still aliases it, so
     * leads captured under the old slug resolve to the same property here rather than
     * arriving in Postgres detached from the listing they were about.
     */
    const linkedProperties = await pgClient.query(`
      update inquiries i
         set property_id = pr.id
        from properties pr
       where i.property_id is null
         and i.property_slug is not null
         and (
              i.property_slug = pr.slug
           or (i.property_slug = 'azure-house-palm-jumeirah' and pr.slug = 'palm-jumeirah-azure')
         )
    `);
    const linkedProjects = await pgClient.query(`
      update inquiries i
         set project_id = pj.id
        from projects pj
       where i.project_id is null and i.project_slug is not null and i.project_slug = pj.slug
    `);
    console.log(`inquiries.property_id linked:   ${linkedProperties.rowCount}`);
    console.log(`inquiries.project_id linked:    ${linkedProjects.rowCount}`);
  }

  /* ---------- verification ---------- */
  console.log("\n--- verification ---");
  console.log("collection      mongo    postgres   match");
  let allMatch = true;
  for (const collection of ORDER) {
    const mongoCount = await mongoDb.collection(collection).countDocuments();
    const { rows } = await pgClient.query(`select count(*)::int as n from "${collection}"`);
    const pgCount = rows[0].n;
    const match = mongoCount === pgCount;
    if (!match) allMatch = false;
    summary.push({ collection, mongoCount, pgCount, match });
    console.log(
      `${collection.padEnd(14)} ${String(mongoCount).padStart(5)} ${String(pgCount).padStart(11)}   ${match ? "ok" : "MISMATCH"}`,
    );
  }

  // Relationship spot-checks, so a "migrated" table that lost its links is not called done.
  const rel = await pgClient.query(`
    select
      (select count(*)::int from projects where developer_slug is not null)                      as projects_linked,
      (select count(*)::int from projects)                                                        as projects_total,
      (select count(*)::int from inquiries where property_id is not null or project_id is not null) as inquiries_linked,
      (select count(*)::int from inquiries where property_slug is not null or project_slug is not null) as inquiries_with_slug,
      (select count(*)::int from properties where published)                                      as properties_published,
      (select count(*)::int from properties where listing_type = 'rent')                          as properties_rent,
      (select count(*)::int from properties where listing_type = 'sale')                          as properties_sale,
      (select count(*)::int from users where role = 'admin')                                      as admin_users
  `);
  console.log("\n--- relationships ---");
  for (const [key, value] of Object.entries(rel.rows[0])) console.log(`  ${key.padEnd(22)} ${value}`);

  console.log(`\n${allMatch && migrationFailures === 0 ? "MIGRATION VERIFIED" : "MIGRATION INCOMPLETE"}`);
  if (migrationFailures) console.log(`row failures: ${migrationFailures}`);
  process.exitCode = allMatch && migrationFailures === 0 ? 0 : 1;
} finally {
  await mongo.close();
  await pgClient.end();
}
