'use client';

// components/dashboard/leads/LeadDetailModal.tsx — full lead details popup.
// UI only: reads a lead already fetched by the table and surfaces every field,
// plus quick-action contact buttons (WhatsApp / Call / Email). Reuses the
// existing Radix Dialog primitive (same as LeadCaptureDialog) — no new deps —
// and the same wa.me link pattern (digits only; tel: keeps the leading +).
// Status updates flow through the table's existing setLeadStatus handler.

import { useMemo } from 'react';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X, Phone, Mail, Car as CarIcon, CalendarRange, MessageCircle, ExternalLink,
} from 'lucide-react';
import type { DashLead } from '@/lib/dashboard/leads';
import type { LeadStatus } from '@/lib/leads/schema';
import { useDash } from '../DashboardI18n';

const STATUSES: LeadStatus[] = ['new', 'contacted', 'closed'];
const STATUS_DOT: Record<string, string> = { new: 'bg-[#75ACE8]', contacted: 'bg-amber-400', closed: 'bg-emerald-400' };
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

export default function LeadDetailModal({
  lead,
  onClose,
  onSetStatus,
  pending,
}: {
  lead: DashLead | null;
  onClose: () => void;
  onSetStatus: (id: string, status: LeadStatus) => void;
  pending: boolean;
}) {
  const { t, el, lang, dir } = useDash();
  const ld = t.ld;

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }),
    [lang],
  );
  const dayFmt = useMemo(
    () => new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en', { day: 'numeric', month: 'short', year: 'numeric' }),
    [lang],
  );

  if (!lead) return null;

  const status = (lead.status ?? 'new') as string;
  const type = (lead.type ?? 'inquiry') as string;
  const name = lead.name?.trim() || ld.general;
  const carTitle = lead.car ? `${lead.car.brand} ${lead.car.model} ${lead.car.year}`.trim() : '';

  // wa.me wants digits only — strip non-digits regardless of format so legacy
  // (non-'+') numbers still work. tel: keeps the canonical '+963…' as-is.
  const waDigits = lead.phone ? lead.phone.replace(/[^0-9]/g, '') : '';
  const greeting = lead.name?.trim() ? `${ld.waGreeting} ${lead.name.trim()},` : `${ld.waGreeting},`;
  const waUrl = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(greeting)}`
    : '';

  const hasBooking = !!(lead.rental_start || lead.rental_end || lead.pickup_location);

  return (
    <Dialog.Root open={!!lead} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          dir={dir}
          className="fixed left-1/2 top-1/2 z-[61] max-h-[90vh] w-[94vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[#ececec] bg-white p-6 shadow-2xl focus:outline-none"
        >
          {/* Header */}
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Dialog.Title className="truncate text-lg font-bold text-[#1a1d21]">{name}</Dialog.Title>
              <Dialog.Description className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-[#8a9099]">
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${TYPE_STYLES[type] ?? 'border-[#e7e8ea] bg-[#f7f7f7] text-[#6b7178]'}`}>{el('lead_type', type)}</span>
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] ?? 'border-[#e7e8ea] bg-[#f7f7f7] text-[#6b7178]'}`}>{el('lead_status', status)}</span>
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label={ld.close}
              className="rounded-lg p-1.5 text-[#8a9099] transition hover:bg-[#f0f1f3] hover:text-[#1a1d21]"
            >
              <X size={18} />
            </Dialog.Close>
          </div>

          {/* Quick actions — only render when the field exists */}
          {(waUrl || lead.phone || lead.email) && (
            <div className="mb-5 flex flex-wrap gap-2">
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3.5 py-2 text-sm font-semibold text-white transition hover:brightness-105"
                >
                  <MessageCircle size={15} /> {ld.waBtn}
                </a>
              )}
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#e7e8ea] bg-white px-3.5 py-2 text-sm font-semibold text-[#3a3f45] transition hover:border-[#75ACE8]/40 hover:text-[#1a1d21]"
                >
                  <Phone size={15} /> {ld.callBtn}
                </a>
              )}
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#e7e8ea] bg-white px-3.5 py-2 text-sm font-semibold text-[#3a3f45] transition hover:border-[#75ACE8]/40 hover:text-[#1a1d21]"
                >
                  <Mail size={15} /> {ld.emailBtn}
                </a>
              )}
            </div>
          )}

          {/* Customer contact */}
          <Section title={ld.sectionCustomer}>
            {lead.phone || lead.email ? (
              <div className="space-y-1.5">
                {lead.phone && (
                  <Row icon={<Phone size={14} />}>
                    <span dir="ltr" className="font-medium">{lead.phone}</span>
                  </Row>
                )}
                {lead.email && (
                  <Row icon={<Mail size={14} />}>
                    <span dir="ltr" className="break-all">{lead.email}</span>
                  </Row>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#b3b8bf]">{ld.noContact}</p>
            )}
          </Section>

          {/* Vehicle */}
          {lead.car && (
            <Section title={ld.sectionVehicle}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <CarIcon size={15} className="shrink-0 text-[#cbd0d6]" />
                  <span className="truncate font-medium capitalize text-[#3a3f45]">{carTitle}</span>
                </div>
                <Link
                  href={`/dashboard/cars/${lead.car.id}/edit`}
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#3d7cc0] hover:underline"
                >
                  {ld.viewCar} <ExternalLink size={13} />
                </Link>
              </div>
            </Section>
          )}

          {/* Booking details */}
          {hasBooking && (
            <Section title={ld.sectionBooking}>
              {(lead.rental_start || lead.rental_end) && (
                <Row icon={<CalendarRange size={14} />}>
                  <span dir="ltr">
                    {lead.rental_start ? dayFmt.format(new Date(lead.rental_start)) : '—'} → {lead.rental_end ? dayFmt.format(new Date(lead.rental_end)) : '—'}
                  </span>
                </Row>
              )}
              {lead.pickup_location && (
                <Row>{lead.pickup_location}</Row>
              )}
            </Section>
          )}

          {/* Message */}
          <Section title={ld.sectionMessage}>
            {lead.message?.trim() ? (
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#3a3f45]">{lead.message}</p>
            ) : (
              <p className="text-sm text-[#b3b8bf]">{ld.noMessage}</p>
            )}
          </Section>

          {/* Meta */}
          <Section title={ld.sectionMeta}>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <Meta label={ld.fReceived} value={dateFmt.format(new Date(lead.created_at))} />
              {lead.source && <Meta label={ld.fSource} value={lead.source} />}
              {lead.locale && <Meta label={ld.fLocale} value={ld.langName[lead.locale] ?? lead.locale} />}
            </dl>
          </Section>

          {/* Status control — reuses the table's setLeadStatus handler */}
          <div className="mt-5 border-t border-[#f0f1f3] pt-4">
            <p className="mb-2 text-xs font-semibold text-[#8a9099]">{ld.changeStatus}</p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => {
                const active = s === status;
                return (
                  <button
                    key={s}
                    disabled={pending || active}
                    onClick={() => onSetStatus(lead.id, s)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                      active ? STATUS_STYLES[s] : 'border-[#e7e8ea] bg-white text-[#6b7178] hover:border-[#75ACE8]/40 hover:text-[#1a1d21]'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${STATUS_DOT[s]}`} />
                    {el('lead_status', s)}
                  </button>
                );
              })}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#9aa0a8]">{title}</p>
      {children}
    </div>
  );
}

function Row({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#3a3f45]">
      {icon && <span className="shrink-0 text-[#b3b8bf]">{icon}</span>}
      {children}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-[#9aa0a8]">{label}</dt>
      <dd className="font-medium text-[#3a3f45]">{value}</dd>
    </div>
  );
}
