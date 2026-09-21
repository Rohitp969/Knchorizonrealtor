import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Loader2, Lock } from 'lucide-react';

import { adminLogin } from '@/lib/admin-api';

/** Admin sign-in. Credentials are checked by the backend against the hashed user in MongoDB. */
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
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#ebe5dc] px-5 py-16">
      <div className="w-full max-w-[26rem]">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center border border-[#c97352]/60 font-serif text-lg text-[#c97352]">K</span>
          <span className="leading-none">
            <span className="block font-sans text-[11px] font-semibold tracking-[.27em] text-[#202635]">KNC</span>
            <span className="mt-1 block font-mono text-[9px] tracking-[.2em] text-[#202635]/60">HORIZON REALTOR</span>
          </span>
        </div>

        <h1 className="mt-8 font-serif text-3xl leading-tight text-[#202635]">Admin console</h1>
        <p className="mt-2 text-sm text-[#202635]/60">Sign in with your administrator account to manage the website.</p>

        {notice && (
          <p className="mt-5 rounded-sm border border-[#c97352]/30 bg-[#c97352]/8 px-3 py-2 text-sm text-[#7c2d12]" role="status">
            {notice}
          </p>
        )}

        <form onSubmit={submit} className="mt-7 rounded-sm border border-[#202635]/12 bg-[#f8f5ee] p-5" noValidate>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[.14em] text-[#202635]/55">Email</span>
            <input
              required
              type="email"
              autoComplete="username"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="mt-1.5 w-full rounded-sm border border-[#202635]/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c97352]"
              data-testid="input-admin-email"
            />
          </label>

          <label className="mt-4 block">
            <span className="font-mono text-[10px] uppercase tracking-[.14em] text-[#202635]/55">Password</span>
            <input
              required
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="mt-1.5 w-full rounded-sm border border-[#202635]/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c97352]"
              data-testid="input-admin-password"
            />
          </label>

          {error && (
            <p className="mt-4 rounded-sm border border-[#b23b2e]/30 bg-[#b23b2e]/8 px-3 py-2 text-sm text-[#7c2d12]" role="alert" data-testid="text-login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-[#202635] px-5 py-3 font-mono text-[10px] uppercase tracking-[.14em] text-[#f5f0e6] transition-colors hover:bg-[#c97352] disabled:opacity-60"
            data-testid="button-admin-login"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={13} />}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <a href="/" className="mt-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352] hover:underline">
          Back to website <ArrowUpRight size={13} />
        </a>
      </div>
    </main>
  );
}
