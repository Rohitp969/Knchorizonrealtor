import { Router } from "express";
import { count, query, queryOne } from "../lib/postgres.ts";
import { contains, toApi, toApiList } from "../lib/repositories.ts";
import { publicSettings, readSettings } from "../lib/settings.ts";

const router = Router();

/*
 * Site settings for the public pages: the site name, the currency prices fall back to and
 * the contact details. The lead notification address is filtered out by publicSettings —
 * it is an internal routing address, not something to publish on the site.
 */
router.get("/public/settings", async (_req, res, next) => {
  try {
    return res.json({ settings: publicSettings(await readSettings()) });
  } catch (error) {
    return next(error);
  }
});

/**
 * Collects `where` fragments and their bound values.
 * `bind` returns the `$n` placeholder for a value, so a clause is written inline and every
 * user-supplied value reaches PostgreSQL as a parameter rather than as SQL text.
 */
function conditions(initial: string[] = []) {
  const clauses = [...initial];
  const values: unknown[] = [];
  return {
    bind(value: unknown) {
      values.push(value);
      return `$${values.length}`;
    },
    push(clause: string) {
      clauses.push(clause);
    },
    get where() {
      return clauses.length ? `where ${clauses.join(" and ")}` : "";
    },
    get values() {
      return values;
    },
  };
}

/*
 * Properties, with the filters the public listing pages send.
 * Every branch here matches what the document query did, including the two places where a
 * property type may live in either `type` or `property_type`.
 */
router.get("/public/properties", async (req, res, next) => {
  try {
    const { type, propertyType, listingType, community, city, q, featured, minPrice, maxPrice, bedrooms, sort, page = "1", limit = "24" } = req.query as Record<string, string | undefined>;
    const filter = conditions(["published"]);

    const wantedType = type ?? propertyType;
    if (wantedType) {
      const value = filter.bind(wantedType);
      filter.push(`(type = ${value} or property_type = ${value})`);
    }
    if (listingType) filter.push(`listing_type = ${filter.bind(listingType)}`);
    if (community) filter.push(`community = ${filter.bind(community)}`);
    if (city) filter.push(`city = ${filter.bind(city)}`);
    if (featured === "true") filter.push("featured");
    if (q) {
      const value = filter.bind(contains(q));
      filter.push(`(title ilike ${value} or location ilike ${value} or community ilike ${value})`);
    }
    if (minPrice && Number.isFinite(Number(minPrice))) filter.push(`price >= ${filter.bind(Number(minPrice))}`);
    if (maxPrice && Number.isFinite(Number(maxPrice))) filter.push(`price <= ${filter.bind(Number(maxPrice))}`);
    if (bedrooms && Number.isFinite(Number(bedrooms))) filter.push(`bedrooms >= ${filter.bind(Number(bedrooms))}`);

    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 24));
    const order =
      sort === "price-asc" ? "price asc"
      : sort === "price-desc" ? "price desc"
      : sort === "oldest" ? "created_at asc"
      : "featured desc, created_at desc";

    const [rows, total] = await Promise.all([
      query(
        `select * from properties ${filter.where} order by ${order} limit ${pageSize} offset ${(pageNumber - 1) * pageSize}`,
        filter.values,
      ),
      count(`select count(*) from properties ${filter.where}`, filter.values),
    ]);

    return res.json({
      properties: toApiList("properties", rows),
      pagination: { page: pageNumber, limit: pageSize, total, pages: Math.ceil(total / pageSize) },
    });
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
    const propertyRows = await query<{
      community: string; location: string; type: string; property_type: string | null;
      listing_type: string | null; status: string; price: number; bedrooms: number;
      bathrooms: number; featured: boolean;
    }>(
      `select community, location, type, property_type, listing_type, status, price, bedrooms, bathrooms, featured
         from properties where published limit 2000`,
    );

    // listing_type is absent on older records, so fall back to reading the status text.
    const isRental = (row: { listing_type: string | null; status: string | null }) =>
      String(row.listing_type ?? "").toLowerCase() === "rent" || /(rent|lease)/i.test(String(row.status ?? ""));

    const listings = propertyRows.map((row) => ({
      mode: isRental(row) ? "rent" : "buy",
      location: String(row.community || row.location || "").trim(),
      type: String(row.type || row.property_type || "").trim(),
      developer: "",
      project: "",
      beds: Number(row.bedrooms) || 0,
      baths: Number(row.bathrooms) || 0,
      featured: row.featured === true,
      handover: "",
      price: Number(row.price) || 0,
    }));

    const projectRows = await query<{
      location: string; developer: string; starting_price: number; handover: string;
      category: string | null; slug: string; title: string; featured: boolean;
    }>(
      `select location, developer, starting_price, handover, category, slug, title, featured
         from projects where published limit 2000`,
    );

    // What a project is selling, as the admin recorded it. Nothing is inferred: a project
    // with no category simply does not appear under a property type.
    const offPlan = projectRows.map((row) => ({
      mode: "offplan",
      location: String(row.location || "").trim(),
      type: String(row.category || "").trim(),
      developer: String(row.developer || "").trim(),
      // The project itself is a filter on off-plan, so the row carries how to name it.
      project: String(row.slug || "").trim(),
      projectTitle: String(row.title || "").trim(),
      beds: 0,
      baths: 0,
      featured: row.featured === true,
      handover: String(row.handover || "").trim(),
      price: Number(row.starting_price) || 0,
    }));

    return res.json({ listings: [...listings, ...offPlan] });
  } catch (error) {
    return next(error);
  }
});

