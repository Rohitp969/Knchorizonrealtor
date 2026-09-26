import { PAGE_META } from '@/lib/page-meta';
import { resolveHead, type Head, type HeadContext, type HeadInput, type SeoFields } from '@/lib/seo';
import type { SeoArticleRow, SeoListing, SeoOverview, SeoPageRow, SeoRecord } from './seo-api';

/*
 * What the console shows and checks. The previews call the same resolveHead() the public
 * pages use, with the same built-in titles and descriptions, so what you see here is what
 * the page puts in its <head>.
 */

/** Google shows roughly this much of a title and a description before cutting them off. */
export const TITLE_MAX = 60;
export const TITLE_MIN = 25;
export const DESCRIPTION_MAX = 160;
export const DESCRIPTION_MIN = 70;

export type SeoTarget =
  | { kind: 'page'; item: SeoPageRow }
  | { kind: 'property'; item: SeoListing }
  | { kind: 'project'; item: SeoListing }
  | { kind: 'article'; item: SeoArticleRow };

/* ------------------------------------------------------------------ built-in values */

export const propertyDescription = (title: string, location: string) =>
  `${title} in ${location}. View details and request property information from KNC Horizon Realtor.`;
export const projectDescription = (title: string, location: string) =>
  `${title} in ${location}. Explore the project and request its brief from KNC Horizon Realtor.`;

export function pageDefaults(path: string) {
  const [title, description] = PAGE_META[path] ?? ['', ''];
  return { title, description };
}

/** The blog admin saves the title as the SEO title by default; only a different one counts as set. */
export const articleSeoTitle = (title: string, seoTitle: string | null | undefined) =>
  seoTitle && seoTitle.trim() && seoTitle.trim() !== title.trim() ? seoTitle.trim() : null;

export function pathFor(target: SeoTarget) {
  if (target.kind === 'page') return target.item.path;
  if (target.kind === 'property') return `/properties/${target.item.slug}`;
  if (target.kind === 'project') return `/projects/${target.item.slug}`;
  return `/blog/${target.item.slug}`;
}

export const labelFor = (target: SeoTarget) => (target.kind === 'page' ? target.item.label : target.item.title);

/** The SEO fields a target currently renders with. */
export function seoFieldsFor(target: SeoTarget): SeoFields | null {
  if (target.kind !== 'article') return target.item.seo;
  const { item } = target;
  return { ...(item.seo ?? {}), seoTitle: articleSeoTitle(item.title, item.seoTitle), metaDescription: item.seoDescription || null };
}

/** The input the public page would pass to resolveHead() for this target. */
export function headInputFor(target: SeoTarget, seo: SeoFields | null = seoFieldsFor(target)): HeadInput {
  const path = pathFor(target);
  if (target.kind === 'page') return { ...pageDefaults(path), path, seo };
  if (target.kind === 'article') {
    const { item } = target;
    return { title: item.title, description: item.excerpt, path, seo, image: item.image, imageAlt: item.title, type: 'article' };
  }
  const { item } = target;
  const description = target.kind === 'property' ? propertyDescription(item.title, item.location) : projectDescription(item.title, item.location);
  return { title: item.title, description, path, seo, image: item.image, imageAlt: item.title };
}

export const headFor = (target: SeoTarget, ctx: HeadContext, seo?: SeoFields | null) => resolveHead(headInputFor(target, seo), ctx);

/* ------------------------------------------------------------------ audit */

export type IssueCode =
  | 'missing-title'
  | 'missing-description'
  | 'title-long'
  | 'title-short'
  | 'description-long'
  | 'description-short'
  | 'missing-alt'
  | 'duplicate-title'
  | 'duplicate-description'
  | 'duplicate-slug'
  | 'bad-slug'
  | 'missing-keyword'
  | 'keyword-not-in-title'
  | 'external-canonical'
  | 'noindex';

export type Severity = 'error' | 'warning' | 'info';

export const ISSUES: Record<IssueCode, { label: string; severity: Severity; help: string }> = {
  'duplicate-slug': { label: 'Duplicate slugs', severity: 'error', help: 'Two records answer on the same address. Give one of them a different slug.' },
  'bad-slug': { label: 'Invalid slugs', severity: 'error', help: 'Slugs should be lowercase words joined by single hyphens.' },
  'missing-title': { label: 'Missing SEO titles', severity: 'warning', help: 'No SEO title is set, so the page uses its automatic title.' },
  'missing-description': { label: 'Missing meta descriptions', severity: 'warning', help: 'No meta description is set, so Google picks text from the page or uses the automatic one.' },
  'missing-alt': { label: 'Missing image alt text', severity: 'warning', help: 'The main image has no alt text describing what it shows.' },
  'duplicate-title': { label: 'Duplicate titles', severity: 'warning', help: 'Several pages share the same title. Each page should have its own.' },
  'duplicate-description': { label: 'Duplicate descriptions', severity: 'warning', help: 'Several pages share the same meta description.' },
  'title-long': { label: 'Titles too long', severity: 'warning', help: `Google cuts titles off after about ${TITLE_MAX} characters.` },
  'description-long': { label: 'Descriptions too long', severity: 'warning', help: `Google cuts descriptions off after about ${DESCRIPTION_MAX} characters.` },
  'external-canonical': { label: 'Canonical points to another site', severity: 'warning', help: 'The canonical URL sends search engines to a different domain.' },
  'title-short': { label: 'Titles too short', severity: 'info', help: `A title under ${TITLE_MIN} characters misses room to describe the page.` },
  'description-short': { label: 'Descriptions too short', severity: 'info', help: `A description under ${DESCRIPTION_MIN} characters misses room to sell the click.` },
  'missing-keyword': { label: 'No focus keyword', severity: 'info', help: 'Set the phrase this page should rank for, so the checks can use it.' },
  'keyword-not-in-title': { label: 'Focus keyword not in title', severity: 'info', help: 'The focus keyword does not appear in the SEO title.' },
  'noindex': { label: 'Hidden from search (noindex)', severity: 'info', help: 'These pages ask search engines not to index them and are left out of the sitemap.' },
};

