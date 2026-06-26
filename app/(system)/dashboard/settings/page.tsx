import { redirect } from 'next/navigation';
import { getMyTenantSettings, tenantToFormValues } from '@/lib/dashboard/settings';
import SettingsForm from '@/components/dashboard/settings/SettingsForm';

export default async function DashboardSettingsPage() {
  const { tenant, role } = await getMyTenantSettings();
  if (!tenant) redirect('/auth/login');

  return (
    <SettingsForm
      defaultValues={tenantToFormValues(tenant)}
      canEdit={role === 'owner'}
      tenantId={tenant.id}
    />
  );
}
