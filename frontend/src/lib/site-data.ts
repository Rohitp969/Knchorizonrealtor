export type Property = {
  id: string;
  slug?: string;
  title: string;
  location: string;
  type: string;
  price: string;
  details: string;
  image: string;
  note: string;
};

export type Service = {
  id: string;
  index: string;
  title: string;
  description: string;
  link: string;
  href: string;
};

export type SpecialistService = {
  id: string;
  index: string;
  title: string;
  description: string;
  image: string;
  href: string;
};

export type Area = {
  id: string;
  name: string;
  descriptor: string;
  image: string;
  detail: string;
};

export const properties: Property[] = [
  {
    id: 'palm-jumeirah-azure',
    slug: 'palm-jumeirah-azure',
    title: 'Azure House',
    location: 'Palm Jumeirah',
    type: 'Private Villa',
    price: 'AED 24,500,000',
    details: '5 beds · 7 baths · 8,420 sq ft',
    image: '/images/palm-jumeirah-aerial.jpg',
    note: 'Waterfront / Private access',
  },
  {
    id: 'marina-skyline',
    slug: 'meridian-residence-dubai-marina',
    title: 'The Meridian Residence',
    location: 'Dubai Marina',
    type: 'Skyline Penthouse',
    price: 'AED 8,900,000',
    details: '3 beds · 4 baths · 2,980 sq ft',
    image: '/images/penthouse-marina.jpg',
    note: 'Turnkey / Sea view',
  },
  {
    id: 'hills-courtyard',
    slug: 'courtyard-17-dubai-hills',
    title: 'Courtyard 17',
    location: 'Dubai Hills Estate',
    type: 'Contemporary Villa',
    price: 'AED 11,750,000',
    details: '4 beds · 5 baths · 4,870 sq ft',
    image: '/images/hills-villa.jpg',
    note: 'Quiet street / Garden',
  },
  {
    id: 'downtown-horizon',
    slug: 'address-sky-view-downtown',
    title: 'The Address Sky View',
    location: 'Downtown Dubai',
    type: 'Luxury Apartment',
    price: 'AED 4,250,000',
    details: '2 beds · 3 baths · 1,640 sq ft',
    image: '/images/hero-dubai-skyline.jpg',
    note: 'Burj view / Turnkey',
  },
];

export const services: Service[] = [
  { id: 'sales', index: '01', title: 'Property Sales & Advisory', description: 'Position your property with precision, reach the right audience, and move from valuation to completion with a clear strategy.', link: 'Explore sales', href: '/contact?service=sales' },
  { id: 'buying', index: '02', title: 'Property Buying', description: 'A considered search shaped around how you want to live, not just what is available. From first brief to handover, we keep the signal clear.', link: 'Explore buying', href: '/properties' },
  { id: 'consultation', index: '03', title: 'Property Consultation', description: 'Get a clear second perspective on your next move, from market context and shortlisting to the practical questions worth asking.', link: 'Book a consultation', href: '/contact?service=consultation' },
  { id: 'residential', index: '04', title: 'Residential Properties', description: 'Find a home that fits your everyday life, with local guidance on communities, buildings, value, and the buying process.', link: 'Explore residential', href: '/properties/residential' },
  { id: 'commercial', index: '05', title: 'Commercial Properties', description: 'Explore commercial opportunities with a focused brief, practical due diligence, and clear communication through each stage.', link: 'Discuss commercial', href: '/properties/commercial' },
  { id: 'investment', index: '06', title: 'Investment Advisory', description: 'Understand location, timing, and opportunity with an informed property conversation shaped around your goals.', link: 'Discuss investment', href: '/properties/investment' },
  { id: 'management', index: '07', title: 'Property Management', description: 'End-to-end management for home owners and property investors in Dubai, handling tenant relations, renewals, maintenance, and asset oversight.', link: 'Discuss management', href: '/contact?service=management' },
];

export const specialistServices: SpecialistService[] = [
  { id: 'design-build', index: '07', title: 'Design & Build', description: 'From first concept to final handover, we coordinate the design, procurement, and delivery of spaces made for the way you live.', image: '/images/interior-detail.jpg', href: '/design-build' },
  { id: 'interiors', index: '08', title: 'Interiors & Furniture', description: 'A complete interior perspective: material palettes, bespoke furniture, styling, and the quiet details that make a place feel finished.', image: '/images/penthouse-marina.jpg', href: '/interiors' },
];

