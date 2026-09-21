import { Router } from "express";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import { requireAdmin } from "../lib/auth";
import { getDb, objectId, serializeDocument } from "../lib/mongodb";
import type { BlogPostDoc, CommunityDoc, DeveloperDoc, GalleryItemDoc, InquiryDoc, MarketInsightDoc, ProjectDoc, PropertyDoc, TestimonialDoc, UserDoc } from "../lib/models";
import type { Collection } from "mongodb";

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

function collectionFor(resource: string): Collection<any> | undefined {
  const collections = {
    properties: getDb().collection<PropertyDoc>("properties"),
    projects: getDb().collection<ProjectDoc>("projects"),
    posts: getDb().collection<BlogPostDoc>("posts"),
    gallery: getDb().collection<GalleryItemDoc>("gallery"),
    testimonials: getDb().collection<TestimonialDoc>("testimonials"),
    users: getDb().collection<UserDoc>("users"),
    developers: getDb().collection<DeveloperDoc>("developers"),
    communities: getDb().collection<CommunityDoc>("communities"),
    insights: getDb().collection<MarketInsightDoc>("insights"),
    content: getDb().collection<GalleryItemDoc>("gallery"),
    settings: getDb().collection("settings"),
    subscribers: getDb().collection("newsletter"),
  };
  return collections[resource as keyof typeof collections];
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
  } satisfies Omit<BlogPostDoc, "_id" | "createdAt" | "updatedAt"> & { updatedAt: Date };
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
  } satisfies Omit<DeveloperDoc, "_id" | "createdAt" | "updatedAt"> & { updatedAt: Date };
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
  if (!title || !slug) return undefined;
  const now = new Date();
  return {
    title,
    slug,
    location,
    community,
    type,
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
  } satisfies Omit<PropertyDoc, "_id" | "createdAt" | "updatedAt"> & { updatedAt: Date };
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
  } satisfies Omit<ProjectDoc, "_id" | "createdAt" | "updatedAt"> & { updatedAt: Date };
}