router.get("/public/properties/:slug", async (req, res, next) => {
  try {
    const slug = req.params.slug;
    // The original Azure House slug still resolves, so old links and saved leads keep working.
    const slugs = slug === "azure-house-palm-jumeirah" ? ["palm-jumeirah-azure", "azure-house-palm-jumeirah"] : [slug];
    const row = await queryOne(`select * from properties where published and slug = any($1::text[])`, [slugs]);
    if (!row) return res.status(404).json({ message: "Property not found." });
    return res.json({ property: toApi("properties", row) });
  } catch (error) {
    return next(error);
  }
});

router.get("/public/projects", async (req, res, next) => {
  try {
    const { developer, featured, newLaunch, offPlan } = req.query as Record<string, string | undefined>;
    const filter = conditions(["published"]);
    if (developer) filter.push(`developer = ${filter.bind(developer)}`);
    if (featured === "true") filter.push("featured");
    if (newLaunch === "true") filter.push("new_launch");
    if (offPlan === "true") filter.push("off_plan");

    const rows = await query(
      `select * from projects ${filter.where} order by featured desc, created_at desc`,
      filter.values,
    );
    return res.json({ projects: toApiList("projects", rows) });
  } catch (error) {
    return next(error);
  }
});

router.get(["/public/developers", "/developers"], async (_req, res, next) => {
  try {
    const rows = await query(`select * from developers where published order by sort_order asc, name asc`);
    return res.json({ developers: toApiList("developers", rows) });
  } catch (error) {
    return next(error);
  }
});

