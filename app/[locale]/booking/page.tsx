import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { getAllCarsForSearch } from '@/lib/supabase/queries.server';
import { siteConfig } from '@/config';
import { BookingClientPage } from './BookingClientPage';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('booking');
  
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}



export default async function BookingPage() {
  const locale = await getLocale() as 'en' | 'ar';
  const { cars, contentMap, contentAr, contentEn } =
    await getAllCarsForSearch(locale);

  return (
      <BookingClientPage
          cars={cars}
          contentMap={contentMap}
          contentAr={contentAr}
          contentEn={contentEn}
          whatsappNumber={siteConfig.contact.whatsapp}
        />
  );
}