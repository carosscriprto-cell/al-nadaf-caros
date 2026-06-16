'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { ImagePlus, Star, Trash2, Loader2, GripVertical } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import {
  compressImageToWebP, uploadCarImage, deleteCarImageByUrl, validateSourceFile, ACCEPTED_TYPES,
} from '@/lib/storage/carImages';
import { useDash } from '../DashboardI18n';

type Props = {
  tenantId: string;
  carId: string;
  images: string[];
  thumbnail: string;
  maxImages: number; // -1 = unlimited
  onChange: (images: string[], thumbnail: string) => void;
};

export default function ImagesField({ tenantId, carId, images, thumbnail, maxImages, onChange }: Props) {
  const { t } = useDash();
  const cf = t.cf;
  const supabase = createBrowserClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const dragIndex = useRef<number | null>(null);

  const unlimited = maxImages === -1;
  const atLimit = !unlimited && images.length >= maxImages;
  const primary = thumbnail || images[0] || '';

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = unlimited ? files.length : maxImages - images.length;
    if (remaining <= 0) {
      toast.error(`${cf.imgLimit} (${maxImages})`);
      return;
    }
    const selected = Array.from(files).slice(0, remaining);
    if (selected.length < files.length) toast.error(`${cf.imgLimit} (${maxImages})`);

    setBusy(true);
    let origBytes = 0;
    let compBytes = 0;
    const newUrls: string[] = [];
    try {
      for (const file of selected) {
        const bad = validateSourceFile(file);
        if (bad === 'type') { toast.error(`${cf.imgInvalidType}: ${file.name}`); continue; }
        if (bad === 'size') { toast.error(`${cf.imgTooLarge}: ${file.name}`); continue; }
        const { blob } = await compressImageToWebP(file, 1920, 0.8);
        origBytes += file.size;
        compBytes += blob.size;
        const url = await uploadCarImage(supabase, tenantId, carId, blob);
        newUrls.push(url);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
    if (newUrls.length) {
      const next = [...images, ...newUrls];
      onChange(next, thumbnail || next[0]);
      const kb = (n: number) => `${Math.round(n / 1024)}KB`;
      toast.success(`${cf.imgCompressed}: ${kb(origBytes)} → ${kb(compBytes)}`);
    }
  };

  const remove = async (url: string) => {
    const next = images.filter((u) => u !== url);
    onChange(next, thumbnail === url ? next[0] ?? '' : thumbnail);
    try { await deleteCarImageByUrl(supabase, url); } catch { /* best-effort */ }
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next, thumbnail);
  };

  return (
    <section className="rounded-2xl border border-[#ececec] bg-white p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#1a1d21]">{cf.imgTitle}</h2>
          <p className="mt-0.5 text-xs text-[#9aa0a8]">
            {cf.imgHint} {unlimited ? '' : `· ${images.length}/${maxImages}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((url, i) => {
          const isPrimary = url === primary;
          return (
            <div
              key={url}
              draggable
              onDragStart={() => (dragIndex.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragIndex.current !== null) reorder(dragIndex.current, i); dragIndex.current = null; }}
              className={`group relative aspect-[4/3] overflow-hidden rounded-xl border ${isPrimary ? 'border-[#75ACE8] ring-2 ring-[#75ACE8]/30' : 'border-[#e7e8ea]'}`}
            >
              <Image src={url} alt="" fill sizes="200px" className="object-cover" />
              {isPrimary && (
                <span className="absolute left-1.5 top-1.5 rounded-md bg-[#75ACE8] px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {cf.imgPrimary}
                </span>
              )}
              <span className="absolute right-1.5 top-1.5 cursor-grab rounded-md bg-black/40 p-1 text-white opacity-0 transition group-hover:opacity-100">
                <GripVertical size={13} />
              </span>
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
                <button type="button" onClick={() => onChange(images, url)} title={cf.imgSetPrimary} className="rounded-md bg-white/90 p-1 text-[#1a1d21] hover:bg-white">
                  <Star size={13} className={isPrimary ? 'fill-amber-400 text-amber-400' : ''} />
                </button>
                <button type="button" onClick={() => remove(url)} className="rounded-md bg-white/90 p-1 text-red-600 hover:bg-white">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}

        {!atLimit && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#d8dbe0] text-[#9aa0a8] transition hover:border-[#75ACE8] hover:text-[#75ACE8] disabled:opacity-60"
          >
            {busy ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
            <span className="text-xs font-medium">{busy ? cf.imgUploading : cf.imgAdd}</span>
          </button>
        )}
      </div>

      {atLimit && <p className="mt-3 text-xs font-medium text-amber-600">{cf.imgLimit} ({maxImages})</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </section>
  );
}
