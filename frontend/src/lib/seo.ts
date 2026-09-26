import { createContext, createElement, useContext, useEffect, useId, useState, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useSiteSettings } from '@/lib/site-settings';

/*
 * Page <head> for the whole site: title, description, canonical URL, robots, Open Graph,
 * Twitter card and JSON-LD structured data.
 *
 * Values come from the SEO console (static pages via /public/seo, listings and articles
 * with their own API responses) and fall back to each page's built-in title and description.
 * resolveHead() is also what the console's Google preview uses, so the preview and the live
 * page are always built by the same rules.
 */

/** The public site's canonical origin (the apex domain redirects here). */
export const SITE_URL = 'https://www.knchorizonrealtor.com';
/** Share image used when a page has none of its own and the console sets no default. */
export const DEFAULT_OG_IMAGE = '/images/hero-dubai-skyline.jpg';

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

/* ------------------------------------------------------------------ SEO data from the API */

type SeoState = { settings: SeoSettings; pages: Record<string, SeoFields> };
const SEO_FALLBACK: SeoState = { settings: { siteUrl: SITE_URL, defaultOgImage: null, defaultOgImageAlt: null }, pages: {} };
const SeoContext = createContext<SeoState>(SEO_FALLBACK);

/** Loads the console's page overrides once; until (or unless) they arrive, built-in values apply. */
export function SeoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SeoState>(SEO_FALLBACK);
  useEffect(() => {
    let active = true;
    apiFetch<Partial<SeoState>>('/public/seo')
      .then((data) => {
        if (!active) return;
        setState({ settings: { ...SEO_FALLBACK.settings, ...(data.settings ?? {}) }, pages: data.pages ?? {} });
      })
      .catch(() => { /* keep the built-in titles and descriptions */ });
    return () => { active = false; };
  }, []);
  return createElement(SeoContext.Provider, { value: state }, children);
}

export const useSeoData = () => useContext(SeoContext);

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

/* ------------------------------------------------------------------ writing the head */

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!content) {
    tag?.remove();
    return;
  }
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function writeHead(head: Head) {
  document.title = head.title;
  setMeta('name', 'description', head.description);
  setMeta('name', 'robots', head.robots);
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = head.canonical;
  setMeta('property', 'og:title', head.ogTitle);
  setMeta('property', 'og:description', head.ogDescription);
  setMeta('property', 'og:type', head.ogType);
  setMeta('property', 'og:url', head.canonical);
  setMeta('property', 'og:image', head.ogImage);
  setMeta('property', 'og:image:alt', head.ogImageAlt);
  setMeta('name', 'twitter:title', head.ogTitle);
  setMeta('name', 'twitter:description', head.ogDescription);
  setMeta('name', 'twitter:image', head.ogImage);
  setMeta('name', 'twitter:image:alt', head.ogImageAlt);
  document.head.querySelectorAll('script[data-seo-jsonld]').forEach((node) => node.remove());
  for (const data of head.jsonLd) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.seoJsonld = '';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }
}

/*
 * Several components can describe the same page (the router's per-path defaults and the page
 * itself). Each registers with a priority; the highest wins, and the newest among equals, so
 * the result no longer depends on which effect happened to run last.
 */
const entries = new Map<string, { priority: number; order: number; head: Head }>();
let registrations = 0;
function applyTop() {
  let top: { priority: number; order: number; head: Head } | undefined;
  for (const entry of entries.values()) {
    if (!top || entry.priority > top.priority || (entry.priority === top.priority && entry.order > top.order)) top = entry;
  }
  if (top) writeHead(top.head);
}

/** The route's own defaults. */
export const PRIORITY_FALLBACK = 0;
/** A page describing itself (detail pages, listing pages). */
export const PRIORITY_PAGE = 1;
/** A static page listed in PAGE_META: its built-in text and console overrides. */
export const PRIORITY_STATIC = 2;

export function useHead(input: HeadInput | null, priority: number = PRIORITY_PAGE) {
  const id = useId();
  const { siteName, seoDescription } = useSiteSettings();
  const { settings, pages } = useSeoData();
  const key = JSON.stringify(input);

  useEffect(() => {
    if (!input) {
      entries.delete(id);
      applyTop();
      return;
    }
    const seo = input.seo === undefined ? pages[canonicalPath(input.path)] : input.seo;
    const head = resolveHead(
      { ...input, seo },
      { siteName, siteUrl: settings.siteUrl || SITE_URL, fallbackDescription: seoDescription, defaultOgImage: settings.defaultOgImage, defaultOgImageAlt: settings.defaultOgImageAlt },
    );
    entries.set(id, { priority, order: entries.get(id)?.order ?? ++registrations, head });
    applyTop();
    // `key` stands in for `input`, which is a fresh object on every render.
  }, [id, key, priority, siteName, seoDescription, settings, pages]);

  useEffect(() => () => {
    entries.delete(id);
    applyTop();
  }, [id]);
}

type PageMetaOptions = Omit<Partial<HeadInput>, 'title' | 'description'> & { priority?: number };

/**
 * Sets the page's head. The site name and the fallback description come from Admin > Settings,
 * so renaming the site there renames every tab; SEO console values override per field.
 */
export function usePageMeta(title: string, description: string, options: PageMetaOptions = {}) {
  const [location] = useLocation();
  const { priority = PRIORITY_PAGE, ...rest } = options;
  useHead({ ...rest, title, description, path: rest.path ?? location }, priority);
}

/* ------------------------------------------------------------------ structured data */

type Contact = { siteName: string; siteUrl: string; phone?: string; email?: string };

export function organizationJsonLd({ siteName, siteUrl, phone, email }: Contact) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: siteName,
    url: `${siteUrl}/`,
    logo: `${siteUrl}/brand/knc-logo-stacked.svg`,
    image: `${siteUrl}${DEFAULT_OG_IMAGE}`,
    ...(phone ? { telephone: phone } : {}),
    ...(email ? { email } : {}),
    address: { '@type': 'PostalAddress', addressLocality: 'Dubai', addressCountry: 'AE' },
    areaServed: { '@type': 'City', name: 'Dubai' },
  };
}

export function listingJsonLd({ url, name, description, image, price, currency }: {
  url: string; name: string; description: string; image?: string | null; price?: number; currency?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name,
    description,
    url,
    ...(image ? { image } : {}),
    ...(price && price > 0 ? { offers: { '@type': 'Offer', price, priceCurrency: currency || 'AED' } } : {}),
  };
}

export function articleJsonLd({ url, headline, description, image, datePublished, dateModified, author, siteName, siteUrl }: {
  url: string; headline: string; description: string; image?: string | null; datePublished?: string;
  dateModified?: string; author?: string; siteName: string; siteUrl: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: headline.slice(0, 110),
    description,
    mainEntityOfPage: url,
    ...(image ? { image } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    author: { '@type': 'Organization', name: author || siteName },
    publisher: { '@type': 'Organization', name: siteName, logo: { '@type': 'ImageObject', url: `${siteUrl}/brand/knc-logo-stacked.svg` } },
  };
}
