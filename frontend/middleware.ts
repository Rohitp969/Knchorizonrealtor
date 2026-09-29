/*
 * Share previews and first-pass SEO (Vercel Routing Middleware).
 *
 * WhatsApp, Facebook, LinkedIn and X read a page's <head> from the HTML the server sends and
 * never run the app, and that HTML is the same index.html for every address. So every link
 * showed the same title and the same picture. This file answers a page request with
 * index.html and the head of the page that was asked for already written into it: title,
 * description, canonical and the og: and twitter: tags, image included. The app then loads
 * as usual and keeps those tags up to date.
 *
 * The head comes from the same resolveHead() and the same data the app uses: the static
 * pages' own text and photos, the SEO console's overrides, and each listing, project,
 * article, community and developer from the public API.
 *
 * Whatever cannot be worked out (an address that is not a page, the API slow or down, an
 * error of any kind) is passed through untouched, so the worst case is the page exactly as it
 * was served before this file existed.
 *
 * The imports are relative and end in .ts because this file is built on its own, outside
 * Vite, where the "@/" alias does not exist.
 */
import { next } from '@vercel/functions/middleware';
import { PAGE_IMAGES, PAGE_META } from './src/lib/page-meta.ts';
import { SITE_URL, canonicalPath, projectDescription, propertyDescription, resolveHead, type Head, type HeadContext, type HeadInput, type SeoFields, type SeoSettings } from './src/lib/seo-head.ts';
import { areas, defaultDevelopers, defaultPosts, defaultProjects, defaultRemoteProperties } from './src/lib/site-data.ts';

/** What Vercel passes beside the request: a way to finish work after the response has gone. */
type RequestContext = { waitUntil?: (promise: Promise<unknown>) => void };

export const config = {
  // Pages only: no files (anything with a dot), API calls, built assets or the admin console.
  matcher: ['/', '/((?!api/|assets/|admin|.*\\.).*)'],
};

/** The public API, as in .env.production. SEO_API_URL replaces it without a code change. */
const API = (process.env.SEO_API_URL || 'https://knchorizonrealtor.onrender.com/api').replace(/\/+$/, '');

/** How long an answer from the API is used before asking again. */
const FRESH_MS = 60_000;
/** How long a failed request is remembered, so an API outage does not slow every page down. */
const RETRY_MS = 30_000;
/** The longest a page waits for the API before it is served with what is already known. */
const WAIT_MS = 2_500;
/** A request still unanswered after this long is abandoned. */
const GIVE_UP_MS = 10_000;
const MAX_CACHED = 300;

/** An article or community without a photo of its own opens with this one, as its page does. */
const FALLBACK_PHOTO = 'https://res.cloudinary.com/complaintreview/image/upload/v1790577279/knc-horizon/pages/dubai-skyline-from-sea.jpg';

/* ------------------------------------------------------------------ the API, remembered */

/** `null` is the API saying "no such record"; `undefined` is no answer. */
type Answer = unknown | null | undefined;
const cache = new Map<string, { until: number; value: Answer }>();
const inFlight = new Map<string, Promise<Answer>>();

function remember(path: string, value: Answer, forMs: number) {
  cache.delete(path);
  cache.set(path, { until: Date.now() + forMs, value });
  if (cache.size > MAX_CACHED) cache.delete(cache.keys().next().value as string);
}

function ask(path: string): Promise<Answer> {
  const running = inFlight.get(path);
  if (running) return running;
  const stop = new AbortController();
  const timer = setTimeout(() => stop.abort(), GIVE_UP_MS);
  const request = fetch(`${API}${path}`, { headers: { accept: 'application/json' }, signal: stop.signal })
    .then(async (response): Promise<Answer> => {
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`API answered ${response.status}`);
      return response.json();
    })
    .then((value) => {
      remember(path, value, FRESH_MS);
      return value;
    })
    .catch(() => {
      // Keep what was known before and do not ask again for a little while.
      const known = cache.get(path)?.value;
      remember(path, known, RETRY_MS);
      return known;
    })
    .finally(() => {
      clearTimeout(timer);
      inFlight.delete(path);
    });
  inFlight.set(path, request);
  return request;
}

async function api<T>(path: string, context?: RequestContext): Promise<T | null | undefined> {
  const known = cache.get(path);
  if (known && Date.now() < known.until) return known.value as T | null | undefined;
  const request = ask(path);
  // A slow answer still reaches the cache, for the next visitor.
  context?.waitUntil?.(request);
  // An older answer is used straight away while the new one is fetched behind the response.
  if (known && known.value !== undefined) return known.value as T | null;
  const tooLate = new Promise<undefined>((resolve) => setTimeout(resolve, WAIT_MS));
  const value = (await Promise.race([request, tooLate])) as T | null | undefined;
  // Still no answer: the visitors after this one are not made to wait for it as well.
  if (value === undefined && inFlight.has(path)) remember(path, undefined, RETRY_MS);
  return value;
}

