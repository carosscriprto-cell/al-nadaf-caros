import { redirect } from 'next/navigation';
import { getMyTenantSettings } from '@/lib/dashboard/settings';
import { tenantToSiteValues } from '@/lib/dashboard/site';
import { parseTenantFeatures } from '@/lib/tenant/features';
import SiteForm from '@/components/dashboard/site/SiteForm';

export default async function DashboardSitePage() {
  const { tenant, role } = await getMyTenantSettings();
  if (!tenant) redirect('/auth/login');

  const features = parseTenantFeatures(tenant.features);

  return (
    <SiteForm
      defaultValues={tenantToSiteValues(tenant)}
      canEdit={role === 'owner'}
      enableRental={features.enableRental}
    />
  );
}
