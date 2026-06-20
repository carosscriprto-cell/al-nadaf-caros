// ═══════════════════════════════════════════════════════════════
// app/[locale]/fleet/[id]/page.tsx — Server Component
// يحل البيانات من Supabase بدل data/cars.ts
// ═══════════════════════════════════════════════════════════════

import Link from 'next/link';
import type { Metadata } from 'next';
import { Car } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import FleetDetailClient from '@/components/pages/FleetDetailClient';
import JsonLd from '@/components/seo/JsonLd';
import { siteConfig } from '@/config';
import {
  getCarBySlug,
  getSimilarCars,
} from '@/lib/supabase/queries.server';
import { getCarTitleFallback } from '@/data/cars-content';
import { getTenantConfig } from '@/lib/supabase/getTenant';
import { getRequestOrigin } from '@/lib/seo/host';
import { buildVehicleSchema } from '@/lib/seo/schema';

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
};

function getMetadataDescription(description?: string) {
  if (!description) return siteConfig.brand.tagline;
  return description.length > 160
    ? `${description.slice(0, 157)}...`
    : description;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, locale } = await params;

  const { car, contentMap } = await getCarBySlug(id, locale as 'en' | 'ar');

  if (!car) {
    return {
      title:       siteConfig.brand.name,
      description: siteConfig.brand.tagline,
    };
  }

  const tenant        = await getTenantConfig();
  const siteName      = (locale === 'ar' ? tenant.name_ar : tenant.name) || tenant.name;
  const content       = contentMap[car.slug];
  const title         = content?.title || getCarTitleFallback(car);
  const description   = getMetadataDescription(
    content?.shortDescription || content?.description
  );
  const canonicalPath = `/${locale}/fleet/${car.slug}`;

  return {
    title:       `${title} | ${siteName}`,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: `/en/fleet/${car.slug}`,
        ar: `/ar/fleet/${car.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url:      canonicalPath,
      siteName,
      images:   [{ url: car.thumbnail, width: 1200, height: 630, alt: title }],
      locale:   locale === 'ar' ? 'ar_SA' : 'en_US',
      type:     'website',
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
      images:      [car.thumbnail],
    },
  };
}

export default async function FleetDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  const t              = await getTranslations('car');

  const { car, contentMap } = await getCarBySlug(id, locale as 'en' | 'ar');

  if (!car) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-[2rem] border border-border/60 bg-card/80 p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <Car className="h-8 w-8" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-foreground">
            {t('detail.not_found_title')}
          </h1>
          <p className="mb-6 text-muted-foreground">
            {t('detail.not_found_description')}
          </p>
          <Link
            href={`/${locale}/fleet`}
            className="inline-flex items-center justify-center rounded-2xl bg-accent px-6 py-3 font-semibold text-accent-foreground"
          >
            {t('actions.browse_vehicles')}
          </Link>
        </div>
      </div>
    );
  }

  // جلب السيارات المشابهة
  const { cars: similarCarsData, contentMap: similarContentMap } =
    await getSimilarCars(car, locale as 'en' | 'ar');

  const similarCars = similarCarsData.map(item => ({
    car:     item,
    content: similarContentMap[item.slug],
  }));

  // Vehicle/Offer structured data (P6) — tenant as the seller.
  const [tenant, origin] = await Promise.all([getTenantConfig(), getRequestOrigin()]);
  const vehicleSchema = buildVehicleSchema(car, contentMap[car.slug], tenant, origin, locale);

  return (
    <>
      <JsonLd data={vehicleSchema} />
      <FleetDetailClient
        car={car}
        content={contentMap[car.slug]}
        locale={locale}
        similarCars={similarCars}
      />
    </>
  );
}


// ═══════════════════════════════════════════════════════════════
// components/home/FeaturedCarsSection.tsx — Server Component
// يحل FeaturedCarsSection من client إلى server
// ═══════════════════════════════════════════════════════════════

// ملاحظة: FeaturedCarsSection يستخدم Embla carousel وتفاعل
// لذلك نقسمه إلى جزأين:
// - FeaturedCarsSection (server) — يجلب البيانات
// - FeaturedCarousel (client)    — يعرض الـ carousel

// app/[locale]/page.tsx أو layout — أضف هذا:
//
// import { getFeaturedCars } from '@/lib/supabase/queries.server';
// import FeaturedCarousel from '@/components/home/FeaturedCarousel';
//
// const locale = await getLocale() as 'en' | 'ar';
// const { cars, contentMap } = await getFeaturedCars(locale);
//
// <FeaturedCarousel
//   initialCars={cars}
//   contentMap={contentMap}
//   locale={locale}
// />