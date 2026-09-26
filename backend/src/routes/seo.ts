import { Router, type NextFunction, type Response } from "express";
import bcrypt from "bcryptjs";
import { requireSeoAccess, requireSuperAdmin, type AuthenticatedRequest } from "../lib/auth.ts";
import { isId, query, queryOne } from "../lib/postgres.ts";
import {
  SEO_PAGES,
  isImageRef,
  oneLine,
  pageByKey,
  parseSeoFields,
  parseSeoSettings,
  parseSlug,
  readSeoSettings,
  rememberPreviousSlug,
  seoToApi,
  seoToPublic,
  sitemapEntries,
  sitemapXml,
  upsertSeo,
  writeSeoSettings,
  type FieldError,
  type SeoRow,
} from "../lib/seo.ts";
import { handleImageUpload, upload } from "./admin.ts";

/*
 * SEO: the public SEO data, the SEO console and the SEO manager accounts.
 *
 * Mounted before the admin router (whose requireAdmin would turn every SEO manager away).
 * Access is enforced here on the server, per route group:
 *   /public/seo, /sitemap.xml   anyone
 *   /seo/*                      administrators, agents and SEO managers (checked in the DB)
 *   /admin/seo-managers*        administrators only
 * An SEO manager's token is refused by every other admin route, so leads, users, settings
 * and credentials stay out of reach whatever the console shows.
 */
const router = Router();

type Handler = (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<unknown>;
const handle = (fn: Handler) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  fn(req, res, next).catch(next);
};
const invalid = (res: Response, errors: FieldError[]) => res.status(400).json({ message: errors[0]!.message, errors });

/* ================================================================== public */

/** Site-wide SEO defaults and the overrides for static pages, keyed by path. */
router.get("/public/seo", handle(async (_req, res) => {
  const settings = await readSeoSettings();
  const rows = await query<SeoRow>(`select * from seo_meta where page_key is not null`);
  const pages: Record<string, unknown> = {};
  for (const row of rows) {
    const page = pageByKey(row.page_key!);
    if (page) pages[page.path] = seoToPublic(row);
  }
  res.set("Cache-Control", "public, max-age=60");
  return res.json({ settings, pages });
}));

router.get("/sitemap.xml", handle(async (_req, res) => {
  const xml = sitemapXml(await sitemapEntries());
  return res.type("application/xml").set("Cache-Control", "public, max-age=600").send(xml);
}));

/* ================================================================== console */

router.use("/seo", requireSeoAccess);

/** The article states: a post is live when either the flag or the status says so. */
function articleStatus(row: { published?: boolean | null; status?: string | null }) {
  if (row.published || row.status === "published") return "published" as const;
  return row.status === "review" ? ("review" as const) : ("draft" as const);
}

/** Everything the SEO console lists: static pages, listings, projects and articles with their SEO. */
router.get("/seo/overview", handle(async (req, res) => {
  const [settings, pageRows, properties, projects, posts] = await Promise.all([
    readSeoSettings(),
    query<SeoRow>(`select * from seo_meta where page_key is not null`),
    query(
      `select p.id, p.slug, p.title, p.location, p.community, p.type, p.status, left(p.description, 600) as description,
              coalesce(nullif(p.images[1], ''), p.image_url) as image, p.published, p.updated_at, to_jsonb(s) as seo
         from properties p left join seo_meta s on s.property_id = p.id
        order by p.published desc, p.updated_at desc`,
    ),
    query(
      `select p.id, p.slug, p.title, p.developer, p.location, p.category, left(p.description, 600) as description,
              coalesce(nullif(p.image, ''), p.image_url, p.cover_image) as image, p.published, p.updated_at, to_jsonb(s) as seo
         from projects p left join seo_meta s on s.project_id = p.id
        order by p.published desc, p.updated_at desc`,
    ),
    query(
      `select p.id, p.slug, p.title, p.excerpt, p.category, p.author, p.status, p.published, p.published_at,
              coalesce(nullif(p.featured_image, ''), nullif(p.image, ''), p.image_url, p.cover_image) as image,
              p.seo_title, p.seo_description, p.updated_at, to_jsonb(s) as seo
         from posts p left join seo_meta s on s.post_id = p.id
        order by p.updated_at desc`,
    ),
  ]);

  const listing = (row: Record<string, unknown>) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location,
    description: row.description ?? "",
    image: row.image ?? null,
    published: row.published === true,
    updatedAt: row.updated_at,
    seo: seoToApi(row.seo as SeoRow | null),
  });

  return res.json({
    user: req.user,
    settings,
    pages: SEO_PAGES.map((page) => ({ ...page, seo: seoToApi(pageRows.find((row) => row.page_key === page.key)) })),
    properties: properties.map((row) => ({ ...listing(row), community: row.community, type: row.type, status: row.status })),
    projects: projects.map((row) => ({ ...listing(row), developer: row.developer, category: row.category })),
    articles: posts.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt ?? "",
      category: row.category,
      author: row.author,
      status: articleStatus(row),
      publishedAt: row.published_at,
      image: row.image ?? null,
      seoTitle: row.seo_title ?? null,
      seoDescription: row.seo_description ?? null,
      updatedAt: row.updated_at,
      seo: seoToApi(row.seo as SeoRow | null),
    })),
  });
}));

