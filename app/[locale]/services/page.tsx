import { redirect } from 'next/navigation';
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
  // Gate the route: redirect to the fleet listing when rental is disabled.
  const features = await getStorefrontFeatures();
  if (!features.enableRental) {
    redirect(`/${locale}/fleet`);
  }

  return <ServicesPageClient />;
}
