import { Router, type NextFunction, type Request, type Response } from "express";
import path from "node:path";
import multer from "multer";
import { requireAdmin } from "../lib/auth.ts";
import {
  ACCEPTED_IMAGE_LABEL,
  MAX_IMAGE_BYTES,
  MEDIA_FOLDERS,
  MediaError,
  cloudinaryStatus,
  deleteImage,
  detectImageType,
  mediaFolder,
  uploadImage,
} from "../lib/cloudinary.ts";
import { attachPublicIds, cleanAlt, cleanGallery, imageUsage, storedGallery } from "../lib/media.ts";
import { isImageRef } from "../lib/seo.ts";
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
import { sanitizeArticleContent } from "../lib/sanitize-content.ts";
import type { BlogPostDoc, DeveloperDoc, ProjectDoc, PropertyDoc, UserDoc } from "../lib/models.ts";
import { mailStatus, sendTestEmail } from "../lib/mailer.ts";
import { readSettings, SUPPORTED_CURRENCIES, validateSettings, writeSettings } from "../lib/settings.ts";

const router = Router();
router.use(requireAdmin);

/*
 * Images uploaded before Cloudinary were written to this folder. app.ts still serves it at
 * /api/uploads so records pointing there keep working; nothing new is written to it.
 */
const uploadDir = path.resolve(process.cwd(), "artifacts/api-server/uploads");

/*
 * An upload is held in memory and streamed straight to Cloudinary, so nothing depends on the
 * server's disk, which Render wipes at every deploy. The browser's file type is only a first
 * filter; the file's own bytes are checked before anything is sent (detectImageType).
 */
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, callback) => {
    const type = file.mimetype.toLowerCase();
    // Some browsers send HEIC photos as octet-stream; the byte check decides for those.
    if (type.startsWith("image/") || type === "application/octet-stream" || type === "") return callback(null, true);
    return callback(new MediaError(400, `"${file.originalname}" is not an image. Upload a ${ACCEPTED_IMAGE_LABEL} file.`));
  },
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
});

/** Takes one image from the "image" field and answers upload problems with a clear 4xx. */
export function acceptImage(req: Request, res: Response, next: NextFunction) {
  upload.single("image")(req, res, (error: unknown) => {
    if (!error) return next();
    if (error instanceof MediaError) return res.status(error.status).json({ message: error.message });
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: `That image is larger than ${MAX_IMAGE_BYTES / 1024 / 1024} MB. Resize or compress it, then upload again.` });
      }
      if (error.code === "LIMIT_FILE_COUNT" || error.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ message: 'Send one image per upload, in the "image" field.' });
      }
      return res.status(400).json({ message: `The upload could not be read: ${error.message}` });
    }
    return next(error);
  });
}

/** MediaError carries its own status; anything else is a server fault for the error handler. */
function sendError(res: Response, next: NextFunction, error: unknown) {
  if (error instanceof MediaError) return res.status(error.status).json({ message: error.message });
  return next(error);
}

/** An image URL field: undefined when not sent, "" when cleared, otherwise a usable URL. */
function imageField(value: unknown, label: string) {
  if (typeof value !== "string") return undefined;
  const url = value.trim();
  if (url && !isImageRef(url)) throw new MediaError(400, `${label} must be an https:// URL or a site path such as /images/photo.jpg.`);
  return url;
}

function galleryField(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  for (const entry of value) {
    const url = typeof entry === "string" ? entry : (entry as { url?: unknown })?.url;
    if (typeof url === "string" && url.trim() && !isImageRef(url.trim())) {
      throw new MediaError(400, `Gallery image "${url.trim().slice(0, 80)}" must be an https:// URL or a site path such as /images/photo.jpg.`);
    }
  }
  return cleanGallery(value);
}

/*
 * A property shows one cover and a gallery. `images` (cover first, then the gallery) is what
 * the website has always read, so it is rebuilt from the two on every save. A client that
 * still sends only `images` gets its first entry as the cover and the rest as the gallery.
 */
