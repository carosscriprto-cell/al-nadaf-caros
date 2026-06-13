import { getLocale } from 'next-intl/server';
import CarsListingPage from '@/components/pages/CarsListingPage';
import { getAllCarsForSearch } from '@/lib/supabase/queries.server';

export default async function FleetPage() {
  const locale = await getLocale() as 'en' | 'ar';

  const { cars, contentMap, contentAr, contentEn } =
    await getAllCarsForSearch(locale);

  return (
    <CarsListingPage
      cars={cars}
      contentMap={contentMap}
      contentAr={contentAr}
      contentEn={contentEn}
      type="all"
      showTypeFilter
    />
  );
}