const configuredApiUrl = String(import.meta.env.VITE_API_URL ?? '').trim().replace(/\/$/, '');
const localApiRoot = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/api`;
export const apiRoot = import.meta.env.DEV
  ? localApiRoot
  : configuredApiUrl
    ? configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`
    : localApiRoot;

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiRoot}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Something went wrong.');
  return payload as T;
}

export type RemoteProperty = {
  id: string;
  slug: string;
  title: string;
  location: string;
  community: string;
  type: string;
  listingType?: 'sale' | 'rent' | string;
  status: string;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  description: string;
  images: string[];
  imageUrl?: string;
  imagePath?: string;
  coverImage?: string;
  coverImageAlt?: string;
  galleryImages?: GalleryImage[];
  /** Who took the cover photo, the page it came from, and whether it stands in for the home. */
  coverImageCredit?: string;
  coverImageSource?: string;
  coverImageRepresentative?: boolean;
  amenities: string[];
  /** A home type inside a project: the project's slug and its developer. */
  projectSlug?: string | null;
  developer?: string;
  /** True when `price` is the developer's starting price for this type ("From AED ..."). */
  priceFrom?: boolean;
  /** Top of a bedroom range ("1 to 3 bedrooms"); 0 when `bedrooms` is the only figure. */
  bedroomsMax?: number;
  /** The developer's page the facts were read from, how to name it, and the day it was checked. */
  sourceUrl?: string;
  sourceName?: string;
  verifiedOn?: string;
  featured: boolean;
  published: boolean;
};

/** One image of a gallery, with the alt text the admin wrote for it and the photographer's credit. */
export type GalleryImage = { url: string; alt?: string; publicId?: string | null; representative?: boolean; credit?: string; sourceUrl?: string };

export type Project = {
  id: string;
  slug: string;
  title: string;
  developer: string;
  location: string;
  startingPrice: number;
  handover: string;
  description: string;
  image: string;
  imageUrl?: string;
  imagePath?: string;
  coverImage?: string;
  coverImageAlt?: string;
  gallery?: string[];
  galleryImages?: GalleryImage[];
  coverImageCredit?: string;
  coverImageSource?: string;
  coverImageRepresentative?: boolean;
  category?: string;
  status?: string;
  /** What the development offers, in the developer's words ("1 to 3-bedroom apartments"). */
  unitTypes?: string;
  /** The developer's page the facts were read from, how to name it, and the day it was checked. */
  sourceUrl?: string;
  sourceName?: string;
  verifiedOn?: string;
  amenities?: string[];
  highlights?: string[];
  featured?: boolean;
  published?: boolean;
  newLaunch?: boolean;
  offPlan?: boolean;
};

export type Developer = {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  description: string;
  logo?: string;
  coverImage?: string;
  imageUrl?: string;
  imagePath?: string;
  officialWebsite?: string;
  website?: string;
  established?: string;
  featured?: boolean;
  published: boolean;
  sortOrder?: number;
  areas?: string[];
  createdAt?: string;
  updatedAt?: string;
  projectCount?: number;
  projects?: { title: string; slug: string }[];
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  imageUrl?: string;
  imagePath?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  author: string;
  publishedAt: string;
  status?: 'draft' | 'published';
  seoTitle?: string;
  seoDescription?: string;
};   

export type Testimonial = {
  id: string;
  name: string;
  designation?: string;
  review: string;
  rating: number;
};