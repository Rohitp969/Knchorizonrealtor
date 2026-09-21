import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, Pencil, Plus, RefreshCw, Search, Star, Trash2, ExternalLink, Loader2 } from 'lucide-react';

import { adminRequest } from '@/lib/admin-api';
import {
  slugify,
  type FieldConfig,
  type ResourceConfig,
} from '@/pages/admin/resource-config';
import {
  AdminPanelHeader,
  ConfirmDialog,
  ImagePicker,
  Modal,
  Spinner,
  StateBlock,
  adminButtonClass,
  useToast,
} from '@/pages/admin/admin-ui';

type Item = Record<string, any> & { id: string };

const PAGE_SIZE = 12;

function readList(payload: any, key = 'items'): Item[] {
  const list = payload?.[key] ?? payload?.items ?? [];
  return Array.isArray(list) ? list : [];
}

function firstImage(item: Item, key?: string) {
  if (!key) return '';
  const value = item[key];
  if (Array.isArray(value)) return value[0] ?? '';
  if (typeof value === 'string' && value) return value;
  return item.imageUrl || item.image || item.coverImage || item.logo || '';
}

function formatPrice(value: unknown, currency = 'AED') {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount === 0) return '—';
  return `${currency} ${new Intl.NumberFormat('en-AE').format(amount)}`;
}

function formatCell(item: Item, column: { name: string; type?: string; currencyField?: string }) {
  const raw = item[column.name];
  if (column.type === 'price') return formatPrice(raw, column.currencyField ? item[column.currencyField] || 'AED' : 'AED');
  if (column.type === 'date') return raw ? new Date(raw).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '—';
  if (Array.isArray(raw)) return raw.length ? raw.join(', ') : '—';
  if (typeof raw === 'boolean') return raw ? 'Yes' : 'No';
  if (raw === undefined || raw === null || raw === '') return '—';
  return String(raw);
}

