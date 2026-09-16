import { Link } from 'wouter';
import {
  ArrowUpRight,
  Building2,
  Calendar,
  Check,
  ChevronRight,
  ExternalLink,
  FileText,
  FolderGit2,
  Image as ImageIcon,
  Key,
  LayoutDashboard,
  Mail,
  Menu,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings,
  Trash2,
  UserCheck,
  Users2,
  X,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { adminFetch } from '@/lib/api';
import { ErrorState, SectionLabel } from '@/components/blocks';
import { AdminSidebar, type AdminResource } from '@/pages/admin/AdminSidebar';
import './admin.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type AdminDashboardProps = {
  logout: () => void;
};

type AdminItem = {
  id: string;
  [key: string]: unknown;
};

type InquiryStatus = 'new' | 'contacted' | 'closed';

type PropertyForm = {
  title: string;
  location: string;
  type: string;
  status: string;
  price: number;
  featured: boolean;
  published: boolean;
};

type ProjectForm = {
  title: string;
  developer: string;
  location: string;
  startingPrice: number;
  featured: boolean;
  published: boolean;
};

type DeveloperForm = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  officialWebsite: string;
  logo: string;
  coverImage: string;
  established: string;
  areas: string;
  sortOrder: number;
  published: boolean;
  featured: boolean;
};

type BlogForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  author: string;
  status: 'draft' | 'published';
  seoTitle: string;
  seoDescription: string;
};

type ContentForm = {
  title: string;
  category: string;
  image: string;
  featured: boolean;
};

const emptyPropertyForm: PropertyForm = {
  title: '',
  location: '',
  type: 'residential',
  status: 'available',
  price: 0,
  featured: false,
  published: true,
};

const emptyProjectForm: ProjectForm = {
  title: '',
  developer: '',
  location: '',
  startingPrice: 0,
  featured: false,
  published: true,
};

const emptyDeveloperForm: DeveloperForm = {
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  officialWebsite: '',
  logo: '',
  coverImage: '',
  established: '',
  areas: '',
  sortOrder: 0,
  published: true,
  featured: false,
};

const emptyBlogForm: BlogForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featuredImage: '/images/creek-waterfront.jpg',
  category: 'Market Insights',
  author: 'KNC Horizon Advisory',
  status: 'published',
  seoTitle: '',
  seoDescription: '',
};

