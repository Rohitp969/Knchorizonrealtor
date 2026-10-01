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

/*
 * A srcset for the same image at several widths, so a phone fetches a 480px file and a 4K
 * screen a 1600px one. `sizes` says how wide the slot is; CARD_SIZES fits the site's card
 * grids (one column on phones, two on tablets, three from 1024px) and HERO_SIZES a full-width
 * header. Non-Cloudinary URLs get no srcset and fall back to plain src.
 */
export const CARD_SIZES = '(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw';
export const HERO_SIZES = '100vw';
export const GALLERY_SIZES = '(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw';

export function responsiveImage(url: string | null | undefined, widths: number[] = [480, 800, 1200, 1600]) {
  const src = optimizedImage(url, widths[widths.length - 1]);
  if (!url || !UPLOAD_URL.test(url) || src === url) return { src, srcSet: undefined };
  return { src, srcSet: widths.map((width) => `${optimizedImage(url, width)} ${width}w`).join(', ') };
}

/** Alt text for an image in a list: its own, when the admin wrote one, else the fallback. */
export function altFor(url: string, gallery: { url: string; alt?: string }[] | undefined, fallback: string) {
  return gallery?.find((image) => image.url === url)?.alt?.trim() || fallback;
}

/*
 * Whether a gallery image is representative imagery: a real photo of a comparable place in
 * Dubai standing in for the listing or project itself. The pages label these, so a visitor is
 * never told such a photo shows the actual home or project.
 */
export function isRepresentative(url: string, gallery: { url: string; representative?: boolean }[] | undefined) {
  return gallery?.find((image) => image.url === url)?.representative === true;
}
