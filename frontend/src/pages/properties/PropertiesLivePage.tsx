import { useEffect, useMemo, useState } from 'react';
import { Link, useSearch } from 'wouter';
import { apiFetch, type RemoteProperty } from '@/lib/api';
import { PageHero, PropertyCard, cardGrid } from '@/components/blocks';
import { PropertySearch } from '@/components/property-search';
import { clearSearchHref, hasPropertySearch, matchesPropertySearch, parsePropertySearch } from '@/lib/property-search';
import { defaultRemoteProperties } from '@/lib/site-data';
import { useSiteSettings } from '@/lib/site-settings';
import { isOffPlan, AppliedFilters, LoadingState, ErrorState, propertyCard } from '@/pages/shared/listing-helpers';

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
        image="https://res.cloudinary.com/complaintreview/image/upload/v1790577268/knc-horizon/hero/downtown-safa-park.jpg"
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