export type AuditedItem = { key: string; target: SeoTarget; label: string; path: string; head: Head; issues: IssueCode[] };

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const norm = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

/** Every live page on the site (static pages, published listings and articles) with its issues. */
export function auditSite(overview: SeoOverview, ctx: HeadContext): AuditedItem[] {
  const targets: SeoTarget[] = [
    ...overview.pages.map((item) => ({ kind: 'page' as const, item })),
    ...overview.properties.filter((item) => item.published).map((item) => ({ kind: 'property' as const, item })),
    ...overview.projects.filter((item) => item.published).map((item) => ({ kind: 'project' as const, item })),
    ...overview.articles.filter((item) => item.status === 'published').map((item) => ({ kind: 'article' as const, item })),
  ];
  const siteHost = (() => { try { return new URL(ctx.siteUrl).hostname.replace(/^www\./, ''); } catch { return ''; } })();

  // Slugs in use per table, including slugs other records keep answering on.
  const slugUse = new Map<string, number>();
  const countSlugs = (prefix: string, rows: { slug: string; seo: SeoRecord | null }[]) => {
    for (const row of rows) {
      for (const slug of [row.slug, ...(row.seo?.previousSlugs ?? [])]) {
        slugUse.set(`${prefix}:${slug}`, (slugUse.get(`${prefix}:${slug}`) ?? 0) + 1);
      }
    }
  };
  countSlugs('property', overview.properties);
  countSlugs('project', overview.projects);
  countSlugs('article', overview.articles);

  const items = targets.map((target) => {
    const seo = target.item.seo;
    const fields = seoFieldsFor(target);
    const head = headFor(target, ctx);
    const issues: IssueCode[] = [];
    const indexed = !(fields?.noindex ?? false);

    if (!fields?.seoTitle?.trim()) issues.push('missing-title');
    if (!fields?.metaDescription?.trim()) issues.push('missing-description');
    if (head.title.length > TITLE_MAX) issues.push('title-long');
    if (head.title.length < TITLE_MIN) issues.push('title-short');
    if (head.description.length > DESCRIPTION_MAX) issues.push('description-long');
    if (head.description.length < DESCRIPTION_MIN) issues.push('description-short');

    const hasImage = target.kind === 'page' ? Boolean(seo?.ogImage) : Boolean(target.item.image);
    if (hasImage && !seo?.imageAlt?.trim()) issues.push('missing-alt');

    if (target.kind !== 'page') {
      const slug = target.item.slug;
      if (!SLUG_RE.test(slug)) issues.push('bad-slug');
      if ((slugUse.get(`${target.kind}:${slug}`) ?? 0) > 1) issues.push('duplicate-slug');
    }

    const keyword = seo?.focusKeyword?.trim();
    if (!keyword) issues.push('missing-keyword');
    else if (!head.title.toLowerCase().includes(keyword.toLowerCase())) issues.push('keyword-not-in-title');

    const canonical = fields?.canonicalUrl?.trim();
    if (canonical) {
      try {
        if (new URL(canonical).hostname.replace(/^www\./, '') !== siteHost) issues.push('external-canonical');
      } catch { issues.push('external-canonical'); }
    }
    if (!indexed) issues.push('noindex');

    const path = pathFor(target);
    const key = target.kind === 'page' ? `page:${target.item.key}` : `${target.kind}:${target.item.id}`;
    return { key, target, label: labelFor(target), path, head, issues };
  });

  // Duplicate titles and descriptions among the pages search engines may index.
  const indexedItems = items.filter((item) => !item.issues.includes('noindex'));
  const markDuplicates = (pick: (item: AuditedItem) => string, code: IssueCode) => {
    const groups = new Map<string, AuditedItem[]>();
    for (const item of indexedItems) {
      const value = norm(pick(item));
      if (!value) continue;
      groups.set(value, [...(groups.get(value) ?? []), item]);
    }
    for (const group of groups.values()) if (group.length > 1) group.forEach((item) => item.issues.push(code));
  };
  markDuplicates((item) => item.head.title, 'duplicate-title');
  markDuplicates((item) => item.head.description, 'duplicate-description');

  return items;
}

export const SEVERITY_ORDER: Record<Severity, number> = { error: 0, warning: 1, info: 2 };
