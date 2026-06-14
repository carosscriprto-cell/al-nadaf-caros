// components/dashboard/DashboardTopbar.tsx
// TODO P5: real dashboard topbar (user menu, tenant switcher, notifications).
// Minimal stub to satisfy the dashboard layout and keep the build green.

import type { User } from '@supabase/supabase-js';
import type { Tables } from '@/lib/supabase/database.types';

type Props = {
  user: User;
  tenant: Tables<'tenants'>;
};

export default function DashboardTopbar({ user, tenant }: Props) {
  return (
    <header className="h-14 flex items-center gap-3 px-6 border-b border-white/[0.05]">
      <span className="text-sm font-medium text-white/70">{tenant.name}</span>
      <span className="ml-auto text-xs text-white/30">{user.email}</span>
    </header>
  );
}