export const faqs = [
  { question: 'What kind of properties does KNC Horizon handle?', answer: 'We advise on selected residential homes, commercial opportunities, and investment properties across Dubai. Our recommendations are shaped around your brief rather than a fixed inventory.' },
  { question: 'Can you help clients who are moving from overseas?', answer: 'Yes. We support international buyers with remote shortlists, area context, viewings, due diligence coordination, and a clear path from first conversation to completion.' },
  { question: 'Do you offer design and furnishing support?', answer: 'Our design and interiors service can take a project from concept through build, furniture selection, styling, and handover, with a single coordinated point of contact.' },
  { question: 'How do I arrange a private viewing?', answer: 'Send an enquiry through the contact form or WhatsApp us directly. We will confirm your brief, suggest suitable times, and prepare the relevant property context before the viewing.' },
];

export const areas: Area[] = [
  { id: 'downtown-dubai', name: 'Downtown Dubai', descriptor: 'The city at its centre', image: '/images/burj-khalifa-aerial.jpg', detail: 'Iconic views, cultural energy, and a walkable rhythm for people who want to be close to everything.' },
  { id: 'dubai-marina', name: 'Dubai Marina', descriptor: 'The city by water', image: '/images/dubai-marina-promenade.jpg', detail: 'A vertical neighbourhood of considered residences, restaurants, and open horizons.' },
  { id: 'palm-jumeirah', name: 'Palm Jumeirah', descriptor: 'Island life, redefined', image: '/images/palm-jumeirah-aerial.jpg', detail: 'Waterfront villas, private beaches, and a slower rhythm at the edge of the city.' },
  { id: 'business-bay', name: 'Business Bay', descriptor: 'A vertical pulse', image: '/images/business-bay-night.jpg', detail: 'A central address where ambitious towers, water, and the city’s working rhythm meet.' },
  { id: 'jumeirah', name: 'Jumeirah', descriptor: 'An established ease', image: '/images/jumeirah-coast-burj-al-arab.jpg', detail: 'Leafy streets, beach access, and a more residential pace in one of Dubai’s enduring communities.' },
  { id: 'arabian-ranches', name: 'Arabian Ranches', descriptor: 'Space to settle', image: '/images/hills-villa.jpg', detail: 'Landscaped streets, generous homes, and a grounded sense of community away from the rush.' },
];

export type GalleryItem = {
  id: string;
  title: string;
  category: string;
  image: string;
  alt: string;
};

export const defaultRemoteProperties = [
  {
    id: 'palm-jumeirah-azure',
    slug: 'palm-jumeirah-azure',
    title: 'Azure House',
    location: 'Frond M, Palm Jumeirah',
    community: 'Palm Jumeirah',
    type: 'Villa',
    status: 'For sale',
    price: 24500000,
    currency: 'AED',
    bedrooms: 5,
    bathrooms: 7,
    size: 8420,
    description: 'A private waterfront villa shaped around quiet mornings, generous entertaining, and direct access to the water.',
    images: ['/images/palm-jumeirah-aerial.jpg', '/images/hero-dubai-villa.jpg'],
    amenities: ['Private beach', 'Infinity pool', 'Staff suite', 'Sea views'],
    featured: true,
    published: true,
  },
  {
    id: 'meridian-residence-dubai-marina',
    slug: 'meridian-residence-dubai-marina',
    title: 'The Meridian Residence',
    location: 'Dubai Marina',
    community: 'Dubai Marina',
    type: 'Penthouse',
    status: 'For sale',
    price: 8900000,
    currency: 'AED',
    bedrooms: 3,
    bathrooms: 4,
    size: 2980,
    description: 'A turnkey skyline residence with a wide marina outlook and a considered, light-filled interior.',
    images: ['/images/penthouse-marina.jpg', '/images/interior-detail.jpg'],
    amenities: ['Sea view', 'Concierge', 'Residents lounge', 'Private lift'],
    featured: true,
    published: true,
  },
  {
    id: 'courtyard-17-dubai-hills',
    slug: 'courtyard-17-dubai-hills',
    title: 'Courtyard 17',
    location: 'Dubai Hills Estate',
    community: 'Dubai Hills Estate',
    type: 'Villa',
    status: 'For sale',
    price: 11750000,
    currency: 'AED',
    bedrooms: 4,
    bathrooms: 5,
    size: 4870,
    description: 'A calm contemporary family home on a quiet street, with garden rooms that bring the outside in.',
    images: ['/images/hills-villa.jpg', '/images/interior-detail.jpg'],
    amenities: ['Private garden', 'Study', 'Garage', 'Community pool'],
    featured: false,
    published: true,
  },
  {
    id: 'address-sky-view-downtown',
    slug: 'address-sky-view-downtown',
    title: 'The Address Sky View',
    location: 'Downtown Dubai',
    community: 'Downtown Dubai',
    type: 'Apartment',
    status: 'For sale',
    price: 4250000,
    currency: 'AED',
    bedrooms: 2,
    bathrooms: 3,
    size: 1640,
    description: 'A polished city apartment with Burj Khalifa views and the service of one of Downtown’s most recognisable addresses.',
    images: ['/images/hero-dubai-skyline.jpg', '/images/burj-khalifa-aerial.jpg'],
    amenities: ['Burj view', 'Valet parking', 'Pool', 'Fitness studio'],
    featured: false,
    published: true,
  },
];