function propertyImages(body: Record<string, unknown>, existing?: PropertyDoc) {
  const existingImages = existing?.images ?? [];
  const existingCover = existing?.coverImage || existingImages[0] || "";
  const existingGallery = storedGallery(existing?.galleryImages, existingImages.filter((url) => url !== existingCover));
  let cover = imageField(body.coverImage, "Cover image");
  let gallery = galleryField(body.galleryImages);
  if (cover === undefined && gallery === undefined && Array.isArray(body.images)) {
    const urls = galleryField(body.images) ?? [];
    cover = urls[0]?.url ?? "";
    gallery = urls.slice(1).map((image) => ({ ...image, alt: existingGallery.find((old) => old.url === image.url)?.alt ?? "" }));
  }
  const coverImage = cover ?? existingCover;
  const galleryImages = (gallery ?? existingGallery).filter((image) => image.url !== coverImage);
  return {
    coverImage,
    coverImageAlt: cleanAlt(body.coverImageAlt) ?? (coverImage === existingCover ? existing?.coverImageAlt ?? "" : ""),
    galleryImages,
    images: [coverImage, ...galleryImages.map((image) => image.url)].filter(Boolean),
  };
}

/*
 * A project's cover is `image`, which every public page reads; coverImage is kept equal to it
 * so the two can never disagree. The gallery is separate from the cover, and `gallery` (plain
 * URLs) is what the project page reads.
 */
function projectImages(body: Record<string, unknown>, existing?: ProjectDoc) {
  const existingCover = existing?.image || existing?.coverImage || "";
  const existingGallery = storedGallery(existing?.galleryImages, existing?.gallery ?? []);
  const cover = imageField(typeof body.image === "string" ? body.image : body.coverImage, "Cover image");
  const gallery = galleryField(body.galleryImages) ?? galleryField(body.gallery);
  const image = cover ?? existingCover;
  const galleryImages = gallery ?? existingGallery;
  return {
    image,
    coverImage: image,
    coverImageAlt: cleanAlt(body.coverImageAlt) ?? (image === existingCover ? existing?.coverImageAlt ?? "" : ""),
    galleryImages,
    gallery: galleryImages.map((entry) => entry.url),
  };
}

/** A short text field: the trimmed value when sent, otherwise what the record already holds. */
function textField(value: unknown, existing: string | null | undefined, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : existing ?? "";
}

/** An https:// address (a developer's page, a photo's page), or "" when cleared or unusable. */
function linkField(value: unknown, existing: string | null | undefined) {
  if (typeof value !== "string") return existing ?? "";
  const url = value.trim();
  return /^https:\/\//i.test(url) ? url.slice(0, 500) : "";
}

/*
 * Where a listing's facts came from and when they were checked, and who took the cover photo.
 * The cover's credit only survives while the cover itself stays the same image.
 */
