import type { Project, RemoteProperty } from '@/lib/api';

/*
 * Property search shared by the home hero, the /properties listing and the off-plan page.
 * The hero only builds a URL; the listing pages read the same URL and filter against it.
 *
 * /properties?listing=buy&location=Dubai+Marina&category=Residential&type=Villa&minPrice=5000000&beds=3
 * /off-plan?listing=offplan&location=Dubailand&type=Emaar&minPrice=5000000&handover=2028
 *
 * Every option is read off the published collection, so nothing in a dropdown can come back
 * empty, and the lists narrow against each other as choices are made. Anything an admin
 * publishes appears here on its own; anything unpublished or deleted disappears the same way.
 *
 * Off-plan searches projects rather than properties: its category and bedroom fields become a
 * developer and a handover year, and its property type reads the project's own unit mix.
 */

export type ListingMode = 'buy' | 'rent' | 'offplan';

export const LISTING_MODES: { value: ListingMode; label: string }[] = [
  { value: 'buy', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
  { value: 'offplan', label: 'Off-plan' },
];

export type PropertySearchQuery = {
  listing: ListingMode | '';
  location: string;
  category: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  beds: string;
  handover: string;
};

export const EMPTY_PROPERTY_SEARCH: PropertySearchQuery = {
  listing: '',
  location: '',
  category: '',
  type: '',
  minPrice: '',
  maxPrice: '',
  beds: '',
  handover: '',
};

/* ------------------------------------------------------------------ the catalogue --- */

/** Categories, and the property types that sit under each. */
export const SEARCH_CATEGORIES: { value: string; types: string[] }[] = [
  {
    value: 'Residential',
    types: ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Duplex', 'Loft', 'Compound', 'Whole Building', 'Residential Plot'],
  },
  {
    value: 'Commercial',
    types: ['Office', 'Retail', 'Shop', 'Showroom', 'Warehouse', 'Staff Accommodation', 'Commercial Plot'],
  },
];

// Rent budgets are annual, which is how Dubai rents are quoted; off-plan budgets track the
// starting price of a unit, which sits lower than completed stock.
export const SEARCH_BUDGETS: Record<ListingMode, { label: string; min?: number; max?: number }[]> = {
  buy: [
    { label: 'Under AED 1M', max: 1_000_000 },
    { label: 'AED 1M – 2M', min: 1_000_000, max: 2_000_000 },
    { label: 'AED 2M – 5M', min: 2_000_000, max: 5_000_000 },
    { label: 'AED 5M – 10M', min: 5_000_000, max: 10_000_000 },
    { label: 'AED 10M – 20M', min: 10_000_000, max: 20_000_000 },
    { label: 'AED 20M – 50M', min: 20_000_000, max: 50_000_000 },
    { label: 'AED 50M+', min: 50_000_000 },
  ],
  rent: [
    { label: 'Under AED 50K', max: 50_000 },
    { label: 'AED 50K – 100K', min: 50_000, max: 100_000 },
    { label: 'AED 100K – 200K', min: 100_000, max: 200_000 },
    { label: 'AED 200K – 350K', min: 200_000, max: 350_000 },
    { label: 'AED 350K – 500K', min: 350_000, max: 500_000 },
    { label: 'AED 500K – 1M', min: 500_000, max: 1_000_000 },
    { label: 'AED 1M+', min: 1_000_000 },
  ],
  offplan: [
    { label: 'Under AED 1M', max: 1_000_000 },
    { label: 'AED 1M – 1.5M', min: 1_000_000, max: 1_500_000 },
    { label: 'AED 1.5M – 3M', min: 1_500_000, max: 3_000_000 },
    { label: 'AED 3M – 5M', min: 3_000_000, max: 5_000_000 },
    { label: 'AED 5M – 10M', min: 5_000_000, max: 10_000_000 },
    { label: 'AED 10M+', min: 10_000_000 },
  ],
};

/** The fields mean different things per mode, so each one is labelled per mode. */
export type ModeLabels = { category: string; anyCategory: string; type: string; anyType: string; budget: string; fourth: string; anyFourth: string };

export const MODE_LABELS: Record<ListingMode, ModeLabels> = {
  buy: { category: 'Category', anyCategory: 'All categories', type: 'Property type', anyType: 'All types', budget: 'Budget', fourth: 'Bedrooms', anyFourth: 'All bedrooms' },
  rent: { category: 'Category', anyCategory: 'All categories', type: 'Property type', anyType: 'All types', budget: 'Budget / year', fourth: 'Bedrooms', anyFourth: 'All bedrooms' },
  offplan: { category: 'Developer', anyCategory: 'All developers', type: 'Property type', anyType: 'All types', budget: 'Budget / from', fourth: 'Handover', anyFourth: 'All handovers' },
};

/** A readable line for a search, so the filters stay legible on the results page. */
export function describeSearch(query: PropertySearchQuery): { label: string; value: string }[] {
  const mode: ListingMode = query.listing || 'buy';
  const labels = MODE_LABELS[mode];
  const band = SEARCH_BUDGETS[mode].find(
    (entry) => String(entry.min ?? '') === query.minPrice && String(entry.max ?? '') === query.maxPrice,
  );
  const bedLabel = query.beds === 'studio' ? 'Studio' : query.beds ? `${query.beds}+ ${query.beds === '1' ? 'bed' : 'beds'}` : '';
  return [
    { label: 'Looking to', value: mode === 'offplan' ? 'Buy off-plan' : mode === 'rent' ? 'Rent' : 'Buy' },
    { label: 'Location', value: query.location },
    { label: labels.category, value: query.category },
    { label: labels.type, value: query.type },
    { label: labels.budget, value: band?.label ?? '' },
    { label: labels.fourth, value: mode === 'offplan' ? query.handover : bedLabel },
  ].filter((entry) => entry.value);
}

/** Which category a property type belongs to; unknown types stay in every category. */
export function categoryOf(type: string): string | undefined {
  const wanted = type.trim().toLowerCase();
  return SEARCH_CATEGORIES.find((category) => category.types.some((name) => name.toLowerCase() === wanted))?.value;
}

/* ---------------------------------------------------------------------- URL state --- */

export function parsePropertySearch(search: string): PropertySearchQuery {
  const params = new URLSearchParams(search);
  const listing = params.get('listing');
  return {
    listing: listing === 'buy' || listing === 'rent' || listing === 'offplan' ? listing : '',
    location: params.get('location') ?? '',
    category: params.get('category') ?? '',
    type: params.get('type') ?? '',
    minPrice: params.get('minPrice') ?? '',
    maxPrice: params.get('maxPrice') ?? '',
    beds: params.get('beds') ?? '',
    handover: params.get('handover') ?? '',
  };
}

export function hasPropertySearch(query: PropertySearchQuery) {
  return Object.values(query).some(Boolean);
}

/** Off-plan searches land on the projects page; everything else on the property listing. */
export function propertySearchHref(query: PropertySearchQuery) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const search = params.toString();
  const path = query.listing === 'offplan' ? '/off-plan' : '/properties';
  return `${path}${search ? `?${search}` : ''}#results`;
}

