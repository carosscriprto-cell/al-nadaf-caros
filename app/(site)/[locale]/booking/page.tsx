import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAllCarsForSearch } from '@/lib/supabase/queries.server';
import { getStorefrontFeatures } from '@/lib/supabase/getTenant';
import { BookingClientPage } from './BookingClientPage';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('booking');
  
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}



export default async function BookingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Route param is authoritative; server getLocale() defaults to 'ar' here.
  const { locale: rawLocale } = await params;
  const locale = rawLocale === 'ar' ? 'ar' : 'en';
  setRequestLocale(locale);

  // The booking wizard is the RENTAL flow — sale-only tenants (no enableRental)
  // don't have it. It's reachable by NO link for them; a manual URL is a real 404.
  const features = await getStorefrontFeatures();
  if (!features.enableRental) {
    notFound();
  }

  const { cars, contentMap, contentAr, contentEn } =
    await getAllCarsForSearch(locale);

  return (
      <BookingClientPage
          cars={cars}
          contentMap={contentMap}
          contentAr={contentAr}
          contentEn={contentEn}
        />
  );
}