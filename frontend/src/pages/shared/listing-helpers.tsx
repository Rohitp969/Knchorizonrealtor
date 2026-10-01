/*
 * What the listing pages have in common: how a price and a property card are written, the
 * chosen-filters strip, and the loading and error states. Used by the pages under
 * properties/, projects/, communities/, blog/ and developers/.
 */
import { type ReactNode } from 'react';
import { Link } from 'wouter';
import { type GalleryImage, type RemoteProperty } from '@/lib/api';
import { hasRepresentativePhotos, photoCredits, propertyDetails, propertyPriceLabel, verifiedDate } from '@/lib/listing-format';
import { describeSearch, isOffPlanStatus, parsePropertySearch } from '@/lib/property-search';
import { type Property } from '@/lib/site-data';

export const price = (value: number, currency = 'AED') => `${currency} ${new Intl.NumberFormat('en-AE').format(value)}`;

export const propertyCard = (item: RemoteProperty, currency = 'AED'): Property => ({
  id: item.id,
  slug: item.slug,
  title: item.title,
  location: item.location,
  type: item.type,
  price: propertyPriceLabel(item, currency),
  details: propertyDetails(item),
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

export const isOffPlan = (item: RemoteProperty) => isOffPlanStatus(item.status);

/*
 * Under a listing's facts: where they came from and when they were checked. A listing with a
 * source says so and links to it; one without (entered by hand, nothing to point to) keeps the
 * plain "indicative" wording. Either way the visitor is told the figures can change and that
 * KNC Horizon Realtor confirms them on enquiry.
 */
export function SourceNote({ developer, sourceUrl, sourceName, verifiedOn, rental = false }: { developer?: string; sourceUrl?: string; sourceName?: string; verifiedOn?: string; /** A home or office offered for rent by its landlord, rather than sold by its developer. */ rental?: boolean }) {
  const checked = verifiedDate(verifiedOn);
  if (!sourceUrl) {
    return (
      <p className="mt-4 text-xs leading-5 text-[#2b3242]/55" data-testid="note-indicative">
        Prices and dates are indicative and change with each release. Contact KNC Horizon Realtor for current availability and pricing.
      </p>
    );
  }
  return (
    <p className="mt-4 text-xs leading-5 text-[#2b3242]/60" data-testid="note-verified-source">
      {developer ? (rental ? `Offered for rent by ${developer}. ` : `Developed and marketed by ${developer}. `) : ''}
      Details as published on{' '}
      <a href={sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-[#9f7a47] underline underline-offset-2" data-testid="link-verified-source">
        {sourceName || 'the developer’s website'}
      </a>
      {checked ? `, checked on ${checked}` : ''}. They are {rental ? 'the landlord’s' : 'the developer’s'} figures and can change at any time; contact KNC Horizon Realtor for current availability and pricing.
    </p>
  );
}

/** Who took the photos, and a plain statement of what a "Representative image" is. */
export function ImageCredits({ cover, gallery, coverRepresentative, subject }: { cover?: { credit?: string; sourceUrl?: string }; gallery?: GalleryImage[]; coverRepresentative?: boolean; subject: string }) {
  const credits = photoCredits(cover, gallery);
  const representative = hasRepresentativePhotos(coverRepresentative, gallery);
  if (!credits.length && !representative) return null;
  return (
    <p className="mt-4 text-xs leading-5 text-[#2b3242]/55" data-testid="text-image-credits">
      {credits.length > 0 && (
        <>
          Photos:{' '}
          {credits.map((entry, index) => (
            <span key={entry.credit}>
              {index > 0 && ', '}
              {entry.sourceUrl
                ? <a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2 hover:text-[#9f7a47]">{entry.credit}</a>
                : entry.credit}
            </span>
          ))}
          .{' '}
        </>
      )}
      {representative && `Photos marked “Representative image” are real photographs of the area or of a comparable place in Dubai, not of ${subject}.`}
    </p>
  );
}

/** Above the closest matches, when the search itself matched nothing: says how it was widened. */
export function NearestMatchesNote({ ignored, noun }: { ignored: string[]; noun: string }) {
  const setAside = ignored.length > 1 ? `${ignored.slice(0, -1).join(', ')} and ${ignored[ignored.length - 1]}` : ignored[0];
  return (
    <div className="mb-8 rounded-2xl border border-[#d9c6a4]/70 bg-[#fffdf8] px-5 py-4 text-sm leading-7 text-[#2b3242]/80" data-testid="nearest-matches-note">
      <p>
        <span className="font-semibold text-[#2b3242]">No exact match for this search.</span>{' '}
        These are the closest {noun} we have, with the {setAside} set aside.{' '}
        <Link href="/contact" className="text-[#9f7a47] underline underline-offset-4">Share your brief</Link>
        {' '}and an advisor will find more.
      </p>
    </div>
  );
}

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
