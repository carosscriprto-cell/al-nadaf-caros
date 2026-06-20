import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAllCarsForSearch } from '@/lib/supabase/queries.server';
import { getStorefrontFeatures } from '@/lib/supabase/getTenant';
import { siteConfig } from '@/config';
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
  // must not reach it. Hard-gate the route: redirect to the fleet listing.
  const features = await getStorefrontFeatures();
  if (!features.enableRental) {
    redirect(`/${locale}/fleet`);
  }

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