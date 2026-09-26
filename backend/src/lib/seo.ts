import { query, queryOne } from "./postgres.ts";

/*
 * SEO for the KNC Horizon Realtor site.
 *
 * Static pages are identified by a key from SEO_PAGES; properties, projects and blog posts by
 * their own database id (seo_meta holds real foreign keys to them). Everything the public site
 * renders into <head> comes from these records, falling back to each page's own title and
 * description when a field is left empty.
 */

/** The public site's canonical origin. The apex domain redirects to www with a 308. */
export const DEFAULT_SITE_URL = "https://www.knchorizonrealtor.com";

export type SeoPage = { key: string; path: string; label: string; group: string };

/** The site's real, indexable static pages, as routed in frontend/src/App.tsx. */
export const SEO_PAGES: readonly SeoPage[] = [
  { key: "home", path: "/", label: "Home", group: "Main" },
  { key: "about", path: "/about", label: "About KNC", group: "About" },
  { key: "about-approach", path: "/about/approach", label: "Our Approach", group: "About" },
  { key: "india-office", path: "/about/india-office", label: "India Office", group: "About" },
  { key: "properties", path: "/properties", label: "All Properties", group: "Properties" },
  { key: "properties-sale", path: "/properties/sale", label: "Properties for Sale", group: "Properties" },
  { key: "properties-rent", path: "/properties/rent", label: "Properties for Rent", group: "Properties" },
  { key: "residential", path: "/properties/residential", label: "Residential", group: "Properties" },
  { key: "commercial", path: "/properties/commercial", label: "Commercial", group: "Properties" },
  { key: "investment", path: "/properties/investment", label: "Investment", group: "Properties" },
  { key: "off-plan", path: "/off-plan", label: "Off-Plan Projects", group: "Projects" },
  { key: "new-launches", path: "/off-plan/new-launches", label: "New Launches", group: "Projects" },
  { key: "off-plan-apartments", path: "/off-plan/apartments", label: "Off-Plan Apartments", group: "Projects" },
  { key: "off-plan-villas", path: "/off-plan/villas-townhouses", label: "Off-Plan Villas & Townhouses", group: "Projects" },
  { key: "off-plan-developers", path: "/off-plan/developers", label: "Projects by Developer", group: "Projects" },
  { key: "developers", path: "/developers", label: "Developers", group: "Explore" },
  { key: "communities", path: "/communities", label: "Communities (Areas)", group: "Explore" },
  { key: "services", path: "/services", label: "Services", group: "Services" },
  { key: "design-build", path: "/design-build", label: "Design & Build", group: "Services" },
  { key: "interiors", path: "/interiors", label: "Interiors & Furniture", group: "Services" },
  { key: "blog", path: "/blog", label: "Blog", group: "Insights" },
  { key: "market-insights", path: "/market-insights", label: "Market Insights", group: "Insights" },
  { key: "gallery", path: "/gallery", label: "Gallery", group: "Insights" },
  { key: "contact", path: "/contact", label: "Contact", group: "Contact" },
  { key: "privacy", path: "/privacy-policy", label: "Privacy Policy", group: "Legal" },
  { key: "terms", path: "/terms-and-conditions", label: "Terms & Conditions", group: "Legal" },
];

export const pageByKey = (key: string) => SEO_PAGES.find((page) => page.key === key);

/* ------------------------------------------------------------------ fields */

export type InternalLink = { href: string; label: string };

export type SeoValues = {
  seoTitle: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  relatedKeywords: string[];
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  imageAlt: string | null;
  noindex: boolean;
  internalLinks: InternalLink[];
};

export type FieldError = { field: string; message: string };

const LIMITS = {
  seoTitle: 120,
  metaDescription: 320,
  focusKeyword: 80,
  keyword: 60,
  keywords: 15,
  url: 1000,
  ogTitle: 120,
  ogDescription: 320,
  imageAlt: 200,
  linkLabel: 120,
  links: 20,
} as const;

export const oneLine = (value: unknown) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "");

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/** An image may be a full http(s) URL or a path on the site itself, such as /images/x.jpg. */
export const isImageRef = (value: string) => isHttpUrl(value) || (value.startsWith("/") && !value.startsWith("//") && !/\s/.test(value));

/**
 * An internal link is a path on this site. A full URL on the site's own domain is accepted and
 * reduced to its path, so pasting a link copied from the browser works.
 */
