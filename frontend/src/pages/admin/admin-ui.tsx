import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, Check, Copy, Image as ImageIcon, Loader2, Trash2, Upload, X } from 'lucide-react';

import { listMedia, uploadAdminImage, type MediaItem } from '@/lib/admin-api';

/* ---------------------------------------------------------------- toasts */

type Toast = { id: number; tone: 'success' | 'error'; message: string };
const ToastContext = createContext<(tone: Toast['tone'], message: string) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((tone: Toast['tone'], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, tone, message }]);
    window.setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 4500);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[80] flex w-[min(24rem,calc(100vw-2.5rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-sm border px-4 py-3 text-sm shadow-lg ${
              toast.tone === 'success'
                ? 'border-[#55735f]/30 bg-[#f2f6f2] text-[#25402f]'
                : 'border-[#c97352]/40 bg-[#fbeeea] text-[#7c2d12]'
            }`}
          >
            {toast.tone === 'success' ? <Check size={16} className="mt-0.5 shrink-0" /> : <AlertTriangle size={16} className="mt-0.5 shrink-0" />}
            <span className="min-w-0 break-words">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ---------------------------------------------------------------- shells */

export function AdminPanelHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[#202635]/12 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-serif text-2xl leading-tight text-[#202635] md:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-[#202635]/60">{description}</p>}
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function StateBlock({
  tone = 'muted',
  title,
  message,
  action,
}: {
  tone?: 'muted' | 'error';
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={`flex flex-col items-start gap-3 rounded-sm border px-5 py-8 text-sm ${
        tone === 'error' ? 'border-[#c97352]/35 bg-[#c97352]/8 text-[#7c2d12]' : 'border-[#202635]/12 bg-white text-[#202635]/70'
      }`}
      role={tone === 'error' ? 'alert' : undefined}
    >
      <p className="font-serif text-lg text-[#202635]">{title}</p>
      {message && <p className="max-w-xl">{message}</p>}
      {action}
    </div>
  );
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-10 text-sm text-[#202635]/60">
      <Loader2 size={16} className="animate-spin" />
      {label}
    </div>
  );
}

export function adminButtonClass(variant: 'primary' | 'ghost' | 'danger' = 'primary') {
  const base =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-4 py-2.5 font-mono text-[10px] uppercase tracking-[.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-50';
  if (variant === 'primary') return `${base} bg-[#202635] text-[#f5f0e6] hover:bg-[#c97352]`;
  if (variant === 'danger') return `${base} bg-[#b23b2e] text-white hover:bg-[#8f2f24]`;
  return `${base} border border-[#202635]/25 text-[#202635] hover:border-[#c97352] hover:text-[#c97352]`;
}

/* ---------------------------------------------------------------- modal */

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  wide = false,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-[#202635]/55 p-3 backdrop-blur-sm sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`my-4 w-full rounded-sm bg-[#f8f5ee] shadow-2xl ${wide ? 'max-w-4xl' : 'max-w-2xl'}`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[#202635]/12 px-5 py-4">
          <h2 className="font-serif text-xl text-[#202635]">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-sm border border-[#202635]/15 text-[#202635] hover:border-[#c97352] hover:text-[#c97352]">
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#202635]/12 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  warning,
  confirmLabel = 'Delete',
  busy = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  warning?: string;
  confirmLabel?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className={adminButtonClass('ghost')} onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className={adminButtonClass('danger')} onClick={onConfirm} disabled={busy} data-testid="confirm-delete">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm leading-6 text-[#202635]/75">{message}</p>
      {warning && (
        <p className="mt-4 flex items-start gap-2 rounded-sm border border-[#c97352]/30 bg-[#c97352]/8 px-3 py-2 text-sm text-[#7c2d12]">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {warning}
        </p>
      )}
    </Modal>
  );
}

/* ---------------------------------------------------------------- image picker */

/**
 * Real upload: the file goes to POST /admin/uploads, the backend stores it in Cloudinary
 * and returns a permanent https URL. Nothing blob:/data: is ever written to the database.
 */
export function ImagePicker({
  label,
  value,
  onChange,
  multiple = false,
  help,
}: {
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  help?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [urlDraft, setUrlDraft] = useState('');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [library, setLibrary] = useState<MediaItem[] | null>(null);
  const toast = useToast();

  const urls = multiple ? (Array.isArray(value) ? value : value ? [String(value)] : []) : value ? [String(value)] : [];

  const commit = (next: string[]) => onChange(multiple ? next : (next[0] ?? ''));

  const addUrl = (url: string) => {
    const clean = url.trim();
    if (!clean) return;
    if (/^(blob:|data:|file:)/i.test(clean) || /^[a-zA-Z]:\\/.test(clean)) {
      setError('That is a local preview path. Upload the file or paste an https:// URL.');
      return;
    }
    setError('');
    commit(multiple ? [...urls, clean] : [clean]);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError('');
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files).slice(0, multiple ? 10 : 1)) {
        const result = await uploadAdminImage(file);
        uploaded.push(result.url);
        if (result.warning) toast('error', result.warning);
      }
      commit(multiple ? [...urls, ...uploaded] : uploaded.slice(0, 1));
      toast('success', uploaded.length > 1 ? `${uploaded.length} images uploaded.` : 'Image uploaded.');
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Upload failed.';
      setError(message);
      toast('error', message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const openLibrary = async () => {
    setLibraryOpen(true);
    if (library) return;
    try {
      setLibrary(await listMedia());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load the media library.');
      setLibrary([]);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[.14em] text-[#202635]/55">{label}</span>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={adminButtonClass('ghost')} onClick={() => inputRef.current?.click()} disabled={uploading} data-testid="button-upload-image">
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} {uploading ? 'Uploading…' : 'Upload'}
          </button>
          <button type="button" className={adminButtonClass('ghost')} onClick={openLibrary}>
            <ImageIcon size={13} /> Library
          </button>
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={(event) => handleFiles(event.target.files)} data-testid="input-file-image" />

      {urls.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {urls.map((url, index) => (
            <div key={`${url}-${index}`} className="group relative h-24 w-32 overflow-hidden rounded-sm border border-[#202635]/12 bg-[#202635]/5">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => commit(urls.filter((_, i) => i !== index))}
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-[#202635]/80 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X size={12} />
              </button>
              {multiple && index === 0 && (
                <span className="absolute bottom-1 left-1 rounded-sm bg-[#202635]/80 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[.12em] text-white">Main</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <input
          value={urlDraft}
          onChange={(event) => setUrlDraft(event.target.value)}
          placeholder="or paste an image URL (https://…)"
          className="min-w-0 flex-1 rounded-sm border border-[#202635]/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#c97352]"
        />
        <button
          type="button"
          className={adminButtonClass('ghost')}
          onClick={() => { addUrl(urlDraft); setUrlDraft(''); }}
        >
          Add
        </button>
      </div>

      {help && !error && <p className="mt-2 text-xs text-[#202635]/50">{help}</p>}
      {error && <p className="mt-2 text-xs text-[#b23b2e]">{error}</p>}

      <Modal open={libraryOpen} title="Media library" onClose={() => setLibraryOpen(false)} wide>
        {library === null ? (
          <Spinner label="Loading media…" />
        ) : library.length === 0 ? (
          <StateBlock title="No media yet" message="Uploaded images appear here and can be reused across the site." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {library.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => { addUrl(item.url); setLibraryOpen(false); }}
                className="group overflow-hidden rounded-sm border border-[#202635]/12 bg-white text-left transition-colors hover:border-[#c97352]"
              >
                <span className="block h-24 w-full overflow-hidden bg-[#202635]/5">
                  <img src={item.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                </span>
                <span className="block truncate px-2 py-1.5 font-mono text-[9px] uppercase tracking-[.1em] text-[#202635]/60">
                  {item.filename ?? 'image'}
                </span>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

export function CopyButton({ value, label = 'Copy URL' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  return (
    <button
      type="button"
      className={adminButtonClass('ghost')}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          toast('error', 'Could not copy to the clipboard.');
        }
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : label}
    </button>
  );
}
