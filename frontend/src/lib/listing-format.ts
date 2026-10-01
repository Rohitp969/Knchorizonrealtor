/*
 * How a listing's facts are written on cards and detail pages.
 *
 * One rule runs through all of it: a figure the developer has not published is never shown
 * as a number. A price of 0 reads "Price on request", an empty handover is left out, and a
 * bedroom count of 0 is only called a studio when the listing says it is one.
 */
import type { GalleryImage, Project, RemoteProperty } from '@/lib/api';

const number = new Intl.NumberFormat('en-AE');

export const PRICE_ON_REQUEST = 'Price on request';

/** "AED 1,050,000", "From AED 1,050,000", or "Price on request" when there is no figure. */
export function priceLabel(value: number | null | undefined, currency = 'AED', from = false) {
  const amount = Number(value) || 0;
  if (amount <= 0) return PRICE_ON_REQUEST;
  return `${from ? 'From ' : ''}${currency} ${number.format(amount)}`;
}

/** A project's price is always a developer's starting price. */
export const projectPriceLabel = (project: Pick<Project, 'startingPrice'>, currency = 'AED') =>
  priceLabel(project.startingPrice, currency, true);

/** A listing offered for rent, from its listing type or, on older records, its status. */
export function isRental(item: Pick<RemoteProperty, 'listingType' | 'status'>) {
  return String(item.listingType ?? '').toLowerCase() === 'rent' || /\b(rent|lease)/i.test(item.status ?? '');
}

/** A sale price as it stands; a rent with "/ year", which is how Dubai rents are quoted. */
export function propertyPriceLabel(item: Pick<RemoteProperty, 'price' | 'currency' | 'priceFrom' | 'listingType' | 'status'>, currency = 'AED') {
  const label = priceLabel(item.price, item.currency || currency, item.priceFrom === true);
  return label !== PRICE_ON_REQUEST && isRental(item) ? `${label} / year` : label;
}

/** "Studio", "1 bed", "1 to 3 beds"; empty when the listing records no bedrooms (an office). */
export function bedroomsLabel(item: Pick<RemoteProperty, 'bedrooms' | 'bedroomsMax' | 'title'>, long = false) {
  const beds = Number(item.bedrooms) || 0;
  const top = Number(item.bedroomsMax) || 0;
  const word = (count: number) => (long ? (count === 1 ? 'bedroom' : 'bedrooms') : count === 1 ? 'bed' : 'beds');
  if (top > beds) return `${beds === 0 ? 'Studio' : beds} to ${top} ${word(top)}`;
  if (beds > 0) return `${beds} ${word(beds)}`;
  return /\bstudio\b/i.test(item.title ?? '') ? 'Studio' : '';
}

/** The line under a property's title: only the figures the listing actually holds. */
export function propertyDetails(item: Pick<RemoteProperty, 'bedrooms' | 'bedroomsMax' | 'bathrooms' | 'size' | 'title' | 'type'>) {
  const baths = Number(item.bathrooms) || 0;
  const size = Number(item.size) || 0;
  const parts = [
    bedroomsLabel(item),
    baths > 0 ? `${baths} ${baths === 1 ? 'bath' : 'baths'}` : '',
    size > 0 ? `${number.format(size)} sq ft` : '',
  ].filter(Boolean);
  return parts.join(' · ') || item.type || '';
}

/**
 * Whether a project's name already says where it is. A master community is named after its
 * place ("Dubai Creek Harbour", "Palm Jebel Ali Villas"), and repeating the location beside
 * such a name only says the same thing twice.
 */
export function titleNamesPlace(project: Pick<Project, 'title' | 'location'>) {
  const place = (project.location ?? '').trim().toLowerCase();
  return Boolean(place) && (project.title ?? '').toLowerCase().includes(place);
}

/** The second half of a project card's eyebrow: its location, or its kind when the name is the place. */
export function projectPlaceLine(project: Pick<Project, 'title' | 'location' | 'category'>) {
  return titleNamesPlace(project) ? (project.category ?? '').trim() : (project.location ?? '').trim();
}

/** "2026-10-01" -> "1 October 2026"; empty for anything that is not a plain date. */
export function verifiedDate(iso: string | null | undefined) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export type PhotoCredit = { credit: string; sourceUrl?: string };

/** The photographers behind a listing's cover and gallery, each named once, in page order. */
export function photoCredits(
  cover: { credit?: string; sourceUrl?: string } | undefined,
  gallery: GalleryImage[] | undefined,
): PhotoCredit[] {
  const seen = new Set<string>();
  const credits: PhotoCredit[] = [];
  for (const image of [cover, ...(gallery ?? [])]) {
    const credit = image?.credit?.trim();
    if (!credit || seen.has(credit)) continue;
    seen.add(credit);
    credits.push({ credit, sourceUrl: image?.sourceUrl || undefined });
  }
  return credits;
}

/** True when any photo of the listing stands in for it rather than showing it. */
export function hasRepresentativePhotos(coverRepresentative: boolean | undefined, gallery: GalleryImage[] | undefined) {
  return coverRepresentative === true || Boolean(gallery?.some((image) => image.representative === true));
}
