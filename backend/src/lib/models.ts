/*
 * Two shapes, on purpose.
 *
 * `*Doc` types are the camelCase documents the API accepts and returns. They are what the
 * request validators build and what the frontend reads, and they did not change when the
 * database moved from MongoDB to PostgreSQL.
 *
 * `*Row` types are the snake_case rows as PostgreSQL stores them. Only the few places that
 * read a column directly need one; everything else goes through the maps in repositories.ts.
 */

export type PropertyDoc = {
  id?: string;
  slug: string;
  title: string;
  location: string;
  city?: string;
  state?: string;
  community: string;
  type: string;
  propertyType?: string;
  listingType?: "sale" | "rent" | string;
  status: string;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  area?: number;
  description: string;
  images: string[];
  imageUrl?: string;
  imagePath?: string;
  amenities: string[];
  highlights?: string[];
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectDoc = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  developer: string;
  /** Resolved link to developers.slug; the `developer` text stays authoritative for display. */
  developerSlug?: string | null;
  location: string;
  category?: string;
  status?: string;
  startingPrice: number;
  handover: string;
  image: string;
  imageUrl?: string;
  imagePath?: string;
  coverImage?: string;
  gallery?: string[];
  amenities?: string[];
  highlights?: string[];
  completionDate?: string;
  newLaunch?: boolean;
  offPlan?: boolean;
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type DeveloperDoc = {
  id?: string;
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
  featured?: boolean;
  published: boolean;
  sortOrder?: number;
  areas?: string[];
  established?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BlogPostDoc = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage?: string;
  image: string;
  imageUrl?: string;
  imagePath?: string;
  featuredImage?: string;
  author: string;
  published: boolean;
  status?: "draft" | "published";
  publishedAt: Date;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GalleryItemDoc = {
  id?: string;
  title: string;
  category: string;
  image: string;
  imageUrl?: string;
  imagePath?: string;
  alt: string;
  published?: boolean;
  createdAt: Date;
};

export type InquiryDoc = {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  interest: string;
  inquiryType?: "contact" | "property" | "project" | "visit" | string;
  message?: string;
  budget?: string;
  propertyType?: string;
  location?: string;
  propertySlug?: string;
  projectSlug?: string;
  property?: string;
  project?: string;
  preferredVisitDate?: string;
  status: "new" | "contacted" | "closed";
  createdAt: Date;
};

export type NewsletterDoc = {
  id?: string;
  email: string;
  subscribedAt?: Date;
  createdAt: Date;
};

export type UserRole = "admin" | "agent" | "user" | "seo_manager";

export type UserDoc = {
  id?: string;
  name?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive?: boolean;
  canPublishArticles?: boolean;
  createdAt: Date;
  updatedAt?: Date;
};

export type TestimonialDoc = {
  id?: string;
  name: string;
  designation?: string;
  image?: string;
  review: string;
  rating: number;
  published?: boolean;
  createdAt: Date;
  updatedAt?: Date;
};

export type CommunityDoc = {
  id?: string;
  slug: string;
  name: string;
  shortDescription?: string;
  description: string;
  location?: string;
  image?: string;
  imageUrl?: string;
  imagePath?: string;
  highlights?: string[];
  propertyTypes?: string[];
  featured?: boolean;
  published: boolean;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type MarketInsightDoc = {
  id?: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  source?: string;
  sourceUrl?: string;
  date?: string;
  image?: string;
  imageUrl?: string;
  published: boolean;
  featured?: boolean;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
};

/* ---- PostgreSQL row shapes ---- */

export type UserRow = {
  id: string;
  name: string | null;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  can_publish_articles: boolean;
  created_at: Date;
  updated_at: Date | null;
};

export type DeveloperRow = {
  id: string;
  slug: string;
  name: string;
  published: boolean;
};
