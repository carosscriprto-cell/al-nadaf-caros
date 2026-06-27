import { redirect } from 'next/navigation';
import { getMyTenantSettings } from '@/lib/dashboard/settings';
import { tenantToSiteValues, tenantToContentValues } from '@/lib/dashboard/site';
import { parseTenantFeatures } from '@/lib/tenant/features';
import SiteForm from '@/components/dashboard/site/SiteForm';
import ContentForm from '@/components/dashboard/site/ContentForm';

export default async function DashboardSitePage() {
  const { tenant, role } = await getMyTenantSettings();
  if (!tenant) redirect('/auth/login');

  const features = parseTenantFeatures(tenant.features);
  const canEdit = role === 'owner';

  return (
    <>
      <SiteForm
        defaultValues={tenantToSiteValues(tenant)}
        canEdit={canEdit}
        enableRental={features.enableRental}
        enableFinancing={features.enableFinancing}
      />
      <ContentForm
        defaultValues={tenantToContentValues(tenant)}
        canEdit={canEdit}
        enableFinancing={features.enableFinancing}
      />
    </>
  );
}
