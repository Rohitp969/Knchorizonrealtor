import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, EyeOff, Info, Plus, Trash2, XCircle } from 'lucide-react';

import { useSiteSettings } from '@/lib/site-settings';
import { canonicalPath, type Head, type HeadContext, type InternalLink } from '@/lib/seo';
import { ImagePicker, adminButtonClass } from '@/pages/admin/admin-ui';
import { seoApi, type SeoInput, type SeoOverview, type SeoSettings } from './seo-api';
import { DESCRIPTION_MAX, DESCRIPTION_MIN, TITLE_MAX, TITLE_MIN, type Severity } from './seo-rules';

/* ------------------------------------------------------------------ data */

/** The console's single data load: every page, listing and article with its SEO. */
export function useSeoOverview() {
  const [data, setData] = useState<SeoOverview | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await seoApi.overview());
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load SEO data.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);
  return { data, error, loading, reload: load };
}

/** The same context the public pages build their <head> with. */
export function useHeadContext(settings: SeoSettings | undefined): HeadContext {
  const { siteName, seoDescription } = useSiteSettings();
  return useMemo(
    () => ({
      siteName,
      siteUrl: settings?.siteUrl ?? 'https://www.knchorizonrealtor.com',
      fallbackDescription: seoDescription,
      defaultOgImage: settings?.defaultOgImage,
      defaultOgImageAlt: settings?.defaultOgImageAlt,
    }),
    [siteName, seoDescription, settings],
  );
}

/* ------------------------------------------------------------------ small pieces */

export const inputClass = (invalid = false) =>
  `mt-1.5 w-full rounded-lg border bg-[#fffdf8] px-3 py-2.5 text-sm text-[#2b3242] outline-none placeholder:text-[#2b3242]/40 focus:border-[#9f7a47] ${invalid ? 'border-[#b23b2e]' : 'border-[#2b3242]/20'}`;
export const labelClass = 'font-mono text-[11px] uppercase tracking-[.14em] text-[#2b3242]/65';
export const legendClass = 'mb-3 font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]';