export const defaultProjects = [
  {
    id: 'the-oasis-by-emaar',
    slug: 'the-oasis-by-emaar',
    title: 'The Oasis',
    developer: 'Emaar',
    location: 'Dubailand',
    startingPrice: 5500000,
    handover: 'Q4 2028',
    description: 'A low-density collection of villas and gardens designed around water, landscape, and long-term liveability.',
    image: '/images/hero-dubai-villa.jpg',
    featured: true,
  },
  {
    id: 'bay-by-cavalli',
    slug: 'bay-by-cavalli',
    title: 'Bay by Cavalli',
    developer: 'DAMAC',
    location: 'Dubai Maritime City',
    startingPrice: 3200000,
    handover: 'Q2 2028',
    description: 'A waterfront address for buyers looking for a distinctive design language, resort amenities, and a central coastal position.',
    image: '/images/maritime-city-towers.jpg',
    featured: true,
  },
  {
    id: 'the-valley-by-emaar',
    slug: 'the-valley-by-emaar',
    title: 'The Valley',
    developer: 'Emaar',
    location: 'Jebel Ali',
    category: 'Villas',
    status: 'Launching',
    startingPrice: 2900000,
    handover: 'Q1 2029',
    description: 'A new collection of family villas set around open landscapes, trails, and everyday community life.',
    image: '/images/hills-villa.jpg',
    featured: false,
  },
  {
    id: 'sobha-one',
    slug: 'sobha-one',
    title: 'Sobha One',
    developer: 'Sobha Realty',
    location: 'Ras Al Khor',
    category: 'Apartments',
    status: 'Under construction',
    startingPrice: 2100000,
    handover: 'Q4 2028',
    description: 'A golf-side vertical neighbourhood with generous views, thoughtful amenities, and a strong central position.',
    image: '/images/burj-khalifa-aerial.jpg',
    featured: false,
  },
  {
    id: 'avenue-al-jaddaf',
    slug: 'avenue-al-jaddaf',
    title: 'Avenue',
    developer: 'Azizi',
    location: 'Al Jaddaf',
    category: 'Waterfront',
    status: 'Launching',
    startingPrice: 1250000,
    handover: 'Q3 2027',
    description: 'A compact waterfront address for buyers seeking access, amenity, and a considered entry into the Dubai market.',
    image: '/images/dubai-creek-dusk.jpg',
    featured: false,
  },
];

