import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Loader2, Lock } from 'lucide-react';

import { adminLogin } from '@/lib/admin-api';

/** Admin sign-in. Credentials are checked by the backend against the hashed user in PostgreSQL. */
export function AdminLogin({ onSignedIn, notice }: { onSignedIn: () => void; notice?: string }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminLogin(form.email.trim(), form.password);
      onSignedIn();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-shell flex min-h-[100dvh] items-center justify-center bg-[#f1ebe1] px-5 py-16">
      <div className="w-full max-w-[26rem]">
        <img src="/brand/knc-logo-stacked.svg" alt="KNC Horizon Realtor" className="h-24 w-auto" />

        <h1 className="mt-8 font-serif text-3xl leading-tight text-[#2b3242]">Admin console</h1>
        <p className="mt-2 text-sm text-[#2b3242]/60">Sign in with your KNC account. Administrators and SEO managers use the same sign-in.</p>

        {notice && (
          <p className="mt-5 rounded-lg border border-[#9f7a47]/30 bg-[#8f6d3f]/8 px-3 py-2 text-sm text-[#7c2d12]" role="status">
            {notice}
          </p>
        )}

        <form onSubmit={submit} className="mt-7 rounded-2xl border border-[#2b3242]/10 bg-[#fcfaf5] p-5 shadow-[0_24px_48px_-32px_rgba(43,50,66,0.4)] sm:p-6" noValidate>
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-[.14em] text-[#2b3242]/65">Email</span>
            <input
              required
              type="email"
              autoComplete="username"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="mt-1.5 w-full rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] px-3 py-2.5 text-sm outline-none focus:border-[#9f7a47]"
              data-testid="input-admin-email"
            />
          </label>

          <label className="mt-4 block">
            <span className="font-mono text-[11px] uppercase tracking-[.14em] text-[#2b3242]/65">Password</span>
            <input
              required
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="mt-1.5 w-full rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] px-3 py-2.5 text-sm outline-none focus:border-[#9f7a47]"
              data-testid="input-admin-password"
            />
          </label>

          {error && (
            <p className="mt-4 rounded-lg border border-[#b23b2e]/30 bg-[#b23b2e]/8 px-3 py-2 text-sm text-[#7c2d12]" role="alert" data-testid="text-login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#2b3242] px-5 py-3 font-mono text-[11px] uppercase tracking-[.14em] text-[#faf7f1] transition-colors hover:bg-[#8f6d3f] disabled:opacity-60"
            data-testid="button-admin-login"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={13} />}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <a href="/" className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47] hover:underline">
          Back to website <ArrowUpRight size={13} />
        </a>
      </div>
    </main>
  );
}