/* ------------------------------------------------------------------ the page that was asked for */

type Listing = { slug: string; title: string; location: string; images?: string[]; image?: string };
type Article = { slug: string; title: string; excerpt?: string; image?: string; featuredImage?: string; seoTitle?: string; seoDescription?: string };
type Community = { slug: string; name: string; description?: string; image?: string };
type Developer = { slug: string; name: string; shortDescription?: string; description?: string; coverImage?: string };

const LIST_PAGES: Record<string, Set<string>> = {
  properties: new Set(['sale', 'rent', 'residential', 'commercial', 'investment', 'off-plan', 'filter', 'live']),
  projects: new Set(['featured', 'new-launches', 'off-plan', 'filter']),
};

type Page = { kind: string; input: (context?: RequestContext) => Promise<HeadInput | undefined> };

/** What the address is, by the routes in src/App.tsx; `undefined` when this file leaves it alone. */
function pageAt(path: string): Page | undefined {
  const meta = PAGE_META[path] ?? PAGE_META[canonicalPath(path)];
  if (meta) {
    const photo: [string, string] | undefined = PAGE_IMAGES[path] ?? PAGE_IMAGES[canonicalPath(path)];
    return { kind: 'page', input: async () => ({ title: meta[0], description: meta[1], path, image: photo?.[0], imageAlt: photo?.[1] }) };
  }

  const match = /^\/(properties|property|projects|project|blog|journal|communities|developers)\/([^/]{1,200})$/.exec(path);
  if (!match) return undefined;
  const [, section, slug] = match;
  if (LIST_PAGES[section]?.has(slug)) return undefined;
  const id = encodeURIComponent(slug);

  if (section === 'properties' || section === 'property') {
    return {
      kind: 'property',
      input: async (context) => {
        const data = await api<{ property?: Listing; seo?: SeoFields | null }>(`/public/properties/${id}`, context);
        const property = data?.property ?? (defaultRemoteProperties as Array<Listing & { id?: string }>).find((item) => item.slug === slug || item.id === slug);
        if (!property) return undefined;
        return {
          title: property.title,
          description: propertyDescription(property.title, property.location),
          path: `/properties/${property.slug}`,
          seo: data?.seo ?? null,
          image: property.images?.[0],
          imageAlt: property.title,
        };
      },
    };
  }

  if (section === 'projects' || section === 'project') {
    return {
      kind: 'project',
      input: async (context) => {
        const data = await api<{ project?: Listing; seo?: SeoFields | null }>(`/public/projects/${id}`, context);
        const project = data?.project ?? (defaultProjects as Array<Listing & { id?: string }>).find((item) => item.slug === slug || item.id === slug);
        if (!project) return undefined;
        return {
          title: project.title,
          description: projectDescription(project.title, project.location),
          path: `/projects/${project.slug}`,
          seo: data?.seo ?? null,
          image: project.image,
          imageAlt: project.title,
        };
      },
    };
  }

  if (section === 'blog' || section === 'journal') {
    return {
      kind: 'article',
      input: async (context) => {
        const data = await api<{ blog?: Article; seo?: SeoFields | null }>(`/blogs/${id}`, context);
        const post = data?.blog ?? (defaultPosts as Article[]).find((item) => item.slug === slug);
        if (!post) return undefined;
        // The blog admin saves the title as the SEO title by default; only a different one is a real override.
        const customTitle = post.seoTitle && post.seoTitle.trim() !== post.title.trim() ? post.seoTitle : null;
        return {
          title: post.title,
          description: post.excerpt ?? '',
          path: `/blog/${post.slug}`,
          seo: { ...(data?.seo ?? {}), seoTitle: customTitle, metaDescription: post.seoDescription || null },
          image: post.featuredImage || post.image || FALLBACK_PHOTO,
          imageAlt: post.title,
          type: 'article',
        };
      },
    };
  }

  if (section === 'communities') {
    return {
      kind: 'community',
      input: async (context) => {
        const data = await api<{ communities?: Community[] }>('/public/communities', context);
        const community = data?.communities?.find((item) => item.slug === slug);
        const area = areas.find((item) => item.id === slug);
        const name = community?.name ?? area?.name;
        if (!name) return undefined;
        return {
          title: `${name} property guide`,
          description: community?.description || area?.detail || `Properties and off-plan projects in ${name}, Dubai.`,
          path,
          image: community?.image || area?.image || FALLBACK_PHOTO,
          imageAlt: name,
        };
      },
    };
  }

  return {
    kind: 'developer',
    input: async (context) => {
      const key = slug.trim().toLowerCase();
      const data = await api<{ developer?: Developer }>(`/developers/${encodeURIComponent(key)}`, context);
      const developer = data?.developer ?? (defaultDevelopers as Developer[]).find((item) => item.slug === key);
      if (!developer) return undefined;
      return {
        // The same words as DeveloperDetailPage.
        title: `KNC Horizon Realtor | ${developer.name}`,
        description: developer.shortDescription || developer.description || 'Explore verified Dubai developers with KNC Horizon Realtor.',
        path,
        image: developer.coverImage,
        imageAlt: developer.name,
      };
    },
  };
}

