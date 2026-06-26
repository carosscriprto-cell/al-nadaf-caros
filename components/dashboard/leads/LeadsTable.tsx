'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { toast } from 'sonner';
import {
  Search, Check, Inbox, Phone, Mail, Car as CarIcon, CalendarRange,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronDown as Caret,
} from 'lucide-react';
import type { DashLead } from '@/lib/dashboard/leads';
import type { LeadStatus } from '@/lib/leads/schema';
import { useDash } from '../DashboardI18n';
import { setLeadStatus, bulkSetLeadStatus } from '@/app/(system)/dashboard/leads/actions';

const PAGE_SIZE = 12;
type SortKey = 'date' | 'status';
type LeadTypeKey = 'availability' | 'viewing' | 'purchase' | 'booking' | 'inquiry';
type TypeFilter = 'all' | LeadTypeKey;
type StatusFilter = 'all' | LeadStatus;

// All current lead types (P2.5-2 added availability/viewing) in filter order.
const LEAD_TYPES: LeadTypeKey[] = ['availability', 'viewing', 'purchase', 'booking', 'inquiry'];

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-[#75ACE8]/12 text-[#3d7cc0] border-[#75ACE8]/30',
  contacted: 'bg-amber-50 text-amber-700 border-amber-200',
  closed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};
const TYPE_STYLES: Record<string, string> = {
  inquiry: 'bg-slate-50 text-slate-600 border-slate-200',
  booking: 'bg-violet-50 text-violet-700 border-violet-200',
  purchase: 'bg-rose-50 text-rose-700 border-rose-200',
  availability: 'bg-sky-50 text-sky-700 border-sky-200',
  viewing: 'bg-amber-50 text-amber-700 border-amber-200',
};
const STATUS_ORDER: Record<string, number> = { new: 0, contacted: 1, closed: 2 };
const STATUSES: LeadStatus[] = ['new', 'contacted', 'closed'];

type Stats = { total: number; new: number; contacted: number; closed: number; handled: number };