router.get("/admin/dashboard", async (_req, res, next) => {
  try {
    const db = getDb();
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
      db.collection("properties").countDocuments(),
      db.collection("properties").countDocuments({ published: true }),
      db.collection("insights").countDocuments(),
      db.collection("properties").countDocuments({ $or: [{ listingType: "sale" }, { status: { $regex: "sale", $options: "i" } }] }),
      db.collection("properties").countDocuments({ $or: [{ listingType: "rent" }, { status: { $regex: "rent", $options: "i" } }] }),
      db.collection("properties").countDocuments({ $or: [{ type: { $regex: "commercial", $options: "i" } }, { propertyType: { $regex: "commercial", $options: "i" } }] }),
      db.collection("projects").countDocuments(),
      db.collection("developers").countDocuments(),
      db.collection("communities").countDocuments(),
      db.collection("posts").countDocuments(),
      db.collection("gallery").countDocuments(),
      db.collection("inquiries").countDocuments({ status: "new" }),
      db.collection("inquiries").countDocuments(),
      db.collection("newsletter").countDocuments(),
      db.collection("inquiries").find().sort({ createdAt: -1 }).limit(6).toArray(),
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
      recentInquiries: recentInquiries.map((doc) => serializeDocument(doc as unknown as Record<string, unknown>)),
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/admin/inquiries", async (_req, res, next) => {
  try {
    const docs = await getDb().collection<InquiryDoc>("inquiries").find().sort({ createdAt: -1 }).toArray();
    return res.json({ inquiries: docs.map((doc) => serializeDocument(doc as unknown as Record<string, unknown>)) });
  } catch (error) {
    return next(error);
  }
});

router.delete("/admin/inquiries/:id", async (req, res, next) => {
  try {
    const id = objectId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid inquiry id." });
    const result = await getDb().collection<InquiryDoc>("inquiries").deleteOne({ _id: id });
    if (!result.deletedCount) return res.status(404).json({ message: "Inquiry not found." });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get("/admin/users", async (_req, res, next) => {
  try {
    const docs = await getDb().collection<UserDoc>("users").find({}, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).toArray();
    return res.json({ users: docs.map((doc) => serializeDocument(doc as unknown as Record<string, unknown>)) });
  } catch (error) {
    return next(error);
  }
});

router.patch("/admin/users/:id", async (req, res, next) => {
  try {
    const id = objectId(req.params.id);
    const role = (req.body as { role?: UserDoc["role"] }).role;
    if (!id || !role || !["admin", "agent", "user"].includes(role)) return res.status(400).json({ message: "A valid user id and role are required." });
    const result = await getDb().collection<UserDoc>("users").findOneAndUpdate({ _id: id }, { $set: { role } }, { returnDocument: "after", projection: { passwordHash: 0 } });
    if (!result) return res.status(404).json({ message: "User not found." });
    return res.json({ user: serializeDocument(result as unknown as Record<string, unknown>) });
  } catch (error) {
    return next(error);
  }
});

router.patch("/admin/inquiries/:id", async (req, res, next) => {
  try {
    const id = objectId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid inquiry id." });
    const status = (req.body as { status?: InquiryDoc["status"] }).status;
    if (!status || !["new", "contacted", "closed"].includes(status)) return res.status(400).json({ message: "Invalid inquiry status." });
    const result = await getDb().collection<InquiryDoc>("inquiries").findOneAndUpdate({ _id: id }, { $set: { status } }, { returnDocument: "after" });
    if (!result) return res.status(404).json({ message: "Inquiry not found." });
    return res.json({ inquiry: serializeDocument(result as unknown as Record<string, unknown>) });
  } catch (error) {
    return next(error);
  }
});

router.get("/admin/blog", async (_req, res, next) => {
  try {
    const docs = await getDb().collection<BlogPostDoc>("posts").find().sort({ updatedAt: -1, createdAt: -1 }).toArray();
    return res.json({ posts: docs.map((doc) => serializeDocument(doc as unknown as Record<string, unknown>)) });
  } catch (error) { return next(error); }
});

router.post("/admin/blog", async (req, res, next) => {
  try {
    const document = blogBody(req.body as Record<string, unknown>);
    if (!document) return res.status(400).json({ message: "Title, slug, and content are required." });
    const now = new Date();
    const result = await getDb().collection<BlogPostDoc>("posts").insertOne({ ...document, createdAt: now } as BlogPostDoc);
    return res.status(201).json({ post: serializeDocument({ ...document, _id: result.insertedId, createdAt: now } as unknown as Record<string, unknown>) });
  } catch (error) { return next(error); }
});

router.patch("/admin/blog/:id", async (req, res, next) => {
  try {
    const id = objectId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid blog id." });
    const posts = getDb().collection<BlogPostDoc>("posts");
    const existing = await posts.findOne({ _id: id });
    if (!existing) return res.status(404).json({ message: "Blog post not found." });
    const document = blogBody(req.body as Record<string, unknown>, existing);
    if (!document) return res.status(400).json({ message: "Title, slug, and content are required." });
    const result = await posts.findOneAndUpdate({ _id: id }, { $set: document }, { returnDocument: "after" });
    return res.json({ post: serializeDocument(result as unknown as Record<string, unknown>) });
  } catch (error) { return next(error); }
});

router.delete("/admin/blog/:id", async (req, res, next) => {
  try {
    const id = objectId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid blog id." });
    const result = await getDb().collection<BlogPostDoc>("posts").deleteOne({ _id: id });
    if (!result.deletedCount) return res.status(404).json({ message: "Blog post not found." });
    return res.status(204).send();
  } catch (error) { return next(error); }
});

router.post("/blogs", async (req, res, next) => {
  try {
    const document = blogBody(req.body as Record<string, unknown>);
    if (!document) return res.status(400).json({ message: "Title, slug, and content are required." });
    const now = new Date();
    const result = await getDb().collection<BlogPostDoc>("posts").insertOne({ ...document, createdAt: now } as BlogPostDoc);
    return res.status(201).json({ blog: serializeDocument({ ...document, _id: result.insertedId, createdAt: now } as unknown as Record<string, unknown>) });
  } catch (error) { return next(error); }
});

router.put("/blogs/:id", async (req, res, next) => {
  try {
    const id = objectId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid blog id." });
    const posts = getDb().collection<BlogPostDoc>("posts");
    const existing = await posts.findOne({ _id: id });
    if (!existing) return res.status(404).json({ message: "Blog post not found." });
    const document = blogBody(req.body as Record<string, unknown>, existing);
    if (!document) return res.status(400).json({ message: "Title, slug, and content are required." });
    const result = await posts.findOneAndUpdate({ _id: id }, { $set: document }, { returnDocument: "after" });
    return res.json({ blog: serializeDocument(result as unknown as Record<string, unknown>) });
  } catch (error) { return next(error); }
});

router.delete("/blogs/:id", async (req, res, next) => {
  try {
    const id = objectId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid blog id." });
    const result = await getDb().collection<BlogPostDoc>("posts").deleteOne({ _id: id });
    if (!result.deletedCount) return res.status(404).json({ message: "Blog post not found." });
    return res.status(204).send();
  } catch (error) { return next(error); }
});

router.get("/admin/developers-detail", async (_req, res, next) => {
  try {
    const db = getDb();
    const developers = await db.collection<DeveloperDoc>("developers").find().sort({ sortOrder: 1, name: 1 }).toArray();
    const projects = await db.collection<ProjectDoc>("projects").find({}, { projection: { title: 1, slug: 1, developer: 1 } }).toArray();

    const items = developers.map((dev) => {
      const shortName = dev.name.replace(/\s+(Properties|Realty)$/i, "").trim().toLowerCase();
      const devNameLower = dev.name.toLowerCase();
      const devSlugLower = dev.slug.toLowerCase();
      const assignedProjects = projects.filter((p) => {
        const pDev = (p.developer || "").toLowerCase().trim();
        return pDev === devNameLower || pDev === shortName || pDev === devSlugLower;
      });
      return {
        ...serializeDocument(dev as unknown as Record<string, unknown>),
        projectCount: assignedProjects.length,
        projects: assignedProjects.map((p) => ({ title: p.title, slug: p.slug })),
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
    const now = new Date();
    const result = await getDb().collection<DeveloperDoc>("developers").insertOne({
      ...document,
      createdAt: now,
    } as DeveloperDoc);
    return res.status(201).json({ item: serializeDocument({ ...document, _id: result.insertedId, createdAt: now } as unknown as Record<string, unknown>) });
  } catch (error) {
    return next(error);
  }
});

router.put(["/developers/:id", "/admin/developers/:id"], async (req, res, next) => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = objectId(rawId);
    if (!id) return res.status(400).json({ message: "Invalid developer id." });
    const collection = getDb().collection<DeveloperDoc>("developers");
    const existing = await collection.findOne({ _id: id });
    if (!existing) return res.status(404).json({ message: "Developer not found." });

    const document = developerBody(req.body as Record<string, unknown>, existing);
    if (!document) return res.status(400).json({ message: "Developer name is required." });

    const result = await collection.findOneAndUpdate(
      { _id: id },
      { $set: document },
      { returnDocument: "after" },
    );
    return res.json({ item: serializeDocument(result as unknown as Record<string, unknown>) });
  } catch (error) {
    return next(error);
  }
});

router.patch(["/developers/:id", "/admin/developers/:id"], async (req, res, next) => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = objectId(rawId);
    if (!id) return res.status(400).json({ message: "Invalid developer id." });
    const collection = getDb().collection<DeveloperDoc>("developers");
    const existing = await collection.findOne({ _id: id });
    if (!existing) return res.status(404).json({ message: "Developer not found." });

    const document = developerBody(req.body as Record<string, unknown>, existing);
    if (!document) return res.status(400).json({ message: "Developer name is required." });

    const result = await collection.findOneAndUpdate(
      { _id: id },
      { $set: document },
      { returnDocument: "after" },
    );
    return res.json({ item: serializeDocument(result as unknown as Record<string, unknown>) });
  } catch (error) {
    return next(error);
  }
});

router.delete(["/developers/:id", "/admin/developers/:id"], async (req, res, next) => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = objectId(rawId);
    if (!id) return res.status(400).json({ message: "Invalid developer id." });
    const result = await getDb().collection<DeveloperDoc>("developers").deleteOne({ _id: id });
    if (!result.deletedCount) return res.status(404).json({ message: "Developer not found." });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get("/admin/developers/:id/projects", async (req, res, next) => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = objectId(rawId);
    if (!id) return res.status(400).json({ message: "Invalid developer id." });
    const developer = await getDb().collection<DeveloperDoc>("developers").findOne({ _id: id });
    if (!developer) return res.status(404).json({ message: "Developer not found." });

    const shortName = developer.name.replace(/\s+(Properties|Realty)$/i, "").trim();
    const developerRegexes = [
      new RegExp(`^${developer.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      new RegExp(`^${shortName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      new RegExp(`^${developer.slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    ];

    const projects = await getDb()
      .collection<ProjectDoc>("projects")
      .find({
        $or: [
          { developer: { $in: developerRegexes } },
          { developerSlug: developer.slug },
        ],
      })
      .toArray();

    return res.json({ projects: projects.map((p) => serializeDocument(p as unknown as Record<string, unknown>)) });
  } catch (error) {
    return next(error);
  }
});

router.post("/admin/uploads", upload.single("image"), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: "An image file is required." });
  try {
    const { uploadToCloudinary } = await import("../lib/cloudinary");
    const folder = typeof req.body.folder === "string" ? req.body.folder : "knc-horizon";
    const result = await uploadToCloudinary(req.file.path, folder);
    // Store in media collection for Media Library
    const mediaDoc = {
      url: result.url,
      publicId: result.publicId,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      folder,
      createdAt: new Date(),
    };
    await getDb().collection("media").insertOne(mediaDoc);
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
});

// Media library routes
router.get("/admin/media", async (_req, res, next) => {
  try {
    const docs = await getDb().collection("media").find().sort({ createdAt: -1 }).toArray();
    return res.json({ items: docs.map((doc) => serializeDocument(doc as unknown as Record<string, unknown>)) });
  } catch (error) { return next(error); }
});

router.delete("/admin/media/:id", async (req, res, next) => {
  try {
    const id = objectId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid media id." });
    const doc = await getDb().collection("media").findOne({ _id: id });
    if (!doc) return res.status(404).json({ message: "Media not found." });
    if (doc.publicId) {
      try {
        const { deleteFromCloudinary } = await import("../lib/cloudinary");
        await deleteFromCloudinary(doc.publicId);
      } catch { /* ignore cloudinary delete errors */ }
    }
    await getDb().collection("media").deleteOne({ _id: id });
    return res.status(204).send();
  } catch (error) { return next(error); }
});

// Communities CRUD
router.get("/admin/communities-list", async (_req, res, next) => {
  try {
    const docs = await getDb().collection("communities").find().sort({ sortOrder: 1, name: 1 }).toArray();
    return res.json({ items: docs.map((doc) => serializeDocument(doc as unknown as Record<string, unknown>)) });
  } catch (error) { return next(error); }
});

router.post("/admin/communities", async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return res.status(400).json({ message: "Community name is required." });
    const slug = typeof body.slug === "string" && body.slug.trim() ? body.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const now = new Date();
    const doc = { name, slug, description: typeof body.description === "string" ? body.description.trim() : "", shortDescription: typeof body.shortDescription === "string" ? body.shortDescription.trim() : "", location: typeof body.location === "string" ? body.location.trim() : "", image: typeof body.image === "string" ? body.image.trim() : "", published: typeof body.published === "boolean" ? body.published : true, featured: typeof body.featured === "boolean" ? body.featured : false, sortOrder: Number(body.sortOrder) || 0, createdAt: now, updatedAt: now };
    const result = await getDb().collection("communities").insertOne(doc);
    return res.status(201).json({ item: serializeDocument({ ...doc, _id: result.insertedId } as unknown as Record<string, unknown>) });
  } catch (error) { return next(error); }
});

router.put("/admin/communities/:id", async (req, res, next) => {
  try {
    const id = objectId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid community id." });
    const body = req.body as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return res.status(400).json({ message: "Community name is required." });
    const slug = typeof body.slug === "string" && body.slug.trim() ? body.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const now = new Date();
    const update = { name, slug, description: typeof body.description === "string" ? body.description.trim() : "", shortDescription: typeof body.shortDescription === "string" ? body.shortDescription.trim() : "", location: typeof body.location === "string" ? body.location.trim() : "", image: typeof body.image === "string" ? body.image.trim() : "", published: typeof body.published === "boolean" ? body.published : true, featured: typeof body.featured === "boolean" ? body.featured : false, sortOrder: Number(body.sortOrder) || 0, updatedAt: now };
    const result = await getDb().collection("communities").findOneAndUpdate({ _id: id }, { $set: update }, { returnDocument: "after" });
    if (!result) return res.status(404).json({ message: "Community not found." });
    return res.json({ item: serializeDocument(result as unknown as Record<string, unknown>) });
  } catch (error) { return next(error); }
});

router.delete("/admin/communities/:id", async (req, res, next) => {
  try {
    const id = objectId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid community id." });
    const result = await getDb().collection("communities").deleteOne({ _id: id });
    if (!result.deletedCount) return res.status(404).json({ message: "Community not found." });
    return res.status(204).send();
  } catch (error) { return next(error); }
});

// Market Insights CRUD
router.get("/admin/insights-list", async (_req, res, next) => {
  try {
    const docs = await getDb().collection("insights").find().sort({ updatedAt: -1, createdAt: -1 }).toArray();
    return res.json({ items: docs.map((doc) => serializeDocument(doc as unknown as Record<string, unknown>)) });
  } catch (error) { return next(error); }
});

router.post("/admin/insights", async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) return res.status(400).json({ message: "Insight title is required." });
    const slug = typeof body.slug === "string" && body.slug.trim() ? body.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const now = new Date();
    const doc = { title, slug, category: typeof body.category === "string" ? body.category.trim() : "General", summary: typeof body.summary === "string" ? body.summary.trim() : "", content: typeof body.content === "string" ? body.content.trim() : "", source: typeof body.source === "string" ? body.source.trim() : "", sourceUrl: typeof body.sourceUrl === "string" ? body.sourceUrl.trim() : "", image: typeof body.image === "string" ? body.image.trim() : "", published: typeof body.published === "boolean" ? body.published : false, featured: typeof body.featured === "boolean" ? body.featured : false, sortOrder: Number(body.sortOrder) || 0, createdAt: now, updatedAt: now };
    const result = await getDb().collection("insights").insertOne(doc);
    return res.status(201).json({ item: serializeDocument({ ...doc, _id: result.insertedId } as unknown as Record<string, unknown>) });
  } catch (error) { return next(error); }
});

router.put("/admin/insights/:id", async (req, res, next) => {
  try {
    const id = objectId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid insight id." });
    const body = req.body as Record<string, unknown>;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) return res.status(400).json({ message: "Insight title is required." });
    const slug = typeof body.slug === "string" && body.slug.trim() ? body.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const now = new Date();
    const update = { title, slug, category: typeof body.category === "string" ? body.category.trim() : "General", summary: typeof body.summary === "string" ? body.summary.trim() : "", content: typeof body.content === "string" ? body.content.trim() : "", source: typeof body.source === "string" ? body.source.trim() : "", sourceUrl: typeof body.sourceUrl === "string" ? body.sourceUrl.trim() : "", image: typeof body.image === "string" ? body.image.trim() : "", published: typeof body.published === "boolean" ? body.published : false, featured: typeof body.featured === "boolean" ? body.featured : false, sortOrder: Number(body.sortOrder) || 0, updatedAt: now };
    const result = await getDb().collection("insights").findOneAndUpdate({ _id: id }, { $set: update }, { returnDocument: "after" });
    if (!result) return res.status(404).json({ message: "Insight not found." });
    return res.json({ item: serializeDocument(result as unknown as Record<string, unknown>) });
  } catch (error) { return next(error); }
});

router.delete("/admin/insights/:id", async (req, res, next) => {
  try {
    const id = objectId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid insight id." });
    const result = await getDb().collection("insights").deleteOne({ _id: id });
    if (!result.deletedCount) return res.status(404).json({ message: "Insight not found." });
    return res.status(204).send();
  } catch (error) { return next(error); }
});

// Properties CRUD
router.get("/admin/properties-list", async (req, res, next) => {
  try {
    const { q, status, type } = req.query as Record<string, string | undefined>;
    const filter: Record<string, unknown> = {};
    if (q) filter.$or = [{ title: { $regex: q, $options: "i" } }, { location: { $regex: q, $options: "i" } }, { community: { $regex: q, $options: "i" } }];
    if (status === "published") filter.published = true;
    if (status === "draft") filter.published = false;
    if (type) filter.type = { $regex: type, $options: "i" };
    const docs = await getDb().collection<PropertyDoc>("properties").find(filter).sort({ updatedAt: -1, createdAt: -1 }).toArray();
    return res.json({ items: docs.map((doc) => serializeDocument(doc as unknown as Record<string, unknown>)) });
  } catch (error) { return next(error); }
});

router.post("/admin/properties", async (req, res, next) => {
  try {
    const document = propertyBody(req.body as Record<string, unknown>);
    if (!document) return res.status(400).json({ message: "Title and slug are required." });
    const now = new Date();
    const result = await getDb().collection<PropertyDoc>("properties").insertOne({ ...document, createdAt: now } as PropertyDoc);
    return res.status(201).json({ item: serializeDocument({ ...document, _id: result.insertedId, createdAt: now } as unknown as Record<string, unknown>) });
  } catch (error) { return next(error); }
});

router.put("/admin/properties/:id", async (req, res, next) => {
  try {
    const id = objectId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid property id." });
    const collection = getDb().collection<PropertyDoc>("properties");
    const existing = await collection.findOne({ _id: id });
    if (!existing) return res.status(404).json({ message: "Property not found." });
    const document = propertyBody(req.body as Record<string, unknown>, undefined, existing);
    if (!document) return res.status(400).json({ message: "Title and slug are required." });
    const result = await collection.findOneAndUpdate({ _id: id }, { $set: document }, { returnDocument: "after" });
    return res.json({ item: serializeDocument(result as unknown as Record<string, unknown>) });
  } catch (error) { return next(error); }
});

router.delete("/admin/properties/:id", async (req, res, next) => {
  try {
    const id = objectId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid property id." });
    const result = await getDb().collection<PropertyDoc>("properties").deleteOne({ _id: id });
    if (!result.deletedCount) return res.status(404).json({ message: "Property not found." });
    return res.status(204).send();
  } catch (error) { return next(error); }
});

// Projects CRUD
router.get("/admin/projects-list", async (req, res, next) => {
  try {
    const { q, developer: devFilter } = req.query as Record<string, string | undefined>;
    const filter: Record<string, unknown> = {};
    if (q) filter.$or = [{ title: { $regex: q, $options: "i" } }, { location: { $regex: q, $options: "i" } }, { developer: { $regex: q, $options: "i" } }];
    if (devFilter) filter.developer = { $regex: devFilter, $options: "i" };
    const docs = await getDb().collection<ProjectDoc>("projects").find(filter).sort({ updatedAt: -1, createdAt: -1 }).toArray();
    return res.json({ items: docs.map((doc) => serializeDocument(doc as unknown as Record<string, unknown>)) });
  } catch (error) { return next(error); }
});

router.post("/admin/projects", async (req, res, next) => {
  try {
    const document = projectBody(req.body as Record<string, unknown>);
    if (!document) return res.status(400).json({ message: "Title and slug are required." });
    const now = new Date();
    const result = await getDb().collection<ProjectDoc>("projects").insertOne({ ...document, createdAt: now } as ProjectDoc);
    return res.status(201).json({ item: serializeDocument({ ...document, _id: result.insertedId, createdAt: now } as unknown as Record<string, unknown>) });
  } catch (error) { return next(error); }
});

router.put("/admin/projects/:id", async (req, res, next) => {
  try {
    const id = objectId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid project id." });
    const collection = getDb().collection<ProjectDoc>("projects");
    const existing = await collection.findOne({ _id: id });
    if (!existing) return res.status(404).json({ message: "Project not found." });
    const document = projectBody(req.body as Record<string, unknown>, undefined, existing);
    if (!document) return res.status(400).json({ message: "Title and slug are required." });
    const result = await collection.findOneAndUpdate({ _id: id }, { $set: document }, { returnDocument: "after" });
    return res.json({ item: serializeDocument(result as unknown as Record<string, unknown>) });
  } catch (error) { return next(error); }
});

router.delete("/admin/projects/:id", async (req, res, next) => {
  try {
    const id = objectId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid project id." });
    const result = await getDb().collection<ProjectDoc>("projects").deleteOne({ _id: id });
    if (!result.deletedCount) return res.status(404).json({ message: "Project not found." });
    return res.status(204).send();
  } catch (error) { return next(error); }
});

// Gallery CRUD
router.get("/admin/gallery-list", async (_req, res, next) => {
  try {
    const docs = await getDb().collection<GalleryItemDoc>("gallery").find().sort({ createdAt: -1 }).toArray();
    return res.json({ items: docs.map((doc) => serializeDocument(doc as unknown as Record<string, unknown>)) });
  } catch (error) { return next(error); }
});

router.post("/admin/gallery", async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const image = typeof body.image === "string" ? body.image.trim() : "";
    if (!title || !image) return res.status(400).json({ message: "Title and image URL are required." });
    const doc = { title, image, category: typeof body.category === "string" ? body.category.trim() : "General", alt: typeof body.alt === "string" ? body.alt.trim() : title, createdAt: new Date() };
    const result = await getDb().collection<GalleryItemDoc>("gallery").insertOne(doc as GalleryItemDoc);
    return res.status(201).json({ item: serializeDocument({ ...doc, _id: result.insertedId } as unknown as Record<string, unknown>) });
  } catch (error) { return next(error); }
});

router.put("/admin/gallery/:id", async (req, res, next) => {
  try {
    const id = objectId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid gallery id." });
    const body = req.body as Record<string, unknown>;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const image = typeof body.image === "string" ? body.image.trim() : "";
    if (!title || !image) return res.status(400).json({ message: "Title and image URL are required." });
    const update = { title, image, category: typeof body.category === "string" ? body.category.trim() : "General", alt: typeof body.alt === "string" ? body.alt.trim() : title };
    const result = await getDb().collection<GalleryItemDoc>("gallery").findOneAndUpdate({ _id: id }, { $set: update }, { returnDocument: "after" });
    if (!result) return res.status(404).json({ message: "Gallery item not found." });
    return res.json({ item: serializeDocument(result as unknown as Record<string, unknown>) });
  } catch (error) { return next(error); }
});

router.delete("/admin/gallery/:id", async (req, res, next) => {
  try {
    const id = objectId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid gallery id." });
    const result = await getDb().collection<GalleryItemDoc>("gallery").deleteOne({ _id: id });
    if (!result.deletedCount) return res.status(404).json({ message: "Gallery item not found." });
    return res.status(204).send();
  } catch (error) { return next(error); }
});

export { uploadDir };
/*
 * Generic collection CRUD. Registered last on purpose: Express matches routes in order,
 * so "/admin/:resource" would otherwise swallow the specific routes above
 * (e.g. /admin/properties-list would be read as a resource named "properties-list").
 */
router.get("/admin/:resource", async (req, res, next) => {
  try {
    const collection = collectionFor(req.params.resource);
    if (!collection) return res.status(404).json({ message: "Unknown admin resource." });
    const docs = await collection.find().sort({ updatedAt: -1, createdAt: -1 }).toArray();
    return res.json({ items: docs.map((doc) => serializeDocument(doc as unknown as Record<string, unknown>)) });
  } catch (error) {
    return next(error);
  }
});

router.post("/admin/:resource", async (req, res, next) => {
  try {
    const collection = collectionFor(req.params.resource);
    if (!collection) return res.status(404).json({ message: "Unknown admin resource." });
    const now = new Date();
    const document = { ...cleanBody(req.body as Record<string, unknown>), createdAt: now, updatedAt: now };
    const result = await collection.insertOne(document as never);
    return res.status(201).json({ item: serializeDocument({ ...document, _id: result.insertedId } as unknown as Record<string, unknown>) });
  } catch (error) {
    return next(error);
  }
});

router.patch("/admin/:resource/:id", async (req, res, next) => {
  try {
    const collection = collectionFor(req.params.resource);
    const id = objectId(req.params.id);
    if (!collection || !id) return res.status(400).json({ message: "Invalid admin resource or id." });
    const result = await collection.findOneAndUpdate({ _id: id }, { $set: cleanBody(req.body as Record<string, unknown>) }, { returnDocument: "after" });
    if (!result) return res.status(404).json({ message: "Record not found." });
    return res.json({ item: serializeDocument(result as unknown as Record<string, unknown>) });
  } catch (error) {
    return next(error);
  }
});

router.delete("/admin/:resource/:id", async (req, res, next) => {
  try {
    const collection = collectionFor(req.params.resource);
    const id = objectId(req.params.id);
    if (!collection || !id) return res.status(400).json({ message: "Invalid admin resource or id." });
    const result = await collection.deleteOne({ _id: id });
    if (!result.deletedCount) return res.status(404).json({ message: "Record not found." });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;