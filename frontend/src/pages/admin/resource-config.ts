/*
 * One entry per admin section. Endpoints and field names come from the existing
 * Express routes (backend/src/routes/admin.ts) and Mongo models (backend/src/lib/models.ts) —
 * nothing here is invented.
 */

export type FieldType =
  | 'text'
  | 'slug'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'select'
  | 'boolean'
  | 'image'
  | 'tags'
  | 'date';

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: string[];
  /** Fill the dropdown from another collection (developers / communities). */
  optionsFrom?: 'developers' | 'communities';
  /** Build the slug from this field when the slug is left empty. */
  slugFrom?: string;
  full?: boolean;
  group?: string;
};

export type ColumnConfig = {
  name: string;
  label: string;
  type?: 'text' | 'image' | 'price' | 'badge' | 'boolean' | 'date';
  currencyField?: string;
};

export type FilterConfig = {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  /** Compare against this field; 'true'/'false' work on booleans. */
  field?: string;
};

export type ResourceConfig = {
  key: string;
  label: string;
  singular: string;
  list: string;
  create: string;
  update: (id: string) => string;
  updateMethod?: 'PUT' | 'PATCH';
  remove: (id: string) => string;
  /** Key in the list response, e.g. { items: [] } or { posts: [] }. */
  listKey?: string;
  itemKey?: string;
  searchKeys: string[];
  titleKey: string;
  imageKey?: string;
  publishField?: string;
  featureField?: string;
  columns: ColumnConfig[];
  filters?: FilterConfig[];
  fields: FieldConfig[];
  defaults?: Record<string, unknown>;
  emptyHint?: string;
};

const PUBLISH_FILTER: FilterConfig = {
  name: 'published',
  label: 'Status',
  field: 'published',
  options: [
    { value: '', label: 'All' },
    { value: 'true', label: 'Published' },
    { value: 'false', label: 'Draft' },
  ],
};

const FEATURED_FILTER: FilterConfig = {
  name: 'featured',
  label: 'Featured',
  field: 'featured',
  options: [
    { value: '', label: 'All' },
    { value: 'true', label: 'Featured' },
    { value: 'false', label: 'Not featured' },
  ],
};

export const PROPERTY_TYPES = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Plot', 'Office', 'Retail', 'Commercial'];
export const LISTING_TYPES = ['sale', 'rent'];
export const PROPERTY_STATUS = ['For sale', 'For rent', 'Off-plan', 'Under construction', 'Sold', 'Leased'];

