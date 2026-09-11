import { Router } from "express";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import { requireAdmin } from "../lib/auth";
import { getDb, objectId, serializeDocument } from "../lib/mongodb";
import type { BlogPostDoc, GalleryItemDoc, InquiryDoc, ProjectDoc, PropertyDoc, TestimonialDoc, UserDoc } from "../lib/models";
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
    developers: getDb().collection("developers"),
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

router.get("/admin/dashboard", async (_req, res, next) => {
  try {
    const db = getDb();
    const [properties, projects, posts, inquiries, subscribers, developers] = await Promise.all([
      db.collection("properties").countDocuments(),
      db.collection("projects").countDocuments(),
      db.collection("posts").countDocuments(),
      db.collection("inquiries").countDocuments({ status: "new" }),
      db.collection("newsletter").countDocuments(),
      db.collection("developers").countDocuments(),
    ]);
    return res.json({ counts: { properties, projects, posts, inquiries, subscribers, developers } });
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

router.post("/admin/uploads", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "An image file is required." });
  return res.status(201).json({ url: `/api/uploads/${req.file.filename}`, filename: req.file.filename });
});

export { uploadDir };
export default router;