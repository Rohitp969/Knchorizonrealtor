import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, ExternalLink, Globe, MapPin } from 'lucide-react';
import { Link, useRoute } from 'wouter';
import { ContactForm, ErrorState, PageHero, SectionLabel } from '@/components/blocks';
import { apiFetch, type Developer, type Project } from '@/lib/api';
import { defaultProjects } from '@/lib/site-data';
import { usePageMeta } from '@/lib/seo';
import { useContact } from '@/lib/site-settings';

const fallbackImage = '/images/dubai-skyline-from-sea.jpg';

const defaultDevelopersBySlug: Record<string, Developer> = {
  emaar: {
    id: 'emaar',
    slug: 'emaar',
    name: 'Emaar Properties',
    shortDescription: 'Dubai-based property developer known for major master-planned communities and residential developments.',
    description: 'Emaar Properties is a publicly listed Dubai-based real estate developer established in 1997. The company is responsible for shaping landmark master communities across Dubai, including Downtown Dubai, Dubai Marina, Dubai Hills Estate, and Dubai Creek Harbour.',
    officialWebsite: 'https://www.emaar.com',
    website: 'https://www.emaar.com',
    published: true,
    featured: true,
    sortOrder: 1,
    areas: ['Downtown Dubai', 'Dubai Marina', 'Dubai Hills Estate', 'Dubai Creek Harbour', 'Arabian Ranches', 'The Oasis', 'Emaar South'],
  },
  damac: {
    id: 'damac',
    slug: 'damac',
    name: 'DAMAC Properties',
    shortDescription: 'Dubai-based property developer with residential, hospitality and branded-development projects.',
    description: 'DAMAC Properties was founded in 2002 as a private residential, leisure, and commercial developer in Dubai. The developer is recognised for large-scale master communities including DAMAC Hills and luxury branded residential collaborations.',
    officialWebsite: 'https://www.damacproperties.com',
    website: 'https://www.damacproperties.com',
    published: true,
    featured: true,
    sortOrder: 2,
    areas: ['Dubai Marina', 'Business Bay', 'DAMAC Hills', 'DAMAC Hills 2', 'Dubai Maritime City', 'Downtown Dubai'],
  },
  'sobha-realty': {
    id: 'sobha-realty',
    slug: 'sobha-realty',
    name: 'Sobha Realty',
    shortDescription: 'Dubai-based developer known for residential communities and its vertically integrated development approach.',
    description: 'Sobha Realty is an international luxury developer active in the UAE since 2003. Known for its backward-integrated construction and design model, its flagship Dubai developments include Sobha Hartland and Sobha Hartland II in Mohammed Bin Rashid City.',
    officialWebsite: 'https://www.sobharealty.com',
    website: 'https://www.sobharealty.com',
    published: true,
    featured: true,
    sortOrder: 3,
    areas: ['Mohammed Bin Rashid City', 'Sobha Hartland', 'Ras Al Khor', 'Dubai Marina', 'Sheikh Zayed Road'],
  },
  binghatti: {
    id: 'binghatti',
    slug: 'binghatti',
    name: 'Binghatti',
    shortDescription: 'Dubai-based developer with residential and branded developments across several Dubai communities.',
    description: 'Binghatti Developers is a Dubai-headquartered property brand recognised for its distinct architectural styling and portfolio of branded residential partnerships across major central and residential districts.',
    officialWebsite: 'https://www.binghatti.com',
    website: 'https://www.binghatti.com',
    published: true,
    featured: true,
    sortOrder: 4,
    areas: ['Business Bay', 'Downtown Dubai', 'Jumeirah Village Circle', 'Al Jaddaf', 'Dubai Silicon Oasis'],
  },
  nakheel: {
    id: 'nakheel',
    slug: 'nakheel',
    name: 'Nakheel',
    shortDescription: 'Dubai-based master developer known for landmark waterfront destinations and master-planned residential communities.',
    description: 'Nakheel is a major Dubai master developer celebrated for landmark coastal projects including Palm Jumeirah and Dubai Islands, alongside extensive family residential master communities throughout the emirate.',
    officialWebsite: 'https://www.nakheel.com',
    website: 'https://www.nakheel.com',
    published: true,
    featured: true,
    sortOrder: 5,
    areas: ['Palm Jumeirah', 'Dubai Islands', 'Jumeirah Islands', 'Jumeirah Park', 'Jumeirah Village Circle', 'Al Furjan'],
  },
  danube: {
    id: 'danube',
    slug: 'danube',
    name: 'Danube Properties',
    shortDescription: 'Dubai-based property developer focusing on residential developments and private residences across Dubai.',
    description: 'Danube Properties is the property development arm of the Danube Group, launched in 2014. The developer focuses on contemporary urban apartments with flexible payment models across established Dubai residential corridors.',
    officialWebsite: 'https://www.danubeproperties.com',
    website: 'https://www.danubeproperties.com',
    published: true,
    featured: false,
    sortOrder: 6,
    areas: ['Al Furjan', 'Jumeirah Lake Towers', 'Business Bay', 'Arjan', 'Dubai Silicon Oasis'],
  },
  ellington: {
    id: 'ellington',
    slug: 'ellington',
    name: 'Ellington Properties',
    shortDescription: 'Dubai-based boutique design-led property developer creating residential properties and communities.',
    description: 'Ellington Properties, established in 2014, is a design-focused Dubai boutique developer producing high-specification residences across prime and emerging neighbourhoods.',
    officialWebsite: 'https://www.ellingtonproperties.ae',
    website: 'https://www.ellingtonproperties.ae',
    published: true,
    featured: false,
    sortOrder: 7,
    areas: ['Downtown Dubai', 'Palm Jumeirah', 'Mohammed Bin Rashid City', 'Jumeirah Village Circle', 'Business Bay'],
  },
  meraas: {
    id: 'meraas',
    slug: 'meraas',
    name: 'Meraas',
    shortDescription: 'Dubai-based developer known for destination-led residential, mixed-use, and waterfront communities.',
    description: 'Meraas is a Dubai-based master development company with a portfolio of urban and coastal residential destinations including City Walk, Bluewaters Island, and Port de La Mer.',
    officialWebsite: 'https://www.meraas.com',
    website: 'https://www.meraas.com',
    published: true,
    featured: false,
    sortOrder: 8,
    areas: ['City Walk', 'Bluewaters Island', 'Port de La Mer', 'Jumeirah', 'Pearl Jumeira'],
  },
};

