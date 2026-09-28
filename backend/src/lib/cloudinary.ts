import { randomBytes } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";

/*
 * Every website image lives in Cloudinary under knc-horizon/, in the folder that matches
 * where it is used: the site's own photos were migrated there (scripts/migrate-images-to-
 * cloudinary.mjs) and admin uploads join them. The list is closed: an upload naming any other
 * folder is refused instead of scattering assets across the account. Credentials come from the environment only
 * (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) and never leave the server.
 */
export const MEDIA_FOLDERS = [
  "knc-horizon/properties",
  "knc-horizon/properties/residential",
  "knc-horizon/properties/commercial",
  "knc-horizon/properties/investment",
  "knc-horizon/properties/off-plan",
  "knc-horizon/projects",
  "knc-horizon/projects/featured",
  "knc-horizon/projects/new-launches",
  "knc-horizon/projects/off-plan",
  "knc-horizon/developers",
  "knc-horizon/communities",
  "knc-horizon/interiors",
  "knc-horizon/gallery",
  "knc-horizon/blog",
  "knc-horizon/pages",
  "knc-horizon/hero",
  "knc-horizon/logos",
  "knc-horizon/india-office",
] as const;

export type MediaFolder = (typeof MEDIA_FOLDERS)[number];
export const DEFAULT_MEDIA_FOLDER: MediaFolder = "knc-horizon/pages";

/** A failure the API answers with as-is: an HTTP status and a message written for the admin. */
export class MediaError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "MediaError";
    this.status = status;
  }
}

/**
 * The folder an upload goes to. Empty means the default; "knc-horizon" alone is what consoles
 * built before the folder list sent. The match ignores case, so a browser tab still open on
 * the earlier upper-case folder names keeps working after a deploy.
 */
export function mediaFolder(value: unknown): MediaFolder {
  const wanted = typeof value === "string" ? value.trim().replace(/^\/+|\/+$/g, "") : "";
  if (!wanted || wanted.toLowerCase() === "knc-horizon") return DEFAULT_MEDIA_FOLDER;
  const folder = MEDIA_FOLDERS.find((entry) => entry.toLowerCase() === wanted.toLowerCase());
  if (!folder) throw new MediaError(400, `Unknown upload folder "${wanted}". Choose one of the knc-horizon folders.`);
  return folder;
}

/* ---------------------------------------------------------------- configuration */

const REQUIRED_ENV = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"] as const;

/*
 * Cloudinary cloud names are lower case, and the API compares them exactly: "ComplaintReview"
 * copied from the dashboard's account title is refused with "cloud_name mismatch" while
 * "complaintreview" works. Lower-casing here makes that easy slip harmless.
 */
function cloudName() {
  return process.env.CLOUDINARY_CLOUD_NAME?.trim().toLowerCase() || null;
}

/** Which of the three variables are set. Names only: no value is ever reported. */
export function cloudinaryStatus() {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]?.trim());
  return {
    configured: missing.length === 0,
    cloudName: cloudName(),
    missing,
  };
}

function ensureConfig() {
  const status = cloudinaryStatus();
  if (!status.configured) {
    throw new MediaError(
      503,
      `Cloudinary is not set up on this server, so images cannot be uploaded or deleted: ${status.missing.join(", ")} ${status.missing.length === 1 ? "is" : "are"} missing. Add ${status.missing.length === 1 ? "it" : "them"} to the backend environment and restart.`,
    );
  }
  cloudinary.config({
    cloud_name: cloudName()!,
    api_key: process.env.CLOUDINARY_API_KEY!.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET!.trim(),
    secure: true,
  });
}

/* ---------------------------------------------------------------- validation */

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/*
 * The browser's file type is only a claim, so the first bytes decide. A renamed PDF or a
 * truncated download is refused here with a clear message instead of failing inside
 * Cloudinary. HEIC is what iPhones save; Cloudinary converts it for delivery.
 */
