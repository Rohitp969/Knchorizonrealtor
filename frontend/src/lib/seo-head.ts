/*
 * The rules that turn a page's own text and its SEO console fields into a <head>.
 *
 * This file is plain code with no imports, because two things run it: the app (through
 * seo.ts, which re-exports everything here) and middleware.ts, which writes the same head
 * into the HTML for WhatsApp, Facebook and the other readers that do not run the app.
 */

/** The public site's canonical origin (the apex domain redirects here). */
export const SITE_URL = 'https://www.knchorizonrealtor.com';
/** Share image used when a page has none of its own and the console sets no default. */
export const DEFAULT_OG_IMAGE = 'https://res.cloudinary.com/complaintreview/image/upload/v1790577261/knc-horizon/communities/hero-dubai-skyline.jpg';

export type InternalLink = { href: string; label: string };

/** The SEO fields a page renders. Every one is optional; empty means "use the page's own". */
export type SeoFields = {
  seoTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  imageAlt?: string | null;
  noindex?: boolean;
  internalLinks?: InternalLink[];
};

export type SeoSettings = { siteUrl: string; defaultOgImage: string | null; defaultOgImageAlt: string | null };

/*
 * Routes that render the same page as another path. The canonical URL of an alias points at
 * the main path, so search engines index one copy instead of two.
 */
export const PATH_ALIASES: Record<string, string> = {
  '/projects': '/off-plan',
  '/journal': '/blog',
  '/areas': '/communities',
  '/terms': '/terms-and-conditions',
  '/privacy': '/privacy-policy',
  '/properties/live': '/properties',
};

export function canonicalPath(path: string) {
  const clean = (path.split(/[?#]/)[0] || '/').replace(/\/+$/, '') || '/';
  if (PATH_ALIASES[clean]) return PATH_ALIASES[clean];
  if (clean.startsWith('/journal/')) return clean.replace('/journal/', '/blog/');
  return clean;
}

export const absoluteUrl = (value: string, siteUrl: string) =>
  /^https?:\/\//i.test(value) ? value : `${siteUrl}${value.startsWith('/') ? '' : '/'}${value}`;

/* ------------------------------------------------------------------ resolving the head */

export type HeadInput = {
  /** The page's own title, without the site name. */
  title: string;
  /** The page's own description. */
  description: string;
  /** The path this page lives at; aliases are mapped to their canonical path. */
  path: string;
  /** Console SEO for this page. `undefined` looks up the static-page override for `path`. */
  seo?: SeoFields | null;
  /** The page's main image, used for the share card when no OG image is set. */
  image?: string | null;
  imageAlt?: string | null;
  type?: 'website' | 'article';
  noindex?: boolean;
  jsonLd?: Record<string, unknown>[];
};

export type HeadContext = {
  siteName: string;
  siteUrl: string;
  fallbackDescription: string;
  defaultOgImage?: string | null;
  defaultOgImageAlt?: string | null;
};

export type Head = {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogImageAlt: string;
  ogType: string;
  jsonLd: Record<string, unknown>[];
};

const filled = (value: string | null | undefined) => (value && value.trim() ? value.trim() : undefined);

export function resolveHead(input: HeadInput, ctx: HeadContext): Head {
  const seo = input.seo ?? {};
  const title = filled(seo.seoTitle) ?? (input.title ? `${input.title} | ${ctx.siteName}` : ctx.siteName);
  const description = filled(seo.metaDescription) ?? filled(input.description) ?? ctx.fallbackDescription;
  const path = canonicalPath(input.path);
  const canonical = filled(seo.canonicalUrl) ?? `${ctx.siteUrl}${path}`;
  const defaultImage = filled(ctx.defaultOgImage) ?? DEFAULT_OG_IMAGE;
  const image = filled(seo.ogImage) ?? filled(input.image) ?? defaultImage;
  const imageAlt = filled(seo.imageAlt) ?? filled(input.imageAlt) ?? (image === defaultImage ? filled(ctx.defaultOgImageAlt) : undefined) ?? '';
  return {
    title,
    description,
    canonical,
    robots: input.noindex || seo.noindex ? 'noindex, follow' : 'index, follow',
    ogTitle: filled(seo.ogTitle) ?? title,
    ogDescription: filled(seo.ogDescription) ?? description,
    ogImage: absoluteUrl(image, ctx.siteUrl),
    ogImageAlt: imageAlt,
    ogType: input.type ?? 'website',
    jsonLd: input.jsonLd ?? [],
  };
}

/* ------------------------------------------------------------------ built-in descriptions */

export const propertyDescription = (title: string, location: string) =>
  `${title} in ${location}. View details and request property information from KNC Horizon Realtor.`;
export const projectDescription = (title: string, location: string) =>
  `${title} in ${location}. Explore the project and request its brief from KNC Horizon Realtor.`;
