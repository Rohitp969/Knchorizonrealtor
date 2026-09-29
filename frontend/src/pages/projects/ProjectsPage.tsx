import { useEffect, useMemo, useState } from 'react';
import { Link, useSearch } from 'wouter';
import { apiFetch, type Project } from '@/lib/api';
import { PageHero, ProjectCard, cardGrid } from '@/components/blocks';
import { PropertySearch } from '@/components/property-search';
import { clearSearchHref, hasPropertySearch, matchesProjectSearch, parsePropertySearch } from '@/lib/property-search';
import { defaultProjects } from '@/lib/site-data';
import { AppliedFilters, ErrorState } from '@/pages/shared/listing-helpers';

const isNewLaunch = (project: Project) => /launching|new/i.test(project.status ?? '');

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
        image="https://res.cloudinary.com/complaintreview/image/upload/v1790577271/knc-horizon/hero/dubai-new-towers-aerial.jpg"
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
