import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Loader2, Lock } from 'lucide-react';

import type { AdminUser } from '@/lib/admin-api';
import { DEFAULT_OG_IMAGE, resolveHead, type SeoFields } from '@/lib/seo';
import { ImagePicker, Modal, Spinner, StateBlock, adminButtonClass, useToast } from '@/pages/admin/admin-ui';
import { seoApi, toSeoInput, type Article, type ArticleStatus, type SeoInput, type SeoListing, type SeoOverview, type SeoPageRow } from './seo-api';
import { articleSeoTitle, headInputFor, pageDefaults, projectDescription, propertyDescription, type SeoTarget } from './seo-rules';
import {
  EditorLayout,
  GooglePreview,
  SeoChecklist,
  SeoFieldsForm,
  SocialPreview,
  StatusPill,
  TextArea,
  TextField,
  fieldErrorsFrom,
  labelClass,
  legendClass,
  linkTargetsFrom,
  slugify,
  useHeadContext,
} from './seo-ui';

/** Form values as the fields a page renders with (empty means "use the page's own"). */
export function toFields(values: SeoInput): SeoFields {
  const text = (value: string) => (value.trim() ? value.trim() : null);
  return {
    seoTitle: text(values.seoTitle),
    metaDescription: text(values.metaDescription),
    canonicalUrl: text(values.canonicalUrl),
    ogTitle: text(values.ogTitle),
    ogDescription: text(values.ogDescription),
    ogImage: text(values.ogImage),
    imageAlt: text(values.imageAlt),
    noindex: values.noindex,
    internalLinks: values.internalLinks,
  };
}

const errorMessage = (reason: unknown, fallback: string) => (reason instanceof Error ? reason.message : fallback);

/* ================================================================== static page */

