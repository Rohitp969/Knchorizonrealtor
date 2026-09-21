import { apiRoot } from '@/lib/api';

/*
 * Admin API layer.
 * Every call carries the JWT issued by POST /auth/login and surfaces the backend's own
 * message on failure. A 401/403 throws AdminAuthError so the console can drop back to
 * the login screen instead of showing a dead page.
 */

export const ADMIN_TOKEN_KEY = 'knc_admin_token';

export class AdminAuthError extends Error {}

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

async function readError(response: Response) {
  const payload = await response.json().catch(() => ({}));
  const message = (payload as { message?: string }).message;
  if (message) return message;
  if (response.status === 404) return 'Not found.';
  if (response.status === 422) return 'Some fields need attention.';
  if (response.status >= 500) return 'The server had a problem completing that request.';
  return `Request failed (${response.status}).`;
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
    throw new AdminAuthError(await readError(response));
  }
  if (!response.ok) {
    throw new Error(await readError(response));
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
  if (payload.user && !['admin', 'agent'].includes(payload.user.role)) {
    throw new Error('This account does not have admin access.');
  }
  setAdminToken(payload.token);
  return payload.user;
}

export type AdminUser = { id: string; email: string; role: 'admin' | 'agent' | 'user' };

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