function internalPath(value: string, siteUrl: string) {
  const text = value.trim();
  if (text.startsWith("/") && !text.startsWith("//") && !/\s/.test(text)) return text;
  if (!isHttpUrl(text)) return undefined;
  const url = new URL(text);
  const host = new URL(siteUrl).hostname.replace(/^www\./, "");
  if (url.hostname.replace(/^www\./, "") !== host) return undefined;
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Validates the SEO fields a console form sends. Unknown keys are ignored. */
export function parseSeoFields(body: unknown, siteUrl: string): { values: SeoValues; errors: FieldError[] } {
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const errors: FieldError[] = [];
  const text = (field: keyof typeof LIMITS, key: string, label: string) => {
    const value = oneLine(input[key]);
    if (value.length > LIMITS[field]) errors.push({ field: key, message: `${label} must be ${LIMITS[field]} characters or fewer.` });
    return value || null;
  };

  const seoTitle = text("seoTitle", "seoTitle", "SEO title");
  const metaDescription = text("metaDescription", "metaDescription", "Meta description");
  const focusKeyword = text("focusKeyword", "focusKeyword", "Focus keyword");
  const ogTitle = text("ogTitle", "ogTitle", "OG title");
  const ogDescription = text("ogDescription", "ogDescription", "OG description");
  const imageAlt = text("imageAlt", "imageAlt", "Image alt text");

  const rawKeywords = Array.isArray(input.relatedKeywords)
    ? input.relatedKeywords
    : typeof input.relatedKeywords === "string" ? input.relatedKeywords.split(",") : [];
  const relatedKeywords = [...new Set(rawKeywords.map(oneLine).filter(Boolean))];
  if (relatedKeywords.length > LIMITS.keywords) errors.push({ field: "relatedKeywords", message: `Use at most ${LIMITS.keywords} related keywords.` });
  if (relatedKeywords.some((keyword) => keyword.length > LIMITS.keyword)) errors.push({ field: "relatedKeywords", message: `Each keyword must be ${LIMITS.keyword} characters or fewer.` });

  const canonicalUrl = oneLine(input.canonicalUrl) || null;
  if (canonicalUrl && (!isHttpUrl(canonicalUrl) || canonicalUrl.length > LIMITS.url)) {
    errors.push({ field: "canonicalUrl", message: "Canonical URL must be a full address starting with https://." });
  }

  const ogImage = oneLine(input.ogImage) || null;
  if (ogImage && (!isImageRef(ogImage) || ogImage.length > LIMITS.url)) {
    errors.push({ field: "ogImage", message: "OG image must be an https:// URL or a site path such as /images/photo.jpg." });
  }

  const noindex = input.noindex === true;

  const internalLinks: InternalLink[] = [];
  const rawLinks = Array.isArray(input.internalLinks) ? input.internalLinks : [];
  if (rawLinks.length > LIMITS.links) errors.push({ field: "internalLinks", message: `Use at most ${LIMITS.links} internal links.` });
  for (const raw of rawLinks.slice(0, LIMITS.links)) {
    const link = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const href = internalPath(String(link.href ?? ""), siteUrl);
    const label = oneLine(link.label);
    if (!href) {
      errors.push({ field: "internalLinks", message: `"${String(link.href ?? "").slice(0, 60)}" is not a page on this site. Use a path such as /off-plan.` });
      continue;
    }
    if (!label || label.length > LIMITS.linkLabel) {
      errors.push({ field: "internalLinks", message: `Every internal link needs link text of up to ${LIMITS.linkLabel} characters.` });
      continue;
    }
    if (!internalLinks.some((existing) => existing.href === href)) internalLinks.push({ href, label });
  }

  return {
    values: { seoTitle, metaDescription, focusKeyword, relatedKeywords, canonicalUrl, ogTitle, ogDescription, ogImage, imageAlt, noindex, internalLinks },
    errors,
  };
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** A URL slug: lowercase words joined by single hyphens. */
export function parseSlug(value: unknown): { slug?: string; error?: FieldError } {
  const slug = oneLine(value).toLowerCase();
  if (!slug) return { error: { field: "slug", message: "Slug is required." } };
  if (slug.length > 120 || !SLUG_RE.test(slug)) {
    return { error: { field: "slug", message: "Use lowercase letters, numbers and single hyphens only, e.g. palm-jumeirah-villa." } };
  }
  return { slug };
}

/* ------------------------------------------------------------------ rows */

export type SeoRow = {
  id: string;
  page_key: string | null;
  property_id: string | null;
  project_id: string | null;
  post_id: string | null;
  seo_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  related_keywords: string[] | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  image_alt: string | null;
  noindex: boolean | null;
  internal_links: InternalLink[] | null;
  previous_slugs: string[] | null;
  updated_by: string | null;
  updated_at: string | Date | null;
};

/** The console's view of a SEO record (camelCase, including the bookkeeping fields). */
export function seoToApi(row: SeoRow | null | undefined) {
  if (!row) return null;
  return {
    seoTitle: row.seo_title ?? null,
    metaDescription: row.meta_description ?? null,
    focusKeyword: row.focus_keyword ?? null,
    relatedKeywords: row.related_keywords ?? [],
    canonicalUrl: row.canonical_url ?? null,
    ogTitle: row.og_title ?? null,
    ogDescription: row.og_description ?? null,
    ogImage: row.og_image ?? null,
    imageAlt: row.image_alt ?? null,
    noindex: row.noindex === true,
    internalLinks: Array.isArray(row.internal_links) ? row.internal_links : [],
    previousSlugs: row.previous_slugs ?? [],
    updatedAt: row.updated_at ?? null,
  };
}

/** What the public site receives: only fields that render into the page, never who edited it. */
export function seoToPublic(row: SeoRow | null | undefined) {
  const seo = seoToApi(row);
  if (!seo) return null;
  const { previousSlugs: _previous, updatedAt: _updated, focusKeyword: _focus, relatedKeywords: _related, ...rendered } = seo;
  return rendered;
}

export type SeoTarget = { column: "page_key" | "property_id" | "project_id" | "post_id"; value: string };

export async function readSeo(target: SeoTarget) {
  return queryOne<SeoRow>(`select * from seo_meta where ${target.column} = $1`, [target.value]);
}

/**
 * Creates or replaces the SEO record for one target. For posts, the title and description are
 * stored on the post itself (posts.seo_title / seo_description), so they are not written here.
 */
export async function upsertSeo(target: SeoTarget, values: SeoValues, userId: string) {
  const isPost = target.column === "post_id";
  const row = await queryOne<SeoRow>(
    `insert into seo_meta (${target.column}, seo_title, meta_description, focus_keyword, related_keywords, canonical_url,
                           og_title, og_description, og_image, image_alt, noindex, internal_links, updated_by, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13, now())
     on conflict (${target.column}) do update set
       seo_title = excluded.seo_title, meta_description = excluded.meta_description,
       focus_keyword = excluded.focus_keyword, related_keywords = excluded.related_keywords,
       canonical_url = excluded.canonical_url, og_title = excluded.og_title, og_description = excluded.og_description,
       og_image = excluded.og_image, image_alt = excluded.image_alt, noindex = excluded.noindex,
       internal_links = excluded.internal_links, updated_by = excluded.updated_by, updated_at = now()
     returning *`,
    [
      target.value,
      isPost ? null : values.seoTitle,
      isPost ? null : values.metaDescription,
      values.focusKeyword,
      values.relatedKeywords,
      values.canonicalUrl,
      values.ogTitle,
      values.ogDescription,
      values.ogImage,
      values.imageAlt,
      values.noindex,
      JSON.stringify(isPost ? values.internalLinks : []),
      userId,
    ],
  );
  return row!;
}

/**
 * Records a slug a public record is leaving, so its old URL keeps resolving, and releases the
 * new slug from any record that used to have it.
 */
export async function rememberPreviousSlug(target: SeoTarget, oldSlug: string, newSlug: string, userId: string) {
  const sibling = target.column;
  await query(
    `update seo_meta set previous_slugs = array_remove(previous_slugs, $1)
      where ${sibling} is not null and $1 = any(previous_slugs)`,
    [newSlug],
  );
  await query(
    `insert into seo_meta (${sibling}, previous_slugs, updated_by, updated_at) values ($1, array[$2]::text[], $3, now())
     on conflict (${sibling}) do update set
       previous_slugs = array_append(array_remove(seo_meta.previous_slugs, $2), $2), updated_by = $3, updated_at = now()`,
    [target.value, oldSlug, userId],
  );
}

/* ------------------------------------------------------------------ settings */

export type SeoSettings = { siteUrl: string; defaultOgImage: string | null; defaultOgImageAlt: string | null };

export async function readSeoSettings(): Promise<SeoSettings> {
  const row = await queryOne<{ site_url: string | null; default_og_image: string | null; default_og_image_alt: string | null }>(
    `select site_url, default_og_image, default_og_image_alt from seo_settings where id = 'seo'`,
  );
  return {
    siteUrl: (row?.site_url || DEFAULT_SITE_URL).replace(/\/+$/, ""),
    defaultOgImage: row?.default_og_image ?? null,
    defaultOgImageAlt: row?.default_og_image_alt ?? null,
  };
}

export function parseSeoSettings(body: unknown): { patch: Partial<SeoSettings>; errors: FieldError[] } {
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const patch: Partial<SeoSettings> = {};
  const errors: FieldError[] = [];
  if ("siteUrl" in input) {
    const value = oneLine(input.siteUrl).replace(/\/+$/, "");
    let valid = false;
    try {
      const url = new URL(value);
      valid = url.protocol === "https:" && (url.pathname === "/" || url.pathname === "") && !url.search && !url.hash;
    } catch { /* invalid */ }
    if (!valid) errors.push({ field: "siteUrl", message: "Site URL must be the https:// address of the site, with no path, e.g. https://www.knchorizonrealtor.com." });
    else patch.siteUrl = value;
  }
  if ("defaultOgImage" in input) {
    const value = oneLine(input.defaultOgImage);
    if (value && (!isImageRef(value) || value.length > LIMITS.url)) errors.push({ field: "defaultOgImage", message: "Default OG image must be an https:// URL or a site path such as /images/photo.jpg." });
    else patch.defaultOgImage = value || null;
  }
  if ("defaultOgImageAlt" in input) {
    const value = oneLine(input.defaultOgImageAlt);
    if (value.length > LIMITS.imageAlt) errors.push({ field: "defaultOgImageAlt", message: `Alt text must be ${LIMITS.imageAlt} characters or fewer.` });
    else patch.defaultOgImageAlt = value || null;
  }
  return { patch, errors };
}

export async function writeSeoSettings(patch: Partial<SeoSettings>, userId: string) {
  const current = await readSeoSettings();
  const next = { ...current, ...patch };
  await query(
    `insert into seo_settings (id, site_url, default_og_image, default_og_image_alt, updated_by, updated_at)
     values ('seo', $1, $2, $3, $4, now())
     on conflict (id) do update set site_url = excluded.site_url, default_og_image = excluded.default_og_image,
       default_og_image_alt = excluded.default_og_image_alt, updated_by = excluded.updated_by, updated_at = now()`,
    [next.siteUrl, next.defaultOgImage, next.defaultOgImageAlt, userId],
  );
  return readSeoSettings();
}

/* ------------------------------------------------------------------ sitemap */

const xmlEscape = (value: string) => value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]!);

