import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, Loader2, Mail, Phone, RefreshCw, Search, Trash2, Upload } from 'lucide-react';

import {
  AdminRequestError,
  DEFAULT_MEDIA_FOLDER,
  MEDIA_FOLDERS,
  adminRequest,
  deleteMedia,
  updateMedia,
  loadMediaLibrary,
  uploadAdminImage,
  type AdminUser,
  type MediaItem,
  type MediaLibrary,
} from '@/lib/admin-api';
import { optimizedImage } from '@/lib/cloudinary-image';
import { apiFetch } from '@/lib/api';
import {
  AdminPanelHeader,
  ConfirmDialog,
  CopyButton,
  Modal,
  Spinner,
  StateBlock,
  adminButtonClass,
  uploadEach,
  useToast,
} from '@/pages/admin/admin-ui';
import type { AdminResource } from '@/pages/admin/AdminSidebar';
import { PhoneInput } from '@/components/phone-input';

type Row = Record<string, any> & { id: string };

const numberFormat = new Intl.NumberFormat('en-AE');

/* ---------------------------------------------------------------- overview */

type DashboardPayload = {
  counts: Record<string, number>;
  recentInquiries?: Row[];
  recentProperties?: Row[];
  recentProjects?: Row[];
  recentPosts?: Row[];
};

const COUNT_LABELS: Record<string, string> = {
  properties: 'Total properties',
  published: 'Published properties',
  forSale: 'For sale',
  forRent: 'For rent',
  residential: 'Residential',
  commercial: 'Commercial',
  projects: 'Off-plan projects',
  developers: 'Developers',
  communities: 'Communities',
  posts: 'Blog posts',
  insights: 'Market insights',
  gallery: 'Gallery items',
  inquiries: 'Unread enquiries',
  totalInquiries: 'Total enquiries',
  subscribers: 'Subscribers',
};