export function StatusPill({ tone, children }: { tone: 'live' | 'draft' | 'review' | 'off' | 'muted'; children: ReactNode }) {
  const tones = {
    live: 'border-[#55735f]/35 bg-[#55735f]/10 text-[#3c5a49]',
    review: 'border-[#9f7a47]/40 bg-[#9f7a47]/12 text-[#80623a]',
    draft: 'border-[#2b3242]/20 bg-[#2b3242]/5 text-[#2b3242]/70',
    off: 'border-[#b23b2e]/30 bg-[#b23b2e]/8 text-[#8f2f24]',
    muted: 'border-[#2b3242]/15 text-[#2b3242]/60',
  };
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[.1em] ${tones[tone]}`}>{children}</span>;
}

export function SeverityIcon({ severity, size = 15 }: { severity: Severity; size?: number }) {
  if (severity === 'error') return <XCircle size={size} className="shrink-0 text-[#b23b2e]" aria-label="Error" />;
  if (severity === 'warning') return <AlertTriangle size={size} className="shrink-0 text-[#9f7a47]" aria-label="Warning" />;
  return <Info size={size} className="shrink-0 text-[#2b3242]/55" aria-label="Note" />;
}

function Counter({ length, min, max }: { length: number; min: number; max: number }) {
  const tone = length === 0 ? 'text-[#2b3242]/45' : length > max ? 'text-[#b23b2e]' : length < min ? 'text-[#80623a]' : 'text-[#3c5a49]';
  return <span className={`font-mono text-[10px] tracking-[.08em] ${tone}`}>{length} / {max}</span>;
}

/* ------------------------------------------------------------------ previews */

/** How the page would look as a Google result (desktop), from the same head the page renders. */
export function GooglePreview({ head, siteName }: { head: Head; siteName: string }) {
  let crumbs = head.canonical;
  try {
    const url = new URL(head.canonical);
    crumbs = [url.hostname, ...url.pathname.split('/').filter(Boolean).map(decodeURIComponent)].join(' › ');
  } catch { /* keep as typed */ }
  const noindex = head.robots.startsWith('noindex');
  return (
    <div className="rounded-xl border border-[#2b3242]/10 bg-[#fffdf8] p-4 shadow-[0_1px_2px_rgba(43,50,66,0.04)]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }} data-testid="google-preview">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[.14em] text-[#2b3242]/55" style={{ fontFamily: 'var(--app-font-mono)' }}>Google preview</p>
      {noindex ? (
        <p className="flex items-start gap-2 rounded-lg border border-[#b23b2e]/25 bg-[#b23b2e]/6 px-3 py-2.5 text-[13px] text-[#8f2f24]">
          <EyeOff size={15} className="mt-0.5 shrink-0" /> This page is set to noindex, so it will not appear in Google results.
        </p>
      ) : (
        <div className="max-w-[600px]">
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full border border-[#dadce0] bg-white">
              <img src="/favicon.svg" alt="" className="h-5 w-5" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[14px] text-[#202124]">{siteName}</span>
              <span className="block truncate text-[12px] text-[#4d5156]">{crumbs}</span>
            </span>
          </div>
          <p className="mt-2 truncate text-[20px] leading-[1.3] text-[#1a0dab]">{head.title}</p>
          <p className="mt-1 line-clamp-2 text-[14px] leading-[1.58] text-[#4d5156]">{head.description}</p>
        </div>
      )}
    </div>
  );
}

/** The link card WhatsApp, Facebook and LinkedIn build from the Open Graph tags. */
export function SocialPreview({ head }: { head: Head }) {
  let host = '';
  try { host = new URL(head.canonical).hostname; } catch { /* ignore */ }
  return (
    <div className="overflow-hidden rounded-xl border border-[#2b3242]/10 bg-[#fffdf8] shadow-[0_1px_2px_rgba(43,50,66,0.04)]">
      <p className="px-4 pt-3 font-mono text-[10px] uppercase tracking-[.14em] text-[#2b3242]/55">Share preview</p>
      <div className="mt-2 aspect-[1.91/1] w-full overflow-hidden bg-[#2b3242]/8">
        <img src={head.ogImage} alt={head.ogImageAlt} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} />
      </div>
      <div className="px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[.1em] text-[#2b3242]/55">{host}</p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold text-[#2b3242]">{head.ogTitle}</p>
        <p className="mt-1 line-clamp-2 text-xs text-[#2b3242]/65">{head.ogDescription}</p>
      </div>
    </div>
  );
}

/** Quick pass/fail checks for the form as it stands. */
export function SeoChecklist({ head, values, slug, hasImage }: { head: Head; values: SeoInput; slug?: string; hasImage: boolean }) {
  const keyword = values.focusKeyword.trim().toLowerCase();
  const inText = (text: string) => Boolean(keyword) && text.toLowerCase().includes(keyword);
  const slugWords = keyword.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const checks: { ok: boolean; label: string; soft?: boolean }[] = [
    { ok: head.title.length >= TITLE_MIN && head.title.length <= TITLE_MAX, label: `Title between ${TITLE_MIN} and ${TITLE_MAX} characters (${head.title.length})` },
    { ok: head.description.length >= DESCRIPTION_MIN && head.description.length <= DESCRIPTION_MAX, label: `Description between ${DESCRIPTION_MIN} and ${DESCRIPTION_MAX} characters (${head.description.length})` },
    { ok: Boolean(values.seoTitle.trim()), label: 'Custom SEO title set' },
    { ok: Boolean(values.metaDescription.trim()), label: 'Custom meta description set' },
    { ok: Boolean(keyword), label: 'Focus keyword set', soft: true },
    { ok: inText(head.title), label: 'Focus keyword in the title', soft: true },
    { ok: inText(head.description), label: 'Focus keyword in the description', soft: true },
    ...(slug !== undefined ? [{ ok: Boolean(slugWords) && slug.includes(slugWords), label: 'Focus keyword in the slug', soft: true }] : []),
    ...(hasImage ? [{ ok: Boolean(values.imageAlt.trim()), label: 'Image alt text set' }] : []),
    { ok: !values.noindex, label: values.noindex ? 'Hidden from search (noindex)' : 'Indexable by search engines' },
  ];
  return (
    <ul className="space-y-1.5 rounded-xl border border-[#2b3242]/10 bg-[#fffdf8] p-4 text-[13px] shadow-[0_1px_2px_rgba(43,50,66,0.04)]" data-testid="seo-checklist">
      <li className="mb-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#2b3242]/55">Checks</li>
      {checks.map((check) => (
        <li key={check.label} className="flex items-start gap-2 text-[#2b3242]/80">
          {check.ok ? <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#55735f]" /> : check.soft ? <Info size={15} className="mt-0.5 shrink-0 text-[#2b3242]/45" /> : <AlertTriangle size={15} className="mt-0.5 shrink-0 text-[#9f7a47]" />}
          <span>{check.label}</span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ the SEO fields form */

type FieldErrors = Record<string, string>;

export function TextField({ label, value, onChange, placeholder, error, counter, hint, readOnly, testId, prefix }: {
  label: string; value: string; onChange?: (value: string) => void; placeholder?: string; error?: string;
  counter?: { min: number; max: number }; hint?: string; readOnly?: boolean; testId?: string; prefix?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-3">
        <span className={labelClass}>{label}</span>
        {counter && <Counter length={(value || placeholder || '').length} min={counter.min} max={counter.max} />}
      </span>
      {prefix ? (
        <span className={`${inputClass(Boolean(error))} flex items-center gap-0 p-0 focus-within:border-[#9f7a47] ${readOnly ? 'bg-[#2b3242]/[.03]' : ''}`}>
          <span className="shrink-0 border-r border-[#2b3242]/10 px-3 py-2.5 text-[13px] text-[#2b3242]/50">{prefix}</span>
          <input value={value} readOnly={readOnly} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent px-3 py-2.5 outline-none" data-testid={testId} />
        </span>
      ) : (
        <input value={value} readOnly={readOnly} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} className={`${inputClass(Boolean(error))} ${readOnly ? 'bg-[#2b3242]/[.03]' : ''}`} data-testid={testId} />
      )}
      {error ? <span className="mt-1 block text-xs text-[#b23b2e]">{error}</span> : hint ? <span className="mt-1 block text-xs text-[#2b3242]/60">{hint}</span> : null}
    </label>
  );
}

