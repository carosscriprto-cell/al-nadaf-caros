import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Car } from 'lucide-react';

import FleetDetailClient from '@/components/pages/FleetDetailClient';
import { siteConfig } from '@/config';
import { cars } from '@/data/cars';
import {
  getCarContentMap,
  getCarTitleFallback,
} from '@/data/cars-content';

type PageProps = {
  params: Promise<{
    id: string;
    locale: string;
  }>;
};

function getCarByIdOrSlug(id: string) {
  return cars.find(
    (item) => String(item.id) === id || item.slug === id
  );
}

function getMetadataDescription(description?: string) {
  if (!description) {
    return siteConfig.brand.tagline;
  }

  return description.length > 160
    ? `${description.slice(0, 157)}...`
    : description;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const car = getCarByIdOrSlug(id);

  if (!car) {
    return {
      title: siteConfig.brand.name,
      description: siteConfig.brand.tagline,
    };
  }

  const localizedContentMap = await getCarContentMap(locale);

  const localizedContent = localizedContentMap[car.slug];
  const title =
    localizedContent?.title || getCarTitleFallback(car);
  const description = getMetadataDescription(
    localizedContent?.shortDescription ||
      localizedContent?.description
  );
  const canonicalPath = `/${locale}/fleet/${car.slug}`;

  return {
    title: `${title} | ${siteConfig.brand.name}`,
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
      url: canonicalPath,
      siteName: siteConfig.brand.name,
      images: [
        {
          url: car.thumbnail,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [car.thumbnail],
    },
  };
}

export default async function FleetDetailPage({
  params,
}: PageProps) {
  const { id, locale } = await params;
  const t = await getTranslations('car');
  const car = getCarByIdOrSlug(id);

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

  const contentMap = await getCarContentMap(locale);
  const similarCars = cars
    .filter((item) => item.id !== car.id)
    .map((item) => {
      let score = 0;

      if (item.listingType === car.listingType) {
        score += 8;
      } else if (
        item.listingType === 'both' ||
        car.listingType === 'both'
      ) {
        score += 5;
      }

      if (item.brand === car.brand) score += 4;
      if (item.category === car.category) score += 2;
      if (item.class === car.class) score += 1;

      return {
        car: item,
        content: contentMap[item.slug],
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ car: item, content }) => ({
      car: item,
      content,
    }));

  return (
    <FleetDetailClient
      car={car}
      content={contentMap[car.slug]}
      locale={locale}
      similarCars={similarCars}
    />
  );
}
