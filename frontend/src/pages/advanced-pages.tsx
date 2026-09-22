import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, LogOut, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { Link, useLocation, useRoute } from 'wouter';
import { ContactForm, ErrorState, PageHero, SectionIntro, SectionLabel } from '@/components/blocks';
import { adminFetch, apiFetch, type Project } from '@/lib/api';
import { defaultProjects } from '@/lib/site-data';
import { usePageMeta } from '@/lib/seo';

const fallbackImage = '/images/creek-waterfront.jpg';

export function ProjectDetailPage() {
  // Both /projects/:slug and the /project/:id alias registered in App.tsx land here
  const [, slugParams] = useRoute('/projects/:slug');
  const [, idParams] = useRoute('/project/:id');
  const slug = slugParams?.slug ?? idParams?.id;
  const params = slug ? { slug } : undefined;
  const defaultMatch = defaultProjects.find((p) => p.slug === slug || p.id === slug);
  const [project, setProject] = useState<Project | null>((defaultMatch as unknown as Project) || null);
  const [error, setError] = useState('');

  usePageMeta(
    project?.title ?? 'Project details',
    project
      ? `${project.title} in ${project.location}. Explore the project and request its brief from KNC Horizon Realtor.`
      : 'Explore Dubai property projects with KNC Horizon Realtor.'
  );

  useEffect(() => {
    if (!params?.slug) return;
    apiFetch<{ project: Project }>(`/public/projects/${params.slug}`)
      .then((data) => setProject(data.project))
      .catch((reason) => {
        if (!project) setError(reason instanceof Error ? reason.message : 'Project not found.');
      });
  }, [params?.slug]);

  if (error && !project) {
    return (
      <main className="bg-[#f5f0e6] px-5 py-40 md:px-10">
        <div className="mx-auto max-w-[900px]">
          <ErrorState message={error} />
          <Link href="/projects" className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352]">
            <ArrowLeft size={14} /> Back to projects
          </Link>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="bg-[#f5f0e6] px-5 py-40">
        <div className="mx-auto max-w-[1280px]">
          <p className="eyebrow text-[#c97352]">KNC Horizon</p>
          <p className="display mt-5 text-4xl">Loading project…</p>
        </div>
      </main>
    );
  }

  const images = project.gallery?.length ? project.gallery : [project.image || fallbackImage];

  return (
    <main>
      <PageHero
        label={[project.category, project.status].filter(Boolean).join(' \u00b7 ') || 'Off-plan development'}
        title={
          <>
            {project.title}
            <br />
            <em className="text-[#d9c6a4]">{project.location}.</em>
          </>
        }
        copy={project.description}
        image={project.image || fallbackImage}
      />
      <section className="bg-[#f5f0e6] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1280px] gap-14 md:grid-cols-[1fr_.8fr] md:gap-24">
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              {images.map((image) => (
                <div key={image} className="card-thumb aspect-[16/10] h-[220px] sm:h-[260px] md:h-[300px] w-full">
                  <img
                    src={image}
                    alt={project.title}
                    onError={(event) => {
                      event.currentTarget.src = fallbackImage;
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="mt-12">
              <SectionLabel>About the project</SectionLabel>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#202635]/65">{project.description}</p>
              <div className="mt-8 grid grid-cols-2 gap-3 border-t border-[#202635]/15 pt-5 sm:grid-cols-3">
                {(project.amenities ?? ['Design-led architecture', 'Resident amenities', 'Long-term value']).map((item) => (
                  <span key={item} className="flex items-start gap-2 text-sm text-[#202635]/65">
                    <Check size={15} className="mt-0.5 text-[#c97352]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="h-fit border-t border-[#202635]/20 pt-5">
            <SectionLabel>Project details</SectionLabel>
            <p className="mt-5 font-serif text-4xl">From AED {new Intl.NumberFormat('en-AE').format(project.startingPrice)}</p>
            <div className="mt-8 grid gap-y-5 border-y border-[#202635]/15 py-6 text-sm">
              <span>{project.developer}</span>
              <span>{project.location}</span>
              <span>Handover {project.handover}</span>
            </div>
            <h3 className="block-title mt-12">
              Request the<br />
              <em className="text-[#c97352]">project brief.</em>
            </h3>
            <div className="mt-7">
              <ContactForm compact inquiryType="project" projectSlug={project.slug} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

type AdminItem = Record<string, any> & { id: string };

type InquiryStatus = 'new' | 'contacted' | 'closed';

function InquiryPanel({
  item,
  onStatusUpdate,
}: {
  item: AdminItem;
  onStatusUpdate: (id: string, status: InquiryStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const currentStatus: InquiryStatus = (item.status ?? 'new').toLowerCase() as InquiryStatus;

  const statusColors: Record<InquiryStatus, string> = {
    new: 'text-[#c97352]',
    contacted: 'text-[#55735f]',
    closed: 'text-[#202635]/40',
  };

  const nextStatus: Record<InquiryStatus, { label: string; value: InquiryStatus }> = {
    new: { label: 'Mark contacted', value: 'contacted' },
    contacted: { label: 'Mark closed', value: 'closed' },
    closed: { label: 'Reopen', value: 'new' },
  };

  return (
    <div className="border-b border-[#202635]/12 py-5">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-serif text-xl">{item.name}</p>
            <span className={`font-mono text-[10px] uppercase tracking-[.12em] ${statusColors[currentStatus]}`}>
              {currentStatus}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#202635]/55">
            {item.email}
            {item.phone ? ` · ${item.phone}` : ''}
            {item.interest ? ` · ${item.interest}` : ''}
          </p>
        </div>
        <span className={`mt-0.5 font-mono text-[10px] uppercase tracking-[.1em] text-[#202635]/45 ${expanded ? 'rotate-180 block' : ''} transition-transform`}>
          {expanded ? '▲' : '▼'}
        </span>
      </button>
      {expanded && (
        <div className="mt-4 border-l-2 border-[#c97352]/30 pl-4">
          {item.message && (
            <p className="mb-4 text-sm leading-6 text-[#202635]/65 italic">"{item.message}"</p>
          )}
          {item.propertySlug && (
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[.1em] text-[#202635]/50">
              Property: <Link href={`/properties/${item.propertySlug}`} className="text-[#c97352] underline">{item.propertySlug}</Link>
            </p>
          )}
          {item.projectSlug && (
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[.1em] text-[#202635]/50">
              Project: <Link href={`/projects/${item.projectSlug}`} className="text-[#c97352] underline">{item.projectSlug}</Link>
            </p>
          )}
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[.1em] text-[#202635]/40">
            Received: {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { dateStyle: 'long' }) : 'Unknown date'}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onStatusUpdate(item.id, nextStatus[currentStatus].value)}
              className="border border-[#55735f] px-4 py-2 font-mono text-[10px] uppercase tracking-[.12em] text-[#55735f] hover:bg-[#55735f] hover:text-white transition-colors"
            >
              {nextStatus[currentStatus].label}
            </button>
            {item.phone && (
              <a
                href={`https://wa.me/${item.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="border border-[#202635]/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[.12em] text-[#202635]/60 hover:bg-[#202635] hover:text-[#f5f0e6] transition-colors"
              >
                WhatsApp
              </a>
            )}
            {item.email && (
              <a
                href={`mailto:${item.email}`}
                className="border border-[#202635]/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[.12em] text-[#202635]/60 hover:bg-[#202635] hover:text-[#f5f0e6] transition-colors"
              >
                Email
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BlogManagement() {
  const emptyDraft = { title: '', slug: '', excerpt: '', content: '', featuredImage: '/images/creek-waterfront.jpg', category: 'General', author: 'KNC Horizon', seoTitle: '', seoDescription: '', status: 'draft' };
  const [posts, setPosts] = useState<AdminItem[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');
  const load = () => adminFetch<{ posts: AdminItem[] }>('/admin/blog').then((data) => setPosts(data.posts)).catch(() => setMessage('Unable to load blog posts.'));
  useEffect(() => { load(); }, []);
  function updateDraft(field: keyof typeof emptyDraft, value: string) { setDraft((current) => ({ ...current, [field]: value })); }
  async function save(event: FormEvent) {
    event.preventDefault(); setMessage('');
    try { await adminFetch(editingId ? `/admin/blog/${editingId}` : '/admin/blog', { method: editingId ? 'PATCH' : 'POST', body: JSON.stringify(draft) }); setDraft(emptyDraft); setEditingId(''); setMessage('Blog post saved.'); load(); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : 'Unable to save blog post.'); }
  }
  function edit(post: AdminItem) { setEditingId(post.id); setDraft({ ...emptyDraft, ...post, featuredImage: post.featuredImage ?? post.image ?? emptyDraft.featuredImage }); }
  async function remove(id: string) { if (!window.confirm('Delete this blog post?')) return; await adminFetch(`/admin/blog/${id}`, { method: 'DELETE' }); load(); }
  async function toggle(post: AdminItem) { await adminFetch(`/admin/blog/${post.id}`, { method: 'PATCH', body: JSON.stringify({ ...post, status: post.status === 'published' || post.published ? 'draft' : 'published' }) }); load(); }
  const fields: Array<[keyof typeof emptyDraft, string]> = [['title', 'Title'], ['slug', 'Slug'], ['excerpt', 'Excerpt'], ['content', 'Content'], ['featuredImage', 'Featured image URL'], ['category', 'Category'], ['author', 'Author'], ['seoTitle', 'SEO title'], ['seoDescription', 'SEO description']];
  return <section className="mt-16 border-t border-[#202635]/15 pt-10"><div className="flex flex-wrap items-end justify-between gap-5"><div><SectionLabel>Blog management</SectionLabel><h2 className="section-title mt-4">Publish a <em className="text-[#c97352]">new note.</em></h2></div>{message && <p className="text-sm text-[#c97352]">{message}</p>}</div><form onSubmit={save} className="mt-8 grid gap-5 border-y border-[#202635]/15 py-7 md:grid-cols-2">{fields.map(([field, label]) => <label key={field} className={field === 'content' || field === 'excerpt' || field === 'seoDescription' ? 'md:col-span-2' : ''}><span className="eyebrow text-[#202635]/50">{label}</span>{field === 'content' || field === 'excerpt' || field === 'seoDescription' ? <textarea required={field === 'content'} value={draft[field]} onChange={(event) => updateDraft(field, event.target.value)} className="mt-2 min-h-24 w-full border-b border-[#202635]/25 bg-transparent py-2 text-sm outline-none focus:border-[#c97352]" /> : <input required={field === 'title' || field === 'slug'} value={draft[field]} onChange={(event) => updateDraft(field, event.target.value)} className="mt-2 w-full border-b border-[#202635]/25 bg-transparent py-2 text-sm outline-none focus:border-[#c97352]" />}</label>)}<label><span className="eyebrow text-[#202635]/50">Status</span><select value={draft.status} onChange={(event) => updateDraft('status', event.target.value)} className="mt-2 w-full border-b border-[#202635]/25 bg-transparent py-2 text-sm"><option value="draft">Draft</option><option value="published">Published</option></select></label><div className="flex items-end gap-3"><button className="bg-[#202635] px-5 py-3 font-mono text-[10px] uppercase tracking-[.14em] text-[#f5f0e6]">{editingId ? 'Update post' : 'Create post'}</button>{editingId && <button type="button" onClick={() => { setEditingId(''); setDraft(emptyDraft); }} className="border border-[#202635]/25 px-5 py-3 font-mono text-[10px] uppercase tracking-[.13em]">Cancel</button>}</div></form><div className="divide-y divide-[#202635]/15 border-y border-[#202635]/15">{posts.map((post) => <div key={post.id} className="flex flex-wrap items-center justify-between gap-4 py-5"><div><p className="font-serif text-2xl">{post.title}</p><p className="mt-1 text-xs text-[#202635]/55">{post.status === 'published' || post.published ? 'Published' : 'Draft'} · {post.category}</p></div><div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[.1em]"><button onClick={() => toggle(post)} className="text-[#55735f]">{post.status === 'published' || post.published ? 'Unpublish' : 'Publish'}</button><button onClick={() => edit(post)} className="text-[#202635]/65">Edit</button><button onClick={() => remove(post.id)} className="text-[#c97352]" aria-label={`Delete ${post.title}`}><Trash2 size={16} /></button></div></div>)}</div></section>;
}

export function AdminPage() {
  const [, setLocation] = useLocation();
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [inquiries, setInquiries] = useState<AdminItem[]>([]);
  const [inquiryFilter, setInquiryFilter] = useState<'all' | InquiryStatus>('all');
  const [error, setError] = useState('');
  const [resource, setResource] = useState<'properties' | 'projects' | 'posts' | 'developers'>('properties');
  const [items, setItems] = useState<AdminItem[]>([]);

  useEffect(() => {
    adminFetch<{ counts: Record<string, number> }>('/admin/dashboard')
      .then((data) => setCounts(data.counts))
      .catch((reason) => { setError(reason instanceof Error ? reason.message : 'Please sign in again.'); });
    adminFetch<{ inquiries: AdminItem[] }>('/admin/inquiries')
      .then((data) => setInquiries(data.inquiries))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    adminFetch<{ items: AdminItem[] }>(`/admin/${resource}`)
      .then((data) => setItems(data.items))
      .catch(() => setItems([]));
  }, [resource]);

  function logout() { localStorage.removeItem('knc_admin_token'); setLocation('/login'); }

  async function deleteItem(id: string) {
    if (!window.confirm('Delete this record? This cannot be undone.')) return;
    await adminFetch(`/admin/${resource}/${id}`, { method: 'DELETE' });
    setItems((current) => current.filter((item) => item.id !== id));
  }

  async function updateInquiryStatus(id: string, status: InquiryStatus) {
    try {
      await adminFetch(`/admin/inquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setInquiries((current) =>
        current.map((item) => (item.id === id ? { ...item, status } : item))
      );
    } catch {
      // silently fail — status update is best-effort
    }
  }

  const filteredInquiries = inquiryFilter === 'all'
    ? inquiries
    : inquiries.filter((item) => (item.status ?? 'new').toLowerCase() === inquiryFilter);

  const inquiryCounts = {
    all: inquiries.length,
    new: inquiries.filter((i) => (i.status ?? 'new').toLowerCase() === 'new').length,
    contacted: inquiries.filter((i) => (i.status ?? '').toLowerCase() === 'contacted').length,
    closed: inquiries.filter((i) => (i.status ?? '').toLowerCase() === 'closed').length,
  };

  if (error) return (
    <main className="bg-[#f5f0e6] px-5 py-40 md:px-10">
      <div className="mx-auto max-w-[900px]">
        <ErrorState message={error} />
        <Link href="/login" className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352]">
          Sign in again <ArrowUpRight size={14} />
        </Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#e9e4da] px-5 py-32 md:px-10">
      <div className="mx-auto max-w-[1280px]">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel>Protected workspace</SectionLabel>
            <h1 className="page-title mt-4">KNC <em className="text-[#c97352]">dashboard.</em></h1>
          </div>
          <button onClick={logout} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#202635]/65 hover:text-[#c97352]">
            <LogOut size={14} /> Sign out
          </button>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-6">
          {['properties', 'projects', 'developers', 'posts', 'inquiries', 'subscribers'].map((key) => (
            <div key={key} className="border-t border-[#202635]/20 p-4">
              <p className="display text-4xl">{counts?.[key] ?? '—'}</p>
              <p className="mt-2 eyebrow text-[#c97352]">{key}</p>
            </div>
          ))}
        </div>

        {/* Content + Leads grid */}
        <section className="mt-16 grid gap-12 lg:grid-cols-[1fr_.85fr]">
          {/* Content management */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <SectionIntro label="Content management" title={<>Keep the edit<br /><em className="text-[#c97352]">alive.</em></>} />
              <div className="flex gap-2">
                {(['properties', 'projects', 'developers', 'posts'] as const).map((key) => (
                  <button key={key} onClick={() => setResource(key)} className={`px-3 py-2 font-mono text-[10px] uppercase tracking-[.12em] ${resource === key ? 'bg-[#202635] text-[#f5f0e6]' : 'border border-[#202635]/20'}`}>{key}</button>
                ))}
              </div>
            </div>
            <div className="mt-8 divide-y divide-[#202635]/15 border-y border-[#202635]/15">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-5">
                  <div>
                    <p className="font-serif text-xl">{item.title}</p>
                    <p className="mt-1 text-xs text-[#202635]/55">{item.location ?? item.category ?? item.status ?? 'Draft record'}</p>
                  </div>
                  <button onClick={() => deleteItem(item.id)} className="text-[#c97352]" aria-label={`Delete ${item.title}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {!items.length && <p className="py-8 text-sm text-[#202635]/60">No records found.</p>}
            </div>
            <div className="mt-5 flex items-center gap-2">
              <Plus size={14} className="text-[#c97352]" />
              <span className="font-mono text-[10px] uppercase tracking-[.14em] text-[#202635]/50">
                Use the blog management section below to add content
              </span>
            </div>
          </div>

          {/* Enquiry / Lead management */}
          <div>
            <SectionLabel>Lead management</SectionLabel>
            <h2 className="section-title mt-4">Enquiries &amp; <em className="text-[#c97352]">leads.</em></h2>

            {/* Status filter tabs */}
            <div className="mt-7 flex flex-wrap gap-2 border-b border-[#202635]/15 pb-5">
              {(['all', 'new', 'contacted', 'closed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setInquiryFilter(status)}
                  className={`flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] uppercase tracking-[.12em] transition-colors ${
                    inquiryFilter === status ? 'bg-[#202635] text-[#f5f0e6]' : 'border border-[#202635]/20 text-[#202635]/60 hover:border-[#c97352] hover:text-[#c97352]'
                  }`}
                >
                  {status}
                  <span className={`grid h-4 w-4 place-items-center rounded-full text-[9px] ${inquiryFilter === status ? 'bg-[#c97352]' : 'bg-[#202635]/15'}`}>
                    {inquiryCounts[status]}
                  </span>
                </button>
              ))}
            </div>

            {/* Enquiry list */}
            <div className="mt-2">
              {filteredInquiries.length === 0 ? (
                <p className="py-8 text-sm text-[#202635]/60">No enquiries in this category.</p>
              ) : (
                filteredInquiries.map((item) => (
                  <InquiryPanel key={item.id} item={item} onStatusUpdate={updateInquiryStatus} />
                ))
              )}
            </div>
          </div>
        </section>

        <BlogManagement />
      </div>
    </main>
  );
}