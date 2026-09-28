import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, Check, Copy, Image as ImageIcon, Loader2, Trash2, Upload, X } from 'lucide-react';

import { DEFAULT_MEDIA_FOLDER, MEDIA_FOLDERS, listMedia, uploadAdminImage, type MediaItem } from '@/lib/admin-api';
import { optimizedImage } from '@/lib/cloudinary-image';

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
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${
              toast.tone === 'success'
                ? 'border-[#55735f]/30 bg-[#f2f6f2] text-[#25402f]'
                : 'border-[#9f7a47]/40 bg-[#fbeeea] text-[#7c2d12]'
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
    <div className="flex flex-col gap-4 border-b border-[#2b3242]/12 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-serif text-2xl leading-tight text-[#2b3242] md:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-[#2b3242]/60">{description}</p>}
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
      className={`flex flex-col items-start gap-3 rounded-lg border px-5 py-8 text-sm ${
        tone === 'error' ? 'border-[#9f7a47]/35 bg-[#8f6d3f]/8 text-[#7c2d12]' : 'border-[#2b3242]/10 bg-[#fffdf8] text-[#2b3242]/70 shadow-[0_1px_2px_rgba(43,50,66,0.04)]'
      }`}
      role={tone === 'error' ? 'alert' : undefined}
    >
      <p className="font-serif text-lg text-[#2b3242]">{title}</p>
      {message && <p className="max-w-xl">{message}</p>}
      {action}
    </div>
  );
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-10 text-sm text-[#2b3242]/60">
      <Loader2 size={16} className="animate-spin" />
      {label}
    </div>
  );
}

export function adminButtonClass(variant: 'primary' | 'ghost' | 'danger' = 'primary') {
  const base =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 font-mono text-[11px] uppercase tracking-[.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-50';
  if (variant === 'primary') return `${base} bg-[#2b3242] text-[#faf7f1] hover:bg-[#8f6d3f]`;
  if (variant === 'danger') return `${base} bg-[#a9473a] text-[#fffdf8] hover:bg-[#8f2f24]`;
  return `${base} border border-[#2b3242]/25 text-[#2b3242] hover:border-[#9f7a47] hover:text-[#9f7a47]`;
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
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-[#2b3242]/55 p-3 backdrop-blur-sm sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`my-4 w-full rounded-2xl border border-[#2b3242]/10 bg-[#fcfaf5] shadow-[0_30px_70px_-30px_rgba(43,50,66,0.5)] ${wide ? 'max-w-4xl' : 'max-w-2xl'}`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[#2b3242]/12 px-5 py-4">
          <h2 className="font-serif text-xl text-[#2b3242]">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-lg border border-[#2b3242]/15 text-[#2b3242] hover:border-[#9f7a47] hover:text-[#9f7a47]">
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#2b3242]/12 px-5 py-4">{footer}</div>}
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
      <p className="text-sm leading-6 text-[#2b3242]/75">{message}</p>
      {warning && (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-[#9f7a47]/30 bg-[#8f6d3f]/8 px-3 py-2 text-sm text-[#7c2d12]">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {warning}
        </p>
      )}
    </Modal>
  );
}

/* ---------------------------------------------------------------- image picker */

const MAX_UPLOAD_MB = 10;

/** https:// or a site path such as /images/photo.jpg: the same rule the server applies. */
export function isImageUrl(value: string) {
  return /^https:\/\/\S+$/i.test(value) || /^\/(?!\/)\S+$/.test(value);
}

/** The reason a file will not upload, checked before sending so the admin hears at once. */
function precheck(file: File) {
  const looksLikeImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|avif|heic|heif|svg)$/i.test(file.name);
  if (!looksLikeImage) return `${file.name} is not an image.`;
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return `${file.name} is larger than ${MAX_UPLOAD_MB} MB.`;
  return '';
}

export type UploadOutcome<T> = { file: File; result?: T; error?: string };

/**
 * Uploads each file as its own request, three at a time, and keeps going when one fails, so a
 * batch of twelve photos with one bad file still lands eleven. Results keep the files' order.
 */
export async function uploadEach<T>(files: File[], upload: (file: File) => Promise<T>, onProgress?: (done: number, total: number) => void) {
  const outcomes: UploadOutcome<T>[] = files.map((file) => ({ file }));
  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < files.length) {
      const index = next++;
      const outcome = outcomes[index]!;
      const problem = precheck(outcome.file);
      if (problem) outcome.error = problem;
      else {
        try {
          outcome.result = await upload(outcome.file);
        } catch (reason) {
          outcome.error = `${outcome.file.name}: ${reason instanceof Error ? reason.message : 'upload failed.'}`;
        }
      }
      onProgress?.(++done, files.length);
    }
  };
  await Promise.all(Array.from({ length: Math.min(3, files.length) }, worker));
  return outcomes;
}

