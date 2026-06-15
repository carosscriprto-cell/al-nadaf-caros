'use client';

import { useRouter } from 'next/navigation';
import { Globe, LogOut, Car } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database.types';
import { useDash } from './DashboardI18n';

type Props = {
  tenant: Tables<'tenants'>;
  userEmail: string;
};

export default function DashboardTopbar({ tenant, userEmail }: Props) {
  const router = useRouter();
  const { t, toggle, lang } = useDash();
  const supabase = createBrowserClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const brandName = lang === 'ar' ? tenant.name_ar || tenant.name : tenant.name;

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[#ececec] bg-white px-5 lg:px-8">
      {/* Mobile brand (sidebar hidden < lg) */}
      <div className="flex items-center gap-2 lg:hidden">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
          style={{ backgroundColor: tenant.color_accent || '#75ACE8' }}
        >
          {brandName?.charAt(0)?.toUpperCase() ?? 'C'}
        </div>
        <Car size={16} className="text-[#9aa0a8]" />
      </div>

      <div className="ms-auto flex items-center gap-2">
        <button
          onClick={toggle}
          className="flex items-center gap-1.5 rounded-full border border-[#ececec] px-3 py-1.5 text-xs font-medium text-[#6b7178] transition hover:border-[#75ACE8]/40 hover:text-[#1a1d21]"
        >
          <Globe size={14} />
          {t.langToggle}
        </button>

        <div className="hidden items-center gap-2 rounded-full bg-[#F7F7F7] px-3 py-1.5 sm:flex">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#75ACE8] text-[11px] font-bold text-white">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <span className="max-w-[180px] truncate text-xs font-medium text-[#6b7178]">
            {userEmail}
          </span>
        </div>

        <button
          onClick={signOut}
          aria-label={t.signOut}
          title={t.signOut}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ececec] text-[#6b7178] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
