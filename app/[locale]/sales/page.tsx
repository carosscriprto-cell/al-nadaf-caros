import CarsListingPage from '@/components/pages/CarsListingPage';
import { getAllCarsForSearch } from '@/lib/supabase/queries.server';

export default async function SalesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Route param is authoritative; server getLocale() defaults to 'ar' here.
  const { locale: rawLocale } = await params;
  const locale = rawLocale === 'ar' ? 'ar' : 'en';

  const { cars, contentMap, contentAr, contentEn } =
    await getAllCarsForSearch(locale);

  return (
    <CarsListingPage
      cars={cars}
      contentMap={contentMap}
      contentAr={contentAr}
      contentEn={contentEn}
      type="sale"
    />
  );
}