type UploadFn = (file: File, folder?: string) => Promise<{ url: string; warning?: string }>;

/** "Upload to" choice; starts on the folder the section suggests and follows it when that changes. */
function useUploadFolder(suggested: string) {
  const [folder, setFolder] = useState(suggested);
  useEffect(() => setFolder(suggested), [suggested]);
  const select = (
    <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.12em] text-[#2b3242]/60">
      <span className="hidden sm:inline">Upload to</span>
      <select
        value={folder}
        onChange={(event) => setFolder(event.target.value)}
        className="max-w-[15rem] rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] px-2 py-2 font-mono text-[10px] normal-case tracking-normal text-[#2b3242] outline-none focus:border-[#9f7a47]"
        aria-label="Cloudinary folder for new uploads"
        data-testid="select-upload-folder"
      >
        {MEDIA_FOLDERS.map((entry) => <option key={entry} value={entry}>{entry.replace('knc-horizon/', '')}</option>)}
      </select>
    </label>
  );
  return [folder, select] as const;
}

/**
 * The media library as a chooser: search, a folder filter and, for galleries, several images
 * picked at once.
 */
function MediaLibraryModal({
  open,
  onClose,
  load,
  multiple = false,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  load: () => Promise<MediaItem[]>;
  multiple?: boolean;
  onPick: (items: MediaItem[]) => void;
}) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState('');
  const [folder, setFolder] = useState('');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<MediaItem[]>([]);

  useEffect(() => {
    if (!open) return;
    setPicked([]);
    let active = true;
    load()
      .then((list) => { if (active) { setItems(list); setError(''); } })
      .catch((reason) => { if (active) { setError(reason instanceof Error ? reason.message : 'Could not load the media library.'); setItems([]); } });
    return () => { active = false; };
  }, [open, load]);

  const folders = [...new Set((items ?? []).map((item) => item.folder).filter((value): value is string => Boolean(value)))].sort();
  const needle = query.trim().toLowerCase();
  const visible = (items ?? []).filter((item) =>
    (!folder || item.folder === folder)
    && (!needle || [item.filename, item.publicId, item.url].some((value) => String(value ?? '').toLowerCase().includes(needle))),
  );
  const toggle = (item: MediaItem) => {
    if (!multiple) { onPick([item]); onClose(); return; }
    setPicked((current) => (current.some((entry) => entry.id === item.id) ? current.filter((entry) => entry.id !== item.id) : [...current, item]));
  };

  return (
    <Modal
      open={open}
      title="Media library"
      onClose={onClose}
      wide
      footer={multiple ? (
        <>
          <button type="button" className={adminButtonClass('ghost')} onClick={onClose}>Cancel</button>
          <button type="button" className={adminButtonClass()} disabled={!picked.length} onClick={() => { onPick(picked); onClose(); }} data-testid="button-library-add">
            Add {picked.length || ''} {picked.length === 1 ? 'image' : 'images'}
          </button>
        </>
      ) : undefined}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search file name or public_id…"
          className="min-w-0 flex-1 rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] px-3 py-2 text-sm outline-none focus:border-[#9f7a47]"
        />
        <select value={folder} onChange={(event) => setFolder(event.target.value)} className="rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] px-3 py-2 text-sm outline-none focus:border-[#9f7a47]" aria-label="Filter by folder">
          <option value="">All folders</option>
          {folders.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
        </select>
      </div>
      {items === null ? (
        <Spinner label="Loading media…" />
      ) : error ? (
        <StateBlock tone="error" title="Could not load media" message={error} />
      ) : visible.length === 0 ? (
        <StateBlock title={items.length ? 'Nothing matches' : 'No media yet'} message={items.length ? 'Try another search or folder.' : 'Uploaded images appear here and can be reused across the site.'} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {visible.map((item) => {
            const selected = picked.some((entry) => entry.id === item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item)}
                aria-pressed={multiple ? selected : undefined}
                className={`group relative overflow-hidden rounded-xl border bg-[#fffdf8] text-left shadow-[0_1px_2px_rgba(43,50,66,0.04)] transition-colors hover:border-[#9f7a47] ${selected ? 'border-[#9f7a47] ring-2 ring-[#9f7a47]/40' : 'border-[#2b3242]/10'}`}
              >
                <span className="block h-24 w-full overflow-hidden bg-[#2b3242]/5">
                  <img src={optimizedImage(item.url, 320)} alt="" loading="lazy" className="h-full w-full object-cover" />
                </span>
                {selected && <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-[#9f7a47] text-[#fffdf8]"><Check size={13} /></span>}
                <span className="block truncate px-2 pt-1.5 text-[11px] text-[#2b3242]">{item.filename ?? 'image'}</span>
                <span className="block truncate px-2 pb-1.5 font-mono text-[9px] uppercase tracking-[.08em] text-[#2b3242]/55">{(item.folder ?? '').replace('knc-horizon/', '') || '—'}</span>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

/**
 * One image (or, for older sections, a simple list): upload, pick from the library or paste a
 * URL. Uploads go to POST /admin/uploads, which stores them in Cloudinary and returns a
 * permanent https URL; nothing blob:/data: is ever written to the database. With `onAltChange`
 * the picker also edits the image's alt text.
 */
export function ImagePicker({
  label,
  value,
  onChange,
  multiple = false,
  help,
  folder = DEFAULT_MEDIA_FOLDER,
  alt,
  onAltChange,
  loadLibrary = listMedia,
  uploadImage = uploadAdminImage,
}: {
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  help?: string;
  /** The Cloudinary folder new uploads go to (the admin can change it per upload). */
  folder?: string;
  alt?: string;
  onAltChange?: (alt: string) => void;
  /** Where the library and uploads go; the SEO console passes its own routes. */
  loadLibrary?: () => Promise<MediaItem[]>;
  uploadImage?: UploadFn;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState('');
  const [error, setError] = useState('');
  const [urlDraft, setUrlDraft] = useState('');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [target, folderSelect] = useUploadFolder(folder);
  const toast = useToast();

  const urls = multiple ? (Array.isArray(value) ? value : value ? [String(value)] : []) : value ? [String(value)] : [];

  const commit = (next: string[]) => onChange(multiple ? next : (next[0] ?? ''));

  const addUrls = (added: string[]) => {
    const clean = added.map((url) => url.trim()).filter(Boolean);
    if (!clean.length) return;
    const bad = clean.find((url) => !isImageUrl(url));
    if (bad) {
      setError(/^(blob:|data:|file:)/i.test(bad) || /^[a-zA-Z]:\\/.test(bad)
        ? 'That is a local preview path. Upload the file or paste an https:// URL.'
        : 'Paste a full https:// image URL, or a site path such as /images/photo.jpg.');
      return;
    }
    setError('');
    commit(multiple ? [...urls, ...clean.filter((url) => !urls.includes(url))] : [clean[0]!]);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const chosen = Array.from(files).slice(0, multiple ? 20 : 1);
    setError('');
    setUploading(`Uploading 0 of ${chosen.length}…`);
    try {
      const outcomes = await uploadEach(chosen, (file) => uploadImage(file, target), (done, total) => setUploading(`Uploading ${done} of ${total}…`));
      const uploaded = outcomes.flatMap((outcome) => (outcome.result ? [outcome.result.url] : []));
      const failed = outcomes.flatMap((outcome) => (outcome.error ? [outcome.error] : []));
      if (uploaded.length) {
        commit(multiple ? [...urls, ...uploaded] : uploaded.slice(0, 1));
        toast('success', uploaded.length > 1 ? `${uploaded.length} images uploaded to ${target}.` : `Image uploaded to ${target}.`);
      }
      if (failed.length) {
        setError(failed.join(' '));
        toast('error', failed.length === 1 ? failed[0]! : `${failed.length} images could not be uploaded.`);
      }
    } finally {
      setUploading('');
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[.14em] text-[#2b3242]/65">{label}</span>
        <div className="flex flex-wrap items-center gap-2">
          {folderSelect}
          <button type="button" className={adminButtonClass('ghost')} onClick={() => inputRef.current?.click()} disabled={Boolean(uploading)} data-testid="button-upload-image">
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} {uploading || 'Upload'}
          </button>
          <button type="button" className={adminButtonClass('ghost')} onClick={() => setLibraryOpen(true)}>
            <ImageIcon size={13} /> Library
          </button>
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*,.heic,.heif" multiple={multiple} className="hidden" onChange={(event) => handleFiles(event.target.files)} data-testid="input-file-image" />

      {urls.length > 0 && (
        <div className="mt-3 flex flex-wrap items-start gap-3">
          {urls.map((url, index) => (
            <div key={`${url}-${index}`} className="group relative h-24 w-32 overflow-hidden rounded-lg border border-[#2b3242]/12 bg-[#2b3242]/5">
              <img src={optimizedImage(url, 320)} alt={alt ?? ''} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => commit(urls.filter((_, i) => i !== index))}
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-[#2b3242]/80 text-[#fffdf8] opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X size={12} />
              </button>
              {multiple && index === 0 && (
                <span className="absolute bottom-1 left-1 rounded-lg bg-[#2b3242]/80 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[.12em] text-[#fffdf8]">Main</span>
              )}
            </div>
          ))}
          {onAltChange && !multiple && (
            <label className="min-w-[14rem] flex-1">
              <span className="font-mono text-[10px] uppercase tracking-[.12em] text-[#2b3242]/60">Alt text (SEO)</span>
              <input
                value={alt ?? ''}
                maxLength={250}
                onChange={(event) => onAltChange(event.target.value)}
                placeholder="What the photo shows, e.g. Pool terrace of a villa on Palm Jumeirah"
                className="mt-1 w-full rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] px-3 py-2 text-sm outline-none focus:border-[#9f7a47]"
                data-testid="input-image-alt"
              />
            </label>
          )}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <input
          value={urlDraft}
          onChange={(event) => setUrlDraft(event.target.value)}
          placeholder="or paste an image URL (https://…)"
          className="min-w-0 flex-1 rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] px-3 py-2 text-sm outline-none focus:border-[#9f7a47]"
        />
        <button
          type="button"
          className={adminButtonClass('ghost')}
          onClick={() => { addUrls([urlDraft]); setUrlDraft(''); }}
        >
          Add
        </button>
      </div>

      {help && !error && <p className="mt-2 text-xs text-[#2b3242]/60">{help}</p>}
      {error && <p className="mt-2 text-xs text-[#b23b2e]" role="alert">{error}</p>}

      <MediaLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        load={loadLibrary}
        multiple={multiple}
        onPick={(items) => addUrls(items.map((item) => item.url))}
      />
    </div>
  );
}

export type GalleryImageValue = { url: string; alt: string };

/**
 * A gallery: several images, each its own Cloudinary asset with its own alt text, in the order
 * the admin sets. Selecting twelve files uploads twelve separate assets.
 */
export function GalleryPicker({
  label,
  value,
  onChange,
  help,
  folder = DEFAULT_MEDIA_FOLDER,
  max = 30,
  loadLibrary = listMedia,
  uploadImage = uploadAdminImage,
}: {
  label: string;
  value: GalleryImageValue[] | undefined;
  onChange: (value: GalleryImageValue[]) => void;
  help?: string;
  folder?: string;
  max?: number;
  loadLibrary?: () => Promise<MediaItem[]>;
  uploadImage?: UploadFn;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState('');
  const [problems, setProblems] = useState<string[]>([]);
  const [urlDraft, setUrlDraft] = useState('');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [target, folderSelect] = useUploadFolder(folder);
  const toast = useToast();
  const images = Array.isArray(value) ? value : [];
  const room = Math.max(0, max - images.length);

  const add = (urls: string[]) => {
    const fresh = urls.filter((url) => !images.some((image) => image.url === url));
    if (!fresh.length) return;
    onChange([...images, ...fresh.slice(0, room).map((url) => ({ url, alt: '' }))]);
    if (fresh.length > room) toast('error', `A gallery holds up to ${max} images; ${fresh.length - room} not added.`);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const chosen = Array.from(files);
    if (!room) { toast('error', `This gallery already has ${max} images.`); return; }
    const batch = chosen.slice(0, room);
    setProblems(chosen.length > room ? [`Only ${room} more ${room === 1 ? 'image fits' : 'images fit'}; ${chosen.length - room} skipped.`] : []);
    setProgress(`Uploading 0 of ${batch.length}…`);
    try {
      const outcomes = await uploadEach(batch, (file) => uploadImage(file, target), (done, total) => setProgress(`Uploading ${done} of ${total}…`));
      const uploaded = outcomes.flatMap((outcome) => (outcome.result ? [outcome.result.url] : []));
      const failed = outcomes.flatMap((outcome) => (outcome.error ? [outcome.error] : []));
      add(uploaded);
      if (uploaded.length) toast('success', `${uploaded.length} ${uploaded.length === 1 ? 'image' : 'images'} uploaded to ${target}. Add alt text to each.`);
      if (failed.length) {
        setProblems((current) => [...current, ...failed]);
        toast('error', `${failed.length} ${failed.length === 1 ? 'image' : 'images'} could not be uploaded.`);
      }
    } finally {
      setProgress('');
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const update = (index: number, patch: Partial<GalleryImageValue>) => onChange(images.map((image, i) => (i === index ? { ...image, ...patch } : image)));
  const move = (index: number, step: -1 | 1) => {
    const to = index + step;
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    [next[index], next[to]] = [next[to]!, next[index]!];
    onChange(next);
  };

  return (
    <div data-testid="gallery-picker">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[.14em] text-[#2b3242]/65">
          {label} <span className="text-[#2b3242]/45">({images.length}/{max})</span>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {folderSelect}
          <button type="button" className={adminButtonClass('ghost')} onClick={() => inputRef.current?.click()} disabled={Boolean(progress) || !room} data-testid="button-upload-gallery">
            {progress ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} {progress || 'Upload images'}
          </button>
          <button type="button" className={adminButtonClass('ghost')} onClick={() => setLibraryOpen(true)} disabled={!room}>
            <ImageIcon size={13} /> Library
          </button>
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*,.heic,.heif" multiple className="hidden" onChange={(event) => handleFiles(event.target.files)} data-testid="input-file-gallery" />

      {images.length > 0 ? (
        <ol className="mt-3 grid gap-3 sm:grid-cols-2">
          {images.map((image, index) => (
            <li key={image.url} className="flex gap-3 rounded-lg border border-[#2b3242]/12 bg-[#fffdf8] p-2">
              <img src={optimizedImage(image.url, 320)} alt={image.alt} className="h-20 w-28 shrink-0 rounded-md bg-[#2b3242]/5 object-cover" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <input
                  value={image.alt}
                  maxLength={250}
                  onChange={(event) => update(index, { alt: event.target.value })}
                  placeholder="Alt text: what this photo shows"
                  aria-label={`Alt text for image ${index + 1}`}
                  className="w-full rounded-md border border-[#2b3242]/20 bg-[#fffdf8] px-2 py-1.5 text-xs outline-none focus:border-[#9f7a47]"
                  data-testid={`input-gallery-alt-${index}`}
                />
                <div className="flex items-center gap-1">
                  <span className="mr-auto font-mono text-[9px] uppercase tracking-[.1em] text-[#2b3242]/50">#{index + 1}</span>
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="grid h-7 w-7 place-items-center rounded-md border border-[#2b3242]/15 text-[#2b3242] hover:border-[#9f7a47] disabled:opacity-30" aria-label="Move earlier"><ArrowUp size={12} /></button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === images.length - 1} className="grid h-7 w-7 place-items-center rounded-md border border-[#2b3242]/15 text-[#2b3242] hover:border-[#9f7a47] disabled:opacity-30" aria-label="Move later"><ArrowDown size={12} /></button>
                  <button type="button" onClick={() => onChange(images.filter((_, i) => i !== index))} className="grid h-7 w-7 place-items-center rounded-md border border-[#2b3242]/15 text-[#b23b2e] hover:border-[#b23b2e]" aria-label="Remove from gallery"><X size={12} /></button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 rounded-lg border border-dashed border-[#2b3242]/20 px-4 py-5 text-center text-xs text-[#2b3242]/55">No gallery images yet. Select several files at once; each becomes its own image.</p>
      )}

      <div className="mt-3 flex gap-2">
        <input
          value={urlDraft}
          onChange={(event) => setUrlDraft(event.target.value)}
          placeholder="or paste an image URL (https://…)"
          className="min-w-0 flex-1 rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] px-3 py-2 text-sm outline-none focus:border-[#9f7a47]"
        />
        <button
          type="button"
          className={adminButtonClass('ghost')}
          disabled={!room}
          onClick={() => {
            const url = urlDraft.trim();
            if (!url) return;
            if (!isImageUrl(url)) { setProblems(['Paste a full https:// image URL, or a site path such as /images/photo.jpg.']); return; }
            setProblems([]);
            add([url]);
            setUrlDraft('');
          }}
        >
          Add
        </button>
      </div>

      {help && !problems.length && <p className="mt-2 text-xs text-[#2b3242]/60">{help}</p>}
      {problems.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-xs text-[#b23b2e]" role="alert">
          {problems.map((problem) => <li key={problem}>{problem}</li>)}
        </ul>
      )}

      <MediaLibraryModal open={libraryOpen} onClose={() => setLibraryOpen(false)} load={loadLibrary} multiple onPick={(items) => add(items.map((item) => item.url))} />
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