export const defaultPosts = [
  {
    id: 'where-to-live-in-dubai',
    slug: 'where-to-live-in-dubai',
    title: 'Where to live in Dubai when the city needs to feel like home',
    excerpt: 'A local read on choosing between the energy of Downtown, the water of the Marina, and the space of the suburbs.',
    content: 'Dubai rewards a slower first question: how do you want an ordinary Tuesday to feel? From walkable city life to private garden streets, the right community is the one that supports the life you are building.',
    category: 'Area guide',
    image: '/images/creek-waterfront.jpg',
    author: 'KNC Horizon',
    publishedAt: '2025-01-15T00:00:00.000Z',
  },
  {
    id: 'buying-off-plan-in-dubai',
    slug: 'buying-off-plan-in-dubai',
    title: 'A clear-eyed guide to buying off-plan in Dubai',
    excerpt: 'The questions worth asking about a developer, a handover, a payment plan, and the value of a future address.',
    content: 'Off-plan property can offer access to a new generation of communities, but the strongest decisions come from context. Understand the developer, the delivery timeline, the surrounding infrastructure, and how the payment plan fits your horizon.',
    category: 'Investment',
    image: '/images/interior-detail.jpg',
    author: 'KNC Horizon',
    publishedAt: '2025-02-01T00:00:00.000Z',
  },
  {
    id: 'the-dubai-rental-reset',
    slug: 'the-dubai-rental-reset',
    title: 'The Dubai rental reset: what tenants should look for now',
    excerpt: 'A practical checklist for comparing a home beyond the headline rent.',
    content: 'The strongest rental decisions come from looking at the whole year, not only the first month. Consider the building, the commute, the renewal terms, the maintenance response, and the daily ease of the address.',
    category: 'Renting',
    image: '/images/penthouse-marina.jpg',
    author: 'KNC Horizon',
    publishedAt: '2025-02-14T00:00:00.000Z',
  },
  {
    id: 'designing-a-better-home-search',
    slug: 'designing-a-better-home-search',
    title: 'Designing a better home search',
    excerpt: 'The right shortlist is not the longest one. It is the one that makes the decision clearer.',
    content: 'A good search begins with a few strong filters and the confidence to remove what does not fit. When the brief reflects how you actually live, the right homes become easier to recognise.',
    category: 'Perspective',
    image: '/images/hero-dubai-villa.jpg',
    author: 'KNC Horizon',
    publishedAt: '2025-02-20T00:00:00.000Z',
  },
];

export const defaultGallery: GalleryItem[] = [
  { id: 'gal-1', title: 'A waterfront terrace at dusk', category: 'Illustrations', image: '/images/hero-dubai-villa.jpg', alt: 'Illustrative render of a waterfront villa terrace at dusk' },
  { id: 'gal-2', title: 'A quieter kind of luxury', category: 'Interiors', image: '/images/interior-detail.jpg', alt: 'Warm stone and brass interior details' },
  { id: 'gal-3', title: 'A room with a marina view', category: 'Interiors', image: '/images/penthouse-marina.jpg', alt: 'Furnished living room with windows overlooking marina towers' },
  { id: 'gal-4', title: 'A contemporary courtyard', category: 'Illustrations', image: '/images/hills-villa.jpg', alt: 'Illustrative render of a contemporary villa courtyard with an olive tree' },
  { id: 'gal-5', title: 'Waterfront at dusk', category: 'Illustrations', image: '/images/creek-waterfront.jpg', alt: 'Illustrative render of a waterfront promenade at dusk' },
];

