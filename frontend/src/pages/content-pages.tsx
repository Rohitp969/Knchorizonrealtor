import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Search, X } from 'lucide-react';
import { Link, useRoute } from 'wouter';
import { apiFetch, type Post, type Project, type RemoteProperty, type Developer } from '@/lib/api';
import { ContactForm, PageHero, PropertyCard, SectionLabel } from '@/components/blocks';
import {
  defaultGallery,
  defaultPosts,
  defaultProjects,
  defaultRemoteProperties,
  type GalleryItem,
  type Property,
} from '@/lib/site-data';
import { usePageMeta } from '@/lib/seo';

const price = (value: number) => `AED ${new Intl.NumberFormat('en-AE').format(value)}`;
const propertyCard = (item: RemoteProperty): Property => ({
  id: item.id,
  slug: item.slug,
  title: item.title,
  location: item.location,
  type: item.type,
  price: price(item.price),
  details: `${item.bedrooms} beds · ${item.bathrooms} baths · ${new Intl.NumberFormat('en-AE').format(item.size)} sq ft`,
  image: item.images[0] || '/images/creek-waterfront.jpg',
  note: item.status,
});

function LoadingState() {
  return (
    <div className="py-24 text-center">
      <p className="eyebrow text-[#c97352]">KNC Horizon</p>
      <p className="display mt-5 text-4xl">Curating the latest edit…</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="border border-[#c97352]/30 bg-[#c97352]/10 p-7 text-sm text-[#202635]/70" role="alert">
      We couldn’t load this section. {message}
    </div>
  );
}

