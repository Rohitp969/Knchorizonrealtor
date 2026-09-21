import { Router } from "express";
import { getDb, objectId, serializeDocument } from "../lib/mongodb";
import type { BlogPostDoc, CommunityDoc, DeveloperDoc, GalleryItemDoc, MarketInsightDoc, ProjectDoc, PropertyDoc, TestimonialDoc } from "../lib/models";

const router = Router();

function publicFilter() {
  return { published: true };
}

router.get("/public/properties", async (req, res, next) => {
  try {
    const { type, propertyType, listingType, community, city, q, featured, minPrice, maxPrice, bedrooms, sort, page = "1", limit = "24" } = req.query as Record<string, string | undefined>;
    const filter: Record<string, unknown> = publicFilter();
    if (type || propertyType) filter.$or = [{ type: type ?? propertyType }, { propertyType: type ?? propertyType }];
    if (listingType) filter.listingType = listingType;
    if (community) filter.community = community;
    if (city) filter.city = city;
    if (featured === "true") filter.featured = true;
    if (q) filter.$and = [{ $or: [{ title: { $regex: q, $options: "i" } }, { location: { $regex: q, $options: "i" } }, { community: { $regex: q, $options: "i" } }] }];
    const price: Record<string, number> = {};
    if (minPrice && Number.isFinite(Number(minPrice))) price.$gte = Number(minPrice);
    if (maxPrice && Number.isFinite(Number(maxPrice))) price.$lte = Number(maxPrice);
    if (Object.keys(price).length) filter.price = price;
    if (bedrooms && Number.isFinite(Number(bedrooms))) filter.bedrooms = { $gte: Number(bedrooms) };
    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 24));
    const sortSpec: Record<string, 1 | -1> = sort === "price-asc" ? { price: 1 } : sort === "price-desc" ? { price: -1 } : sort === "oldest" ? { createdAt: 1 } : { featured: -1, createdAt: -1 };
    const collection = getDb().collection<PropertyDoc>("properties");
    const [docs, total] = await Promise.all([
      collection.find(filter).sort(sortSpec).skip((pageNumber - 1) * pageSize).limit(pageSize).toArray(),
      collection.countDocuments(filter),
    ]);
    return res.json({ properties: docs.map((doc) => serializeDocument(doc as unknown as Record<string, unknown>)), pagination: { page: pageNumber, limit: pageSize, total, pages: Math.ceil(total / pageSize) } });
  } catch (error) {
    return next(error);
  }
});

/*
 * Rows behind the property search bar.
 * The hero and the listing bars build their dropdowns from this, so an option only ever
 * appears when at least one published KNC record would come back for it, and the lists
 * narrow against each other as choices are made. One compact row per record is enough to
 * count every combination in the browser, without shipping the full documents.
 *
 * Buy and rent rows come from properties; off-plan rows come from projects, which carry a
 * developer and a handover quarter in place of a property type and a bedroom count.
 */
router.get("/public/property-filters", async (_req, res, next) => {
  try {
    const docs = await getDb()
      .collection<PropertyDoc>("properties")
      .find(publicFilter())
      .project({ community: 1, location: 1, type: 1, propertyType: 1, listingType: 1, status: 1, price: 1, bedrooms: 1 })
      .limit(2000)
      .toArray();

    // listingType is optional on older records, so fall back to reading the status text.
    const isRental = (doc: Partial<PropertyDoc>) =>
      String(doc.listingType ?? "").toLowerCase() === "rent" || /(rent|lease)/i.test(String(doc.status ?? ""));

    const listings = docs.map((doc) => ({
      mode: isRental(doc) ? "rent" : "buy",
      location: String(doc.community || doc.location || "").trim(),
      type: String(doc.type || doc.propertyType || "").trim(),
      developer: "",
      beds: Number(doc.bedrooms) || 0,
      handover: "",
      price: Number(doc.price) || 0,
    }));

    const projects = await getDb()
      .collection<ProjectDoc>("projects")
      .find(publicFilter())
      .project({ location: 1, developer: 1, startingPrice: 1, handover: 1, category: 1 })
      .limit(2000)
      .toArray();

    // What a project is selling, as the admin recorded it. Nothing is inferred: a project
    // with no category simply does not appear under a property type.
    const unitType = (doc: Partial<ProjectDoc>) => String(doc.category || "").trim();

    const offPlan = projects.map((doc) => ({
      mode: "offplan",
      location: String(doc.location || "").trim(),
      type: unitType(doc),
      developer: String(doc.developer || "").trim(),
      beds: 0,
      handover: String(doc.handover || "").trim(),
      price: Number(doc.startingPrice) || 0,
    }));

    return res.json({ listings: [...listings, ...offPlan] });
  } catch (error) {
    return next(error);
  }
});