// Verified public developer profiles (name, description, official website only)
export const defaultDevelopers = [
  {
    id: 'emaar',
    slug: 'emaar',
    name: 'Emaar Properties',
    shortDescription: 'Dubai-based property developer known for major master-planned communities and residential developments.',
    description: 'Emaar Properties is a publicly listed Dubai-based real estate developer established in 1997. The company is responsible for shaping landmark master communities across Dubai, including Downtown Dubai, Dubai Marina, Dubai Hills Estate, and Dubai Creek Harbour.',
    officialWebsite: 'https://www.emaar.com',
    website: 'https://www.emaar.com',
    published: true,
    featured: true,
    sortOrder: 1,
    areas: ['Downtown Dubai', 'Dubai Marina', 'Dubai Hills Estate', 'Dubai Creek Harbour', 'Arabian Ranches'],
  },
  {
    id: 'damac',
    slug: 'damac',
    name: 'DAMAC Properties',
    shortDescription: 'Dubai-based property developer with residential, hospitality and branded-development projects.',
    description: 'DAMAC Properties was founded in 2002 as a private residential, leisure, and commercial developer in Dubai. The developer is recognised for large-scale master communities including DAMAC Hills and luxury branded residential collaborations.',
    officialWebsite: 'https://www.damacproperties.com',
    website: 'https://www.damacproperties.com',
    published: true,
    featured: true,
    sortOrder: 2,
    areas: ['Dubai Marina', 'Business Bay', 'DAMAC Hills', 'Dubai Maritime City'],
  },
  {
    id: 'sobha-realty',
    slug: 'sobha-realty',
    name: 'Sobha Realty',
    shortDescription: 'Dubai-based developer known for residential communities and its vertically integrated development approach.',
    description: 'Sobha Realty is an international luxury developer active in the UAE since 2003. Known for its backward-integrated construction and design model, its flagship Dubai developments include Sobha Hartland and Sobha Hartland II in Mohammed Bin Rashid City.',
    officialWebsite: 'https://www.sobharealty.com',
    website: 'https://www.sobharealty.com',
    published: true,
    featured: true,
    sortOrder: 3,
    areas: ['Mohammed Bin Rashid City', 'Sobha Hartland', 'Ras Al Khor', 'Dubai Marina'],
  },
  {
    id: 'binghatti',
    slug: 'binghatti',
    name: 'Binghatti',
    shortDescription: 'Dubai-based developer with residential and branded developments across several Dubai communities.',
    description: 'Binghatti Developers is a Dubai-headquartered property brand recognised for its distinct architectural styling and portfolio of branded residential partnerships across major central and residential districts.',
    officialWebsite: 'https://www.binghatti.com',
    website: 'https://www.binghatti.com',
    published: true,
    featured: true,
    sortOrder: 4,
    areas: ['Business Bay', 'Downtown Dubai', 'Jumeirah Village Circle', 'Al Jaddaf'],
  },
  {
    id: 'nakheel',
    slug: 'nakheel',
    name: 'Nakheel',
    shortDescription: 'Dubai-based master developer known for landmark waterfront destinations and master-planned residential communities.',
    description: 'Nakheel is a major Dubai master developer celebrated for landmark coastal projects including Palm Jumeirah and Dubai Islands, alongside extensive family residential master communities throughout the emirate.',
    officialWebsite: 'https://www.nakheel.com',
    website: 'https://www.nakheel.com',
    published: true,
    featured: true,
    sortOrder: 5,
    areas: ['Palm Jumeirah', 'Dubai Islands', 'Jumeirah Islands', 'Jumeirah Park'],
  },
  {
    id: 'danube',
    slug: 'danube',
    name: 'Danube Properties',
    shortDescription: 'Dubai-based property developer focusing on residential developments and private residences across Dubai.',
    description: 'Danube Properties is the property development arm of the Danube Group, launched in 2014. The developer focuses on contemporary urban apartments with flexible payment models across established Dubai residential corridors.',
    officialWebsite: 'https://www.danubeproperties.com',
    website: 'https://www.danubeproperties.com',
    published: true,
    featured: false,
    sortOrder: 6,
    areas: ['Al Furjan', 'JLT', 'Business Bay', 'Arjan'],
  },
  {
    id: 'ellington',
    slug: 'ellington',
    name: 'Ellington Properties',
    shortDescription: 'Dubai-based boutique design-led property developer creating residential properties and communities.',
    description: 'Ellington Properties, established in 2014, is a design-focused Dubai boutique developer producing high-specification residences across prime and emerging neighbourhoods.',
    officialWebsite: 'https://www.ellingtonproperties.ae',
    website: 'https://www.ellingtonproperties.ae',
    published: true,
    featured: false,
    sortOrder: 7,
    areas: ['Downtown Dubai', 'Palm Jumeirah', 'MBR City', 'JVC'],
  },
  {
    id: 'meraas',
    slug: 'meraas',
    name: 'Meraas',
    shortDescription: 'Dubai-based developer known for destination-led residential, mixed-use, and waterfront communities.',
    description: 'Meraas is a Dubai-based master development company with a portfolio of urban and coastal residential destinations including City Walk, Bluewaters Island, and Port de La Mer.',
    officialWebsite: 'https://www.meraas.com',
    website: 'https://www.meraas.com',
    published: true,
    featured: false,
    sortOrder: 8,
    areas: ['City Walk', 'Bluewaters Island', 'Port de La Mer', 'Jumeirah'],
  },
];
