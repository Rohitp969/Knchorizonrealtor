import { query } from "./postgres.ts";
import { publicIdFromUrl } from "./cloudinary.ts";
import { isImageRef, oneLine } from "./seo.ts";

/*
 * The image fields records carry besides their URLs: alt text for search engines and screen
 * readers, and the Cloudinary public_id that identifies the asset. The public_id is always
 * worked out here on the server, from the media library or the URL itself, so a record can
 * never be saved pointing at an asset id the admin did not actually use.
 */

export type GalleryImage = { url: string; alt: string; publicId: string | null };

export const MAX_ALT_LENGTH = 250;
export const MAX_GALLERY_IMAGES = 30;

/** Alt text as one trimmed line, or undefined when the field was not sent. */
export function cleanAlt(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return oneLine(value).slice(0, MAX_ALT_LENGTH);
}

/** An image URL the site can serve: https:// or a site path such as /images/photo.jpg. */
export function cleanImageUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const url = value.trim();
  if (!url) return "";
  return isImageRef(url) ? url : undefined;
}

/**
 * A gallery list as the console sends it ([{ url, alt }] or plain URLs), cleaned: unusable
 * URLs and repeats dropped, capped in length. Undefined when the field was not sent at all.
 */
export function cleanGallery(value: unknown): GalleryImage[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const seen = new Set<string>();
  const gallery: GalleryImage[] = [];
  for (const entry of value) {
    const record = (typeof entry === "object" && entry !== null ? entry : {}) as Record<string, unknown>;
    const url = cleanImageUrl(typeof entry === "string" ? entry : record.url);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    gallery.push({ url, alt: cleanAlt(record.alt) ?? "", publicId: null });
  }
  return gallery.slice(0, MAX_GALLERY_IMAGES);
}

/** A stored gallery, or for records saved before galleries existed, one built from their URLs. */
export function storedGallery(value: unknown, fallbackUrls: readonly string[] = []): GalleryImage[] {
  const stored = Array.isArray(value)
    ? value
        .filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null && typeof (entry as { url?: unknown }).url === "string")
        .map((entry) => ({ url: String(entry.url), alt: typeof entry.alt === "string" ? entry.alt : "", publicId: typeof entry.publicId === "string" ? entry.publicId : null }))
    : [];
  if (stored.length) return stored;
  return fallbackUrls.filter(Boolean).map((url) => ({ url, alt: "", publicId: null }));
}

/** public_id for each URL: the media library's record first, then the URL itself. */
export async function publicIdsFor(urls: readonly string[]) {
  const unique = [...new Set(urls.filter(Boolean))];
  const ids = new Map<string, string | null>();
  if (!unique.length) return ids;
  const rows = await query<{ url: string; public_id: string | null }>(
    `select url, public_id from media where url = any($1::text[]) and public_id is not null`,
    [unique],
  );
  for (const row of rows) ids.set(row.url, row.public_id);
  for (const url of unique) if (!ids.has(url)) ids.set(url, publicIdFromUrl(url) ?? null);
  return ids;
}

/**
 * Sets the public_id beside every image URL a document is about to save.
 * `singles` maps a URL field to its public_id field, e.g. { coverImage: "coverImagePublicId" }.
 */
export async function attachPublicIds<T extends Record<string, unknown>>(
  document: T,
  singles: Record<string, string>,
  galleryKey?: string,
): Promise<T> {
  const result: Record<string, unknown> = { ...document };
  const gallery = galleryKey && Array.isArray(result[galleryKey]) ? (result[galleryKey] as GalleryImage[]) : undefined;
  const urls = [
    ...Object.keys(singles).map((key) => result[key]).filter((value): value is string => typeof value === "string"),
    ...(gallery ?? []).map((image) => image.url),
  ];
  const ids = await publicIdsFor(urls);
  for (const [urlKey, idKey] of Object.entries(singles)) {
    const url = result[urlKey];
    if (typeof url === "string") result[idKey] = url ? ids.get(url) ?? null : null;
  }
  if (galleryKey && gallery) result[galleryKey] = gallery.map((image) => ({ ...image, publicId: ids.get(image.url) ?? null }));
  return result as T;
}

/**
 * Every record that shows this image, so deleting it from the media library does not leave a
 * broken picture on the website without the admin knowing.
 */
export async function imageUsage(url: string) {
  const inGallery = JSON.stringify([{ url }]);
  return query<{ kind: string; name: string }>(
    `select 'Property' as kind, title as name from properties
      where $1 = any(images) or cover_image = $1 or image_url = $1 or gallery_images @> $2::jsonb
     union all
     select 'Project', title from projects
      where image = $1 or cover_image = $1 or image_url = $1 or $1 = any(gallery) or gallery_images @> $2::jsonb
     union all
     select 'Blog post', title from posts where image = $1 or featured_image = $1 or cover_image = $1 or image_url = $1
     union all
     select 'Gallery', title from gallery where image = $1 or image_url = $1
     union all
     select 'Developer', name from developers where logo = $1 or cover_image = $1 or image_url = $1
     union all
     select 'Community', name from communities where image = $1 or image_url = $1
     union all
     select 'Market insight', title from insights where image = $1 or image_url = $1
     union all
     select 'Testimonial', name from testimonials where image = $1
     union all
     select 'Website content', 'Site settings' from settings where strpos(value::text, $1) > 0
     union all
     select 'SEO', coalesce(page_key, 'Listing share image') from seo_meta where og_image = $1
     union all
     select 'SEO', 'Default share image' from seo_settings where default_og_image = $1
     limit 25`,
    [url, inGallery],
  );
}
