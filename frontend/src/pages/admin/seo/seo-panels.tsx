import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, ExternalLink, FileText, Pencil, Plus, RefreshCw, Search, XCircle } from 'lucide-react';

import type { AdminUser } from '@/lib/admin-api';
import { useContact } from '@/lib/site-settings';
import { DEFAULT_OG_IMAGE, PATH_ALIASES } from '@/lib/seo';
import { AdminPanelHeader, ImagePicker, Spinner, StateBlock, adminButtonClass, useToast } from '@/pages/admin/admin-ui';
import { seoApi, type ArticleStatus, type SeoListing, type SeoOverview, type SeoPageRow } from './seo-api';
import { ArticleEditor, ListingSeoEditor, PageSeoEditor } from './seo-editors';
import { ISSUES, SEVERITY_ORDER, auditSite, headFor, type AuditedItem, type IssueCode } from './seo-rules';
import { SeverityIcon, StatusPill, TextField, fieldErrorsFrom, labelClass, useHeadContext, useSeoOverview } from './seo-ui';

/* ------------------------------------------------------------------ shared */

type EditTarget =
  | { kind: 'page'; page: SeoPageRow }
  | { kind: 'properties' | 'projects'; item: SeoListing }
  | { kind: 'article'; id: string | null };

function EditorHost({ edit, overview, user, onClose, onSaved }: { edit: EditTarget | null; overview: SeoOverview; user: AdminUser; onClose: () => void; onSaved: () => void }) {
  if (!edit) return null;
  if (edit.kind === 'page') return <PageSeoEditor page={edit.page} overview={overview} onClose={onClose} onSaved={onSaved} />;
  if (edit.kind === 'article') return <ArticleEditor articleId={edit.id} overview={overview} user={user} onClose={onClose} onSaved={onSaved} />;
  return <ListingSeoEditor kind={edit.kind} item={edit.item} overview={overview} onClose={onClose} onSaved={onSaved} />;
}

function editFor(item: AuditedItem): EditTarget {
  const { target } = item;
  if (target.kind === 'page') return { kind: 'page', page: target.item };
  if (target.kind === 'article') return { kind: 'article', id: target.item.id };
  return { kind: target.kind === 'property' ? 'properties' : 'projects', item: target.item };
}

const KIND_LABEL = { page: 'Page', property: 'Property', project: 'Project', article: 'Article' } as const;

function Loading({ data, error, reload, children }: { data: SeoOverview | null; error: string; reload: () => void; children: (data: SeoOverview) => ReactNode }) {
  if (!data && error) return <StateBlock tone="error" title="SEO data unavailable" message={error} action={<button className={adminButtonClass('ghost')} onClick={reload}>Try again</button>} />;
  if (!data) return <Spinner label="Loading SEO data…" />;
  return <>{children(data)}</>;
}

const RefreshButton = ({ onClick, loading }: { onClick: () => void; loading: boolean }) => (
  <button type="button" className={adminButtonClass('ghost')} onClick={onClick} disabled={loading}>
    <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
  </button>
);

const card = 'rounded-xl border border-[#2b3242]/10 bg-[#fffdf8] shadow-[0_1px_2px_rgba(43,50,66,0.04)]';

/* ================================================================== dashboard */