function sourceFields(
  body: Record<string, unknown>,
  existing: { sourceUrl?: string; sourceName?: string; verifiedOn?: string; coverImageCredit?: string; coverImageSource?: string; coverImageRepresentative?: boolean } | undefined,
  coverKept: boolean,
) {
  const verifiedOn = typeof body.verifiedOn === "string" ? body.verifiedOn.trim() : existing?.verifiedOn ?? "";
  return {
    sourceUrl: linkField(body.sourceUrl, existing?.sourceUrl),
    sourceName: textField(body.sourceName, existing?.sourceName, 120),
    verifiedOn: /^\d{4}-\d{2}-\d{2}$/.test(verifiedOn) ? verifiedOn : "",
    coverImageCredit: textField(body.coverImageCredit, coverKept ? existing?.coverImageCredit : "", 160),
    coverImageSource: linkField(body.coverImageSource, coverKept ? existing?.coverImageSource : ""),
    coverImageRepresentative: typeof body.coverImageRepresentative === "boolean" ? body.coverImageRepresentative : coverKept ? existing?.coverImageRepresentative ?? false : false,
  };
}

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
  // One featured image. `image` is kept equal to it, so pages reading either field agree.
  const existingFeatured = existing?.featuredImage || existing?.image || "";
  const featuredImage = imageField(typeof body.featuredImage === "string" ? body.featuredImage : body.image, "Featured image") ?? existingFeatured;
  const title = typeof body.title === "string" ? body.title.trim() : existing?.title;
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : existing?.slug;
  const rawContent = typeof body.content === "string" ? body.content.trim() : existing?.content;
  const content = rawContent ? sanitizeArticleContent(rawContent) : undefined;
  if (!title || !slug || !content) return undefined;
  const status = body.status === "draft" ? "draft" : body.status === "published" || body.published === true ? "published" : existing?.status ?? (existing?.published ? "published" : "draft");
  const now = new Date();
  return {
    title, slug, content,
    excerpt: typeof body.excerpt === "string" ? body.excerpt.trim() : existing?.excerpt ?? "",
    featuredImage,
    image: featuredImage,
    featuredImageAlt: cleanAlt(body.featuredImageAlt) ?? (featuredImage === existingFeatured ? existing?.featuredImageAlt ?? "" : ""),
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
  const pictures = propertyImages(body, existing);
  const amenities = Array.isArray(body.amenities) ? body.amenities.map(String) : existing?.amenities ?? [];
  const featured = typeof body.featured === "boolean" ? body.featured : existing?.featured ?? false;
  const published = typeof body.published === "boolean" ? body.published : existing?.published ?? false;
  // listingType drives the Buy/Rent split in the public search, so an edit must keep it.
  const listingType = typeof body.listingType === "string" ? body.listingType.trim() : existing?.listingType;
  // A home type inside a project: the project's slug, its developer, and whether the price is
  // the developer's starting price for that type.
  const projectSlug = typeof body.projectSlug === "string" ? body.projectSlug.trim().toLowerCase() || null : existing?.projectSlug ?? null;
  const developer = textField(body.developer, existing?.developer, 120);
  const priceFrom = typeof body.priceFrom === "boolean" ? body.priceFrom : existing?.priceFrom ?? false;
  const bedroomsMax = typeof body.bedroomsMax === "number" ? (body.bedroomsMax > bedrooms ? Math.floor(body.bedroomsMax) : 0) : existing?.bedroomsMax ?? 0;
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
    ...pictures,
    ...sourceFields(body, existing, pictures.coverImage === (existing?.coverImage || existing?.images?.[0] || "")),
    amenities,
    projectSlug,
    developer,
    priceFrom,
    bedroomsMax,
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
  const pictures = projectImages(body, existing);
  const amenities = Array.isArray(body.amenities) ? body.amenities.map(String) : existing?.amenities ?? [];
  const highlights = Array.isArray(body.highlights) ? body.highlights.map(String) : existing?.highlights ?? [];
  // These were missing, so editing a project through the admin silently dropped its
  // category, status and launch flags - the same fields the public filters read.
  const category = typeof body.category === "string" ? body.category.trim() : existing?.category ?? "";
  const status = typeof body.status === "string" ? body.status.trim() : existing?.status ?? "";
  const completionDate = typeof body.completionDate === "string" ? body.completionDate.trim() : existing?.completionDate ?? "";
  const unitTypes = textField(body.unitTypes, existing?.unitTypes, 200);
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
    unitTypes,
    ...pictures,
    ...sourceFields(body, existing, pictures.image === (existing?.image || existing?.coverImage || "")),
    imageUrl,
    imagePath,
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
 * a retail unit never counted. These are the residential and commercial types the public
 * search offers (SEARCH_CATEGORIES in frontend/src/lib/property-search.ts).
 */
const RESIDENTIAL_TYPES = ["Apartment", "Villa", "Townhouse", "Penthouse", "Duplex", "Hotel Apartment", "Residential Plot"];
const COMMERCIAL_TYPES = ["Office", "Retail", "Showroom", "Warehouse", "Commercial Plot"];

router.get("/admin/dashboard", async (_req, res, next) => {
  try {
    const [
      properties,
      publishedProperties,
      insights,
      forSale,
      forRent,
      residential,
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
      count(`select count(*) from properties where type = any($1::text[]) or property_type = any($1::text[])`, [RESIDENTIAL_TYPES]),
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
        residential,
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
    const row = await insertRow("posts", { ...(await attachPublicIds(document, { featuredImage: "featuredImagePublicId" })), createdAt: new Date() });
    return res.status(201).json({ post: toApi("posts", row) });
  } catch (error) { return sendError(res, next, error); }
});

router.patch("/admin/blog/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid blog id." });
    const existing = await findById("posts", req.params.id);
    if (!existing) return res.status(404).json({ message: "Blog post not found." });
    const document = blogBody(req.body as Record<string, unknown>, toApi("posts", existing) as unknown as BlogPostDoc);
    if (!document) return res.status(400).json({ message: "Title, slug, and content are required." });
    const row = await updateRow("posts", req.params.id, await attachPublicIds(document, { featuredImage: "featuredImagePublicId" }));
    return res.json({ post: toApi("posts", row) });
  } catch (error) { return sendError(res, next, error); }
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
    const row = await insertRow("posts", { ...(await attachPublicIds(document, { featuredImage: "featuredImagePublicId" })), createdAt: new Date() });
    return res.status(201).json({ blog: toApi("posts", row) });
  } catch (error) { return sendError(res, next, error); }
});

