import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Loader2, Mail, Phone, RefreshCw, Search, Trash2, Upload } from 'lucide-react';

import { adminRequest, deleteMedia, listMedia, uploadAdminImage, type AdminUser, type MediaItem } from '@/lib/admin-api';
import {
  AdminPanelHeader,
  ConfirmDialog,
  CopyButton,
  Modal,
  Spinner,
  StateBlock,
  adminButtonClass,
  useToast,
} from '@/pages/admin/admin-ui';
import type { AdminResource } from '@/pages/admin/AdminSidebar';

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
          <div key={key} className="rounded-sm border border-[#202635]/12 bg-white p-4" data-testid={`stat-${key}`}>
            <p className="font-mono text-[10px] uppercase tracking-[.12em] text-[#202635]/50">{COUNT_LABELS[key] ?? key}</p>
            <p className="mt-2 font-serif text-3xl text-[#202635]">{numberFormat.format(Number(value) || 0)}</p>
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
    <section className="rounded-sm border border-[#202635]/12 bg-white">
      <div className="flex items-center justify-between border-b border-[#202635]/10 px-4 py-3">
        <h2 className="font-serif text-lg text-[#202635]">{title}</h2>
        <button type="button" onClick={onOpen} className="font-mono text-[10px] uppercase tracking-[.12em] text-[#c97352] hover:underline">
          Open
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-[#202635]/55">{empty}</p>
      ) : (
        <ul>
          {rows.map((row) => (
            <li key={row.id} className="flex items-start justify-between gap-4 border-b border-[#202635]/8 px-4 py-3 last:border-0">
              <div className="min-w-0">
                <p className="line-clamp-1 text-sm font-medium text-[#202635]">{row.primary}</p>
                {row.secondary && <p className="line-clamp-1 text-xs text-[#202635]/55">{row.secondary}</p>}
              </div>
              <div className="shrink-0 text-right">
                {row.meta && <p className="font-mono text-[10px] uppercase tracking-[.1em] text-[#202635]/45">{row.meta}</p>}
                {row.badge && (
                  <span className={`mt-1 inline-block rounded-sm px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[.1em] ${
                    row.badge === 'live' || row.badge === 'closed' ? 'bg-[#55735f]/12 text-[#3c5a49]' : 'bg-[#c97352]/12 text-[#7c2d12]'
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
          <Search size={15} className="pointer-events-none absolute left-3 text-[#202635]/40" />
          <span className="sr-only">Search enquiries</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, message…" className="w-full rounded-sm border border-[#202635]/20 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#c97352]" data-testid="input-search-inquiries" />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-sm border border-[#202635]/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c97352]">
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
          <div className="overflow-x-auto rounded-sm border border-[#202635]/12 bg-white">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#202635]/12 bg-[#f3efe6] text-left font-mono text-[10px] uppercase tracking-[.12em] text-[#202635]/55">
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
                  <tr key={row.id} className={`border-b border-[#202635]/8 last:border-0 hover:bg-[#f9f6ef] ${(row.status ?? 'new') === 'new' ? 'font-medium' : ''}`} data-testid={`row-inquiry-${row.id}`}>
                    <td className="px-3 py-2.5 text-[#202635]">{row.name}</td>
                    <td className="px-3 py-2.5 text-[#202635]/75">
                      <span className="block truncate">{row.email}</span>
                      {row.phone && <span className="block truncate text-xs text-[#202635]/50">{row.phone}</span>}
                    </td>
                    <td className="px-3 py-2.5 text-[#202635]/75"><span className="line-clamp-1">{row.interest ?? '—'}</span></td>
                    <td className="px-3 py-2.5 text-[#202635]/60">{row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '—'}</td>
                    <td className="px-3 py-2.5">
                      <select
                        value={row.status ?? 'new'}
                        onChange={(event) => setInquiryStatus(row, event.target.value)}
                        disabled={busy === row.id}
                        className="rounded-sm border border-[#202635]/20 bg-white px-2 py-1 font-mono text-[9px] uppercase tracking-[.1em] outline-none focus:border-[#c97352]"
                        data-testid={`select-status-${row.id}`}
                      >
                        {INQUIRY_STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" onClick={() => { setActive(row); if ((row.status ?? 'new') === 'new') setInquiryStatus(row, 'contacted'); }} className={adminButtonClass('ghost')} data-testid={`button-view-inquiry-${row.id}`}>View</button>
                        <button type="button" onClick={() => setDeleting(row)} className="grid h-8 w-8 place-items-center rounded-sm border border-[#202635]/15 text-[#b23b2e] hover:border-[#b23b2e]" title="Delete">
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
          <div className="space-y-4 text-sm text-[#202635]/80">
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Name" value={active.name} />
              <Detail label="Received" value={active.createdAt ? new Date(active.createdAt).toLocaleString('en-GB') : '—'} />
              <Detail label="Email" value={<a className="text-[#c97352] hover:underline" href={`mailto:${active.email}`}>{active.email}</a>} />
              <Detail label="Phone" value={active.phone ? <a className="text-[#c97352] hover:underline" href={`tel:${active.phone}`}>{active.phone}</a> : '—'} />
              <Detail label="Interest" value={active.interest ?? '—'} />
              <Detail label="Type" value={active.inquiryType ?? 'contact'} />
              {active.budget && <Detail label="Budget" value={active.budget} />}
              {active.propertyType && <Detail label="Property type" value={active.propertyType} />}
              {active.location && <Detail label="Preferred location" value={active.location} />}
              {active.propertySlug && <Detail label="Property" value={active.propertySlug} />}
              {active.projectSlug && <Detail label="Project" value={active.projectSlug} />}
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[.12em] text-[#202635]/50">Message</p>
              <p className="mt-1.5 whitespace-pre-wrap rounded-sm border border-[#202635]/12 bg-white p-3 leading-6">{active.message || '—'}</p>
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
      <p className="font-mono text-[10px] uppercase tracking-[.12em] text-[#202635]/50">{label}</p>
      <p className="mt-1 break-words text-[#202635]">{value}</p>
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
        <Search size={15} className="pointer-events-none absolute left-3 text-[#202635]/40" />
        <span className="sr-only">Search subscribers</span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search email…" className="w-full rounded-sm border border-[#202635]/20 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#c97352]" />
      </label>

      <div className="mt-5">
        {rows === null ? (
          <Spinner label="Loading subscribers…" />
        ) : error ? (
          <StateBlock tone="error" title="Could not load subscribers" message={error} action={<button className={adminButtonClass('ghost')} onClick={load}>Try again</button>} />
        ) : filtered.length === 0 ? (
          <StateBlock title="No subscribers yet" message="Sign-ups from the footer newsletter form appear here." />
        ) : (
          <div className="overflow-x-auto rounded-sm border border-[#202635]/12 bg-white">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#202635]/12 bg-[#f3efe6] text-left font-mono text-[10px] uppercase tracking-[.12em] text-[#202635]/55">
                  <th className="px-3 py-2.5 font-normal">Email</th>
                  <th className="px-3 py-2.5 font-normal">Subscribed</th>
                  <th className="px-3 py-2.5 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-b border-[#202635]/8 last:border-0 hover:bg-[#f9f6ef]">
                    <td className="px-3 py-2.5 text-[#202635]">{row.email}</td>
                    <td className="px-3 py-2.5 text-[#202635]/60">
                      {row.subscribedAt || row.createdAt ? new Date(row.subscribedAt ?? row.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button type="button" onClick={() => setDeleting(row)} className="grid h-8 w-8 place-items-center rounded-sm border border-[#202635]/15 text-[#b23b2e] hover:border-[#b23b2e] ml-auto" title="Remove">
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

export function MediaPanel() {
  const toast = useToast();
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<MediaItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<MediaItem | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await listMedia());
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load the media library.');
      setItems([]);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const result = await uploadAdminImage(file);
        if (result.warning) toast('error', result.warning);
      }
      toast('success', files.length > 1 ? `${files.length} files uploaded.` : 'File uploaded.');
      await load();
    } catch (reason) {
      toast('error', reason instanceof Error ? reason.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteMedia(deleting.id);
      setItems((current) => (current ?? []).filter((item) => item.id !== deleting.id));
      toast('success', 'Media deleted.');
      setDeleting(null);
    } catch (reason) {
      toast('error', reason instanceof Error ? reason.message : 'Delete failed.');
    } finally {
      setBusy(false);
    }
  };

  const filtered = (items ?? []).filter((item) =>
    [item.filename, item.folder, item.url].some((value) => String(value ?? '').toLowerCase().includes(query.trim().toLowerCase())),
  );

  return (
    <div>
      <AdminPanelHeader title="Media library" description={items ? `${items.length} file${items.length === 1 ? '' : 's'} stored` : 'Loading…'}>
        <label className={`${adminButtonClass()} cursor-pointer`}>
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} {uploading ? 'Uploading…' : 'Upload files'}
          <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => upload(event.target.files)} data-testid="input-media-upload" />
        </label>
        <button type="button" className={adminButtonClass('ghost')} onClick={load}><RefreshCw size={13} /> Refresh</button>
      </AdminPanelHeader>

      <label className="relative mt-5 flex items-center">
        <Search size={15} className="pointer-events-none absolute left-3 text-[#202635]/40" />
        <span className="sr-only">Search media</span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search file name…" className="w-full rounded-sm border border-[#202635]/20 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#c97352]" />
      </label>

      <div className="mt-5">
        {items === null ? (
          <Spinner label="Loading media…" />
        ) : error ? (
          <StateBlock tone="error" title="Could not load media" message={error} action={<button className={adminButtonClass('ghost')} onClick={load}>Try again</button>} />
        ) : filtered.length === 0 ? (
          <StateBlock title="No media yet" message="Upload images here, or from any image field in the other sections. Files are stored in Cloudinary and reusable everywhere." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <figure key={item.id} className="overflow-hidden rounded-sm border border-[#202635]/12 bg-white">
                <button type="button" onClick={() => setPreview(item)} className="block h-32 w-full bg-[#202635]/5">
                  <img src={item.url} alt={item.filename ?? ''} loading="lazy" className="h-full w-full object-cover" />
                </button>
                <figcaption className="px-3 py-2">
                  <p className="truncate text-xs text-[#202635]">{item.filename ?? 'image'}</p>
                  <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[.1em] text-[#202635]/45">
                    {item.folder ?? 'knc-horizon'} · {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : ''}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <CopyButton value={item.url} label="Copy" />
                    <button type="button" onClick={() => setDeleting(item)} className="grid h-8 w-8 place-items-center rounded-sm border border-[#202635]/15 text-[#b23b2e] hover:border-[#b23b2e]" title="Delete">
                      <Trash2 size={12} />
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
            <img src={preview.url} alt={preview.filename ?? ''} className="mx-auto max-h-[55vh] w-auto rounded-sm" />
            <p className="mt-4 break-all rounded-sm border border-[#202635]/12 bg-white px-3 py-2 font-mono text-xs text-[#202635]/70">{preview.url}</p>
            <div className="mt-3 flex gap-2"><CopyButton value={preview.url} /></div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete media?"
        message="The file will be removed from Cloudinary and the media library."
        warning="Pages still using this image will show a broken image."
        busy={busy}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- settings / content */

type SettingsDoc = Record<string, any> & { id?: string };

export function SettingsPanel({ user, area }: { user: AdminUser | null; area: 'content' | 'settings' }) {
  const toast = useToast();
  const [doc, setDoc] = useState<SettingsDoc | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await adminRequest<{ items: SettingsDoc[] }>('/admin/settings');
      setDoc((data.items ?? [])[0] ?? {});
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load settings.');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!doc) return;
    setSaving(true);
    try {
      const { id, ...body } = doc;
      const saved = id
        ? await adminRequest<{ item: SettingsDoc }>(`/admin/settings/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
        : await adminRequest<{ item: SettingsDoc }>('/admin/settings', { method: 'POST', body: JSON.stringify(body) });
      setDoc(saved.item);
      toast('success', 'Settings saved.');
    } catch (reason) {
      toast('error', reason instanceof Error ? reason.message : 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  const field = (name: string, label: string, type: 'text' | 'textarea' = 'text') => (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[.14em] text-[#202635]/55">{label}</span>
      {type === 'textarea' ? (
        <textarea
          value={doc?.[name] ?? ''}
          onChange={(event) => setDoc((current) => ({ ...(current ?? {}), [name]: event.target.value }))}
          rows={3}
          className="mt-1.5 w-full resize-y rounded-sm border border-[#202635]/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c97352]"
          data-testid={`settings-${name}`}
        />
      ) : (
        <input
          value={doc?.[name] ?? ''}
          onChange={(event) => setDoc((current) => ({ ...(current ?? {}), [name]: event.target.value }))}
          className="mt-1.5 w-full rounded-sm border border-[#202635]/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c97352]"
          data-testid={`settings-${name}`}
        />
      )}
    </label>
  );

  if (doc === null && !error) return <Spinner label="Loading settings…" />;

  return (
    <div>
      <AdminPanelHeader
        title={area === 'content' ? 'Website content' : 'Settings'}
        description={area === 'content' ? 'Contact details and SEO defaults stored in the settings collection.' : 'Account and site configuration.'}
      />

      {error && <div className="mt-5"><StateBlock tone="error" title="Settings unavailable" message={error} action={<button className={adminButtonClass('ghost')} onClick={load}>Try again</button>} /></div>}

      <form onSubmit={save} className="mt-5 max-w-3xl space-y-6">
        {area === 'content' ? (
          <>
            <fieldset>
              <legend className="mb-3 font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352]">Contact details</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {field('contactPhone', 'Phone')}
                {field('contactEmail', 'Email')}
                {field('contactWhatsapp', 'WhatsApp number')}
                {field('officeDubai', 'Dubai office')}
                {field('officeIndia', 'India office')}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-3 font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352]">Home hero</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {field('heroEyebrow', 'Eyebrow')}
                {field('heroHeadline', 'Headline')}
                <div className="sm:col-span-2">{field('heroCopy', 'Intro paragraph', 'textarea')}</div>
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-3 font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352]">SEO defaults</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {field('seoTitle', 'Default title')}
                {field('seoKeywords', 'Keywords')}
                <div className="sm:col-span-2">{field('seoDescription', 'Default description', 'textarea')}</div>
              </div>
            </fieldset>
            <p className="rounded-sm border border-[#202635]/12 bg-white px-3 py-2.5 text-xs leading-5 text-[#202635]/60">
              These values are stored in MongoDB (<code>settings</code>). The public pages currently render their copy from the
              codebase, so changes here are kept for reference until a page is wired to read them.
            </p>
          </>
        ) : (
          <>
            <fieldset>
              <legend className="mb-3 font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352]">Signed in as</legend>
              <div className="rounded-sm border border-[#202635]/12 bg-white px-4 py-3 text-sm">
                <p className="text-[#202635]">{user?.email ?? '—'}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[.12em] text-[#202635]/50">Role: {user?.role ?? 'admin'}</p>
              </div>
              <p className="mt-2 text-xs text-[#202635]/55">
                Admin credentials come from the backend environment (ADMIN_EMAIL / ADMIN_PASSWORD) and are hashed in MongoDB.
                Change them there, then restart the API.
              </p>
            </fieldset>
            <fieldset>
              <legend className="mb-3 font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352]">Site settings</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {field('siteName', 'Site name')}
                {field('defaultCurrency', 'Default currency')}
                {field('leadNotificationEmail', 'Send lead alerts to')}
              </div>
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