export function SeoDashboardPanel({ user }: { user: AdminUser }) {
  const { data, error, loading, reload } = useSeoOverview();
  const ctx = useHeadContext(data?.settings);
  const [edit, setEdit] = useState<EditTarget | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const audit = useMemo(() => (data ? auditSite(data, ctx) : []), [data, ctx]);
  const groups = useMemo(() => {
    const map = new Map<IssueCode, AuditedItem[]>();
    for (const item of audit) for (const code of item.issues) map.set(code, [...(map.get(code) ?? []), item]);
    return [...map.entries()].sort((a, b) => SEVERITY_ORDER[ISSUES[a[0]].severity] - SEVERITY_ORDER[ISSUES[b[0]].severity] || b[1].length - a[1].length);
  }, [audit]);
  const count = (code: IssueCode) => audit.filter((item) => item.issues.includes(code)).length;
  const inReview = data?.articles.filter((article) => article.status === 'review') ?? [];

  return (
    <div>
      <AdminPanelHeader title="SEO dashboard" description="Live checks across every public page, listing, project and article.">
        <RefreshButton onClick={reload} loading={loading} />
      </AdminPanelHeader>
      <div className="mt-5">
        <Loading data={data} error={error} reload={reload}>
          {(overview) => (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4" data-testid="seo-summary">
                {[
                  { label: 'Live pages checked', value: audit.length },
                  { label: 'Missing SEO titles', value: count('missing-title') },
                  { label: 'Missing descriptions', value: count('missing-description') },
                  { label: 'Missing image alt text', value: count('missing-alt') },
                  { label: 'Duplicate slugs', value: count('duplicate-slug'), alert: true },
                  { label: 'Duplicate titles', value: count('duplicate-title') },
                  { label: 'Hidden from search', value: count('noindex') },
                  { label: 'Articles in review', value: inReview.length },
                ].map((stat) => (
                  <div key={stat.label} className={`${card} p-4`}>
                    <p className="font-mono text-[11px] uppercase tracking-[.12em] text-[#2b3242]/60">{stat.label}</p>
                    <p className={`mt-2 font-serif text-3xl ${stat.alert && stat.value ? 'text-[#b23b2e]' : 'text-[#2b3242]'}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {inReview.length > 0 && (
                <section className={`${card} mt-6`}>
                  <h2 className="border-b border-[#2b3242]/10 px-4 py-3 font-serif text-lg text-[#2b3242]">Waiting for review</h2>
                  <ul>
                    {inReview.map((article) => (
                      <li key={article.id} className="flex items-center justify-between gap-3 border-b border-[#2b3242]/8 px-4 py-3 last:border-0">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-[#2b3242]">{article.title}</span>
                          <span className="block truncate text-xs text-[#2b3242]/60">/blog/{article.slug}</span>
                        </span>
                        <button type="button" className={adminButtonClass('ghost')} onClick={() => setEdit({ kind: 'article', id: article.id })}>
                          {user.canPublishArticles ? 'Review & publish' : 'Open'}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <h2 className="mt-8 font-serif text-2xl text-[#2b3242]">Issues</h2>
              {groups.length === 0 ? (
                <div className="mt-4"><StateBlock title="No issues found" message="Every live page has its SEO fields in order." /></div>
              ) : (
                <div className="mt-4 space-y-3" data-testid="seo-issue-groups">
                  {groups.map(([code, items]) => {
                    const info = ISSUES[code];
                    const expanded = open[code];
                    const shown = expanded ? items : items.slice(0, 5);
                    return (
                      <section key={code} className={card}>
                        <button type="button" onClick={() => setOpen((current) => ({ ...current, [code]: !expanded }))} className="flex w-full items-start gap-3 px-4 py-3 text-left" aria-expanded={Boolean(expanded)}>
                          <SeverityIcon severity={info.severity} size={17} />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-[#2b3242]">{info.label}</span>
                              <span className="rounded-full bg-[#2b3242]/8 px-2 py-0.5 font-mono text-[10px] text-[#2b3242]/70">{items.length}</span>
                            </span>
                            <span className="mt-0.5 block text-xs text-[#2b3242]/60">{info.help}</span>
                          </span>
                          <ChevronDown size={16} className={`mt-1 shrink-0 text-[#9f7a47] transition-transform ${expanded ? 'rotate-180' : ''}`} />
                        </button>
                        <ul className="border-t border-[#2b3242]/8">
                          {shown.map((item) => (
                            <li key={item.key} className="flex items-center justify-between gap-3 border-b border-[#2b3242]/6 px-4 py-2.5 last:border-0">
                              <span className="min-w-0">
                                <span className="flex items-center gap-2">
                                  <span className="shrink-0 rounded-md border border-[#2b3242]/12 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[.08em] text-[#2b3242]/60">{KIND_LABEL[item.target.kind]}</span>
                                  <span className="truncate text-sm text-[#2b3242]">{item.label}</span>
                                </span>
                                <span className="mt-0.5 block truncate text-xs text-[#2b3242]/55">{code === 'title-long' || code === 'title-short' || code === 'duplicate-title' ? item.head.title : item.path}</span>
                              </span>
                              <button type="button" className={`${adminButtonClass('ghost')} shrink-0`} onClick={() => setEdit(editFor(item))}><Pencil size={12} /> Edit</button>
                            </li>
                          ))}
                        </ul>
                        {items.length > 5 && (
                          <button type="button" onClick={() => setOpen((current) => ({ ...current, [code]: !expanded }))} className="w-full border-t border-[#2b3242]/8 px-4 py-2 text-left font-mono text-[11px] uppercase tracking-[.1em] text-[#80623a] hover:bg-[#2b3242]/[.03]">
                            {expanded ? 'Show fewer' : `Show all ${items.length}`}
                          </button>
                        )}
                      </section>
                    );
                  })}
                </div>
              )}
              <EditorHost edit={edit} overview={overview} user={user} onClose={() => setEdit(null)} onSaved={reload} />
            </>
          )}
        </Loading>
      </div>
    </div>
  );
}