/** Only a record that is its own canonical belongs in the sitemap. */
const selfCanonical = (canonical: string | null | undefined, url: string) => !canonical || canonical.replace(/\/+$/, "") === url.replace(/\/+$/, "");

export type SitemapEntry = { loc: string; lastmod?: string };

/** Every public, indexable URL: static pages, published properties, projects and live posts. */
export async function sitemapEntries(): Promise<SitemapEntry[]> {
  const { siteUrl } = await readSeoSettings();
  const iso = (value: unknown) => (value ? new Date(String(value)).toISOString() : undefined);
  const entries: SitemapEntry[] = [];

  const pageRows = await query<SeoRow>(`select * from seo_meta where page_key is not null`);
  for (const page of SEO_PAGES) {
    const seo = pageRows.find((row) => row.page_key === page.key);
    const loc = `${siteUrl}${page.path === "/" ? "/" : page.path}`;
    if (seo?.noindex || !selfCanonical(seo?.canonical_url, loc)) continue;
    entries.push({ loc, lastmod: iso(seo?.updated_at) });
  }

  const listings: Array<[string, string, string]> = [
    ["properties", "property_id", "/properties/"],
    ["projects", "project_id", "/projects/"],
  ];
  for (const [table, column, prefix] of listings) {
    const rows = await query<{ slug: string; lastmod: string; noindex: boolean | null; canonical_url: string | null }>(
      `select t.slug, greatest(t.updated_at, coalesce(s.updated_at, t.updated_at)) as lastmod, s.noindex, s.canonical_url
         from ${table} t left join seo_meta s on s.${column} = t.id
        where t.published order by t.updated_at desc`,
    );
    for (const row of rows) {
      const loc = `${siteUrl}${prefix}${encodeURIComponent(row.slug)}`;
      if (row.noindex || !selfCanonical(row.canonical_url, loc)) continue;
      entries.push({ loc, lastmod: iso(row.lastmod) });
    }
  }

  const posts = await query<{ slug: string; lastmod: string; noindex: boolean | null; canonical_url: string | null }>(
    `select p.slug, greatest(p.updated_at, coalesce(s.updated_at, p.updated_at)) as lastmod, s.noindex, s.canonical_url
       from posts p left join seo_meta s on s.post_id = p.id
      where (p.published or p.status = 'published') order by p.published_at desc`,
  );
  for (const row of posts) {
    const loc = `${siteUrl}/blog/${encodeURIComponent(row.slug)}`;
    if (row.noindex || !selfCanonical(row.canonical_url, loc)) continue;
    entries.push({ loc, lastmod: iso(row.lastmod) });
  }
  return entries;
}

export function sitemapXml(entries: SitemapEntry[]) {
  const urls = entries
    .map((entry) => `  <url>\n    <loc>${xmlEscape(entry.loc)}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""}\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
