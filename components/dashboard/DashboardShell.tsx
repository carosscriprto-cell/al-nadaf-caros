'use client';

import { Toaster } from 'sonner';
import type { Tables } from '@/lib/supabase/database.types';
import { DashI18nProvider, useDash, type DashLang } from './DashboardI18n';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopbar from './DashboardTopbar';

type Props = {
  initialLang: DashLang;
  tenant: Tables<'tenants'>;
  role: 'owner' | 'admin' | 'editor';
  userEmail: string;
  children: React.ReactNode;
};

export default function DashboardShell({ initialLang, tenant, role, userEmail, children }: Props) {
  return (
    <DashI18nProvider initialLang={initialLang}>
      <ShellInner tenant={tenant} role={role} userEmail={userEmail}>
        {children}
      </ShellInner>
    </DashI18nProvider>
  );
}

function ShellInner({
  tenant,
  role,
  userEmail,
  children,
}: Omit<Props, 'initialLang'>) {
  const { dir } = useDash();
  return (
    <div dir={dir} className="flex min-h-screen bg-[#F7F7F7] text-[#1a1d21]">
      <DashboardSidebar tenant={tenant} userRole={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar tenant={tenant} userEmail={userEmail} />
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">{children}</main>
      </div>
      <Toaster
        position="top-center"
        dir={dir}
        toastOptions={{
          style: {
            borderRadius: '14px',
            border: '1px solid #ececec',
            fontFamily: 'var(--font-cairo)',
          },
        }}
      />
    </div>
  );
}
