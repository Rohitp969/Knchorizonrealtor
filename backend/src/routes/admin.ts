import { Router } from "express";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import { requireAdmin } from "../lib/auth.ts";
import { count, isId, query, queryOne } from "../lib/postgres.ts";
import {
  contains,
  deleteRow,
  findById,
  insertRow,
  listAll,
  toApi,
  toApiList,
  updateRow,
  type TableName,
} from "../lib/repositories.ts";
import type { BlogPostDoc, DeveloperDoc, ProjectDoc, PropertyDoc, UserDoc } from "../lib/models.ts";
import { mailStatus } from "../lib/mailer.ts";
import { readSettings, SUPPORTED_CURRENCIES, validateSettings, writeSettings } from "../lib/settings.ts";

const router = Router();
router.use(requireAdmin);

const uploadDir = path.resolve(process.cwd(), "artifacts/api-server/uploads");
const upload = multer({
  storage: multer.diskStorage({
    destination: async (_req, _file, callback) => {
      await mkdir(uploadDir, { recursive: true });
      callback(null, uploadDir);
    },
    filename: (_req, file, callback) => callback(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "-")}`),
  }),
  fileFilter: (_req, file, callback) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowed.includes(file.mimetype.toLowerCase())) {
      return callback(new Error("Unsupported file format. Please upload a JPG, PNG, or WEBP image."));
    }
    callback(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

function cleanBody(body: Record<string, unknown>) {
  const { _id, id, createdAt, updatedAt, ...rest } = body;
  return { ...rest, updatedAt: new Date() };
}

/** The tables the generic admin resource routes may touch, and how each one is ordered. */
const RESOURCES: Record<string, { table: TableName; order: string }> = {
  properties: { table: "properties", order: "updated_at desc, created_at desc" },
  projects: { table: "projects", order: "updated_at desc, created_at desc" },
  posts: { table: "posts", order: "updated_at desc, created_at desc" },
  gallery: { table: "gallery", order: "created_at desc" },
  testimonials: { table: "testimonials", order: "created_at desc" },
  users: { table: "users", order: "created_at desc" },
  developers: { table: "developers", order: "sort_order asc, name asc" },
  communities: { table: "communities", order: "sort_order asc, name asc" },
  insights: { table: "insights", order: "updated_at desc, created_at desc" },
  content: { table: "gallery", order: "created_at desc" },
  subscribers: { table: "newsletter", order: "created_at desc" },
};

function resourceFor(name: string) {
  return RESOURCES[name];
}

function blogBody(body: Record<string, unknown>, existing?: BlogPostDoc) {
  const title = typeof body.title === "string" ? body.title.trim() : existing?.title;
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : existing?.slug;
  const content = typeof body.content === "string" ? body.content.trim() : existing?.content;
  if (!title || !slug || !content) return undefined;
  const status = body.status === "draft" ? "draft" : body.status === "published" || body.published === true ? "published" : existing?.status ?? (existing?.published ? "published" : "draft");
  const now = new Date();
  return {
    title, slug, content,
    excerpt: typeof body.excerpt === "string" ? body.excerpt.trim() : existing?.excerpt ?? "",
    featuredImage: typeof body.featuredImage === "string" ? body.featuredImage.trim() : existing?.featuredImage ?? (typeof body.image === "string" ? body.image : existing?.image ?? ""),
    image: typeof body.image === "string" ? body.image.trim() : existing?.image ?? (typeof body.featuredImage === "string" ? body.featuredImage : ""),
    category: typeof body.category === "string" ? body.category.trim() : existing?.category ?? "General",
    author: typeof body.author === "string" ? body.author.trim() : existing?.author ?? "KNC Horizon",
    status,
    published: status === "published",
    publishedAt: body.publishedAt ? new Date(String(body.publishedAt)) : existing?.publishedAt ?? now,
    seoTitle: typeof body.seoTitle === "string" ? body.seoTitle.trim() : existing?.seoTitle ?? title,
    seoDescription: typeof body.seoDescription === "string" ? body.seoDescription.trim() : existing?.seoDescription ?? (typeof body.excerpt === "string" ? body.excerpt.trim() : existing?.excerpt ?? ""),
    updatedAt: now,
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseAreas(areasInput: unknown): string[] {
  if (Array.isArray(areasInput)) {
    return areasInput.map((a) => String(a).trim()).filter(Boolean);
  }
  if (typeof areasInput === "string") {
    return areasInput.split(",").map((a) => a.trim()).filter(Boolean);
  }
  return [];
}

function developerBody(body: Record<string, unknown>, existing?: DeveloperDoc) {
  const name = typeof body.name === "string" ? body.name.trim() : existing?.name;
  if (!name) return undefined;
  const rawSlug = typeof body.slug === "string" && body.slug.trim() ? body.slug.trim() : existing?.slug ?? slugify(name);
  const slug = slugify(rawSlug);
  const description = typeof body.description === "string" ? body.description.trim() : existing?.description ?? "";
  const shortDescription = typeof body.shortDescription === "string" ? body.shortDescription.trim() : existing?.shortDescription;
  const logo = typeof body.logo === "string" ? body.logo.trim() : existing?.logo;
  const coverImage = typeof body.coverImage === "string" ? body.coverImage.trim() : existing?.coverImage;
  const officialWebsite = typeof body.officialWebsite === "string" ? body.officialWebsite.trim() : existing?.officialWebsite ?? (typeof body.website === "string" ? body.website.trim() : existing?.website);
  const published = typeof body.published === "boolean" ? body.published : existing?.published ?? true;
  const featured = typeof body.featured === "boolean" ? body.featured : existing?.featured ?? false;
  const sortOrder = body.sortOrder !== undefined && Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : existing?.sortOrder ?? 0;
  const areas = body.areas !== undefined ? parseAreas(body.areas) : existing?.areas ?? [];
  const established = typeof body.established === "string" ? body.established.trim() : existing?.established;
  const now = new Date();

  return {
    name,
    slug,
    shortDescription,
    description,
    logo,
    coverImage,
    officialWebsite,
    website: officialWebsite,
    published,
    featured,
    sortOrder,
    areas,
    established,
    updatedAt: now,
  };
}

function propertyBody(body: Record<string, unknown>, _unknown?: unknown, existing?: PropertyDoc) {
  const title = typeof body.title === "string" ? body.title.trim() : existing?.title;
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : existing?.slug;
  const location = typeof body.location === "string" ? body.location.trim() : existing?.location ?? "";
  const community = typeof body.community === "string" ? body.community.trim() : existing?.community ?? "";
  const type = typeof body.type === "string" ? body.type.trim() : existing?.type ?? "residential";
  const status = typeof body.status === "string" ? body.status.trim() : existing?.status ?? "available";
  const price = typeof body.price === "number" ? body.price : existing?.price ?? 0;
  const currency = typeof body.currency === "string" ? body.currency.trim() : existing?.currency ?? "AED";
  const bedrooms = typeof body.bedrooms === "number" ? body.bedrooms : existing?.bedrooms ?? 1;
  const bathrooms = typeof body.bathrooms === "number" ? body.bathrooms : existing?.bathrooms ?? 1;
  const size = typeof body.size === "number" ? body.size : existing?.size ?? 0;
  const description = typeof body.description === "string" ? body.description.trim() : existing?.description ?? "";
  const images = Array.isArray(body.images) ? body.images.map(String) : existing?.images ?? [];
  const amenities = Array.isArray(body.amenities) ? body.amenities.map(String) : existing?.amenities ?? [];
  const featured = typeof body.featured === "boolean" ? body.featured : existing?.featured ?? false;
  const published = typeof body.published === "boolean" ? body.published : existing?.published ?? false;
  // listingType drives the Buy/Rent split in the public search, so an edit must keep it.
  const listingType = typeof body.listingType === "string" ? body.listingType.trim() : existing?.listingType;
  if (!title || !slug) return undefined;
  const now = new Date();
  return {
    title,
    slug,
    location,
    community,
    type,
    listingType,
    status,
    price,
    currency,
    bedrooms,
    bathrooms,
    size,
    description,
    images,
    amenities,
    featured,
    published,
    updatedAt: now,
  };
}

function projectBody(body: Record<string, unknown>, _unknown?: unknown, existing?: ProjectDoc) {
  const title = typeof body.title === "string" ? body.title.trim() : existing?.title;
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : existing?.slug;
  const description = typeof body.description === "string" ? body.description.trim() : existing?.description ?? "";
  const developer = typeof body.developer === "string" ? body.developer.trim() : existing?.developer ?? "";
  const location = typeof body.location === "string" ? body.location.trim() : existing?.location ?? "";
  const startingPrice = typeof body.startingPrice === "number" ? body.startingPrice : existing?.startingPrice ?? 0;
  const handover = typeof body.handover === "string" ? body.handover.trim() : existing?.handover ?? "";
  const image = typeof body.image === "string" ? body.image.trim() : existing?.image ?? "";
  const coverImage = typeof body.coverImage === "string" ? body.coverImage.trim() : existing?.coverImage ?? "";
  const gallery = Array.isArray(body.gallery) ? body.gallery.map(String) : existing?.gallery ?? [];
  const amenities = Array.isArray(body.amenities) ? body.amenities.map(String) : existing?.amenities ?? [];
  const highlights = Array.isArray(body.highlights) ? body.highlights.map(String) : existing?.highlights ?? [];
  // These were missing, so editing a project through the admin silently dropped its
  // category, status and launch flags - the same fields the public filters read.
  const category = typeof body.category === "string" ? body.category.trim() : existing?.category ?? "";
  const status = typeof body.status === "string" ? body.status.trim() : existing?.status ?? "";
  const completionDate = typeof body.completionDate === "string" ? body.completionDate.trim() : existing?.completionDate ?? "";
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : existing?.imageUrl ?? "";
  const imagePath = typeof body.imagePath === "string" ? body.imagePath.trim() : existing?.imagePath ?? "";
  const newLaunch = typeof body.newLaunch === "boolean" ? body.newLaunch : existing?.newLaunch ?? false;
  const offPlan = typeof body.offPlan === "boolean" ? body.offPlan : existing?.offPlan ?? false;
  const featured = typeof body.featured === "boolean" ? body.featured : existing?.featured ?? false;
  const published = typeof body.published === "boolean" ? body.published : existing?.published ?? false;
  if (!title || !slug) return undefined;
  const now = new Date();
  return {
    title,
    slug,
    description,
    developer,
    location,
    category,
    status,
    completionDate,
    startingPrice,
    handover,
    image,
    imageUrl,
    imagePath,
    coverImage,
    gallery,
    amenities,
    highlights,
    newLaunch,
    offPlan,
    featured,
    published,
    updatedAt: now,
  };
}

/**
 * Keeps projects.developer_slug in step with the developer name an admin typed, so the
 * foreign key stays true after every write without the admin having to pick from a list.
 */
async function linkProjectDeveloper(projectId: string) {
  await query(
    `update projects p
        set developer_slug = d.slug
       from developers d
      where p.id = $1
        and (
             lower(btrim(p.developer)) = lower(d.name)
          or lower(btrim(p.developer)) = lower(regexp_replace(d.name, '\\s+(Properties|Realty)$', '', 'i'))
          or lower(btrim(p.developer)) = lower(d.slug)
        )`,
    [projectId],
  );
  // A developer that no longer matches any profile loses the link rather than keeping a stale one.
  await query(
    `update projects p
        set developer_slug = null
      where p.id = $1
        and p.developer_slug is not null
        and not exists (
          select 1 from developers d
           where d.slug = p.developer_slug
             and (
                  lower(btrim(p.developer)) = lower(d.name)
               or lower(btrim(p.developer)) = lower(regexp_replace(d.name, '\\s+(Properties|Realty)$', '', 'i'))
               or lower(btrim(p.developer)) = lower(d.slug)
             )
        )`,
    [projectId],
  );
}

/*
 * The commercial tile used to look for a type literally called "commercial", so an office or
 * a retail unit never counted. These are the commercial types the public search offers.
 */
const COMMERCIAL_TYPES = ["Office", "Retail", "Shop", "Showroom", "Warehouse", "Staff Accommodation", "Commercial Plot"];

router.get("/admin/dashboard", async (_req, res, next) => {
  try {
    const [
      properties,
      publishedProperties,
      insights,
      forSale,
      forRent,
      commercial,
      projects,
      developers,
      communities,
      posts,
      gallery,
      inquiries,
      totalInquiries,
      subscribers,
      recentInquiries,
    ] = await Promise.all([
      count(`select count(*) from properties`),
      count(`select count(*) from properties where published`),
      count(`select count(*) from insights`),
      // listing_type is absent on older records, so the status text is the fallback.
      count(`select count(*) from properties where listing_type = 'sale' or status ilike '%sale%'`),
      count(`select count(*) from properties where listing_type = 'rent' or status ilike '%rent%'`),
      count(`select count(*) from properties where type = any($1::text[]) or property_type = any($1::text[])`, [COMMERCIAL_TYPES]),
      count(`select count(*) from projects`),
      count(`select count(*) from developers`),
      count(`select count(*) from communities`),
      count(`select count(*) from posts`),
      count(`select count(*) from gallery`),
      count(`select count(*) from inquiries where status = 'new'`),
      count(`select count(*) from inquiries`),
      count(`select count(*) from newsletter`),
      query(`select * from inquiries order by created_at desc limit 6`),
    ]);

    return res.json({
      counts: {
        properties,
        published: publishedProperties,
        forSale,
        forRent,
        commercial,
        projects,
        developers,
        communities,
        posts,
        insights,
        gallery,
        inquiries,
        totalInquiries,
        subscribers,
      },
      recentInquiries: toApiList("inquiries", recentInquiries),
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/admin/inquiries", async (_req, res, next) => {
  try {
    const rows = await query(`select * from inquiries order by created_at desc`);
    return res.json({ inquiries: toApiList("inquiries", rows) });
  } catch (error) {
    return next(error);
  }
});

router.delete("/admin/inquiries/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid inquiry id." });
    if (!(await deleteRow("inquiries", req.params.id))) return res.status(404).json({ message: "Inquiry not found." });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get("/admin/users", async (_req, res, next) => {
  try {
    const rows = await query(`select id, name, email, role, created_at from users order by created_at desc`);
    return res.json({ users: toApiList("users", rows) });
  } catch (error) {
    return next(error);
  }
});

router.patch("/admin/users/:id", async (req, res, next) => {
  try {
    const role = (req.body as { role?: UserDoc["role"] }).role;
    if (!isId(req.params.id) || !role || !["admin", "agent", "user"].includes(role)) return res.status(400).json({ message: "A valid user id and role are required." });
    const row = await queryOne(
      `update users set role = $1 where id = $2 returning id, name, email, role, created_at`,
      [role, req.params.id],
    );
    if (!row) return res.status(404).json({ message: "User not found." });
    return res.json({ user: toApi("users", row) });
  } catch (error) {
    return next(error);
  }
});

router.patch("/admin/inquiries/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid inquiry id." });
    const status = (req.body as { status?: "new" | "contacted" | "closed" }).status;
    if (!status || !["new", "contacted", "closed"].includes(status)) return res.status(400).json({ message: "Invalid inquiry status." });
    const row = await queryOne(`update inquiries set status = $1 where id = $2 returning *`, [status, req.params.id]);
    if (!row) return res.status(404).json({ message: "Inquiry not found." });
    return res.json({ inquiry: toApi("inquiries", row) });
  } catch (error) {
    return next(error);
  }
});

router.get("/admin/blog", async (_req, res, next) => {
  try {
    const rows = await listAll("posts", "updated_at desc, created_at desc");
    return res.json({ posts: toApiList("posts", rows) });
  } catch (error) { return next(error); }
});

router.post("/admin/blog", async (req, res, next) => {
  try {
    const document = blogBody(req.body as Record<string, unknown>);
    if (!document) return res.status(400).json({ message: "Title, slug, and content are required." });
    const row = await insertRow("posts", { ...document, createdAt: new Date() });
    return res.status(201).json({ post: toApi("posts", row) });
  } catch (error) { return next(error); }
});

router.patch("/admin/blog/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid blog id." });
    const existing = await findById("posts", req.params.id);
    if (!existing) return res.status(404).json({ message: "Blog post not found." });
    const document = blogBody(req.body as Record<string, unknown>, toApi("posts", existing) as unknown as BlogPostDoc);
    if (!document) return res.status(400).json({ message: "Title, slug, and content are required." });
    const row = await updateRow("posts", req.params.id, document);
    return res.json({ post: toApi("posts", row) });
  } catch (error) { return next(error); }
});

router.delete("/admin/blog/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid blog id." });
    if (!(await deleteRow("posts", req.params.id))) return res.status(404).json({ message: "Blog post not found." });
    return res.status(204).send();
  } catch (error) { return next(error); }
});

router.post("/blogs", async (req, res, next) => {
  try {
    const document = blogBody(req.body as Record<string, unknown>);
    if (!document) return res.status(400).json({ message: "Title, slug, and content are required." });
    const row = await insertRow("posts", { ...document, createdAt: new Date() });
    return res.status(201).json({ blog: toApi("posts", row) });
  } catch (error) { return next(error); }
});

router.put("/blogs/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid blog id." });
    const existing = await findById("posts", req.params.id);
    if (!existing) return res.status(404).json({ message: "Blog post not found." });
    const document = blogBody(req.body as Record<string, unknown>, toApi("posts", existing) as unknown as BlogPostDoc);
    if (!document) return res.status(400).json({ message: "Title, slug, and content are required." });
    const row = await updateRow("posts", req.params.id, document);
    return res.json({ blog: toApi("posts", row) });
  } catch (error) { return next(error); }
});

router.delete("/blogs/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid blog id." });
    if (!(await deleteRow("posts", req.params.id))) return res.status(404).json({ message: "Blog post not found." });
    return res.status(204).send();
  } catch (error) { return next(error); }
});

router.get("/admin/developers-detail", async (_req, res, next) => {
  try {
    /*
     * Each developer with the projects assigned to it. The join uses the resolved
     * developer_slug first and still accepts a hand-typed name, so a project that has not
     * been linked yet is not reported as unassigned.
     */
    const developers = await query(`select * from developers order by sort_order asc, name asc`);
    const projects = await query<{ title: string; slug: string; developer: string; developer_slug: string | null }>(
      `select title, slug, developer, developer_slug from projects`,
    );

    const items = developers.map((dev) => {
      const name = String(dev.name ?? "");
      const slug = String(dev.slug ?? "");
      const shortName = name.replace(/\s+(Properties|Realty)$/i, "").trim().toLowerCase();
      const assigned = projects.filter((project) => {
        if (project.developer_slug && project.developer_slug === slug) return true;
        const typed = (project.developer || "").toLowerCase().trim();
        return typed === name.toLowerCase() || typed === shortName || typed === slug.toLowerCase();
      });
      return {
        ...(toApi("developers", dev) as Record<string, unknown>),
        projectCount: assigned.length,
        projects: assigned.map((project) => ({ title: project.title, slug: project.slug })),
      };
    });

    return res.json({ developers: items, items });
  } catch (error) {
    return next(error);
  }
});

router.post(["/developers", "/admin/developers"], async (req, res, next) => {
  try {
    const document = developerBody(req.body as Record<string, unknown>);
    if (!document) return res.status(400).json({ message: "Developer name is required." });
    const row = await insertRow("developers", { ...document, createdAt: new Date() });
    // A new profile may be the missing half of projects that already name it.
    await query(
      `update projects p set developer_slug = d.slug from developers d
        where d.id = $1 and p.developer_slug is null
          and (
               lower(btrim(p.developer)) = lower(d.name)
            or lower(btrim(p.developer)) = lower(regexp_replace(d.name, '\\s+(Properties|Realty)$', '', 'i'))
            or lower(btrim(p.developer)) = lower(d.slug)
          )`,
      [row?.id],
    );
    return res.status(201).json({ item: toApi("developers", row) });
  } catch (error) {
    return next(error);
  }
});

async function saveDeveloper(req: import("express").Request, res: import("express").Response) {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!isId(rawId)) return res.status(400).json({ message: "Invalid developer id." });
  const existing = await findById("developers", rawId);
  if (!existing) return res.status(404).json({ message: "Developer not found." });
  const document = developerBody(req.body as Record<string, unknown>, toApi("developers", existing) as unknown as DeveloperDoc);
  if (!document) return res.status(400).json({ message: "Developer name is required." });
  const row = await updateRow("developers", rawId, document);
  return res.json({ item: toApi("developers", row) });
}

router.put(["/developers/:id", "/admin/developers/:id"], async (req, res, next) => {
  try { return await saveDeveloper(req, res); } catch (error) { return next(error); }
});

router.patch(["/developers/:id", "/admin/developers/:id"], async (req, res, next) => {
  try { return await saveDeveloper(req, res); } catch (error) { return next(error); }
});

router.delete(["/developers/:id", "/admin/developers/:id"], async (req, res, next) => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!isId(rawId)) return res.status(400).json({ message: "Invalid developer id." });
    // projects.developer_slug is ON DELETE SET NULL, so the projects survive with their
    // developer name intact and simply lose the resolved link.
    if (!(await deleteRow("developers", rawId))) return res.status(404).json({ message: "Developer not found." });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get("/admin/developers/:id/projects", async (req, res, next) => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!isId(rawId)) return res.status(400).json({ message: "Invalid developer id." });
    const developer = await queryOne<{ slug: string; name: string }>(`select * from developers where id = $1`, [rawId]);
    if (!developer) return res.status(404).json({ message: "Developer not found." });

    const projects = await query(
      `select * from projects
        where developer_slug = $1
           or lower(btrim(developer)) = lower($2)
           or lower(btrim(developer)) = lower(regexp_replace($2, '\\s+(Properties|Realty)$', '', 'i'))
           or lower(btrim(developer)) = lower($1)`,
      [developer.slug, developer.name],
    );

    return res.json({ projects: toApiList("projects", projects) });
  } catch (error) {
    return next(error);
  }
});

/*
 * Image upload: the file goes to Cloudinary and is recorded in the media library. Shared with
 * the SEO console (routes/seo.ts), which mounts the same handler behind its own role check.
 */
export async function handleImageUpload(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) {
  if (!req.file) return res.status(400).json({ message: "An image file is required." });
  try {
    const { uploadToCloudinary } = await import("../lib/cloudinary.ts");
    const folder = typeof req.body.folder === "string" ? req.body.folder : "knc-horizon";
    const result = await uploadToCloudinary(req.file.path, folder);
    // Store in the media table for the Media Library
    await insertRow("media", {
      url: result.url,
      publicId: result.publicId,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      folder,
      createdAt: new Date(),
    });
    // Clean up temp file
    const { unlink } = await import("node:fs/promises");
    await unlink(req.file.path).catch(() => {});
    return res.status(201).json({ url: result.url, publicId: result.publicId, filename: req.file.originalname });
  } catch (error: any) {
    // Fallback to local URL if Cloudinary fails
    if (error.message?.includes("Missing Cloudinary")) {
      return res.status(201).json({ url: `/api/uploads/${req.file.filename}`, filename: req.file.filename, warning: error.message });
    }
    return next(error);
  }
}

router.post("/admin/uploads", upload.single("image"), handleImageUpload);

// Media library routes
router.get("/admin/media", async (_req, res, next) => {
  try {
    const rows = await listAll("media", "created_at desc");
    return res.json({ items: toApiList("media", rows) });
  } catch (error) { return next(error); }
});

router.delete("/admin/media/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid media id." });
    const row = await queryOne<{ public_id: string | null }>(`select * from media where id = $1`, [req.params.id]);
    if (!row) return res.status(404).json({ message: "Media not found." });
    if (row.public_id) {
      try {
        const { deleteFromCloudinary } = await import("../lib/cloudinary.ts");
        await deleteFromCloudinary(row.public_id);
      } catch { /* ignore cloudinary delete errors */ }
    }
    await deleteRow("media", req.params.id);
    return res.status(204).send();
  } catch (error) { return next(error); }
});

// Communities CRUD
function communityBody(body: Record<string, unknown>) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return undefined;
  const slug = typeof body.slug === "string" && body.slug.trim() ? slugify(body.slug) : slugify(name);
  return {
    name,
    slug,
    description: typeof body.description === "string" ? body.description.trim() : "",
    shortDescription: typeof body.shortDescription === "string" ? body.shortDescription.trim() : "",
    location: typeof body.location === "string" ? body.location.trim() : "",
    image: typeof body.image === "string" ? body.image.trim() : "",
    published: typeof body.published === "boolean" ? body.published : true,
    featured: typeof body.featured === "boolean" ? body.featured : false,
    sortOrder: Number(body.sortOrder) || 0,
    updatedAt: new Date(),
  };
}

router.get("/admin/communities-list", async (_req, res, next) => {
  try {
    const rows = await listAll("communities", "sort_order asc, name asc");
    return res.json({ items: toApiList("communities", rows) });
  } catch (error) { return next(error); }
});

router.post("/admin/communities", async (req, res, next) => {
  try {
    const document = communityBody(req.body as Record<string, unknown>);
    if (!document) return res.status(400).json({ message: "Community name is required." });
    const row = await insertRow("communities", { ...document, createdAt: new Date() });
    return res.status(201).json({ item: toApi("communities", row) });
  } catch (error) { return next(error); }
});

router.put("/admin/communities/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid community id." });
    const document = communityBody(req.body as Record<string, unknown>);
    if (!document) return res.status(400).json({ message: "Community name is required." });
    if (!(await findById("communities", req.params.id))) return res.status(404).json({ message: "Community not found." });
    const row = await updateRow("communities", req.params.id, document);
    return res.json({ item: toApi("communities", row) });
  } catch (error) { return next(error); }
});

router.delete("/admin/communities/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid community id." });
    if (!(await deleteRow("communities", req.params.id))) return res.status(404).json({ message: "Community not found." });
    return res.status(204).send();
  } catch (error) { return next(error); }
});

// Market Insights CRUD
function insightBody(body: Record<string, unknown>) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return undefined;
  const slug = typeof body.slug === "string" && body.slug.trim() ? slugify(body.slug) : slugify(title);
  return {
    title,
    slug,
    category: typeof body.category === "string" ? body.category.trim() : "General",
    summary: typeof body.summary === "string" ? body.summary.trim() : "",
    content: typeof body.content === "string" ? body.content.trim() : "",
    source: typeof body.source === "string" ? body.source.trim() : "",
    sourceUrl: typeof body.sourceUrl === "string" ? body.sourceUrl.trim() : "",
    image: typeof body.image === "string" ? body.image.trim() : "",
    published: typeof body.published === "boolean" ? body.published : false,
    featured: typeof body.featured === "boolean" ? body.featured : false,
    sortOrder: Number(body.sortOrder) || 0,
    updatedAt: new Date(),
  };
}

router.get("/admin/insights-list", async (_req, res, next) => {
  try {
    const rows = await listAll("insights", "updated_at desc, created_at desc");
    return res.json({ items: toApiList("insights", rows) });
  } catch (error) { return next(error); }
});

router.post("/admin/insights", async (req, res, next) => {
  try {
    const document = insightBody(req.body as Record<string, unknown>);
    if (!document) return res.status(400).json({ message: "Insight title is required." });
    const row = await insertRow("insights", { ...document, createdAt: new Date() });
    return res.status(201).json({ item: toApi("insights", row) });
  } catch (error) { return next(error); }
});

router.put("/admin/insights/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid insight id." });
    const document = insightBody(req.body as Record<string, unknown>);
    if (!document) return res.status(400).json({ message: "Insight title is required." });
    if (!(await findById("insights", req.params.id))) return res.status(404).json({ message: "Insight not found." });
    const row = await updateRow("insights", req.params.id, document);
    return res.json({ item: toApi("insights", row) });
  } catch (error) { return next(error); }
});

router.delete("/admin/insights/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid insight id." });
    if (!(await deleteRow("insights", req.params.id))) return res.status(404).json({ message: "Insight not found." });
    return res.status(204).send();
  } catch (error) { return next(error); }
});

// Properties CRUD
router.get("/admin/properties-list", async (req, res, next) => {
  try {
    const { q, status, type } = req.query as Record<string, string | undefined>;
    const clauses: string[] = [];
    const values: unknown[] = [];
    if (q) {
      values.push(contains(q));
      clauses.push(`(title ilike $${values.length} or location ilike $${values.length} or community ilike $${values.length})`);
    }
    if (status === "published") clauses.push("published");
    if (status === "draft") clauses.push("not published");
    if (type) {
      values.push(contains(type));
      clauses.push(`type ilike $${values.length}`);
    }
    const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
    const rows = await query(`select * from properties ${where} order by updated_at desc, created_at desc`, values);
    return res.json({ items: toApiList("properties", rows) });
  } catch (error) { return next(error); }
});

router.post("/admin/properties", async (req, res, next) => {
  try {
    const document = propertyBody(req.body as Record<string, unknown>);
    if (!document) return res.status(400).json({ message: "Title and slug are required." });
    const row = await insertRow("properties", { ...document, createdAt: new Date() });
    return res.status(201).json({ item: toApi("properties", row) });
  } catch (error) { return next(error); }
});

router.put("/admin/properties/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid property id." });
    const existing = await findById("properties", req.params.id);
    if (!existing) return res.status(404).json({ message: "Property not found." });
    const document = propertyBody(req.body as Record<string, unknown>, undefined, toApi("properties", existing) as unknown as PropertyDoc);
    if (!document) return res.status(400).json({ message: "Title and slug are required." });
    const row = await updateRow("properties", req.params.id, document);
    return res.json({ item: toApi("properties", row) });
  } catch (error) { return next(error); }
});

router.delete("/admin/properties/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid property id." });
    if (!(await deleteRow("properties", req.params.id))) return res.status(404).json({ message: "Property not found." });
    return res.status(204).send();
  } catch (error) { return next(error); }
});

// Projects CRUD
router.get("/admin/projects-list", async (req, res, next) => {
  try {
    const { q, developer: devFilter } = req.query as Record<string, string | undefined>;
    const clauses: string[] = [];
    const values: unknown[] = [];
    if (q) {
      values.push(contains(q));
      clauses.push(`(title ilike $${values.length} or location ilike $${values.length} or developer ilike $${values.length})`);
    }
    if (devFilter) {
      values.push(contains(devFilter));
      clauses.push(`developer ilike $${values.length}`);
    }
    const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
    const rows = await query(`select * from projects ${where} order by updated_at desc, created_at desc`, values);
    return res.json({ items: toApiList("projects", rows) });
  } catch (error) { return next(error); }
});

router.post("/admin/projects", async (req, res, next) => {
  try {
    const document = projectBody(req.body as Record<string, unknown>);
    if (!document) return res.status(400).json({ message: "Title and slug are required." });
    const row = await insertRow("projects", { ...document, createdAt: new Date() });
    if (row?.id) await linkProjectDeveloper(String(row.id));
    return res.status(201).json({ item: toApi("projects", await findById("projects", String(row?.id))) });
  } catch (error) { return next(error); }
});

router.put("/admin/projects/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid project id." });
    const existing = await findById("projects", req.params.id);
    if (!existing) return res.status(404).json({ message: "Project not found." });
    const document = projectBody(req.body as Record<string, unknown>, undefined, toApi("projects", existing) as unknown as ProjectDoc);
    if (!document) return res.status(400).json({ message: "Title and slug are required." });
    await updateRow("projects", req.params.id, document);
    await linkProjectDeveloper(req.params.id);
    return res.json({ item: toApi("projects", await findById("projects", req.params.id)) });
  } catch (error) { return next(error); }
});

router.delete("/admin/projects/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid project id." });
    if (!(await deleteRow("projects", req.params.id))) return res.status(404).json({ message: "Project not found." });
    return res.status(204).send();
  } catch (error) { return next(error); }
});

// Gallery CRUD
function galleryBody(body: Record<string, unknown>) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const image = typeof body.image === "string" ? body.image.trim() : "";
  if (!title || !image) return undefined;
  return {
    title,
    image,
    category: typeof body.category === "string" ? body.category.trim() : "General",
    alt: typeof body.alt === "string" ? body.alt.trim() : title,
  };
}

router.get("/admin/gallery-list", async (_req, res, next) => {
  try {
    const rows = await listAll("gallery", "created_at desc");
    return res.json({ items: toApiList("gallery", rows) });
  } catch (error) { return next(error); }
});

router.post("/admin/gallery", async (req, res, next) => {
  try {
    const document = galleryBody(req.body as Record<string, unknown>);
    if (!document) return res.status(400).json({ message: "Title and image URL are required." });
    const row = await insertRow("gallery", { ...document, createdAt: new Date() });
    return res.status(201).json({ item: toApi("gallery", row) });
  } catch (error) { return next(error); }
});

router.put("/admin/gallery/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid gallery id." });
    const document = galleryBody(req.body as Record<string, unknown>);
    if (!document) return res.status(400).json({ message: "Title and image URL are required." });
    if (!(await findById("gallery", req.params.id))) return res.status(404).json({ message: "Gallery item not found." });
    const row = await updateRow("gallery", req.params.id, document);
    return res.json({ item: toApi("gallery", row) });
  } catch (error) { return next(error); }
});

router.delete("/admin/gallery/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid gallery id." });
    if (!(await deleteRow("gallery", req.params.id))) return res.status(404).json({ message: "Gallery item not found." });
    return res.status(204).send();
  } catch (error) { return next(error); }
});

export { upload, uploadDir };

/*
 * Site settings.
 * Deliberately not part of the generic resource map: settings are a single validated
 * document, not a collection, and an unvalidated PATCH is what let "Save settings" store an
 * empty row. `mail` tells the console whether a lead alert could actually be delivered.
 */
router.get("/admin/settings", async (_req, res, next) => {
  try {
    return res.json({ settings: await readSettings(), mail: mailStatus(), currencies: SUPPORTED_CURRENCIES });
  } catch (error) {
    return next(error);
  }
});

router.put("/admin/settings", async (req, res, next) => {
  try {
    const patch = req.body as Record<string, unknown>;
    if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
      return res.status(400).json({ message: "Expected a settings object." });
    }
    const errors = validateSettings(patch);
    if (errors.length) {
      return res.status(400).json({ message: errors[0]!.message, errors });
    }
    const settings = await writeSettings(patch);
    return res.json({ settings, mail: mailStatus(), currencies: SUPPORTED_CURRENCIES });
  } catch (error) {
    return next(error);
  }
});

/*
 * Generic table CRUD. Registered last on purpose: Express matches routes in order,
 * so "/admin/:resource" would otherwise swallow the specific routes above
 * (e.g. /admin/properties-list would be read as a resource named "properties-list").
 */
router.get("/admin/:resource", async (req, res, next) => {
  try {
    const resource = resourceFor(req.params.resource);
    if (!resource) return res.status(404).json({ message: "Unknown admin resource." });
    const rows = await listAll(resource.table, resource.order);
    const items = toApiList(resource.table, rows) as Record<string, unknown>[];
    if (resource.table === "users") for (const item of items) delete item.passwordHash;
    return res.json({ items });
  } catch (error) {
    return next(error);
  }
});

router.post("/admin/:resource", async (req, res, next) => {
  try {
    const resource = resourceFor(req.params.resource);
    if (!resource) return res.status(404).json({ message: "Unknown admin resource." });
    const now = new Date();
    const row = await insertRow(resource.table, { ...cleanBody(req.body as Record<string, unknown>), createdAt: now, updatedAt: now });
    const item = toApi(resource.table, row) as Record<string, unknown> | undefined;
    if (item && resource.table === "users") delete item.passwordHash;
    return res.status(201).json({ item });
  } catch (error) {
    return next(error);
  }
});

router.patch("/admin/:resource/:id", async (req, res, next) => {
  try {
    const resource = resourceFor(req.params.resource);
    if (!resource || !isId(req.params.id)) return res.status(400).json({ message: "Invalid admin resource or id." });
    if (!(await findById(resource.table, req.params.id))) return res.status(404).json({ message: "Record not found." });
    const row = await updateRow(resource.table, req.params.id, cleanBody(req.body as Record<string, unknown>));
    const item = toApi(resource.table, row) as Record<string, unknown> | undefined;
    if (item && resource.table === "users") delete item.passwordHash;
    return res.json({ item });
  } catch (error) {
    return next(error);
  }
});

router.delete("/admin/:resource/:id", async (req, res, next) => {
  try {
    const resource = resourceFor(req.params.resource);
    if (!resource || !isId(req.params.id)) return res.status(400).json({ message: "Invalid admin resource or id." });
    if (!(await deleteRow(resource.table, req.params.id))) return res.status(404).json({ message: "Record not found." });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
