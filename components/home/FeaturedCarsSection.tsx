import { getAllCarsForSearch } from '@/lib/supabase/queries.server';
import { getStorefrontFeatures } from '@/lib/supabase/getTenant';
import { isHybridTenant } from '@/lib/tenant/features';
import FeaturedCarousel from './FeaturedCarousel';

// Locale is passed from the page (route param) — server getLocale() defaults to
// 'ar' here (custom middleware, no setRequestLocale) and would serve Arabic content.
export default async function FeaturedCarsSection({
  locale,
}: {
  locale: 'en' | 'ar';
}) {
  const [{ cars, contentMap }, features] = await Promise.all([
    getAllCarsForSearch(locale),
    getStorefrontFeatures(),
  ]);

  return (
    <FeaturedCarousel
      cars={cars}
      contentMap={contentMap}
      locale={locale}
      // Sale/Rent tabs only for hybrid tenants.
      showTypeTabs={isHybridTenant(features)}
    />
  );
}