/** Where "clear filters" goes back to, for the page the search landed on. */
export function clearSearchHref(query: PropertySearchQuery) {
  return query.listing === 'offplan' ? '/off-plan' : '/properties';
}

/* ------------------------------------------------------------- options and counts --- */

export type SearchRow = {
  mode: ListingMode;
  location: string;
  /** Residential or Commercial on buy and rent; the developer on off-plan. */
  category: string;
  /** The property type on buy and rent; the project's unit mix on off-plan. */
  type: string;
  /** Off-plan only: the developer, which takes the place of a category. */
  developer: string;
  beds: number;
  handover: string;
  price: number;
};

export type Option = { value: string; label: string; count: number };

export type SearchOptions = {
  total: number;
  locations: Option[];
  categories: Option[];
  /** Property types on buy and rent, developers on off-plan. */
  types: Option[];
  budgets: Option[];
  /** Bedroom steps on buy and rent, handover windows on off-plan. */
  fourth: Option[];
};

export const EMPTY_SEARCH_OPTIONS: SearchOptions = {
  total: 0, locations: [], categories: [], types: [], budgets: [], fourth: [],
};

export function rowsFromProperties(items: RemoteProperty[]): SearchRow[] {
  return items.map((item) => {
    const type = (item.type || '').trim();
    return {
      mode: isRental(item) ? ('rent' as const) : ('buy' as const),
      location: (item.community || item.location || '').trim(),
      category: categoryOf(type) ?? '',
      type,
      developer: '',
      beds: Number(item.bedrooms) || 0,
      handover: '',
      price: Number(item.price) || 0,
    };
  });
}

