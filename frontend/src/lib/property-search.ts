import type { Project, RemoteProperty } from '@/lib/api';

/*
 * Property search shared by the home hero, the /properties listing and the off-plan page.
 * The hero only builds a URL; the listing pages read the same URL and filter against it.
 *
 * /properties?listing=buy&location=Dubai+Marina&category=Residential&type=Villa&minPrice=5000000&beds=3
 * /off-plan?listing=offplan&location=Dubailand&type=Emaar&minPrice=5000000&handover=2028
 *
 * Every dropdown shows its full list for the chosen mode, whatever else has been picked: a
 * visitor who has chosen a location still sees every category, property type, budget band and
 * bedroom count. Categories, types, budgets and bedrooms come from the catalogue below;
 * locations, developers, unit types and handover years are read off the published collection,
 * so anything an admin publishes appears on its own. A combination with nothing behind it is
 * not a dead end: the listing page shows the closest properties instead (nearestMatches).
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
  baths: string;
  /** Off-plan only: a single project, by slug. */
  project: string;
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
  baths: '',
  project: '',
  handover: '',
};

/*
 * The listing page's last chip. Not a kind of home but a stage: a property whose status says
 * it is still being built. It travels in the URL's `type` like the other chips.
 */
export const OFF_PLAN_CHIP = 'Off-Plan';

/** A property still being built, from the status the admin typed. */
export function isOffPlanStatus(status: string | null | undefined) {
  return /off-plan|launching|construction/i.test(status ?? '');
}

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

/** Every property type the site understands, in category order. The admin form offers the
 *  same list, so a type an admin picks is always one the public category filter can place. */
export const SEARCH_TYPES = SEARCH_CATEGORIES.flatMap((category) => category.types);

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
    { label: 'Bathrooms', value: query.baths ? `${query.baths}+ ${query.baths === '1' ? 'bath' : 'baths'}` : '' },
    { label: 'Project', value: query.project ? query.project.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '' },
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
  const category = params.get('category') ?? '';
  // Older links said ?category=off-plan. That is the Off-Plan chip, not a category.
  const offPlanChip = category.toLowerCase() === 'off-plan';
  return {
    listing: listing === 'buy' || listing === 'rent' || listing === 'offplan' ? listing : '',
    location: params.get('location') ?? '',
    category: offPlanChip ? '' : category,
    type: offPlanChip ? OFF_PLAN_CHIP : (params.get('type') ?? ''),
    minPrice: params.get('minPrice') ?? '',
    maxPrice: params.get('maxPrice') ?? '',
    beds: params.get('beds') ?? '',
    baths: params.get('baths') ?? '',
    project: params.get('project') ?? '',
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
  /** Off-plan only: the project's slug, and the title to show for it. */
  project: string;
  projectTitle: string;
  beds: number;
  baths: number;
  featured: boolean;
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
  /** Bathroom steps; buy and rent only. */
  baths: Option[];
  /** The projects themselves; off-plan only. */
  projects: Option[];
};

export const EMPTY_SEARCH_OPTIONS: SearchOptions = {
  total: 0, locations: [], categories: [], types: [], budgets: [], fourth: [], baths: [], projects: [],
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
      project: '',
      projectTitle: '',
      beds: Number(item.bedrooms) || 0,
      baths: Number(item.bathrooms) || 0,
      featured: item.featured === true,
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
    project: (item.slug || '').trim(),
    projectTitle: (item.title || '').trim(),
    beds: 0,
    baths: 0,
    featured: item.featured === true,
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

/*
 * Bedrooms. A commercial floor also records zero bedrooms, so "Studio" only ever means a
 * home with no separate bedroom, never an office that happens to have none.
 */
function matchesBeds(beds: number, wanted: string, residential = true) {
  if (!wanted) return true;
  return wanted === 'studio' ? beds === 0 && residential : beds >= Number(wanted);
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
    fourth: (row: SearchRow) =>
      matchesBeds(row.beds, query.beds, row.category === 'Residential') && matchesHandover(row.handover, query.handover),
    // Bathrooms are a floor too; featured and project are exact.
    baths: (row: SearchRow) => !query.baths || row.baths >= Number(query.baths),
    extra: (row: SearchRow) => !query.project || row.project === query.project,
  };
}

