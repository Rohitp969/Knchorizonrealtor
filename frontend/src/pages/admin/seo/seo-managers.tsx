import { useCallback, useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, ShieldCheck, Trash2, UserCheck, UserX } from 'lucide-react';

import { AdminPanelHeader, ConfirmDialog, Modal, Spinner, StateBlock, adminButtonClass, useToast } from '@/pages/admin/admin-ui';
import { seoApi, type SeoManager } from './seo-api';
import { StatusPill, TextField, fieldErrorsFrom } from './seo-ui';

/**
 * Super admin only: the SEO manager accounts. The server refuses these routes to anyone but
 * an administrator, and only ever touches accounts whose role is seo_manager.
 */
export function SeoManagersPanel() {
  const toast = useToast();
  const [managers, setManagers] = useState<SeoManager[] | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<SeoManager | 'new' | null>(null);
  const [deleting, setDeleting] = useState<SeoManager | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setManagers(await seoApi.managers());
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load SEO managers.');
      setManagers([]);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggleActive = async (manager: SeoManager) => {
    setBusy(manager.id);
    try {
      await seoApi.updateManager(manager.id, { isActive: !manager.isActive });
      toast('success', manager.isActive ? `${manager.name} disabled. Their session ends at once.` : `${manager.name} enabled.`);
      await load();
    } catch (reason) {
      toast('error', reason instanceof Error ? reason.message : 'Could not update the account.');
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(deleting.id);
    try {
      await seoApi.deleteManager(deleting.id);
      toast('success', `${deleting.name} deleted.`);
      setDeleting(null);
      await load();
    } catch (reason) {
      toast('error', reason instanceof Error ? reason.message : 'Could not delete the account.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <AdminPanelHeader title="SEO managers" description="Separate sign-ins for the people who manage the site's SEO.">
        <button type="button" className={adminButtonClass()} onClick={() => setEditing('new')} data-testid="button-add-seo-manager"><Plus size={14} /> Add SEO manager</button>
      </AdminPanelHeader>

      <p className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#2b3242]/10 bg-[#fffdf8] px-4 py-3 text-sm leading-6 text-[#2b3242]/75">
        <ShieldCheck size={17} className="mt-0.5 shrink-0 text-[#9f7a47]" />
        <span>
          An SEO manager signs in at <strong className="font-medium text-[#2b3242]">/admin</strong> with their own email and sees only the SEO section: page, property, project and article SEO and the technical checks.
          Leads, users, site settings and every credential stay out of reach; the server refuses those requests whatever the screen shows.
        </span>
      </p>

      <div className="mt-5">
        {managers === null ? (
          <Spinner label="Loading SEO managers…" />
        ) : error ? (
          <StateBlock tone="error" title="Could not load SEO managers" message={error} action={<button className={adminButtonClass('ghost')} onClick={load}>Try again</button>} />
        ) : managers.length === 0 ? (
          <StateBlock title="No SEO managers yet" message="Add one to give someone SEO access without admin access." action={<button className={adminButtonClass()} onClick={() => setEditing('new')}><Plus size={14} /> Add SEO manager</button>} />
        ) : (
          <ul className="rounded-xl border border-[#2b3242]/10 bg-[#fffdf8] shadow-[0_1px_2px_rgba(43,50,66,0.04)]">
            {managers.map((manager) => (
              <li key={manager.id} className="flex flex-col gap-3 border-b border-[#2b3242]/8 px-4 py-3 last:border-0 md:flex-row md:items-center" data-testid={`seo-manager-${manager.email}`}>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-[#2b3242]">{manager.name}</span>
                  <span className="block truncate text-xs text-[#2b3242]/60">{manager.email} · added {new Date(manager.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</span>
                </span>
                <span className="flex flex-wrap items-center gap-2">
                  <StatusPill tone={manager.isActive ? 'live' : 'off'}>{manager.isActive ? 'Active' : 'Disabled'}</StatusPill>
                  <StatusPill tone={manager.canPublishArticles ? 'review' : 'muted'}>{manager.canPublishArticles ? 'Can publish' : 'Review only'}</StatusPill>
                  <button type="button" className={adminButtonClass('ghost')} onClick={() => setEditing(manager)}><Pencil size={12} /> Edit</button>
                  <button type="button" className={adminButtonClass('ghost')} onClick={() => toggleActive(manager)} disabled={busy === manager.id} data-testid={`toggle-seo-manager-${manager.email}`}>
                    {busy === manager.id ? <Loader2 size={12} className="animate-spin" /> : manager.isActive ? <UserX size={12} /> : <UserCheck size={12} />}
                    {manager.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button type="button" onClick={() => setDeleting(manager)} className="grid h-9 w-9 place-items-center rounded-lg border border-[#2b3242]/15 text-[#b23b2e] hover:border-[#b23b2e]" title="Delete" aria-label={`Delete ${manager.name}`}>
                    <Trash2 size={13} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editing && <ManagerForm manager={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={load} />}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete SEO manager?"
        message={`${deleting?.name ?? 'This account'} (${deleting?.email ?? ''}) will be removed and can no longer sign in. The SEO they entered stays on the site.`}
        busy={busy === deleting?.id}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </div>
  );
}

function ManagerForm({ manager, onClose, onSaved }: { manager: SeoManager | null; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [name, setName] = useState(manager?.name ?? '');
  const [email, setEmail] = useState(manager?.email ?? '');
  const [password, setPassword] = useState('');
  const [canPublish, setCanPublish] = useState(manager?.canPublishArticles ?? false);
  const [active, setActive] = useState(manager?.isActive ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    setErrors({});
    const body = { name, email, canPublishArticles: canPublish, isActive: active, ...(password ? { password } : {}) };
    try {
      if (manager) await seoApi.updateManager(manager.id, body);
      else await seoApi.createManager({ ...body, password });
      toast('success', manager ? 'SEO manager updated.' : `SEO manager created. ${email} can now sign in at /admin.`);
      onSaved();
      onClose();
    } catch (reason) {
      setErrors(fieldErrorsFrom(reason));
      toast('error', reason instanceof Error ? reason.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={manager ? `Edit ${manager.name}` : 'New SEO manager'}
      onClose={onClose}
      footer={<>
        <button type="button" className={adminButtonClass('ghost')} onClick={onClose} disabled={saving}>Cancel</button>
        <button type="button" className={adminButtonClass()} onClick={save} disabled={saving} data-testid="button-save-seo-manager">
          {saving ? <Loader2 size={13} className="animate-spin" /> : null} {manager ? 'Save changes' : 'Create account'}
        </button>
      </>}
    >
      <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); save(); }} noValidate>
        <TextField label="Name" value={name} onChange={setName} error={errors.name} testId="seo-manager-name" />
        <TextField label="Email (sign-in)" value={email} onChange={setEmail} error={errors.email} testId="seo-manager-email" />
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[.14em] text-[#2b3242]/65">{manager ? 'New password' : 'Password'}</span>
          <input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className={`mt-1.5 w-full rounded-lg border bg-[#fffdf8] px-3 py-2.5 text-sm outline-none focus:border-[#9f7a47] ${errors.password ? 'border-[#b23b2e]' : 'border-[#2b3242]/20'}`} data-testid="seo-manager-password" />
          {errors.password
            ? <span className="mt-1 block text-xs text-[#b23b2e]">{errors.password}</span>
            : <span className="mt-1 block text-xs text-[#2b3242]/60">{manager ? 'Leave empty to keep the current password. ' : ''}At least 10 characters, with a letter and a number. Share it with them privately.</span>}
        </label>
        <label className="flex items-start gap-3 rounded-lg border border-[#2b3242]/15 bg-[#fffdf8] px-3 py-3 text-sm text-[#2b3242]">
          <input type="checkbox" checked={canPublish} onChange={(event) => setCanPublish(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#9f7a47]" data-testid="seo-manager-can-publish" />
          <span>
            <span className="font-medium">Can publish articles</span>
            <span className="mt-0.5 block text-xs text-[#2b3242]/60">Off: they save drafts and submit for review, and an administrator publishes.</span>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-lg border border-[#2b3242]/15 bg-[#fffdf8] px-3 py-3 text-sm text-[#2b3242]">
          <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#9f7a47]" />
          <span>
            <span className="font-medium">Account active</span>
            <span className="mt-0.5 block text-xs text-[#2b3242]/60">A disabled account cannot sign in, and an open session stops at once.</span>
          </span>
        </label>
      </form>
    </Modal>
  );
}