const emptyContentForm: ContentForm = {
  title: '',
  category: 'architecture',
  image: '/images/creek-waterfront.jpg',
  featured: false,
};

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function numberValue(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function booleanValue(value: unknown): boolean {
  return value === true;
}

export function AdminDashboard({ logout }: AdminDashboardProps) {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [inquiries, setInquiries] = useState<AdminItem[]>([]);
  const [inquiryFilter, setInquiryFilter] = useState<'all' | InquiryStatus>('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [resource, setResource] = useState<AdminResource>('overview');
  const [items, setItems] = useState<AdminItem[]>([]);

  /* Property modal */
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editProperty, setEditProperty] = useState<AdminItem | null>(null);
  const [propForm, setPropForm] = useState<PropertyForm>(emptyPropertyForm);

  /* Project modal */
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editProject, setEditProject] = useState<AdminItem | null>(null);
  const [projForm, setProjForm] = useState<ProjectForm>(emptyProjectForm);

  /* Developer modal */
  const [showDeveloperModal, setShowDeveloperModal] = useState(false);
  const [editDeveloper, setEditDeveloper] = useState<AdminItem | null>(null);
  const [devForm, setDevForm] = useState<DeveloperForm>(emptyDeveloperForm);

  /* Blog modal */
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editBlog, setEditBlog] = useState<AdminItem | null>(null);
  const [blogForm, setBlogForm] = useState<BlogForm>(emptyBlogForm);

  /* Content modal */
  const [showContentModal, setShowContentModal] = useState(false);
  const [contentForm, setContentForm] = useState<ContentForm>(emptyContentForm);

  /* Load dashboard stats & inquiries */
  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const data = await adminFetch<{ counts: Record<string, number> }>('/admin/dashboard');
        if (active) setCounts(data.counts);
      } catch (reason) {
        if (active) {
          setError(reason instanceof Error ? reason.message : 'Please sign in again.');
        }
      }

      try {
        const data = await adminFetch<{ inquiries: AdminItem[] }>('/admin/inquiries');
        if (active) setInquiries(data.inquiries);
      } catch {
        if (active) setInquiries([]);
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  /* Load selected resource */
  useEffect(() => {
    let active = true;

    async function loadResource() {
      if (resource === 'overview') {
        setItems([]);
        return;
      }

      setLoading(true);

      try {
        let endpoint = `/admin/${resource}`;
        if (resource === 'developers') {
          endpoint = '/admin/developers-detail';
        } else if (resource === 'posts') {
          endpoint = '/admin/blog';
        }

        const data = await adminFetch<{
          items?: AdminItem[];
          developers?: AdminItem[];
          posts?: AdminItem[];
        }>(endpoint);

        if (!active) return;

        if (Array.isArray(data.items)) {
          setItems(data.items);
        } else if (Array.isArray(data.developers)) {
          setItems(data.developers);
        } else if (Array.isArray(data.posts)) {
          setItems(data.posts);
        } else {
          setItems([]);
        }
      } catch {
        if (active) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadResource();

    return () => {
      active = false;
    };
  }, [resource]);

  async function refreshResource(target: AdminResource = resource) {
    if (target === 'overview' || target === 'inquiries' || target === 'settings') return;

    try {
      let endpoint = `/admin/${target}`;
      if (target === 'developers') endpoint = '/admin/developers-detail';
      else if (target === 'posts') endpoint = '/admin/blog';

      const data = await adminFetch<{
        items?: AdminItem[];
        developers?: AdminItem[];
        posts?: AdminItem[];
      }>(endpoint);

      if (Array.isArray(data.items)) {
        setItems(data.items);
      } else if (Array.isArray(data.developers)) {
        setItems(data.developers);
      } else if (Array.isArray(data.posts)) {
        setItems(data.posts);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    }
  }

  async function deleteItem(id: string, customResource?: string) {
    if (!window.confirm('Delete this record? This cannot be undone.')) return;

    const res = customResource || (resource === 'posts' ? 'blog' : resource);
    try {
      await adminFetch(`/admin/${res}/${id}`, { method: 'DELETE' });
      setItems((current) => current.filter((item) => item.id !== id));
      // Refresh counts
      adminFetch<{ counts: Record<string, number> }>('/admin/dashboard')
        .then((d) => setCounts(d.counts))
        .catch(() => undefined);
    } catch (reason) {
      window.alert(reason instanceof Error ? reason.message : 'Unable to delete this record.');
    }
  }

  async function updateInquiryStatus(id: string, status: InquiryStatus) {
    try {
      await adminFetch(`/admin/inquiries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      setInquiries((current) =>
        current.map((item) => (item.id === id ? { ...item, status } : item)),
      );
    } catch (reason) {
      window.alert(reason instanceof Error ? reason.message : 'Unable to update enquiry.');
    }
  }

  /* ---------------- PROPERTY CRUD ---------------- */
  function openAddProperty() {
    setEditProperty(null);
    setPropForm({ ...emptyPropertyForm });
    setShowPropertyModal(true);
  }

  function openEditProperty(item: AdminItem) {
    setEditProperty(item);
    setPropForm({
      title: stringValue(item.title),
      location: stringValue(item.location),
      type: stringValue(item.type) || 'residential',
      status: stringValue(item.status) || 'available',
      price: numberValue(item.price),
      featured: booleanValue(item.featured),
      published: booleanValue(item.published),
    });
    setShowPropertyModal(true);
  }

  async function saveProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const url = editProperty ? `/admin/properties/${editProperty.id}` : '/admin/properties';
      await adminFetch(url, {
        method: editProperty ? 'PATCH' : 'POST',
        body: JSON.stringify(propForm),
      });

      setShowPropertyModal(false);
      setEditProperty(null);
      setPropForm({ ...emptyPropertyForm });
      await refreshResource('properties');
    } catch (reason) {
      window.alert(reason instanceof Error ? reason.message : 'Unable to save property.');
    }
  }

  /* ---------------- PROJECT CRUD ---------------- */
  function openAddProject() {
    setEditProject(null);
    setProjForm({ ...emptyProjectForm });
    setShowProjectModal(true);
  }

  function openEditProject(item: AdminItem) {
    setEditProject(item);
    setProjForm({
      title: stringValue(item.title),
      developer: stringValue(item.developer),
      location: stringValue(item.location),
      startingPrice: numberValue(item.startingPrice),
      featured: booleanValue(item.featured),
      published: booleanValue(item.published),
    });
    setShowProjectModal(true);
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const url = editProject ? `/admin/projects/${editProject.id}` : '/admin/projects';
      await adminFetch(url, {
        method: editProject ? 'PATCH' : 'POST',
        body: JSON.stringify(projForm),
      });

      setShowProjectModal(false);
      setEditProject(null);
      setProjForm({ ...emptyProjectForm });
      await refreshResource('projects');
    } catch (reason) {
      window.alert(reason instanceof Error ? reason.message : 'Unable to save project.');
    }
  }

  /* ---------------- DEVELOPER CRUD ---------------- */
  function makeDeveloperSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function openAddDeveloper() {
    setEditDeveloper(null);
    setDevForm({ ...emptyDeveloperForm });
    setShowDeveloperModal(true);
  }

  function openEditDeveloper(item: AdminItem) {
    setEditDeveloper(item);
    const areas = Array.isArray(item.areas)
      ? item.areas.filter((area): area is string => typeof area === 'string').join(', ')
      : stringValue(item.areas);

    setDevForm({
      name: stringValue(item.name),
      slug: stringValue(item.slug) || makeDeveloperSlug(stringValue(item.name)),
      shortDescription: stringValue(item.shortDescription),
      description: stringValue(item.description),
      officialWebsite: stringValue(item.officialWebsite) || stringValue(item.website),
      logo: stringValue(item.logo),
      coverImage: stringValue(item.coverImage),
      established: stringValue(item.established),
      areas,
      sortOrder: numberValue(item.sortOrder),
      published: booleanValue(item.published),
      featured: booleanValue(item.featured),
    });
    setShowDeveloperModal(true);
  }

  async function saveDeveloper(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const areas = devForm.areas
        .split(',')
        .map((area) => area.trim())
        .filter(Boolean);

      const payload = {
        name: devForm.name.trim(),
        slug: devForm.slug.trim() || makeDeveloperSlug(devForm.name),
        shortDescription: devForm.shortDescription.trim(),
        description: devForm.description.trim(),
        officialWebsite: devForm.officialWebsite.trim(),
        logo: devForm.logo.trim(),
        coverImage: devForm.coverImage.trim(),
        established: devForm.established.trim(),
        areas,
        sortOrder: devForm.sortOrder,
        published: devForm.published,
        featured: devForm.featured,
      };

      const url = editDeveloper
        ? `/admin/developers/${editDeveloper.id}`
        : '/admin/developers';

      await adminFetch(url, {
        method: editDeveloper ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });

      setShowDeveloperModal(false);
      setEditDeveloper(null);
      setDevForm({ ...emptyDeveloperForm });
      await refreshResource('developers');
    } catch (reason) {
      window.alert(reason instanceof Error ? reason.message : 'Unable to save developer.');
    }
  }

  /* ---------------- BLOG CRUD ---------------- */
  function openAddBlog() {
    setEditBlog(null);
    setBlogForm({ ...emptyBlogForm });
    setShowBlogModal(true);
  }

  function openEditBlog(item: AdminItem) {
    setEditBlog(item);
    setBlogForm({
      title: stringValue(item.title),
      slug: stringValue(item.slug),
      excerpt: stringValue(item.excerpt),
      content: stringValue(item.content),
      featuredImage: stringValue(item.featuredImage) || stringValue(item.image) || '/images/creek-waterfront.jpg',
      category: stringValue(item.category) || 'Market Insights',
      author: stringValue(item.author) || 'KNC Horizon Advisory',
      status: item.status === 'published' || item.published === true ? 'published' : 'draft',
      seoTitle: stringValue(item.seoTitle) || stringValue(item.title),
      seoDescription: stringValue(item.seoDescription) || stringValue(item.excerpt),
    });
    setShowBlogModal(true);
  }

  async function saveBlog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const url = editBlog ? `/admin/blog/${editBlog.id}` : '/admin/blog';
      await adminFetch(url, {
        method: editBlog ? 'PATCH' : 'POST',
        body: JSON.stringify(blogForm),
      });

      setShowBlogModal(false);
      setEditBlog(null);
      setBlogForm({ ...emptyBlogForm });
      await refreshResource('posts');
    } catch (reason) {
      window.alert(reason instanceof Error ? reason.message : 'Unable to save blog post.');
    }
  }

  async function toggleBlogStatus(item: AdminItem) {
    const newStatus = item.status === 'published' || item.published ? 'draft' : 'published';
    try {
      await adminFetch(`/admin/blog/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      await refreshResource('posts');
    } catch (reason) {
      window.alert(reason instanceof Error ? reason.message : 'Unable to update status.');
    }
  }

  /* ---------------- CONTENT / GALLERY CRUD ---------------- */
  function openAddContent() {
    setContentForm({ ...emptyContentForm });
    setShowContentModal(true);
  }

  async function saveContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await adminFetch('/admin/content', {
        method: 'POST',
        body: JSON.stringify(contentForm),
      });
      setShowContentModal(false);
      setContentForm({ ...emptyContentForm });
      await refreshResource('content');
    } catch (reason) {
      window.alert(reason instanceof Error ? reason.message : 'Unable to add content item.');
    }
  }

  /* Filtered inquiries */
  const filteredInquiries =
    inquiryFilter === 'all'
      ? inquiries
      : inquiries.filter((item) => (stringValue(item.status) || 'new').toLowerCase() === inquiryFilter);

  const inquiryCounts = {
    all: inquiries.length,
    new: inquiries.filter((item) => (stringValue(item.status) || 'new').toLowerCase() === 'new').length,
    contacted: inquiries.filter((item) => stringValue(item.status).toLowerCase() === 'contacted').length,
    closed: inquiries.filter((item) => stringValue(item.status).toLowerCase() === 'closed').length,
  };

  /* ---------------- RENDER OVERVIEW ---------------- */
  function renderOverview() {
    const statCards: Array<{
      key: AdminResource;
      label: string;
      count: number | string;
      icon: React.ReactNode;
      color: string;
    }> = [
      { key: 'properties', label: 'Properties', count: counts?.properties ?? '—', icon: <Building2 size={20} />, color: '#202635' },
      { key: 'projects', label: 'Projects', count: counts?.projects ?? '—', icon: <FolderGit2 size={20} />, color: '#c97352' },
      { key: 'developers', label: 'Developers', count: counts?.developers ?? '—', icon: <Users2 size={20} />, color: '#55735f' },
      { key: 'posts', label: 'Blog Posts', count: counts?.posts ?? '—', icon: <FileText size={20} />, color: '#202635' },
      { key: 'inquiries', label: 'New Leads', count: counts?.inquiries ?? '—', icon: <Mail size={20} />, color: '#c97352' },
      { key: 'subscribers', label: 'Subscribers', count: counts?.subscribers ?? '—', icon: <UserCheck size={20} />, color: '#55735f' },
    ];

    return (
      <div className="space-y-10">
        <div>
          <SectionLabel>Dashboard Overview</SectionLabel>
          <h2 className="font-serif text-3xl font-normal text-[#202635] mt-1">
            Real Estate Portfolio <em className="text-[#c97352]">Snapshot</em>
          </h2>
          <p className="mt-1 text-xs text-[#202635]/60">
            Real-time synchronization with KNC Horizon database.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {statCards.map((stat) => (
            <button
              key={stat.key}
              type="button"
              onClick={() => setResource(stat.key)}
              className="group flex flex-col justify-between border border-[#202635]/12 bg-[#f5f0e6] p-4 text-left transition-all hover:border-[#c97352] hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[#202635]/50 group-hover:text-[#c97352] transition-colors">
                  {stat.icon}
                </span>
                <ChevronRight size={14} className="text-[#202635]/30 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="mt-4">
                <p className="font-serif text-3xl font-medium text-[#202635]">{stat.count}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[.14em] text-[#202635]/60">
                  {stat.label}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Actions & Recent Enquiries */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="border border-[#202635]/12 bg-[#f5f0e6] p-6 lg:col-span-1">
            <h3 className="font-serif text-lg text-[#202635]">Quick Actions</h3>
            <p className="text-xs text-[#202635]/55 mt-0.5">Manage live website listings</p>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setResource('properties');
                  openAddProperty();
                }}
                className="btn w-full justify-start border border-[#202635]/15 bg-white/70 hover:border-[#c97352]"
              >
                <Plus size={14} className="text-[#c97352]" />
                <span>Add New Property</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setResource('projects');
                  openAddProject();
                }}
                className="btn w-full justify-start border border-[#202635]/15 bg-white/70 hover:border-[#c97352]"
              >
                <Plus size={14} className="text-[#c97352]" />
                <span>Add New Project</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setResource('developers');
                  openAddDeveloper();
                }}
                className="btn w-full justify-start border border-[#202635]/15 bg-white/70 hover:border-[#c97352]"
              >
                <Plus size={14} className="text-[#c97352]" />
                <span>Add Developer</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setResource('posts');
                  openAddBlog();
                }}
                className="btn w-full justify-start border border-[#202635]/15 bg-white/70 hover:border-[#c97352]"
              >
                <Plus size={14} className="text-[#c97352]" />
                <span>Publish Blog Note</span>
              </button>
            </div>
          </div>

          {/* Recent Enquiries Preview */}
          <div className="border border-[#202635]/12 bg-[#f5f0e6] p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-[#202635]">Recent Enquiries</h3>
                <p className="text-xs text-[#202635]/55">Client advisory requests</p>
              </div>
              <button
                type="button"
                onClick={() => setResource('inquiries')}
                className="font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352] hover:underline"
              >
                View All ({inquiries.length}) →
              </button>
            </div>

            <div className="mt-4 divide-y divide-[#202635]/10">
              {inquiries.slice(0, 4).map((inquiry) => (
                <div key={inquiry.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-serif text-sm font-medium text-[#202635]">
                      {stringValue(inquiry.name) || 'Anonymous Client'}
                    </p>
                    <p className="text-xs text-[#202635]/55">
                      {stringValue(inquiry.email)}
                      {inquiry.phone ? ` · ${stringValue(inquiry.phone)}` : ''}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                      stringValue(inquiry.status) === 'contacted'
                        ? 'bg-[#55735f]/15 text-[#55735f]'
                        : stringValue(inquiry.status) === 'closed'
                        ? 'bg-[#202635]/15 text-[#202635]'
                        : 'bg-[#c97352]/15 text-[#c97352]'
                    }`}
                  >
                    {stringValue(inquiry.status) || 'new'}
                  </span>
                </div>
              ))}
              {inquiries.length === 0 && (
                <p className="py-6 text-center text-xs text-[#202635]/50">No inquiries yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- RENDER PROPERTIES ---------------- */
  function renderProperties() {
    return (
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <SectionLabel>Properties Archive</SectionLabel>
            <h2 className="font-serif text-2xl text-[#202635] mt-1">
              Active <em className="text-[#c97352]">Listings</em> ({items.length})
            </h2>
          </div>
          <button type="button" className="btn btn-primary" onClick={openAddProperty}>
            <Plus size={14} /> Add Property
          </button>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-[#202635]/60">Loading properties…</p>
        ) : items.length === 0 ? (
          <div className="border border-dashed border-[#202635]/20 p-12 text-center">
            <p className="font-serif text-lg text-[#202635]">No properties found.</p>
            <p className="mt-1 text-xs text-[#202635]/50">Click "Add Property" to create your first listing.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#202635]/12 bg-[#f5f0e6]">
            <table className="table">
              <thead>
                <tr className="border-b border-[#202635]/15 text-[#202635]/50 text-xs font-mono uppercase tracking-[.1em]">
                  <th>Title</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Price (AED)</th>
                  <th>Status</th>
                  <th>Live</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202635]/10">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/40">
                    <td className="font-medium text-[#202635]">
                      {stringValue(item.title)}
                      {booleanValue(item.featured) && (
                        <span className="ml-2 rounded-xs bg-[#c97352]/15 px-1.5 py-0.5 text-[9px] font-mono uppercase text-[#c97352]">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="text-[#202635]/70">{stringValue(item.location) || '—'}</td>
                    <td className="capitalize text-[#202635]/70">{stringValue(item.type) || '—'}</td>
                    <td className="font-mono text-xs">
                      {numberValue(item.price) > 0 ? numberValue(item.price).toLocaleString('en-AE') : 'On Request'}
                    </td>
                    <td>
                      <span className="rounded-xs bg-[#202635]/8 px-2 py-0.5 text-[10px] uppercase font-mono">
                        {stringValue(item.status) || 'available'}
                      </span>
                    </td>
                    <td>
                      {booleanValue(item.published) ? (
                        <span className="text-[#55735f] text-xs flex items-center gap-1">
                          <Check size={12} /> Yes
                        </span>
                      ) : (
                        <span className="text-[#202635]/40 text-xs">Draft</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openEditProperty(item)}
                          className="font-mono text-xs text-[#202635]/70 hover:text-[#c97352]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteItem(item.id, 'properties')}
                          className="text-[#c97352] hover:opacity-75"
                          aria-label="Delete property"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Property Modal */}
        <Dialog open={showPropertyModal} onOpenChange={setShowPropertyModal}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                {editProperty ? 'Edit Property Listing' : 'Add New Property Listing'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={saveProperty} className="mt-4 space-y-4">
              <div className="grid gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                  Property Title *
                </label>
                <input
                  required
                  className="input"
                  placeholder="e.g. Marina Penthouse with Skyline Views"
                  value={propForm.title}
                  onChange={(e) => setPropForm({ ...propForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                    Location
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. Dubai Marina"
                    value={propForm.location}
                    onChange={(e) => setPropForm({ ...propForm, location: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                    Price (AED)
                  </label>
                  <input
                    type="number"
                    className="input"
                    placeholder="e.g. 12500000"
                    value={propForm.price || ''}
                    onChange={(e) => setPropForm({ ...propForm, price: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                    Type
                  </label>
                  <select
                    className="input"
                    value={propForm.type}
                    onChange={(e) => setPropForm({ ...propForm, type: e.target.value })}
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="investment">Investment</option>
                    <option value="off-plan">Off-Plan</option>
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                    Status
                  </label>
                  <select
                    className="input"
                    value={propForm.status}
                    onChange={(e) => setPropForm({ ...propForm, status: e.target.value })}
                  >
                    <option value="available">Available</option>
                    <option value="under-offer">Under Offer</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={propForm.featured}
                    onChange={(e) => setPropForm({ ...propForm, featured: e.target.checked })}
                  />
                  <span className="text-xs font-mono uppercase">Featured Listing</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={propForm.published}
                    onChange={(e) => setPropForm({ ...propForm, published: e.target.checked })}
                  />
                  <span className="text-xs font-mono uppercase">Published Live</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#202635]/10">
                <button
                  type="button"
                  className="btn border border-[#202635]/20"
                  onClick={() => setShowPropertyModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editProperty ? 'Save Changes' : 'Create Property'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </section>
    );
  }

  /* ---------------- RENDER PROJECTS ---------------- */
  function renderProjects() {
    return (
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <SectionLabel>Projects Archive</SectionLabel>
            <h2 className="font-serif text-2xl text-[#202635] mt-1">
              Off-Plan & New Launches ({items.length})
            </h2>
          </div>
          <button type="button" className="btn btn-primary" onClick={openAddProject}>
            <Plus size={14} /> Add Project
          </button>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-[#202635]/60">Loading projects…</p>
        ) : items.length === 0 ? (
          <div className="border border-dashed border-[#202635]/20 p-12 text-center">
            <p className="font-serif text-lg text-[#202635]">No projects found.</p>
            <p className="mt-1 text-xs text-[#202635]/50">Click "Add Project" to create a new development.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#202635]/12 bg-[#f5f0e6]">
            <table className="table">
              <thead>
                <tr className="border-b border-[#202635]/15 text-[#202635]/50 text-xs font-mono uppercase tracking-[.1em]">
                  <th>Title</th>
                  <th>Developer</th>
                  <th>Location</th>
                  <th>Starting Price</th>
                  <th>Live</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202635]/10">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/40">
                    <td className="font-medium text-[#202635]">
                      {stringValue(item.title)}
                      {booleanValue(item.featured) && (
                        <span className="ml-2 rounded-xs bg-[#c97352]/15 px-1.5 py-0.5 text-[9px] font-mono uppercase text-[#c97352]">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="text-[#202635]/70">{stringValue(item.developer) || '—'}</td>
                    <td className="text-[#202635]/70">{stringValue(item.location) || '—'}</td>
                    <td className="font-mono text-xs">
                      {numberValue(item.startingPrice) > 0
                        ? `AED ${numberValue(item.startingPrice).toLocaleString('en-AE')}`
                        : 'On Request'}
                    </td>
                    <td>
                      {booleanValue(item.published) ? (
                        <span className="text-[#55735f] text-xs flex items-center gap-1">
                          <Check size={12} /> Yes
                        </span>
                      ) : (
                        <span className="text-[#202635]/40 text-xs">Draft</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openEditProject(item)}
                          className="font-mono text-xs text-[#202635]/70 hover:text-[#c97352]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteItem(item.id, 'projects')}
                          className="text-[#c97352] hover:opacity-75"
                          aria-label="Delete project"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Project Modal */}
        <Dialog open={showProjectModal} onOpenChange={setShowProjectModal}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                {editProject ? 'Edit Project' : 'Add New Project'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={saveProject} className="mt-4 space-y-4">
              <div className="grid gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                  Project Title *
                </label>
                <input
                  required
                  className="input"
                  placeholder="e.g. Palm Jumeirah Ultra Villas"
                  value={projForm.title}
                  onChange={(e) => setProjForm({ ...projForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                    Developer Name
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. Emaar, Omniyat"
                    value={projForm.developer}
                    onChange={(e) => setProjForm({ ...projForm, developer: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                    Location
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. Palm Jumeirah"
                    value={projForm.location}
                    onChange={(e) => setProjForm({ ...projForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                  Starting Price (AED)
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder="e.g. 5000000"
                  value={projForm.startingPrice || ''}
                  onChange={(e) => setProjForm({ ...projForm, startingPrice: Number(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projForm.featured}
                    onChange={(e) => setProjForm({ ...projForm, featured: e.target.checked })}
                  />
                  <span className="text-xs font-mono uppercase">Featured Project</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projForm.published}
                    onChange={(e) => setProjForm({ ...projForm, published: e.target.checked })}
                  />
                  <span className="text-xs font-mono uppercase">Published Live</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#202635]/10">
                <button
                  type="button"
                  className="btn border border-[#202635]/20"
                  onClick={() => setShowProjectModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </section>
    );
  }

  /* ---------------- RENDER DEVELOPERS ---------------- */
  function renderDevelopers() {
    return (
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <SectionLabel>Developers Directory</SectionLabel>
            <h2 className="font-serif text-2xl text-[#202635] mt-1">
              Real Estate <em className="text-[#c97352]">Developers</em> ({items.length})
            </h2>
          </div>
          <button type="button" className="btn btn-primary" onClick={openAddDeveloper}>
            <Plus size={14} /> Add Developer
          </button>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-[#202635]/60">Loading developers…</p>
        ) : items.length === 0 ? (
          <div className="border border-dashed border-[#202635]/20 p-12 text-center">
            <p className="font-serif text-lg text-[#202635]">No developers found.</p>
            <p className="mt-1 text-xs text-[#202635]/50">Click "Add Developer" to register a partner developer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#202635]/12 bg-[#f5f0e6]">
            <table className="table">
              <thead>
                <tr className="border-b border-[#202635]/15 text-[#202635]/50 text-xs font-mono uppercase tracking-[.1em]">
                  <th>Developer Name</th>
                  <th>Slug</th>
                  <th>Established</th>
                  <th>Assigned Projects</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202635]/10">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/40">
                    <td className="font-medium text-[#202635]">
                      {stringValue(item.name)}
                      {booleanValue(item.featured) && (
                        <span className="ml-2 rounded-xs bg-[#c97352]/15 px-1.5 py-0.5 text-[9px] font-mono uppercase text-[#c97352]">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="font-mono text-xs text-[#202635]/60">{stringValue(item.slug)}</td>
                    <td className="text-[#202635]/70">{stringValue(item.established) || '—'}</td>
                    <td>
                      <span className="rounded-xs bg-[#55735f]/15 px-2 py-0.5 text-xs font-mono text-[#55735f]">
                        {numberValue(item.projectCount)} projects
                      </span>
                    </td>
                    <td>
                      {booleanValue(item.published) ? (
                        <span className="text-[#55735f] text-xs flex items-center gap-1">
                          <Check size={12} /> Active
                        </span>
                      ) : (
                        <span className="text-[#202635]/40 text-xs">Hidden</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openEditDeveloper(item)}
                          className="font-mono text-xs text-[#202635]/70 hover:text-[#c97352]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteItem(item.id, 'developers')}
                          className="text-[#c97352] hover:opacity-75"
                          aria-label="Delete developer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Developer Modal */}
        <Dialog open={showDeveloperModal} onOpenChange={setShowDeveloperModal}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                {editDeveloper ? 'Edit Developer Details' : 'Add New Developer'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={saveDeveloper} className="mt-4 space-y-4">
              <div className="grid gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                  Developer Name *
                </label>
                <input
                  required
                  className="input"
                  placeholder="e.g. Emaar Properties"
                  value={devForm.name}
                  onChange={(e) => setDevForm({ ...devForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                    Official Website
                  </label>
                  <input
                    className="input"
                    placeholder="https://..."
                    value={devForm.officialWebsite}
                    onChange={(e) => setDevForm({ ...devForm, officialWebsite: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                    Established Year
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. 1997"
                    value={devForm.established}
                    onChange={(e) => setDevForm({ ...devForm, established: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                  Key Areas (comma-separated)
                </label>
                <input
                  className="input"
                  placeholder="Downtown Dubai, Dubai Hills, Creek Harbour"
                  value={devForm.areas}
                  onChange={(e) => setDevForm({ ...devForm, areas: e.target.value })}
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                  Description
                </label>
                <textarea
                  className="input min-h-20 py-2"
                  placeholder="Short background summary..."
                  value={devForm.description}
                  onChange={(e) => setDevForm({ ...devForm, description: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={devForm.featured}
                    onChange={(e) => setDevForm({ ...devForm, featured: e.target.checked })}
                  />
                  <span className="text-xs font-mono uppercase">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={devForm.published}
                    onChange={(e) => setDevForm({ ...devForm, published: e.target.checked })}
                  />
                  <span className="text-xs font-mono uppercase">Published Live</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#202635]/10">
                <button
                  type="button"
                  className="btn border border-[#202635]/20"
                  onClick={() => setShowDeveloperModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editDeveloper ? 'Save Changes' : 'Create Developer'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </section>
    );
  }

  /* ---------------- RENDER BLOG ---------------- */
  function renderBlog() {
    return (
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <SectionLabel>Editorial Archive</SectionLabel>
            <h2 className="font-serif text-2xl text-[#202635] mt-1">
              Insights & <em className="text-[#c97352]">Articles</em> ({items.length})
            </h2>
          </div>
          <button type="button" className="btn btn-primary" onClick={openAddBlog}>
            <Plus size={14} /> Write Article
          </button>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-[#202635]/60">Loading articles…</p>
        ) : items.length === 0 ? (
          <div className="border border-dashed border-[#202635]/20 p-12 text-center">
            <p className="font-serif text-lg text-[#202635]">No blog articles published.</p>
            <p className="mt-1 text-xs text-[#202635]/50">Click "Write Article" to publish your first note.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#202635]/12 bg-[#f5f0e6]">
            <table className="table">
              <thead>
                <tr className="border-b border-[#202635]/15 text-[#202635]/50 text-xs font-mono uppercase tracking-[.1em]">
                  <th>Title</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202635]/10">
                {items.map((item) => {
                  const isPublished = item.status === 'published' || item.published === true;
                  return (
                    <tr key={item.id} className="hover:bg-white/40">
                      <td className="font-medium text-[#202635]">
                        {stringValue(item.title)}
                        <p className="font-mono text-[10px] text-[#202635]/40">{stringValue(item.slug)}</p>
                      </td>
                      <td className="text-[#202635]/70">{stringValue(item.category) || 'General'}</td>
                      <td className="text-[#202635]/70">{stringValue(item.author) || 'KNC Horizon'}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => toggleBlogStatus(item)}
                          className={`rounded-xs px-2 py-0.5 text-[10px] font-mono uppercase ${
                            isPublished
                              ? 'bg-[#55735f]/15 text-[#55735f] hover:bg-[#55735f]/25'
                              : 'bg-[#202635]/10 text-[#202635]/60 hover:bg-[#202635]/20'
                          }`}
                        >
                          {isPublished ? 'Published' : 'Draft'} (Toggle)
                        </button>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openEditBlog(item)}
                            className="font-mono text-xs text-[#202635]/70 hover:text-[#c97352]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteItem(item.id, 'blog')}
                            className="text-[#c97352] hover:opacity-75"
                            aria-label="Delete article"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Blog Modal */}
        <Dialog open={showBlogModal} onOpenChange={setShowBlogModal}>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                {editBlog ? 'Edit Blog Article' : 'Write New Article'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={saveBlog} className="mt-4 space-y-4">
              <div className="grid gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                  Article Title *
                </label>
                <input
                  required
                  className="input"
                  placeholder="e.g. Dubai Waterfront Property Trends 2026"
                  value={blogForm.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setBlogForm({
                      ...blogForm,
                      title,
                      slug: editBlog ? blogForm.slug : makeDeveloperSlug(title),
                    });
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                    URL Slug *
                  </label>
                  <input
                    required
                    className="input"
                    placeholder="dubai-waterfront-trends"
                    value={blogForm.slug}
                    onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                    Category
                  </label>
                  <input
                    className="input"
                    placeholder="Market Insights, Design, Areas"
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                  Excerpt (Summary)
                </label>
                <textarea
                  className="input min-h-16 py-2"
                  placeholder="Brief preview of this article..."
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                  Article Content *
                </label>
                <textarea
                  required
                  className="input min-h-40 py-2 font-sans"
                  placeholder="Write the full article body..."
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                    Author
                  </label>
                  <input
                    className="input"
                    value={blogForm.author}
                    onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                    Status
                  </label>
                  <select
                    className="input"
                    value={blogForm.status}
                    onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value as 'draft' | 'published' })}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#202635]/10">
                <button
                  type="button"
                  className="btn border border-[#202635]/20"
                  onClick={() => setShowBlogModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editBlog ? 'Save Changes' : 'Publish Article'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </section>
    );
  }

  /* ---------------- RENDER LEADS / INQUIRIES ---------------- */
  function renderLeads() {
    return (
      <section className="space-y-6">
        <div>
          <SectionLabel>Client Inquiries</SectionLabel>
          <h2 className="font-serif text-2xl text-[#202635] mt-1">
            Lead Management ({inquiries.length})
          </h2>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#202635]/15 pb-3">
          {(['all', 'new', 'contacted', 'closed'] as const).map((status) => (
            <button
              type="button"
              key={status}
              onClick={() => setInquiryFilter(status)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-[.12em] transition-all rounded-xs ${
                inquiryFilter === status
                  ? 'bg-[#202635] text-[#f5f0e6]'
                  : 'border border-[#202635]/20 text-[#202635]/60 hover:border-[#c97352] hover:text-[#c97352]'
              }`}
            >
              {status}
              <span
                className={`ml-1.5 inline-block rounded-full px-1.5 py-0.2 text-[9px] ${
                  inquiryFilter === status
                    ? 'bg-[#c97352] text-[#f5f0e6]'
                    : 'bg-[#202635]/15 text-[#202635]'
                }`}
              >
                {inquiryCounts[status]}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredInquiries.length === 0 ? (
            <div className="border border-dashed border-[#202635]/20 p-12 text-center">
              <p className="text-sm text-[#202635]/60">No enquiries found in this category.</p>
            </div>
          ) : (
            filteredInquiries.map((item) => {
              const phone = stringValue(item.phone);
              const email = stringValue(item.email);
              const status = (stringValue(item.status) || 'new') as InquiryStatus;
              const nextStatus: InquiryStatus =
                status === 'new' ? 'contacted' : status === 'contacted' ? 'closed' : 'new';

              return (
                <div
                  key={item.id}
                  className="border border-[#202635]/12 bg-[#f5f0e6] p-5 transition-all hover:border-[#202635]/25"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <p className="font-serif text-lg font-medium text-[#202635]">
                          {stringValue(item.name) || 'Anonymous Enquiry'}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                            status === 'contacted'
                              ? 'bg-[#55735f]/15 text-[#55735f]'
                              : status === 'closed'
                              ? 'bg-[#202635]/15 text-[#202635]'
                              : 'bg-[#c97352]/15 text-[#c97352]'
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#202635]/60">
                        {email}
                        {phone ? ` · ${phone}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateInquiryStatus(item.id, nextStatus)}
                        className="rounded-xs border border-[#202635]/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[#202635] hover:border-[#c97352] hover:text-[#c97352]"
                      >
                        Set: {nextStatus}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteItem(item.id, 'inquiries')}
                        className="text-[#c97352] hover:opacity-75 p-1"
                        aria-label="Delete enquiry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {item.message ? (
                    <p className="mt-3 rounded-xs border border-[#202635]/8 bg-white/40 p-3 text-xs italic text-[#202635]/80">
                      "{stringValue(item.message)}"
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap items-center gap-3 pt-2 border-t border-[#202635]/8 text-xs font-mono">
                    {item.propertySlug ? (
                      <Link
                        href={`/properties/${stringValue(item.propertySlug)}`}
                        target="_blank"
                        className="text-[#c97352] hover:underline flex items-center gap-1"
                      >
                        Property: {stringValue(item.propertySlug)} <ExternalLink size={11} />
                      </Link>
                    ) : null}
                    {item.projectSlug ? (
                      <Link
                        href={`/projects/${stringValue(item.projectSlug)}`}
                        target="_blank"
                        className="text-[#c97352] hover:underline flex items-center gap-1"
                      >
                        Project: {stringValue(item.projectSlug)} <ExternalLink size={11} />
                      </Link>
                    ) : null}
                    {phone ? (
                      <a
                        href={`https://wa.me/${phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xs border border-[#55735f]/30 px-2.5 py-1 text-[#55735f] hover:bg-[#55735f]/10"
                      >
                        <Phone size={12} /> WhatsApp Client
                      </a>
                    ) : null}
                    {email ? (
                      <a
                        href={`mailto:${email}`}
                        className="inline-flex items-center gap-1.5 rounded-xs border border-[#202635]/20 px-2.5 py-1 text-[#202635]/80 hover:bg-[#202635]/8"
                      >
                        <Mail size={12} /> Send Email
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    );
  }

  /* ---------------- RENDER SUBSCRIBERS ---------------- */
  function renderSubscribers() {
    return (
      <section className="space-y-6">
        <div>
          <SectionLabel>Newsletter Subscriptions</SectionLabel>
          <h2 className="font-serif text-2xl text-[#202635] mt-1">
            Registered Subscribers ({items.length})
          </h2>
          <p className="text-xs text-[#202635]/55 mt-0.5">
            Real subscriber records from the MongoDB newsletter collection.
          </p>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-[#202635]/60">Loading subscribers…</p>
        ) : items.length === 0 ? (
          <div className="border border-dashed border-[#202635]/20 p-12 text-center">
            <p className="font-serif text-lg text-[#202635]">No newsletter subscribers yet.</p>
            <p className="mt-1 text-xs text-[#202635]/50">
              New newsletter submissions on the public site appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#202635]/12 bg-[#f5f0e6]">
            <table className="table">
              <thead>
                <tr className="border-b border-[#202635]/15 text-[#202635]/50 text-xs font-mono uppercase tracking-[.1em]">
                  <th>Email Address</th>
                  <th>Subscriber Name</th>
                  <th>Subscribed On</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202635]/10">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/40">
                    <td className="font-mono text-xs font-medium text-[#202635]">
                      {stringValue(item.email)}
                    </td>
                    <td className="text-[#202635]/70">{stringValue(item.name) || '—'}</td>
                    <td className="text-xs text-[#202635]/60">
                      {item.subscribedAt || item.createdAt
                        ? new Date(String(item.subscribedAt || item.createdAt)).toLocaleDateString('en-GB')
                        : '—'}
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => deleteItem(item.id, 'subscribers')}
                        className="text-[#c97352] hover:opacity-75"
                        aria-label="Delete subscriber"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  }

  /* ---------------- RENDER CONTENT / GALLERY ---------------- */
  function renderContent() {
    return (
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <SectionLabel>Visual Archive</SectionLabel>
            <h2 className="font-serif text-2xl text-[#202635] mt-1">
              Website Gallery Items ({items.length})
            </h2>
            <p className="text-xs text-[#202635]/55 mt-0.5">
              Curated gallery photos and architectural highlights.
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={openAddContent}>
            <Plus size={14} /> Add Gallery Item
          </button>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-[#202635]/60">Loading gallery items…</p>
        ) : items.length === 0 ? (
          <div className="border border-dashed border-[#202635]/20 p-12 text-center">
            <p className="font-serif text-lg text-[#202635]">No custom gallery items in database.</p>
            <p className="mt-1 text-xs text-[#202635]/50">
              Click "Add Gallery Item" to add real photos to the public gallery.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="group border border-[#202635]/12 bg-[#f5f0e6] p-3 transition-all hover:border-[#c97352]"
              >
                <div className="aspect-16/10 w-full overflow-hidden bg-black/5">
                  <img
                    src={stringValue(item.image) || '/images/creek-waterfront.jpg'}
                    alt={stringValue(item.title)}
                    className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/images/creek-waterfront.jpg';
                    }}
                  />
                </div>
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-serif text-sm font-medium text-[#202635]">
                      {stringValue(item.title) || 'Untitled'}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[#c97352]">
                      {stringValue(item.category) || 'General'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteItem(item.id, 'content')}
                    className="text-[#c97352] hover:opacity-75 p-1"
                    aria-label="Delete item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content Modal */}
        <Dialog open={showContentModal} onOpenChange={setShowContentModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Add Gallery Media</DialogTitle>
            </DialogHeader>

            <form onSubmit={saveContent} className="mt-4 space-y-4">
              <div className="grid gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                  Item Title *
                </label>
                <input
                  required
                  className="input"
                  placeholder="e.g. Palm Views Villa Interior"
                  value={contentForm.title}
                  onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                    Category
                  </label>
                  <select
                    className="input"
                    value={contentForm.category}
                    onChange={(e) => setContentForm({ ...contentForm, category: e.target.value })}
                  >
                    <option value="architecture">Architecture</option>
                    <option value="interiors">Interiors</option>
                    <option value="views">Views & Waterfront</option>
                    <option value="community">Community</option>
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/70">
                    Image URL *
                  </label>
                  <input
                    required
                    className="input"
                    placeholder="/images/creek-waterfront.jpg"
                    value={contentForm.image}
                    onChange={(e) => setContentForm({ ...contentForm, image: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#202635]/10">
                <button
                  type="button"
                  className="btn border border-[#202635]/20"
                  onClick={() => setShowContentModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add to Gallery
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </section>
    );
  }

  /* ---------------- RENDER SETTINGS ---------------- */
  function renderSettings() {
    return (
      <section className="space-y-6">
        <div>
          <SectionLabel>System Configuration</SectionLabel>
          <h2 className="font-serif text-2xl text-[#202635] mt-1">
            Admin & Environment <em className="text-[#c97352]">Settings</em>
          </h2>
          <p className="text-xs text-[#202635]/55 mt-0.5">
            Production environment status and configuration overview.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Server & Database Card */}
          <div className="border border-[#202635]/12 bg-[#f5f0e6] p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-[#202635]">
              <Server size={18} className="text-[#c97352]" />
              <h3 className="font-serif text-lg font-medium">Backend & Database</h3>
            </div>
            <div className="space-y-2 text-xs font-mono text-[#202635]/70">
              <div className="flex justify-between border-b border-[#202635]/10 pb-1.5">
                <span>API Prefix</span>
                <span className="font-semibold text-[#202635]">/api</span>
              </div>
              <div className="flex justify-between border-b border-[#202635]/10 pb-1.5">
                <span>Database</span>
                <span className="font-semibold text-[#55735f]">MongoDB Connected</span>
              </div>
              <div className="flex justify-between border-b border-[#202635]/10 pb-1.5">
                <span>Admin Auth</span>
                <span className="font-semibold text-[#55735f]">JWT Session (Active)</span>
              </div>
              <div className="flex justify-between">
                <span>Token Storage</span>
                <span className="font-semibold text-[#202635]">localStorage (knc_admin_token)</span>
              </div>
            </div>
          </div>

          {/* Security & Access Card */}
          <div className="border border-[#202635]/12 bg-[#f5f0e6] p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-[#202635]">
              <Key size={18} className="text-[#c97352]" />
              <h3 className="font-serif text-lg font-medium">Security & Credentials</h3>
            </div>
            <p className="text-xs leading-5 text-[#202635]/65">
              Administrative credentials and JWT encryption keys are managed through secure
              backend environment variables. To update the admin password or secret keys,
              modify the backend environment variables.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={logout}
                className="btn border border-[#c97352] text-[#c97352] hover:bg-[#c97352] hover:text-[#f5f0e6]"
              >
                Sign Out from Session
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderSection() {
    switch (resource) {
      case 'overview':
        return renderOverview();
      case 'properties':
        return renderProperties();
      case 'projects':
        return renderProjects();
      case 'developers':
        return renderDevelopers();
      case 'posts':
        return renderBlog();
      case 'inquiries':
        return renderLeads();
      case 'subscribers':
        return renderSubscribers();
      case 'content':
        return renderContent();
      case 'settings':
        return renderSettings();
      default:
        return null;
    }
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#ebe5dc] px-5 py-20">
        <div className="w-full max-w-md border border-[#202635]/15 bg-[#f5f0e6] p-8 text-center shadow-xs">
          <ErrorState message={error} />
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[.14em] text-[#c97352] hover:underline"
          >
            Sign in again <ArrowUpRight size={14} />
          </Link>
        </div>
      </main>
    );
  }

  const sectionTitles: Record<AdminResource, string> = {
    overview: 'Portfolio Overview',
    properties: 'Properties Management',
    projects: 'Projects Management',
    developers: 'Developers Directory',
    posts: 'Editorial & Blog Management',
    inquiries: 'Leads & Enquiries',
    subscribers: 'Newsletter Subscribers',
    content: 'Website Visual Content',
    settings: 'System & Admin Settings',
  };

  return (
    <div className="admin-root">
      {/* Responsive Admin Sidebar */}
      <AdminSidebar
        resource={resource}
        setResource={setResource}
        logout={logout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area with independent scroll */}
      <div className="admin-main">
        {/* Top Navbar */}
        <header className="admin-topbar">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-xs border border-[#202635]/15 bg-[#f5f0e6] text-[#202635] md:hidden"
              aria-label="Open navigation sidebar"
            >
              <Menu size={18} />
            </button>
            <h1 className="font-serif text-lg font-medium text-[#202635] sm:text-xl">
              {sectionTitles[resource]}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => refreshResource(resource)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xs border border-[#202635]/15 bg-[#f5f0e6] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#202635]/70 hover:border-[#c97352] hover:text-[#c97352]"
              title="Refresh current data"
            >
              <RefreshCw size={12} />
              <span>Refresh</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xs border border-[#202635]/15 bg-[#f5f0e6] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#202635] hover:border-[#c97352] hover:text-[#c97352]"
            >
              <span>Live Site</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className="admin-content">
          <div className="mx-auto max-w-7xl">{renderSection()}</div>
        </main>
      </div>
    </div>
  );
}