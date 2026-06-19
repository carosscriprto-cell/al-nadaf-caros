'use client';

import Link from 'next/link';
import { Car, Eye, EyeOff, Star, ArrowRight, Inbox } from 'lucide-react';
import { useDash } from './DashboardI18n';

type Stats = { total: number; available: number; hidden: number; featured: number };

export default function OverviewClient({ stats, newLeads = 0 }: { stats: Stats; newLeads?: number }) {
  const { t } = useDash();

  const cards = [
    { label: t.totalCars, value: stats.total, icon: Car, tint: '#75ACE8' },
    { label: t.available, value: stats.available, icon: Eye, tint: '#34c98a' },
    { label: t.hidden, value: stats.hidden, icon: EyeOff, tint: '#9aa0a8' },
    { label: t.featured, value: stats.featured, icon: Star, tint: '#f5a623' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.welcome}</h1>
        <p className="mt-1 text-sm text-[#8a9099]">{t.overviewHint}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="rounded-2xl border border-[#ececec] bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)]"
            >
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${c.tint}1a`, color: c.tint }}
              >
                <Icon size={18} />
              </div>
              <p className="text-3xl font-bold tracking-tight">{c.value}</p>
              <p className="mt-0.5 text-xs font-medium text-[#8a9099]">{c.label}</p>
            </div>
          );
        })}
      </div>

      {newLeads > 0 && (
        <Link
          href="/dashboard/leads"
          className="flex items-center gap-3 rounded-2xl border border-[#75ACE8]/30 bg-[#75ACE8]/8 px-5 py-4 transition hover:bg-[#75ACE8]/12"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#75ACE8] text-white">
            <Inbox size={18} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-[#1a1d21]">
              {newLeads} {t.newLeads}
            </span>
            <span className="block text-xs text-[#6b7178]">{t.overviewLeadsHint}</span>
          </span>
          <ArrowRight size={16} className="ms-auto text-[#3d7cc0] rtl:rotate-180" />
        </Link>
      )}

      <Link
        href="/dashboard/cars"
        className="inline-flex items-center gap-2 rounded-xl bg-[#75ACE8] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#75ACE8]/25 transition hover:bg-[#5f9ad9]"
      >
        {t.inventory}
        <ArrowRight size={16} className="rtl:rotate-180" />
      </Link>
    </div>
  );
}
