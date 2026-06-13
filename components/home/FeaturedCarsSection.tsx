import { getLocale } from 'next-intl/server';
import { getAllCarsForSearch } from '@/lib/supabase/queries.server';
import FeaturedCarousel from './FeaturedCarousel';

export default async function FeaturedCarsSection() {
  const locale = await getLocale() as 'en' | 'ar';

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
