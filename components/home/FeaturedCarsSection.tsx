import { getAllCarsForSearch } from '@/lib/supabase/queries.server';
import FeaturedCarousel from './FeaturedCarousel';

// Locale is passed from the page (route param) — server getLocale() defaults to
// 'ar' here (custom middleware, no setRequestLocale) and would serve Arabic content.
export default async function FeaturedCarsSection({
  locale,
}: {
  locale: 'en' | 'ar';
}) {
  // نجلب كل السيارات لأن التابس تحتاج (featured, rent, sale, new)
  const { cars, contentMap } = await getAllCarsForSearch(locale);

  return (
    <FeaturedCarousel
      cars={cars}
      contentMap={contentMap}
      locale={locale}
    />
  );
}