/* ------------------------------------------------------------------ writing it into index.html */

const shells = new Map<string, { until: number; html: string }>();

/** This deployment's own index.html, as built by Vite. */
async function appShell(origin: string) {
  const known = shells.get(origin);
  if (known && Date.now() < known.until) return known.html;
  const stop = new AbortController();
  const timer = setTimeout(() => stop.abort(), 3_000);
  try {
    const response = await fetch(`${origin}/index.html`, { headers: { accept: 'text/html' }, signal: stop.signal });
    const html = response.ok ? await response.text() : '';
    // Anything else (a sign-in wall on a preview deployment, an error page) is not the app.
    if (!html.includes('<div id="root">') || !/<\/head>/i.test(html)) return undefined;
    shells.set(origin, { until: Date.now() + 300_000, html });
    return html;
  } finally {
    clearTimeout(timer);
  }
}

const escaped = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** index.html with this head in it. Tags are replaced where they stand, so nothing appears twice. */
export function withHead(html: string, head: Head) {
  let page = html;
  // Replacements are functions so a "$" in a title is kept as it is.
  const put = (pattern: RegExp, tag: string) => {
    if (pattern.test(page)) page = page.replace(pattern, () => tag);
    else if (tag) page = page.replace(/<\/head>/i, () => `  ${tag}\n  </head>`);
  };
  const meta = (attribute: 'name' | 'property', key: string, content: string) =>
    put(new RegExp(`<meta\\s+${attribute}="${key}"[^>]*>`, 'i'), content ? `<meta ${attribute}="${key}" content="${escaped(content)}" />` : '');

  put(/<title>[^<]*<\/title>/i, `<title>${escaped(head.title)}</title>`);
  meta('name', 'description', head.description);
  meta('name', 'robots', head.robots);
  put(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${escaped(head.canonical)}" />`);
  meta('property', 'og:title', head.ogTitle);
  meta('property', 'og:description', head.ogDescription);
  meta('property', 'og:type', head.ogType);
  meta('property', 'og:url', head.canonical);
  meta('property', 'og:image', head.ogImage);
  meta('property', 'og:image:alt', head.ogImageAlt);
  meta('name', 'twitter:title', head.ogTitle);
  meta('name', 'twitter:description', head.ogDescription);
  meta('name', 'twitter:image', head.ogImage);
  meta('name', 'twitter:image:alt', head.ogImageAlt);
  return page;
}

type SiteSettings = { siteName?: string; seoDescription?: string };
type SeoData = { settings?: Partial<SeoSettings>; pages?: Record<string, SeoFields> };

export default async function middleware(request: Request, context?: RequestContext) {
  try {
    if (request.method !== 'GET') return next();
    const url = new URL(request.url);
    const path = decodeURIComponent(url.pathname).replace(/\/+$/, '') || '/';
    const page = pageAt(path);
    if (!page) return next();

    const [html, input, site, seo] = await Promise.all([
      appShell(url.origin),
      page.input(context),
      api<{ settings?: SiteSettings }>('/public/settings', context),
      api<SeoData>('/public/seo', context),
    ]);
    if (!html || !input) return next();

    const ctx: HeadContext = {
      siteName: site?.settings?.siteName?.trim() || 'KNC Horizon Realtor',
      siteUrl: seo?.settings?.siteUrl || SITE_URL,
      fallbackDescription: site?.settings?.seoDescription?.trim() || '',
      defaultOgImage: seo?.settings?.defaultOgImage,
      defaultOgImageAlt: seo?.settings?.defaultOgImageAlt,
    };
    // As in the app: a page that brings no SEO of its own takes the console's override for its path.
    const fields = input.seo === undefined ? seo?.pages?.[canonicalPath(input.path)] : input.seo;
    // A static page's alt text describes its own photo, so it is dropped once the console sets another image.
    const imageAlt = page.kind === 'page' && fields?.ogImage ? undefined : input.imageAlt;
    const head = resolveHead({ ...input, seo: fields, imageAlt }, ctx);

    return new Response(withHead(html, head), {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=0, must-revalidate',
        'x-seo-head': page.kind,
      },
    });
  } catch {
    return next();
  }
}
