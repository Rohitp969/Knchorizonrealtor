import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useLocation } from 'wouter';

import { apiFetch } from '@/lib/api';
import { defaultProjects, defaultRemoteProperties } from '@/lib/site-data';
import {
  EMPTY_PROPERTY_SEARCH,
  EMPTY_SEARCH_OPTIONS,
  categoryOf,
  LISTING_MODES,
  MODE_LABELS,
  propertySearchHref,
  rowsFromProjects,
  rowsFromProperties,
  searchOptions,
  type ListingMode,
  type PropertySearchQuery,
  type SearchRow,
} from '@/lib/property-search';

/*
 * The dropdowns list the whole Dubai catalogue, so a client can search for any category they
 * have in mind. These rows are what gives each option its live count, and merges in anything
 * an admin has published that the catalogue does not already name. One fetch per page load is
 * enough and the result is shared by the hero and the listing bars; if the call fails the
 * same rows are derived from the listings bundled with the site.
 */
const fallbackRows = (): SearchRow[] => [
  ...rowsFromProperties(defaultRemoteProperties as never),
  ...rowsFromProjects(defaultProjects as never),
];
let rowsPromise: Promise<SearchRow[]> | null = null;

function useSearchRows(): SearchRow[] {
  const [rows, setRows] = useState<SearchRow[]>(fallbackRows);
  useEffect(() => {
    rowsPromise ??= apiFetch<{ listings: SearchRow[] }>('/public/property-filters')
      // The category taxonomy lives here, not in the API, so it is applied on arrival.
      // The API sends raw records; the taxonomy and the off-plan slots are applied here.
      .then((data) => (data.listings?.length
        ? data.listings.map((row) => (row.mode === 'offplan'
            ? { ...row, developer: row.developer || row.category || '', category: row.developer || row.category || '' }
            : { ...row, developer: '', category: categoryOf(row.type) ?? '' }))
        : fallbackRows()))
      .catch(() => fallbackRows());
    let live = true;
    rowsPromise.then((next) => { if (live) setRows(next); });
    return () => { live = false; };
  }, []);
  return rows;
}

const tones = {
  // On the dark hero photograph. One cream panel end to end: a separate dark tab strip
  // read as part of the photo rather than part of the search.
  dark: {
    shell: 'rounded-xl bg-[#f8f5ee] shadow-[0_30px_70px_-26px_rgba(8,10,18,.8)]',
    bar: 'border-[#202635]/10 bg-transparent text-[#202635]',
    tab: 'text-[#202635]/55 hover:text-[#202635]',
    activeTab: 'text-[#202635] shadow-[inset_0_-2px_0_#202635]',
    panel: 'bg-transparent',
  },
  // On cream page sections
  light: {
    shell: 'rounded-sm border border-[#202635]/12 shadow-[0_18px_46px_-30px_rgba(32,38,53,.5)]',
    bar: 'border-[#f5f0e6]/12 bg-[#202635] text-[#f5f0e6]',
    tab: 'text-[#f5f0e6]/60 hover:text-[#f5f0e6]',
    activeTab: 'bg-white text-[#202635]',
    panel: 'bg-white',
  },
};

const selectClass = 'w-full min-w-0 cursor-pointer appearance-none truncate bg-transparent pr-6 text-sm text-[#202635] outline-none';

function SearchField({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={`flex min-w-0 cursor-pointer flex-col justify-center gap-1 border-[#202635]/10 px-4 py-3 transition-colors focus-within:bg-[#202635]/[.04] focus-within:shadow-[inset_0_-2px_0_#c97352] md:px-5 md:py-3.5 ${className}`}>
      <span className="font-mono text-[10px] uppercase tracking-[.16em] text-[#202635]/50">{label}</span>
      <span className="relative flex items-center">
        {children}
        <ChevronDown size={14} aria-hidden="true" className="pointer-events-none absolute right-0 text-[#202635]/45" />
      </span>
    </label>
  );
}