router.get(["/public/developers/:slug", "/developers/:slug"], async (req, res, next) => {
  try {
    const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const value = String(rawSlug ?? "").trim();
    const developer = await queryOne<{ id: string; slug: string; name: string }>(
      `select * from developers where published and (slug = $1 or lower(name) = lower($2))`,
      [value.toLowerCase(), value],
    );
    if (!developer) return res.status(404).json({ message: "Developer not found." });

    /*
     * Projects assigned to this developer. `developer_slug` is the resolved link created
     * during the migration; the name comparisons stay so a project typed in by hand — with
     * the full name, the name without "Properties"/"Realty", or the slug — still matches
     * before anyone gets round to linking it.
     */
    const projects = await query(
      `select * from projects
        where published
          and (
            developer_slug = $1
            or lower(btrim(developer)) = lower($2)
            or lower(btrim(developer)) = lower(regexp_replace($2, '\\s+(Properties|Realty)$', '', 'i'))
            or lower(btrim(developer)) = lower($1)
          )
        order by featured desc, created_at desc`,
      [developer.slug, developer.name],
    );

    return res.json({
      developer: toApi("developers", developer as unknown as Record<string, unknown>),
      projects: toApiList("projects", projects),
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/public/projects/:slug", async (req, res, next) => {
  try {
    const row = await queryOne(`select * from projects where published and slug = $1`, [req.params.slug]);
    if (!row) return res.status(404).json({ message: "Project not found." });
    return res.json({ project: toApi("projects", row) });
  } catch (error) {
    return next(error);
  }
});

/** A post counts as live when either flag says so, which is how the admin has always saved. */
const POST_IS_LIVE = `(published or status = 'published')`;

async function livePosts(q?: string, category?: string) {
  const filter = conditions([POST_IS_LIVE]);
  if (category) filter.push(`category = ${filter.bind(category)}`);
  if (q?.trim()) {
    const value = filter.bind(contains(q.trim()));
    filter.push(`(title ilike ${value} or excerpt ilike ${value} or category ilike ${value})`);
  }
  return query(`select * from posts ${filter.where} order by published_at desc`, filter.values);
}

router.get("/public/blog", async (req, res, next) => {
  try {
    const { q, category } = req.query as { q?: string; category?: string };
    return res.json({ posts: toApiList("posts", await livePosts(q, category)) });
  } catch (error) {
    return next(error);
  }
});

router.get("/public/blog/:slug", async (req, res, next) => {
  try {
    const row = await queryOne(`select * from posts where ${POST_IS_LIVE} and slug = $1`, [req.params.slug]);
    if (!row) return res.status(404).json({ message: "Journal entry not found." });
    return res.json({ post: toApi("posts", row) });
  } catch (error) {
    return next(error);
  }
});

router.get("/blogs", async (req, res, next) => {
  try {
    const { q, category } = req.query as { q?: string; category?: string };
    return res.json({ blogs: toApiList("posts", await livePosts(q, category)) });
  } catch (error) { return next(error); }
});

router.get("/blogs/:slug", async (req, res, next) => {
  try {
    const blog = await queryOne<{ slug: string; category: string }>(
      `select * from posts where ${POST_IS_LIVE} and slug = $1`,
      [req.params.slug],
    );
    if (!blog) return res.status(404).json({ message: "Blog post not found." });
    // Same category first, then anything else recent, to a maximum of three.
    const related = await query(
      `select * from posts
        where ${POST_IS_LIVE} and slug <> $1
        order by (category = $2) desc, published_at desc
        limit 3`,
      [blog.slug, blog.category],
    );
    return res.json({
      blog: toApi("posts", blog as unknown as Record<string, unknown>),
      related: toApiList("posts", related),
    });
  } catch (error) { return next(error); }
});

router.get("/public/testimonials", async (_req, res, next) => {
  try {
    const rows = await query(`select * from testimonials where published order by created_at desc`);
    return res.json({ testimonials: toApiList("testimonials", rows) });
  } catch (error) {
    return next(error);
  }
});

router.get("/public/gallery", async (_req, res, next) => {
  try {
    const rows = await query(`select * from gallery where published order by created_at desc`);
    return res.json({ gallery: toApiList("gallery", rows) });
  } catch (error) {
    return next(error);
  }
});

/*
 * Communities and market insights, so anything the admin publishes in those sections
 * reaches the public site the same way properties and projects do. Both tables start
 * empty, and the pages fall back to their own editorial content until they are filled.
 */
router.get("/public/communities", async (_req, res, next) => {
  try {
    const rows = await query(`select * from communities where published order by sort_order asc, name asc`);
    return res.json({ communities: toApiList("communities", rows) });
  } catch (error) {
    return next(error);
  }
});

router.get("/public/communities/:slug", async (req, res, next) => {
  try {
    const row = await queryOne(`select * from communities where published and slug = $1`, [req.params.slug]);
    if (!row) return res.status(404).json({ message: "Community not found." });
    return res.json({ community: toApi("communities", row) });
  } catch (error) {
    return next(error);
  }
});

router.get("/public/insights", async (_req, res, next) => {
  try {
    const rows = await query(`select * from insights where published order by sort_order asc, created_at desc`);
    return res.json({ insights: toApiList("insights", rows) });
  } catch (error) {
    return next(error);
  }
});

export default router;
