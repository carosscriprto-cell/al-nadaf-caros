'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import type { Car } from '@/types/vehicles';
import type { CarBrand } from '@/lib/supabase/brands.server';
import { brandLogoUrl, brandInitials } from '@/lib/tenant/brandLogo';
import HeadSection from '../HeadSection';

const MAX_BRANDS = 7;

// Mirror the migration's normalization for legacy rows that have no brand_slug:
// lowercase, trim, collapse whitespace → hyphen.
function slugifyBrand(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '-');
}

// Count cars per brand slug, then keep only seeded brands that actually have
// inventory, ordered by count. The brand list comes from car_brands (E1) — no
// hardcoded brands here.
function getTopBrands(cars: Car[], brands: CarBrand[]) {
  const counts = new Map<string, number>();
  for (const car of cars) {
    const key = car.brandSlug ?? slugifyBrand(car.brand);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return brands
    .map((brand) => ({ brand, count: counts.get(brand.slug) ?? 0 }))
    .filter((b) => b.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_BRANDS);
}

// Clean, never-blank fallback: a brand monogram in a styled chip. Used when the
// brand has no resolvable logo, OR when the CDN logo fails to load.
function BrandMonogram({ name }: { name: string }) {
  return (
    <div className="flex h-20 w-full items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-accent/10 via-card to-card">
      <span className="text-2xl font-extrabold tracking-tight text-accent">
        {brandInitials(name)}
      </span>
    </div>
  );
}

// Logo resolution (E3): manual override (car_brands.logo_url) → derived free-CDN
// URL from slug → lettered placeholder on error. Native <img> so an unknown slug
// degrades to the monogram without needing the CDN host in next.config.
function BrandLogo({ brand }: { brand: CarBrand }) {
  const [errored, setErrored] = useState(false);
  const src = brandLogoUrl(brand.slug, brand.logo_url);

  if (!src || errored) return <BrandMonogram name={brand.name_en} />;

  return (
    <div className="relative flex h-20 w-full items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/50 px-4">
      <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.14),transparent_55%)]" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${brand.name_en} logo`}
        loading="lazy"
        onError={() => setErrored(true)}
        className="relative z-10 h-auto max-h-12 w-auto object-contain transition duration-300 group-hover:scale-105"
      />
    </div>
  );
}

type BrandShowcaseProps = {
  cars: Car[];
  brands: CarBrand[];
};

export default function BrandShowcase({ cars, brands }: BrandShowcaseProps) {
  const t = useTranslations('');
  const locale = useLocale();

  const top = getTopBrands(cars, brands);
  if (top.length === 0) return null;

  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HeadSection
          title={t('brand-section.brand-title')}
          description={t('brand-section.brand-subtitle')}
          divider
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {top.map(({ brand, count }, index) => (
            <Link
              key={brand.slug}
              // Fleet filters by the free-text car.brand; normalized cars store
              // brand = name_en, so link by name_en to keep the filter working.
              href={`/${locale}/fleet?brand=${encodeURIComponent(brand.name_en)}`}
              className="group relative flex min-h-[172px] flex-col rounded-3xl border border-border/60 bg-card/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/30 hover:shadow-[0_24px_60px_rgba(59,130,246,0.14)]"
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent/10 blur-2xl transition-transform duration-300 group-hover:scale-125" />

              <div className="absolute right-3 top-3 rounded-full bg-muted/80 px-2 py-1 text-[10px] font-medium text-muted-foreground">
                {count}
              </div>

              <div className="flex flex-1 items-center justify-center">
                <BrandLogo key={index} brand={brand} />
              </div>

              <div className="mt-5 text-center">
                <p className="text-sm font-semibold text-muted-foreground transition-colors duration-300 group-hover:text-accent">
                  {locale === 'ar' ? brand.name_ar : brand.name_en}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
