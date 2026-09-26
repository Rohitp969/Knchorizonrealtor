import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowUpRight, Check, ExternalLink, Globe, Search, X } from 'lucide-react';
import { Link, useLocation, useRoute, useSearch } from 'wouter';
import { apiFetch, type Post, type Project, type RemoteProperty, type Developer } from '@/lib/api';
import { ContactForm, PageHero, PostCard, ProjectCard, PropertyCard, SectionLabel, cardGrid } from '@/components/blocks';
import { PropertySearch } from '@/components/property-search';
import { categoryOf, clearSearchHref, describeSearch, hasPropertySearch, isNewLaunchProject, matchesProjectSearch, matchesPropertySearch, parsePropertySearch, projectSegment } from '@/lib/property-search';
import {
  areas,
  defaultGallery,
  defaultPosts,
  defaultProjects,
  defaultRemoteProperties,
  defaultDevelopers,
  type GalleryItem,
  type Property,
} from '@/lib/site-data';
import { absoluteUrl, articleJsonLd, listingJsonLd, usePageMeta, useSeoData, type SeoFields } from '@/lib/seo';
import { useContact, useSiteSettings } from '@/lib/site-settings';

const price = (value: number, currency = 'AED') => `${currency} ${new Intl.NumberFormat('en-AE').format(value)}`;
const propertyCard = (item: RemoteProperty, currency = 'AED'): Property => ({
  id: item.id,
  slug: item.slug,
  title: item.title,
  location: item.location,
  type: item.type,
  price: price(item.price, item.currency || currency),
  details: `${item.bedrooms} beds · ${item.bathrooms} baths · ${new Intl.NumberFormat('en-AE').format(item.size)} sq ft`,
  image: item.images[0] || '/images/dubai-skyline-from-sea.jpg',
  note: item.status,
});

/** Applies an off-plan page's own meaning to a list of published projects. */
function narrowProjects(list: Project[], filter: string) {
  if (filter === 'new-launches') return list.filter(isNewLaunchProject);
  if (filter === 'apartments') return list.filter((project) => projectSegment(project) === 'apartments');
  if (filter === 'villas-townhouses') return list.filter((project) => projectSegment(project) === 'villas');
  return list;
}

/** Applies a /properties/<category> page's own meaning to a list of published properties. */
function narrowToCategory(list: RemoteProperty[], category: string) {
  if (category === 'residential' || category === 'commercial') {
    const wanted = category === 'residential' ? 'Residential' : 'Commercial';
    return list.filter((item) => categoryOf(item.type ?? '') === wanted);
  }
  if (category === 'off-plan') return list.filter(isOffPlan);
  // sale, rent and investment are already narrowed by the request itself.
  return list;
}

