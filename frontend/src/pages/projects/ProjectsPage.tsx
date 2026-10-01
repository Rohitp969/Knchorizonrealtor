import { useEffect, useMemo, useState } from 'react';
import { Link, useSearch } from 'wouter';
import { apiFetch, type Project } from '@/lib/api';
import { PageHero, ProjectCard, cardGrid, SectionBreak } from '@/components/blocks';
import { clearSearchHref, hasPropertySearch, isNewLaunchProject, matchesProjectSearch, nearestMatches, parsePropertySearch, type PropertySearchQuery } from '@/lib/property-search';
import { defaultProjects } from '@/lib/site-data';
import { AppliedFilters, ErrorState, NearestMatchesNote } from '@/pages/shared/listing-helpers';

// The same rule as the /off-plan/new-launches page: the project's flag, or its status.
const isNewLaunch = isNewLaunchProject;

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(defaultProjects as unknown as Project[]);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');
  const search = useSearch();
  const parsed = useMemo(() => parsePropertySearch(search), [search]);
  const searching = hasPropertySearch(parsed);
  // This page only ever searches projects, so the mode is always off-plan.
  const query = useMemo<PropertySearchQuery>(() => ({ ...parsed, listing: 'offplan' }), [parsed]);

  // ?filter=featured and ?filter=new-launches pick a chip; a new search starts again from All.
  useEffect(() => {
    const wanted = (new URLSearchParams(search).get('filter') ?? '').toLowerCase();
    setFilter(wanted === 'featured' ? 'Featured' : wanted === 'new-launches' ? 'New launches' : 'All');
  }, [search]);

  useEffect(() => {
    apiFetch<{ projects: Project[] }>('/public/projects')
      .then((data) => {
        if (data.projects?.length) setProjects(data.projects);
      })
      .catch((reason) => {
        if (!projects.length) setError(reason instanceof Error ? reason.message : 'Please try again.');
      });
  }, []);

  // The search comes first; the chips are counted against what it found, so a chip is only
  // shown when something is behind it and none of them can empty the page.
  const inSearch = useMemo(() => projects.filter((project) => matchesProjectSearch(project, query)), [projects, query]);
  const filters = useMemo(() => [
    'All',
    ...(inSearch.some((project) => project.featured) ? ['Featured'] : []),
    ...(inSearch.some(isNewLaunch) ? ['New launches'] : []),
  ], [inSearch]);

  const active = filters.includes(filter) ? filter : 'All';
  const exact =
    active === 'Featured' ? inSearch.filter((project) => project.featured)
    : active === 'New launches' ? inSearch.filter(isNewLaunch)
    : inSearch;
  // A search that matches nothing still leads somewhere: the closest projects, with a note
  // saying how the search was widened.
  const nearest = useMemo(
    () => (searching && inSearch.length === 0 ? nearestMatches(projects, query, matchesProjectSearch) : { items: [] as Project[], ignored: [] as string[] }),
    [projects, query, searching, inSearch.length],
  );
  const shown = exact.length ? exact : nearest.items;

  return (
    <main>
      <PageHero
        label="The next horizon"
        title={
          <>
            Projects with<SectionBreak />
            <em className="text-[#9f7a47]">possibility.</em>
          </>
        }
        copy="A live edit of Dubai’s most considered new addresses, from established developers and emerging neighbourhoods."
        image="https://res.cloudinary.com/complaintreview/image/upload/v1790577271/knc-horizon/hero/dubai-new-towers-aerial.jpg"
      />
      {/*
       * The search bar lives on the home page only. An off-plan search links here with
       * #results and lands straight on the chips, the chosen filters and the projects.
       */}
      <section className="bg-[#f2ede4] site-section">
        <div id="results" className="site-container scroll-mt-[calc(var(--header-h)+1.5rem)]">
          <div className="flex flex-wrap gap-2 border-b border-[#2b3242]/15 pb-6" role="group" aria-label="Show">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                aria-pressed={active === item}
                className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[.13em] transition-colors ${
                  active === item
                    ? 'bg-[#2b3242] text-[#faf7f1]'
                    : 'border border-[#2b3242]/20 text-[#2b3242]/60 hover:border-[#9f7a47] hover:text-[#9f7a47]'
                }`}
                data-testid={`chip-project-${item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              >
                {item}
              </button>
            ))}
          </div>

          {searching && (
            <AppliedFilters
              query={query}
              onClear={clearSearchHref(query)}
              count={
                <span data-testid="text-project-search-count">
                  {exact.length
                    ? `${exact.length} ${exact.length === 1 ? 'project matches' : 'projects match'} your search`
                    : nearest.items.length
                      ? `No exact match · ${nearest.items.length} closest ${nearest.items.length === 1 ? 'project' : 'projects'}`
                      : 'No exact match'}
                </span>
              }
            />
          )}

          <div className="mt-12">
            {error && !projects.length ? (
              <ErrorState message={error} />
            ) : shown.length === 0 ? (
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
              <>
                {exact.length === 0 && <NearestMatchesNote ignored={nearest.ignored} noun="projects" />}
                <div className={cardGrid(shown.length)}>
                  {shown.map((project) => (
                    <ProjectCard key={project.id || project.slug} project={project} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
