import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';

export function AdminPage() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem('knc_admin_token');

    if (!token) {
      setIsAuthenticated(false);
      setLocation('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [setLocation]);

  const logout = () => {
    window.localStorage.removeItem('knc_admin_token');
    setIsAuthenticated(false);
    setLocation('/login');
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#ebe5dc]">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-[.2em] text-[#c97352]">
            KNC Horizon Realtor
          </p>
          <p className="font-serif text-2xl text-[#202635]">
            Verifying administrative access…
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <AdminDashboard logout={logout} />;
}