function getFallbackProjectsForDeveloper(slug: string, name: string): Project[] {
  const shortName = name.replace(/\s+(Properties|Realty)$/i, '').trim().toLowerCase();
  const nameLower = name.toLowerCase();
  const slugLower = slug.toLowerCase();

  return (defaultProjects as unknown as Project[]).filter((p) => {
    const dev = (p.developer || '').trim().toLowerCase();
    return dev === nameLower || dev === shortName || dev === slugLower;
  });
}

export function DeveloperDetailPage() {
  const contact = useContact();
  const [, params] = useRoute('/developers/:slug');
  const slugParam = (params?.slug ?? '').trim().toLowerCase();
  const fallbackDeveloper = defaultDevelopersBySlug[slugParam] || null;

  const [developer, setDeveloper] = useState<Developer | null>(fallbackDeveloper);
  const [projects, setProjects] = useState<Project[]>(
    fallbackDeveloper ? getFallbackProjectsForDeveloper(fallbackDeveloper.slug, fallbackDeveloper.name) : []
  );
  const [loading, setLoading] = useState(!fallbackDeveloper);
  const [error, setError] = useState('');

  usePageMeta(
    developer ? `KNC Horizon Realtor | ${developer.name}` : 'Developer Profile | KNC Horizon Realtor',
    developer?.shortDescription || developer?.description || 'Explore verified Dubai developers with KNC Horizon Realtor.'
  );

  useEffect(() => {
    if (!slugParam) return;
    let active = true;

    apiFetch<{ developer: Developer; projects: Project[] }>(`/developers/${slugParam}`)
      .then((data) => {
        if (!active) return;
        if (data?.developer) {
          setDeveloper(data.developer);
          setProjects(data.projects || []);
        }
      })
      .catch((reason) => {
        if (!active) return;
        if (!fallbackDeveloper) {
          setError(reason instanceof Error ? reason.message : 'Developer profile not found.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slugParam, fallbackDeveloper]);

  if (loading && !developer) {
    return (
      <main className="min-h-screen bg-[#faf7f1] px-5 py-40">
        <div className="site-container text-center">
          <p className="eyebrow text-[#9f7a47]">Dubai Developers</p>
          <h1 className="page-title mt-5">Loading developer profile…</h1>
        </div>
      </main>
    );
  }

  if (error && !developer) {
    return (
      <main className="site-section min-h-screen bg-[#faf7f1] pt-40">
        <div className="mx-auto max-w-[900px]">
          <ErrorState message={error} />
          <Link
            href="/developers"
            className="mt-7 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]"
          >
            <ArrowLeft size={14} /> Back to developers
          </Link>
        </div>
      </main>
    );
  }

  if (!developer) return null;

  const websiteUrl = developer.officialWebsite || developer.website;

  return (
    <main className="min-h-screen bg-[#faf7f1]">
      {/* Hero Section */}
      <PageHero
        label="Dubai Developer Profile"
        title={
          <>
            {developer.name}
            <br />
            <em className="text-[#9f7a47]">master builder.</em>
          </>
        }
        copy={developer.shortDescription || developer.description}
        image={developer.coverImage || fallbackImage}
      >
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/developers"
            className="btn btn-outline-light bg-[#2b3242]/60 backdrop-blur-xs"
          >
            <ArrowLeft size={12} /> All developers
          </Link>
        </div>
      </PageHero>

      {/* Developer Overview & Detail Grid */}
      <section className="site-section">
        <div className="site-container grid gap-12 lg:grid-cols-[1.2fr_.8fr] lg:gap-16 xl:gap-20">
          {/* Left Column: Profile Details */}
          <div>
            {/* Header with Logo and Official Link */}
            <div className="flex flex-wrap items-center justify-between gap-6 border-b border-[#2b3242]/15 pb-8">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[.18em] text-[#9f7a47]">
                  Developer Profile
                </span>
                <h2 className="section-title mt-6 text-[#2b3242]">{developer.name}</h2>
              </div>
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary bg-[#fffdf8]"
                  aria-label={`Open official website of ${developer.name}`}
                >
                  <Globe size={13} className="text-[#9f7a47]" />
                  <span>Official Website</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Verified Descriptions */}
            <div className="mt-10">
              <SectionLabel>Overview</SectionLabel>
              <p className="body-copy measure mt-4 font-medium text-[#2b3242]/80">
                {developer.shortDescription}
              </p>
              <p className="measure mt-4 text-sm leading-7 text-[#2b3242]/65">
                {developer.description}
              </p>
            </div>

            {/* Verified Areas / Communities */}
            {developer.areas && developer.areas.length > 0 && (
              <div className="mt-12 border-t border-[#2b3242]/15 pt-8">
                <SectionLabel>Verified Footprint &amp; Communities</SectionLabel>
                <p className="mt-2 text-xs text-[#2b3242]/65">
                  Established presence and community master developments across Dubai:
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {developer.areas.map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center gap-1.5 border border-[#2b3242]/15 bg-[#fffdf8] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[.14em] text-[#2b3242]"
                    >
                      <MapPin size={11} className="text-[#9f7a47]" />
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Section */}
            <div className="mt-14 border-t border-[#2b3242]/15 pt-10">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <SectionLabel>Portfolio</SectionLabel>
                  <h3 className="block-title mt-2 text-[#2b3242]">Assigned projects</h3>
                </div>
                <span className="font-mono text-[11px] uppercase tracking-[.14em] text-[#2b3242]/60">
                  {projects.length} {projects.length === 1 ? 'project' : 'projects'} on record
                </span>
              </div>

              {projects.length === 0 ? (
                <div className="rounded-2xl border border-[#2b3242]/15 bg-[#fffdf8] p-8 text-center sm:p-10">
                  <p className="block-title mx-auto max-w-lg text-[#2b3242]">
                    Projects are being updated. Contact our team for current opportunities.
                  </p>
                  <p className="measure-narrow mx-auto mt-4 text-sm leading-7 text-[#2b3242]/60">
                    KNC Horizon Realtor advises clients across verified private sales and new releases directly connected with {developer.name}.
                  </p>
                </div>
              ) : (
                <div className={projects.length === 1 ? 'grid gap-6 sm:max-w-[26rem]' : 'grid gap-6 sm:grid-cols-2'}>
                  {projects.map((project) => (
                    <article
                      key={project.id || project.slug}
                      className="card-editorial group justify-between p-5"
                      data-testid={`card-project-${project.slug}`}
                    >
                      <div>
                        <div className="card-media image-reveal">
                          <img
                            src={project.image || fallbackImage}
                            alt={project.title}
                            onError={(e) => {
                              e.currentTarget.src = fallbackImage;
                            }}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[.13em] text-[#2b3242]/65">
                          <span className="shrink-0 text-[#9f7a47]">{project.category || 'Development'}</span>
                          <span className="truncate">{project.location}</span>
                        </div>
                        <h4 className="card-title mt-2 line-clamp-2 text-[#2b3242] transition-colors group-hover:text-[#9f7a47]">
                          {project.title}
                        </h4>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#2b3242]/65">{project.description}</p>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-[#2b3242]/12 pt-4">
                        <span className="font-sans text-sm font-semibold text-[#2b3242]">
                          {project.startingPrice
                            ? `From AED ${new Intl.NumberFormat('en-AE').format(project.startingPrice)}`
                            : 'Price on request'}
                        </span>
                        <Link
                          href={`/projects/${project.slug}`}
                          className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[.13em] text-[#9f7a47] hover:underline"
                        >
                          View project <ArrowUpRight size={11} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Advisory & Enquiry CTA Form */}
          <aside className="h-fit lg:sticky lg:top-28">
            <div className="rounded-2xl border border-[#2b3242]/15 bg-[#fffdf8] p-6 shadow-sm sm:p-8">
              <SectionLabel>Advisory Brief</SectionLabel>
              <h3 className="block-title mt-3 text-[#2b3242]">
                Enquire regarding <em className="text-[#9f7a47]">{developer.name}.</em>
              </h3>
              <p className="mt-4 text-sm leading-6 text-[#2b3242]/65">
                Our property advisors provide unbiased market perspective on upcoming releases, masterplan comparisons, and private allocation across {developer.name} developments.
              </p>

              <div className="mt-6 border-t border-[#2b3242]/12 pt-6">
                <ContactForm
                  compact
                  inquiryType="developer"
                  projectSlug={developer.slug}
                />
              </div>

              <div className="mt-8 border-t border-[#2b3242]/12 pt-5">
                <p className="font-mono text-[11px] uppercase tracking-[.14em] text-[#2b3242]/60">
                  Immediate assistance
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <a
                    href={`https://wa.me/${contact.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47] hover:underline"
                  >
                    Chat on WhatsApp <ArrowUpRight size={12} />
                  </a>
                  <Link
                    href="/contact"
                    className="font-mono text-[11px] uppercase tracking-[.14em] text-[#2b3242]/65 hover:text-[#9f7a47]"
                  >
                    Office details
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
