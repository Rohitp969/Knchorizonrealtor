import { apiRoot } from '@/lib/api';

/*
 * Admin API layer.
 * Every call carries the JWT issued by POST /auth/login and surfaces the backend's own
 * message on failure. A 401/403 throws AdminAuthError so the console can drop back to
 * the login screen instead of showing a dead page.
 */

export const ADMIN_TOKEN_KEY = 'knc_admin_token';

export class AdminAuthError extends Error {
  errors?: { field: string; message: string }[];
}

export function getAdminToken() {
  try {
    return window.localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string) {
  try {
    window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch {
    /* private mode: the session simply won't survive a reload */
  }
}

export function clearAdminToken() {
  try {
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * A failed request. `errors` carries the server's per-field messages, `usedBy` the records
 * still showing an image the admin tried to delete, and `status` the HTTP status.
 */
export class AdminRequestError extends Error {
  errors?: { field: string; message: string }[];
  usedBy?: { kind: string; name: string }[];
  status?: number;
}

async function readError(response: Response, ErrorType: typeof AdminRequestError = AdminRequestError) {
  const payload = (await response.json().catch(() => ({}))) as {
    message?: string;
    errors?: { field: string; message: string }[];
    usedBy?: { kind: string; name: string }[];
  };
  const message = payload.message
    || (response.status === 404 ? 'Not found.'
      : response.status === 422 ? 'Some fields need attention.'
        : response.status >= 500 ? 'The server had a problem completing that request.'
          : `Request failed (${response.status}).`);
  const error = new ErrorType(message);
  error.status = response.status;
  if (Array.isArray(payload.errors)) error.errors = payload.errors;
  if (Array.isArray(payload.usedBy)) error.usedBy = payload.usedBy;
  return error;
}

export async function adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  let response: Response;
  try {
    response = await fetch(`${apiRoot}${path}`, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Cannot reach the API. Check that the backend is running.');
  }

  if (response.status === 401 || response.status === 403) {
    throw await readError(response, AdminAuthError);
  }
  if (!response.ok) {
    throw await readError(response);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function adminLogin(email: string, password: string) {
  const response = await fetch(`${apiRoot}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).catch(() => {
    throw new Error('Cannot reach the API. Check that the backend is running.');
  });

  const payload = (await response.json().catch(() => ({}))) as {
    token?: string;
    user?: { id: string; name?: string; email: string; role: string };
    message?: string;
  };
  if (!response.ok || !payload.token) {
    throw new Error(payload.message || 'Invalid admin credentials.');
  }
  if (payload.user && !['admin', 'agent', 'seo_manager'].includes(payload.user.role)) {
    throw new Error('This account does not have admin access.');
  }
  setAdminToken(payload.token);
  return payload.user;
}

export type AdminUser = {
  id: string;
  email: string;
  name?: string | null;
  role: 'admin' | 'agent' | 'user' | 'seo_manager';
  /** Administrators always publish; an SEO manager only when a super admin allowed it. */
  canPublishArticles?: boolean;
};

/** Verifies the stored token against the API; throws AdminAuthError when it is missing or stale. */
export async function fetchAdminUser() {
  if (!getAdminToken()) throw new AdminAuthError('Sign in to continue.');
  const { user } = await adminRequest<{ user: AdminUser }>('/auth/me');
  return user;
}

/*
 * The Cloudinary folders, the same closed list the backend accepts
 * (backend/src/lib/cloudinary.ts). Every upload names one of them.
 */
export const MEDIA_FOLDERS = [
  'knc-horizon/properties',
  'knc-horizon/properties/residential',
  'knc-horizon/properties/commercial',
  'knc-horizon/properties/investment',
  'knc-horizon/properties/off-plan',
  'knc-horizon/projects',
  'knc-horizon/projects/featured',
  'knc-horizon/projects/new-launches',
  'knc-horizon/projects/off-plan',
  'knc-horizon/developers',
  'knc-horizon/communities',
  'knc-horizon/interiors',
  'knc-horizon/gallery',
  'knc-horizon/blog',
  'knc-horizon/pages',
  'knc-horizon/hero',
  'knc-horizon/logos',
  'knc-horizon/india-office',
] as const;

export const DEFAULT_MEDIA_FOLDER = 'knc-horizon/pages';

export type MediaItem = {
  id: string;
  url: string;
  publicId?: string | null;
  filename?: string;
  mimetype?: string;
  size?: number;
  folder?: string;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  createdAt?: string;
};

export type UploadedImage = { url: string; publicId?: string; filename?: string; folder?: string; item?: MediaItem };

/** Sends one file to the backend, which stores it as its own Cloudinary asset in `folder`. */
export async function uploadAdminImage(file: File, folder: string = DEFAULT_MEDIA_FOLDER) {
  const body = new FormData();
  body.append('image', file);
  body.append('folder', folder);
  return adminRequest<UploadedImage>('/admin/uploads', { method: 'POST', body });
}

export type MediaLibrary = {
  items: MediaItem[];
  folders: string[];
  cloudinary?: { configured: boolean; cloudName: string | null };
};

export function loadMediaLibrary() {
  return adminRequest<MediaLibrary>('/admin/media').then((data) => ({
    items: data.items ?? [],
    folders: data.folders?.length ? data.folders : [...MEDIA_FOLDERS],
    cloudinary: data.cloudinary,
  }));
}

export function listMedia() {
  return loadMediaLibrary().then((library) => library.items);
}

/**
 * Deletes from Cloudinary and the library. An image still shown on the website is refused
 * (AdminRequestError with `usedBy`) unless `force` is set.
 */
export function deleteMedia(id: string, options: { force?: boolean } = {}) {
  return adminRequest<void>(`/admin/media/${id}${options.force ? '?force=1' : ''}`, { method: 'DELETE' });
}