/* ---- static pages ---- */

router.put("/seo/pages/:key", handle(async (req, res) => {
  const page = pageByKey(String(req.params.key));
  if (!page) return res.status(404).json({ message: "Unknown page." });
  const { siteUrl } = await readSeoSettings();
  const { values, errors } = parseSeoFields(req.body, siteUrl);
  if (errors.length) return invalid(res, errors);
  values.internalLinks = [];
  const row = await upsertSeo({ column: "page_key", value: page.key }, values, req.user!.id);
  return res.json({ seo: seoToApi(row) });
}));

/* ---- properties and projects: SEO on the existing records ---- */

const LISTINGS = {
  properties: { column: "property_id", singular: "property" },
  projects: { column: "project_id", singular: "project" },
} as const;

for (const kind of ["properties", "projects"] as const) {
  const { column, singular } = LISTINGS[kind];
  router.put(`/seo/${kind}/:id`, handle(async (req, res) => {
    const id = String(req.params.id);
    if (!isId(id)) return res.status(400).json({ message: `Invalid ${singular} id.` });
    const record = await queryOne<{ id: string; slug: string; published: boolean }>(
      `select id, slug, published from ${kind} where id = $1`,
      [id],
    );
    if (!record) return res.status(404).json({ message: `This ${singular} no longer exists.` });

    const body = (req.body ?? {}) as Record<string, unknown>;
    const { siteUrl } = await readSeoSettings();
    const { values, errors } = parseSeoFields(body, siteUrl);
    values.internalLinks = [];

    let newSlug: string | undefined;
    if (body.slug !== undefined && oneLine(body.slug).toLowerCase() !== record.slug) {
      const parsed = parseSlug(body.slug);
      if (parsed.error) errors.push(parsed.error);
      else if (await queryOne(`select id from ${kind} where slug = $1 and id <> $2`, [parsed.slug, id])) {
        errors.push({ field: "slug", message: `Another ${singular} already uses the slug "${parsed.slug}".` });
      } else newSlug = parsed.slug;
    }
    if (errors.length) return invalid(res, errors);

    if (newSlug) {
      await query(`update ${kind} set slug = $1, updated_at = now() where id = $2`, [newSlug, id]);
      // A live listing keeps answering on its old address.
      if (record.published) await rememberPreviousSlug({ column, value: id }, record.slug, newSlug, req.user!.id);
    }
    const row = await upsertSeo({ column, value: id }, values, req.user!.id);
    return res.json({ slug: newSlug ?? record.slug, seo: seoToApi(row) });
  }));
}

/* ---- articles: create, edit and the draft -> review -> published workflow ---- */

type PostRow = {
  id: string; slug: string; title: string; excerpt: string | null; content: string; category: string | null;
  author: string | null; featured_image: string | null; image: string | null; status: string | null;
  published: boolean; published_at: string | Date; seo_title: string | null; seo_description: string | null;
  updated_at: string | Date;
};

function articleToApi(row: PostRow) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    content: row.content ?? "",
    category: row.category ?? "General",
    author: row.author ?? "KNC Horizon",
    featuredImage: row.featured_image || row.image || "",
    status: articleStatus(row),
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    seoTitle: row.seo_title ?? null,
    seoDescription: row.seo_description ?? null,
  };
}

router.get("/seo/articles/:id", handle(async (req, res) => {
  const id = String(req.params.id);
  if (!isId(id)) return res.status(400).json({ message: "Invalid article id." });
  const row = await queryOne<PostRow & { seo: SeoRow | null }>(
    `select p.*, to_jsonb(s) as seo from posts p left join seo_meta s on s.post_id = p.id where p.id = $1`,
    [id],
  );
  if (!row) return res.status(404).json({ message: "Article not found." });
  return res.json({ article: articleToApi(row), seo: seoToApi(row.seo) });
}));

const ARTICLE_STATUSES = ["draft", "review", "published"] as const;

