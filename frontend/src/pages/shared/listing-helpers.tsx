/*
 * What the listing pages have in common: how a price and a property card are written, the
 * chosen-filters strip, and the loading and error states. Used by the pages under
 * properties/, projects/, communities/, blog/ and developers/.
 */
import { type ReactNode } from 'react';
import { Link } from 'wouter';
import { type RemoteProperty } from '@/lib/api';
import { describeSearch, parsePropertySearch } from '@/lib/property-search';
import { type Property } from '@/lib/site-data';

export const price = (value: number, currency = 'AED') => `${currency} ${new Intl.NumberFormat('en-AE').format(value)}`;

export const propertyCard = (item: RemoteProperty, currency = 'AED'): Property => ({
  id: item.id,
  slug: item.slug,
  title: item.title,
  location: item.location,
  type: item.type,
  price: price(item.price, item.currency || currency),
  details: `${item.bedrooms} beds · ${item.bathrooms} baths · ${new Intl.NumberFormat('en-AE').format(item.size)} sq ft`,
  image: item.images[0] || 'https://res.cloudinary.com/complaintreview/image/upload/v1790577279/knc-horizon/pages/dubai-skyline-from-sea.jpg',
  imageAlt: item.coverImageAlt || undefined,
  note: item.status,
});

/** The filters the client chose, spelled out, so a search stays readable after it runs. */
export function AppliedFilters({ query, onClear, count }: { query: ReturnType<typeof parsePropertySearch>; onClear: string; count: ReactNode }) {
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

export const isOffPlan = (item: RemoteProperty) => /off-plan|launching|construction/i.test(item.status ?? '');

export function LoadingState() {
  return (
    <div className="py-16 text-center">
      <p className="eyebrow text-[#9f7a47]">KNC Horizon</p>
      <p className="block-title mt-4 text-[#2b3242]">Curating the latest edit…</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-[#9f7a47]/30 bg-[#8f6d3f]/10 p-6 text-sm leading-7 text-[#2b3242]/70 sm:p-7" role="alert">
      We couldn’t load this section. {message}
    </div>
  );
}
