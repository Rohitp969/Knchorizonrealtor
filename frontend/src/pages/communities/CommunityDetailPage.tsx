import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link, useRoute } from 'wouter';
import { apiFetch, type Project, type RemoteProperty } from '@/lib/api';
import { PageHero, ProjectCard, PropertyCard, SectionLabel, cardGrid, SectionBreak, fitsOneLine } from '@/components/blocks';
import { areas } from '@/lib/site-data';
import { usePageMeta } from '@/lib/seo';
import { useSiteSettings } from '@/lib/site-settings';
import { LoadingState, propertyCard } from '@/pages/shared/listing-helpers';

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
  const image = community?.image || area?.image || 'https://res.cloudinary.com/complaintreview/image/upload/v1790577279/knc-horizon/pages/dubai-skyline-from-sea.jpg';
  const copy = community?.description || area?.detail || '';

  usePageMeta(
    name ? `${name} property guide` : 'Community',
    copy || `Properties and off-plan projects in ${name}, Dubai.`,
    name ? { image, imageAlt: name } : {},
  );

  const inCommunity = (value: string) => value.trim().toLowerCase() === name.trim().toLowerCase();
  const matchingProperties = properties.filter(
    (item) => inCommunity(item.community ?? '') || (item.location ?? '').split(',').some(inCommunity),
  );
  const matchingProjects = projects.filter((item) => inCommunity(item.location ?? ''));

  if (!name) {
    return (
      <main>
        <PageHero label="Communities" title={<>Community<SectionBreak /><em className="text-[#9f7a47]">not found.</em></>} copy="This community is not on our list yet." image="https://res.cloudinary.com/complaintreview/image/upload/v1790577274/knc-horizon/hero/maritime-city-towers.jpg" />
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
        title={<>{name}<SectionBreak keep={!fitsOneLine(`${name} at a glance.`)} /><em className="text-[#9f7a47]">at a glance.</em></>}
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
