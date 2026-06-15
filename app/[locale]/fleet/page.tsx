import { setRequestLocale } from 'next-intl/server';
import CarsListingPage from '@/components/pages/CarsListingPage';
import { getAllCarsForSearch } from '@/lib/supabase/queries.server';
import { getStorefrontFeatures } from '@/lib/supabase/getTenant';
import { isHybridTenant } from '@/lib/tenant/features';

export default async function FleetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Route param is authoritative; server getLocale() defaults to 'ar' here.
  const { locale: rawLocale } = await params;
  const locale = rawLocale === 'ar' ? 'ar' : 'en';
  setRequestLocale(locale);

  const [{ cars, contentMap, contentAr, contentEn }, features] = await Promise.all([
    getAllCarsForSearch(locale),
    getStorefrontFeatures(),
  ]);

  return (
    <CarsListingPage
      cars={cars}
      contentMap={contentMap}
      contentAr={contentAr}
      contentEn={contentEn}
      type="all"
      // Sale/Rent filter only for hybrid tenants (offer both).
      showTypeFilter={isHybridTenant(features)}
    />
  );
}