export function PropertySearch({
  initial,
  tone = 'dark',
  className = '',
}: {
  initial?: PropertySearchQuery;
  tone?: keyof typeof tones;
  className?: string;
}) {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState<PropertySearchQuery>(() => ({ ...EMPTY_PROPERTY_SEARCH, ...initial }));
  const styles = tones[tone];
  const listing: ListingMode = query.listing || 'buy';
  const budget = query.minPrice || query.maxPrice ? `${query.minPrice}-${query.maxPrice}` : '';

  const rows = useSearchRows();
  const labels = MODE_LABELS[listing];
  const options = useMemo(
    () => (rows.length ? searchOptions(rows, { ...query, listing }) : EMPTY_SEARCH_OPTIONS),
    [rows, query, listing],
  );

  const update = (key: keyof PropertySearchQuery) => (event: ChangeEvent<HTMLSelectElement>) =>
    // Picking a category swaps the type list underneath, so a type from the old one is dropped.
    setQuery((current) => ({
      ...current,
      listing,
      [key]: event.target.value,
      ...(key === 'category' ? { type: '' } : null),
    }));

  // The narrow fields mean different things per mode, so they never carry across.
  const chooseListing = (mode: ListingMode) =>
    setQuery((current) =>
      mode === listing
        ? current
        : { ...current, listing: mode, type: '', minPrice: '', maxPrice: '', beds: '', handover: '' },
    );

  const chooseBudget = (event: ChangeEvent<HTMLSelectElement>) => {
    const [minPrice = '', maxPrice = ''] = event.target.value.split('-');
    setQuery((current) => ({ ...current, listing, minPrice, maxPrice }));
  };


  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(propertySearchHref({ ...query, listing }));
  };

  return (
    <form role="search" aria-label="Search properties" onSubmit={submit} className={className} data-testid="form-property-search">
     <div className={`overflow-hidden ${styles.shell}`}>
      <div className={`flex items-stretch justify-between gap-2 border-b ${styles.bar}`}>
        <div className="flex items-stretch" role="group" aria-label="What are you looking for">
          {LISTING_MODES.map((mode, index) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => chooseListing(mode.value)}
              aria-pressed={listing === mode.value}
              className={`px-4 py-3.5 font-mono text-[10px] uppercase tracking-[.14em] transition-colors sm:px-7 ${index ? 'border-l border-[#202635]/10' : ''} ${listing === mode.value ? styles.activeTab : styles.tab}`}
              data-testid={`button-search-${mode.value}`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phones: location on its own row, then 2-up. Desktop: a single bar. */}
      <div className={`grid grid-cols-2 text-[#202635] lg:grid-cols-[1.2fr_.9fr_1fr_1fr_.85fr_auto] ${styles.panel}`}>
        <SearchField label="Location" className="col-span-2 border-b lg:col-span-1 lg:border-b-0 lg:border-r">
          <select value={query.location} onChange={update('location')} className={selectClass} data-testid="select-search-location">
            <option value="">All locations</option>
            {options.locations.map((place) => (
              <option key={place.value} value={place.value}>{place.label}</option>
            ))}
          </select>
        </SearchField>

        <SearchField label={labels.category} className="border-b border-r lg:border-b-0">
          <select value={query.category} onChange={update('category')} className={selectClass} data-testid="select-search-category">
            <option value="">{labels.anyCategory}</option>
            {options.categories.map((category) => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
        </SearchField>

        <SearchField label={labels.type} className="border-b lg:border-b-0 lg:border-r">
          <select value={query.type} onChange={update('type')} className={selectClass} data-testid="select-search-type">
            <option value="">{labels.anyType}</option>
            {options.types.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </SearchField>

        <SearchField label={labels.budget} className="border-b lg:border-b-0 lg:border-r">
          <select value={budget} onChange={chooseBudget} className={selectClass} data-testid="select-search-budget">
            <option value="">All budgets</option>
            {options.budgets.map((range) => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </SearchField>

        <SearchField label={labels.fourth}>
          <select
            value={listing === 'offplan' ? query.handover : query.beds}
            onChange={update(listing === 'offplan' ? 'handover' : 'beds')}
            className={selectClass}
            data-testid="select-search-beds"
          >
            <option value="">{labels.anyFourth}</option>
            {options.fourth.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </SearchField>

        <button
          type="submit"
          className="col-span-2 m-2 flex items-center justify-center gap-3 rounded-lg bg-[#d9c6a4] lg:col-span-1 px-6 py-4 font-mono text-[10px] uppercase tracking-[.14em] text-[#202635] transition-colors hover:bg-[#c97352] hover:text-[#f5f0e6] focus-visible:bg-[#c97352] focus-visible:text-[#f5f0e6] focus-visible:outline-none lg:px-10"
          data-testid="button-search-submit"
        >
          <Search size={15} aria-hidden="true" />
          Search
        </button>
      </div>
     </div>
    </form>
  );
}