export function ResourceManager({
  config,
  publicPath,
}: {
  config: ResourceConfig;
  publicPath?: (item: Item) => string;
}) {
  const toast = useToast();
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Item | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Item | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [lookups, setLookups] = useState<{ developers: string[]; communities: string[] }>({ developers: [], communities: [] });

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const payload = await adminRequest<any>(config.list);
      setItems(readList(payload, config.listKey));
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load this section.');
      setItems([]);
    } finally {
      setRefreshing(false);
    }
  }, [config.list, config.listKey]);

  useEffect(() => {
    setItems(null);
    setQuery('');
    setFilters({});
    setPage(1);
    load();
  }, [load]);

  // Developer / community dropdowns are filled from the real collections
  useEffect(() => {
    const needs = config.fields.some((field) => field.optionsFrom);
    if (!needs) return;
    let active = true;
    (async () => {
      const [developers, communities] = await Promise.all([
        adminRequest<any>('/admin/developers-detail').then((d) => readList(d, 'developers')).catch(() => []),
        adminRequest<any>('/admin/communities-list').then((d) => readList(d)).catch(() => []),
      ]);
      if (!active) return;
      setLookups({
        developers: developers.map((d: Item) => d.name).filter(Boolean),
        communities: communities.map((c: Item) => c.name).filter(Boolean),
      });
    })();
    return () => { active = false; };
  }, [config.fields]);

  const filtered = useMemo(() => {
    let list = items ?? [];
    const needle = query.trim().toLowerCase();
    if (needle) {
      list = list.filter((item) =>
        config.searchKeys.some((key) => String(item[key] ?? '').toLowerCase().includes(needle)),
      );
    }
    for (const filter of config.filters ?? []) {
      const value = filters[filter.name];
      if (!value) continue;
      const field = filter.field ?? filter.name;
      list = list.filter((item) => {
        const raw = item[field];
        if (value === 'true' || value === 'false') return String(Boolean(raw)) === value;
        return String(raw ?? '').toLowerCase() === value.toLowerCase();
      });
    }
    return list;
  }, [items, query, filters, config.searchKeys, config.filters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [query, filters]);

  const patchItem = async (item: Item, changes: Record<string, unknown>, successMessage: string) => {
    setBusyId(item.id);
    try {
      const method = config.updateMethod ?? 'PUT';
      // PUT endpoints replace the document, so send the whole record back with the change applied
      const body = method === 'PUT' ? { ...item, ...changes } : changes;
      await adminRequest(config.update(item.id), { method, body: JSON.stringify(body) });
      setItems((current) => (current ?? []).map((row) => (row.id === item.id ? { ...row, ...changes } : row)));
      toast('success', successMessage);
    } catch (reason) {
      toast('error', reason instanceof Error ? reason.message : 'That change could not be saved.');
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusyId(deleting.id);
    try {
      await adminRequest(config.remove(deleting.id), { method: 'DELETE' });
      setItems((current) => (current ?? []).filter((row) => row.id !== deleting.id));
      toast('success', `${config.singular} deleted.`);
      setDeleting(null);
    } catch (reason) {
      toast('error', reason instanceof Error ? reason.message : 'Delete failed.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <AdminPanelHeader
        title={config.label}
        description={items ? `${filtered.length} of ${items.length} record${items.length === 1 ? '' : 's'}` : 'Loading…'}
      >
        <button type="button" className={adminButtonClass('ghost')} onClick={load} disabled={refreshing}>
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
        <button type="button" className={adminButtonClass()} onClick={() => setEditing('new')} data-testid={`button-add-${config.key}`}>
          <Plus size={14} /> Add {config.singular.toLowerCase()}
        </button>
      </AdminPanelHeader>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex min-w-0 flex-1 items-center">
          <Search size={15} className="pointer-events-none absolute left-3 text-[#202635]/40" />
          <span className="sr-only">Search {config.label}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${config.label.toLowerCase()}…`}
            className="w-full rounded-sm border border-[#202635]/20 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#c97352]"
            data-testid={`input-search-${config.key}`}
          />
        </label>
        {(config.filters ?? []).map((filter) => (
          <label key={filter.name} className="flex items-center gap-2 text-sm">
            <span className="font-mono text-[10px] uppercase tracking-[.12em] text-[#202635]/50">{filter.label}</span>
            <select
              value={filters[filter.name] ?? ''}
              onChange={(event) => setFilters((current) => ({ ...current, [filter.name]: event.target.value }))}
              className="rounded-sm border border-[#202635]/20 bg-white px-2.5 py-2 text-sm outline-none focus:border-[#c97352]"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="mt-5">
        {items === null ? (
          <Spinner label={`Loading ${config.label.toLowerCase()}…`} />
        ) : error ? (
          <StateBlock tone="error" title="Could not load this section" message={error} action={<button className={adminButtonClass('ghost')} onClick={load}>Try again</button>} />
        ) : filtered.length === 0 ? (
          <StateBlock
            title={items.length === 0 ? `No ${config.label.toLowerCase()} yet` : 'Nothing matches those filters'}
            message={items.length === 0 ? config.emptyHint ?? `Create your first ${config.singular.toLowerCase()}.` : 'Try a different search or filter.'}
            action={
              items.length === 0 ? (
                <button className={adminButtonClass()} onClick={() => setEditing('new')}>
                  <Plus size={14} /> Add {config.singular.toLowerCase()}
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto rounded-sm border border-[#202635]/12 bg-white">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#202635]/12 bg-[#f3efe6] text-left font-mono text-[10px] uppercase tracking-[.12em] text-[#202635]/55">
                    {config.columns.map((column) => (
                      <th key={column.name} className="px-3 py-2.5 font-normal">{column.label}</th>
                    ))}
                    {config.publishField && <th className="px-3 py-2.5 font-normal">Live</th>}
                    <th className="px-3 py-2.5 text-right font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((item) => {
                    const published = config.publishField ? Boolean(item[config.publishField]) : undefined;
                    const featured = config.featureField ? Boolean(item[config.featureField]) : undefined;
                    return (
                      <tr key={item.id} className="border-b border-[#202635]/8 last:border-0 hover:bg-[#f9f6ef]" data-testid={`row-${config.key}-${item.id}`}>
                        {config.columns.map((column) => (
                          <td
                            key={column.name}
                            className={`px-3 py-2.5 align-middle text-[#202635]/80 ${column.type === 'price' || column.type === 'date' ? 'whitespace-nowrap' : ''}`}
                          >
                            {column.type === 'image' ? (
                              <span className="block h-11 w-16 overflow-hidden rounded-sm bg-[#202635]/8">
                                {firstImage(item, column.name) ? (
                                  <img src={firstImage(item, column.name)} alt="" loading="lazy" className="h-full w-full object-cover" />
                                ) : null}
                              </span>
                            ) : column.type === 'badge' ? (
                              <span className="inline-block whitespace-nowrap rounded-sm border border-[#202635]/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[.1em]">
                                {formatCell(item, column)}
                              </span>
                            ) : column.name === config.titleKey ? (
                              <span className="flex items-center gap-2">
                                <span className="line-clamp-1 font-medium text-[#202635]">{formatCell(item, column)}</span>
                                {featured && <Star size={12} className="shrink-0 fill-[#d9c6a4] text-[#c97352]" aria-label="Featured" />}
                              </span>
                            ) : (
                              <span className="line-clamp-1">{formatCell(item, column)}</span>
                            )}
                          </td>
                        ))}
                        {config.publishField && (
                          <td className="px-3 py-2.5">
                            <button
                              type="button"
                              onClick={() => patchItem(item, { [config.publishField!]: !published }, published ? `${config.singular} unpublished.` : `${config.singular} published.`)}
                              disabled={busyId === item.id}
                              className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 font-mono text-[9px] uppercase tracking-[.1em] ${
                                published ? 'border-[#55735f]/40 bg-[#55735f]/10 text-[#3c5a49]' : 'border-[#202635]/20 text-[#202635]/55'
                              }`}
                              data-testid={`toggle-publish-${item.id}`}
                            >
                              {busyId === item.id ? <Loader2 size={11} className="animate-spin" /> : published ? <Eye size={11} /> : <EyeOff size={11} />}
                              {published ? 'Live' : 'Draft'}
                            </button>
                          </td>
                        )}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-end gap-1">
                            {config.featureField && (
                              <button
                                type="button"
                                title={featured ? 'Remove from featured' : 'Mark as featured'}
                                onClick={() => patchItem(item, { [config.featureField!]: !featured }, featured ? 'Removed from featured.' : 'Marked as featured.')}
                                disabled={busyId === item.id}
                                className="grid h-8 w-8 place-items-center rounded-sm border border-[#202635]/15 hover:border-[#c97352] hover:text-[#c97352]"
                              >
                                <Star size={13} className={featured ? 'fill-[#d9c6a4] text-[#c97352]' : ''} />
                              </button>
                            )}
                            {publicPath && (
                              <a
                                href={publicPath(item)}
                                target="_blank"
                                rel="noreferrer"
                                title="View on the website"
                                className="grid h-8 w-8 place-items-center rounded-sm border border-[#202635]/15 hover:border-[#c97352] hover:text-[#c97352]"
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                            <button
                              type="button"
                              title="Edit"
                              onClick={() => setEditing(item)}
                              className="grid h-8 w-8 place-items-center rounded-sm border border-[#202635]/15 hover:border-[#c97352] hover:text-[#c97352]"
                              data-testid={`button-edit-${item.id}`}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              title="Delete"
                              onClick={() => setDeleting(item)}
                              className="grid h-8 w-8 place-items-center rounded-sm border border-[#202635]/15 text-[#b23b2e] hover:border-[#b23b2e]"
                              data-testid={`button-delete-${item.id}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pageCount > 1 && (
              <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                <button className={adminButtonClass('ghost')} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
                <span className="font-mono text-[10px] uppercase tracking-[.12em] text-[#202635]/55">Page {page} of {pageCount}</span>
                <button className={adminButtonClass('ghost')} onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount}>Next</button>
              </div>
            )}
          </>
        )}
      </div>

      {editing && (
        <ResourceForm
          config={config}
          lookups={lookups}
          item={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved, mode) => {
            setItems((current) => {
              const list = current ?? [];
              return mode === 'create' ? [saved, ...list] : list.map((row) => (row.id === saved.id ? saved : row));
            });
            setEditing(null);
            toast('success', mode === 'create' ? `${config.singular} created.` : `${config.singular} updated.`);
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${config.singular.toLowerCase()}?`}
        message={`“${deleting?.[config.titleKey] ?? 'This record'}” will be removed from the database and will disappear from the public website.`}
        warning={config.key === 'developers' ? 'Projects that reference this developer will keep their developer name but lose the link to this profile.' : undefined}
        busy={busyId === deleting?.id}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- form */

function ResourceForm({
  config,
  item,
  lookups,
  onClose,
  onSaved,
}: {
  config: ResourceConfig;
  item: Item | null;
  lookups: { developers: string[]; communities: string[] };
  onClose: () => void;
  onSaved: (item: Item, mode: 'create' | 'update') => void;
}) {
  const [values, setValues] = useState<Record<string, any>>(() => ({ ...(config.defaults ?? {}), ...(item ?? {}) }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setValue = (name: string, value: unknown) => {
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
  };

  const groups = useMemo(() => {
    const map = new Map<string, FieldConfig[]>();
    for (const field of config.fields) {
      const key = field.group ?? 'Details';
      map.set(key, [...(map.get(key) ?? []), field]);
    }
    return [...map.entries()];
  }, [config.fields]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    const payload: Record<string, any> = { ...values };

    for (const field of config.fields) {
      if (field.type === 'slug' && !String(payload[field.name] ?? '').trim() && field.slugFrom) {
        payload[field.name] = slugify(String(payload[field.slugFrom] ?? ''));
      }
      if (field.type === 'slug' && payload[field.name]) payload[field.name] = slugify(String(payload[field.name]));
      if (field.type === 'number') payload[field.name] = Number(payload[field.name] ?? 0) || 0;
      if (field.type === 'tags' && typeof payload[field.name] === 'string') {
        payload[field.name] = String(payload[field.name]).split(',').map((v) => v.trim()).filter(Boolean);
      }
      if (field.required) {
        const value = payload[field.name];
        const empty = value === undefined || value === null || String(value).trim() === '' || (Array.isArray(value) && value.length === 0);
        if (empty) errors[field.name] = `${field.label} is required.`;
      }
    }

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setError('Please complete the highlighted fields.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const isCreate = !item;
      const method = isCreate ? 'POST' : (config.updateMethod ?? 'PUT');
      const path = isCreate ? config.create : config.update(item!.id);
      const response = await adminRequest<any>(path, { method, body: JSON.stringify(payload) });
      const saved: Item = response?.[config.itemKey ?? 'item'] ?? response?.item ?? { ...payload, id: item?.id };
      onSaved(saved, isCreate ? 'create' : 'update');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Saving failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      wide
      title={item ? `Edit ${config.singular.toLowerCase()}` : `New ${config.singular.toLowerCase()}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={adminButtonClass('ghost')} onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" form="resource-form" className={adminButtonClass()} disabled={saving} data-testid="button-save-resource">
            {saving ? <Loader2 size={14} className="animate-spin" /> : null} {saving ? 'Saving…' : item ? 'Save changes' : `Create ${config.singular.toLowerCase()}`}
          </button>
        </>
      }
    >
      <form id="resource-form" onSubmit={submit} noValidate>
        {error && <p className="mb-4 rounded-sm border border-[#c97352]/35 bg-[#c97352]/8 px-3 py-2 text-sm text-[#7c2d12]" role="alert">{error}</p>}

        {groups.map(([group, fields]) => (
          <fieldset key={group} className="mb-6">
            <legend className="mb-3 font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352]">{group}</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => {
                const value = values[field.name];
                const options = field.optionsFrom ? lookups[field.optionsFrom] : field.options;
                const invalid = Boolean(fieldErrors[field.name]);
                const inputClass = `mt-1.5 w-full rounded-sm border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c97352] ${invalid ? 'border-[#b23b2e]' : 'border-[#202635]/20'}`;

                return (
                  <div key={field.name} className={field.full || field.type === 'image' || field.type === 'textarea' || field.type === 'richtext' ? 'sm:col-span-2' : ''}>
                    {field.type === 'boolean' ? (
                      <label className="flex items-center gap-3 rounded-sm border border-[#202635]/15 bg-white px-3 py-2.5 text-sm">
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(event) => setValue(field.name, event.target.checked)}
                          className="h-4 w-4 accent-[#c97352]"
                          data-testid={`field-${field.name}`}
                        />
                        <span>{field.label}</span>
                      </label>
                    ) : field.type === 'image' ? (
                      <ImagePicker
                        label={field.label}
                        value={value ?? (config.imageKey === field.name && Array.isArray(config.defaults?.[field.name]) ? [] : '')}
                        multiple={Array.isArray(config.defaults?.[field.name]) || Array.isArray(value)}
                        help={field.help}
                        onChange={(next) => setValue(field.name, next)}
                      />
                    ) : (
                      <label className="block">
                        <span className="font-mono text-[10px] uppercase tracking-[.14em] text-[#202635]/55">
                          {field.label}{field.required && <span className="text-[#b23b2e]"> *</span>}
                        </span>

                        {field.type === 'textarea' || field.type === 'richtext' ? (
                          <textarea
                            value={value ?? ''}
                            onChange={(event) => setValue(field.name, event.target.value)}
                            rows={field.type === 'richtext' ? 10 : 3}
                            placeholder={field.placeholder}
                            className={`${inputClass} resize-y`}
                            data-testid={`field-${field.name}`}
                          />
                        ) : field.type === 'select' && options?.length ? (
                          <select
                            value={value ?? ''}
                            onChange={(event) => setValue(field.name, event.target.value)}
                            className={inputClass}
                            data-testid={`field-${field.name}`}
                          >
                            <option value="">Select…</option>
                            {options.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        ) : field.type === 'tags' ? (
                          <input
                            value={Array.isArray(value) ? value.join(', ') : (value ?? '')}
                            onChange={(event) => setValue(field.name, event.target.value)}
                            onBlur={(event) => setValue(field.name, event.target.value.split(',').map((v) => v.trim()).filter(Boolean))}
                            placeholder={field.placeholder}
                            className={inputClass}
                            data-testid={`field-${field.name}`}
                          />
                        ) : field.type === 'date' ? (
                          <input
                            type="date"
                            value={value ? String(value).slice(0, 10) : ''}
                            onChange={(event) => setValue(field.name, event.target.value)}
                            className={inputClass}
                            data-testid={`field-${field.name}`}
                          />
                        ) : (
                          <input
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={value ?? ''}
                            onChange={(event) => setValue(field.name, field.type === 'number' ? event.target.value : event.target.value)}
                            onBlur={() => {
                              const slugField = config.fields.find((f) => f.type === 'slug' && f.slugFrom === field.name);
                              if (slugField && !String(values[slugField.name] ?? '').trim() && values[field.name]) {
                                setValue(slugField.name, slugify(String(values[field.name])));
                              }
                            }}
                            list={field.optionsFrom ? `${field.name}-options` : undefined}
                            placeholder={field.placeholder}
                            className={inputClass}
                            data-testid={`field-${field.name}`}
                          />
                        )}

                        {field.optionsFrom && field.type !== 'select' && (
                          <datalist id={`${field.name}-options`}>
                            {(lookups[field.optionsFrom] ?? []).map((option) => <option key={option} value={option} />)}
                          </datalist>
                        )}

                        {fieldErrors[field.name] ? (
                          <span className="mt-1 block text-xs text-[#b23b2e]">{fieldErrors[field.name]}</span>
                        ) : field.help ? (
                          <span className="mt-1 block text-xs text-[#202635]/50">{field.help}</span>
                        ) : null}
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </fieldset>
        ))}
      </form>
    </Modal>
  );
}
