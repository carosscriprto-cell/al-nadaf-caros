import { Fragment } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { getAllCarsForSearch } from '@/lib/supabase/queries.server';
import { getCarBrands } from '@/lib/supabase/brands.server';
import { getStorefrontFeatures, getTenantConfig } from '@/lib/supabase/getTenant';
import { isHybridTenant } from '@/lib/tenant/features';
import { resolveVisibleSections, type HomeSectionKey } from '@/lib/tenant/sections';
import { getRequestOrigin } from '@/lib/seo/host';
import { buildOrganizationSchema } from '@/lib/seo/schema';
import JsonLd from '@/components/seo/JsonLd';
import HeroSection from '@/components/hero/HeroSection';
import FeaturedCarsSection from '@/components/home/FeaturedCarsSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import BrandShowcase from '@/components/home/BrandShowcase';
import FeaturedSpotlight from '@/components/home/FeaturedSpotlight';
import FinancingBanner from '@/components/home/FinancingBanner';
import HowItWorks from '@/components/home/HowItWorks';
import FAQSection from '@/components/home/FAQSection';
import FinalCTA from '@/components/home/FinalCTA';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Use the route param (authoritative from the URL). next-intl's server
  // getLocale() can't resolve here — this app uses a custom middleware with no
  // setRequestLocale — so it would default to 'ar' and serve Arabic content.
  const { locale: rawLocale } = await params;
  const locale = rawLocale === 'ar' ? 'ar' : 'en';
  setRequestLocale(locale); // make server getLocale()/getTranslations correct in this subtree

  // Single source: Supabase. Fetch once on the server, drill into the client
  // hero/brand/banner components (which previously imported static data/cars.ts).
  const [{ cars, contentMap, contentAr, contentEn }, brands, features, tenant, origin] = await Promise.all([
    getAllCarsForSearch(locale),
    getCarBrands(),
    getStorefrontFeatures(),
    getTenantConfig(),
    getRequestOrigin(),
  ]);
  const hybrid = isHybridTenant(features);

  // Per-tenant section show/hide + order (P6 white-label). financing is
  // auto-hidden unless the tenant has financing enabled.
  const order = resolveVisibleSections(tenant.sections, { enableFinancing: features.enableFinancing });

  // Each section keyed so the page can render them in the tenant's order.
  const sectionMap: Record<HomeSectionKey, React.ReactNode> = {
    hero: <HeroSection cars={cars} contentAr={contentAr} contentEn={contentEn} showTypeFilter={hybrid} heroImageUrl={tenant.hero_image_url} />,
    brandShowcase: <BrandShowcase cars={cars} brands={brands} />,
    featuredCars: <FeaturedCarsSection locale={locale} />,
    whyChooseUs: <WhyChooseUs />,
    featuredSpotlight: <FeaturedSpotlight cars={cars} contentMap={contentMap} />,
    financing: <FinancingBanner />,
    howItWorks: <HowItWorks />,
    faq: <FAQSection />,
    finalCta: <FinalCTA />,
  };

  const orgSchema = buildOrganizationSchema(tenant, origin, locale);

  return (
    <div>
      <JsonLd data={orgSchema} />
      {order.map((key) => (
        <Fragment key={key}>{sectionMap[key]}</Fragment>
      ))}
    </div>
  );
}
