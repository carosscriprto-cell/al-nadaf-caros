'use client';

import Link from 'next/link';
import {
  Car, Eye, EyeOff, Star, ArrowRight, Inbox, Tag, Clock, CheckCircle2, ShoppingBag,
} from 'lucide-react';
import { useDash } from './DashboardI18n';
import type { CarStats } from '@/lib/dashboard/cars';

type LeadStats = { total: number; new: number; contacted: number; closed: number; handled: number };
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
  recentLeads,
}: {
  cars: CarStats;
  leads: LeadStats;
  recentLeads: RecentLead[];
}) {
  const { t, el, lang } = useDash();
  const ov = t.ov;

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.welcome}</h1>
        <p className="mt-1 text-sm text-[#8a9099]">{ov.subtitle}</p>
      </div>

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