export function PropertiesLivePage() {
  const [items, setItems] = useState<RemoteProperty[]>(defaultRemoteProperties as unknown as RemoteProperty[]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) {
      const lower = cat.toLowerCase();
      if (lower === 'residential') setFilter('Residential');
      else if (lower === 'commercial') setFilter('Commercial');
      else if (lower === 'investment') setFilter('Investment');
      else if (lower === 'off-plan') setFilter('Off-Plan');
    }
  }, []);

  useEffect(() => {
    apiFetch<{ properties: RemoteProperty[] }>('/public/properties')
      .then((data) => {
        if (data.properties?.length) setItems(data.properties);
      })
      .catch((reason) => {
        if (!items.length) {
          setError(reason instanceof Error ? reason.message : 'Please try again.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filters = ['All', 'Residential', 'Commercial', 'Investment', 'Off-Plan', 'Villa', 'Apartment', 'Penthouse'];
  const filtered = filter === 'All' ? items : items.filter((item) => {
    const f = filter.toLowerCase();
    const type = item.type.toLowerCase();
    const status = (item.status || '').toLowerCase();
    if (f === 'residential') return type.includes('villa') || type.includes('apartment') || type.includes('penthouse');
    if (f === 'commercial') return type.includes('commercial') || item.title.toLowerCase().includes('office');
    if (f === 'investment') return true;
    if (f === 'off-plan') return status.includes('off-plan') || status.includes('launching') || status.includes('construction');
    return type.includes(f);
  });

  return (
    <main>
      <PageHero
        label="The live property edit"
        title={
          <>
            Places worth<br />
            <em className="text-[#c97352]">your attention.</em>
          </>
        }
        copy="A considered selection of Dubai homes and opportunities, updated from our live property collection."
        image="/images/penthouse-marina.jpg"
      />
      <section className="bg-[#f5f0e6] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1380px]">
          <div className="flex flex-wrap gap-2 border-b border-[#202635]/15 pb-6">
            {filters.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[.13em] transition-colors ${
                  filter === item
                    ? 'bg-[#202635] text-[#f5f0e6]'
                    : 'border border-[#202635]/20 text-[#202635]/60 hover:border-[#c97352] hover:text-[#c97352]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="mt-12">
            {loading ? (
              <LoadingState />
            ) : error && filtered.length === 0 ? (
              <ErrorState message={error} />
            ) : filtered.length === 0 ? (
              <div className="py-24 text-center">
                <p className="display text-4xl">Nothing in this edit yet.</p>
              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((item) => (
                  <PropertyCard key={item.id} property={propertyCard(item)} featured={false} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export function PropertyDetailPage() {
  const [, params] = useRoute('/properties/:slug');
  const defaultMatch = defaultRemoteProperties.find((p) => p.slug === params?.slug);
  const [property, setProperty] = useState<RemoteProperty | null>(
    (defaultMatch as unknown as RemoteProperty) || null
  );
  const [error, setError] = useState('');

  usePageMeta(
    property?.title ?? 'Property details',
    property
      ? `${property.title} in ${property.location}. View details and request property information from KNC Horizon Realtor.`
      : 'View property details and request information from KNC Horizon Realtor.'
  );

  useEffect(() => {
    if (!params?.slug) return;
    apiFetch<{ property: RemoteProperty }>(`/public/properties/${params.slug}`)
      .then((data) => setProperty(data.property))
      .catch((reason) => {
        if (!property) setError(reason instanceof Error ? reason.message : 'Property not found.');
      });
  }, [params?.slug]);

  if (error && !property) {
    return (
      <main className="bg-[#f5f0e6] px-5 py-40 md:px-10">
        <div className="mx-auto max-w-[900px]">
          <ErrorState message={error} />
          <Link href="/properties" className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352]">
            <ArrowLeft size={14} /> Back to properties
          </Link>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="bg-[#f5f0e6] px-5 py-40">
        <LoadingState />
      </main>
    );
  }

  return (
    <main>
      <PageHero
        label={`${property.type} · ${property.status}`}
        title={
          <>
            {property.title}
            <br />
            <em className="text-[#d9c6a4]">{property.community}.</em>
          </>
        }
        copy={property.description}
        image={property.images[0] || '/images/creek-waterfront.jpg'}
      />
      <section className="bg-[#f5f0e6] px-5 py-20 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1380px] gap-14 md:grid-cols-[1fr_.8fr] md:gap-24">
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              {property.images.map((image) => (
                <div key={image} className="card-thumb aspect-[16/10] h-[220px] sm:h-[260px] md:h-[300px] w-full">
                  <img
                    src={image}
                    alt={property.title}
                    onError={(event) => {
                      event.currentTarget.src = '/images/creek-waterfront.jpg';
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="mt-12">
              <SectionLabel>About this home</SectionLabel>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#202635]/65">{property.description}</p>
              <div className="mt-8 grid grid-cols-2 gap-3 border-t border-[#202635]/15 pt-5 sm:grid-cols-4">
                {property.amenities.map((item) => (
                  <span key={item} className="flex items-start gap-2 text-sm text-[#202635]/65">
                    <Check size={15} className="mt-0.5 text-[#c97352]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="h-fit border-t border-[#202635]/20 pt-5">
            <SectionLabel>Property details</SectionLabel>
            <p className="mt-5 font-serif text-4xl">{price(property.price)}</p>
            <div className="mt-8 grid grid-cols-2 gap-y-5 border-y border-[#202635]/15 py-6 text-sm">
              <span>{property.bedrooms} bedrooms</span>
              <span>{property.bathrooms} bathrooms</span>
              <span>{new Intl.NumberFormat('en-AE').format(property.size)} sq ft</span>
              <span>{property.location}</span>
            </div>
            <h3 className="display mt-12 text-4xl">
              Interested in<br />
              <em className="text-[#c97352]">this address?</em>
            </h3>
            <div className="mt-7">
              <ContactForm compact propertySlug={property.slug} inquiryType="property" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(defaultProjects as unknown as Project[]);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get('filter');
    if (f) {
      const lower = f.toLowerCase();
      if (lower === 'featured') setFilter('Featured Projects');
      else if (lower === 'new-launches') setFilter('New Launches');
      else if (lower === 'off-plan') setFilter('Off-Plan Projects');
    }
  }, []);

  useEffect(() => {
    apiFetch<{ projects: Project[] }>('/public/projects')
      .then((data) => {
        if (data.projects?.length) setProjects(data.projects);
      })
      .catch((reason) => {
        if (!projects.length) setError(reason instanceof Error ? reason.message : 'Please try again.');
      });
  }, []);

  const filters = ['All', 'Featured Projects', 'New Launches', 'Off-Plan Projects'];

  const filtered = filter === 'All' ? projects : projects.filter((project) => {
    const f = filter.toLowerCase();
    const status = (project.status || '').toLowerCase();
    if (f.includes('featured')) return project.featured;
    if (f.includes('new launches')) return status.includes('launching') || status.includes('new');
    if (f.includes('off-plan')) return true;
    return true;
  });

  return (
    <main>
      <PageHero
        label="The next horizon"
        title={
          <>
            Projects with<br />
            <em className="text-[#c97352]">possibility.</em>
          </>
        }
        copy="A live edit of Dubai’s most considered new addresses, from established developers and emerging neighbourhoods."
        image="/images/creek-waterfront.jpg"
      />
      <section className="bg-[#e9e4da] px-5 py-20 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1380px]">
          <div className="flex flex-wrap gap-2 border-b border-[#202635]/15 pb-6 mb-12">
            {filters.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[.13em] transition-colors ${
                  filter === item
                    ? 'bg-[#202635] text-[#f5f0e6]'
                    : 'border border-[#202635]/20 text-[#202635]/60 hover:border-[#c97352] hover:text-[#c97352]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          {error && !projects.length ? (
            <ErrorState message={error} />
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project) => (
                <Link
                  href={`/projects/${project.slug}`}
                  key={project.id}
                  className="card-editorial flex flex-col justify-between p-6 group"
                >
                  <div>
                    <div className="card-thumb aspect-[16/10] h-[190px] sm:h-[210px] md:h-[220px] w-full">
                      <img
                        src={project.image}
                        alt={project.title}
                        onError={(event) => {
                          event.currentTarget.src = '/images/creek-waterfront.jpg';
                        }}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-5 eyebrow text-[#c97352]">
                      {project.developer} · {project.location}
                    </p>
                    <h2 className="font-serif text-2xl md:text-3xl mt-2 leading-snug">{project.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-[#202635]/65 line-clamp-2">{project.description}</p>
                  </div>
                  <div className="mt-6 border-t border-[#202635]/12 pt-4">
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[.13em] text-[#202635]/65">
                      <span>From {price(project.startingPrice)}</span>
                      <span>Handover {project.handover}</span>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.13em] text-[#c97352] group-hover:underline">
                      Explore project <ArrowUpRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export function BlogPage() {
  const [posts, setPosts] = useState<Post[]>(defaultPosts as unknown as Post[]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<{ blogs: Post[] }>('/blogs')
      .then((data) => {
        if (data.blogs?.length) setPosts(data.blogs);
      })
      .catch((reason) => {
        if (!posts.length) setError(reason instanceof Error ? reason.message : 'Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(posts.map((post) => post.category)))];
  const filtered = posts.filter(
    (post) =>
      (category === 'All' || post.category === category) &&
      `${post.title} ${post.excerpt}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main>
      <PageHero
        label="The KNC blog"
        title={
          <>
            Property, made<br />
            <em className="text-[#c97352]">clearer.</em>
          </>
        }
        copy="Practical guidance, local perspective, and thoughtful notes for your next move in Dubai real estate."
        image="/images/interior-detail.jpg"
      />
      <section className="bg-[#f5f0e6] px-5 py-20 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1380px]">
          <div className="flex flex-col gap-5 border-b border-[#202635]/15 pb-7 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[.13em] ${
                    category === item ? 'bg-[#202635] text-[#f5f0e6]' : 'border border-[#202635]/20'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-3 border-b border-[#202635]/25 py-2 md:w-72">
              <Search size={16} className="text-[#c97352]" />
              <span className="sr-only">Search blog</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the blog"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#202635]/45"
              />
            </label>
          </div>
          {loading ? (
            <LoadingState />
          ) : error && !filtered.length ? (
            <ErrorState message={error} />
          ) : !filtered.length ? (
            <div className="py-24 text-center">
              <p className="display text-4xl">No notes match this search.</p>
              <p className="mt-4 text-sm text-[#202635]/60">Try another phrase or category.</p>
            </div>
          ) : (
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="card-editorial flex flex-col justify-between p-6 group"
                >
                  <div>
                    <div className="card-thumb aspect-[16/10] h-[190px] sm:h-[210px] md:h-[220px] w-full">
                      <img
                        src={post.image || '/images/creek-waterfront.jpg'}
                        alt={post.title}
                        onError={(event) => {
                          event.currentTarget.src = '/images/creek-waterfront.jpg';
                        }}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-5 eyebrow text-[#c97352]">
                      {post.category} · {post.author}
                    </p>
                    <h2 className="font-serif text-2xl mt-2 leading-snug">{post.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-[#202635]/60 line-clamp-3">{post.excerpt}</p>
                  </div>
                  <div className="mt-6 border-t border-[#202635]/12 pt-4">
                    <p className="font-mono text-[10px] uppercase tracking-[.13em] text-[#202635]/45">
                      {new Date(post.publishedAt).toLocaleDateString('en-GB', { dateStyle: 'long' })}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.13em] text-[#c97352] group-hover:underline">
                      Read note <ArrowUpRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export function BlogPostPage() {
  const [, params] = useRoute('/blog/:slug');
  const defaultMatch = defaultPosts.find((p) => p.slug === params?.slug);
  const [post, setPost] = useState<Post | null>((defaultMatch as unknown as Post) || null);
  const [related, setRelated] = useState<Post[]>([]);
  const [error, setError] = useState('');

  usePageMeta(
    post?.seoTitle ?? post?.title ?? 'Blog',
    post?.seoDescription ?? post?.excerpt ?? 'Real-estate perspective from KNC Horizon Realtor.'
  );

  useEffect(() => {
    if (!params?.slug) return;
    apiFetch<{ blog: Post; related: Post[] }>(`/blogs/${params.slug}`)
      .then((data) => {
        setPost(data.blog);
        setRelated(data.related);
      })
      .catch((reason) => {
        if (!post) setError(reason instanceof Error ? reason.message : 'Blog post not found.');
      });
  }, [params?.slug]);

  if (error && !post) {
    return (
      <main className="bg-[#f5f0e6] px-5 py-40 md:px-10">
        <div className="mx-auto max-w-[900px]">
          <ErrorState message={error} />
          <Link href="/blog" className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352]">
            <ArrowLeft size={14} /> Back to blog
          </Link>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="bg-[#f5f0e6] px-5 py-40">
        <LoadingState />
      </main>
    );
  }

  const image = post.featuredImage || post.image || '/images/creek-waterfront.jpg';

  return (
    <main>
      <PageHero
        label={`${post.category} · ${post.author}`}
        title={<>{post.title}</>}
        copy={post.excerpt}
        image={image}
      />
      <article className="bg-[#f5f0e6] px-5 py-20 md:px-10 md:py-32">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352]">
            {post.author} · {new Date(post.publishedAt).toLocaleDateString('en-GB', { dateStyle: 'long' })}
          </p>
          <div className="mt-10 whitespace-pre-line font-serif text-2xl leading-[1.5] text-[#202635] md:text-4xl">
            {post.content}
          </div>
          <Link href="/blog" className="mt-14 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352]">
            <ArrowLeft size={14} /> Back to blog
          </Link>
          {related.length > 0 && (
            <section className="mt-20 border-t border-[#202635]/15 pt-8">
              <p className="eyebrow text-[#c97352]">Keep reading</p>
              <div className="mt-7 grid gap-7 md:grid-cols-3">
                {related.map((item) => (
                  <Link key={item.id} href={`/blog/${item.slug}`} className="group card-editorial p-4">
                    <div className="card-thumb aspect-[16/10] h-[160px] sm:h-[180px] w-full">
                      <img
                        src={item.featuredImage || item.image || '/images/creek-waterfront.jpg'}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-4 font-serif text-xl leading-tight text-[#202635]">{item.title}</p>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[.12em] text-[#c97352]">
                      Read note <ArrowUpRight size={12} className="inline" />
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </main>
  );
}

export function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(defaultGallery);
  const [active, setActive] = useState<GalleryItem | null>(null);

  useEffect(() => {
    apiFetch<{ gallery: GalleryItem[] }>('/public/gallery')
      .then((data) => {
        if (data.gallery?.length) setItems(data.gallery);
      })
      .catch(() => {});
  }, []);

  return (
    <main>
      <PageHero
        label="The visual archive"
        title={
          <>
            A sense of<br />
            <em className="text-[#c97352]">place.</em>
          </>
        }
        copy="A closer look at the textures, horizons, and details that shape the KNC point of view."
        image="/images/hero-dubai-villa.jpg"
      />
      <section className="bg-[#dfe2dc] px-5 py-20 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1380px] gap-6 sm:grid-cols-2 md:grid-cols-3">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item)}
              className="group card-editorial p-4 text-left transition-all"
            >
              <div className="card-thumb aspect-[4/3] h-[220px] sm:h-[240px] md:h-[260px] w-full">
                <img
                  src={item.image}
                  alt={item.alt}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="mt-4 px-1 pb-1">
                <p className="eyebrow text-[#c97352]">{item.category}</p>
                <p className="font-serif text-xl mt-1 text-[#202635]">{item.title}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
      {active && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#202635]/90 p-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setActive(null)}
            className="absolute right-5 top-5 text-[#f5f0e6] p-2 hover:text-[#c97352] transition-colors"
            aria-label="Close gallery"
          >
            <X size={24} />
          </button>
          <figure className="max-h-[90vh] max-w-5xl text-center">
            <img
              src={active.image}
              alt={active.alt}
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-sm shadow-2xl"
            />
            <figcaption className="mt-4 font-mono text-[11px] uppercase tracking-[.14em] text-[#d9c6a4]">
              {active.title} · {active.category}
            </figcaption>
          </figure>
        </div>
      )}
    </main>
  );
}

export function PropertiesFilterPage({ category }: { category: string }) {
  const [items, setItems] = useState<RemoteProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  usePageMeta(`${category.charAt(0).toUpperCase() + category.slice(1)} Properties`, `Explore ${category} properties in Dubai.`);

  useEffect(() => {
    setLoading(true);
    let filterQuery = '';
    if (category === 'residential') filterQuery = '?type=residential';
    else if (category === 'commercial') filterQuery = '?type=commercial';
    else if (category === 'investment') filterQuery = '?listingType=investment';
    else if (category === 'off-plan') filterQuery = '?status=off-plan';
    
    apiFetch<{ properties: RemoteProperty[] }>(`/public/properties${filterQuery}`)
      .then((data) => setItems(data.properties))
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Please try again.'))
      .finally(() => setLoading(false));
  }, [category]);

  const titles: Record<string, React.ReactNode> = {
    residential: <>Residential<br /><em className="text-[#c97352]">properties.</em></>,
    commercial: <>Commercial<br /><em className="text-[#c97352]">spaces.</em></>,
    investment: <>Investment<br /><em className="text-[#c97352]">opportunities.</em></>,
    'off-plan': <>Off-Plan<br /><em className="text-[#c97352]">launches.</em></>
  };

  return (
    <main>
      <PageHero
        label={`${category} properties`}
        title={titles[category] || titles['residential']}
        copy={`A considered selection of ${category} properties in Dubai.`}
        image="/images/penthouse-marina.jpg"
      />
      <section className="bg-[#f5f0e6] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1380px]">
          {loading ? <LoadingState /> : error ? <ErrorState message={error} /> : items.length === 0 ? (
            <div className="py-24 text-center">
              <p className="display text-4xl">No properties found in this category.</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <PropertyCard key={item.id} property={propertyCard(item)} featured={false} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export function ProjectsFilterPage({ filter }: { filter: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  usePageMeta(`${filter.replace('-', ' ')} Projects`, `Explore ${filter.replace('-', ' ')} projects in Dubai.`);

  useEffect(() => {
    setLoading(true);
    let query = '';
    if (filter === 'featured') query = '?featured=true';
    else if (filter === 'new-launches') query = '?newLaunch=true';
    else if (filter === 'off-plan') query = '?offPlan=true';

    apiFetch<{ projects: Project[] }>(`/public/projects${query}`)
      .then((data) => setProjects(data.projects))
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Please try again.'))
      .finally(() => setLoading(false));
  }, [filter]);

  const titles: Record<string, React.ReactNode> = {
    featured: <>Featured<br /><em className="text-[#c97352]">projects.</em></>,
    'new-launches': <>New<br /><em className="text-[#c97352]">launches.</em></>,
    'off-plan': <>Off-Plan<br /><em className="text-[#c97352]">developments.</em></>
  };

  return (
    <main>
      <PageHero
        label={filter.replace('-', ' ')}
        title={titles[filter] || titles['featured']}
        copy={`Explore our curated selection of ${filter.replace('-', ' ')} in Dubai.`}
        image="/images/creek-waterfront.jpg"
      />
      <section className="bg-[#e9e4da] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1380px]">
          {loading ? <LoadingState /> : error ? <ErrorState message={error} /> : projects.length === 0 ? (
             <div className="py-24 text-center">
               <p className="display text-4xl">No projects found for this selection.</p>
             </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link
                  href={`/projects/${project.slug}`}
                  key={project.id}
                  className="card-editorial flex flex-col justify-between p-6 group"
                >
                  <div>
                    <div className="card-thumb aspect-[16/10] h-[190px] sm:h-[210px] md:h-[220px] w-full">
                      <img
                        src={project.image}
                        alt={project.title}
                        onError={(event) => {
                          event.currentTarget.src = '/images/creek-waterfront.jpg';
                        }}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-5 eyebrow text-[#c97352]">
                      {project.developer} · {project.location}
                    </p>
                    <h2 className="font-serif text-2xl md:text-3xl mt-2 leading-snug">{project.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-[#202635]/65 line-clamp-2">{project.description}</p>
                  </div>
                  <div className="mt-6 border-t border-[#202635]/12 pt-4">
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[.13em] text-[#202635]/65">
                      <span>From {price(project.startingPrice)}</span>
                      <span>Handover {project.handover}</span>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.13em] text-[#c97352] group-hover:underline">
                      Explore project <ArrowUpRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export function DevelopersPage() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  usePageMeta('Developers', 'Verified Dubai developers and their projects.');

  useEffect(() => {
    apiFetch<{ developers: Developer[] }>('/public/developers')
      .then((data) => setDevelopers(data.developers))
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <PageHero
        label="Developers"
        title={
          <>
            Shaping the<br />
            <em className="text-[#c97352]">skyline.</em>
          </>
        }
        copy="Profiles of established Dubai developers and their latest opportunities."
        image="/images/hills-villa.jpg"
      />
      <section className="bg-[#f5f0e6] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1380px]">
          {loading ? <LoadingState /> : error ? <ErrorState message={error} /> : developers.length === 0 ? (
             <div className="py-24 text-center">
               <p className="display text-4xl">No developers listed yet.</p>
             </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {developers.map((dev) => (
                <div key={dev.id} className="border border-[#202635]/12 bg-[#fcfaf6] p-6 flex flex-col justify-between">
                  <div>
                    {dev.logo ? (
                      <div className="h-16 w-32 mb-6 opacity-80 mix-blend-multiply">
                        <img src={dev.logo} alt={dev.name} className="h-full w-full object-contain object-left" />
                      </div>
                    ) : (
                      <div className="h-16 mb-6 flex items-center">
                        <h3 className="font-serif text-3xl text-[#202635]">{dev.name}</h3>
                      </div>
                    )}
                    <h3 className="font-serif text-xl text-[#202635] mb-2">{dev.name}</h3>
                    <p className="text-sm leading-6 text-[#202635]/65 line-clamp-4">{dev.description}</p>
                    {dev.established && <p className="mt-3 font-mono text-[10px] uppercase tracking-[.1em] text-[#c97352]">Est. {dev.established}</p>}
                  </div>
                  <Link href={`/projects?developer=${encodeURIComponent(dev.name)}`} className="mt-8 inline-flex items-center justify-center gap-2 border border-[#202635]/30 py-3 w-full font-mono text-[10px] uppercase tracking-[.14em] text-[#202635] hover:bg-[#202635] hover:text-[#f5f0e6] transition-colors">
                    View Projects <ArrowUpRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}