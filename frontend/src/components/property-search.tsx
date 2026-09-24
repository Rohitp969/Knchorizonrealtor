import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { useLocation } from 'wouter';

import { apiFetch } from '@/lib/api';
import { SelectField, type SelectOption } from '@/components/select-field';
import { defaultProjects, defaultRemoteProperties } from '@/lib/site-data';
import {
  EMPTY_PROPERTY_SEARCH,
  EMPTY_SEARCH_OPTIONS,
  LISTING_MODES,
  MODE_LABELS,
  categoryOf,
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

const cell = 'border-b border-[#202635]/10 lg:border-b-0 lg:border-r';

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
  const labels = MODE_LABELS[listing];
  const budget = query.minPrice || query.maxPrice ? `${query.minPrice}-${query.maxPrice}` : '';

  const rows = useSearchRows();
  const options = useMemo(
    () => (rows.length ? searchOptions(rows, { ...query, listing }) : EMPTY_SEARCH_OPTIONS),
    [rows, query, listing],
  );

  const set = (key: keyof PropertySearchQuery, value: string) =>
    // Picking a category swaps the type list underneath, so a type from the old one is dropped.
    setQuery((current) => ({
      ...current,
      listing,
      [key]: value,
      ...(key === 'category' ? { type: '' } : null),
    }));

  // The narrow fields mean different things per mode, so they never carry across.
  const chooseListing = (mode: ListingMode) =>
    setQuery((current) =>
      mode === listing
        ? current
        : { ...current, listing: mode, type: '', minPrice: '', maxPrice: '', beds: '', baths: '', handover: '', project: '' },
    );

  const chooseBudget = (value: string) => {
    const [minPrice = '', maxPrice = ''] = value.split('-');
    setQuery((current) => ({ ...current, listing, minPrice, maxPrice }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(propertySearchHref({ ...query, listing }));
  };

  const plain = (list: { value: string; label: string }[]): SelectOption[] =>
    list.map((option) => ({ value: option.value, label: option.label }));

  const offPlan = listing === 'offplan';

  return (
    <form role="search" aria-label="Search properties" onSubmit={submit} className={className} data-testid="form-property-search">
     <div className={`overflow-visible ${styles.shell}`}>
      <div className={`flex items-stretch border-b ${styles.bar}`}>
        <div className="flex w-full items-stretch" role="group" aria-label="What are you looking for">
          {LISTING_MODES.map((mode, index) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => chooseListing(mode.value)}
              aria-pressed={listing === mode.value}
              className={`search-tab flex-1 px-3 py-3.5 font-mono text-[10px] uppercase tracking-[.14em] sm:flex-none sm:px-8 ${index ? 'border-l border-[#202635]/10' : ''} ${listing === mode.value ? styles.activeTab : styles.tab}`}
              data-testid={`button-search-${mode.value}`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phones: location on its own row, then 2-up. Desktop: a single bar. */}
      <div className={`grid grid-cols-2 text-[#202635] lg:grid-cols-[1.15fr_1fr_1fr_1fr_1fr_auto] ${styles.panel}`}>
        <SelectField
          label="Location"
          placeholder="All locations"
          value={query.location}
          options={plain(options.locations)}
          onChange={(value) => set('location', value)}
          testId="select-search-location"
          className={`col-span-2 ${cell} lg:col-span-1`}
        />

        <SelectField
          label={labels.category}
          placeholder={labels.anyCategory}
          value={query.category}
          options={plain(options.categories)}
          onChange={(value) => set('category', value)}
          testId="select-search-category"
          className={`${cell} border-r`}
        />

        <SelectField
          label={labels.type}
          placeholder={labels.anyType}
          value={query.type}
          options={plain(options.types)}
          onChange={(value) => set('type', value)}
          testId="select-search-type"
          className={cell}
        />

        <SelectField
          label={labels.budget}
          placeholder="All budgets"
          value={budget}
          options={plain(options.budgets)}
          onChange={chooseBudget}
          testId="select-search-budget"
          className={`${cell} border-r`}
        />

        <SelectField
          label={labels.fourth}
          placeholder={labels.anyFourth}
          value={offPlan ? query.handover : query.beds}
          options={plain(options.fourth)}
          onChange={(value) => set(offPlan ? 'handover' : 'beds', value)}
          testId="select-search-beds"
          className={cell}
        />

        <button
          type="submit"
          className="search-submit col-span-2 m-2.5 flex min-h-[3rem] items-center justify-center gap-3 rounded-sm bg-[#d9c6a4] px-6 font-mono text-[10px] uppercase tracking-[.14em] text-[#202635] hover:bg-[#c97352] hover:text-[#f5f0e6] focus-visible:bg-[#c97352] focus-visible:text-[#f5f0e6] focus-visible:outline-none lg:col-span-1 lg:my-2.5 lg:ml-1 lg:px-9"
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
