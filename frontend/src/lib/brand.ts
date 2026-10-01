/*
 * The KNC Horizon Realtor logos and favicon, served from Cloudinary (knc-horizon/logos).
 * Nothing is served from public/ any more; git history keeps the original SVG files.
 */
export const BRAND_FAVICON = 'https://res.cloudinary.com/complaintreview/image/upload/v1790662327/knc-horizon/logos/knc-icon.svg';

/*
 * One logo everywhere: the golden emblem the owner supplied on 1 October 2026 (the KNC mark
 * over the Dubai skyline, the wordmark under it), cut out of its golden background so it sits
 * on the page like the earlier mark did. The gold reads on light and dark alike, so the one
 * image serves the website header and footer, the admin sign-in, the admin sidebar and the
 * structured data. The owner's original file is knc-logo-gold.jpg beside it in Cloudinary;
 * the earlier stacked SVG marks (knc-logo-stacked and -light) stay there unused.
 */
export const BRAND_LOGO = {
  src: 'https://res.cloudinary.com/complaintreview/image/upload/v1790836294/knc-horizon/logos/knc-logo-gold-cutout.png',
  width: 1156,
  height: 730,
  alt: 'KNC Horizon Realtor',
} as const;

/*
 * The mark alone: the KNC letters with the skyline, cut from the emblem above (its wordmark
 * rows left off). The header shows this beside the name set in type, because the whole emblem
 * turns to mush at menu-bar height; the footer and the admin show the full emblem.
 */
export const BRAND_MARK = {
  src: 'https://res.cloudinary.com/complaintreview/image/upload/v1790837233/knc-horizon/logos/knc-logo-gold-mark.png',
  width: 1137,
  height: 498,
} as const;