export function OverviewPanel({ onNavigate }: { onNavigate: (resource: AdminResource) => void }) {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [extra, setExtra] = useState<{ properties: Row[]; projects: Row[]; posts: Row[] } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await adminRequest<DashboardPayload>('/admin/dashboard');
      setData(payload);
      setError('');
      const [properties, projects, posts] = await Promise.all([
        adminRequest<any>('/admin/properties-list').then((d) => d.items ?? []).catch(() => []),
        adminRequest<any>('/admin/projects-list').then((d) => d.items ?? []).catch(() => []),
        adminRequest<any>('/admin/blog').then((d) => d.posts ?? []).catch(() => []),
      ]);
      setExtra({ properties: properties.slice(0, 5), projects: projects.slice(0, 5), posts: posts.slice(0, 5) });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load the dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading && !data) return <Spinner label="Loading dashboard…" />;
  if (error && !data) {
    return <StateBlock tone="error" title="Dashboard unavailable" message={error} action={<button className={adminButtonClass('ghost')} onClick={load}>Try again</button>} />;
  }

  const counts = data?.counts ?? {};

  return (
    <div>
      <AdminPanelHeader title="Overview" description="Live figures from the KNC Horizon database.">
        <button type="button" className={adminButtonClass('ghost')} onClick={load} disabled={loading}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </AdminPanelHeader>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {Object.entries(counts).map(([key, value]) => (
          <div key={key} className="rounded-xl border border-[#2b3242]/10 bg-[#fffdf8] shadow-[0_1px_2px_rgba(43,50,66,0.04)] p-4" data-testid={`stat-${key}`}>
            <p className="font-mono text-[11px] uppercase tracking-[.12em] text-[#2b3242]/60">{COUNT_LABELS[key] ?? key}</p>
            <p className="mt-2 font-serif text-3xl text-[#2b3242]">{numberFormat.format(Number(value) || 0)}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <RecentList
          title="Recent enquiries"
          empty="No enquiries yet. Submissions from the public contact form land here."
          onOpen={() => onNavigate('inquiries')}
          rows={(data?.recentInquiries ?? []).map((row) => ({
            id: row.id,
            primary: row.name,
            secondary: `${row.interest ?? 'Enquiry'} · ${row.email ?? ''}`,
            meta: row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '',
            badge: row.status ?? 'new',
          }))}
        />
        <RecentList
          title="Recent properties"
          empty="No properties yet."
          onOpen={() => onNavigate('properties')}
          rows={(extra?.properties ?? []).map((row) => ({
            id: row.id,
            primary: row.title,
            secondary: `${row.type ?? ''} · ${row.location ?? ''}`,
            meta: row.price ? `AED ${numberFormat.format(row.price)}` : '',
            badge: row.published ? 'live' : 'draft',
          }))}
        />
        <RecentList
          title="Recent projects"
          empty="No off-plan projects yet."
          onOpen={() => onNavigate('projects')}
          rows={(extra?.projects ?? []).map((row) => ({
            id: row.id,
            primary: row.title,
            secondary: `${row.developer ?? ''} · ${row.location ?? ''}`,
            meta: row.handover ? `Handover ${row.handover}` : '',
            badge: row.published ? 'live' : 'draft',
          }))}
        />
        <RecentList
          title="Recent blog posts"
          empty="No posts yet."
          onOpen={() => onNavigate('posts')}
          rows={(extra?.posts ?? []).map((row) => ({
            id: row.id,
            primary: row.title,
            secondary: row.category ?? '',
            meta: row.publishedAt ? new Date(row.publishedAt).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '',
            badge: row.published ? 'live' : 'draft',
          }))}
        />
      </div>
    </div>
  );
}

function RecentList({
  title,
  rows,
  empty,
  onOpen,
}: {
  title: string;
  rows: { id: string; primary: string; secondary?: string; meta?: string; badge?: string }[];
  empty: string;
  onOpen: () => void;
}) {
  return (
    <section className="rounded-xl border border-[#2b3242]/10 bg-[#fffdf8] shadow-[0_1px_2px_rgba(43,50,66,0.04)]">
      <div className="flex items-center justify-between border-b border-[#2b3242]/10 px-4 py-3">
        <h2 className="font-serif text-lg text-[#2b3242]">{title}</h2>
        <button type="button" onClick={onOpen} className="font-mono text-[11px] uppercase tracking-[.12em] text-[#9f7a47] hover:underline">
          Open
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-[#2b3242]/65">{empty}</p>
      ) : (
        <ul>
          {rows.map((row) => (
            <li key={row.id} className="flex items-start justify-between gap-4 border-b border-[#2b3242]/8 px-4 py-3 last:border-0">
              <div className="min-w-0">
                <p className="line-clamp-1 text-sm font-medium text-[#2b3242]">{row.primary}</p>
                {row.secondary && <p className="line-clamp-1 text-xs text-[#2b3242]/65">{row.secondary}</p>}
              </div>
              <div className="shrink-0 text-right">
                {row.meta && <p className="font-mono text-[11px] uppercase tracking-[.1em] text-[#2b3242]/65">{row.meta}</p>}
                {row.badge && (
                  <span className={`mt-1 inline-block rounded-lg px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[.1em] ${
                    row.badge === 'live' || row.badge === 'closed' ? 'bg-[#55735f]/12 text-[#3c5a49]' : 'bg-[#8f6d3f]/12 text-[#7c2d12]'
                  }`}>{row.badge}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------- enquiries */

const INQUIRY_STATUSES = ['new', 'contacted', 'closed'] as const;

export function InquiriesPanel() {
  const toast = useToast();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [active, setActive] = useState<Row | null>(null);
  // The listing an enquiry is about, by name: the slug alone is hard to read in a hurry.
  const [listingNames, setListingNames] = useState<Record<string, string>>({});
  useEffect(() => {
    const wanted = [active?.propertySlug && `properties:${active.propertySlug}`, active?.projectSlug && `projects:${active.projectSlug}`].filter((key): key is string => Boolean(key) && !(key! in listingNames));
    for (const key of wanted) {
      const [kind, slug] = key.split(':') as ['properties' | 'projects', string];
      apiFetch<{ property?: { title: string }; project?: { title: string } }>(`/public/${kind}/${encodeURIComponent(slug)}`)
        .then((data) => setListingNames((names) => ({ ...names, [key]: data.property?.title ?? data.project?.title ?? slug })))
        .catch(() => setListingNames((names) => ({ ...names, [key]: `${slug} (no longer published)` })));
    }
  }, [active?.propertySlug, active?.projectSlug]);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await adminRequest<{ inquiries: Row[] }>('/admin/inquiries');
      setRows(data.inquiries ?? []);
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load enquiries.');
      setRows([]);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let list = rows ?? [];
    const needle = query.trim().toLowerCase();
    if (needle) {
      list = list.filter((row) => ['name', 'email', 'phone', 'interest', 'message'].some((key) => String(row[key] ?? '').toLowerCase().includes(needle)));
    }
    if (status) list = list.filter((row) => (row.status ?? 'new') === status);
    return list;
  }, [rows, query, status]);

  const setInquiryStatus = async (row: Row, next: string) => {
    setBusy(row.id);
    try {
      await adminRequest(`/admin/inquiries/${row.id}`, { method: 'PATCH', body: JSON.stringify({ status: next }) });
      setRows((current) => (current ?? []).map((item) => (item.id === row.id ? { ...item, status: next } : item)));
      setActive((current) => (current && current.id === row.id ? { ...current, status: next } : current));
      toast('success', `Marked as ${next}.`);
    } catch (reason) {
      toast('error', reason instanceof Error ? reason.message : 'Could not update the enquiry.');
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(deleting.id);
    try {
      await adminRequest(`/admin/inquiries/${deleting.id}`, { method: 'DELETE' });
      setRows((current) => (current ?? []).filter((row) => row.id !== deleting.id));
      toast('success', 'Enquiry deleted.');
      setDeleting(null);
    } catch (reason) {
      toast('error', reason instanceof Error ? reason.message : 'Delete failed.');
    } finally {
      setBusy(null);
    }
  };

  const unread = (rows ?? []).filter((row) => (row.status ?? 'new') === 'new').length;

  return (
    <div>
      <AdminPanelHeader title="Leads / Enquiries" description={rows ? `${rows.length} total · ${unread} unread` : 'Loading…'}>
        <button type="button" className={adminButtonClass('ghost')} onClick={load}><RefreshCw size={13} /> Refresh</button>
      </AdminPanelHeader>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex min-w-0 flex-1 items-center">
          <Search size={15} className="pointer-events-none absolute left-3 text-[#2b3242]/60" />
          <span className="sr-only">Search enquiries</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, message…" className="w-full rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#9f7a47]" data-testid="input-search-inquiries" />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] px-3 py-2.5 text-sm outline-none focus:border-[#9f7a47]">
          <option value="">All statuses</option>
          {INQUIRY_STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>

      <div className="mt-5">
        {rows === null ? (
          <Spinner label="Loading enquiries…" />
        ) : error ? (
          <StateBlock tone="error" title="Could not load enquiries" message={error} action={<button className={adminButtonClass('ghost')} onClick={load}>Try again</button>} />
        ) : filtered.length === 0 ? (
          <StateBlock title="No enquiries" message="Submissions from the public contact form appear here in real time." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#2b3242]/10 bg-[#fffdf8] shadow-[0_1px_2px_rgba(43,50,66,0.04)]">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#2b3242]/12 bg-[#f7f3ec] text-left font-mono text-[11px] uppercase tracking-[.12em] text-[#2b3242]/65">
                  <th className="px-3 py-2.5 font-normal">Name</th>
                  <th className="px-3 py-2.5 font-normal">Contact</th>
                  <th className="px-3 py-2.5 font-normal">Interest</th>
                  <th className="px-3 py-2.5 font-normal">Received</th>
                  <th className="px-3 py-2.5 font-normal">Status</th>
                  <th className="px-3 py-2.5 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className={`border-b border-[#2b3242]/8 last:border-0 hover:bg-[#fcf9f3] ${(row.status ?? 'new') === 'new' ? 'font-medium' : ''}`} data-testid={`row-inquiry-${row.id}`}>
                    <td className="px-3 py-2.5 text-[#2b3242]">{row.name}</td>
                    <td className="px-3 py-2.5 text-[#2b3242]/75">
                      <span className="block truncate">{row.email}</span>
                      {row.phone && <span className="block truncate text-xs text-[#2b3242]/60">{row.phone}</span>}
                    </td>
                    <td className="px-3 py-2.5 text-[#2b3242]/75"><span className="line-clamp-1">{row.interest ?? '—'}</span></td>
                    <td className="px-3 py-2.5 text-[#2b3242]/60">{row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '—'}</td>
                    <td className="px-3 py-2.5">
                      <select
                        value={row.status ?? 'new'}
                        onChange={(event) => setInquiryStatus(row, event.target.value)}
                        disabled={busy === row.id}
                        className="rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] px-2 py-1 font-mono text-[9px] uppercase tracking-[.1em] outline-none focus:border-[#9f7a47]"
                        data-testid={`select-status-${row.id}`}
                      >
                        {INQUIRY_STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" onClick={() => { setActive(row); if ((row.status ?? 'new') === 'new') setInquiryStatus(row, 'contacted'); }} className={adminButtonClass('ghost')} data-testid={`button-view-inquiry-${row.id}`}>View</button>
                        <button type="button" onClick={() => setDeleting(row)} className="grid h-8 w-8 place-items-center rounded-lg border border-[#2b3242]/15 text-[#b23b2e] hover:border-[#b23b2e]" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={Boolean(active)} title="Enquiry" onClose={() => setActive(null)}>
        {active && (
          <div className="space-y-4 text-sm text-[#2b3242]/80">
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Name" value={active.name} />
              <Detail label="Received" value={active.createdAt ? new Date(active.createdAt).toLocaleString('en-GB') : '—'} />
              <Detail label="Email" value={<a className="text-[#9f7a47] hover:underline" href={`mailto:${active.email}`}>{active.email}</a>} />
              <Detail label="Phone" value={active.phone ? <a className="text-[#9f7a47] hover:underline" href={`tel:${active.phone}`}>{active.phone}</a> : '—'} />
              <Detail label="Interest" value={active.interest ?? '—'} />
              <Detail label="Type" value={active.inquiryType ?? 'contact'} />
              {active.budget && <Detail label="Budget" value={active.budget} />}
              {active.propertyType && <Detail label="Property type" value={active.propertyType} />}
              {active.location && <Detail label="Preferred location" value={active.location} />}
              {active.propertySlug && <Detail label="Property" value={<span data-testid="enquiry-property">{listingNames[`properties:${active.propertySlug}`] ?? active.propertySlug}<span className="block font-mono text-[10px] text-[#2b3242]/50">/properties/{active.propertySlug}</span></span>} />}
              {active.projectSlug && <Detail label="Project" value={<span data-testid="enquiry-project">{listingNames[`projects:${active.projectSlug}`] ?? active.projectSlug}<span className="block font-mono text-[10px] text-[#2b3242]/50">/projects/{active.projectSlug}</span></span>} />}
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[.12em] text-[#2b3242]/60">Message</p>
              <p className="mt-1.5 whitespace-pre-wrap rounded-xl border border-[#2b3242]/10 bg-[#fffdf8] shadow-[0_1px_2px_rgba(43,50,66,0.04)] p-3 leading-6">{active.message || '—'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={`mailto:${active.email}`} className={adminButtonClass()}><Mail size={13} /> Reply by email</a>
              {active.phone && <a href={`tel:${active.phone}`} className={adminButtonClass('ghost')}><Phone size={13} /> Call</a>}
              <button type="button" className={adminButtonClass('ghost')} onClick={() => setInquiryStatus(active, 'closed')}>
                <Check size={13} /> Mark closed
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete enquiry?"
        message={`The enquiry from ${deleting?.name ?? 'this lead'} will be permanently removed from the database.`}
        busy={busy === deleting?.id}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[.12em] text-[#2b3242]/60">{label}</p>
      <p className="mt-1 break-words text-[#2b3242]">{value}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- subscribers */

export function SubscribersPanel() {
  const toast = useToast();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await adminRequest<{ items: Row[] }>('/admin/subscribers');
      setRows(data.items ?? []);
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load subscribers.');
      setRows([]);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = (rows ?? []).filter((row) => String(row.email ?? '').toLowerCase().includes(query.trim().toLowerCase()));

  const remove = async () => {
    if (!deleting) return;
    setBusy(deleting.id);
    try {
      await adminRequest(`/admin/subscribers/${deleting.id}`, { method: 'DELETE' });
      setRows((current) => (current ?? []).filter((row) => row.id !== deleting.id));
      toast('success', 'Subscriber removed.');
      setDeleting(null);
    } catch (reason) {
      toast('error', reason instanceof Error ? reason.message : 'Delete failed.');
    } finally {
      setBusy(null);
    }
  };

  const exportCsv = () => {
    const csv = ['email,subscribed', ...filtered.map((row) => `${row.email},${row.subscribedAt ?? row.createdAt ?? ''}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'knc-subscribers.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <AdminPanelHeader title="Subscribers" description={rows ? `${rows.length} newsletter subscriber${rows.length === 1 ? '' : 's'}` : 'Loading…'}>
        <button type="button" className={adminButtonClass('ghost')} onClick={load}><RefreshCw size={13} /> Refresh</button>
        <button type="button" className={adminButtonClass('ghost')} onClick={exportCsv} disabled={!filtered.length}>Export CSV</button>
      </AdminPanelHeader>

      <label className="relative mt-5 flex items-center">
        <Search size={15} className="pointer-events-none absolute left-3 text-[#2b3242]/60" />
        <span className="sr-only">Search subscribers</span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search email…" className="w-full rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#9f7a47]" />
      </label>

      <div className="mt-5">
        {rows === null ? (
          <Spinner label="Loading subscribers…" />
        ) : error ? (
          <StateBlock tone="error" title="Could not load subscribers" message={error} action={<button className={adminButtonClass('ghost')} onClick={load}>Try again</button>} />
        ) : filtered.length === 0 ? (
          <StateBlock title="No subscribers yet" message="Sign-ups from the footer newsletter form appear here." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#2b3242]/10 bg-[#fffdf8] shadow-[0_1px_2px_rgba(43,50,66,0.04)]">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#2b3242]/12 bg-[#f7f3ec] text-left font-mono text-[11px] uppercase tracking-[.12em] text-[#2b3242]/65">
                  <th className="px-3 py-2.5 font-normal">Email</th>
                  <th className="px-3 py-2.5 font-normal">Subscribed</th>
                  <th className="px-3 py-2.5 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-b border-[#2b3242]/8 last:border-0 hover:bg-[#fcf9f3]">
                    <td className="px-3 py-2.5 text-[#2b3242]">{row.email}</td>
                    <td className="px-3 py-2.5 text-[#2b3242]/60">
                      {row.subscribedAt || row.createdAt ? new Date(row.subscribedAt ?? row.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button type="button" onClick={() => setDeleting(row)} className="grid h-8 w-8 place-items-center rounded-lg border border-[#2b3242]/15 text-[#b23b2e] hover:border-[#b23b2e] ml-auto" title="Remove">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Remove subscriber?"
        message={`${deleting?.email ?? 'This address'} will be removed from the newsletter list.`}
        confirmLabel="Remove"
        busy={busy === deleting?.id}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- media library */

function formatBytes(bytes?: number) {
  if (!bytes) return '';
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** One labelled line of monospace detail (URL, public_id) that can be selected and copied. */
function MediaDetail({ label, value }: { label: string; value?: string | null }) {
  return (
    <p className="mt-1.5 min-w-0">
      <span className="font-mono text-[9px] uppercase tracking-[.12em] text-[#2b3242]/50">{label}</span>
      <span className="block truncate font-mono text-[11px] text-[#2b3242]/80" title={value ?? ''}>{value || '—'}</span>
    </p>
  );
}

/*
 * Where the image came from and on what terms: the photo's page at its source and a note such
 * as "Pexels License, photographer AJ Ahamad". Kept with the image so the licence of every
 * photo on the site can be checked from the console.
 */
function MediaSourceForm({ item, onSaved }: { item: MediaItem; onSaved: (item: MediaItem) => void }) {
  const toast = useToast();
  const [sourceUrl, setSourceUrl] = useState(item.sourceUrl ?? '');
  const [licenseNote, setLicenseNote] = useState(item.licenseNote ?? '');
  const [saving, setSaving] = useState(false);
  useEffect(() => { setSourceUrl(item.sourceUrl ?? ''); setLicenseNote(item.licenseNote ?? ''); }, [item.id, item.sourceUrl, item.licenseNote]);
  const save = async () => {
    setSaving(true);
    try {
      onSaved(await updateMedia(item.id, { sourceUrl: sourceUrl.trim(), licenseNote: licenseNote.trim() }));
      toast('success', 'Source and licence saved.');
    } catch (reason) {
      toast('error', reason instanceof Error ? reason.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="mt-4 rounded-xl border border-[#2b3242]/10 bg-[#fffdf8] px-3 py-3" data-testid="media-source-form">
      <p className="font-mono text-[10px] uppercase tracking-[.12em] text-[#2b3242]/60">Source and licence</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="Photo page, e.g. https://www.pexels.com/photo/…" className="min-w-0 rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] px-3 py-2 text-sm outline-none focus:border-[#9f7a47]" aria-label="Source URL" data-testid="input-media-source" />
        <input value={licenseNote} onChange={(event) => setLicenseNote(event.target.value)} placeholder="Licence, e.g. Pexels License, photographer …" className="min-w-0 rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] px-3 py-2 text-sm outline-none focus:border-[#9f7a47]" aria-label="Licence note" data-testid="input-media-licence" />
      </div>
      <div className="mt-2 flex justify-end">
        <button type="button" className={adminButtonClass('primary')} onClick={save} disabled={saving} data-testid="button-save-media-source">{saving ? 'Saving…' : 'Save source'}</button>
      </div>
    </div>
  );
}

export function MediaPanel() {
  const toast = useToast();
  const [library, setLibrary] = useState<MediaLibrary | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [folderFilter, setFolderFilter] = useState('');
  const [uploadFolder, setUploadFolder] = useState<string>(DEFAULT_MEDIA_FOLDER);
  const [progress, setProgress] = useState('');
  const [failures, setFailures] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<MediaItem | null>(null);
  const [usedBy, setUsedBy] = useState<{ kind: string; name: string }[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<MediaItem | null>(null);

  const load = useCallback(async () => {
    try {
      setLibrary(await loadMediaLibrary());
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load the media library.');
      setLibrary({ items: [], folders: [...MEDIA_FOLDERS] });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Each selected file is its own request and its own Cloudinary asset; one failure does not stop the rest.
  const upload = async (list: FileList | null) => {
    if (!list?.length) return;
    const files = Array.from(list);
    setFailures([]);
    setProgress(`Uploading 0 of ${files.length}…`);
    try {
      const outcomes = await uploadEach(files, (file) => uploadAdminImage(file, uploadFolder), (done, total) => setProgress(`Uploading ${done} of ${total}…`));
      const uploaded = outcomes.filter((outcome) => outcome.result).length;
      const failed = outcomes.flatMap((outcome) => (outcome.error ? [outcome.error] : []));
      if (uploaded) toast('success', `${uploaded} ${uploaded === 1 ? 'image' : 'images'} uploaded to ${uploadFolder}.`);
      if (failed.length) {
        setFailures(failed);
        toast('error', `${failed.length} ${failed.length === 1 ? 'image' : 'images'} could not be uploaded.`);
      }
      await load();
    } finally {
      setProgress('');
    }
  };

  const closeDelete = () => { setDeleting(null); setUsedBy(null); };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteMedia(deleting.id, { force: Boolean(usedBy) });
      setLibrary((current) => (current ? { ...current, items: current.items.filter((item) => item.id !== deleting.id) } : current));
      toast('success', 'Image deleted from Cloudinary and the media library.');
      closeDelete();
    } catch (reason) {
      if (reason instanceof AdminRequestError && reason.status === 409 && reason.usedBy?.length) {
        setUsedBy(reason.usedBy);
      } else {
        toast('error', reason instanceof Error ? reason.message : 'Delete failed.');
      }
    } finally {
      setBusy(false);
    }
  };

  const items = library?.items ?? [];
  const folders = [...new Set([...(library?.folders ?? []), ...items.map((item) => item.folder ?? '').filter(Boolean)])];
  const needle = query.trim().toLowerCase();
  const filtered = items.filter((item) =>
    (!folderFilter || item.folder === folderFilter)
    && (!needle || [item.filename, item.folder, item.url, item.publicId].some((value) => String(value ?? '').toLowerCase().includes(needle))),
  );
  const notConfigured = library?.cloudinary && !library.cloudinary.configured;

  return (
    <div>
      <AdminPanelHeader
        title="Media library"
        description={library ? `${items.length} image${items.length === 1 ? '' : 's'} in Cloudinary${library.cloudinary?.cloudName ? ` · ${library.cloudinary.cloudName}` : ''}` : 'Loading…'}
      >
        <select
          value={uploadFolder}
          onChange={(event) => setUploadFolder(event.target.value)}
          className="rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] px-3 py-2.5 font-mono text-[11px] text-[#2b3242] outline-none focus:border-[#9f7a47]"
          aria-label="Folder for new uploads"
          data-testid="select-media-folder"
        >
          {MEDIA_FOLDERS.map((folder) => <option key={folder} value={folder}>{folder}</option>)}
        </select>
        <label className={`${adminButtonClass()} ${progress || notConfigured ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}>
          {progress ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} {progress || 'Upload images'}
          <input type="file" accept="image/*,.heic,.heif" multiple className="hidden" disabled={Boolean(progress) || Boolean(notConfigured)} onChange={(event) => { upload(event.target.files); event.target.value = ''; }} data-testid="input-media-upload" />
        </label>
        <button type="button" className={adminButtonClass('ghost')} onClick={load}><RefreshCw size={13} /> Refresh</button>
      </AdminPanelHeader>

      {notConfigured && (
        <p className="mt-5 flex items-start gap-2 rounded-lg border border-[#9f7a47]/35 bg-[#8f6d3f]/8 px-4 py-3 text-sm text-[#7c2d12]" role="alert">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          Cloudinary is not configured on the server, so images cannot be uploaded or deleted. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in the backend environment (Render → Environment) and restart it.
        </p>
      )}

      {failures.length > 0 && (
        <div className="mt-5 rounded-lg border border-[#9f7a47]/35 bg-[#8f6d3f]/8 px-4 py-3 text-sm text-[#7c2d12]" role="alert">
          <p className="font-medium">Not uploaded:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs">{failures.map((failure) => <li key={failure}>{failure}</li>)}</ul>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <label className="relative flex flex-1 items-center">
          <Search size={15} className="pointer-events-none absolute left-3 text-[#2b3242]/60" />
          <span className="sr-only">Search media</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search file name, URL or public_id…" className="w-full rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#9f7a47]" />
        </label>
        <select value={folderFilter} onChange={(event) => setFolderFilter(event.target.value)} className="rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] px-3 py-2.5 text-sm outline-none focus:border-[#9f7a47]" aria-label="Filter by folder" data-testid="filter-media-folder">
          <option value="">All folders</option>
          {folders.map((folder) => <option key={folder} value={folder}>{folder}</option>)}
        </select>
      </div>

      <div className="mt-5">
        {library === null ? (
          <Spinner label="Loading media…" />
        ) : error ? (
          <StateBlock tone="error" title="Could not load media" message={error} action={<button className={adminButtonClass('ghost')} onClick={load}>Try again</button>} />
        ) : filtered.length === 0 ? (
          <StateBlock
            title={items.length ? 'Nothing matches' : 'No media yet'}
            message={items.length ? 'Try another search or folder.' : 'Upload images here, or from any image field in the other sections. Each file becomes its own Cloudinary asset, reusable everywhere.'}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="media-grid">
            {filtered.map((item) => (
              <figure key={item.id} className="min-w-0 overflow-hidden rounded-xl border border-[#2b3242]/10 bg-[#fffdf8] shadow-[0_1px_2px_rgba(43,50,66,0.04)]" data-testid={`media-item-${item.id}`}>
                <button type="button" onClick={() => setPreview(item)} className="block h-40 w-full bg-[#2b3242]/5" aria-label={`Preview ${item.filename ?? 'image'}`}>
                  <img src={optimizedImage(item.url, 480)} alt={item.filename ?? ''} loading="lazy" className="h-full w-full object-cover" />
                </button>
                <figcaption className="px-3 py-3">
                  <p className="truncate text-sm text-[#2b3242]" title={item.filename}>{item.filename ?? 'image'}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] text-[#2b3242]/60">
                    <span className="rounded-md bg-[#2b3242]/6 px-1.5 py-0.5 text-[#2b3242]/75">{item.folder ?? '—'}</span>
                    {item.width && item.height ? <span>{item.width}×{item.height}</span> : null}
                    {item.format ? <span className="uppercase">{item.format}</span> : null}
                    {item.size ? <span>{formatBytes(item.size)}</span> : null}
                    {item.createdAt ? <span>{new Date(item.createdAt).toLocaleDateString('en-GB')}</span> : null}
                  </p>
                  <MediaDetail label="Cloudinary URL" value={item.url} />
                  <MediaDetail label="public_id" value={item.publicId} />
                  <MediaDetail label="Source" value={item.sourceUrl} />
                  <MediaDetail label="Licence" value={item.licenseNote} />
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <CopyButton value={item.url} label="Copy URL" />
                    <button type="button" onClick={() => setDeleting(item)} className="ml-auto grid h-9 w-9 place-items-center rounded-lg border border-[#2b3242]/15 text-[#b23b2e] hover:border-[#b23b2e]" title="Delete" aria-label={`Delete ${item.filename ?? 'image'}`} data-testid={`button-delete-media-${item.id}`}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>

      <Modal open={Boolean(preview)} title={preview?.filename ?? 'Preview'} onClose={() => setPreview(null)} wide>
        {preview && (
          <div>
            <img src={optimizedImage(preview.url, 1600)} alt={preview.filename ?? ''} className="mx-auto max-h-[55vh] w-auto rounded-lg" />
            <div className="mt-4 rounded-xl border border-[#2b3242]/10 bg-[#fffdf8] px-3 py-2 shadow-[0_1px_2px_rgba(43,50,66,0.04)]">
              <MediaDetail label="Folder" value={preview.folder} />
              <p className="mt-1.5 break-all font-mono text-xs text-[#2b3242]/70"><span className="block font-mono text-[9px] uppercase tracking-[.12em] text-[#2b3242]/50">Cloudinary URL</span>{preview.url}</p>
              <p className="mt-1.5 break-all font-mono text-xs text-[#2b3242]/70"><span className="block font-mono text-[9px] uppercase tracking-[.12em] text-[#2b3242]/50">public_id</span>{preview.publicId || '—'}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <CopyButton value={preview.url} />
              {preview.publicId && <CopyButton value={preview.publicId} label="Copy public_id" />}
            </div>
            <MediaSourceForm item={preview} onSaved={(item) => { setPreview(item); setLibrary((current) => (current ? { ...current, items: current.items.map((row) => (row.id === item.id ? item : row)) } : current)); }} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title={usedBy ? 'This image is still in use' : 'Delete image?'}
        message={usedBy
          ? `“${deleting?.filename ?? 'This image'}” is shown by: ${usedBy.map((use) => `${use.kind} “${use.name}”`).join(', ')}. Deleting it leaves those pages without this picture.`
          : `“${deleting?.filename ?? 'This image'}” will be removed from Cloudinary and the media library.`}
        warning={usedBy ? 'Replace it in those records first, or delete it anyway.' : undefined}
        confirmLabel={usedBy ? 'Delete anyway' : 'Delete'}
        busy={busy}
        onCancel={closeDelete}
        onConfirm={remove}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- settings / content */

/*
 * Site settings.
 *
 * One validated document in PostgreSQL, served by GET/PUT /admin/settings. The fields are
 * checked here for immediate feedback and again on the server, which is the authority — the
 * screen used to accept anything, including a completely empty save, because neither side
 * validated at all.
 */

type SiteSettings = Record<string, string>;
type FieldErrors = Record<string, string>;
type MailStatus = { configured: boolean; host?: string; reason?: string };

const SETTINGS_FIELDS = ['siteName', 'defaultCurrency', 'leadNotificationEmail'] as const;
const CONTENT_FIELDS = [
  'contactPhone', 'contactEmail', 'contactWhatsapp', 'officeDubai', 'officeIndia', 'studioHours',
  'heroEyebrow', 'heroHeadline', 'heroCopy', 'seoTitle', 'seoKeywords', 'seoDescription',
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mirrors the server rules in backend/src/lib/settings.ts so errors appear before a request. */
function validate(area: 'content' | 'settings', doc: SiteSettings): FieldErrors {
  const errors: FieldErrors = {};
  const value = (name: string) => (doc[name] ?? '').trim();

  if (area === 'settings') {
    if (!value('siteName')) errors.siteName = 'Site name is required.';
    else if (value('siteName').length > 80) errors.siteName = 'Keep this under 80 characters.';
    if (!value('defaultCurrency')) errors.defaultCurrency = 'Choose a default currency.';
    const lead = value('leadNotificationEmail');
    if (lead && !EMAIL_RE.test(lead)) errors.leadNotificationEmail = 'Enter a valid email address.';
  } else {
    if (!value('contactPhone')) errors.contactPhone = 'Phone is required.';
    else if (!/^[+\d][\d\s()-]{6,24}$/.test(value('contactPhone'))) errors.contactPhone = 'Use a format like +971 58 514 1770.';
    if (!value('contactEmail')) errors.contactEmail = 'Email is required.';
    else if (!EMAIL_RE.test(value('contactEmail'))) errors.contactEmail = 'Enter a valid email address.';
    if (!value('contactWhatsapp')) errors.contactWhatsapp = 'WhatsApp number is required.';
    else if (!/^\d{8,15}$/.test(value('contactWhatsapp'))) errors.contactWhatsapp = 'Digits only with country code, e.g. 971585141770.';
    for (const name of ['heroCopy', 'seoDescription']) {
      if (value(name).length > 600) errors[name] = 'Keep this under 600 characters.';
    }
  }
  return errors;
}

export function SettingsPanel({ user, area }: { user: AdminUser | null; area: 'content' | 'settings' }) {
  const toast = useToast();
  const [doc, setDoc] = useState<SiteSettings | null>(null);
  const [currencies, setCurrencies] = useState<string[]>(['AED']);
  const [mail, setMail] = useState<MailStatus | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ sent: boolean; to?: string; reason?: string } | null>(null);

  // Sends one message to the saved lead alert address, so the owner sees that alerts arrive.
  const sendTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      setTestResult(await adminRequest<{ sent: boolean; to?: string; reason?: string }>('/admin/settings/test-email', { method: 'POST' }));
    } catch (reason) {
      setTestResult({ sent: false, reason: reason instanceof Error ? reason.message : 'The test could not be started.' });
    } finally {
      setTesting(false);
    }
  };

  const load = useCallback(async () => {
    try {
      const data = await adminRequest<{ settings: SiteSettings; mail: MailStatus; currencies: string[] }>('/admin/settings');
      setDoc(data.settings ?? {});
      setMail(data.mail ?? null);
      if (data.currencies?.length) setCurrencies(data.currencies);
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load settings.');
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  // Switching panels clears the other panel's messages.
  useEffect(() => { setErrors({}); }, [area]);

  const set = (name: string, value: string) => {
    setDoc((current) => ({ ...(current ?? {}), [name]: value }));
    setErrors((current) => (current[name] ? { ...current, [name]: '' } : current));
  };

  // Validity of phone numbers edited in this session, per the selected country's rules.
  const [phoneValid, setPhoneValid] = useState<Record<string, boolean>>({});

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!doc) return;
    const found = validate(area, doc);
    if (area === 'content') {
      for (const name of ['contactPhone', 'contactWhatsapp']) {
        if (!found[name] && phoneValid[name] === false) found[name] = 'This number is not valid for the selected country.';
      }
    }
    const active = Object.fromEntries(Object.entries(found).filter(([, message]) => message));
    setErrors(active);
    if (Object.keys(active).length) {
      toast('error', 'Please correct the highlighted fields.');
      return;
    }

    // Only this panel's own fields are sent; the server merges them into the shared row.
    const names = area === 'settings' ? SETTINGS_FIELDS : CONTENT_FIELDS;
    const body: SiteSettings = {};
    for (const name of names) body[name] = (doc[name] ?? '').trim();

    setSaving(true);
    try {
      const saved = await adminRequest<{ settings: SiteSettings; mail: MailStatus }>('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      setDoc(saved.settings);
      setMail(saved.mail ?? null);
      toast('success', 'Settings saved.');
    } catch (reason) {
      toast('error', reason instanceof Error ? reason.message : 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (name: string) =>
    `mt-1.5 w-full rounded-lg border bg-[#fffdf8] px-3 py-2.5 text-sm outline-none ${
      errors[name] ? 'border-[#b23b2e] focus:border-[#b23b2e]' : 'border-[#2b3242]/20 focus:border-[#9f7a47]'
    }`;

  const field = (name: string, label: string, type: 'text' | 'textarea' | 'select' = 'text', hint?: string) => (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[.14em] text-[#2b3242]/65">{label}</span>
      {type === 'textarea' ? (
        <textarea
          value={doc?.[name] ?? ''}
          onChange={(event) => set(name, event.target.value)}
          rows={3}
          className={`${inputClass(name)} resize-y`}
          data-testid={`settings-${name}`}
        />
      ) : type === 'select' ? (
        <select
          value={doc?.[name] ?? ''}
          onChange={(event) => set(name, event.target.value)}
          className={inputClass(name)}
          data-testid={`settings-${name}`}
        >
          <option value="">Select a currency</option>
          {currencies.map((code) => <option key={code} value={code}>{code}</option>)}
        </select>
      ) : (
        <input
          value={doc?.[name] ?? ''}
          onChange={(event) => set(name, event.target.value)}
          className={inputClass(name)}
          data-testid={`settings-${name}`}
        />
      )}
      {errors[name] ? (
        <span className="mt-1 block text-xs text-[#b23b2e]" data-testid={`settings-error-${name}`}>{errors[name]}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-[#2b3242]/65">{hint}</span>
      ) : null}
    </label>
  );

  const phoneField = (name: string, label: string, valueFormat: 'international' | 'digits', hint: string) => (
    <div className="block">
      <label htmlFor={`settings-${name}`} className="font-mono text-[11px] uppercase tracking-[.14em] text-[#2b3242]/65">{label}</label>
      <PhoneInput
        id={`settings-${name}`}
        variant="boxed"
        valueFormat={valueFormat}
        value={doc?.[name] ?? ''}
        onChange={(change) => {
          set(name, change.value);
          setPhoneValid((current) => ({ ...current, [name]: change.valid }));
        }}
        error={errors[name]}
        testId={`settings-${name}`}
      />
      {!errors[name] && <span className="mt-1 block text-xs text-[#2b3242]/65">{hint}</span>}
    </div>
  );

  if (doc === null && !error) return <Spinner label="Loading settings…" />;

  return (
    <div>
      <AdminPanelHeader
        title={area === 'content' ? 'Website content' : 'Settings'}
        description={
          area === 'content'
            ? 'Contact details, home hero and SEO defaults. These render on the live site.'
            : 'Account and site configuration.'
        }
      />

      {error && <div className="mt-5"><StateBlock tone="error" title="Settings unavailable" message={error} action={<button className={adminButtonClass('ghost')} onClick={load}>Try again</button>} /></div>}

      <form onSubmit={save} className="mt-5 max-w-3xl space-y-6">
        {area === 'content' ? (
          <>
            <fieldset>
              <legend className="mb-3 font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]">Contact details</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {phoneField('contactPhone', 'Phone', 'international', 'Shown on the site and used for the call link.')}
                {field('contactEmail', 'Email')}
                {phoneField('contactWhatsapp', 'WhatsApp number', 'digits', 'Used for the WhatsApp buttons. Pick the country, then type the number.')}
                {field('studioHours', 'Studio hours')}
                {field('officeDubai', 'Dubai office')}
                {field('officeIndia', 'India office')}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-3 font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]">Home hero</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {field('heroEyebrow', 'Eyebrow')}
                {field('heroHeadline', 'Headline')}
                <div className="sm:col-span-2">{field('heroCopy', 'Intro paragraph', 'textarea')}</div>
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-3 font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]">SEO defaults</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {field('seoTitle', 'Default title')}
                {field('seoKeywords', 'Keywords')}
                <div className="sm:col-span-2">{field('seoDescription', 'Default description', 'textarea')}</div>
              </div>
            </fieldset>
            <p className="rounded-xl border border-[#2b3242]/10 bg-[#fffdf8] shadow-[0_1px_2px_rgba(43,50,66,0.04)] px-3 py-2.5 text-xs leading-5 text-[#2b3242]/60">
              Saved in PostgreSQL and served to the public site, so the phone number, email, WhatsApp button and
              office addresses update everywhere as soon as you save.
            </p>
          </>
        ) : (
          <>
            <fieldset>
              <legend className="mb-3 font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]">Signed in as</legend>
              <div className="rounded-xl border border-[#2b3242]/10 bg-[#fffdf8] shadow-[0_1px_2px_rgba(43,50,66,0.04)] px-4 py-3 text-sm">
                <p className="text-[#2b3242]">{user?.email ?? '—'}</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[.12em] text-[#2b3242]/60">Role: {user?.role ?? 'admin'}</p>
              </div>
              <p className="mt-2 text-xs text-[#2b3242]/65">
                Admin credentials come from the backend environment (ADMIN_EMAIL / ADMIN_PASSWORD) and are hashed in PostgreSQL.
                Change them there, then restart the API.
              </p>
            </fieldset>
            <fieldset>
              <legend className="mb-3 font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]">Site settings</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {field('siteName', 'Site name', 'text', 'Used in the browser tab on every page.')}
                {field('defaultCurrency', 'Default currency', 'select', 'Used when a listing has no currency of its own.')}
                <div className="sm:col-span-2">
                  {field('leadNotificationEmail', 'Send lead alerts to', 'text', 'Every website enquiry is emailed here. Leave blank for no alerts.')}
                </div>
              </div>
              {mail && (
                <p
                  className={`mt-3 rounded-lg border px-3 py-2.5 text-xs leading-5 ${
                    mail.configured
                      ? 'border-[#55735f]/30 bg-[#55735f]/10 text-[#3d5446]'
                      : 'border-[#9f7a47]/35 bg-[#8f6d3f]/10 text-[#2b3242]/70'
                  }`}
                  data-testid="settings-mail-status"
                >
                  {mail.configured
                    ? `Email delivery is active via ${mail.host}. Enquiries are emailed to the address above.`
                    : `Email delivery is not configured, so no alert is sent yet — ${mail.reason} Add the SMTP_* values to the backend environment and restart the API. Enquiries are still saved and listed under Leads / Inquiries.`}
                </p>
              )}
              {mail?.configured && (
                <div className="mt-3">
                  <button type="button" className={adminButtonClass('ghost')} onClick={sendTest} disabled={testing} data-testid="button-send-test-email">
                    {testing ? <Loader2 size={14} className="animate-spin" /> : null} {testing ? 'Sending…' : 'Send a test email'}
                  </button>
                  <span className="ml-3 text-xs text-[#2b3242]/65">Goes to the saved address above. Save first if you changed it.</span>
                  {testResult && (
                    <p
                      className={`mt-3 rounded-lg border px-3 py-2.5 text-xs leading-5 ${
                        testResult.sent
                          ? 'border-[#55735f]/30 bg-[#55735f]/10 text-[#3d5446]'
                          : 'border-[#b23b2e]/30 bg-[#b23b2e]/8 text-[#7c2d12]'
                      }`}
                      role={testResult.sent ? 'status' : 'alert'}
                      data-testid="settings-test-email-result"
                    >
                      {testResult.sent
                        ? `Test email sent to ${testResult.to}. Check that inbox, and its spam folder.`
                        : `The test email was not sent. ${testResult.reason ?? ''}`}
                    </p>
                  )}
                </div>
              )}
            </fieldset>
          </>
        )}

        <button type="submit" className={adminButtonClass()} disabled={saving} data-testid="button-save-settings">
          {saving ? <Loader2 size={14} className="animate-spin" /> : null} {saving ? 'Saving…' : 'Save settings'}
        </button>
      </form>
    </div>
  );
}
