import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getStorefrontFeatures } from '@/lib/supabase/getTenant';
import ServicesPageClient from '@/components/pages/ServicesPageClient';

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === 'ar' ? 'ar' : 'en';
  setRequestLocale(locale);

  // Services is a rental-agency concept — sale-only tenants don't offer it.
  // No link points here for them; a manual URL is a real 404.
  const features = await getStorefrontFeatures();
  if (!features.enableRental) {
    notFound();
  }

  return <ServicesPageClient />;
}
