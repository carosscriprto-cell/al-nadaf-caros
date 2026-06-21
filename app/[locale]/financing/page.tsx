import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getStorefrontFeatures } from '@/lib/supabase/getTenant';
import FinancingPageClient from '@/components/pages/FinancingPageClient';

export const metadata: Metadata = {
  title: 'Financing',
};

export default async function FinancingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === 'ar' ? 'ar' : 'en';
  setRequestLocale(locale);

  // Financing is a Pro+ feature — gate the route: redirect to the fleet listing
  // when the tenant doesn't have financing enabled.
  const features = await getStorefrontFeatures();
  if (!features.enableFinancing) {
    redirect(`/${locale}/fleet`);
  }

  return <FinancingPageClient locale={locale} />;
}
