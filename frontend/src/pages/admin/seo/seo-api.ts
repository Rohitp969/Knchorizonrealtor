import { adminRequest, type AdminUser, type MediaItem } from '@/lib/admin-api';
import type { InternalLink } from '@/lib/seo';

/*
 * SEO console API. Every route is permission-checked on the server (routes/seo.ts): SEO
 * managers reach /seo/* only, and /admin/seo-managers is for administrators.
 */

export type SeoRecord = {
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
  previousSlugs: string[];
  updatedAt: string | null;
};

export type SeoSettings = { siteUrl: string; defaultOgImage: string | null; defaultOgImageAlt: string | null };

export type SeoPageRow = { key: string; path: string; label: string; group: string; seo: SeoRecord | null };

export type SeoListing = {
  id: string;
  slug: string;
  title: string;
  location: string;
  description: string;
  image: string | null;
  published: boolean;
  updatedAt: string;
  seo: SeoRecord | null;
  community?: string;
  type?: string;
  status?: string;
  developer?: string;
  category?: string;
};

export type ArticleStatus = 'draft' | 'review' | 'published';

export type SeoArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  status: ArticleStatus;
  publishedAt: string;
  image: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
  seo: SeoRecord | null;
};

export type SeoOverview = {
  user: AdminUser;
  settings: SeoSettings;
  pages: SeoPageRow[];
  properties: SeoListing[];
  projects: SeoListing[];
  articles: SeoArticleRow[];
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  featuredImage: string;
  status: ArticleStatus;
  publishedAt: string;
  updatedAt: string;
  seoTitle: string | null;
  seoDescription: string | null;
};

/** The SEO fields as a form sends them. */
export type SeoInput = {
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  relatedKeywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  imageAlt: string;
  noindex: boolean;
  internalLinks: InternalLink[];
};

export type ArticleInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  featuredImage: string;
  status: ArticleStatus;
  seo: SeoInput;
};

export type SeoManager = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  canPublishArticles: boolean;
  createdAt: string;
  updatedAt: string | null;
};

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

export const seoApi = {
  overview: () => adminRequest<SeoOverview>('/seo/overview'),
  savePage: (key: string, seo: SeoInput) => adminRequest<{ seo: SeoRecord }>(`/seo/pages/${key}`, json('PUT', seo)),
  saveListing: (kind: 'properties' | 'projects', id: string, body: SeoInput & { slug: string }) =>
    adminRequest<{ slug: string; seo: SeoRecord }>(`/seo/${kind}/${id}`, json('PUT', body)),
  article: (id: string) => adminRequest<{ article: Article; seo: SeoRecord | null }>(`/seo/articles/${id}`),
  createArticle: (body: ArticleInput) => adminRequest<{ article: Article; seo: SeoRecord }>('/seo/articles', json('POST', body)),
  updateArticle: (id: string, body: ArticleInput) => adminRequest<{ article: Article; seo: SeoRecord }>(`/seo/articles/${id}`, json('PUT', body)),
  media: () => adminRequest<{ items: MediaItem[] }>('/seo/media').then((data) => data.items ?? []),
  upload: (file: File) => {
    const body = new FormData();
    body.append('image', file);
    body.append('folder', 'knc-horizon');
    return adminRequest<{ url: string; warning?: string }>('/seo/uploads', { method: 'POST', body });
  },
  saveSettings: (patch: Partial<SeoSettings>) => adminRequest<{ settings: SeoSettings }>('/seo/settings', json('PUT', patch)),
  managers: () => adminRequest<{ managers: SeoManager[] }>('/admin/seo-managers').then((data) => data.managers ?? []),
  createManager: (body: Record<string, unknown>) => adminRequest<{ manager: SeoManager }>('/admin/seo-managers', json('POST', body)),
  updateManager: (id: string, body: Record<string, unknown>) => adminRequest<{ manager: SeoManager }>(`/admin/seo-managers/${id}`, json('PATCH', body)),
  deleteManager: (id: string) => adminRequest<void>(`/admin/seo-managers/${id}`, { method: 'DELETE' }),
};

/** A form's starting values from a stored record (empty strings where nothing is set). */
export function toSeoInput(record: SeoRecord | null | undefined, extra: Partial<SeoInput> = {}): SeoInput {
  return {
    seoTitle: record?.seoTitle ?? '',
    metaDescription: record?.metaDescription ?? '',
    focusKeyword: record?.focusKeyword ?? '',
    relatedKeywords: record?.relatedKeywords ?? [],
    canonicalUrl: record?.canonicalUrl ?? '',
    ogTitle: record?.ogTitle ?? '',
    ogDescription: record?.ogDescription ?? '',
    ogImage: record?.ogImage ?? '',
    imageAlt: record?.imageAlt ?? '',
    noindex: record?.noindex ?? false,
    internalLinks: record?.internalLinks ?? [],
    ...extra,
  };
}
