import { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Upload,
  FolderOpen,
  Undo,
  Redo,
  Code,
  Eye,
  X,
  Check,
  Loader2,
  ExternalLink,
} from 'lucide-react';

import { listMedia, uploadAdminImage, type MediaItem } from '@/lib/admin-api';
import { MediaLibraryModal, Modal, adminButtonClass, isImageUrl, useToast } from './admin-ui';

export interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  error?: string;
  hint?: string;
  testId?: string;
  minHeight?: string;
  folder?: string;
  loadLibrary?: () => Promise<MediaItem[]>;
  uploadImage?: (file: File, folder?: string) => Promise<{ url: string; warning?: string }>;
}

/**
 * Converts legacy plain-text articles (where paragraphs are separated by newlines)
 * into semantic HTML paragraphs so they render beautifully inside the editor.
 */
function normalizeInitialContent(content: string): string {
  if (!content) return '';
  const trimmed = content.trim();
  if (!trimmed) return '';
  // If it already looks like HTML (has tags), return as is
  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed;
  }
  // Convert double-newlines to paragraphs, single newlines to <br>
  const paragraphs = trimmed.split(/\n\s*\n/);
  return paragraphs
    .map((p) => `<p>${p.replace(/\n/g, '<br />')}</p>`)
    .join('');
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = 'Write your article here…',
  readOnly = false,
  error,
  hint,
  testId,
  minHeight = '320px',
  folder = 'knc-horizon/blog',
  loadLibrary = listMedia,
  uploadImage = uploadAdminImage,
}: RichTextEditorProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals state
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(true);

  const [imageUrlModalOpen, setImageUrlModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Source code view toggle
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceCode, setSourceCode] = useState(value ?? '');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-[#9f7a47] underline underline-offset-4 decoration-[#9f7a47]/50 hover:text-[#7a5929]',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'article-body-image rounded-xl shadow-md my-6 max-w-full h-auto',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: normalizeInitialContent(value),
    editable: !readOnly,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      // If editor only has an empty paragraph, send empty string
      const isEmpty = html === '<p></p>' || html === '';
      const finalVal = isEmpty ? '' : html;
      onChange(finalVal);
      setSourceCode(finalVal);
    },
  });

  // Keep editor editable state in sync with readOnly prop
  useEffect(() => {
    if (editor && editor.isEditable === readOnly) {
      editor.setEditable(!readOnly);
    }
  }, [editor, readOnly]);

  // Sync external value changes (e.g. on reset or draft loaded) when not currently focused
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const normalizedNew = normalizeInitialContent(value);
    if (value !== currentHtml && normalizedNew !== currentHtml && !editor.isFocused && !isSourceMode) {
      editor.commands.setContent(normalizedNew, { emitUpdate: false });
      setSourceCode(value ?? '');
    }
  }, [value, editor, isSourceMode]);

  // Sync source mode edits to editor
  const handleSourceChange = (newSource: string) => {
    setSourceCode(newSource);
    onChange(newSource);
    if (editor) {
      editor.commands.setContent(normalizeInitialContent(newSource), { emitUpdate: false });
    }
  };

  // Link Handlers
  const handleOpenLinkModal = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ' '
    );
    setLinkUrl(previousUrl);
    setLinkText(selectedText);
    setOpenInNewTab(true);
    setLinkModalOpen(true);
  };

  const handleApplyLink = () => {
    if (!editor) return;
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setLinkModalOpen(false);
      return;
    }

    let formattedUrl = linkUrl.trim();
    if (!/^(https?:\/\/|\/|mailto:|tel:)/i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    if (linkText.trim() && editor.state.selection.empty) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: linkText.trim(),
          marks: [
            {
              type: 'link',
              attrs: {
                href: formattedUrl,
                target: openInNewTab ? '_blank' : null,
                rel: openInNewTab ? 'noopener noreferrer' : null,
              },
            },
          ],
        })
        .run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({
          href: formattedUrl,
          target: openInNewTab ? '_blank' : null,
          rel: openInNewTab ? 'noopener noreferrer' : null,
        })
        .run();
    }

    setLinkModalOpen(false);
  };

  const handleRemoveLink = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setLinkModalOpen(false);
  };

  // Image Upload Handlers
  const handleUploadFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    if (!file.type.startsWith('image/')) {
      toast('error', 'Selected file is not an image.');
      return;
    }

    setUploadingImage(true);
    setUploadProgress(`Uploading ${file.name} to Cloudinary…`);

    try {
      const outcome = await uploadImage(file, folder);
      if (outcome?.url) {
        editor
          .chain()
          .focus()
          .setImage({
            src: outcome.url,
            alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
          })
          .run();
        toast('success', 'Image inserted into article body.');
      } else {
        toast('error', 'Failed to retrieve uploaded image URL.');
      }
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploadingImage(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Apply External Image URL
  const handleApplyImageUrl = () => {
    if (!editor) return;
    const cleanUrl = imageUrl.trim();
    if (!cleanUrl) {
      toast('error', 'Please provide an image URL.');
      return;
    }
    if (!isImageUrl(cleanUrl)) {
      toast('error', 'Please provide a valid https:// image URL.');
      return;
    }

    editor
      .chain()
      .focus()
      .setImage({
        src: cleanUrl,
        alt: imageAlt.trim() || 'Article body image',
      })
      .run();

    setImageUrl('');
    setImageAlt('');
    setImageUrlModalOpen(false);
    toast('success', 'Image inserted into article.');
  };

  // Media Library Pick Handler
  const handlePickFromMediaLibrary = (items: MediaItem[]) => {
    if (!editor || !items.length) return;
    items.forEach((item) => {
      editor
        .chain()
        .focus()
        .setImage({
          src: item.url,
          alt: item.filename || 'Article body image',
        })
        .run();
    });
    setMediaLibraryOpen(false);
    toast('success', `Inserted ${items.length === 1 ? 'image' : `${items.length} images`} from media library.`);
  };

  // Calculations
  const wordCount = editor ? editor.storage.characterCount?.words?.() ?? editor.state.doc.textContent.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = editor ? editor.state.doc.textContent.length : 0;

  const activeHeading = !editor
    ? 'p'
    : editor.isActive('heading', { level: 1 })
    ? 'h1'
    : editor.isActive('heading', { level: 2 })
    ? 'h2'
    : editor.isActive('heading', { level: 3 })
    ? 'h3'
    : 'p';

  return (
    <div className="w-full" data-testid={testId || 'rich-text-editor'}>
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <label className="font-mono text-[11px] uppercase tracking-[.14em] text-[#2b3242]/75">
            {label}
          </label>
          <span className="font-mono text-[10px] text-[#2b3242]/50">
            {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} chars
          </span>
        </div>
      )}

      {/* Editor Main Container */}
      <div
        className={`relative flex flex-col rounded-xl border bg-[#fffdf8] shadow-[0_1px_3px_rgba(43,50,66,0.05)] transition-all ${
          error
            ? 'border-[#b23b2e] ring-1 ring-[#b23b2e]'
            : 'border-[#2b3242]/20 focus-within:border-[#9f7a47] focus-within:ring-2 focus-within:ring-[#9f7a47]/30'
        } ${readOnly ? 'opacity-80' : ''}`}
      >
        {/* Modern Rich Text Toolbar */}
        {!readOnly && (
          <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-[#2b3242]/12 bg-[#faf7f1]/90 px-3 py-2 backdrop-blur-sm rounded-t-xl">
            {/* Heading Style Select */}
            <select
              value={activeHeading}
              onChange={(e) => {
                if (!editor) return;
                const val = e.target.value;
                if (val === 'p') editor.chain().focus().setParagraph().run();
                else if (val === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
                else if (val === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
                else if (val === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
              }}
              className="h-8 rounded-lg border border-[#2b3242]/15 bg-[#fffdf8] px-2 text-xs font-medium text-[#2b3242] outline-none focus:border-[#9f7a47]"
              aria-label="Text style hierarchy"
              title="Heading style"
            >
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1 (H1)</option>
              <option value="h2">Heading 2 (H2)</option>
              <option value="h3">Heading 3 (H3)</option>
            </select>

            <div className="h-5 w-[1px] bg-[#2b3242]/15 mx-1" />

            {/* Bold */}
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`grid h-8 w-8 place-items-center rounded-lg border text-sm transition-colors ${
                editor?.isActive('bold')
                  ? 'border-[#9f7a47] bg-[#9f7a47] text-[#fffdf8]'
                  : 'border-transparent text-[#2b3242]/80 hover:bg-[#2b3242]/8'
              }`}
              title="Bold (Ctrl+B)"
              aria-label="Bold"
            >
              <Bold size={15} />
            </button>

            {/* Italic */}
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`grid h-8 w-8 place-items-center rounded-lg border text-sm transition-colors ${
                editor?.isActive('italic')
                  ? 'border-[#9f7a47] bg-[#9f7a47] text-[#fffdf8]'
                  : 'border-transparent text-[#2b3242]/80 hover:bg-[#2b3242]/8'
              }`}
              title="Italic (Ctrl+I)"
              aria-label="Italic"
            >
              <Italic size={15} />
            </button>

            {/* Underline */}
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={`grid h-8 w-8 place-items-center rounded-lg border text-sm transition-colors ${
                editor?.isActive('underline')
                  ? 'border-[#9f7a47] bg-[#9f7a47] text-[#fffdf8]'
                  : 'border-transparent text-[#2b3242]/80 hover:bg-[#2b3242]/8'
              }`}
              title="Underline (Ctrl+U)"
              aria-label="Underline"
            >
              <UnderlineIcon size={15} />
            </button>

            <div className="h-5 w-[1px] bg-[#2b3242]/15 mx-1" />

            {/* Bullet List */}
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`grid h-8 w-8 place-items-center rounded-lg border text-sm transition-colors ${
                editor?.isActive('bulletList')
                  ? 'border-[#9f7a47] bg-[#9f7a47] text-[#fffdf8]'
                  : 'border-transparent text-[#2b3242]/80 hover:bg-[#2b3242]/8'
              }`}
              title="Bullet list"
              aria-label="Bullet list"
            >
              <List size={15} />
            </button>

            {/* Numbered List */}
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`grid h-8 w-8 place-items-center rounded-lg border text-sm transition-colors ${
                editor?.isActive('orderedList')
                  ? 'border-[#9f7a47] bg-[#9f7a47] text-[#fffdf8]'
                  : 'border-transparent text-[#2b3242]/80 hover:bg-[#2b3242]/8'
              }`}
              title="Numbered list"
              aria-label="Numbered list"
            >
              <ListOrdered size={15} />
            </button>

            {/* Blockquote */}
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              className={`grid h-8 w-8 place-items-center rounded-lg border text-sm transition-colors ${
                editor?.isActive('blockquote')
                  ? 'border-[#9f7a47] bg-[#9f7a47] text-[#fffdf8]'
                  : 'border-transparent text-[#2b3242]/80 hover:bg-[#2b3242]/8'
              }`}
              title="Quote / Callout"
              aria-label="Blockquote"
            >
              <Quote size={15} />
            </button>

            <div className="h-5 w-[1px] bg-[#2b3242]/15 mx-1" />

            {/* Alignment Buttons */}
            <button
              type="button"
              onClick={() => editor?.chain().focus().setTextAlign('left').run()}
              className={`grid h-8 w-8 place-items-center rounded-lg border text-sm transition-colors ${
                editor?.isActive({ textAlign: 'left' })
                  ? 'border-[#9f7a47] bg-[#9f7a47] text-[#fffdf8]'
                  : 'border-transparent text-[#2b3242]/80 hover:bg-[#2b3242]/8'
              }`}
              title="Align left"
              aria-label="Align left"
            >
              <AlignLeft size={15} />
            </button>

            <button
              type="button"
              onClick={() => editor?.chain().focus().setTextAlign('center').run()}
              className={`grid h-8 w-8 place-items-center rounded-lg border text-sm transition-colors ${
                editor?.isActive({ textAlign: 'center' })
                  ? 'border-[#9f7a47] bg-[#9f7a47] text-[#fffdf8]'
                  : 'border-transparent text-[#2b3242]/80 hover:bg-[#2b3242]/8'
              }`}
              title="Align center"
              aria-label="Align center"
            >
              <AlignCenter size={15} />
            </button>

            <button
              type="button"
              onClick={() => editor?.chain().focus().setTextAlign('right').run()}
              className={`grid h-8 w-8 place-items-center rounded-lg border text-sm transition-colors ${
                editor?.isActive({ textAlign: 'right' })
                  ? 'border-[#9f7a47] bg-[#9f7a47] text-[#fffdf8]'
                  : 'border-transparent text-[#2b3242]/80 hover:bg-[#2b3242]/8'
              }`}
              title="Align right"
              aria-label="Align right"
            >
              <AlignRight size={15} />
            </button>

            <button
              type="button"
              onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
              className={`grid h-8 w-8 place-items-center rounded-lg border text-sm transition-colors ${
                editor?.isActive({ textAlign: 'justify' })
                  ? 'border-[#9f7a47] bg-[#9f7a47] text-[#fffdf8]'
                  : 'border-transparent text-[#2b3242]/80 hover:bg-[#2b3242]/8'
              }`}
              title="Justify"
              aria-label="Justify"
            >
              <AlignJustify size={15} />
            </button>

            <div className="h-5 w-[1px] bg-[#2b3242]/15 mx-1" />

            {/* Link tool */}
            <button
              type="button"
              onClick={handleOpenLinkModal}
              className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors ${
                editor?.isActive('link')
                  ? 'border-[#9f7a47] bg-[#9f7a47] text-[#fffdf8]'
                  : 'border-[#2b3242]/15 bg-[#fffdf8] text-[#2b3242] hover:border-[#9f7a47]'
              }`}
              title="Insert or edit link"
              aria-label="Insert or edit link"
            >
              <LinkIcon size={13} />
              <span>Link</span>
            </button>

            {editor?.isActive('link') && (
              <button
                type="button"
                onClick={handleRemoveLink}
                className="grid h-8 w-8 place-items-center rounded-lg border border-[#b23b2e]/30 bg-[#b23b2e]/10 text-[#b23b2e] hover:bg-[#b23b2e]/20"
                title="Remove link"
                aria-label="Remove link"
              >
                <Unlink size={13} />
              </button>
            )}

            <div className="h-5 w-[1px] bg-[#2b3242]/15 mx-1" />

            {/* Body Image Actions Group */}
            <div className="flex items-center gap-1">
              {/* Upload Body Image Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#2b3242]/15 bg-[#fffdf8] px-2.5 text-xs font-medium text-[#2b3242] hover:border-[#9f7a47] disabled:opacity-50"
                title="Upload image directly into article body"
              >
                {uploadingImage ? <Loader2 size={13} className="animate-spin text-[#9f7a47]" /> : <Upload size={13} className="text-[#9f7a47]" />}
                <span>{uploadingImage ? 'Uploading…' : 'Upload Image'}</span>
              </button>

              {/* Media Library Image Button */}
              <button
                type="button"
                onClick={() => setMediaLibraryOpen(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#2b3242]/15 bg-[#fffdf8] px-2 text-xs font-medium text-[#2b3242] hover:border-[#9f7a47]"
                title="Choose image from Media Library"
              >
                <FolderOpen size={13} />
                <span className="hidden sm:inline">Library</span>
              </button>

              {/* Paste Image URL Button */}
              <button
                type="button"
                onClick={() => setImageUrlModalOpen(true)}
                className="grid h-8 w-8 place-items-center rounded-lg border border-[#2b3242]/15 bg-[#fffdf8] text-[#2b3242] hover:border-[#9f7a47]"
                title="Insert Image by URL"
              >
                <ImageIcon size={14} />
              </button>
            </div>

            <div className="h-5 w-[1px] bg-[#2b3242]/15 mx-1" />

            {/* Undo / Redo */}
            <button
              type="button"
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={!editor?.can().undo()}
              className="grid h-8 w-8 place-items-center rounded-lg border border-transparent text-[#2b3242]/80 hover:bg-[#2b3242]/8 disabled:opacity-30"
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
            >
              <Undo size={14} />
            </button>

            <button
              type="button"
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={!editor?.can().redo()}
              className="grid h-8 w-8 place-items-center rounded-lg border border-transparent text-[#2b3242]/80 hover:bg-[#2b3242]/8 disabled:opacity-30"
              title="Redo (Ctrl+Y)"
              aria-label="Redo"
            >
              <Redo size={14} />
            </button>

            {/* HTML Source Toggle */}
            <div className="ml-auto flex items-center">
              <button
                type="button"
                onClick={() => setIsSourceMode(!isSourceMode)}
                className={`inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-mono uppercase tracking-[.08em] transition-colors ${
                  isSourceMode
                    ? 'border-[#9f7a47] bg-[#9f7a47] text-[#fffdf8]'
                    : 'border-[#2b3242]/15 bg-[#fffdf8] text-[#2b3242]/80 hover:border-[#9f7a47]'
                }`}
                title={isSourceMode ? 'Switch to Rich Visual Editor' : 'Edit raw HTML source'}
              >
                {isSourceMode ? <Eye size={13} /> : <Code size={13} />}
                <span>{isSourceMode ? 'Visual' : 'HTML'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Hidden File Input for Body Image Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          className="hidden"
          onChange={handleUploadFileChange}
        />

        {/* Upload progress banner */}
        {uploadingImage && (
          <div className="flex items-center gap-2 bg-[#9f7a47]/10 px-4 py-2 text-xs text-[#80623a]">
            <Loader2 size={13} className="animate-spin text-[#9f7a47]" />
            <span>{uploadProgress || 'Uploading image to Cloudinary…'}</span>
          </div>
        )}

        {/* Editor Content Area */}
        <div className="flex-1 p-4" style={{ minHeight }}>
          {isSourceMode ? (
            <textarea
              value={sourceCode}
              onChange={(e) => handleSourceChange(e.target.value)}
              placeholder="<p>Enter HTML source code…</p>"
              disabled={readOnly}
              className="h-full min-h-[300px] w-full resize-y font-mono text-xs leading-relaxed text-[#2b3242] outline-none bg-transparent"
              spellCheck={false}
            />
          ) : (
            <EditorContent
              editor={editor}
              className="knc-prose prose-rich min-h-[280px] w-full max-w-none text-[#2b3242] outline-none"
            />
          )}
        </div>
      </div>

      {/* Helper and Error Messages */}
      {hint && !error && <p className="mt-1.5 text-xs text-[#2b3242]/60">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-[#b23b2e]" role="alert">{error}</p>}

      {/* Insert / Edit Link Modal */}
      <Modal
        open={linkModalOpen}
        title={editor?.isActive('link') ? 'Edit Link' : 'Insert Link'}
        onClose={() => setLinkModalOpen(false)}
        footer={
          <>
            {editor?.isActive('link') && (
              <button
                type="button"
                className="mr-auto inline-flex items-center gap-1.5 text-xs text-[#b23b2e] hover:underline"
                onClick={handleRemoveLink}
              >
                <Unlink size={13} /> Remove Link
              </button>
            )}
            <button
              type="button"
              className={adminButtonClass('ghost')}
              onClick={() => setLinkModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={adminButtonClass('primary')}
              onClick={handleApplyLink}
            >
              Apply Link
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-[.12em] text-[#2b3242]/70 mb-1">
              Link URL <span className="text-[#b23b2e]">*</span>
            </label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com/page or /properties/villa-1"
              className="w-full rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] px-3 py-2 text-sm text-[#2b3242] outline-none focus:border-[#9f7a47]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyLink();
                }
              }}
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-[.12em] text-[#2b3242]/70 mb-1">
              Link Text (optional if text already selected)
            </label>
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="e.g. Explore Luxury Villas"
              className="w-full rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] px-3 py-2 text-sm text-[#2b3242] outline-none focus:border-[#9f7a47]"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-[#2b3242]/80">
            <input
              type="checkbox"
              checked={openInNewTab}
              onChange={(e) => setOpenInNewTab(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-[#9f7a47]"
            />
            <span>Open in new tab (recommended for external websites)</span>
          </label>
        </div>
      </Modal>

      {/* Insert Image URL Modal */}
      <Modal
        open={imageUrlModalOpen}
        title="Insert Image from URL"
        onClose={() => setImageUrlModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              className={adminButtonClass('ghost')}
              onClick={() => setImageUrlModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={adminButtonClass('primary')}
              onClick={handleApplyImageUrl}
            >
              Insert Image
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-[.12em] text-[#2b3242]/70 mb-1">
              Image URL (HTTPS) <span className="text-[#b23b2e]">*</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/... or https://..."
              className="w-full rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] px-3 py-2 text-sm text-[#2b3242] outline-none focus:border-[#9f7a47]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyImageUrl();
                }
              }}
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-[.12em] text-[#2b3242]/70 mb-1">
              Alt Text (SEO & Accessibility)
            </label>
            <input
              type="text"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Describe what the image displays (e.g. Palm Jumeirah waterfront vista)"
              className="w-full rounded-lg border border-[#2b3242]/20 bg-[#fffdf8] px-3 py-2 text-sm text-[#2b3242] outline-none focus:border-[#9f7a47]"
            />
          </div>
        </div>
      </Modal>

      {/* Media Library Modal for Body Images */}
      <MediaLibraryModal
        open={mediaLibraryOpen}
        onClose={() => setMediaLibraryOpen(false)}
        load={loadLibrary}
        multiple={false}
        onPick={handlePickFromMediaLibrary}
      />
    </div>
  );
}
