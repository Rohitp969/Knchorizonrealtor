import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { apiFetch, type Project } from '@/lib/api';
import { PageHero, ProjectCard, cardGrid, SectionBreak } from '@/components/blocks';
import { isNewLaunchProject, projectSegment } from '@/lib/property-search';
import { defaultProjects } from '@/lib/site-data';
import { usePageMeta } from '@/lib/seo';
import { LoadingState, ErrorState } from '@/pages/shared/listing-helpers';

/** Applies an off-plan page's own meaning to a list of published projects. */
function narrowProjects(list: Project[], filter: string) {
  if (filter === 'new-launches') return list.filter(isNewLaunchProject);
  if (filter === 'apartments') return list.filter((project) => projectSegment(project) === 'apartments');
  if (filter === 'villas-townhouses') return list.filter((project) => projectSegment(project) === 'villas');
  return list;
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

  // The header photo of this page, which is also its share image.
  const heroImage = ({ featured: 'https://res.cloudinary.com/complaintreview/image/upload/v1790577267/knc-horizon/hero/burj-night-water.jpg', 'new-launches': 'https://res.cloudinary.com/complaintreview/image/upload/v1790577271/knc-horizon/hero/dubai-waterfront-tower-construction.jpg', 'off-plan': 'https://res.cloudinary.com/complaintreview/image/upload/v1790577271/knc-horizon/hero/dubai-tower-cranes-twilight.jpg', apartments: 'https://res.cloudinary.com/complaintreview/image/upload/v1790577269/knc-horizon/hero/dubai-apartment-towers-sunset.jpg', 'villas-townhouses': 'https://res.cloudinary.com/complaintreview/image/upload/v1790577268/knc-horizon/hero/daria-island-seafront-villa.jpg' } as Record<string, string>)[filter] ?? 'https://res.cloudinary.com/complaintreview/image/upload/v1790577271/knc-horizon/hero/dubai-new-towers-aerial.jpg';

  usePageMeta(displayFilterTitles[filter] || `${filter.replace('-', ' ')} Projects`, `Explore ${filter.replace('-', ' ')} projects in Dubai.`, { image: heroImage });

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
    featured: <>Featured<SectionBreak /><em className="text-[#9f7a47]">projects.</em></>,
    'new-launches': <>New<SectionBreak /><em className="text-[#9f7a47]">launches.</em></>,
    'off-plan': <>Off-Plan<SectionBreak /><em className="text-[#9f7a47]">developments.</em></>,
    apartments: <>Off-Plan<SectionBreak /><em className="text-[#9f7a47]">apartments.</em></>,
    'villas-townhouses': <>Villas &<SectionBreak /><em className="text-[#9f7a47]">townhouses.</em></>
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
        image={heroImage}
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
