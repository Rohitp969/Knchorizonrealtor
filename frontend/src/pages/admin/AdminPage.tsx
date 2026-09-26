import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'wouter';

import { AdminAuthError, clearAdminToken, fetchAdminUser, type AdminUser } from '@/lib/admin-api';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminLogin } from '@/pages/admin/AdminLogin';

/**
 * Admin route guard. The stored JWT is verified against GET /auth/me on every mount, so a
 * stale or tampered token drops straight back to the sign-in screen instead of a dead page.
 */
export function AdminPage() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [notice, setNotice] = useState('');

  const verify = useCallback(async () => {
    setChecking(true);
    try {
      setUser(await fetchAdminUser());
      setNotice('');
    } catch (reason) {
      setUser(null);
      if (reason instanceof AdminAuthError) {
        clearAdminToken();
      } else {
        setNotice(reason instanceof Error ? reason.message : 'Could not reach the API.');
      }
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => { verify(); }, [verify]);

  const logout = useCallback(() => {
    clearAdminToken();
    setUser(null);
    setNotice('You have been signed out.');
    if (location !== '/admin') setLocation('/admin');
  }, [location, setLocation]);

  // A session that expires mid-session bubbles up here from any panel
  const handleAuthLost = useCallback(() => {
    clearAdminToken();
    setUser(null);
    setNotice('Your session expired. Please sign in again.');
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#f1ebe1]">
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[.2em] text-[#9f7a47]">KNC Horizon Realtor</p>
          <p className="mt-2 font-serif text-2xl text-[#2b3242]">Verifying administrative access…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin notice={notice} onSignedIn={verify} />;
  }

  return <AdminDashboard user={user} logout={logout} onAuthLost={handleAuthLost} />;
}
