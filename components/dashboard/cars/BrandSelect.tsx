'use client';

// Searchable brand picker sourced from car_brands (E1) — replaces the old
// free-text brand input, so dealers can no longer create "toyota/toyouta"
// variants. Owner/admin may add a missing brand inline (RLS enforces the role
// server-side; a non-owner's insert is rejected and surfaced as an error).

import { useMemo, useState } from 'react';
import { Check, ChevronDown, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { CarBrand } from '@/lib/supabase/brands.server';
import { brandLogoUrl, brandInitials } from '@/lib/tenant/brandLogo';
import { createBrand } from '@/app/(system)/dashboard/cars/actions';

const base =
  'w-full rounded-xl border bg-[#F7F7F7] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#75ACE8] focus:bg-white focus:ring-4 focus:ring-[#75ACE8]/15';

export type BrandSelectLabels = {
  label: string;
  placeholder: string;
  search: string;
  add: string; // "Add" verb; the typed name is appended in the button
  adding: string;
  empty: string;
};

// Tiny logo/initials chip shown next to each brand row + the trigger.
function BrandMark({ brand }: { brand: CarBrand }) {
  const [errored, setErrored] = useState(false);
  const src = brandLogoUrl(brand.slug, brand.logo_url);
  if (!src || errored) {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold text-[#75ACE8]">
        {brandInitials(brand.name_en)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setErrored(true)}
      className="h-5 w-5 shrink-0 object-contain"
    />
  );
}

export default function BrandSelect({
  brands: initialBrands,
  value,
  onChange,
  lang,
  err,
  labels,
}: {
  brands: CarBrand[];
  value: string; // selected slug
  onChange: (slug: string, nameEn: string) => void;
  lang: 'en' | 'ar';
  err?: string;
  labels: BrandSelectLabels;
}) {
  const [brands, setBrands] = useState(initialBrands);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);

  const selected = brands.find((b) => b.slug === value);
  const name = (b: CarBrand) => (lang === 'ar' ? b.name_ar : b.name_en);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter(
      (b) =>
        b.slug.includes(q) ||
        b.name_en.toLowerCase().includes(q) ||
        b.name_ar.includes(query.trim()),
    );
  }, [brands, query]);

  const exact = brands.some((b) => b.name_en.toLowerCase() === query.trim().toLowerCase());
  const canAdd = query.trim().length > 0 && !exact;

  const pick = (b: CarBrand) => {
    onChange(b.slug, b.name_en);
    setQuery('');
    setOpen(false);
  };

  const add = async () => {
    if (adding) return;
    setAdding(true);
    const res = await createBrand({ name_en: query.trim() });
    setAdding(false);
    if (!res.ok || !res.brand) {
      toast.error(res.ok ? 'Could not add brand' : res.error);
      return;
    }
    const b = res.brand;
    setBrands((p) =>
      p.some((x) => x.slug === b.slug)
        ? p
        : [...p, b].sort((a, c) => a.name_en.localeCompare(c.name_en)),
    );
    pick(b);
  };

  return (
    <label className="relative block">
      <span className="mb-1 block text-xs font-medium text-[#6b7178]">
        {labels.label} {err && <span className="text-red-500">· {err}</span>}
      </span>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${base} flex items-center justify-between gap-2 ${err ? 'border-red-300' : 'border-[#e7e8ea]'}`}
      >
        <span className="flex items-center gap-2 truncate">
          {selected ? (
            <>
              <BrandMark brand={selected} />
              <span className="truncate">{name(selected)}</span>
            </>
          ) : (
            <span className="text-[#b3b8bf]">{labels.placeholder}</span>
          )}
        </span>
        <ChevronDown size={16} className="shrink-0 text-[#9aa0a8]" />
      </button>

      {open && (
        <>
          {/* click-away */}
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-[#e7e8ea] bg-white p-1.5 shadow-xl">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={labels.search}
              className="mb-1 w-full rounded-lg border border-[#e7e8ea] bg-[#F7F7F7] px-3 py-2 text-sm outline-none focus:border-[#75ACE8] focus:bg-white"
            />

            {filtered.map((b) => (
              <button
                key={b.slug}
                type="button"
                onClick={() => pick(b)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-start text-sm hover:bg-[#f0f1f3]"
              >
                <BrandMark brand={b} />
                <span className="flex-1 truncate">{name(b)}</span>
                {b.slug === value && <Check size={15} className="text-[#75ACE8]" />}
              </button>
            ))}

            {filtered.length === 0 && !canAdd && (
              <p className="px-2.5 py-3 text-center text-xs text-[#9aa0a8]">{labels.empty}</p>
            )}

            {canAdd && (
              <button
                type="button"
                onClick={add}
                disabled={adding}
                className="mt-1 flex w-full items-center gap-2 rounded-lg border border-dashed border-[#75ACE8]/40 px-2.5 py-2 text-start text-sm font-medium text-[#75ACE8] hover:bg-[#75ACE8]/5 disabled:opacity-60"
              >
                {adding ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                {adding ? labels.adding : `${labels.add} “${query.trim()}”`}
              </button>
            )}
          </div>
        </>
      )}
    </label>
  );
}