export function rowsFromProjects(items: Project[]): SearchRow[] {
  return items.map((item) => ({
    mode: 'offplan' as const,
    location: (item.location || '').trim(),
    category: (item.developer || '').trim(),
    type: projectUnitType(item),
    developer: (item.developer || '').trim(),
    beds: 0,
    handover: (item.handover || '').trim(),
    price: Number(item.startingPrice) || 0,
  }));
}

/**
 * What a project is selling, as the admin recorded it. Nothing is inferred: a project with no
 * category simply does not appear under a property type.
 */
export function projectUnitType(project: Project) {
  return (project.category ?? '').trim();
}

/** "Q4 2028" -> 2028, so a handover year can be read off whatever the record holds. */
function handoverYear(handover: string) {
  return Number(handover.match(/\d{4}/)?.[0] ?? 0);
}

function matchesHandover(handover: string, wanted: string) {
  if (!wanted) return true;
  if (wanted === 'ready') return /ready|complete|handed/i.test(handover) || handoverYear(handover) === 0;
  const open = wanted.endsWith('+');
  const year = Number(open ? wanted.slice(0, -1) : wanted);
  return open ? handoverYear(handover) >= year : handoverYear(handover) === year;
}

function matchesBeds(beds: number, wanted: string) {
  if (!wanted) return true;
  return wanted === 'studio' ? beds === 0 : beds >= Number(wanted);
}

/** Predicates for a query, one per field, so a field can be counted with its own left out. */
function tests(query: PropertySearchQuery) {
  const min = Number(query.minPrice);
  const max = Number(query.maxPrice);
  return {
    location: (row: SearchRow) => !query.location || row.location === query.location,
    // Buy and rent match a category; off-plan matches the developer in the same slot. A type
    // outside the catalogue has no category, so a category never hides it.
    category: (row: SearchRow) =>
      !query.category || (row.mode === 'offplan' ? row.developer === query.category : !row.category || row.category === query.category),
    type: (row: SearchRow) => !query.type || row.type === query.type,
    budget: (row: SearchRow) => (!query.minPrice || row.price >= min) && (!query.maxPrice || row.price < max),
    fourth: (row: SearchRow) => matchesBeds(row.beds, query.beds) && matchesHandover(row.handover, query.handover),
  };
}

export function countRows(rows: SearchRow[], query: PropertySearchQuery) {
  const mode: ListingMode = query.listing || 'buy';
  const check = tests(query);
  return rows.filter(
    (row) => row.mode === mode
      && check.location(row) && check.category(row) && check.type(row) && check.budget(row) && check.fourth(row),
  ).length;
}

/** Values actually present in the rows, most stock first, each with its count. */
function tally(rows: SearchRow[], read: (row: SearchRow) => string): Option[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = read(row);
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value, count]) => ({ value, label: value, count }));
}

const bedLabel = (beds: number) => (beds === 0 ? 'Studio' : `${beds}+ ${beds === 1 ? 'bed' : 'beds'}`);

export function searchOptions(rows: SearchRow[], query: PropertySearchQuery): SearchOptions {
  const mode: ListingMode = query.listing || 'buy';
  const offPlan = mode === 'offplan';
  const inMode = rows.filter((row) => row.mode === mode);
  const check = tests(query);
  // Each list is counted against the OTHER choices, so the lists narrow as the search builds
  // and every combination the bar can reach still has something behind it.
  const except = (...keep: ((row: SearchRow) => boolean)[]) => inMode.filter((row) => keep.every((fn) => fn(row)));

  const forType = except(check.location, check.category, check.budget, check.fourth);
  const forBudget = except(check.location, check.category, check.type, check.fourth);
  const forFourth = except(check.location, check.category, check.type, check.budget);

  // Bedroom steps present in the remaining stock: "3 beds" means 3 or more, and a studio is
  // its own step rather than a floor.
  const bedSteps = [...new Set(forFourth.map((row) => row.beds))]
    .filter((beds) => beds >= 0)
    .sort((a, b) => a - b)
    .map((beds) => ({ value: beds === 0 ? 'studio' : String(beds), label: bedLabel(beds) }));

  // Handover windows present in the remaining projects, in date order.
  const handoverSteps = [...new Set(forFourth.map((row) => handoverYear(row.handover)))]
    .sort((a, b) => a - b)
    .map((year) => (year ? { value: String(year), label: String(year) } : { value: 'ready', label: 'Ready / completed' }));

  return {
    total: countRows(rows, query),
    locations: tally(except(check.category, check.type, check.budget, check.fourth), (row) => row.location),
    categories: tally(except(check.location, check.type, check.budget, check.fourth), (row) => row.category),
    types: tally(forType, (row) => row.type),
    budgets: SEARCH_BUDGETS[mode]
      .map((band) => ({
        value: `${band.min ?? ''}-${band.max ?? ''}`,
        label: band.label,
        // "under 5M" is exclusive at the top so neighbouring bands never double-count.
        count: forBudget.filter((row) => (band.min == null || row.price >= band.min) && (band.max == null || row.price < band.max)).length,
      }))
      .filter((band) => band.count > 0),
    fourth: (offPlan ? handoverSteps : bedSteps)
      .map((option) => ({
        ...option,
        count: forFourth.filter((row) =>
          offPlan ? matchesHandover(row.handover, option.value) : matchesBeds(row.beds, option.value),
        ).length,
      }))
      .filter((option) => option.count > 0),
  };
}

