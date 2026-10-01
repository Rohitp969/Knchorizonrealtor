import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { apiFetch, type RemoteProperty } from '@/lib/api';
import { PageHero, PropertyCard, cardGrid, SectionBreak } from '@/components/blocks';
import { OFF_PLAN_CHIP, clearSearchHref, hasPropertySearch, matchesPropertySearch, nearestMatches, parsePropertySearch, propertySearchHref } from '@/lib/property-search';
import { defaultRemoteProperties } from '@/lib/site-data';
import { useSiteSettings } from '@/lib/site-settings';
import { isOffPlan, AppliedFilters, LoadingState, ErrorState, NearestMatchesNote, propertyCard } from '@/pages/shared/listing-helpers';

export function PropertiesLivePage() {
  const { defaultCurrency } = useSiteSettings();
  const [items, setItems] = useState<RemoteProperty[]>(defaultRemoteProperties as unknown as RemoteProperty[]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [, navigate] = useLocation();
  const search = useSearch();
  const query = useMemo(() => parsePropertySearch(search), [search]);
  const searching = hasPropertySearch(query);

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

  /*
   * The type chips and the search bar's "Property type" are one control. Both read the type
   * from the URL and a chip writes it back there, so the two can never disagree: choosing
   * Townhouse on the chips is the same as choosing it in the bar. A chip is counted against
   * the rest of the search (location, budget, bedrooms...) and only offered when something
   * is behind it, so no chip leads to an empty page.
   */
  const inSearch = useMemo(() => items.filter((item) => matchesPropertySearch(item, { ...query, type: '' })), [items, query]);
  const chips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of inSearch) {
      const type = item.type?.trim();
      if (type) counts.set(type, (counts.get(type) ?? 0) + 1);
    }
    const types = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([type]) => type);
    const list = ['All', ...types, ...(inSearch.some(isOffPlan) ? [OFF_PLAN_CHIP] : [])];
    // The type in the URL stays visible even when nothing is behind it any more, so the
    // visitor sees what is applied and can step back to All.
    return query.type && !list.some((chip) => chip.toLowerCase() === query.type.toLowerCase()) ? [...list, query.type] : list;
  }, [inSearch, query.type]);
  const active = chips.find((chip) => chip.toLowerCase() === query.type.toLowerCase()) ?? 'All';
  const chooseChip = (chip: string) =>
    // Same page, only the type changes: the URL is replaced in place and the page does not jump.
    navigate(propertySearchHref({ ...query, type: chip === 'All' ? '' : chip }).replace(/#results$/, ''), { replace: true });

  const exact = useMemo(() => items.filter((item) => matchesPropertySearch(item, query)), [items, query]);
  // A search that matches nothing still leads somewhere: the closest properties, with a note
  // saying how the search was widened.
  const nearest = useMemo(
    () => (searching && exact.length === 0 ? nearestMatches(items, query, matchesPropertySearch) : { items: [] as RemoteProperty[], ignored: [] as string[] }),
    [items, query, searching, exact.length],
  );
  const shown = exact.length ? exact : nearest.items;

  return (
    <main>
      <PageHero
        label="The live property edit"
        title={
          <>
            Places worth<SectionBreak />
            <em className="text-[#9f7a47]">your attention.</em>
          </>
        }
        copy="A considered selection of Dubai homes and opportunities, updated from our live property collection."
        image="https://res.cloudinary.com/complaintreview/image/upload/v1790577268/knc-horizon/hero/downtown-safa-park.jpg"
      />
      {/*
       * The search bar lives on the home page only. Its link ends in #results, so a search
       * lands straight here: the type chips, the chosen filters and the matching properties,
       * just under the fixed header.
       */}
      <section className="bg-[#faf7f1] site-section">
        <div id="results" className="site-container scroll-mt-[calc(var(--header-h)+1.5rem)]">
          <div className="flex flex-wrap gap-2 border-b border-[#2b3242]/15 pb-6" role="group" aria-label="Property type">
            {chips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => chooseChip(chip)}
                aria-pressed={active === chip}
                className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[.13em] transition-colors ${
                  active === chip
                    ? 'bg-[#2b3242] text-[#faf7f1]'
                    : 'border border-[#2b3242]/20 text-[#2b3242]/60 hover:border-[#9f7a47] hover:text-[#9f7a47]'
                }`}
                data-testid={`chip-type-${chip.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              >
                {chip}
              </button>
            ))}
          </div>
          {searching && !loading && (
            <AppliedFilters
              query={query}
              onClear={clearSearchHref(query)}
              count={
                <span data-testid="text-search-count">
                  {exact.length
                    ? `${exact.length} ${exact.length === 1 ? 'property matches' : 'properties match'} your search`
                    : nearest.items.length
                      ? `No exact match · ${nearest.items.length} closest ${nearest.items.length === 1 ? 'property' : 'properties'}`
                      : 'No exact match'}
                </span>
              }
            />
          )}
          {/* What a "From" price is, said once above the cards. */}
          {shown.some((item) => item.priceFrom) && (
            <p className="measure mt-6 text-xs leading-5 text-[#2b3242]/60" data-testid="note-starting-prices">
              Prices marked “From” are the starting prices or rents that the developer or landlord publishes for a home type, an office or a building, not a quote for one unit. Rents are per year. Each page names its source and the day it was checked.
            </p>
          )}
          <div className="mt-12">
            {loading ? (
              <LoadingState />
            ) : error && shown.length === 0 ? (
              <ErrorState message={error} />
            ) : shown.length === 0 ? (
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
              <>
                {exact.length === 0 && <NearestMatchesNote ignored={nearest.ignored} noun="properties" />}
                <div className={cardGrid(shown.length)}>
                  {shown.map((item) => (
                    <PropertyCard key={item.id} property={propertyCard(item, defaultCurrency)} featured={false} />
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