/** The filters the client chose, spelled out, so a search stays readable after it runs. */
function AppliedFilters({ query, onClear, count }: { query: ReturnType<typeof parsePropertySearch>; onClear: string; count: ReactNode }) {
  const applied = describeSearch(query);
  return (
    <div className="mt-6 border-b border-[#2b3242]/10 pb-6" data-testid="applied-filters">
      <div className="flex flex-wrap items-center gap-2">
        {applied.map((entry) => (
          <span
            key={entry.label}
            className="inline-flex items-center gap-1.5 rounded-sm border border-[#2b3242]/15 bg-[#fffdf8] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[.12em] text-[#2b3242]"
            data-testid={`filter-chip-${entry.label.toLowerCase().replace(/[^a-z]+/g, '-')}`}
          >
            <span className="text-[#2b3242]/65">{entry.label}</span>
            <span className="font-semibold">{entry.value}</span>
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[.14em]">
        <p className="text-[#2b3242]/60" aria-live="polite">{count}</p>
        <Link href={onClear} className="line-link text-[#9f7a47]" data-testid="link-clear-search">Clear filters</Link>
      </div>
    </div>
  );
}

const isNewLaunch = (project: Project) => /launching|new/i.test(project.status ?? '');
const isOffPlan = (item: RemoteProperty) => /off-plan|launching|construction/i.test(item.status ?? '');

function LoadingState() {
  return (
    <div className="py-16 text-center">
      <p className="eyebrow text-[#9f7a47]">KNC Horizon</p>
      <p className="block-title mt-4 text-[#2b3242]">Curating the latest edit…</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-[#9f7a47]/30 bg-[#8f6d3f]/10 p-6 text-sm leading-7 text-[#2b3242]/70 sm:p-7" role="alert">
      We couldn’t load this section. {message}
    </div>
  );
}

export function PropertiesLivePage() {
  const { defaultCurrency } = useSiteSettings();
  const [items, setItems] = useState<RemoteProperty[]>(defaultRemoteProperties as unknown as RemoteProperty[]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const search = useSearch();
  const query = parsePropertySearch(search);
  const searching = hasPropertySearch(query);

  useEffect(() => {
    const category = new URLSearchParams(window.location.search).get('category');
    // Anything the collection does not hold falls through to All, below.
    if (category) setFilter(category.toLowerCase() === 'off-plan' ? 'Off-Plan' : category.replace(/\w/, (c) => c.toUpperCase()));
  }, []);

  useEffect(() => {
    // Search filters run client-side, so fetch the API's maximum page rather than the default 24.
    apiFetch<{ properties: RemoteProperty[] }>('/public/properties?limit=50')
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

  // Chips mirror what the collection actually holds, so none of them can come back empty.
  const filters = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      const type = item.type?.trim();
      if (type) counts.set(type, (counts.get(type) ?? 0) + 1);
    }
    const types = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([type]) => type);
    return ['All', ...types, ...(items.some(isOffPlan) ? ['Off-Plan'] : [])];
  }, [items]);

  const active = filters.includes(filter) ? filter : 'All';
  const byCategory =
    active === 'All' ? items
    : active === 'Off-Plan' ? items.filter(isOffPlan)
    : items.filter((item) => (item.type ?? '').toLowerCase() === active.toLowerCase());
  const filtered = byCategory.filter((item) => matchesPropertySearch(item, query));

  return (
    <main>
      <PageHero
        label="The live property edit"
        title={
          <>
            Places worth<br />
            <em className="text-[#9f7a47]">your attention.</em>
          </>
        }
        copy="A considered selection of Dubai homes and opportunities, updated from our live property collection."
        image="/images/downtown-safa-park.jpg"
      />
      {/* The home hero search links to #results; scroll-margin keeps the fixed header off the search bar. */}
      <section id="results" className="scroll-mt-16 bg-[#faf7f1] site-section md:scroll-mt-20">
        <div className="site-container">
          {/* Remount when the URL changes so the fields always mirror the active search */}
          <PropertySearch key={search} initial={query} tone="light" />

          <div className="mt-8 flex flex-wrap gap-2 border-b border-[#2b3242]/15 pb-6">
            {filters.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[.13em] transition-colors ${
                  active === item
                    ? 'bg-[#2b3242] text-[#faf7f1]'
                    : 'border border-[#2b3242]/20 text-[#2b3242]/60 hover:border-[#9f7a47] hover:text-[#9f7a47]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          {searching && !loading && (
            <AppliedFilters
              query={query}
              onClear={clearSearchHref(query)}
              count={<span data-testid="text-search-count">{filtered.length} {filtered.length === 1 ? 'property matches' : 'properties match'} your search</span>}
            />
          )}
          <div className="mt-12">
            {loading ? (
              <LoadingState />
            ) : error && filtered.length === 0 ? (
              <ErrorState message={error} />
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="block-title text-[#2b3242]">{searching ? 'No properties found.' : 'Nothing in this edit yet.'}</p>
                {searching && (
                  <p className="measure-narrow mx-auto mt-4 text-sm leading-7 text-[#2b3242]/65">
                    Our recommendations are not limited to what is listed here.{' '}
                    <Link href="/contact" className="text-[#9f7a47] underline underline-offset-4">Share your brief</Link>
                    {' '}with an advisor, or try a wider search.
                  </p>
                )}
              </div>
            ) : (
              <div className={cardGrid(filtered.length)}>
                {filtered.map((item) => (
                  <PropertyCard key={item.id} property={propertyCard(item, defaultCurrency)} featured={false} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

/*
 * One community, with the live stock behind it: the properties and the off-plan projects
 * that actually sit in that community. The editorial copy comes from the curated area notes,
 * or from the communities collection once the admin has filled it in.
 */
export function CommunityDetailPage() {
  const { defaultCurrency } = useSiteSettings();
  const [, params] = useRoute('/communities/:slug');
  const slug = params?.slug ?? '';
  const area = areas.find((entry) => entry.id === slug);

  const [community, setCommunity] = useState<CommunityRecord | null>(null);
  const [properties, setProperties] = useState<RemoteProperty[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    /*
     * An admin-managed community overrides the curated notes when one exists. The match is
     * made against the published list rather than by requesting the slug directly: a slug
     * with no record behind it is the normal case for the curated communities, and asking
     * for it by name logged a 404 in the browser console on every one of those pages.
     */
    apiFetch<{ communities: CommunityRecord[] }>('/public/communities')
      .then((data) => setCommunity((data.communities ?? []).find((entry) => entry.slug === slug) ?? null))
      .catch(() => setCommunity(null));

    Promise.all([
      apiFetch<{ properties: RemoteProperty[] }>('/public/properties?limit=50').catch(() => ({ properties: [] })),
      apiFetch<{ projects: Project[] }>('/public/projects').catch(() => ({ projects: [] })),
    ])
      .then(([p, j]) => {
        setProperties(p.properties ?? []);
        setProjects(j.projects ?? []);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const name = community?.name ?? area?.name ?? '';
  const image = community?.image || area?.image || '/images/dubai-skyline-from-sea.jpg';
  const copy = community?.description || area?.detail || '';

  usePageMeta(
    name ? `${name} property guide` : 'Community',
    copy || `Properties and off-plan projects in ${name}, Dubai.`,
  );

  const inCommunity = (value: string) => value.trim().toLowerCase() === name.trim().toLowerCase();
  const matchingProperties = properties.filter(
    (item) => inCommunity(item.community ?? '') || (item.location ?? '').split(',').some(inCommunity),
  );
  const matchingProjects = projects.filter((item) => inCommunity(item.location ?? ''));

  if (!name) {
    return (
      <main>
        <PageHero label="Communities" title={<>Community<br /><em className="text-[#9f7a47]">not found.</em></>} copy="This community is not on our list yet." image="/images/maritime-city-towers.jpg" />
        <section className="bg-[#faf7f1] site-section text-center">
          <Link href="/communities" className="btn btn-primary">Back to communities <ArrowUpRight size={14} /></Link>
        </section>
      </main>
    );
  }

  return (
    <main>
      <PageHero
        label={community?.shortDescription ?? area?.descriptor ?? 'Dubai, by neighbourhood'}
        title={<>{name}<br /><em className="text-[#9f7a47]">at a glance.</em></>}
        copy={copy}
        image={image}
      />

      <section className="bg-[#faf7f1] site-section">
        <div className="site-container">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#2b3242]/15 pb-6">
            <div>
              <SectionLabel>Available now</SectionLabel>
              <h2 className="section-title mt-6 text-[#2b3242]">Properties in <em className="text-[#9f7a47]">{name}.</em></h2>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[.14em] text-[#2b3242]/65" data-testid="text-community-property-count">
              {loading ? 'Loading' : `${matchingProperties.length} ${matchingProperties.length === 1 ? 'property' : 'properties'}`}
            </p>
          </div>

          {loading ? (
            <LoadingState />
          ) : matchingProperties.length === 0 ? (
            <div className="py-16 text-center">
              <p className="block-title text-[#2b3242]">No listings in {name} right now.</p>
              <p className="measure-narrow mx-auto mt-4 text-sm leading-7 text-[#2b3242]/65">
                Our recommendations are not limited to what is listed here.{' '}
                <Link href="/contact" className="text-[#9f7a47] underline underline-offset-4">Share your brief</Link>
                {' '}and an advisor will come back with what is quietly available.
              </p>
            </div>
          ) : (
            <div className={`mt-12 ${cardGrid(matchingProperties.length)}`}>
              {matchingProperties.map((item) => (
                <PropertyCard key={item.id} property={propertyCard(item, defaultCurrency)} featured={false} />
              ))}
            </div>
          )}
        </div>
      </section>

      {matchingProjects.length > 0 && (
        <section className="bg-[#f2ede4] site-section">
          <div className="site-container">
            <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#2b3242]/15 pb-6">
              <div>
                <SectionLabel>Under construction</SectionLabel>
                <h2 className="section-title mt-6 text-[#2b3242]">Off-plan in <em className="text-[#9f7a47]">{name}.</em></h2>
              </div>
              <p className="font-mono text-[11px] uppercase tracking-[.14em] text-[#2b3242]/65" data-testid="text-community-project-count">
                {matchingProjects.length} {matchingProjects.length === 1 ? 'project' : 'projects'}
              </p>
            </div>
            <div className={`mt-12 ${cardGrid(matchingProjects.length)}`}>
              {matchingProjects.map((project) => (
                <ProjectCard key={project.id || project.slug} project={project} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="site-section site-section-flush-top bg-[#faf7f1]">
        <div className="site-container flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[#2b3242]/15 pt-8">
          <Link href="/communities" className="line-link font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]" data-testid="link-back-communities">
            All communities
          </Link>
          <Link href={`/properties?location=${encodeURIComponent(name)}`} className="line-link font-mono text-[11px] uppercase tracking-[.14em] text-[#2b3242]/65">
            Search {name}
          </Link>
          <Link href="/contact" className="line-link font-mono text-[11px] uppercase tracking-[.14em] text-[#2b3242]/65">
            Ask an advisor
          </Link>
        </div>
      </section>
    </main>
  );
}

/** Shape of a community record once the admin has published one. */
type CommunityRecord = {
  slug: string;
  name: string;
  shortDescription?: string;
  description?: string;
  image?: string;
};

export function PropertyDetailPage() {
  const { defaultCurrency } = useSiteSettings();
  // Both /properties/:slug and the /property/:id alias registered in App.tsx land here
  const [, slugParams] = useRoute('/properties/:slug');
  const [, idParams] = useRoute('/property/:id');
  const slug = slugParams?.slug ?? idParams?.id;
  const params = slug ? { slug } : undefined;
  const defaultMatch = defaultRemoteProperties.find((p) => p.slug === slug || p.id === slug);
  const [property, setProperty] = useState<RemoteProperty | null>(
    (defaultMatch as unknown as RemoteProperty) || null
  );
  const [seo, setSeo] = useState<SeoFields | null>(null);
  const [error, setError] = useState('');
  const [, navigate] = useLocation();
  const { settings: seoSettings } = useSeoData();

  usePageMeta(
    property?.title ?? 'Property details',
    property
      ? `${property.title} in ${property.location}. View details and request property information from KNC Horizon Realtor.`
      : 'View property details and request information from KNC Horizon Realtor.',
    {
      path: property ? `/properties/${property.slug}` : undefined,
      seo,
      image: property?.images?.[0],
      imageAlt: property?.title,
      noindex: Boolean(error && !property),
      jsonLd: property ? [listingJsonLd({
        url: `${seoSettings.siteUrl}/properties/${property.slug}`,
        name: property.title,
        description: seo?.metaDescription || property.description,
        image: property.images?.[0] ? absoluteUrl(property.images[0], seoSettings.siteUrl) : null,
        price: property.price,
        currency: property.currency,
      })] : undefined,
    },
  );

  useEffect(() => {
    if (!params?.slug) return;
    apiFetch<{ property: RemoteProperty; seo?: SeoFields | null }>(`/public/properties/${params.slug}`)
      .then((data) => {
        setProperty(data.property);
        setSeo(data.seo ?? null);
        // A renamed listing answers on its old slug; move the address bar to the current one.
        if (slugParams?.slug && data.property.slug && data.property.slug !== slugParams.slug) {
          navigate(`/properties/${data.property.slug}`, { replace: true });
        }
      })
      .catch((reason) => {
        if (!property) setError(reason instanceof Error ? reason.message : 'Property not found.');
      });
  }, [params?.slug]);

  if (error && !property) {
    return (
      <main className="bg-[#faf7f1] site-section pt-40">
        <div className="mx-auto max-w-[900px]">
          <ErrorState message={error} />
          <Link href="/properties" className="mt-7 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]">
            <ArrowLeft size={14} /> Back to properties
          </Link>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="site-section pt-40">
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
        image={property.images[0] || '/images/dubai-skyline-from-sea.jpg'}
        imageAlt={seo?.imageAlt || property.title}
      />
      <section className="bg-[#faf7f1] site-section">
        <div className="site-container grid gap-12 lg:grid-cols-[1fr_.75fr] lg:gap-16 xl:gap-20">
          <div>
            {/* A lone image takes the full column; a pair or more splits into two. */}
            <div className={`grid gap-4 ${property.images.length > 1 ? 'sm:grid-cols-2' : ''}`}>
              {property.images.map((image, index) => (
                <div key={image} className="card-media card-media-wide">
                  <img
                    src={image}
                    alt={index === 0 && seo?.imageAlt ? seo.imageAlt : property.title}
                    onError={(event) => {
                      event.currentTarget.src = '/images/dubai-skyline-from-sea.jpg';
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="mt-12">
              <SectionLabel>About this home</SectionLabel>
              <p className="body-copy measure mt-5 text-[#2b3242]/65">{property.description}</p>
              <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-[#2b3242]/15 pt-6 sm:grid-cols-3">
                {property.amenities.map((item) => (
                  <span key={item} className="flex items-start gap-2 text-sm text-[#2b3242]/65">
                    <Check size={15} className="mt-0.5 text-[#9f7a47]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <aside className="h-fit rounded-2xl border border-[#2b3242]/15 bg-[#fffdf8] p-6 shadow-sm sm:p-8 lg:sticky lg:top-28">
            <SectionLabel>Property details</SectionLabel>
            <p className="display mt-4 text-[2rem] leading-none text-[#2b3242] sm:text-[2.35rem]">{price(property.price, property.currency || defaultCurrency)}</p>
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-[#2b3242]/15 py-5 text-sm text-[#2b3242]/75">
              <span>{property.bedrooms} bedrooms</span>
              <span>{property.bathrooms} bathrooms</span>
              <span>{new Intl.NumberFormat('en-AE').format(property.size)} sq ft</span>
              <span>{property.location}</span>
            </div>
            <h3 className="block-title mt-10">
              Interested in<br />
              <em className="text-[#9f7a47]">this address?</em>
            </h3>
            <div className="mt-6">
              <ContactForm compact propertySlug={property.slug} inquiryType="property" />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(defaultProjects as unknown as Project[]);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');
  const search = useSearch();
  const query = parsePropertySearch(search);
  const searching = hasPropertySearch(query);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get('filter');
    if (f) {
      const lower = f.toLowerCase();
      if (lower === 'featured') setFilter('Featured');
      else if (lower === 'new-launches') setFilter('New launches');
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

  // Chips mirror what the collection actually holds, so none of them can come back empty.
  const filters = useMemo(() => [
    'All',
    ...(projects.some((project) => project.featured) ? ['Featured'] : []),
    ...(projects.some(isNewLaunch) ? ['New launches'] : []),
  ], [projects]);

  const active = filters.includes(filter) ? filter : 'All';
  const byCategory =
    active === 'Featured' ? projects.filter((project) => project.featured)
    : active === 'New launches' ? projects.filter(isNewLaunch)
    : projects;
  const filtered = byCategory.filter((project) => matchesProjectSearch(project, query));

  return (
    <main>
      <PageHero
        label="The next horizon"
        title={
          <>
            Projects with<br />
            <em className="text-[#9f7a47]">possibility.</em>
          </>
        }
        copy="A live edit of Dubai’s most considered new addresses, from established developers and emerging neighbourhoods."
        image="/images/dubai-new-towers-aerial.jpg"
      />
      {/* The hero search links here with #results when off-plan is the chosen mode. */}
      <section id="results" className="scroll-mt-16 bg-[#f2ede4] site-section md:scroll-mt-20">
        <div className="site-container">
          {/* Remount when the URL changes so the fields always mirror the active search */}
          <PropertySearch key={search} initial={{ ...query, listing: 'offplan' }} tone="light" />

          <div className="mt-8 flex flex-wrap gap-2 border-b border-[#2b3242]/15 pb-6">
            {filters.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[.13em] transition-colors ${
                  active === item
                    ? 'bg-[#2b3242] text-[#faf7f1]'
                    : 'border border-[#2b3242]/20 text-[#2b3242]/60 hover:border-[#9f7a47] hover:text-[#9f7a47]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {searching && (
            <AppliedFilters
              query={{ ...query, listing: 'offplan' }}
              onClear={clearSearchHref({ ...query, listing: 'offplan' })}
              count={<span data-testid="text-project-search-count">{filtered.length} {filtered.length === 1 ? 'project matches' : 'projects match'} your search</span>}
            />
          )}

          <div className="mt-12">
            {error && !projects.length ? (
              <ErrorState message={error} />
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="block-title text-[#2b3242]">{searching ? 'No projects found.' : 'Nothing in this edit yet.'}</p>
                {searching && (
                  <p className="measure-narrow mx-auto mt-4 text-sm leading-7 text-[#2b3242]/65">
                    New releases reach us before they reach the portals.{' '}
                    <Link href="/contact" className="text-[#9f7a47] underline underline-offset-4">Share your brief</Link>
                    {' '}with an advisor, or try a wider search.
                  </p>
                )}
              </div>
            ) : (
              <div className={cardGrid(filtered.length)}>
                {filtered.map((project) => (
                  <ProjectCard key={project.id || project.slug} project={project} />
                ))}
              </div>
            )}
          </div>
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
            <em className="text-[#9f7a47]">clearer.</em>
          </>
        }
        copy="Practical guidance, local perspective, and thoughtful notes for your next move in Dubai real estate."
        image="/images/dubai-creek-dusk.jpg"
      />
      <section className="bg-[#faf7f1] site-section">
        <div className="site-container">
          <div className="flex flex-col gap-5 border-b border-[#2b3242]/15 pb-7 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[.13em] ${
                    category === item ? 'bg-[#2b3242] text-[#faf7f1]' : 'border border-[#2b3242]/20'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-3 border-b border-[#2b3242]/25 py-2 md:w-72">
              <Search size={16} className="text-[#9f7a47]" />
              <span className="sr-only">Search blog</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the blog"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#2b3242]/65"
              />
            </label>
          </div>
          {loading ? (
            <LoadingState />
          ) : error && !filtered.length ? (
            <ErrorState message={error} />
          ) : !filtered.length ? (
            <div className="py-16 text-center">
              <p className="block-title text-[#2b3242]">No notes match this search.</p>
              <p className="mt-4 text-sm text-[#2b3242]/60">Try another phrase or category.</p>
            </div>
          ) : (
            <div className={`mt-12 ${cardGrid(filtered.length)}`}>
              {filtered.map((post) => (
                <PostCard key={post.id || post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export function BlogPostPage() {
  const [, blogParams] = useRoute('/blog/:slug');
  const [, journalParams] = useRoute('/journal/:slug');
  const params = blogParams ?? journalParams;
  const defaultMatch = defaultPosts.find((p) => p.slug === params?.slug);
  const [post, setPost] = useState<Post | null>((defaultMatch as unknown as Post) || null);
  const [related, setRelated] = useState<Post[]>([]);
  const [seo, setSeo] = useState<SeoFields | null>(null);
  const [error, setError] = useState('');
  const [, navigate] = useLocation();
  const { siteName } = useSiteSettings();
  const { settings: seoSettings } = useSeoData();
  const heroImage = post ? post.featuredImage || post.image || '/images/dubai-skyline-from-sea.jpg' : null;

  // The blog admin saves the title as the SEO title by default; only a different one is a real override.
  const customTitle = post?.seoTitle && post.seoTitle.trim() !== post.title.trim() ? post.seoTitle : null;
  usePageMeta(
    post?.title ?? 'Blog',
    post?.excerpt ?? 'Real-estate perspective from KNC Horizon Realtor.',
    {
      path: post ? `/blog/${post.slug}` : undefined,
      seo: post ? { ...seo, seoTitle: customTitle, metaDescription: post.seoDescription || null } : null,
      image: heroImage,
      imageAlt: post?.title,
      type: 'article',
      noindex: Boolean(error && !post),
      jsonLd: post ? [articleJsonLd({
        url: `${seoSettings.siteUrl}/blog/${post.slug}`,
        headline: post.title,
        description: post.seoDescription || post.excerpt,
        image: heroImage ? absoluteUrl(heroImage, seoSettings.siteUrl) : null,
        datePublished: post.publishedAt,
        author: post.author,
        siteName,
        siteUrl: seoSettings.siteUrl,
      })] : undefined,
    },
  );

  useEffect(() => {
    if (!params?.slug) return;
    apiFetch<{ blog: Post; related: Post[]; seo?: SeoFields | null }>(`/blogs/${params.slug}`)
      .then((data) => {
        setPost(data.blog);
        setRelated(data.related);
        setSeo(data.seo ?? null);
        if (data.blog.slug && data.blog.slug !== params.slug) navigate(`/blog/${data.blog.slug}`, { replace: true });
      })
      .catch((reason) => {
        if (!post) setError(reason instanceof Error ? reason.message : 'Blog post not found.');
      });
  }, [params?.slug]);

  if (error && !post) {
    return (
      <main className="bg-[#faf7f1] site-section pt-40">
        <div className="mx-auto max-w-[900px]">
          <ErrorState message={error} />
          <Link href="/blog" className="mt-7 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]">
            <ArrowLeft size={14} /> Back to blog
          </Link>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="site-section pt-40">
        <LoadingState />
      </main>
    );
  }

  const image = post.featuredImage || post.image || '/images/dubai-skyline-from-sea.jpg';
  const internalLinks = seo?.internalLinks ?? [];

  return (
    <main>
      <PageHero
        label={`${post.category} · ${post.author}`}
        title={<>{post.title}</>}
        copy={post.excerpt}
        image={image}
        imageAlt={seo?.imageAlt || post.title}
      />
      <article className="site-section bg-[#faf7f1]">
        <div className="site-container">
          {/* The reading column keeps the page's left grid line; the related cards below
              take the full container so they match the cards on every other page. */}
          <div className="max-w-[46rem]">
            <p className="font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]">
              {post.author} · {new Date(post.publishedAt).toLocaleDateString('en-GB', { dateStyle: 'long' })}
            </p>
            <div className="body-copy mt-8 whitespace-pre-line text-[#2b3242]/80">
              {post.content}
            </div>
            {internalLinks.length > 0 && (
              <nav aria-label="Related pages" className="mt-10 border-t border-[#2b3242]/15 pt-6">
                <p className="eyebrow text-[#9f7a47]">Related on KNC Horizon</p>
                <ul className="mt-4 space-y-2.5">
                  {internalLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="inline-flex items-center gap-2 text-[15px] text-[#2b3242] underline decoration-[#9f7a47]/40 underline-offset-4 transition-colors hover:text-[#80623a] hover:decoration-[#9f7a47]">
                        {link.label} <ArrowUpRight size={13} className="text-[#9f7a47]" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            <Link href="/blog" className="line-link mt-12 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]">
              <ArrowLeft size={14} /> Back to blog
            </Link>
          </div>

          {related.length > 0 && (
            <section className="mt-16 border-t border-[#2b3242]/15 pt-8">
              <p className="eyebrow text-[#9f7a47]">Keep reading</p>
              <div className={`mt-6 ${cardGrid(related.length)}`}>
                {related.map((item) => (
                  <Link key={item.id} href={`/blog/${item.slug}`} className="card-editorial group p-5">
                    <div className="card-media image-reveal">
                      <img
                        src={item.featuredImage || item.image || '/images/dubai-skyline-from-sea.jpg'}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <p className="card-title mt-4 line-clamp-2 text-[#2b3242] transition-colors group-hover:text-[#9f7a47]">{item.title}</p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-4 font-mono text-[11px] uppercase tracking-[.12em] text-[#9f7a47] group-hover:underline">
                      Read note <ArrowUpRight size={12} />
                    </span>
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
            <em className="text-[#9f7a47]">place.</em>
          </>
        }
        copy="A closer look at the textures, horizons, and details that shape the KNC point of view."
        image="/images/madinat-jumeirah-canal.jpg"
      />
      <section className="bg-[#efeae2] site-section">
        <div className={`site-container ${cardGrid(items.length)}`}>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item)}
              className="group card-editorial p-5 text-left transition-all"
            >
              <div className="card-media">
                <img
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4">
                <p className="eyebrow text-[#9f7a47]">{item.category}</p>
                <p className="card-title mt-1 line-clamp-2 text-[#2b3242]">{item.title}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
      {active && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-[#2b3242]/90 p-5 backdrop-blur-sm sm:p-8"
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setActive(null)}
            className="absolute right-5 top-5 text-[#faf7f1] p-2 hover:text-[#9f7a47] transition-colors"
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

export type PropertiesFilterPageProps = {
  category?: string;
  params?: { category?: string; [key: string]: unknown };
};

export function PropertiesFilterPage(props: PropertiesFilterPageProps = {}) {
  const { defaultCurrency } = useSiteSettings();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const pathCategory = location.startsWith('/properties/') ? location.replace('/properties/', '').split('/')[0].split('?')[0] : '';
  const validCategories = ['residential', 'commercial', 'investment', 'off-plan', 'sale', 'rent'];
  const rawCategory = (props.category || (typeof props.params?.category === 'string' ? props.params.category : undefined) || searchParams.get('category') || (validCategories.includes(pathCategory) ? pathCategory : 'residential')).toLowerCase();
  const category = validCategories.includes(rawCategory) ? rawCategory : 'residential';

  const [items, setItems] = useState<RemoteProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const displayTitles: Record<string, string> = {
    residential: 'Residential Properties',
    commercial: 'Commercial Properties',
    investment: 'Investment Opportunities',
    'off-plan': 'Off-Plan Properties',
    sale: 'Properties for Sale',
    rent: 'Properties for Rent'
  };

  usePageMeta(displayTitles[category] || 'Properties', `Explore ${category} real estate opportunities in Dubai.`);

  /*
   * The API only filters on fields it holds, so the category itself is applied here against
   * the same taxonomy the search bar uses. An empty result is now shown as an empty result:
   * it used to fall back to the whole list, which put apartments under "Commercial spaces"
   * and completed stock under "Off-Plan launches".
   */
  useEffect(() => {
    setLoading(true);
    setError('');
    const query = category === 'sale' || category === 'investment'
      ? '?listingType=sale&limit=50'
      : category === 'rent'
      ? '?listingType=rent&limit=50'
      : '?limit=50';

    apiFetch<{ properties: RemoteProperty[] }>(`/public/properties${query}`)
      .then((data) => setItems(narrowToCategory(data.properties ?? [], category)))
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : 'Please try again.');
        setItems(narrowToCategory(defaultRemoteProperties as unknown as RemoteProperty[], category));
      })
      .finally(() => setLoading(false));
  }, [category]);

  const titles: Record<string, React.ReactNode> = {
    residential: <>Residential<br /><em className="text-[#9f7a47]">properties.</em></>,
    commercial: <>Commercial<br /><em className="text-[#9f7a47]">spaces.</em></>,
    investment: <>Investment<br /><em className="text-[#9f7a47]">opportunities.</em></>,
    'off-plan': <>Off-Plan<br /><em className="text-[#9f7a47]">launches.</em></>,
    sale: <>Properties<br /><em className="text-[#9f7a47]">for sale.</em></>,
    rent: <>Properties<br /><em className="text-[#9f7a47]">for rent.</em></>
  };

  const copyMap: Record<string, string> = {
    residential: 'A considered selection of residential properties in Dubai.',
    commercial: 'Prime commercial office spaces and retail assets across Dubai.',
    investment: 'High-yield residential and commercial investment assets across Dubai.',
    'off-plan': 'Exciting new developments and off-plan launches across the UAE.',
    sale: 'Curated freehold and prime properties for sale across Dubai.',
    rent: 'Exceptional long-term luxury residences and commercial spaces for lease.'
  };

  return (
    <main>
      <PageHero
        label={displayTitles[category] || `${category} properties`}
        title={titles[category] || titles['residential']}
        copy={copyMap[category] || `A considered selection of ${category} properties in Dubai.`}
        image={({ sale: '/images/burj-khalifa-aerial.jpg', rent: '/images/jbr-residences-street.jpg', residential: '/images/the-greens-residential.jpg', commercial: '/images/difc-green-towers.jpg', investment: '/images/business-bay-skyline-day.jpg', 'off-plan': '/images/jvc-tower-construction-dusk.jpg' } as Record<string, string>)[category] ?? '/images/downtown-safa-park.jpg'}
      />
      <section className="bg-[#faf7f1] site-section">
        <div className="site-container">
          {loading ? <LoadingState /> : error ? <ErrorState message={error} /> : items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="block-title text-[#2b3242]">No properties found in this category.</p>
              <p className="measure-narrow mx-auto mt-4 text-sm leading-7 text-[#2b3242]/65">
                {category === 'off-plan' ? (
                  <>Completed stock is listed here. For launches still under construction, see our{' '}
                    <Link href="/off-plan" className="text-[#9f7a47] underline underline-offset-4">off-plan projects</Link>.</>
                ) : (
                  <>Our recommendations are not limited to what is listed here.{' '}
                    <Link href="/contact" className="text-[#9f7a47] underline underline-offset-4">Share your brief</Link>
                    {' '}and an advisor will come back to you.</>
                )}
              </p>
            </div>
          ) : (
            <div className={cardGrid(items.length)}>
              {items.map((item) => (
                <PropertyCard key={item.id} property={propertyCard(item, defaultCurrency)} featured={false} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export type ProjectsFilterPageProps = {
  filter?: string;
  params?: { filter?: string; [key: string]: unknown };
};

export function ProjectsFilterPage(props: ProjectsFilterPageProps = {}) {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const pathFilter = location.startsWith('/projects/')
    ? location.replace('/projects/', '').split('/')[0].split('?')[0]
    : location.startsWith('/off-plan/')
    ? location.replace('/off-plan/', '').split('/')[0].split('?')[0]
    : '';
  const validFilters = ['featured', 'new-launches', 'off-plan', 'apartments', 'villas-townhouses'];
  const rawFilter = (props.filter || (typeof props.params?.filter === 'string' ? props.params.filter : undefined) || searchParams.get('filter') || (validFilters.includes(pathFilter) ? pathFilter : 'featured')).toLowerCase();
  const filter = validFilters.includes(rawFilter) ? rawFilter : 'featured';

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const displayFilterTitles: Record<string, string> = {
    featured: 'Featured Developments',
    'new-launches': 'New Project Launches',
    'off-plan': 'Off-Plan Developments',
    apartments: 'Off-Plan Apartments',
    'villas-townhouses': 'Villas & Townhouses'
  };

  usePageMeta(displayFilterTitles[filter] || `${filter.replace('-', ' ')} Projects`, `Explore ${filter.replace('-', ' ')} projects in Dubai.`);

  /*
   * Only 'featured' is a flag the API can filter on. New launches also read the status the
   * admin typed, and the two segment pages classify the project itself, so neither page can
   * show something it does not describe.
   */
  useEffect(() => {
    setLoading(true);
    setError('');
    const query = filter === 'featured' ? '?featured=true' : '';

    apiFetch<{ projects: Project[] }>(`/public/projects${query}`)
      .then((data) => setProjects(narrowProjects(data.projects ?? [], filter)))
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : 'Please try again.');
        setProjects(narrowProjects(defaultProjects as unknown as Project[], filter));
      })
      .finally(() => setLoading(false));
  }, [filter]);

  const titles: Record<string, React.ReactNode> = {
    featured: <>Featured<br /><em className="text-[#9f7a47]">projects.</em></>,
    'new-launches': <>New<br /><em className="text-[#9f7a47]">launches.</em></>,
    'off-plan': <>Off-Plan<br /><em className="text-[#9f7a47]">developments.</em></>,
    apartments: <>Off-Plan<br /><em className="text-[#9f7a47]">apartments.</em></>,
    'villas-townhouses': <>Villas &<br /><em className="text-[#9f7a47]">townhouses.</em></>
  };

  const copyMap: Record<string, string> = {
    featured: 'A selected portfolio of distinguished Dubai developments and master communities.',
    'new-launches': 'The newest property releases from Dubai’s most reputable master developers.',
    'off-plan': 'High-potential off-plan developments with structured construction-linked payment plans.',
    apartments: 'Prime waterfront and urban off-plan residences across Dubai’s key investment corridors.',
    'villas-townhouses': 'Private gated communities, waterfront villas, and family residences across Dubai.'
  };

  return (
    <main>
      <PageHero
        label={displayFilterTitles[filter] || filter.replace('-', ' ')}
        title={titles[filter] || titles['featured']}
        copy={copyMap[filter] || `Explore our curated selection of ${filter.replace('-', ' ')} in Dubai.`}
        image={({ featured: '/images/burj-night-water.jpg', 'new-launches': '/images/dubai-waterfront-tower-construction.jpg', 'off-plan': '/images/dubai-tower-cranes-twilight.jpg', apartments: '/images/dubai-apartment-towers-sunset.jpg', 'villas-townhouses': '/images/daria-island-seafront-villa.jpg' } as Record<string, string>)[filter] ?? '/images/dubai-new-towers-aerial.jpg'}
      />
      <section className="bg-[#f2ede4] site-section">
        <div className="site-container">
          {loading ? <LoadingState /> : error ? <ErrorState message={error} /> : projects.length === 0 ? (
             <div className="py-16 text-center">
               <p className="block-title text-[#2b3242]">No projects found for this selection.</p>
               <p className="measure-narrow mx-auto mt-4 text-sm leading-7 text-[#2b3242]/65">
                 See{' '}
                 <Link href="/off-plan" className="text-[#9f7a47] underline underline-offset-4">every off-plan project</Link>
                 {' '}on record, or{' '}
                 <Link href="/contact" className="text-[#9f7a47] underline underline-offset-4">share your brief</Link>
                 {' '}with an advisor.
               </p>
             </div>
          ) : (
            <div className={cardGrid(projects.length)}>
              {projects.map((project) => (
                <ProjectCard key={project.id || project.slug} project={project} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}



export function DevelopersPage() {
  const contact = useContact();
  const [developers, setDevelopers] = useState<Developer[]>(defaultDevelopers as unknown as Developer[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  usePageMeta(
    'Dubai Developers',
    'Explore established developers shaping residential, investment and mixed-use communities across Dubai.'
  );

  useEffect(() => {
    let active = true;
    apiFetch<{ developers: Developer[] }>('/developers')
      .then((data) => {
        if (!active) return;
        if (data?.developers && data.developers.length > 0) {
          setDevelopers(data.developers);
        }
      })
      .catch((reason) => {
        if (!active) return;
        // Keep verified defaults on network fallback
        setError(reason instanceof Error ? reason.message : 'Unable to refresh developer list.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#faf7f1]">
      <PageHero
        label="Dubai developers"
        title={
          <>
            Names behind<br />
            <em className="text-[#9f7a47]">Dubai's next chapter.</em>
          </>
        }
        copy="Explore established developers shaping residential, investment and mixed-use communities across Dubai."
        image="/images/downtown-skyline-cranes.jpg"
      />

      {/* Main Developers Listing Section */}
      <section className="site-section">
        <div className="site-container">
          <div className="mb-12 flex flex-col justify-between gap-4 border-b border-[#2b3242]/12 pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-[#9f7a47]">Selected Profiles</p>
              <h2 className="section-title mt-6 text-[#2b3242]">Established master builders</h2>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[.13em] text-[#2b3242]/60 sm:pb-2">
              {developers.length} verified developer profiles
            </p>
          </div>

          {loading && developers.length === 0 ? (
            <LoadingState />
          ) : (
            <div className={cardGrid(developers.length)}>
              {developers.map((dev) => {
                const websiteUrl = dev.officialWebsite || dev.website || '';
                return (
                  <article
                    key={dev.id || dev.slug}
                    className="card-editorial group justify-between p-5"
                    data-testid={`card-developer-${dev.slug}`}
                  >
                    <div>
                      {/* Logo / Header Visual Treatment */}
                      <div className="mb-5 flex min-h-[3.25rem] w-full items-center justify-between gap-3 border-b border-[#2b3242]/10 pb-4">
                        {dev.logo ? (
                          <div className="h-10 max-w-[140px] opacity-85 mix-blend-multiply">
                            <img
                              src={dev.logo}
                              alt={`${dev.name} official logo`}
                              loading="lazy"
                              className="h-full w-full object-contain object-left"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#2b3242]/5 font-serif text-lg font-medium text-[#2b3242]">
                            {dev.name.charAt(0)}
                          </div>
                        )}
                        {dev.featured && (
                          <span className="border border-[#9f7a47]/30 bg-[#8f6d3f]/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[.14em] text-[#9f7a47]">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Name & Short Description */}
                      <h3 className="card-title line-clamp-2 text-[#2b3242] transition-colors group-hover:text-[#9f7a47]">
                        {dev.name}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#2b3242]/65">
                        {dev.shortDescription || dev.description}
                      </p>

                      {/* Verified Areas */}
                      {dev.areas && dev.areas.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-[#2b3242]/10 pt-3">
                          {dev.areas.slice(0, 3).map((area) => (
                            <span
                              key={area}
                              className="bg-[#2b3242]/5 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-[#2b3242]/60"
                            >
                              {area}
                            </span>
                          ))}
                          {dev.areas.length > 3 && (
                            <span className="font-mono text-[11px] text-[#2b3242]/60 self-center">
                              +{dev.areas.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions & Official Website */}
                    <div className="mt-5 flex flex-col items-start gap-3 border-t border-[#2b3242]/12 pt-4">
                      {websiteUrl && (
                        <a
                          href={websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[.12em] text-[#2b3242]/65 hover:text-[#9f7a47] transition-colors"
                          aria-label={`Visit official website for ${dev.name}`}
                        >
                          <Globe size={11} className="text-[#9f7a47]" />
                          <span>Official website</span>
                          <ExternalLink size={10} className="opacity-70" />
                        </a>
                      )}

                      <Link
                        href={`/developers/${dev.slug}`}
                        className="btn btn-primary w-full"
                        data-testid={`btn-view-developer-${dev.slug}`}
                      >
                        View developer <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Professional Advisory CTA Section */}
      <section className="bg-[#efeae2] site-section border-t border-[#2b3242]/12">
        <div className="site-container grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-16">
          <div>
            <SectionLabel>Developer Advisory</SectionLabel>
            <h2 className="section-title mt-6 text-[#2b3242]">
              Looking for the <em className="text-[#9f7a47]">right developer?</em>
            </h2>
            <p className="body-copy measure mt-6 text-[#2b3242]/70">
              Every developer in Dubai brings distinct architectural standards, community masterplans, and delivery horizons. Our independent advisory helps you compare opportunities objectively based on your investment goals and lifestyle criteria.
            </p>
          </div>
          <div className="btn-row lg:justify-end">
            <Link href="/contact" className="btn btn-primary">
              Speak with an advisor <ArrowUpRight size={14} />
            </Link>
            <a
              href={`https://wa.me/${contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Chat on WhatsApp <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}