export const resources: Record<string, ResourceConfig> = {
  properties: {
    key: 'properties',
    label: 'Properties',
    singular: 'Property',
    list: '/admin/properties-list',
    create: '/admin/properties',
    update: (id) => `/admin/properties/${id}`,
    updateMethod: 'PUT',
    remove: (id) => `/admin/properties/${id}`,
    searchKeys: ['title', 'location', 'community', 'slug', 'type'],
    titleKey: 'title',
    imageKey: 'images',
    publishField: 'published',
    featureField: 'featured',
    columns: [
      { name: 'images', label: '', type: 'image' },
      { name: 'title', label: 'Title' },
      { name: 'type', label: 'Type' },
      { name: 'location', label: 'Location' },
      { name: 'price', label: 'Price', type: 'price', currencyField: 'currency' },
      { name: 'bedrooms', label: 'Beds' },
      { name: 'size', label: 'Area (sq ft)' },
      { name: 'status', label: 'Status', type: 'badge' },
    ],
    filters: [
      PUBLISH_FILTER,
      FEATURED_FILTER,
      {
        name: 'listingType',
        label: 'Sale / Rent',
        field: 'listingType',
        options: [
          { value: '', label: 'All' },
          { value: 'sale', label: 'For sale' },
          { value: 'rent', label: 'For rent' },
        ],
      },
      {
        name: 'type',
        label: 'Property type',
        field: 'type',
        options: [{ value: '', label: 'All' }, ...PROPERTY_TYPES.map((t) => ({ value: t, label: t }))],
      },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, group: 'Details' },
      { name: 'slug', label: 'Slug', type: 'slug', required: true, slugFrom: 'title', help: 'Used in the public URL: /properties/<slug>', group: 'Details' },
      { name: 'type', label: 'Property type', type: 'select', options: PROPERTY_TYPES, required: true, group: 'Details' },
      { name: 'listingType', label: 'Listing type', type: 'select', options: LISTING_TYPES, group: 'Details' },
      { name: 'status', label: 'Status', type: 'select', options: PROPERTY_STATUS, required: true, group: 'Details' },
      { name: 'location', label: 'Location', type: 'text', required: true, group: 'Location' },
      { name: 'community', label: 'Community', type: 'text', optionsFrom: 'communities', group: 'Location' },
      { name: 'city', label: 'City', type: 'text', group: 'Location' },
      { name: 'price', label: 'Price', type: 'number', required: true, group: 'Pricing' },
      { name: 'currency', label: 'Currency', type: 'select', options: ['AED', 'USD', 'EUR', 'GBP', 'INR'], group: 'Pricing' },
      { name: 'bedrooms', label: 'Bedrooms', type: 'number', group: 'Specification' },
      { name: 'bathrooms', label: 'Bathrooms', type: 'number', group: 'Specification' },
      { name: 'size', label: 'Area (sq ft)', type: 'number', group: 'Specification' },
      { name: 'description', label: 'Description', type: 'textarea', required: true, full: true, group: 'Content' },
      { name: 'amenities', label: 'Amenities', type: 'tags', full: true, help: 'Comma separated', group: 'Content' },
      { name: 'highlights', label: 'Highlights', type: 'tags', full: true, help: 'Comma separated', group: 'Content' },
      { name: 'images', label: 'Images', type: 'image', full: true, help: 'First image is the main one', group: 'Media' },
      { name: 'featured', label: 'Featured on the home page', type: 'boolean', group: 'Visibility' },
      { name: 'published', label: 'Published on the website', type: 'boolean', group: 'Visibility' },
    ],
    defaults: {
      currency: 'AED', type: 'Apartment', listingType: 'sale', status: 'For sale',
      bedrooms: 0, bathrooms: 0, size: 0, price: 0, images: [], amenities: [], featured: false, published: true,
    },
    emptyHint: 'Add your first property to publish it on the public Properties page.',
  },

  projects: {
    key: 'projects',
    label: 'Off-Plan Projects',
    singular: 'Project',
    list: '/admin/projects-list',
    create: '/admin/projects',
    update: (id) => `/admin/projects/${id}`,
    updateMethod: 'PUT',
    remove: (id) => `/admin/projects/${id}`,
    searchKeys: ['title', 'developer', 'location', 'slug'],
    titleKey: 'title',
    imageKey: 'image',
    publishField: 'published',
    featureField: 'featured',
    columns: [
      { name: 'image', label: '', type: 'image' },
      { name: 'title', label: 'Project' },
      { name: 'developer', label: 'Developer' },
      { name: 'location', label: 'Location' },
      { name: 'startingPrice', label: 'From', type: 'price' },
      { name: 'handover', label: 'Handover' },
      { name: 'status', label: 'Status', type: 'badge' },
    ],
    filters: [
      PUBLISH_FILTER,
      FEATURED_FILTER,
      {
        name: 'offPlan',
        label: 'Launch',
        field: 'newLaunch',
        options: [
          { value: '', label: 'All' },
          { value: 'true', label: 'New launch' },
          { value: 'false', label: 'Not a new launch' },
        ],
      },
    ],
    fields: [
      { name: 'title', label: 'Project name', type: 'text', required: true, group: 'Details' },
      { name: 'slug', label: 'Slug', type: 'slug', required: true, slugFrom: 'title', group: 'Details' },
      { name: 'developer', label: 'Developer', type: 'select', optionsFrom: 'developers', required: true, group: 'Details' },
      { name: 'location', label: 'Location', type: 'text', required: true, group: 'Details' },
      { name: 'category', label: 'Property types', type: 'text', help: 'e.g. Apartments, Villas', group: 'Details' },
      { name: 'status', label: 'Launch status', type: 'select', options: ['Launching soon', 'Now selling', 'Under construction', 'Ready'], group: 'Details' },
      { name: 'startingPrice', label: 'Starting price', type: 'number', required: true, group: 'Pricing' },
      { name: 'handover', label: 'Handover', type: 'text', placeholder: 'Q4 2027', group: 'Pricing' },
      { name: 'completionDate', label: 'Completion date', type: 'text', group: 'Pricing' },
      { name: 'description', label: 'Description', type: 'textarea', required: true, full: true, group: 'Content' },
      { name: 'amenities', label: 'Amenities', type: 'tags', full: true, group: 'Content' },
      { name: 'highlights', label: 'Payment plan / highlights', type: 'tags', full: true, help: 'Comma separated', group: 'Content' },
      { name: 'image', label: 'Cover image', type: 'image', full: true, group: 'Media' },
      { name: 'newLaunch', label: 'New launch', type: 'boolean', group: 'Visibility' },
      { name: 'offPlan', label: 'Off-plan', type: 'boolean', group: 'Visibility' },
      { name: 'featured', label: 'Featured', type: 'boolean', group: 'Visibility' },
      { name: 'published', label: 'Published on the website', type: 'boolean', group: 'Visibility' },
    ],
    defaults: { startingPrice: 0, featured: false, published: true, offPlan: true, newLaunch: false, amenities: [], highlights: [] },
    emptyHint: 'Projects added here appear on the public Off-Plan pages.',
  },

  developers: {
    key: 'developers',
    label: 'Developers',
    singular: 'Developer',
    list: '/admin/developers-detail',
    create: '/admin/developers',
    update: (id) => `/admin/developers/${id}`,
    updateMethod: 'PUT',
    remove: (id) => `/admin/developers/${id}`,
    searchKeys: ['name', 'slug', 'description'],
    titleKey: 'name',
    imageKey: 'logo',
    publishField: 'published',
    featureField: 'featured',
    columns: [
      { name: 'logo', label: '', type: 'image' },
      { name: 'name', label: 'Developer' },
      { name: 'shortDescription', label: 'Summary' },
      { name: 'officialWebsite', label: 'Website' },
      { name: 'projectCount', label: 'Projects' },
    ],
    filters: [PUBLISH_FILTER, FEATURED_FILTER],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, group: 'Details' },
      { name: 'slug', label: 'Slug', type: 'slug', required: true, slugFrom: 'name', group: 'Details' },
      { name: 'established', label: 'Established', type: 'text', group: 'Details' },
      { name: 'officialWebsite', label: 'Official website', type: 'text', placeholder: 'https://', group: 'Details' },
      { name: 'shortDescription', label: 'Short description', type: 'textarea', full: true, group: 'Content' },
      { name: 'description', label: 'Description', type: 'textarea', required: true, full: true, group: 'Content' },
      { name: 'areas', label: 'Communities / areas', type: 'tags', full: true, help: 'Comma separated', group: 'Content' },
      { name: 'logo', label: 'Logo', type: 'image', group: 'Media' },
      { name: 'coverImage', label: 'Cover image', type: 'image', group: 'Media' },
      { name: 'featured', label: 'Featured', type: 'boolean', group: 'Visibility' },
      { name: 'published', label: 'Published on the website', type: 'boolean', group: 'Visibility' },
    ],
    defaults: { published: true, featured: false, areas: [] },
    emptyHint: 'Developers appear on /developers and can be linked from projects.',
  },

  communities: {
    key: 'communities',
    label: 'Communities',
    singular: 'Community',
    list: '/admin/communities-list',
    create: '/admin/communities',
    update: (id) => `/admin/communities/${id}`,
    updateMethod: 'PUT',
    remove: (id) => `/admin/communities/${id}`,
    searchKeys: ['name', 'slug', 'location'],
    titleKey: 'name',
    imageKey: 'image',
    publishField: 'published',
    featureField: 'featured',
    columns: [
      { name: 'image', label: '', type: 'image' },
      { name: 'name', label: 'Community' },
      { name: 'location', label: 'Location' },
      { name: 'shortDescription', label: 'Summary' },
    ],
    filters: [PUBLISH_FILTER, FEATURED_FILTER],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, group: 'Details' },
      { name: 'slug', label: 'Slug', type: 'slug', required: true, slugFrom: 'name', group: 'Details' },
      { name: 'location', label: 'Location', type: 'text', group: 'Details' },
      { name: 'shortDescription', label: 'Short description', type: 'textarea', full: true, group: 'Content' },
      { name: 'description', label: 'Description', type: 'textarea', required: true, full: true, group: 'Content' },
      { name: 'highlights', label: 'Highlights', type: 'tags', full: true, group: 'Content' },
      { name: 'propertyTypes', label: 'Property types', type: 'tags', full: true, group: 'Content' },
      { name: 'image', label: 'Image', type: 'image', full: true, group: 'Media' },
      { name: 'featured', label: 'Featured', type: 'boolean', group: 'Visibility' },
      { name: 'published', label: 'Published on the website', type: 'boolean', group: 'Visibility' },
    ],
    defaults: { published: true, featured: false, highlights: [], propertyTypes: [] },
  },

  posts: {
    key: 'posts',
    label: 'Blog',
    singular: 'Post',
    list: '/admin/blog',
    create: '/admin/blog',
    update: (id) => `/admin/blog/${id}`,
    updateMethod: 'PATCH',
    remove: (id) => `/admin/blog/${id}`,
    listKey: 'posts',
    itemKey: 'post',
    searchKeys: ['title', 'slug', 'category', 'author'],
    titleKey: 'title',
    imageKey: 'image',
    publishField: 'published',
    columns: [
      { name: 'image', label: '', type: 'image' },
      { name: 'title', label: 'Title' },
      { name: 'category', label: 'Category' },
      { name: 'author', label: 'Author' },
      { name: 'publishedAt', label: 'Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'badge' },
    ],
    filters: [PUBLISH_FILTER],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, group: 'Details' },
      { name: 'slug', label: 'Slug', type: 'slug', required: true, slugFrom: 'title', group: 'Details' },
      { name: 'category', label: 'Category', type: 'text', required: true, group: 'Details' },
      { name: 'author', label: 'Author', type: 'text', group: 'Details' },
      { name: 'publishedAt', label: 'Publish date', type: 'date', group: 'Details' },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', full: true, group: 'Content' },
      { name: 'content', label: 'Content', type: 'richtext', required: true, full: true, group: 'Content' },
      { name: 'image', label: 'Featured image', type: 'image', full: true, group: 'Media' },
      { name: 'seoTitle', label: 'SEO title', type: 'text', group: 'SEO' },
      { name: 'seoDescription', label: 'SEO description', type: 'textarea', full: true, group: 'SEO' },
      { name: 'published', label: 'Published on the website', type: 'boolean', group: 'Visibility' },
    ],
    defaults: { published: true, author: 'KNC Horizon Realtor', category: 'Perspective' },
  },

  insights: {
    key: 'insights',
    label: 'Market Insights',
    singular: 'Insight',
    list: '/admin/insights-list',
    create: '/admin/insights',
    update: (id) => `/admin/insights/${id}`,
    updateMethod: 'PUT',
    remove: (id) => `/admin/insights/${id}`,
    searchKeys: ['title', 'slug', 'category', 'source'],
    titleKey: 'title',
    imageKey: 'image',
    publishField: 'published',
    featureField: 'featured',
    columns: [
      { name: 'image', label: '', type: 'image' },
      { name: 'title', label: 'Title' },
      { name: 'category', label: 'Category' },
      { name: 'source', label: 'Source' },
      { name: 'date', label: 'Date' },
    ],
    filters: [PUBLISH_FILTER, FEATURED_FILTER],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, group: 'Details' },
      { name: 'slug', label: 'Slug', type: 'slug', required: true, slugFrom: 'title', group: 'Details' },
      { name: 'category', label: 'Category', type: 'text', required: true, group: 'Details' },
      { name: 'date', label: 'Date', type: 'text', placeholder: 'Q1 2026', group: 'Details' },
      { name: 'source', label: 'Source', type: 'text', help: 'Where the figures come from', group: 'Source' },
      { name: 'sourceUrl', label: 'Source URL', type: 'text', placeholder: 'https://', group: 'Source' },
      { name: 'summary', label: 'Summary', type: 'textarea', required: true, full: true, group: 'Content' },
      { name: 'content', label: 'Content', type: 'richtext', required: true, full: true, group: 'Content' },
      { name: 'image', label: 'Image', type: 'image', full: true, group: 'Media' },
      { name: 'featured', label: 'Featured', type: 'boolean', group: 'Visibility' },
      { name: 'published', label: 'Published', type: 'boolean', group: 'Visibility' },
    ],
    defaults: { published: true, featured: false },
  },

  gallery: {
    key: 'gallery',
    label: 'Gallery',
    singular: 'Gallery item',
    list: '/admin/gallery-list',
    create: '/admin/gallery',
    update: (id) => `/admin/gallery/${id}`,
    updateMethod: 'PUT',
    remove: (id) => `/admin/gallery/${id}`,
    searchKeys: ['title', 'category', 'alt'],
    titleKey: 'title',
    imageKey: 'image',
    columns: [
      { name: 'image', label: '', type: 'image' },
      { name: 'title', label: 'Title' },
      { name: 'category', label: 'Category' },
      { name: 'alt', label: 'Alt text' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, group: 'Details' },
      { name: 'category', label: 'Category', type: 'text', required: true, group: 'Details' },
      { name: 'alt', label: 'Alt text', type: 'text', required: true, help: 'Describes the photo for screen readers', full: true, group: 'Details' },
      { name: 'image', label: 'Image', type: 'image', required: true, full: true, group: 'Media' },
    ],
    defaults: { category: 'Interiors' },
  },
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
