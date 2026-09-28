/*
 * The KNC Horizon Realtor logos and favicon, served from Cloudinary (knc-horizon/logos).
 * Nothing is served from public/ any more; git history keeps the original SVG files.
 */
export const BRAND_FAVICON = 'https://res.cloudinary.com/complaintreview/image/upload/v1790586480/knc-horizon/logos/favicon.svg';

export const BRAND_LOGOS = {
  'horizontal': 'https://res.cloudinary.com/complaintreview/image/upload/v1790577276/knc-horizon/logos/knc-logo-horizontal.svg',
  'horizontal-light': 'https://res.cloudinary.com/complaintreview/image/upload/v1790577276/knc-horizon/logos/knc-logo-horizontal-light.svg',
  'emblem': 'https://res.cloudinary.com/complaintreview/image/upload/v1790577276/knc-horizon/logos/knc-logo-emblem.svg',
  'emblem-light': 'https://res.cloudinary.com/complaintreview/image/upload/v1790577276/knc-horizon/logos/knc-logo-emblem-light.svg',
  'stacked': 'https://res.cloudinary.com/complaintreview/image/upload/v1790577278/knc-horizon/logos/knc-logo-stacked.svg',
  'stacked-light': 'https://res.cloudinary.com/complaintreview/image/upload/v1790577278/knc-horizon/logos/knc-logo-stacked-light.svg',
} as const;

export type BrandLogo = keyof typeof BRAND_LOGOS;
