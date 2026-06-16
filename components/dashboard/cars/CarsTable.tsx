'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import * as Checkbox from '@radix-ui/react-checkbox';
import { toast } from 'sonner';
import {
  Plus, Search, Pencil, Trash2, Star, Eye, EyeOff, Check, Tag, SlidersHorizontal,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Car as CarIcon,
} from 'lucide-react';
import type { DashCar, DashCarWithContent } from '@/lib/dashboard/cars';
import { useDash } from '../DashboardI18n';
import Confirm from '../ui/Confirm';
import { PriceEditDialog, BulkPriceDialog } from './PriceDialogs';
import {
  toggleAvailable, toggleFeatured, deleteCar,
  bulkSetAvailable, bulkSetFeatured, bulkDelete,
} from '@/app/dashboard/cars/actions';

const PAGE_SIZE = 10;
type SortKey = 'brand' | 'year' | 'price' | 'status';

const STATUS_STYLES: Record<string, string> = {
  available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  sold: 'bg-red-50 text-red-700 border-red-200',
  reserved: 'bg-amber-50 text-amber-700 border-amber-200',
};
const LISTING_STYLES: Record<string, string> = {
  sale: 'bg-violet-50 text-violet-700 border-violet-200',
  rent: 'bg-sky-50 text-sky-700 border-sky-200',
  both: 'bg-[#75ACE8]/10 text-[#3d7cc0] border-[#75ACE8]/30',
};

