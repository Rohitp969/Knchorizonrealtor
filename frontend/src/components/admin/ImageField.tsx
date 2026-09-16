import React, { useRef, useState } from 'react';
import { Upload, Link as LinkIcon, Check, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { VERIFIED_IMAGES, resolveImageUrl } from '@/lib/images';

export type ImageFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
};

export function ImageField({ label, value, onChange, helperText }: ImageFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const token = localStorage.getItem('knc_admin_token');
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/uploads', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data = (await response.json()) as { url: string; filename: string };
      if (data.url) {
        onChange(data.url);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try a valid image file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const previewUrl = resolveImageUrl(value);
  const isExternalUrl = value.startsWith('http://') || value.startsWith('https://');
  const isLocalFile = value.startsWith('/') || value.startsWith('frontend/public/');

  return (
    <div className="space-y-2 border border-[#202635]/12 bg-[#f5f0e6]/50 p-3.5 rounded-xs">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-wider text-[#202635]/80 font-medium">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[#c97352] hover:underline"
        >
          <Sparkles size={11} />
          {showPresets ? 'Hide Presets' : 'Choose Verified Image'}
        </button>
      </div>

      {/* Verified Preset Selector */}
      {showPresets && (
        <div className="grid grid-cols-2 gap-2 border border-[#c97352]/30 bg-white/80 p-2.5 rounded-xs my-2 max-h-48 overflow-y-auto">
          {Object.values(VERIFIED_IMAGES).map((preset) => (
            <div
              key={preset.id}
              className="flex items-center gap-2 p-1.5 border border-[#202635]/8 hover:border-[#c97352] transition-colors rounded-xs bg-white cursor-pointer group"
              onClick={() => {
                onChange(preset.option1_url);
                setShowPresets(false);
              }}
            >
              <img
                src={preset.option2_local.websitePath}
                alt={preset.name}
                className="h-10 w-14 object-cover rounded-xs"
                onError={(e) => {
                  e.currentTarget.src = preset.option1_url;
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-[#202635] truncate">{preset.name}</p>
                <div className="flex items-center gap-2 text-[9px] font-mono text-[#c97352]">
                  <span>Click to select</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Option 1: URL input */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <input
            className="input pr-8 text-xs font-mono"
            placeholder="https://... (Option 1) or /images/... (Option 2)"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#202635]/40 hover:text-[#c97352]"
              title="Clear image"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Option 2: Upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn border border-[#202635]/25 bg-white hover:border-[#c97352] hover:text-[#c97352] text-xs whitespace-nowrap px-3 py-2 shrink-0"
        >
          <Upload size={13} />
          <span>{uploading ? 'Uploading…' : 'Upload File'}</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {uploadError && (
        <p className="text-[11px] text-[#c97352] font-mono">{uploadError}</p>
      )}

      {/* Preview & source badges */}
      {value ? (
        <div className="flex items-center gap-3 pt-1">
          <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xs border border-[#202635]/15 bg-black/5">
            <img
              src={previewUrl}
              alt="Preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/images/creek-waterfront.jpg';
              }}
            />
          </div>
          <div className="min-w-0 flex-1 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-[#202635]/10 text-[#202635]">
                {isExternalUrl ? 'Option 1: Verified URL' : isLocalFile ? 'Option 2: Local File' : 'Custom Path'}
              </span>
              <span className="text-[#55735f] font-mono text-[9px] flex items-center gap-0.5">
                <Check size={10} /> Active
              </span>
            </div>
            <p className="mt-0.5 font-mono text-[10px] text-[#202635]/60 truncate">
              {value}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-[10px] text-[#202635]/50 font-mono">
          {helperText || 'Enter a verified image URL (Option 1) or upload a local file (Option 2).'}
        </p>
      )}
    </div>
  );
}
