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

/** A failed request; `errors` carries the server's per-field messages when it sent any. */
export class AdminRequestError extends Error {
  errors?: { field: string; message: string }[];
}

async function readError(response: Response, ErrorType: typeof AdminRequestError = AdminRequestError) {
  const payload = (await response.json().catch(() => ({}))) as { message?: string; errors?: { field: string; message: string }[] };
  const message = payload.message
    || (response.status === 404 ? 'Not found.'
      : response.status === 422 ? 'Some fields need attention.'
        : response.status >= 500 ? 'The server had a problem completing that request.'
          : `Request failed (${response.status}).`);
  const error = new ErrorType(message);
  if (Array.isArray(payload.errors)) error.errors = payload.errors;
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

/** Sends a real file to the backend, which stores it in Cloudinary and returns a permanent URL. */
export async function uploadAdminImage(file: File, folder = 'knc-horizon') {
  const body = new FormData();
  body.append('image', file);
  body.append('folder', folder);
  return adminRequest<{ url: string; publicId?: string; filename: string; warning?: string }>(
    '/admin/uploads',
    { method: 'POST', body },
  );
}

export type MediaItem = {
  id: string;
  url: string;
  publicId?: string;
  filename?: string;
  mimetype?: string;
  size?: number;
  folder?: string;
  createdAt?: string;
};

export function listMedia() {
  return adminRequest<{ items: MediaItem[] }>('/admin/media').then((data) => data.items ?? []);
}

export function deleteMedia(id: string) {
  return adminRequest<void>(`/admin/media/${id}`, { method: 'DELETE' });
}