router.get("/public/properties/:slug", async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const doc = await getDb().collection<PropertyDoc>("properties").findOne({
      ...publicFilter(),
      slug: slug === "azure-house-palm-jumeirah" ? { $in: ["palm-jumeirah-azure", "azure-house-palm-jumeirah"] } : slug,
    });
    if (!doc) return res.status(404).json({ message: "Property not found." });
    return res.json({ property: serializeDocument(doc as unknown as Record<string, unknown>) });
  } catch (error) {
    return next(error);
  }
});

router.get("/public/projects", async (req, res, next) => {
  try {
    const { developer, featured, newLaunch, offPlan } = req.query as Record<string, string | undefined>;
    const filter: Record<string, unknown> = publicFilter();
    
    if (developer) filter.developer = developer;
    if (featured === "true") filter.featured = true;
    if (newLaunch === "true") filter.newLaunch = true;
    if (offPlan === "true") filter.offPlan = true;
    
    const docs = await getDb().collection<ProjectDoc>("projects").find(filter).sort({ featured: -1, createdAt: -1 }).toArray();
    return res.json({ projects: docs.map((doc) => serializeDocument(doc as unknown as Record<string, unknown>)) });
  } catch (error) {
    return next(error);
  }
});

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.get(["/public/developers", "/developers"], async (_req, res, next) => {
  try {
    const docs = await getDb()
      .collection<DeveloperDoc>("developers")
      .find(publicFilter())
      .sort({ sortOrder: 1, name: 1 })
      .toArray();
    return res.json({ developers: docs.map((doc) => serializeDocument(doc as unknown as Record<string, unknown>)) });
  } catch (error) {
    return next(error);
  }
});