const SIGNATURES: { type: string; test: (bytes: Buffer) => boolean }[] = [
  { type: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { type: "image/png", test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { type: "image/gif", test: (b) => /^GIF8[79]a/.test(b.subarray(0, 6).toString("latin1")) },
  { type: "image/webp", test: (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP" },
  { type: "image/avif", test: (b) => b.subarray(4, 8).toString("latin1") === "ftyp" && /^avi[fs]/.test(b.subarray(8, 12).toString("latin1")) },
  { type: "image/heic", test: (b) => b.subarray(4, 8).toString("latin1") === "ftyp" && /^(heic|heix|hevc|heim|heis|mif1|msf1)/.test(b.subarray(8, 12).toString("latin1")) },
  { type: "image/svg+xml", test: (b) => /^(﻿)?\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE[^>]*>\s*)?<svg[\s>]/i.test(b.subarray(0, 4096).toString("utf8")) },
];

export const ACCEPTED_IMAGE_LABEL = "JPG, PNG, WEBP, GIF, AVIF, HEIC or SVG";

/** The real image type of a file, or undefined when it is not an image this site accepts. */
export function detectImageType(bytes: Buffer): string | undefined {
  if (!bytes.length) return undefined;
  return SIGNATURES.find((signature) => signature.test(bytes))?.type;
}

/* ---------------------------------------------------------------- upload and delete */

export type UploadedImage = {
  url: string;
  publicId: string;
  width: number | null;
  height: number | null;
  format: string | null;
  bytes: number | null;
};

/** "Villa Pool (2).JPG" -> "villa-pool-2": readable public ids and URLs, which also help SEO. */
function baseName(filename: string) {
  const stem = filename.replace(/\.[^.]*$/, "");
  const slug = stem
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "image";
}

type CloudinaryFailure = { message?: string; http_code?: number; error?: { message?: string; http_code?: number } };

function toMediaError(reason: unknown, action: "upload" | "delete"): MediaError {
  if (reason instanceof MediaError) return reason;
  const failure = (reason ?? {}) as CloudinaryFailure;
  const code = failure.http_code ?? failure.error?.http_code;
  const detail = failure.message ?? failure.error?.message ?? (reason instanceof Error ? reason.message : "no details");
  if (code === 401 || code === 403) {
    return new MediaError(502, "Cloudinary refused the server's credentials. Check CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.");
  }
  if (code === 420 || code === 429) {
    return new MediaError(503, "Cloudinary's rate limit was reached. Wait a minute and try again.");
  }
  if (code === 400 && action === "upload") {
    return new MediaError(400, `Cloudinary could not read this file as an image (${detail}).`);
  }
  return new MediaError(502, `Cloudinary ${action} failed: ${detail}`);
}

/** Uploads one image as its own Cloudinary asset. */
export async function uploadImage(bytes: Buffer, options: { folder: MediaFolder; filename: string }): Promise<UploadedImage> {
  ensureConfig();
  const publicId = `${baseName(options.filename)}-${randomBytes(3).toString("hex")}`;
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: publicId,
        resource_type: "image",
        overwrite: false,
        filename_override: options.filename,
        timeout: 120_000,
      },
      (error, result) => {
        if (error) return reject(toMediaError(error, "upload"));
        if (!result?.secure_url || !result.public_id) {
          return reject(new MediaError(502, "Cloudinary did not return the uploaded image."));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: typeof result.width === "number" ? result.width : null,
          height: typeof result.height === "number" ? result.height : null,
          format: typeof result.format === "string" ? result.format : null,
          bytes: typeof result.bytes === "number" ? result.bytes : null,
        });
      },
    );
    stream.on("error", (error) => reject(toMediaError(error, "upload")));
    stream.end(bytes);
  });
}

/** Removes an asset. An asset Cloudinary no longer has counts as removed. */
export async function deleteImage(publicId: string): Promise<"ok" | "not found"> {
  ensureConfig();
  let result: { result?: string };
  try {
    result = await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
  } catch (reason) {
    throw toMediaError(reason, "delete");
  }
  if (result?.result === "ok" || result?.result === "not found") return result.result;
  throw new MediaError(502, `Cloudinary could not delete the image (${result?.result ?? "no answer"}).`);
}

/*
 * The public_id inside a delivery URL of this account, e.g.
 *   https://res.cloudinary.com/<cloud>/image/upload/v1712345/knc-horizon/blog/dubai-marina-a1b2c3.jpg
 *   -> knc-horizon/blog/dubai-marina-a1b2c3
 * Anything else (a /images/ path, another host, another account) has none.
 */
export function publicIdFromUrl(url: string): string | undefined {
  const cloud = cloudName();
  if (!cloud || !url) return undefined;
  const prefix = `https://res.cloudinary.com/${cloud}/image/upload/`;
  const clean = url.trim().split(/[?#]/)[0]!.replace(/^http:/, "https:");
  if (!clean.startsWith(prefix)) return undefined;
  const segments = clean.slice(prefix.length).split("/").filter(Boolean);
  const transformation = /^[a-z]{1,3}_[^/]*$/;
  // Delivery transformations (f_auto,q_auto/...) and the version (v1712345) come first.
  while (segments.length > 1 && (transformation.test(segments[0]!) || /^v\d+$/.test(segments[0]!))) segments.shift();
  if (!segments.length) return undefined;
  segments[segments.length - 1] = segments[segments.length - 1]!.replace(/\.[a-z0-9]+$/i, "");
  try {
    return decodeURIComponent(segments.join("/"));
  } catch {
    return segments.join("/");
  }
}
