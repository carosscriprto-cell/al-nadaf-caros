'use client';

// components/dashboard/settings/ImageUploadField.tsx — image upload for tenant
// branding (logo/favicon). Same Storage + WebP-compression treatment as car
// images; shows the current image with a Replace/Remove option and stores the
// resulting public URL via onChange (the settings form saves it to logo_url /
// favicon_url).

import { useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { ImagePlus, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { compressImageToWebP, validateSourceFile, deleteCarImageByUrl, ACCEPTED_TYPES } from '@/lib/storage/carImages';
import { uploadBrandingImage, type BrandingKind } from '@/lib/storage/brandingImages';

type Props = {
  tenantId: string;
  kind: BrandingKind;
  value: string;
  onChange: (url: string) => void;
  label: string;
  hint?: string;
  disabled?: boolean;
  variant?: 'logo' | 'icon' | 'hero';
  copy: { upload: string; replace: string; remove: string; uploading: string };
};

export default function ImageUploadField({
  tenantId, kind, value, onChange, label, hint, disabled, variant = 'logo', copy,
}: Props) {
  const supabase = createBrowserClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  // Logos: keep transparency-friendly size; favicons: small square; hero: wide,
  // full-res background (larger max dimension → ~2MB post-compress).
  const maxDim = variant === 'icon' ? 256 : variant === 'hero' ? 1920 : 640;
  const previewCls = variant === 'icon' ? 'h-16 w-16' : variant === 'hero' ? 'h-16 w-40' : 'h-16 w-28';

  const handleFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || disabled) return;
    const bad = validateSourceFile(file);
    if (bad === 'type') { toast.error('Unsupported file type'); return; }
    if (bad === 'size') { toast.error('File too large (max 15MB)'); return; }

    setBusy(true);
    try {
      const { blob } = await compressImageToWebP(file, maxDim, 0.9);
      const prev = value;
      const url = await uploadBrandingImage(supabase, tenantId, kind, blob);
      onChange(url);
      // best-effort cleanup of the replaced object
      if (prev) deleteCarImageByUrl(supabase, prev).catch(() => {});
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const clear = () => {
    const prev = value;
    onChange('');
    if (prev) deleteCarImageByUrl(supabase, prev).catch(() => {});
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#6b7178]">{label}</label>
      <div className="flex items-center gap-3">
        <div className={`relative ${previewCls} shrink-0 overflow-hidden rounded-xl border border-[#e7e8ea] bg-[#fafbfc]`}>
          {value ? (
            <Image src={value} alt="" fill sizes="120px" className="object-contain p-1.5" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#cbd0d6]">
              <ImagePlus size={18} />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || busy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#e7e8ea] bg-white px-3 py-2 text-xs font-semibold text-[#6b7178] transition hover:border-[#75ACE8]/40 hover:text-[#1a1d21] disabled:opacity-50"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
            {busy ? copy.uploading : value ? copy.replace : copy.upload}
          </button>
          {value && !busy && (
            <button
              type="button"
              onClick={clear}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={14} /> {copy.remove}
            </button>
          )}
        </div>
      </div>
      {hint && <p className="mt-1 text-[11px] text-[#9aa0a8]">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />
    </div>
  );
}
