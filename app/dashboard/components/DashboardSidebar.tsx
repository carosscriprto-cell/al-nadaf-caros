'use client';

// components/dashboard/DashboardSidebar.tsx
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Car, LayoutDashboard, MessageSquare, Settings,
  ChevronLeft, ChevronRight, LogOut, Globe,
} from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database.types';

type Tenant   = Tables<'tenants'>;
type UserRole = 'owner' | 'admin' | 'editor';

// ─── Translations ─────────────────────────────────────────────
const labels = {
  en: {
    overview: 'Overview',
    inventory: 'Inventory',
    leads:    'Leads',
    settings: 'Settings',
    logout:   'Sign out',
  },
  ar: {
    overview: 'نظرة عامة',
    inventory: 'المخزون',
    leads:    'الطلبات',
    settings: 'الإعدادات',
    logout:   'تسجيل الخروج',
  },
};

type Props = {
  tenant:   Tenant;
  userRole: UserRole;
};

export default function DashboardSidebar({ tenant, userRole }: Props) {
  const pathname   = usePathname();
  const router     = useRouter();
  const supabase   = createBrowserClient();
  const [collapsed, setCollapsed] = useState(false);
  const [lang,      setLang]      = useState<'en' | 'ar'>('en');

  const t = labels[lang];

  const navItems = [
    { href: '/dashboard',          icon: <LayoutDashboard size={16} />, label: t.overview  },
    { href: '/dashboard/cars',     icon: <Car size={16} />,             label: t.inventory },
    { href: '/dashboard/leads',    icon: <MessageSquare size={16} />,   label: t.leads     },
    { href: '/dashboard/settings', icon: <Settings size={16} />,        label: t.settings,
      hidden: userRole === 'editor' },
  ].filter(item => !item.hidden);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href);

  return (
    <aside
      className={`
        ${collapsed ? 'w-16' : 'w-56'}
        flex-shrink-0 border-r border-white/[0.05]
        flex flex-col bg-[#0d0d1a]
        transition-all duration-300
      `}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-white/[0.05]">
        <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-600/20">
          <Car size={15} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate leading-none">
              {lang === 'ar' ? (tenant.name_ar || tenant.name) : tenant.name}
            </p>
            <p className="text-[10px] text-white/30 mt-0.5">Dashboard</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1
              text-sm font-medium transition-all
              ${isActive(item.href)
                ? 'bg-violet-600/20 text-violet-300'
                : 'text-white/40 hover:text-white hover:bg-white/[0.05]'}
            `}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-2 border-t border-white/[0.05] space-y-1">
        {/* Language toggle */}
        <button
          onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all"
        >
          <Globe size={15} className="flex-shrink-0" />
          {!collapsed && (
            <span className="text-xs">{lang === 'en' ? 'العربية' : 'English'}</span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
        >
          <LogOut size={15} className="flex-shrink-0" />
          {!collapsed && <span className="text-xs">{t.logout}</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center justify-center py-2 rounded-xl text-white/20 hover:text-white/40 hover:bg-white/[0.03] transition-all"
        >
          {collapsed
            ? <ChevronRight size={14} />
            : <ChevronLeft  size={14} />}
        </button>
      </div>
    </aside>
  );
}