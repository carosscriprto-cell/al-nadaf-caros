import { redirect } from 'next/navigation';
import { cookies }  from 'next/headers';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/database.types';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardTopbar  from '@/components/dashboard/DashboardTopbar';

async function getSessionAndTenant() {
  const cookieStore = await cookies();

  const supabase = createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // جلب الـ tenant المرتبط بالمستخدم
  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('role, tenant:tenants(*)')
    .eq('user_id', user.id)
    .single();

  if (!tenantUser?.tenant) redirect('/auth/login');

  return {
    user,
    tenant: tenantUser.tenant,
    role:   tenantUser.role,
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, tenant, role } = await getSessionAndTenant();

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white flex">
      <DashboardSidebar
        tenant={tenant}
        userRole={role}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar
          user={user}
          tenant={tenant}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}