function priceOf(c: DashCar) {
  return c.price_total ?? c.price_daily ?? c.price_monthly ?? 0;
}
export default function CarsTable({ cars, showTypeFilter }: { cars: DashCarWithContent[]; showTypeFilter: boolean }) {
  const { t, el } = useDash();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'sold' | 'reserved'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'rent'>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'brand', dir: 'asc' });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let rows = cars;
    if (statusFilter !== 'all') rows = rows.filter((c) => (c.status ?? 'available') === statusFilter);
    if (typeFilter === 'sale') rows = rows.filter((c) => c.listing_type === 'sale' || c.listing_type === 'both');
    else if (typeFilter === 'rent') rows = rows.filter((c) => c.listing_type === 'rent' || c.listing_type === 'both');
    const q = query.trim().toLowerCase();
    if (q) rows = rows.filter((c) => `${c.brand} ${c.model} ${c.year}`.toLowerCase().includes(q));
    const dir = sort.dir === 'asc' ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      switch (sort.key) {
        case 'year': return (a.year - b.year) * dir;
        case 'price': return (priceOf(a) - priceOf(b)) * dir;
        case 'status': return (a.status ?? '').localeCompare(b.status ?? '') * dir;
        default: return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`) * dir;
      }
    });
    return rows;
  }, [cars, statusFilter, typeFilter, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((c) => selected.has(c.id));
  const toggleSelectAll = () => {
    const next = new Set(selected);
    if (allOnPageSelected) pageRows.forEach((c) => next.delete(c.id));
    else pageRows.forEach((c) => next.add(c.id));
    setSelected(next);
  };
  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };
  const clearSel = () => setSelected(new Set());
  const refresh = () => router.refresh();

  const run = (label: string, fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      const res = await fn();
      if (res.ok) { if (label) toast.success(label); refresh(); }
      else toast.error(res.error ?? 'Action failed');
    });

  const ids = [...selected];
  const setSort2 = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.inventoryTitle}</h1>
          <p className="mt-1 text-sm text-[#8a9099]">{t.inventorySubtitle}</p>
        </div>
        <Link
          href="/dashboard/cars/new"
          className="flex items-center gap-2 rounded-xl bg-[#75ACE8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#75ACE8]/25 transition hover:bg-[#5f9ad9]"
        >
          <Plus size={16} /> {t.addCar}
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#b3b8bf] ltr:left-3 rtl:right-3" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            placeholder={t.search}
            className="w-full rounded-xl border border-[#e7e8ea] bg-white py-2.5 text-sm outline-none focus:border-[#75ACE8] focus:ring-4 focus:ring-[#75ACE8]/15 ltr:pl-9 ltr:pr-3 rtl:pr-9 rtl:pl-3"
          />
        </div>
        {/* Type filter (All / For Sale / For Rent) — only for sale+rental tenants */}
        {showTypeFilter && (
        <div className="flex gap-1 rounded-xl bg-[#f0f1f3] p-1">
          {(['all', 'sale', 'rent'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => { setTypeFilter(tf); setPage(0); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                typeFilter === tf ? 'bg-white text-[#1a1d21] shadow-sm' : 'text-[#8a9099] hover:text-[#1a1d21]'
              }`}
            >
              {tf === 'all' ? t.allTypes : tf === 'sale' ? t.forSale : t.forRent}
            </button>
          ))}
        </div>
        )}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(0); }}
          className="rounded-xl border border-[#e7e8ea] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#75ACE8]"
        >
          <option value="all">{t.allStatuses}</option>
          <option value="available">{el('status', 'available')}</option>
          <option value="sold">{el('status', 'sold')}</option>
          <option value="reserved">{el('status', 'reserved')}</option>
        </select>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#75ACE8]/30 bg-[#75ACE8]/8 px-4 py-2.5 text-sm">
          <span className="font-semibold text-[#3d7cc0]">{selected.size} {t.selected}</span>
          <div className="ms-auto flex flex-wrap items-center gap-2">
            <BulkBtn onClick={() => run(t.show, () => bulkSetAvailable({ ids, value: true }))} disabled={pending}><Eye size={14} /> {t.show}</BulkBtn>
            <BulkBtn onClick={() => run(t.hide, () => bulkSetAvailable({ ids, value: false }))} disabled={pending}><EyeOff size={14} /> {t.hide}</BulkBtn>
            <BulkBtn onClick={() => run(t.feature, () => bulkSetFeatured({ ids, value: true }))} disabled={pending}><Star size={14} /> {t.feature}</BulkBtn>
            <BulkBtn onClick={() => run(t.unfeature, () => bulkSetFeatured({ ids, value: false }))} disabled={pending}><Star size={14} /> {t.unfeature}</BulkBtn>
            <BulkPriceDialog
              ids={ids}
              onSuccess={() => { clearSel(); refresh(); }}
              trigger={<button className="flex items-center gap-1.5 rounded-lg border border-[#e7e8ea] bg-white px-3 py-1.5 text-xs font-semibold text-[#6b7178] transition hover:border-[#75ACE8]/40 hover:text-[#1a1d21]"><SlidersHorizontal size={14} /> {t.adjustPrice}</button>}
            />
            <Confirm
              trigger={<button className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"><Trash2 size={14} /> {t.del}</button>}
              title={t.deleteManyTitle}
              description={`${selected.size} ${t.vehicles}. ${t.cannotUndo}`}
              confirmLabel={t.del}
              cancelLabel={t.cancel}
              destructive
              onConfirm={() => run(t.del, async () => { const r = await bulkDelete({ ids }); if (r.ok) clearSel(); return r; })}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#ececec] bg-white">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <CarIcon size={32} className="text-[#cbd0d6]" />
            <p className="font-semibold">{t.noCars}</p>
            <p className="text-sm text-[#8a9099]">{t.noCarsHint}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#ececec] text-[#9aa0a8]">
                <th className="w-10 px-4 py-3"><Cb checked={allOnPageSelected} onChange={toggleSelectAll} /></th>
                <Th onClick={() => setSort2('brand')} sort={sort} k="brand">{t.colVehicle}</Th>
                <th className="px-4 py-3 text-start font-semibold">{t.colListing}</th>
                <Th onClick={() => setSort2('status')} sort={sort} k="status">{t.colStatus}</Th>
                <Th onClick={() => setSort2('price')} sort={sort} k="price">{t.colPrice}</Th>
                <th className="px-4 py-3 text-start font-semibold">{t.colFeatured}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.colVisible}</th>
                <th className="px-4 py-3 text-end font-semibold">{t.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((c) => {
                const status = c.status ?? 'available';
                return (
                  <tr key={c.id} className="border-b border-[#f3f3f3] last:border-0 hover:bg-[#fafbfc]">
                    <td className="px-4 py-3"><Cb checked={selected.has(c.id)} onChange={() => toggleRow(c.id)} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-[#f0f1f3]">
                          <ImageWithFallback src={c.thumbnail ?? ''} alt="" fill sizes="64px" className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold capitalize">{c.brand} {c.model}</div>
                          <div className="text-xs text-[#9aa0a8]">{c.year}{c.trim ? ` · ${c.trim}` : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${LISTING_STYLES[c.listing_type] ?? 'border-[#e7e8ea] bg-[#f7f7f7] text-[#6b7178]'}`}>{el('listing_type', c.listing_type)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] ?? 'border-[#e7e8ea] bg-[#f7f7f7] text-[#6b7178]'}`}>{el('status', status)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">{priceOf(c) ? `${c.currency} ${priceOf(c).toLocaleString()}` : '—'}</span>
                        <PriceEditDialog car={c} onSuccess={refresh} trigger={<button title={t.editPrice} className="rounded-md p-1 text-[#b3b8bf] transition hover:bg-[#f0f1f3] hover:text-[#75ACE8]"><Tag size={13} /></button>} />
                      </div>
                    </td>
                    <td className="px-4 py-3"><IconToggle active={!!c.is_featured} onClick={() => run('', async () => toggleFeatured({ id: c.id, value: !c.is_featured }))} on={<Star size={16} className="fill-amber-400 text-amber-400" />} off={<Star size={16} className="text-[#cbd0d6]" />} /></td>
                    <td className="px-4 py-3"><IconToggle active={!!c.available} onClick={() => run('', async () => toggleAvailable({ id: c.id, value: !c.available }))} on={<Eye size={16} className="text-emerald-500" />} off={<EyeOff size={16} className="text-[#cbd0d6]" />} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/cars/${c.id}/edit`} className="rounded-lg p-2 text-[#6b7178] transition hover:bg-[#f0f1f3] hover:text-[#1a1d21]"><Pencil size={15} /></Link>
                        <Confirm
                          trigger={<button className="rounded-lg p-2 text-[#6b7178] transition hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>}
                          title={t.deleteOneTitle}
                          description={`${c.brand} ${c.model}. ${t.cannotUndo}`}
                          confirmLabel={t.del}
                          cancelLabel={t.cancel}
                          destructive
                          onConfirm={() => run(t.del, async () => deleteCar({ id: c.id }))}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm text-[#6b7178]">
          <span>{filtered.length} {t.vehicles}</span>
          <div className="flex items-center gap-1">
            <button disabled={safePage === 0} onClick={() => setPage(safePage - 1)} className="rounded-lg border border-[#e7e8ea] p-2 disabled:opacity-40"><ChevronLeft size={16} className="rtl:rotate-180" /></button>
            <span className="px-2">{safePage + 1} / {pageCount}</span>
            <button disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)} className="rounded-lg border border-[#e7e8ea] p-2 disabled:opacity-40"><ChevronRight size={16} className="rtl:rotate-180" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children, onClick, sort, k }: { children: React.ReactNode; onClick: () => void; sort: { key: string; dir: string }; k: string }) {
  const active = sort.key === k;
  return (
    <th className="px-4 py-3 text-start font-semibold">
      <button onClick={onClick} className="inline-flex items-center gap-1 hover:text-[#1a1d21]">
        {children}
        {active && (sort.dir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
      </button>
    </th>
  );
}
function Cb({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <Checkbox.Root checked={checked} onCheckedChange={onChange} className="flex h-[18px] w-[18px] items-center justify-center rounded-[6px] border border-[#cbd0d6] bg-white data-[state=checked]:border-[#75ACE8] data-[state=checked]:bg-[#75ACE8]">
      <Checkbox.Indicator><Check size={13} className="text-white" /></Checkbox.Indicator>
    </Checkbox.Root>
  );
}
function IconToggle({ active, onClick, on, off }: { active: boolean; onClick: () => void; on: React.ReactNode; off: React.ReactNode }) {
  return <button onClick={onClick} className="rounded-lg p-1.5 transition hover:bg-[#f0f1f3]" aria-pressed={active}>{active ? on : off}</button>;
}
function BulkBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button onClick={onClick} disabled={disabled} className="flex items-center gap-1.5 rounded-lg border border-[#e7e8ea] bg-white px-3 py-1.5 text-xs font-semibold text-[#6b7178] transition hover:border-[#75ACE8]/40 hover:text-[#1a1d21] disabled:opacity-50">{children}</button>;
}
