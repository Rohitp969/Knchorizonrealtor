import type { ObjectId } from "mongodb";

export type PropertyDoc = {
  _id?: ObjectId;
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
  _id?: ObjectId;
  slug: string;
  title: string;
  description: string;
  developer: string;
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
  _id?: ObjectId;
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
  _id?: ObjectId;
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
  _id?: ObjectId;
  title: string;
  category: string;
  image: string;
  imageUrl?: string;
  imagePath?: string;
  alt: string;
  createdAt: Date;
};

export type InquiryDoc = {
  _id?: ObjectId;
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
  property?: ObjectId;
  project?: ObjectId;
  preferredVisitDate?: string;
  status: "new" | "contacted" | "closed";
  createdAt: Date;
};

export type NewsletterDoc = {
  _id?: ObjectId;
  email: string;
  subscribedAt?: Date;
  createdAt: Date;
};

export type UserDoc = {
  _id?: ObjectId;
  name?: string;
  email: string;
  passwordHash: string;
  role: "admin" | "agent" | "user";
  createdAt: Date;
};

export type TestimonialDoc = {
  _id?: ObjectId;
  name: string;
  designation?: string;
  image?: string;
  review: string;
  rating: number;
  published?: boolean;
  createdAt: Date;
  updatedAt?: Date;
};