/* ------------------------------------------------------------------- the matchers --- */

const COMMERCIAL = /commercial|office|retail|shop|warehouse|showroom/i;

function isRental(item: RemoteProperty) {
  return item.listingType?.toLowerCase() === 'rent' || /\b(rent|lease)/i.test(item.status ?? '');
}

// Exact match on the community or a comma-separated part of the address,
// so "Jumeirah" does not also return "Frond M, Palm Jumeirah".
function matchesLocation(item: RemoteProperty, location: string) {
  const wanted = location.trim().toLowerCase();
  const places = [item.community ?? '', ...(item.location ?? '').split(',')];
  return places.some((place) => place.trim().toLowerCase() === wanted);
}

function matchesType(item: RemoteProperty, type: string) {
  const kind = item.type ?? '';
  if (type.toLowerCase() === 'commercial') return COMMERCIAL.test(kind) || COMMERCIAL.test(item.title);
  return kind.trim().toLowerCase() === type.trim().toLowerCase();
}

export function matchesPropertySearch(item: RemoteProperty, query: PropertySearchQuery) {
  if (query.listing === 'offplan') return false;
  if (query.listing && isRental(item) !== (query.listing === 'rent')) return false;
  if (query.location && !matchesLocation(item, query.location)) return false;
  // A type outside the catalogue has no category, so a category never hides it.
  if (query.category) {
    const category = categoryOf(item.type ?? '');
    if (category && category !== query.category) return false;
  }
  if (query.type && !matchesType(item, query.type)) return false;
  if (query.minPrice && item.price < Number(query.minPrice)) return false;
  if (query.maxPrice && item.price >= Number(query.maxPrice)) return false;
  if (!matchesBeds(Number(item.bedrooms) || 0, query.beds)) return false;
  return true;
}

/*
 * Off-plan equivalent. A project carries a developer and a handover window where a property
 * carries a type and a bedroom count, so the narrow fields are read against those instead.
 */
export function matchesProjectSearch(project: Project, query: PropertySearchQuery) {
  if (query.listing && query.listing !== 'offplan') return false;
  if (query.location && (project.location ?? '').trim() !== query.location) return false;
  if (query.category && (project.developer ?? '').trim() !== query.category) return false;
  if (query.type && projectUnitType(project) !== query.type) return false;
  if (!matchesHandover(project.handover ?? '', query.handover)) return false;
  const price = Number(project.startingPrice) || 0;
  if (query.minPrice && price < Number(query.minPrice)) return false;
  if (query.maxPrice && price >= Number(query.maxPrice)) return false;
  return true;
}

/*
 * Which segment an off-plan project belongs to, for the /off-plan/apartments and
 * /off-plan/villas-townhouses pages. The admin's own category wins; otherwise the project's
 * own words decide. A project that says neither is left unclassified rather than guessed at,
 * so neither page ever shows something it does not describe.
 */
export function projectSegment(project: Project): 'villas' | 'apartments' | null {
  const text = `${project.category ?? ''} ${project.title ?? ''} ${project.description ?? ''}`.toLowerCase();
  if (/\bvillas?\b|\btownhouses?\b|\bmansions?\b/.test(text)) return 'villas';
  if (/\bapartments?\b|\bresidences?\b|\btowers?\b|\bpenthouses?\b|\bvertical\b|\blofts?\b|\bstudios?\b/.test(text)) return 'apartments';
  return null;
}

/** A project counts as a new launch from its flag, or from the status the admin typed. */
export function isNewLaunchProject(project: Project) {
  return project.newLaunch === true || /launching|new launch/i.test(project.status ?? '');
}