router.put("/blogs/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid blog id." });
    const existing = await findById("posts", req.params.id);
    if (!existing) return res.status(404).json({ message: "Blog post not found." });
    const document = blogBody(req.body as Record<string, unknown>, toApi("posts", existing) as unknown as BlogPostDoc);
    if (!document) return res.status(400).json({ message: "Title, slug, and content are required." });
    const row = await updateRow("posts", req.params.id, await attachPublicIds(document, { featuredImage: "featuredImagePublicId" }));
    return res.json({ blog: toApi("posts", row) });
  } catch (error) { return sendError(res, next, error); }
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
 * Image upload: one file becomes one Cloudinary asset in the folder the console asked for,
 * and one row in the media library (secure URL, public_id, size). Shared with the SEO console
 * (routes/seo.ts), which mounts the same handler behind its own role check. A console that
 * uploads several files sends one request per file, so each is its own asset and one failure
 * does not take the others down.
 */
export async function handleImageUpload(req: Request, res: Response, next: NextFunction) {
  const file = req.file;
  if (!file?.buffer?.length) return res.status(400).json({ message: "Choose an image file to upload." });
  let uploaded: Awaited<ReturnType<typeof uploadImage>> | undefined;
  try {
    const type = detectImageType(file.buffer);
    if (!type) return res.status(400).json({ message: `"${file.originalname}" is not a valid image. Upload a ${ACCEPTED_IMAGE_LABEL} file.` });
    const folder = mediaFolder((req.body as Record<string, unknown> | undefined)?.folder);
    uploaded = await uploadImage(file.buffer, { folder, filename: file.originalname });
    const row = await insertRow("media", {
      url: uploaded.url,
      publicId: uploaded.publicId,
      filename: file.originalname,
      mimetype: type,
      size: uploaded.bytes ?? file.size,
      folder,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
      createdAt: new Date(),
    });
    return res.status(201).json({ item: toApi("media", row), url: uploaded.url, publicId: uploaded.publicId, filename: file.originalname, folder });
  } catch (error) {
    // The asset reached Cloudinary but could not be recorded: remove it rather than orphan it.
    if (uploaded && !(error instanceof MediaError)) await deleteImage(uploaded.publicId).catch(() => {});
    return sendError(res, next, error);
  }
}

router.post("/admin/uploads", acceptImage, handleImageUpload);

// Media library routes
router.get("/admin/media", async (_req, res, next) => {
  try {
    const rows = await listAll("media", "created_at desc");
    const { configured, cloudName } = cloudinaryStatus();
    return res.json({ items: toApiList("media", rows), folders: MEDIA_FOLDERS, cloudinary: { configured, cloudName } });
  } catch (error) { return next(error); }
});

/*
 * Where an image came from and on what terms. Both are plain text the admin maintains; the
 * source is kept to an http(s) URL or empty.
 */
router.patch("/admin/media/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid media id." });
    const body = (req.body ?? {}) as Record<string, unknown>;
    const patch: Record<string, string> = {};
    if (typeof body.sourceUrl === "string") {
      const source = body.sourceUrl.trim();
      if (source && !/^https?:\/\/\S+$/.test(source)) return res.status(400).json({ message: "The source must be a full http(s) link, or empty." });
      patch.sourceUrl = source.slice(0, 500);
    }
    if (typeof body.licenseNote === "string") patch.licenseNote = body.licenseNote.trim().slice(0, 500);
    if (!Object.keys(patch).length) return res.status(400).json({ message: "Nothing to change: send sourceUrl and/or licenseNote." });
    const row = await updateRow("media", req.params.id, patch);
    if (!row) return res.status(404).json({ message: "Media not found." });
    return res.json({ item: toApi("media", row) });
  } catch (error) { return sendError(res, next, error); }
});

