import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cairo, ibmPlexArabic } from '@/lib/fonts';
import DashboardShell from '@/components/dashboard/DashboardShell';
import type { DashLang } from '@/components/dashboard/DashboardI18n';

// Session + tenant guard. Runs as the logged-in user (RLS-scoped). The user's
// tenant comes from tenant_users — the dashboard is scoped to THAT tenant.
async function getSessionAndTenant() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('role, tenant:tenants(*)')
    .eq('user_id', user.id)
    .single();

  if (!tenantUser?.tenant) redirect('/auth/login');

  return { user, tenant: tenantUser.tenant, role: tenantUser.role };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, tenant, role } = await getSessionAndTenant();
  const cookieStore = await cookies();
  const initialLang: DashLang =
    cookieStore.get('caros_dash_lang')?.value === 'ar' ? 'ar' : 'en';

  return (
    <div
      className={`${cairo.variable} ${ibmPlexArabic.variable} font-[family-name:var(--font-cairo)]`}
    >
      <DashboardShell
        initialLang={initialLang}
        tenant={tenant}
        role={role}
        userEmail={user.email ?? ''}
      >
        {children}
      </DashboardShell>
    </div>
  );
}