export function countRows(rows: SearchRow[], query: PropertySearchQuery) {
  const mode: ListingMode = query.listing || 'buy';
  const check = tests(query);
  return rows.filter(
    (row) => row.mode === mode
      && check.location(row) && check.category(row) && check.type(row) && check.budget(row)
      && check.fourth(row) && check.baths(row) && check.extra(row),
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

/*
 * A value already in the URL may not be in its list any more (a type an admin has since
 * renamed, a budget band from an old link). Put it back so the control always shows what is
 * actually being applied.
 */
function keepSelected(list: Option[], value: string, label: (value: string) => string): Option[] {
  if (!value || list.some((option) => option.value === value)) return list;
  return [...list, { value, label: label(value), count: 0 }];
}

/** Bedroom steps offered on buy and rent, whatever the stock: a studio, then 1+ to 6+. */
const BED_STEPS = [0, 1, 2, 3, 4, 5, 6];

/** Bathroom steps, the same way. */
const BATH_STEPS = [1, 2, 3, 4, 5, 6];

/*
 * The lists behind the dropdowns, all of them full lists for the chosen mode. Nothing narrows
 * against another choice (the owner asked for every option to stay visible once a location
 * is picked, 2026-09-30). Each option carries the count of published listings behind it, for
 * anything that wants to show or sort by it.
 */
export function searchOptions(rows: SearchRow[], query: PropertySearchQuery): SearchOptions {
  const mode: ListingMode = query.listing || 'buy';
  const offPlan = mode === 'offplan';
  const inMode = rows.filter((row) => row.mode === mode);
  const same = (value: string) => value;
  const count = (test: (row: SearchRow) => boolean) => inMode.filter(test).length;
  const named = (value: string, test: (row: SearchRow) => boolean): Option => ({ value, label: value, count: count(test) });

  // Buy and rent: the catalogue's types under the chosen category (every type when no
  // category is chosen), then any published type the catalogue does not name.
  const catalogueTypes = SEARCH_CATEGORIES
    .filter((category) => !query.category || category.value === query.category)
    .flatMap((category) => category.types);
  const extraTypes = tally(inMode.filter((row) => !query.category || !row.category || row.category === query.category), (row) => row.type)
    .map((option) => option.value)
    .filter((type) => !catalogueTypes.some((name) => name.toLowerCase() === type.toLowerCase()));

  // Handover windows present in the published projects, in date order.
  const handoverSteps = [...new Set(inMode.map((row) => handoverYear(row.handover)))]
    .sort((a, b) => a - b)
    .map((year) => (year ? { value: String(year), label: String(year) } : { value: 'ready', label: 'Ready / completed' }));

  return {
    total: countRows(rows, query),
    locations: keepSelected(tally(inMode, (row) => row.location), query.location, same),
    // Buy and rent offer both categories; off-plan offers every developer with a project.
    categories: offPlan
      ? keepSelected(tally(inMode, (row) => row.developer), query.category, same)
      : SEARCH_CATEGORIES.map((category) => named(category.value, (row) => row.category === category.value)),
    // Off-plan offers the unit mix the projects record (Villas, Apartments, Waterfront...).
    types: offPlan
      ? keepSelected(tally(inMode, (row) => row.type), query.type, same)
      : keepSelected(
          [...catalogueTypes, ...extraTypes].map((type) => named(type, (row) => row.type.toLowerCase() === type.toLowerCase())),
          query.type,
          same,
        ),
    budgets: keepSelected(
      SEARCH_BUDGETS[mode].map((band) => ({
        value: `${band.min ?? ''}-${band.max ?? ''}`,
        label: band.label,
        // "under 5M" is exclusive at the top so neighbouring bands never double-count.
        count: count((row) => (band.min == null || row.price >= band.min) && (band.max == null || row.price < band.max)),
      })),
      query.minPrice || query.maxPrice ? `${query.minPrice}-${query.maxPrice}` : '',
      (value) => SEARCH_BUDGETS[mode].find((band) => `${band.min ?? ''}-${band.max ?? ''}` === value)?.label ?? value,
    ),
    fourth: offPlan
      ? keepSelected(
          handoverSteps.map((option) => ({ ...option, count: count((row) => matchesHandover(row.handover, option.value)) })),
          query.handover,
          (value) => (value === 'ready' ? 'Ready / completed' : value),
        )
      : keepSelected(
          BED_STEPS.map((beds) => {
            const value = beds === 0 ? 'studio' : String(beds);
            return { value, label: bedLabel(beds), count: count((row) => matchesBeds(row.beds, value, row.category === 'Residential')) };
          }),
          query.beds,
          (value) => bedLabel(value === 'studio' ? 0 : Number(value)),
        ),
    // Bathrooms, buy and rent only; off-plan projects hold no bathrooms.
    baths: offPlan
      ? []
      : keepSelected(
          BATH_STEPS.map((baths) => ({ value: String(baths), label: `${baths}+ ${baths === 1 ? 'bath' : 'baths'}`, count: count((row) => row.baths >= baths) })),
          query.baths,
          (value) => `${value}+ ${value === '1' ? 'bath' : 'baths'}`,
        ),
    // The projects themselves, off-plan only, by title.
    projects: offPlan
      ? keepSelected(
          [...new Map(inMode.filter((row) => row.project).map((row) => [row.project, row.projectTitle])).entries()]
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([value, label]) => ({ value, label, count: 1 })),
          query.project,
          (value) => value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        )
      : [],
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
  if (type.toLowerCase() === OFF_PLAN_CHIP.toLowerCase()) return isOffPlanStatus(item.status);
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
  if (!matchesBeds(Number(item.bedrooms) || 0, query.beds, categoryOf(item.type ?? '') === 'Residential')) return false;
  if (query.baths && (Number(item.bathrooms) || 0) < Number(query.baths)) return false;
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
  if (query.project && (project.slug ?? '').trim() !== query.project) return false;
  if (!matchesHandover(project.handover ?? '', query.handover)) return false;
  const price = Number(project.startingPrice) || 0;
  if (query.minPrice && price < Number(query.minPrice)) return false;
  if (query.maxPrice && price >= Number(query.maxPrice)) return false;
  return true;
}

/* -------------------------------------------------------------- nearest matches --- */

/*
 * A search that matches nothing still has to lead somewhere. The fields are set aside one
 * step at a time, in the order a buyer would loosen them (bathrooms, bedrooms or handover,
 * budget, property type, category or developer, and only then the location), until
 * something matches. The result names the fields set aside, so the page can say exactly how
 * the search was widened. Buy, rent and off-plan are never crossed.
 */
const RELAX_STEPS: { fields: (keyof PropertySearchQuery)[]; label: (mode: ListingMode) => string }[] = [
  { fields: ['baths'], label: () => 'bathrooms' },
  { fields: ['beds', 'handover'], label: (mode) => (mode === 'offplan' ? 'handover' : 'bedrooms') },
  { fields: ['minPrice', 'maxPrice'], label: () => 'budget' },
  { fields: ['type'], label: () => 'property type' },
  { fields: ['category', 'project'], label: (mode) => (mode === 'offplan' ? 'developer' : 'category') },
  { fields: ['location'], label: () => 'location' },
];

export function nearestMatches<T>(
  items: T[],
  query: PropertySearchQuery,
  matches: (item: T, query: PropertySearchQuery) => boolean,
): { items: T[]; ignored: string[] } {
  const mode: ListingMode = query.listing || 'buy';
  let widened = { ...query };
  const ignored: string[] = [];
  for (const step of RELAX_STEPS) {
    if (!step.fields.some((field) => widened[field])) continue;
    for (const field of step.fields) widened = { ...widened, [field]: '' };
    ignored.push(step.label(mode));
    const found = items.filter((item) => matches(item, widened));
    if (found.length) return { items: found, ignored };
  }
  return { items: [], ignored };
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