/*
 * Deleting removes the Cloudinary asset first and the library row only once that worked, so a
 * failed delete never leaves a row pointing nowhere or an asset nobody can find. An image the
 * website still shows is refused with the list of records using it; ?force=1 deletes anyway.
 */
router.delete("/admin/media/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid media id." });
    const row = await queryOne<{ url: string; public_id: string | null }>(`select * from media where id = $1`, [req.params.id]);
    if (!row) return res.status(404).json({ message: "Media not found." });
    const force = req.query.force === "1" || req.query.force === "true";
    if (!force) {
      const usedBy = await imageUsage(row.url);
      if (usedBy.length) {
        return res.status(409).json({
          message: `This image is still shown on the website by ${usedBy.length} ${usedBy.length === 1 ? "record" : "records"}. Replace it there first, or delete it anyway.`,
          usedBy,
        });
      }
    }
    if (row.public_id) await deleteImage(row.public_id);
    await deleteRow("media", req.params.id);
    return res.status(204).send();
  } catch (error) { return sendError(res, next, error); }
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
    const row = await insertRow("properties", { ...(await attachPublicIds(document, { coverImage: "coverImagePublicId" }, "galleryImages")), createdAt: new Date() });
    return res.status(201).json({ item: toApi("properties", row) });
  } catch (error) { return sendError(res, next, error); }
});

router.put("/admin/properties/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid property id." });
    const existing = await findById("properties", req.params.id);
    if (!existing) return res.status(404).json({ message: "Property not found." });
    const document = propertyBody(req.body as Record<string, unknown>, undefined, toApi("properties", existing) as unknown as PropertyDoc);
    if (!document) return res.status(400).json({ message: "Title and slug are required." });
    const row = await updateRow("properties", req.params.id, await attachPublicIds(document, { coverImage: "coverImagePublicId" }, "galleryImages"));
    return res.json({ item: toApi("properties", row) });
  } catch (error) { return sendError(res, next, error); }
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
    const row = await insertRow("projects", { ...(await attachPublicIds(document, { coverImage: "coverImagePublicId" }, "galleryImages")), createdAt: new Date() });
    if (row?.id) await linkProjectDeveloper(String(row.id));
    return res.status(201).json({ item: toApi("projects", await findById("projects", String(row?.id))) });
  } catch (error) { return sendError(res, next, error); }
});

router.put("/admin/projects/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid project id." });
    const existing = await findById("projects", req.params.id);
    if (!existing) return res.status(404).json({ message: "Project not found." });
    const document = projectBody(req.body as Record<string, unknown>, undefined, toApi("projects", existing) as unknown as ProjectDoc);
    if (!document) return res.status(400).json({ message: "Title and slug are required." });
    await updateRow("projects", req.params.id, await attachPublicIds(document, { coverImage: "coverImagePublicId" }, "galleryImages"));
    await linkProjectDeveloper(req.params.id);
    return res.json({ item: toApi("projects", await findById("projects", req.params.id)) });
  } catch (error) { return sendError(res, next, error); }
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
  const image = imageField(body.image, "Image") ?? "";
  if (!title || !image) return undefined;
  return {
    title,
    image,
    category: typeof body.category === "string" ? body.category.trim() : "General",
    // Alt text is what search engines and screen readers get; the title stands in when empty.
    alt: cleanAlt(body.alt) || title,
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
    const row = await insertRow("gallery", { ...(await attachPublicIds(document, { image: "imagePublicId" })), createdAt: new Date() });
    return res.status(201).json({ item: toApi("gallery", row) });
  } catch (error) { return sendError(res, next, error); }
});

router.put("/admin/gallery/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: "Invalid gallery id." });
    const document = galleryBody(req.body as Record<string, unknown>);
    if (!document) return res.status(400).json({ message: "Title and image URL are required." });
    if (!(await findById("gallery", req.params.id))) return res.status(404).json({ message: "Gallery item not found." });
    const row = await updateRow("gallery", req.params.id, await attachPublicIds(document, { image: "imagePublicId" }));
    return res.json({ item: toApi("gallery", row) });
  } catch (error) { return sendError(res, next, error); }
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

/** One test message to the saved lead alert address, answered with what happened. */
router.post("/admin/settings/test-email", async (_req, res, next) => {
  try {
    return res.json(await sendTestEmail(await readSettings()));
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
