import { buildInsert, buildSet, newId, query, queryOne } from "./postgres.ts";

/*
 * The one place the PostgreSQL column names and the API's field names meet.
 *
 * The API has always spoken camelCase (`startingPrice`, `publishedAt`, `shortDescription`)
 * and the frontend reads those keys directly, so the shape of every response is fixed. The
 * tables use snake_case, which is what Postgres is comfortable with. These maps translate
 * between the two in both directions, so no route has to remember either convention.
 */

type FieldMap = Record<string, string>;

const FIELDS = {
  properties: {
    slug: "slug",
    title: "title",
    location: "location",
    city: "city",
    state: "state",
    community: "community",
    type: "type",
    propertyType: "property_type",
    listingType: "listing_type",
    status: "status",
    price: "price",
    currency: "currency",
    bedrooms: "bedrooms",
    bathrooms: "bathrooms",
    size: "size",
    area: "area",
    description: "description",
    images: "images",
    imageUrl: "image_url",
    imagePath: "image_path",
    amenities: "amenities",
    highlights: "highlights",
    featured: "featured",
    published: "published",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
  projects: {
    slug: "slug",
    title: "title",
    description: "description",
    developer: "developer",
    developerSlug: "developer_slug",
    location: "location",
    category: "category",
    status: "status",
    startingPrice: "starting_price",
    handover: "handover",
    image: "image",
    imageUrl: "image_url",
    imagePath: "image_path",
    coverImage: "cover_image",
    gallery: "gallery",
    amenities: "amenities",
    highlights: "highlights",
    completionDate: "completion_date",
    newLaunch: "new_launch",
    offPlan: "off_plan",
    featured: "featured",
    published: "published",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
  developers: {
    slug: "slug",
    name: "name",
    shortDescription: "short_description",
    description: "description",
    logo: "logo",
    coverImage: "cover_image",
    imageUrl: "image_url",
    imagePath: "image_path",
    officialWebsite: "official_website",
    website: "website",
    featured: "featured",
    published: "published",
    sortOrder: "sort_order",
    areas: "areas",
    established: "established",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
  posts: {
    slug: "slug",
    title: "title",
    excerpt: "excerpt",
    content: "content",
    category: "category",
    coverImage: "cover_image",
    image: "image",
    imageUrl: "image_url",
    imagePath: "image_path",
    featuredImage: "featured_image",
    author: "author",
    published: "published",
    status: "status",
    publishedAt: "published_at",
    seoTitle: "seo_title",
    seoDescription: "seo_description",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
  communities: {
    slug: "slug",
    name: "name",
    shortDescription: "short_description",
    description: "description",
    location: "location",
    image: "image",
    imageUrl: "image_url",
    imagePath: "image_path",
    highlights: "highlights",
    propertyTypes: "property_types",
    featured: "featured",
    published: "published",
    sortOrder: "sort_order",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
  insights: {
    slug: "slug",
    title: "title",
    category: "category",
    summary: "summary",
    content: "content",
    source: "source",
    sourceUrl: "source_url",
    date: "date",
    image: "image",
    imageUrl: "image_url",
    published: "published",
    featured: "featured",
    sortOrder: "sort_order",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
  gallery: {
    title: "title",
    category: "category",
    image: "image",
    imageUrl: "image_url",
    imagePath: "image_path",
    alt: "alt",
    published: "published",
    createdAt: "created_at",
  },
  testimonials: {
    name: "name",
    designation: "designation",
    image: "image",
    review: "review",
    rating: "rating",
    published: "published",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
  users: {
    name: "name",
    email: "email",
    passwordHash: "password_hash",
    role: "role",
    isActive: "is_active",
    canPublishArticles: "can_publish_articles",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
  inquiries: {
    name: "name",
    email: "email",
    phone: "phone",
    interest: "interest",
    inquiryType: "inquiry_type",
    message: "message",
    budget: "budget",
    propertyType: "property_type",
    location: "location",
    propertySlug: "property_slug",
    projectSlug: "project_slug",
    property: "property_id",
    project: "project_id",
    preferredVisitDate: "preferred_visit_date",
    status: "status",
    createdAt: "created_at",
  },
  newsletter: {
    email: "email",
    subscribedAt: "subscribed_at",
    createdAt: "created_at",
  },
  media: {
    url: "url",
    publicId: "public_id",
    filename: "filename",
    mimetype: "mimetype",
    size: "size",
    folder: "folder",
    createdAt: "created_at",
  },
  settings: {
    key: "key",
    value: "value",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
} satisfies Record<string, FieldMap>;

export type TableName = keyof typeof FIELDS;

/** Every column of a table, ready for a `select`. */
export function columnsOf(table: TableName): string[] {
  return ["id", ...Object.values(FIELDS[table] as FieldMap)];
}

/*
 * `settings` is a key/value table: one row carries the whole site configuration inside its
 * `value` jsonb. The admin console works in flat documents ({ siteName, defaultCurrency,
 * leadNotificationEmail, contactPhone, ... }), none of which is a real column, so those
 * fields are folded into `value` on the way in and spread back out on the way out. Without
 * this, toColumns matched them to no column and dropped every one: Save answered 200 and
 * stored nothing.
 */
const SETTINGS_ROW_KEY = "site";
const SETTINGS_COLUMN_FIELDS = new Set(["id", "key", "value", "createdAt", "updatedAt"]);

/** The caller-supplied half of a settings document: everything that is not a real column. */
function settingsValue(document: Record<string, unknown>) {
  const value: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(document)) {
    if (SETTINGS_COLUMN_FIELDS.has(key) || entry === undefined) continue;
    value[key] = entry;
  }
  return value;
}

/** Turns a database row into the camelCase object the API has always returned. */
export function toApi(table: TableName, row: Record<string, unknown> | undefined) {
  if (!row) return undefined;
  const map = FIELDS[table] as FieldMap;
  const result: Record<string, unknown> = { id: String(row.id ?? "") };
  for (const [key, column] of Object.entries(map)) {
    if (column in row) result[key] = row[column];
  }
  if (table === "settings") {
    const stored = result.value;
    delete result.value;
    if (stored && typeof stored === "object" && !Array.isArray(stored)) Object.assign(result, stored);
  }
  return result;
}

export function toApiList(table: TableName, rows: Record<string, unknown>[]) {
  return rows.map((row) => toApi(table, row)!);
}

/** Turns a camelCase document into a column -> value map, ignoring unknown keys. */
export function toColumns(table: TableName, document: Record<string, unknown>) {
  const map = FIELDS[table] as FieldMap;
  const columns: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(document)) {
    const column = map[key];
    if (column && value !== undefined) columns[column] = value;
  }
  if (table === "settings") columns.value = JSON.stringify(settingsValue(document));
  return columns;
}

/*
 * ---- Generic table access ----
 * The shapes the admin console needs for any resource, kept small and explicit so nothing
 * here grows into an ORM.
 */

export async function findById(table: TableName, id: string) {
  const row = await queryOne(`select * from "${table}" where id = $1`, [id]);
  return row;
}

export async function findOneBy(table: TableName, column: string, value: unknown) {
  return queryOne(`select * from "${table}" where "${column}" = $1`, [value]);
}

export async function listAll(table: TableName, orderBy: string) {
  return query(`select * from "${table}" order by ${orderBy}`);
}

export async function insertRow(table: TableName, document: Record<string, unknown>) {
  const columns: Record<string, unknown> = { id: newId(), ...toColumns(table, document) };
  // The settings row is a singleton; giving it a key makes it addressable and keeps the
  // unique index from filling up with anonymous null-keyed rows.
  if (table === "settings" && columns.key === undefined) columns.key = SETTINGS_ROW_KEY;
  const { columns: names, placeholders, values } = buildInsert(columns);
  const row = await queryOne(`insert into "${table}" (${names}) values (${placeholders}) returning *`, values);
  return row;
}

export async function updateRow(table: TableName, id: string, document: Record<string, unknown>) {
  const columns = toColumns(table, document);

  /*
   * A settings update merges into the stored jsonb rather than replacing it. Two console
   * panels ("Website content" and "Settings") write different halves of the same row, so a
   * replace would blank whichever half was not on screen. `||` merges inside Postgres, so
   * two saves cannot read-modify-write over each other either.
   */
  if (table === "settings") {
    const merged = columns.value ?? "{}";
    delete columns.value;
    const set = buildSet(columns);
    const clauses = set ? [set.clause] : [];
    const values = set ? [...set.values] : [];
    let index = set ? set.nextIndex : 1;
    clauses.push(`"value" = coalesce("value", '{}'::jsonb) || $${index++}::jsonb`);
    values.push(merged);
    const row = await queryOne(
      `update "settings" set ${clauses.join(", ")} where id = $${index} returning *`,
      [...values, id],
    );
    return row;
  }

  const set = buildSet(columns);
  if (!set) return findById(table, id);
  const row = await queryOne(
    `update "${table}" set ${set.clause} where id = $${set.nextIndex} returning *`,
    [...set.values, id],
  );
  return row;
}

export async function deleteRow(table: TableName, id: string) {
  const rows = await query(`delete from "${table}" where id = $1 returning id`, [id]);
  return rows.length > 0;
}

/** `ILIKE '%value%'` with the wildcards escaped, so a literal % in a search stays literal. */
export function contains(value: string) {
  return `%${value.replace(/[\\%_]/g, (match) => `\\${match}`)}%`;
}
