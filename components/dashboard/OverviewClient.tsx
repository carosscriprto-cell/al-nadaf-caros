'use client';

import Link from 'next/link';
import {
  Car, Eye, EyeOff, Star, ArrowRight, Inbox, Tag, Clock, CheckCircle2, ShoppingBag,
  Crown, AlertTriangle,
} from 'lucide-react';
import { useDash } from './DashboardI18n';
import type { CarStats, TenantPlan } from '@/lib/dashboard/cars';

type LeadStats = { total: number; new: number; contacted: number; closed: number; handled: number };

const PLAN_BADGE: Record<string, string> = {
  starter: 'bg-[#f0f1f3] text-[#6b7178]',
  pro: 'bg-[#75ACE8]/12 text-[#3d7cc0]',
  enterprise: 'bg-violet-100 text-violet-700',
};
type RecentLead = {
  id: string;
  name: string | null;
  phone: string | null;
  type: string;
  status: string | null;
  created_at: string;
  car: { brand: string; model: string; year: number } | null;
};

export default function OverviewClient({
  cars,
  leads,
  plan,
  maxCars,
  recentLeads,
}: {
  cars: CarStats;
  leads: LeadStats;
  plan: TenantPlan;
  maxCars: number;
  recentLeads: RecentLead[];
}) {
  const { t, el, lang } = useDash();
  const ov = t.ov;

  // Plan & car-limit usage (display only — enforcement lives in P5a actions).
  const planName = ov.plans[plan] ?? plan;
  const limited = maxCars >= 0;
  const used = cars.total;
  const ratio = limited && maxCars > 0 ? used / maxCars : 0;
  const atLimit = limited && used >= maxCars;
  const nearLimit = limited && !atLimit && ratio >= 0.8;
  const pct = Math.min(100, Math.round(ratio * 100));
  const barColor = atLimit ? '#ef5350' : nearLimit ? '#f5a623' : '#75ACE8';

  const dateFmt = new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en', {
    day: 'numeric', month: 'short',
  });

  const carCards = [
    { label: t.totalCars, value: cars.total, icon: Car, tint: '#75ACE8' },
    { label: el('status', 'available'), value: cars.available, icon: Eye, tint: '#34c98a' },
    { label: el('status', 'sold'), value: cars.sold, icon: ShoppingBag, tint: '#ef5350' },
    { label: t.hidden, value: cars.hidden, icon: EyeOff, tint: '#9aa0a8' },
    { label: t.featured, value: cars.featured, icon: Star, tint: '#f5a623' },
  ];

  const leadCards = [
    { label: ov.newLeads, value: leads.new, icon: Inbox, tint: '#75ACE8' },
    { label: ov.handled, value: leads.handled, icon: CheckCircle2, tint: '#34c98a' },
    { label: ov.totalLeads, value: leads.total, icon: Tag, tint: '#9aa0a8' },
  ];

  const statusStyles: Record<string, string> = {
    new: 'bg-[#75ACE8]/12 text-[#3d7cc0]',
    contacted: 'bg-amber-50 text-amber-700',
    closed: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.welcome}</h1>
          <p className="mt-1 text-sm text-[#8a9099]">{ov.subtitle}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${PLAN_BADGE[plan] ?? PLAN_BADGE.starter}`}>
          <Crown size={13} /> {ov.plan}: {planName}
        </span>
      </div>

      {/* Plan & usage */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-[#6b7178]">{ov.planHeading}</h2>
        <div className="rounded-2xl border border-[#ececec] bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-[#3a3f45]">{ov.vehiclesUsed}</span>
            <span className="text-sm font-bold tracking-tight" dir="ltr">
              {used} / {limited ? maxCars : ov.unlimited}
            </span>
          </div>
          {limited && maxCars > 0 && (
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#f0f1f3]">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
            </div>
          )}
        </div>

        {(nearLimit || atLimit) && (
          <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${
              atLimit ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}
          >
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold">{atLimit ? ov.limitReachedTitle : ov.nearLimitTitle}</p>
              <p className="text-xs">{atLimit ? ov.limitReachedText : ov.nearLimitText}</p>
            </div>
          </div>
        )}
      </section>

      {/* Inventory stats */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#6b7178]">{ov.inventoryHeading}</h2>
          <Link href="/dashboard/cars" className="inline-flex items-center gap-1 text-xs font-semibold text-[#3d7cc0] hover:underline">
            {t.inventory} <ArrowRight size={13} className="rtl:rotate-180" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {carCards.map((c) => <StatCard key={c.label} {...c} />)}
        </div>
      </section>

      {/* Leads stats */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#6b7178]">{ov.leadsHeading}</h2>
          <Link href="/dashboard/leads" className="inline-flex items-center gap-1 text-xs font-semibold text-[#3d7cc0] hover:underline">
            {t.leads} <ArrowRight size={13} className="rtl:rotate-180" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {leadCards.map((c) => <StatCard key={c.label} {...c} />)}
        </div>
      </section>

      {/* Recent activity */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-[#6b7178]">{ov.recentHeading}</h2>
        <div className="overflow-hidden rounded-2xl border border-[#ececec] bg-white">
          {recentLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
              <Inbox size={28} className="text-[#cbd0d6]" />
              <p className="text-sm text-[#8a9099]">{ov.noRecent}</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#f3f3f3]">
              {recentLeads.map((l) => (
                <li key={l.id}>
                  <Link href="/dashboard/leads" className="flex items-center gap-3 px-4 py-3 transition hover:bg-[#fafbfc]">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#75ACE8]/12 text-[#3d7cc0]">
                      <Inbox size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {l.name?.trim() || ov.anonLead}
                        <span className="ms-2 align-middle text-xs font-normal text-[#9aa0a8]">{el('lead_type', l.type ?? 'inquiry')}</span>
                      </p>
                      <p className="truncate text-xs text-[#9aa0a8]">
                        {l.car ? `${l.car.brand} ${l.car.model} ${l.car.year}` : (l.phone || ov.generalInquiry)}
                      </p>
                    </div>
                    <span className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold sm:inline ${statusStyles[l.status ?? 'new'] ?? 'bg-[#f0f1f3] text-[#6b7178]'}`}>
                      {el('lead_status', l.status ?? 'new')}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-[11px] text-[#b3b8bf]">
                      <Clock size={11} /> {dateFmt.format(new Date(l.created_at))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/cars" className="inline-flex items-center gap-2 rounded-xl bg-[#75ACE8] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#75ACE8]/25 transition hover:bg-[#5f9ad9]">
          {t.inventory} <ArrowRight size={16} className="rtl:rotate-180" />
        </Link>
        <Link href="/dashboard/leads" className="inline-flex items-center gap-2 rounded-xl border border-[#e7e8ea] bg-white px-5 py-3 text-sm font-semibold text-[#6b7178] transition hover:border-[#75ACE8]/40 hover:text-[#1a1d21]">
          {t.leads} <ArrowRight size={16} className="rtl:rotate-180" />
        </Link>
        <Link href="/dashboard/settings" className="inline-flex items-center gap-2 rounded-xl border border-[#e7e8ea] bg-white px-5 py-3 text-sm font-semibold text-[#6b7178] transition hover:border-[#75ACE8]/40 hover:text-[#1a1d21]">
          {t.settings} <ArrowRight size={16} className="rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tint }: { label: string; value: number; icon: React.ComponentType<{ size?: number }>; tint: string }) {
  return (
    <div className="rounded-2xl border border-[#ececec] bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${tint}1a`, color: tint }}>
        <Icon size={18} />
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-[#8a9099]">{label}</p>
    </div>
  );
}
