'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { cars } from '@/data/cars';
import { getBlurDataURL } from '@/lib/image';
import HeadSection from '../HeadSection';

const brandLogoBlurDataURL = getBlurDataURL('#f8fafc', '#e2e8f0');

const BRAND_LOGOS = {
  audi: {
    src: '/brands/audi.png',
    width: 101,
    height: 101,
    label: 'Audi',
  },
  bmw: {
    src: '/brands/bmw.png',
    width: 96,
    height: 96,
    label: 'BMW',
  },
  ford: {
    src: '/brands/ford.png',
    width: 128,
    height: 72,
    label: 'Ford',
  },
  hyundai: {
    src: '/brands/hyundai.png',
    width: 160,
    height: 90,
    label: 'Hyundai',
  },
  kia: {
    src: '/brands/kia.png',
    width: 128,
    height: 72,
    label: 'Kia',
  },
  lexus: {
    src: '/brands/lexus.png',
    width: 128,
    height: 72,
    label: 'Lexus',
  },
  'mercedes-benz': {
    src: '/brands/Mercedes-Benz.png',
    width: 132,
    height: 72,
    label: 'Mercedes-Benz',
  },
  porsche: {
    src: '/brands/Porsche.png',
    width: 104,
    height: 104,
    label: 'Porsche',
  },
  'range-rover': {
    src: '/brands/Range-Rover.png',
    width: 148,
    height: 60,
    label: 'Range Rover',
  },
  tesla: {
    src: '/brands/tesla.png',
    width: 92,
    height: 92,
    label: 'Tesla',
  },
  toyota: {
    src: '/brands/Toyota.png',
    width: 132,
    height: 76,
    label: 'Toyota',
  },
} as const;

type BrandLogoKey = keyof typeof BRAND_LOGOS;

const MAX_BRANDS = 7;

function formatBrandName(brand: string) {
  return brand
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getBrandFallback(brand: string) {
  return brand
    .split('-')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function getTopBrands() {
  return Object.entries(
    cars.reduce((acc, car) => {
      acc[car.brand] = (acc[car.brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_BRANDS);
}

function BrandLogo({
  brand,
  priority,
}: {
  brand: string;
  priority: boolean;
}) {
  const logo = BRAND_LOGOS[brand as BrandLogoKey];

  if (!logo) {
    return (
      <div className="flex h-20 w-full items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/50">
        <span className="text-lg font-semibold tracking-[0.3em] text-muted-foreground">
          {getBrandFallback(brand)}
        </span>
      </div>
    );
  }

  return (
    <div className="relative flex h-20 w-full items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/50 px-4">
      <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.14),transparent_55%)]" />
      <Image
        src={logo.src}
        alt={`${logo.label} logo`}
        width={logo.width}
        height={logo.height}
        sizes="(min-width: 1280px) 148px, (min-width: 1024px) 132px, (min-width: 768px) 120px, 96px"
        priority={priority}
        quality={80}
        placeholder="blur"
        blurDataURL={brandLogoBlurDataURL}
        className="relative z-10 h-auto max-h-12 w-auto object-contain transition duration-300 group-hover:scale-105 group-hover:grayscale-0"
      />
    </div>
  );
}

export default function BrandShowcase() {
  const t = useTranslations('');
  const locale = useLocale();

  const brands = getTopBrands();

  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HeadSection
          title={t('brand-section.brand-title')}
          description={t('brand-section.brand-subtitle')}
          divider
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {brands.map((brand, index) => (
            <Link
              key={brand.name}
              href={`/${locale}/fleet?brand=${brand.name}`}
              className="group relative flex min-h-[172px] flex-col rounded-3xl border border-border/60 bg-card/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/30 hover:shadow-[0_24px_60px_rgba(59,130,246,0.14)]"
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent/10 blur-2xl transition-transform duration-300 group-hover:scale-125" />

              <div className="absolute right-3 top-3 rounded-full bg-muted/80 px-2 py-1 text-[10px] font-medium text-muted-foreground">
                {brand.count}
              </div>

              <div className="flex flex-1 items-center justify-center">
                <BrandLogo brand={brand.name} priority={index < 3} />
              </div>

              <div className="mt-5 text-center">
                <p className="text-sm font-semibold text-muted-foreground transition-colors duration-300 group-hover:text-accent">
                  {formatBrandName(brand.name)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
