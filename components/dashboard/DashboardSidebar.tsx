'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, LayoutDashboard, Inbox, Settings, LayoutTemplate } from 'lucide-react';
import type { Tables } from '@/lib/supabase/database.types';
import { useDash } from './DashboardI18n';

type Props = {
  tenant: Tables<'tenants'>;
  userRole: 'owner' | 'admin' | 'editor';
};

export default function DashboardSidebar({ tenant }: Props) {
  const pathname = usePathname();
  const { t, lang } = useDash();

  const nav = [
    { href: '/dashboard', icon: LayoutDashboard, label: t.overview, exact: true },
    { href: '/dashboard/cars', icon: Car, label: t.inventory, exact: false },
    { href: '/dashboard/leads', icon: Inbox, label: t.leads, exact: false },
    { href: '/dashboard/site', icon: LayoutTemplate, label: t.site, exact: false },
    { href: '/dashboard/settings', icon: Settings, label: t.settings, exact: false },
  ];

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const brandName = lang === 'ar' ? tenant.name_ar || tenant.name : tenant.name;

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-[#ececec] bg-white ltr:border-r rtl:border-l lg:flex">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: tenant.color_accent || '#75ACE8' }}
        >
          {brandName?.charAt(0)?.toUpperCase() ?? 'C'}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight">{brandName}</p>
          <p className="text-[11px] text-[#9aa0a8]">{t.dashboard}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? 'bg-[#75ACE8]/12 text-[#3d7cc0]'
                  : 'text-[#6b7178] hover:bg-[#f0f1f3] hover:text-[#1a1d21]'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
