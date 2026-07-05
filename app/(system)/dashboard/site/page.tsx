import { redirect } from 'next/navigation';
import { getMyTenantSettings } from '@/lib/dashboard/settings';
import { tenantToSiteValues, tenantToContentValues } from '@/lib/dashboard/site';
import { parseTenantFeatures } from '@/lib/tenant/features';
import SiteEditor from '@/components/dashboard/site/SiteEditor';

export default async function DashboardSitePage() {
  const { tenant, role } = await getMyTenantSettings();
  if (!tenant) redirect('/auth/login');

  const features = parseTenantFeatures(tenant.features);
  const canEdit = role === 'owner';

  return (
    <SiteEditor
      siteDefaults={tenantToSiteValues(tenant)}
      contentDefaults={tenantToContentValues(tenant)}
      canEdit={canEdit}
      enableRental={features.enableRental}
      enableFinancing={features.enableFinancing}
    />
  );
}