export default function LeadsTable({ leads, stats }: { leads: DashLead[]; stats: Stats }) {
  const { t, el, lang } = useDash();
  const ld = t.ld;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'date', dir: 'desc' });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en', { day: 'numeric', month: 'short', year: 'numeric' }),
    [lang],
  );

  const filtered = useMemo(() => {
    let rows = leads;
    if (typeFilter !== 'all') rows = rows.filter((l) => (l.type ?? 'inquiry') === typeFilter);
    if (statusFilter !== 'all') rows = rows.filter((l) => (l.status ?? 'new') === statusFilter);
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter((l) => {
        const car = l.car ? `${l.car.brand} ${l.car.model} ${l.car.year}` : '';
        return `${l.name ?? ''} ${l.phone ?? ''} ${l.email ?? ''} ${l.message ?? ''} ${car}`.toLowerCase().includes(q);
      });
    }
    const dir = sort.dir === 'asc' ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      if (sort.key === 'status') {
        return ((STATUS_ORDER[a.status ?? 'new'] ?? 0) - (STATUS_ORDER[b.status ?? 'new'] ?? 0)) * dir;
      }
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
    });
    return rows;
  }, [leads, typeFilter, statusFilter, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((l) => selected.has(l.id));
  const toggleSelectAll = () => {
    const next = new Set(selected);
    if (allOnPageSelected) pageRows.forEach((l) => next.delete(l.id));
    else pageRows.forEach((l) => next.add(l.id));
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

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      const res = await fn();
      if (res.ok) { toast.success(ld.changeStatus); refresh(); }
      else toast.error(res.error ?? 'Action failed');
    });

  const ids = [...selected];
  const setSort2 = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));

  const cards = [
    { label: ld.new, value: stats.new, tint: '#75ACE8' },
    { label: ld.contacted, value: stats.contacted, tint: '#f5a623' },
    { label: ld.closed, value: stats.closed, tint: '#34c98a' },
    { label: ld.total, value: stats.total, tint: '#9aa0a8' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{ld.title}</h1>
        <p className="mt-1 text-sm text-[#8a9099]">{ld.subtitle}</p>
      </div>

      {/* Stats — new vs handled at a glance */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-[#ececec] bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
            <div className="mb-3 h-1.5 w-8 rounded-full" style={{ backgroundColor: c.tint }} />
            <p className="text-3xl font-bold tracking-tight">{c.value}</p>
            <p className="mt-0.5 text-xs font-medium text-[#8a9099]">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#b3b8bf] ltr:left-3 rtl:right-3" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            placeholder={ld.search}
            className="w-full rounded-xl border border-[#e7e8ea] bg-white py-2.5 text-sm outline-none focus:border-[#75ACE8] focus:ring-4 focus:ring-[#75ACE8]/15 ltr:pl-9 ltr:pr-3 rtl:pr-9 rtl:pl-3"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value as TypeFilter); setPage(0); }}
          className="rounded-xl border border-[#e7e8ea] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#75ACE8]"
        >
          <option value="all">{ld.allTypes}</option>
          {LEAD_TYPES.map((tf) => <option key={tf} value={tf}>{el('lead_type', tf)}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(0); }}
          className="rounded-xl border border-[#e7e8ea] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#75ACE8]"
        >
          <option value="all">{ld.allStatuses}</option>
          {STATUSES.map((s) => <option key={s} value={s}>{el('lead_status', s)}</option>)}
        </select>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#75ACE8]/30 bg-[#75ACE8]/8 px-4 py-2.5 text-sm">
          <span className="font-semibold text-[#3d7cc0]">{selected.size} {ld.selected}</span>
          <span className="text-[#8a9099]">·</span>
          <span className="text-[#6b7178]">{ld.changeStatus}:</span>
          <div className="ms-auto flex flex-wrap items-center gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                disabled={pending}
                onClick={() => run(async () => { const r = await bulkSetLeadStatus({ ids, status: s }); if (r.ok) clearSel(); return r; })}
                className="flex items-center gap-1.5 rounded-lg border border-[#e7e8ea] bg-white px-3 py-1.5 text-xs font-semibold text-[#6b7178] transition hover:border-[#75ACE8]/40 hover:text-[#1a1d21] disabled:opacity-50"
              >
                <span className={`h-2 w-2 rounded-full ${s === 'new' ? 'bg-[#75ACE8]' : s === 'contacted' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                {el('lead_status', s)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#ececec] bg-white">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <Inbox size={32} className="text-[#cbd0d6]" />
            <p className="font-semibold">{ld.noLeads}</p>
            <p className="text-sm text-[#8a9099]">{ld.noLeadsHint}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#ececec] text-[#9aa0a8]">
                <th className="w-10 px-4 py-3"><Cb checked={allOnPageSelected} onChange={toggleSelectAll} /></th>
                <th className="px-4 py-3 text-start font-semibold">{ld.colWho}</th>
                <th className="px-4 py-3 text-start font-semibold">{ld.colContact}</th>
                <th className="px-4 py-3 text-start font-semibold">{ld.colVehicle}</th>
                <th className="px-4 py-3 text-start font-semibold">{ld.colType}</th>
                <Th onClick={() => setSort2('date')} sort={sort} k="date">{ld.colDate}</Th>
                <Th onClick={() => setSort2('status')} sort={sort} k="status">{ld.colStatus}</Th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((l) => {
                const status = (l.status ?? 'new') as string;
                const type = (l.type ?? 'inquiry') as string;
                const hasRental = !!(l.rental_start || l.rental_end);
                return (
                  <tr key={l.id} className="border-b border-[#f3f3f3] last:border-0 hover:bg-[#fafbfc]">
                    <td className="px-4 py-3"><Cb checked={selected.has(l.id)} onChange={() => toggleRow(l.id)} /></td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <div className="font-semibold">{l.name?.trim() || <span className="text-[#9aa0a8] font-normal">{ld.general}</span>}</div>
                      {l.message?.trim() && (
                        <div className="truncate text-xs text-[#9aa0a8]" title={l.message}>{l.message}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {l.phone || l.email ? (
                        <div className="space-y-0.5">
                          {l.phone && <div className="flex items-center gap-1.5 text-[#6b7178]"><Phone size={12} className="shrink-0 text-[#b3b8bf]" /> <span dir="ltr">{l.phone}</span></div>}
                          {l.email && <div className="flex items-center gap-1.5 text-[#6b7178]"><Mail size={12} className="shrink-0 text-[#b3b8bf]" /> <span className="truncate" dir="ltr">{l.email}</span></div>}
                        </div>
                      ) : <span className="text-xs text-[#b3b8bf]">{ld.noContact}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {l.car ? (
                        <div className="flex items-center gap-2">
                          <CarIcon size={14} className="shrink-0 text-[#cbd0d6]" />
                          <div className="min-w-0">
                            <div className="truncate font-medium capitalize">{l.car.brand} {l.car.model}</div>
                            <div className="text-xs text-[#9aa0a8]">{l.car.year}</div>
                          </div>
                        </div>
                      ) : <span className="text-[#cbd0d6]">—</span>}
                      {hasRental && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-[#9aa0a8]">
                          <CalendarRange size={11} /> {fmtRange(l.rental_start, l.rental_end, dateFmt)}
                        </div>
                      )}
                      {l.pickup_location && (
                        <div className="mt-0.5 text-[11px] text-[#9aa0a8]">{l.pickup_location}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TYPE_STYLES[type] ?? 'border-[#e7e8ea] bg-[#f7f7f7] text-[#6b7178]'}`}>{el('lead_type', type)}</span>
                      {l.source && (
                        <div className="mt-1 text-[11px] text-[#b3b8bf]">{ld.via} {l.source}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#6b7178]">{dateFmt.format(new Date(l.created_at))}</td>
                    <td className="px-4 py-3">
                      <StatusMenu
                        current={status}
                        label={el('lead_status', status)}
                        statusLabel={(s) => el('lead_status', s)}
                        disabled={pending}
                        onSelect={(s) => { if (s !== status) run(async () => setLeadStatus({ id: l.id, status: s })); }}
                      />
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
          <span>{filtered.length} {ld.leads}</span>
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

function fmtRange(start: string | null, end: string | null, fmt: Intl.DateTimeFormat) {
  const s = start ? fmt.format(new Date(start)) : '—';
  const e = end ? fmt.format(new Date(end)) : '—';
  return `${s} → ${e}`;
}

function StatusMenu({
  current, label, statusLabel, disabled, onSelect,
}: {
  current: string;
  label: string;
  statusLabel: (s: string) => string;
  disabled: boolean;
  onSelect: (s: LeadStatus) => void;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        <button className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition disabled:opacity-50 ${STATUS_STYLES[current] ?? 'border-[#e7e8ea] bg-[#f7f7f7] text-[#6b7178]'}`}>
          {label}
          <Caret size={12} className="opacity-60" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[150px] rounded-xl border border-[#ececec] bg-white p-1 shadow-lg"
        >
          {STATUSES.map((s) => (
            <DropdownMenu.Item
              key={s}
              onSelect={() => onSelect(s)}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#3a3f45] outline-none data-[highlighted]:bg-[#f0f1f3]"
            >
              <span className={`h-2 w-2 rounded-full ${s === 'new' ? 'bg-[#75ACE8]' : s === 'contacted' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              {statusLabel(s)}
              {current === s && <Check size={14} className="ms-auto text-[#75ACE8]" />}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
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