export function TextArea({ label, value, onChange, placeholder, error, counter, hint, rows = 3, readOnly, testId }: {
  label: string; value: string; onChange?: (value: string) => void; placeholder?: string; error?: string;
  counter?: { min: number; max: number }; hint?: string; rows?: number; readOnly?: boolean; testId?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-3">
        <span className={labelClass}>{label}</span>
        {counter && <Counter length={(value || placeholder || '').length} min={counter.min} max={counter.max} />}
      </span>
      <textarea value={value} readOnly={readOnly} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} rows={rows} className={`${inputClass(Boolean(error))} resize-y ${readOnly ? 'bg-[#2b3242]/[.03]' : ''}`} data-testid={testId} />
      {error ? <span className="mt-1 block text-xs text-[#b23b2e]">{error}</span> : hint ? <span className="mt-1 block text-xs text-[#2b3242]/60">{hint}</span> : null}
    </label>
  );
}

/** Internal links for an article: pick a page of the site, adjust the link text. */
function InternalLinksField({ links, onChange, targets, error }: { links: InternalLink[]; onChange: (links: InternalLink[]) => void; targets: InternalLink[]; error?: string }) {
  const [choice, setChoice] = useState('');
  const available = targets.filter((target) => !links.some((link) => link.href === target.href));
  return (
    <div>
      <p className="text-xs text-[#2b3242]/60">Shown under the article as “Related on KNC Horizon”. Link to the listings, projects and pages this article supports.</p>
      {links.length > 0 && (
        <ul className="mt-3 space-y-2">
          {links.map((link, index) => (
            <li key={link.href} className="flex flex-col gap-2 rounded-lg border border-[#2b3242]/12 bg-[#fffdf8] p-2.5 sm:flex-row sm:items-center">
              <span className="min-w-0 truncate font-mono text-[11px] text-[#2b3242]/60 sm:w-56">{link.href}</span>
              <input
                value={link.label}
                onChange={(event) => onChange(links.map((item, i) => (i === index ? { ...item, label: event.target.value } : item)))}
                className="min-w-0 flex-1 rounded-md border border-[#2b3242]/15 bg-transparent px-2.5 py-1.5 text-sm outline-none focus:border-[#9f7a47]"
                aria-label={`Link text for ${link.href}`}
              />
              <button type="button" onClick={() => onChange(links.filter((_, i) => i !== index))} className="grid h-8 w-8 shrink-0 place-items-center self-end rounded-lg border border-[#2b3242]/15 text-[#b23b2e] hover:border-[#b23b2e] sm:self-auto" aria-label="Remove link">
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <select value={choice} onChange={(event) => setChoice(event.target.value)} className={`${inputClass()} mt-0 sm:flex-1`} aria-label="Page to link to" data-testid="select-internal-link">
          <option value="">Choose a page to link to…</option>
          {available.map((target) => <option key={target.href} value={target.href}>{target.label} — {target.href}</option>)}
        </select>
        <button
          type="button"
          className={adminButtonClass('ghost')}
          disabled={!choice}
          onClick={() => {
            const target = targets.find((item) => item.href === choice);
            if (target) onChange([...links, target]);
            setChoice('');
          }}
        >
          <Plus size={13} /> Add link
        </button>
      </div>
      {error && <span className="mt-1 block text-xs text-[#b23b2e]">{error}</span>}
    </div>
  );
}

export type SeoFormDefaults = { title: string; description: string; canonical: string; ogImage: string };

/** Every SEO field, grouped the way the task reads: search result, keywords, sharing, indexing. */
export function SeoFieldsForm({ values, onChange, errors, defaults, slug, linkTargets, showImageAlt = true, imageAltHint }: {
  values: SeoInput;
  onChange: (next: SeoInput) => void;
  errors: FieldErrors;
  defaults: SeoFormDefaults;
  /** Editable slug for listings and articles; a read-only path for static pages. */
  slug: { value: string; prefix: string; onChange?: (value: string) => void; hint?: string };
  linkTargets?: InternalLink[];
  showImageAlt?: boolean;
  imageAltHint?: string;
}) {
  const set = <K extends keyof SeoInput>(key: K, value: SeoInput[K]) => onChange({ ...values, [key]: value });
  const [keywordsText, setKeywordsText] = useState(values.relatedKeywords.join(', '));
  useEffect(() => { setKeywordsText(values.relatedKeywords.join(', ')); }, [values.relatedKeywords]);

  return (
    <div className="space-y-7">
      <fieldset>
        <legend className={legendClass}>Search result</legend>
        <div className="grid gap-4">
          <TextField label="SEO title" value={values.seoTitle} onChange={(value) => set('seoTitle', value)} placeholder={defaults.title} error={errors.seoTitle} counter={{ min: TITLE_MIN, max: TITLE_MAX }} hint="Leave empty to use the automatic title shown as the placeholder." testId="seo-title" />
          <TextArea label="Meta description" value={values.metaDescription} onChange={(value) => set('metaDescription', value)} placeholder={defaults.description} error={errors.metaDescription} counter={{ min: DESCRIPTION_MIN, max: DESCRIPTION_MAX }} testId="seo-description" />
          <TextField
            label="SEO slug"
            value={slug.value}
            onChange={slug.onChange}
            readOnly={!slug.onChange}
            prefix={slug.prefix}
            error={errors.slug}
            hint={slug.hint}
            testId="seo-slug"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className={legendClass}>Keywords</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Focus keyword" value={values.focusKeyword} onChange={(value) => set('focusKeyword', value)} placeholder="e.g. palm jumeirah villa for sale" error={errors.focusKeyword} testId="seo-focus-keyword" />
          <TextField
            label="Related keywords"
            value={keywordsText}
            onChange={(value) => {
              setKeywordsText(value);
              onChange({ ...values, relatedKeywords: value.split(',').map((word) => word.trim()).filter(Boolean) });
            }}
            placeholder="comma, separated, phrases"
            error={errors.relatedKeywords}
            hint="Used for the checks here; not published as a meta tag."
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className={legendClass}>Social sharing (Open Graph)</legend>
        <div className="grid gap-4">
          <TextField label="OG title" value={values.ogTitle} onChange={(value) => set('ogTitle', value)} placeholder="Same as the SEO title" error={errors.ogTitle} />
          <TextArea label="OG description" value={values.ogDescription} onChange={(value) => set('ogDescription', value)} placeholder="Same as the meta description" error={errors.ogDescription} rows={2} />
          <div>
            <ImagePicker
              label="OG image"
              value={values.ogImage}
              onChange={(next) => set('ogImage', String(Array.isArray(next) ? next[0] ?? '' : next))}
              help={`Leave empty to use ${defaults.ogImage}. Best size 1200 × 630.`}
              loadLibrary={seoApi.media}
              uploadImage={seoApi.upload}
            />
            {errors.ogImage && <span className="mt-1 block text-xs text-[#b23b2e]">{errors.ogImage}</span>}
          </div>
          {showImageAlt && (
            <TextField label="Image alt text" value={values.imageAlt} onChange={(value) => set('imageAlt', value)} placeholder="Describe what the image shows" error={errors.imageAlt} hint={imageAltHint ?? 'Describes the main image for search engines and screen readers.'} testId="seo-image-alt" />
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend className={legendClass}>Indexing</legend>
        <div className="grid gap-4">
          <TextField label="Canonical URL" value={values.canonicalUrl} onChange={(value) => set('canonicalUrl', value)} placeholder={defaults.canonical} error={errors.canonicalUrl} hint="Leave empty: the page's own address is used. Only set this when another URL is the original." />
          <label className="flex items-start gap-3 rounded-lg border border-[#2b3242]/15 bg-[#fffdf8] px-3 py-3 text-sm text-[#2b3242]">
            <input type="checkbox" checked={!values.noindex} onChange={(event) => set('noindex', !event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#9f7a47]" data-testid="seo-index-toggle" />
            <span>
              <span className="font-medium">Allow search engines to index this page</span>
              <span className="mt-0.5 block text-xs text-[#2b3242]/60">Unticked adds a noindex tag and leaves the page out of sitemap.xml.</span>
            </span>
          </label>
        </div>
      </fieldset>

      {linkTargets && (
        <fieldset>
          <legend className={legendClass}>Internal links</legend>
          <InternalLinksField links={values.internalLinks} onChange={(links) => set('internalLinks', links)} targets={linkTargets} error={errors.internalLinks} />
        </fieldset>
      )}
    </div>
  );
}

/** The editor frame: the form on the left, the previews and checks alongside (below on phones). */
export function EditorLayout({ form, aside }: { form: ReactNode; aside: ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <div className="min-w-0">{form}</div>
      <div className="min-w-0 space-y-4 lg:sticky lg:top-0 lg:self-start">{aside}</div>
    </div>
  );
}

/** Turns a failed save's field errors into a map the form can show next to each field. */
export function fieldErrorsFrom(reason: unknown): FieldErrors {
  const errors = (reason as { errors?: { field: string; message: string }[] })?.errors;
  return Object.fromEntries((errors ?? []).map((error) => [error.field, error.message]));
}

/** Everything an article can link to: the static pages and every live listing, project and article. */
export function linkTargetsFrom(overview: SeoOverview, excludeHref?: string): InternalLink[] {
  const targets: InternalLink[] = [
    ...overview.pages.map((page) => ({ href: page.path, label: page.label })),
    ...overview.properties.filter((item) => item.published).map((item) => ({ href: `/properties/${item.slug}`, label: item.title })),
    ...overview.projects.filter((item) => item.published).map((item) => ({ href: `/projects/${item.slug}`, label: item.title })),
    ...overview.articles.filter((item) => item.status === 'published').map((item) => ({ href: `/blog/${item.slug}`, label: item.title })),
  ];
  return targets.filter((target) => canonicalPath(target.href) !== excludeHref);
}

export const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);
