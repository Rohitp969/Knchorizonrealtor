/*
 * The KNC Horizon Realtor logos and favicon, served from Cloudinary (knc-horizon/logos).
 * Nothing is served from public/ any more; git history keeps the original SVG files.
 */
export const BRAND_FAVICON = 'https://res.cloudinary.com/complaintreview/image/upload/v1790594287/knc-horizon/logos/knc-favicon.svg';

/*
 * One logo everywhere: the stacked mark (KNC over HORIZON REALTOR) in the website header and
 * footer, the admin sign-in page, the admin sidebar and the structured data. `stacked-light`
 * is the same logo in ivory, for dark backgrounds. The earlier horizontal and emblem versions
 * are still in Cloudinary but are not used, so every screen shows the same mark.
 */
export const BRAND_LOGOS = {
  'stacked': 'https://res.cloudinary.com/complaintreview/image/upload/v1790577278/knc-horizon/logos/knc-logo-stacked.svg',
  'stacked-light': 'https://res.cloudinary.com/complaintreview/image/upload/v1790577278/knc-horizon/logos/knc-logo-stacked-light.svg',
} as const;

export type BrandLogo = keyof typeof BRAND_LOGOS;
