import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getStorefrontFeatures, getTenantConfig } from '@/lib/supabase/getTenant';
import { getFinanceableCars } from '@/lib/supabase/queries.server';
import { parseTenantContent } from '@/lib/tenant/content';
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

  // Financing is a Pro+ feature — the route does not exist for tenants without it.
  const features = await getStorefrontFeatures();
  if (!features.enableFinancing) notFound();

  // Section A copy: per-tenant overrides (tenants.content.financing) with the
  // static i18n default as fallback. Section B: the financeable inventory grid.
  const [tenant, { cars, contentMap }] = await Promise.all([
    getTenantConfig(),
    getFinanceableCars(locale),
  ]);
  const copy = parseTenantContent(tenant.content).financing[locale];

  return (
    <FinancingPageClient
      locale={locale}
      cars={cars}
      contentMap={contentMap}
      overrides={{ title: copy.title, description: copy.desc, cta: copy.cta }}
    />
  );
}