/* ================================================================== static pages */

export function SeoPagesPanel({ user }: { user: AdminUser }) {
  const { data, error, loading, reload } = useSeoOverview();
  const ctx = useHeadContext(data?.settings);
  const [edit, setEdit] = useState<EditTarget | null>(null);
  const groups = useMemo(() => {
    const map = new Map<string, SeoPageRow[]>();
    for (const page of data?.pages ?? []) map.set(page.group, [...(map.get(page.group) ?? []), page]);
    return [...map.entries()];
  }, [data]);

  return (
    <div>
      <AdminPanelHeader title="Page SEO" description="Titles, descriptions and sharing for the site's main pages.">
        <RefreshButton onClick={reload} loading={loading} />
      </AdminPanelHeader>
      <div className="mt-5 space-y-6">
        <Loading data={data} error={error} reload={reload}>
          {(overview) => (
            <>
              {groups.map(([group, pages]) => (
                <section key={group}>
                  <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]">{group}</h2>
                  <ul className={card}>
                    {pages.map((page) => {
                      const head = headFor({ kind: 'page', item: page }, ctx);
                      const custom = Boolean(page.seo?.seoTitle || page.seo?.metaDescription);
                      return (
                        <li key={page.key} className="flex flex-col gap-3 border-b border-[#2b3242]/8 px-4 py-3 last:border-0 sm:flex-row sm:items-center" data-testid={`seo-page-${page.key}`}>
                          <div className="min-w-0 flex-1">
                            <p className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-[#2b3242]">{page.label}</span>
                              <span className="font-mono text-[11px] text-[#2b3242]/55">{page.path}</span>
                              {custom ? <StatusPill tone="live">Custom SEO</StatusPill> : <StatusPill tone="muted">Automatic</StatusPill>}
                              {page.seo?.noindex && <StatusPill tone="off">Noindex</StatusPill>}
                            </p>
                            <p className="mt-1 truncate text-sm text-[#1a0dab]/80">{head.title}</p>
                            <p className="truncate text-xs text-[#2b3242]/60">{head.description}</p>
                          </div>
                          <button type="button" className={`${adminButtonClass('ghost')} shrink-0 self-start sm:self-auto`} onClick={() => setEdit({ kind: 'page', page })}><Pencil size={12} /> Edit SEO</button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
              <EditorHost edit={edit} overview={overview} user={user} onClose={() => setEdit(null)} onSaved={reload} />
            </>
          )}
        </Loading>
      </div>
    </div>
  );
}

/* ================================================================== properties and projects */

export function SeoListingsPanel({ user }: { user: AdminUser }) {
  const { data, error, loading, reload } = useSeoOverview();
  const ctx = useHeadContext(data?.settings);
  const [kind, setKind] = useState<'properties' | 'projects'>('properties');
  const [query, setQuery] = useState('');
  const [edit, setEdit] = useState<EditTarget | null>(null);
  const audit = useMemo(() => new Map((data ? auditSite(data, ctx) : []).map((item) => [item.key, item])), [data, ctx]);

  const rows = useMemo(() => {
    const list = data?.[kind] ?? [];
    const needle = query.trim().toLowerCase();
    return needle ? list.filter((row) => [row.title, row.slug, row.location].some((value) => String(value ?? '').toLowerCase().includes(needle))) : list;
  }, [data, kind, query]);

  return (
    <div>
      <AdminPanelHeader title="Property & project SEO" description="SEO for the listings and off-plan projects in the database.">
        <RefreshButton onClick={reload} loading={loading} />
      </AdminPanelHeader>
      <div className="mt-5">
        <Loading data={data} error={error} reload={reload}>
          {(overview) => (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="inline-flex rounded-full border border-[#2b3242]/15 bg-[#fffdf8] p-1" role="tablist">
                  {(['properties', 'projects'] as const).map((value) => (
                    <button key={value} type="button" role="tab" aria-selected={kind === value} onClick={() => setKind(value)} className={`rounded-full px-4 py-1.5 text-sm transition-colors ${kind === value ? 'bg-[#2b3242] text-[#faf7f1]' : 'text-[#2b3242]/70 hover:text-[#2b3242]'}`} data-testid={`seo-tab-${value}`}>
                      {value === 'properties' ? 'Properties' : 'Projects'} <span className="opacity-70">({overview[value].length})</span>
                    </button>
                  ))}
                </div>
                <label className="relative flex min-w-0 flex-1 items-center">
                  <Search size={15} className="pointer-events-none absolute left-3 text-[#2b3242]/45" />
                  <span className="sr-only">Search</span>
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${kind}…`} className="w-full rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#9f7a47]" />
                </label>
              </div>

              {rows.length === 0 ? (
                <div className="mt-5"><StateBlock title={`No ${kind} found`} message={query ? 'Try a different search.' : `Add ${kind} in the admin console first.`} /></div>
              ) : (
                <ul className={`${card} mt-5`}>
                  {rows.map((row) => {
                    const audited = audit.get(`${kind === 'properties' ? 'property' : 'project'}:${row.id}`);
                    const problems = audited?.issues.filter((code) => ISSUES[code].severity !== 'info').length ?? 0;
                    return (
                      <li key={row.id} className="flex flex-col gap-3 border-b border-[#2b3242]/8 px-4 py-3 last:border-0 sm:flex-row sm:items-center" data-testid={`seo-listing-${row.id}`}>
                        <span className="flex min-w-0 flex-1 items-center gap-3">
                          <span className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-[#2b3242]/8">{row.image && <img src={row.image} alt="" loading="lazy" className="h-full w-full object-cover" />}</span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-[#2b3242]">{row.title}</span>
                            <span className="block truncate text-xs text-[#2b3242]/60">/{kind === 'properties' ? 'properties' : 'projects'}/{row.slug}</span>
                          </span>
                        </span>
                        <span className="flex flex-wrap items-center gap-2">
                          <StatusPill tone={row.published ? 'live' : 'draft'}>{row.published ? 'Live' : 'Not live'}</StatusPill>
                          {row.published && (problems ? <StatusPill tone="review">{problems} to fix</StatusPill> : <StatusPill tone="live">SEO ok</StatusPill>)}
                          <button type="button" className={adminButtonClass('ghost')} onClick={() => setEdit({ kind, item: row })}><Pencil size={12} /> Edit SEO</button>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              <EditorHost edit={edit} overview={overview} user={user} onClose={() => setEdit(null)} onSaved={reload} />
            </>
          )}
        </Loading>
      </div>
    </div>
  );
}

/* ================================================================== articles */

const ARTICLE_FILTERS: { value: ArticleStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'review', label: 'In review' },
  { value: 'published', label: 'Published' },
];
const STATUS_TONE = { draft: 'draft', review: 'review', published: 'live' } as const;
const STATUS_LABEL = { draft: 'Draft', review: 'In review', published: 'Published' } as const;

export function SeoArticlesPanel({ user }: { user: AdminUser }) {
  const { data, error, loading, reload } = useSeoOverview();
  const [filter, setFilter] = useState<ArticleStatus | 'all'>('all');
  const [edit, setEdit] = useState<EditTarget | null>(null);
  const articles = data?.articles ?? [];
  const shown = filter === 'all' ? articles : articles.filter((article) => article.status === filter);

  return (
    <div>
      <AdminPanelHeader
        title="Articles"
        description={user.canPublishArticles ? 'Write, review and publish blog articles.' : 'Write articles and submit them for review; an administrator publishes them.'}
      >
        <RefreshButton onClick={reload} loading={loading} />
        <button type="button" className={adminButtonClass()} onClick={() => setEdit({ kind: 'article', id: null })} data-testid="button-new-article"><Plus size={14} /> New article</button>
      </AdminPanelHeader>
      <div className="mt-5">
        <Loading data={data} error={error} reload={reload}>
          {(overview) => (
            <>
              <div className="flex flex-wrap gap-2" role="tablist">
                {ARTICLE_FILTERS.map((option) => {
                  const total = option.value === 'all' ? articles.length : articles.filter((article) => article.status === option.value).length;
                  return (
                    <button key={option.value} type="button" role="tab" aria-selected={filter === option.value} onClick={() => setFilter(option.value)} className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${filter === option.value ? 'border-[#2b3242] bg-[#2b3242] text-[#faf7f1]' : 'border-[#2b3242]/15 bg-[#fffdf8] text-[#2b3242]/70 hover:border-[#9f7a47]'}`}>
                      {option.label} <span className="opacity-70">({total})</span>
                    </button>
                  );
                })}
              </div>
              {shown.length === 0 ? (
                <div className="mt-5"><StateBlock title="No articles here" message="Articles you create or submit for review appear in this list." /></div>
              ) : (
                <ul className={`${card} mt-5`}>
                  {shown.map((article) => (
                    <li key={article.id} className="flex flex-col gap-3 border-b border-[#2b3242]/8 px-4 py-3 last:border-0 sm:flex-row sm:items-center" data-testid={`seo-article-${article.slug}`}>
                      <span className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="grid h-12 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#2b3242]/8">
                          {article.image ? <img src={article.image} alt="" loading="lazy" className="h-full w-full object-cover" /> : <FileText size={16} className="text-[#2b3242]/40" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-[#2b3242]">{article.title}</span>
                          <span className="block truncate text-xs text-[#2b3242]/60">{article.category} · updated {new Date(article.updatedAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</span>
                        </span>
                      </span>
                      <span className="flex flex-wrap items-center gap-2">
                        <StatusPill tone={STATUS_TONE[article.status]}>{STATUS_LABEL[article.status]}</StatusPill>
                        {article.status === 'published' && (
                          <a href={`/blog/${article.slug}`} target="_blank" rel="noreferrer" className={adminButtonClass('ghost')}><ExternalLink size={12} /> View</a>
                        )}
                        <button type="button" className={adminButtonClass('ghost')} onClick={() => setEdit({ kind: 'article', id: article.id })}><Pencil size={12} /> Edit</button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <EditorHost edit={edit} overview={overview} user={user} onClose={() => setEdit(null)} onSaved={reload} />
            </>
          )}
        </Loading>
      </div>
    </div>
  );
}

/* ================================================================== technical SEO */

type Check = { state: 'ok' | 'warn' | 'error' | 'loading'; summary: string; detail?: ReactNode };

function CheckCard({ title, check, children }: { title: string; check: Check; children?: ReactNode }) {
  const icon = check.state === 'ok' ? <CheckCircle2 size={18} className="text-[#55735f]" />
    : check.state === 'warn' ? <AlertTriangle size={18} className="text-[#9f7a47]" />
      : check.state === 'error' ? <XCircle size={18} className="text-[#b23b2e]" />
        : <RefreshCw size={16} className="animate-spin text-[#2b3242]/50" />;
  return (
    <section className={`${card} p-4`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-lg text-[#2b3242]">{title}</h3>
          <p className="mt-0.5 text-sm text-[#2b3242]/75">{check.summary}</p>
          {check.detail && <div className="mt-2 text-xs leading-5 text-[#2b3242]/65">{check.detail}</div>}
          {children}
        </div>
      </div>
    </section>
  );
}

/** Reads a file from the site's own origin, exactly as a crawler would request it. */
function useSiteFile(path: string, reloadKey: number) {
  const [state, setState] = useState<{ status: number; type: string; text: string } | null | 'failed'>(null);
  useEffect(() => {
    let active = true;
    setState(null);
    fetch(path, { cache: 'no-store' })
      .then(async (response) => active && setState({ status: response.status, type: response.headers.get('content-type') ?? '', text: await response.text() }))
      .catch(() => active && setState('failed'));
    return () => { active = false; };
  }, [path, reloadKey]);
  return state;
}

export function SeoTechnicalPanel({ user }: { user: AdminUser }) {
  const { data, error, loading, reload } = useSeoOverview();
  const [reloadKey, setReloadKey] = useState(0);
  const sitemap = useSiteFile('/sitemap.xml', reloadKey);
  const robots = useSiteFile('/robots.txt', reloadKey);
  const contact = useContact();
  const ctx = useHeadContext(data?.settings);

  const refresh = () => { reload(); setReloadKey((key) => key + 1); };

  const sitemapCheck: Check = (() => {
    if (sitemap === null) return { state: 'loading', summary: 'Checking /sitemap.xml…' };
    if (sitemap === 'failed' || sitemap.status !== 200 || !sitemap.text.includes('<urlset')) {
      return { state: 'error', summary: '/sitemap.xml is not reachable from this site.', detail: 'It is generated by the API from the live database and served on the site by the hosting rewrite in vercel.json. Check that the latest version is deployed.' };
    }
    const urls = sitemap.text.match(/<loc>/g)?.length ?? 0;
    const hidden = data ? auditSite(data, ctx).filter((item) => item.issues.includes('noindex')).length : 0;
    return { state: 'ok', summary: `${urls} URLs listed, generated from the database on request.`, detail: <>Only live, indexable pages are included{hidden ? `; ${hidden} noindex page${hidden === 1 ? ' is' : 's are'} left out` : ''}. Submit <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="text-[#80623a] underline">sitemap.xml</a> in Google Search Console.</> };
  })();

  const robotsCheck: Check = (() => {
    if (robots === null) return { state: 'loading', summary: 'Checking /robots.txt…' };
    if (robots === 'failed' || robots.status !== 200 || robots.type.includes('html')) return { state: 'error', summary: '/robots.txt is not reachable.' };
    const blocksAll = /^\s*disallow:\s*\/\s*$/im.test(robots.text);
    const listsSitemap = /^\s*sitemap:\s*\S+/im.test(robots.text);
    if (blocksAll) return { state: 'error', summary: 'robots.txt blocks the whole site from search engines.', detail: <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-[#2b3242]/5 p-2 font-mono text-[11px]">{robots.text}</pre> };
    return {
      state: listsSitemap ? 'ok' : 'warn',
      summary: listsSitemap ? 'Crawling allowed; the sitemap is announced; the admin console is excluded.' : 'Crawling allowed, but no Sitemap line.',
      detail: <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-[#2b3242]/5 p-2 font-mono text-[11px]">{robots.text.trim()}</pre>,
    };
  })();

  return (
    <div>
      <AdminPanelHeader title="Technical SEO" description="How search engines and link previews see the site.">
        <RefreshButton onClick={refresh} loading={loading} />
      </AdminPanelHeader>
      <div className="mt-5">
        <Loading data={data} error={error} reload={refresh}>
          {(overview) => {
            const audit = auditSite(overview, ctx);
            const external = audit.filter((item) => item.issues.includes('external-canonical'));
            const customCanonicals = audit.filter((item) => (item.target.item.seo?.canonicalUrl ?? '').trim()).length;
            const liveProperties = overview.properties.filter((row) => row.published).length;
            const liveProjects = overview.projects.filter((row) => row.published).length;
            const liveArticles = overview.articles.filter((row) => row.status === 'published').length;
            const ogCustom = audit.filter((item) => item.target.item.seo?.ogImage).length;
            return (
              <div className="grid gap-4 xl:grid-cols-2">
                <CheckCard title="sitemap.xml" check={sitemapCheck} />
                <CheckCard title="robots.txt" check={robotsCheck} />
                <CheckCard
                  title="Canonical URLs"
                  check={{
                    state: external.length ? 'warn' : 'ok',
                    summary: external.length ? `${external.length} page${external.length === 1 ? '' : 's'} point their canonical at another domain.` : `Every page declares its canonical address on ${ctx.siteUrl.replace(/^https?:\/\//, '')}.`,
                    detail: <>
                      Duplicate routes point at their main page: {Object.entries(PATH_ALIASES).map(([from, to]) => `${from} → ${to}`).join(', ')}. {customCanonicals} page{customCanonicals === 1 ? ' has' : 's have'} a custom canonical.
                    </>,
                  }}
                />
                <CheckCard
                  title="404 page"
                  check={{
                    state: 'ok',
                    summary: 'Unknown addresses show the “Page not found” page with a noindex tag, and a missing listing or article does too.',
                    detail: 'The site is a single-page app, so the host answers such addresses with status 200; the noindex tag is what keeps them out of Google (a “soft 404”).',
                  }}
                />
                <CheckCard
                  title="Structured data (schema.org)"
                  check={{
                    state: contact.phoneDisplay && contact.email ? 'ok' : 'warn',
                    summary: `RealEstateAgent on the home page; RealEstateListing on ${liveProperties} properties and ${liveProjects} projects; BlogPosting on ${liveArticles} articles.`,
                    detail: <>Business details come from Admin › Website content ({contact.phoneDisplay || 'no phone'} · {contact.email || 'no email'}). Test a page in <a href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(`${ctx.siteUrl}/`)}`} target="_blank" rel="noreferrer" className="text-[#80623a] underline">Google’s Rich Results Test</a>.</>,
                  }}
                />
                <CheckCard
                  title="Open Graph (link previews)"
                  check={{
                    state: 'warn',
                    summary: `Every page sets og:title, og:description, og:image and og:url; ${ogCustom} use a custom share image.`,
                    detail: 'Google reads these after the page runs. WhatsApp, Facebook and LinkedIn read the page before it runs, so their previews show the site-wide default title and image from index.html rather than each page’s own. Per-page previews there would need server-side rendering.',
                  }}
                />
                <div className="xl:col-span-2">
                  <SeoSettingsForm overview={overview} user={user} onSaved={refresh} />
                </div>
              </div>
            );
          }}
        </Loading>
      </div>
    </div>
  );
}

function SeoSettingsForm({ overview, user, onSaved }: { overview: SeoOverview; user: AdminUser; onSaved: () => void }) {
  const toast = useToast();
  const [siteUrl, setSiteUrl] = useState(overview.settings.siteUrl);
  const [image, setImage] = useState(overview.settings.defaultOgImage ?? '');
  const [alt, setAlt] = useState(overview.settings.defaultOgImageAlt ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const isAdmin = user.role === 'admin';

  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      await seoApi.saveSettings({ ...(isAdmin ? { siteUrl } : {}), defaultOgImage: image, defaultOgImageAlt: alt });
      toast('success', 'SEO settings saved.');
      onSaved();
    } catch (reason) {
      setErrors(fieldErrorsFrom(reason));
      toast('error', reason instanceof Error ? reason.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={`${card} p-4 sm:p-5`}>
      <h3 className="font-serif text-lg text-[#2b3242]">Site-wide SEO settings</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <TextField
          label="Site address (canonical domain)"
          value={siteUrl}
          onChange={isAdmin ? setSiteUrl : undefined}
          readOnly={!isAdmin}
          error={errors.siteUrl}
          hint={isAdmin ? 'Used for canonical URLs, the sitemap and structured data.' : 'Set by an administrator.'}
        />
        <TextField label="Default share image alt text" value={alt} onChange={setAlt} error={errors.defaultOgImageAlt} placeholder="Describe the default share image" />
        <div className="md:col-span-2">
          <span className={labelClass}>Default share image</span>
          <div className="mt-1.5">
            <ImagePicker label="Used by pages without their own image" value={image} onChange={(next) => setImage(String(Array.isArray(next) ? next[0] ?? '' : next))} help={`Empty uses ${DEFAULT_OG_IMAGE}.`} loadLibrary={seoApi.media} uploadImage={seoApi.upload} />
            {errors.defaultOgImage && <span className="mt-1 block text-xs text-[#b23b2e]">{errors.defaultOgImage}</span>}
          </div>
        </div>
      </div>
      <button type="button" className={`${adminButtonClass()} mt-5`} onClick={save} disabled={saving} data-testid="button-save-seo-settings">
        {saving ? 'Saving…' : 'Save settings'}
      </button>
    </section>
  );
}