async function saveArticle(req: AuthenticatedRequest, res: Response, existing?: PostRow) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const { siteUrl } = await readSeoSettings();
  const { values: seo, errors } = parseSeoFields(body.seo, siteUrl);

  const title = oneLine(body.title);
  if (title.length < 3 || title.length > 160) errors.push({ field: "title", message: "Title must be between 3 and 160 characters." });
  const slugResult = parseSlug(body.slug);
  if (slugResult.error) errors.push(slugResult.error);
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content) errors.push({ field: "content", message: "Article text is required." });
  if (content.length > 100_000) errors.push({ field: "content", message: "Article text is too long." });
  const excerpt = oneLine(body.excerpt);
  if (excerpt.length > 400) errors.push({ field: "excerpt", message: "Excerpt must be 400 characters or fewer." });
  const category = oneLine(body.category) || "General";
  if (category.length > 60) errors.push({ field: "category", message: "Category must be 60 characters or fewer." });
  const author = oneLine(body.author) || "KNC Horizon";
  if (author.length > 80) errors.push({ field: "author", message: "Author must be 80 characters or fewer." });
  const featuredImage = oneLine(body.featuredImage);
  if (featuredImage && !isImageRef(featuredImage)) errors.push({ field: "featuredImage", message: "Featured image must be an https:// URL or a site path such as /images/photo.jpg." });
  const status = ARTICLE_STATUSES.find((value) => value === body.status) ?? "draft";

  const slug = slugResult.slug;
  if (slug && (await queryOne(`select id from posts where slug = $1 and id <> $2`, [slug, existing?.id ?? ""]))) {
    errors.push({ field: "slug", message: `Another article already uses the slug "${slug}".` });
  }
  if (errors.length) return invalid(res, errors);

  // Publishing rights are checked here, not only in the console.
  const wasLive = existing ? articleStatus(existing) === "published" : false;
  if (!req.user!.canPublishArticles) {
    if (status === "published" && !wasLive) {
      return res.status(403).json({ message: "You can save a draft or submit it for review. An administrator publishes it." });
    }
    if (wasLive && status !== "published") {
      return res.status(403).json({ message: "Only an administrator can take a published article offline." });
    }
    if (wasLive && existing) {
      const articleChanged =
        title !== oneLine(existing.title) ||
        content !== (existing.content ?? "").trim() ||
        excerpt !== oneLine(existing.excerpt) ||
        category !== (oneLine(existing.category) || "General") ||
        author !== (oneLine(existing.author) || "KNC Horizon") ||
        featuredImage !== oneLine(existing.featured_image || existing.image);
      if (articleChanged) {
        return res.status(403).json({ message: "This article is live. You can change its SEO fields; changes to the article itself need an administrator." });
      }
    }
  }

  const published = status === "published";
  const columns = [title, slug, excerpt, content, category, author, featuredImage || null, status, published, seo.seoTitle, seo.metaDescription];
  let row: PostRow | undefined;
  if (existing) {
    row = await queryOne<PostRow>(
      `update posts set title = $1, slug = $2, excerpt = $3, content = $4, category = $5, author = $6,
              featured_image = $7, image = coalesce($7, ''), status = $8, published = $9,
              published_at = case when $9::boolean and not $12::boolean then now() else published_at end,
              seo_title = $10, seo_description = $11, updated_at = now()
        where id = $13 returning *`,
      [...columns, wasLive, existing.id],
    );
    if (wasLive && existing.slug !== slug) {
      await rememberPreviousSlug({ column: "post_id", value: existing.id }, existing.slug, slug!, req.user!.id);
    }
  } else {
    row = await queryOne<PostRow>(
      `insert into posts (title, slug, excerpt, content, category, author, featured_image, image, status, published,
                          seo_title, seo_description, published_at, created_at, updated_at)
       values ($1, $2, $3, $4, $5, $6, $7, coalesce($7, ''), $8, $9, $10, $11, now(), now(), now())
       returning *`,
      columns,
    );
  }
  const seoRow = await upsertSeo({ column: "post_id", value: row!.id }, seo, req.user!.id);
  return res.status(existing ? 200 : 201).json({ article: articleToApi(row!), seo: seoToApi(seoRow) });
}

router.post("/seo/articles", handle(async (req, res) => saveArticle(req, res)));

router.put("/seo/articles/:id", handle(async (req, res) => {
  const id = String(req.params.id);
  if (!isId(id)) return res.status(400).json({ message: "Invalid article id." });
  const existing = await queryOne<PostRow>(`select * from posts where id = $1`, [id]);
  if (!existing) return res.status(404).json({ message: "Article not found." });
  return saveArticle(req, res, existing);
}));

/* ---- images for articles and OG images ---- */

router.get("/seo/media", handle(async (_req, res) => {
  const rows = await query(`select id, url, filename, created_at from media order by created_at desc limit 300`);
  return res.json({ items: rows.map((row) => ({ id: row.id, url: row.url, filename: row.filename, createdAt: row.created_at })) });
}));

router.post("/seo/uploads", upload.single("image"), handleImageUpload);