router.get(["/public/developers/:slug", "/developers/:slug"], async (req, res, next) => {
  try {
    const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const slug = String(rawSlug ?? "").trim().toLowerCase();
    const doc = await getDb().collection<DeveloperDoc>("developers").findOne({
      ...publicFilter(),
      $or: [{ slug }, { name: { $regex: new RegExp(`^${escapeRegex(String(rawSlug ?? "").trim())}$`, "i") } }],
    });
    if (!doc) return res.status(404).json({ message: "Developer not found." });

    // Find verified projects assigned to this developer
    const shortName = doc.name.replace(/\s+(Properties|Realty)$/i, "").trim();
    const developerRegexes = [
      new RegExp(`^${escapeRegex(doc.name)}$`, "i"),
      new RegExp(`^${escapeRegex(shortName)}$`, "i"),
      new RegExp(`^${escapeRegex(doc.slug)}$`, "i"),
    ];

    const projectFilter: Record<string, unknown> = {
      ...publicFilter(),
      $or: [
        { developer: { $in: developerRegexes } },
        { developerSlug: doc.slug },
      ],
    };

    const projects = await getDb()
      .collection<ProjectDoc>("projects")
      .find(projectFilter)
      .sort({ featured: -1, createdAt: -1 })
      .toArray();

    return res.json({
      developer: serializeDocument(doc as unknown as Record<string, unknown>),
      projects: projects.map((p) => serializeDocument(p as unknown as Record<string, unknown>)),
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/public/projects/:slug", async (req, res, next) => {
  try {
    const doc = await getDb().collection<ProjectDoc>("projects").findOne({ ...publicFilter(), slug: req.params.slug });
    if (!doc) return res.status(404).json({ message: "Project not found." });
    return res.json({ project: serializeDocument(doc as unknown as Record<string, unknown>) });
  } catch (error) {
    return next(error);
  }
});

router.get("/public/blog", async (req, res, next) => {
  try {
    const { q, category } = req.query as { q?: string; category?: string };
    const filter: Record<string, unknown> = { $or: [{ published: true }, { status: "published" }] };
    if (category) filter.category = category;
    if (q?.trim()) filter.$and = [{ $or: [{ title: { $regex: q.trim(), $options: "i" } }, { excerpt: { $regex: q.trim(), $options: "i" } }, { category: { $regex: q.trim(), $options: "i" } }] }];
    const docs = await getDb().collection<BlogPostDoc>("posts").find(filter).sort({ publishedAt: -1 }).toArray();
    return res.json({ posts: docs.map((doc) => serializeDocument(doc as unknown as Record<string, unknown>)) });
  } catch (error) {
    return next(error);
  }
});

router.get("/public/blog/:slug", async (req, res, next) => {
  try {
    const doc = await getDb().collection<BlogPostDoc>("posts").findOne({ $or: [{ published: true }, { status: "published" }], slug: req.params.slug });
    if (!doc) return res.status(404).json({ message: "Journal entry not found." });
    return res.json({ post: serializeDocument(doc as unknown as Record<string, unknown>) });
  } catch (error) {
    return next(error);
  }
});

router.get("/blogs", async (req, res, next) => {
  try {
    const { q, category } = req.query as { q?: string; category?: string };
    const filter: Record<string, unknown> = { $or: [{ published: true }, { status: "published" }] };
    if (category) filter.category = category;
    if (q?.trim()) filter.$and = [{ $or: [{ title: { $regex: q.trim(), $options: "i" } }, { excerpt: { $regex: q.trim(), $options: "i" } }, { category: { $regex: q.trim(), $options: "i" } }] }];
    const docs = await getDb().collection<BlogPostDoc>("posts").find(filter).sort({ publishedAt: -1 }).toArray();
    return res.json({ blogs: docs.map((doc) => serializeDocument(doc as unknown as Record<string, unknown>)) });
  } catch (error) { return next(error); }
});

router.get("/blogs/:slug", async (req, res, next) => {
  try {
    const posts = getDb().collection<BlogPostDoc>("posts");
    const blog = await posts.findOne({ $or: [{ published: true }, { status: "published" }], slug: req.params.slug });
    if (!blog) return res.status(404).json({ message: "Blog post not found." });
    let related = await posts.find({ $or: [{ published: true }, { status: "published" }], category: blog.category, slug: { $ne: blog.slug } }).sort({ publishedAt: -1 }).limit(3).toArray();
    if (related.length < 3) {
      const fallback = await posts.find({ $or: [{ published: true }, { status: "published" }], slug: { $ne: blog.slug } }).sort({ publishedAt: -1 }).limit(3).toArray();
      related = [...related, ...fallback.filter((item) => !related.some((entry) => entry.slug === item.slug))].slice(0, 3);
    }
    return res.json({ blog: serializeDocument(blog as unknown as Record<string, unknown>), related: related.map((doc) => serializeDocument(doc as unknown as Record<string, unknown>)) });
  } catch (error) { return next(error); }
});

router.get("/public/testimonials", async (_req, res, next) => {
  try {
    const docs = await getDb().collection<TestimonialDoc>("testimonials").find({ published: { $ne: false } }).sort({ createdAt: -1 }).toArray();
    return res.json({ testimonials: docs.map((doc) => serializeDocument(doc as unknown as Record<string, unknown>)) });
  } catch (error) {
    return next(error);
  }
});

router.get("/public/gallery", async (_req, res, next) => {
  try {
    const docs = await getDb()
      .collection<GalleryItemDoc>("gallery")
      .find({ published: { $ne: false } })
      .sort({ createdAt: -1 })
      .toArray();
    return res.json({ gallery: docs.map((doc) => serializeDocument(doc as unknown as Record<string, unknown>)) });
  } catch (error) {
    return next(error);
  }
});

/*
 * Communities and market insights, so anything the admin publishes in those sections
 * reaches the public site the same way properties and projects do. Both collections start
 * empty, and the pages fall back to their own editorial content until they are filled.
 */
router.get("/public/communities", async (_req, res, next) => {
  try {
    const docs = await getDb()
      .collection<CommunityDoc>("communities")
      .find(publicFilter())
      .sort({ sortOrder: 1, name: 1 })
      .toArray();
    return res.json({ communities: docs.map((doc) => serializeDocument(doc as unknown as Record<string, unknown>)) });
  } catch (error) {
    return next(error);
  }
});

router.get("/public/communities/:slug", async (req, res, next) => {
  try {
    const doc = await getDb()
      .collection<CommunityDoc>("communities")
      .findOne({ ...publicFilter(), slug: req.params.slug });
    if (!doc) return res.status(404).json({ message: "Community not found." });
    return res.json({ community: serializeDocument(doc as unknown as Record<string, unknown>) });
  } catch (error) {
    return next(error);
  }
});

router.get("/public/insights", async (_req, res, next) => {
  try {
    const docs = await getDb()
      .collection<MarketInsightDoc>("insights")
      .find(publicFilter())
      .sort({ sortOrder: 1, createdAt: -1 })
      .toArray();
    return res.json({ insights: docs.map((doc) => serializeDocument(doc as unknown as Record<string, unknown>)) });
  } catch (error) {
    return next(error);
  }
});

export default router;