export function PageSeoEditor({ page, overview, onClose, onSaved }: { page: SeoPageRow; overview: SeoOverview; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const ctx = useHeadContext(overview.settings);
  const [values, setValues] = useState<SeoInput>(() => toSeoInput(page.seo));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const target: SeoTarget = { kind: 'page', item: page };
  const head = resolveHead(headInputFor(target, toFields(values)), ctx);
  const defaults = pageDefaults(page.path);

  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      await seoApi.savePage(page.key, values);
      toast('success', `SEO saved for ${page.label}.`);
      onSaved();
      onClose();
    } catch (reason) {
      setErrors(fieldErrorsFrom(reason));
      toast('error', errorMessage(reason, 'Could not save.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      wide
      title={`SEO · ${page.label}`}
      onClose={onClose}
      footer={<EditorFooter onClose={onClose} saving={saving} actions={[{ label: 'Save SEO', onClick: save, primary: true, testId: 'button-save-page-seo' }]} viewHref={page.path} />}
    >
      <EditorLayout
        form={
          <SeoFieldsForm
            values={values}
            onChange={setValues}
            errors={errors}
            defaults={{ title: defaults.title ? `${defaults.title} | ${ctx.siteName}` : ctx.siteName, description: defaults.description, canonical: `${ctx.siteUrl}${page.path}`, ogImage: ctx.defaultOgImage || DEFAULT_OG_IMAGE }}
            slug={{ value: page.path, prefix: ctx.siteUrl.replace(/^https?:\/\//, ''), hint: 'Static page addresses are part of the site structure and cannot be renamed here.' }}
            imageAltHint="Describes the OG image above, when one is set."
          />
        }
        aside={<>
          <GooglePreview head={head} siteName={ctx.siteName} />
          <SocialPreview head={head} />
          <SeoChecklist head={head} values={values} hasImage={Boolean(values.ogImage)} />
        </>}
      />
    </Modal>
  );
}

/* ================================================================== property / project */

export function ListingSeoEditor({ kind, item, overview, onClose, onSaved }: {
  kind: 'properties' | 'projects'; item: SeoListing; overview: SeoOverview; onClose: () => void; onSaved: () => void;
}) {
  const toast = useToast();
  const ctx = useHeadContext(overview.settings);
  const [values, setValues] = useState<SeoInput>(() => toSeoInput(item.seo));
  const [slug, setSlug] = useState(item.slug);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const prefix = kind === 'properties' ? '/properties/' : '/projects/';
  const target: SeoTarget = kind === 'properties' ? { kind: 'property', item: { ...item, slug } } : { kind: 'project', item: { ...item, slug } };
  const head = resolveHead(headInputFor(target, toFields(values)), ctx);
  const autoDescription = kind === 'properties' ? propertyDescription(item.title, item.location) : projectDescription(item.title, item.location);
  const slugChanged = slug !== item.slug;

  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      await seoApi.saveListing(kind, item.id, { ...values, slug });
      toast('success', `SEO saved for ${item.title}.`);
      onSaved();
      onClose();
    } catch (reason) {
      setErrors(fieldErrorsFrom(reason));
      toast('error', errorMessage(reason, 'Could not save.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      wide
      title={`SEO · ${item.title}`}
      onClose={onClose}
      footer={<EditorFooter onClose={onClose} saving={saving} actions={[{ label: 'Save SEO', onClick: save, primary: true, testId: 'button-save-listing-seo' }]} viewHref={item.published ? `${prefix}${item.slug}` : undefined} />}
    >
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#2b3242]/10 bg-[#fffdf8] p-3">
        {item.image && <img src={item.image} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#2b3242]">{item.title}</p>
          <p className="truncate text-xs text-[#2b3242]/60">{[item.location, item.type ?? item.developer, item.status ?? item.category].filter(Boolean).join(' · ')}</p>
        </div>
        <StatusPill tone={item.published ? 'live' : 'draft'}>{item.published ? 'Live' : 'Not published'}</StatusPill>
      </div>
      <EditorLayout
        form={
          <SeoFieldsForm
            values={values}
            onChange={setValues}
            errors={errors}
            defaults={{ title: `${item.title} | ${ctx.siteName}`, description: autoDescription, canonical: `${ctx.siteUrl}${prefix}${slug}`, ogImage: item.image || ctx.defaultOgImage || DEFAULT_OG_IMAGE }}
            slug={{
              value: slug,
              prefix,
              onChange: (value) => setSlug(value.toLowerCase().replace(/\s+/g, '-')),
              hint: slugChanged
                ? item.published
                  ? `The address changes to ${prefix}${slug}. The old address keeps working and forwards to the new one.`
                  : `The address will be ${prefix}${slug}.`
                : 'Lowercase words joined by hyphens. Changing it changes the page address.',
            }}
          />
        }
        aside={<>
          <GooglePreview head={head} siteName={ctx.siteName} />
          <SocialPreview head={head} />
          <SeoChecklist head={head} values={values} slug={slug} hasImage={Boolean(item.image || values.ogImage)} />
        </>}
      />
    </Modal>
  );
}

/* ================================================================== article */

const EMPTY_ARTICLE = { title: '', slug: '', excerpt: '', content: '', category: 'General', author: 'KNC Horizon', featuredImage: '' };

const STATUS_COPY: Record<ArticleStatus, { tone: 'draft' | 'review' | 'live'; label: string; note: string }> = {
  draft: { tone: 'draft', label: 'Draft', note: 'Only visible in this console.' },
  review: { tone: 'review', label: 'In review', note: 'Waiting for an administrator to publish it.' },
  published: { tone: 'live', label: 'Published', note: 'Live on the site.' },
};

export function ArticleEditor({ articleId, overview, user, onClose, onSaved }: {
  articleId: string | null; overview: SeoOverview; user: AdminUser; onClose: () => void; onSaved: () => void;
}) {
  const toast = useToast();
  const ctx = useHeadContext(overview.settings);
  // The server enforces this too; here it only decides which buttons to offer.
  const canPublish = user.canPublishArticles === true;
  const [loaded, setLoaded] = useState<Article | null>(null);
  const [loadError, setLoadError] = useState('');
  const [fields, setFields] = useState(EMPTY_ARTICLE);
  const [values, setValues] = useState<SeoInput>(() => toSeoInput(null));
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<ArticleStatus | null>(null);

  useEffect(() => {
    if (!articleId) return;
    let active = true;
    seoApi.article(articleId)
      .then(({ article, seo }) => {
        if (!active) return;
        setLoaded(article);
        setFields({ title: article.title, slug: article.slug, excerpt: article.excerpt, content: article.content, category: article.category, author: article.author, featuredImage: article.featuredImage });
        setValues(toSeoInput(seo, { seoTitle: articleSeoTitle(article.title, article.seoTitle) ?? '', metaDescription: article.seoDescription ?? '' }));
        setSlugTouched(true);
      })
      .catch((reason) => active && setLoadError(errorMessage(reason, 'Could not load the article.')));
    return () => { active = false; };
  }, [articleId]);

  const status: ArticleStatus = loaded?.status ?? 'draft';
  const live = status === 'published';
  // A live article's text is locked for anyone without publishing rights; its SEO is not.
  const locked = live && !canPublish;
  const set = (key: keyof typeof EMPTY_ARTICLE, value: string) => {
    setFields((current) => ({ ...current, [key]: value, ...(key === 'title' && !slugTouched ? { slug: slugify(value) } : {}) }));
  };

  const target: SeoTarget = {
    kind: 'article',
    item: {
      id: loaded?.id ?? 'new', slug: fields.slug, title: fields.title || 'Untitled article', excerpt: fields.excerpt, category: fields.category,
      author: fields.author, status, publishedAt: loaded?.publishedAt ?? '', image: fields.featuredImage || null,
      seoTitle: values.seoTitle, seoDescription: values.metaDescription, updatedAt: '', seo: null,
    },
  };
  const head = resolveHead(headInputFor(target, { ...toFields(values), seoTitle: articleSeoTitle(fields.title, values.seoTitle) }), ctx);
  const linkTargets = useMemo(() => linkTargetsFrom(overview, fields.slug ? `/blog/${fields.slug}` : undefined), [overview, fields.slug]);

  const save = async (next: ArticleStatus) => {
    setSaving(next);
    setErrors({});
    const body = { ...fields, status: next, seo: values };
    try {
      if (loaded) await seoApi.updateArticle(loaded.id, body);
      else await seoApi.createArticle(body);
      const done = next === 'review' ? 'Submitted for review.' : next === 'published' ? (live ? 'Changes published.' : 'Article published.') : 'Draft saved.';
      toast('success', done);
      onSaved();
      onClose();
    } catch (reason) {
      setErrors(fieldErrorsFrom(reason));
      toast('error', errorMessage(reason, 'Could not save the article.'));
    } finally {
      setSaving(null);
    }
  };

  const actions: FooterAction[] = locked
    ? [{ label: 'Save SEO changes', onClick: () => save('published'), primary: true, busy: saving === 'published', testId: 'button-article-save-seo' }]
    : live
      ? [
          { label: 'Unpublish', onClick: () => save('draft'), busy: saving === 'draft', testId: 'button-article-unpublish' },
          { label: 'Save changes', onClick: () => save('published'), primary: true, busy: saving === 'published', testId: 'button-article-publish' },
        ]
      : [
          { label: 'Save draft', onClick: () => save('draft'), busy: saving === 'draft', testId: 'button-article-draft' },
          { label: 'Submit for review', onClick: () => save('review'), primary: !canPublish, busy: saving === 'review', testId: 'button-article-review' },
          ...(canPublish ? [{ label: 'Publish', onClick: () => save('published'), primary: true, busy: saving === 'published', testId: 'button-article-publish' }] : []),
        ];

  if (articleId && !loaded) {
    return (
      <Modal open wide title="Article" onClose={onClose}>
        {loadError ? <StateBlock tone="error" title="Could not open the article" message={loadError} /> : <Spinner label="Loading article…" />}
      </Modal>
    );
  }

  return (
    <Modal
      open
      wide
      title={loaded ? `Article · ${loaded.title}` : 'New article'}
      onClose={onClose}
      footer={<EditorFooter onClose={onClose} saving={Boolean(saving)} actions={actions} viewHref={live && loaded ? `/blog/${loaded.slug}` : undefined} />}
    >
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#2b3242]/10 bg-[#fffdf8] px-3 py-2.5 text-sm">
        <StatusPill tone={STATUS_COPY[status].tone}>{STATUS_COPY[status].label}</StatusPill>
        <span className="text-[#2b3242]/70">{STATUS_COPY[status].note}</span>
        {!canPublish && !live && <span className="text-[#2b3242]/60">You can save drafts and submit for review; an administrator publishes.</span>}
      </div>
      {locked && (
        <p className="mb-5 flex items-start gap-2 rounded-xl border border-[#9f7a47]/30 bg-[#9f7a47]/8 px-3 py-2.5 text-sm text-[#80623a]" data-testid="article-locked">
          <Lock size={15} className="mt-0.5 shrink-0" /> This article is live. You can improve its SEO below; changes to the article itself need an administrator.
        </p>
      )}
      <EditorLayout
        form={
          <div className="space-y-7">
            <fieldset>
              <legend className={legendClass}>Article</legend>
              <div className="grid gap-4">
                <TextField label="Title" value={fields.title} onChange={(value) => set('title', value)} readOnly={locked} error={errors.title} testId="article-title" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Category" value={fields.category} onChange={(value) => set('category', value)} readOnly={locked} error={errors.category} />
                  <TextField label="Author" value={fields.author} onChange={(value) => set('author', value)} readOnly={locked} error={errors.author} />
                </div>
                <TextArea label="Excerpt" value={fields.excerpt} onChange={(value) => set('excerpt', value)} readOnly={locked} error={errors.excerpt} rows={2} hint="The summary shown on the blog page and article cards." />
                {locked ? (
                  <div>
                    <span className={labelClass}>Featured image</span>
                    {fields.featuredImage && <img src={fields.featuredImage} alt="" className="mt-2 h-24 w-36 rounded-lg object-cover" />}
                  </div>
                ) : (
                  <div>
                    <ImagePicker label="Featured image" value={fields.featuredImage} onChange={(next) => set('featuredImage', String(Array.isArray(next) ? next[0] ?? '' : next))} loadLibrary={seoApi.media} uploadImage={seoApi.upload} />
                    {errors.featuredImage && <span className="mt-1 block text-xs text-[#b23b2e]">{errors.featuredImage}</span>}
                  </div>
                )}
                <TextArea label="Article text" value={fields.content} onChange={(value) => set('content', value)} readOnly={locked} error={errors.content} rows={12} hint="Plain text. A blank line starts a new paragraph." testId="article-content" />
              </div>
            </fieldset>
            <SeoFieldsForm
              values={values}
              onChange={setValues}
              errors={errors}
              defaults={{ title: `${fields.title || 'Article title'} | ${ctx.siteName}`, description: fields.excerpt || ctx.fallbackDescription, canonical: `${ctx.siteUrl}/blog/${fields.slug}`, ogImage: fields.featuredImage || ctx.defaultOgImage || DEFAULT_OG_IMAGE }}
              slug={{
                value: fields.slug,
                prefix: '/blog/',
                onChange: (value) => { setSlugTouched(true); setFields((current) => ({ ...current, slug: value.toLowerCase().replace(/\s+/g, '-') })); },
                hint: live && loaded && fields.slug !== loaded.slug
                  ? `The address changes to /blog/${fields.slug}. The old address keeps working and forwards to the new one.`
                  : 'Filled from the title until you edit it.',
              }}
              linkTargets={linkTargets}
              imageAltHint="Describes the featured image."
            />
          </div>
        }
        aside={<>
          <GooglePreview head={head} siteName={ctx.siteName} />
          <SocialPreview head={head} />
          <SeoChecklist head={head} values={values} slug={fields.slug} hasImage={Boolean(fields.featuredImage)} />
        </>}
      />
    </Modal>
  );
}

/* ================================================================== footer */

type FooterAction = { label: string; onClick: () => void; primary?: boolean; busy?: boolean; testId?: string };

function EditorFooter({ onClose, saving, actions, viewHref }: { onClose: () => void; saving: boolean; actions: FooterAction[]; viewHref?: string }) {
  return (
    <>
      {viewHref && (
        <a href={viewHref} target="_blank" rel="noreferrer" className={`${adminButtonClass('ghost')} mr-auto`}>
          <ExternalLink size={13} /> View page
        </a>
      )}
      <button type="button" className={adminButtonClass('ghost')} onClick={onClose} disabled={saving}>Cancel</button>
      {actions.map((action) => (
        <button key={action.label} type="button" className={adminButtonClass(action.primary ? 'primary' : 'ghost')} onClick={action.onClick} disabled={saving} data-testid={action.testId}>
          {action.busy ? <Loader2 size={13} className="animate-spin" /> : null} {action.label}
        </button>
      ))}
    </>
  );
}
