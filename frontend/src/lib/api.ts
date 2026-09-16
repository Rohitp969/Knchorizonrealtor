const configuredApiUrl = String(import.meta.env.VITE_API_URL ?? '').trim().replace(/\/$/, '');
const localApiRoot = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/api`;
const apiRoot = import.meta.env.DEV
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

export function adminFetch<T>(path: string, options: RequestInit = {}) {
  const token = window.localStorage.getItem('knc_admin_token');
  return apiFetch<T>(path, {
    ...options,
    headers: { ...(options.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
}

export type RemoteProperty = {
  id: string;
  slug: string;
  title: string;
  location: string;
  community: string;
  type: string;
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
  amenities: string[];
  featured: boolean;
  published: boolean;
};

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
  gallery?: string[];
  category?: string;
  status?: string;
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