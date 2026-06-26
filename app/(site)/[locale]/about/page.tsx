import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getTenantConfig } from '@/lib/supabase/getTenant';
import { parseTenantPages } from '@/lib/tenant/pages';
import AboutPageClient from '@/components/pages/AboutPageClient';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === 'ar' ? 'ar' : 'en';
  setRequestLocale(locale);

  // The About page is optional per tenant (Site tab) — redirect to fleet when off.
  const tenant = await getTenantConfig();
  if (!parseTenantPages(tenant.pages).about) {
    redirect(`/${locale}/fleet`);
  }

  return <AboutPageClient />;
}