/* ---- site-wide SEO settings ---- */

router.put("/seo/settings", handle(async (req, res) => {
  const { patch, errors } = parseSeoSettings(req.body);
  if (errors.length) return invalid(res, errors);
  const current = await readSeoSettings();
  // The canonical domain decides what Google indexes; only an administrator changes it.
  if (patch.siteUrl !== undefined && patch.siteUrl !== current.siteUrl && req.user!.role !== "admin") {
    return res.status(403).json({ message: "Only an administrator can change the site address." });
  }
  return res.json({ settings: await writeSeoSettings(patch, req.user!.id) });
}));

/* ================================================================== SEO manager accounts */

router.use("/admin/seo-managers", requireSuperAdmin);

const MANAGER_COLUMNS = "id, name, email, is_active, can_publish_articles, created_at, updated_at";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function managerToApi(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name ?? "",
    email: row.email,
    isActive: row.is_active !== false,
    canPublishArticles: row.can_publish_articles === true,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? null,
  };
}

async function parseManager(body: Record<string, unknown>, id?: string) {
  const errors: FieldError[] = [];
  const values: { name?: string; email?: string; passwordHash?: string; isActive?: boolean; canPublishArticles?: boolean } = {};
  const creating = !id;
  if (creating || "name" in body) {
    const name = oneLine(body.name);
    if (name.length < 2 || name.length > 80) errors.push({ field: "name", message: "Name must be between 2 and 80 characters." });
    else values.name = name;
  }
  if (creating || "email" in body) {
    const email = oneLine(body.email).toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 160) errors.push({ field: "email", message: "Enter a valid email address." });
    else if (await queryOne(`select id from users where lower(email) = $1 and id <> $2`, [email, id ?? ""])) {
      errors.push({ field: "email", message: "Another account already uses this email." });
    } else values.email = email;
  }
  if (creating || (typeof body.password === "string" && body.password.length > 0)) {
    const password = typeof body.password === "string" ? body.password : "";
    if (password.length < 10 || password.length > 128 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      errors.push({ field: "password", message: "Password must be at least 10 characters and include a letter and a number." });
    } else values.passwordHash = await bcrypt.hash(password, 12);
  }
  if ("isActive" in body) values.isActive = body.isActive === true;
  if ("canPublishArticles" in body) values.canPublishArticles = body.canPublishArticles === true;
  return { values, errors };
}

router.get("/admin/seo-managers", handle(async (_req, res) => {
  const rows = await query(`select ${MANAGER_COLUMNS} from users where role = 'seo_manager' order by created_at desc`);
  return res.json({ managers: rows.map(managerToApi) });
}));

router.post("/admin/seo-managers", handle(async (req, res) => {
  const { values, errors } = await parseManager((req.body ?? {}) as Record<string, unknown>);
  if (errors.length) return invalid(res, errors);
  const row = await queryOne(
    `insert into users (name, email, password_hash, role, is_active, can_publish_articles, created_at, updated_at)
     values ($1, $2, $3, 'seo_manager', $4, $5, now(), now()) returning ${MANAGER_COLUMNS}`,
    [values.name, values.email, values.passwordHash, values.isActive ?? true, values.canPublishArticles ?? false],
  );
  return res.status(201).json({ manager: managerToApi(row!) });
}));

router.patch("/admin/seo-managers/:id", handle(async (req, res) => {
  const id = String(req.params.id);
  if (!isId(id)) return res.status(400).json({ message: "Invalid account id." });
  const current = await queryOne(`select id from users where id = $1 and role = 'seo_manager'`, [id]);
  if (!current) return res.status(404).json({ message: "SEO manager not found." });
  const { values, errors } = await parseManager((req.body ?? {}) as Record<string, unknown>, id);
  if (errors.length) return invalid(res, errors);
  const row = await queryOne(
    `update users set name = coalesce($1, name), email = coalesce($2, email), password_hash = coalesce($3, password_hash),
            is_active = coalesce($4, is_active), can_publish_articles = coalesce($5, can_publish_articles), updated_at = now()
      where id = $6 and role = 'seo_manager' returning ${MANAGER_COLUMNS}`,
    [values.name ?? null, values.email ?? null, values.passwordHash ?? null, values.isActive ?? null, values.canPublishArticles ?? null, id],
  );
  return res.json({ manager: managerToApi(row!) });
}));

router.delete("/admin/seo-managers/:id", handle(async (req, res) => {
  const id = String(req.params.id);
  if (!isId(id)) return res.status(400).json({ message: "Invalid account id." });
  const row = await queryOne(`delete from users where id = $1 and role = 'seo_manager' returning id`, [id]);
  if (!row) return res.status(404).json({ message: "SEO manager not found." });
  return res.status(204).send();
}));

export default router;
