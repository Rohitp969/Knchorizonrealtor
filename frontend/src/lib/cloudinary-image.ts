/*
 * Cloudinary delivery. f_auto sends each browser the lightest format it understands (AVIF or
 * WebP where supported), q_auto picks a quality that looks the same at a fraction of the bytes,
 * and c_limit,w_<n> caps the width to what the layout actually shows, never enlarging.
 *
 * Only Cloudinary upload URLs are rewritten. The site's own /images/ files and any other host
 * come back untouched, so pages keep working while images move to Cloudinary one by one.
 */
const UPLOAD_URL = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;
const TRANSFORMATION = /^[a-z]{1,3}_[^/]*$/;

export function optimizedImage(url: string | null | undefined, width?: number): string {
  if (!url) return '';
  const match = UPLOAD_URL.exec(url);
  if (!match) return url;
  const [, prefix, rest] = match;
  // A URL that already carries a transformation was set up by hand; leave it as it is.
  if (TRANSFORMATION.test(rest.split('/')[0] ?? '')) return url;
  const steps = ['f_auto', 'q_auto', ...(width ? ['c_limit', `w_${Math.round(width)}`] : [])];
  return `${prefix}${steps.join(',')}/${rest}`;
}

/** Alt text for an image in a list: its own, when the admin wrote one, else the fallback. */
export function altFor(url: string, gallery: { url: string; alt?: string }[] | undefined, fallback: string) {
  return gallery?.find((image) => image.url === url)?.alt?.trim() || fallback;
}
