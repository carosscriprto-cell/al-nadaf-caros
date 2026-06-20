'use client';

// components/home/FeaturedSpotlight.tsx — a single featured car shown large
// (big image + condensed key specs + CTA), driven by inventory. Replaces the old
// rent-vs-buy split banner (P2.5-3a); works for every tenant type. Toggleable
// like any home section (key: featuredSpotlight).

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Sparkles, Zap, Gauge, Users, Fuel } from 'lucide-react';

import { getCarTitleFallback } from '@/data/cars-content';
import { getBlurDataURL } from '@/lib/image';
import type { Car, CarContentMap } from '@/types/vehicles';

type FeaturedSpotlightProps = {
  cars: Car[];
  contentMap?: CarContentMap;
};

export default function FeaturedSpotlight({
  cars,
  contentMap = {},
}: FeaturedSpotlightProps) {
  const locale = useLocale();
  const t = useTranslations();
  const tb = useTranslations('buttons');

  // Pick the strongest featured car, else fall back to the first in inventory.
  const featuredCar =
    cars
      .filter((car) => car.isFeatured)
      .sort((a, b) => (b.horsepower || 0) - (a.horsepower || 0))[0] || cars[0];

  if (!featuredCar) return null;

  const featuredContent = contentMap[featuredCar.slug];
  const featuredTitle = featuredContent?.title || getCarTitleFallback(featuredCar);
  const featuredDescription = featuredContent?.shortDescription || '';

  const enumLabel = (
    group: 'category' | 'class' | 'condition' | 'drivetrain' | 'fuelType' | 'transmission',
    value: string,
  ) => t(`car.detail.enums.${group}.${value}`);

  const formatAcceleration = (value?: string) => {
    if (!value) return null;
    const match = value.match(/0-100 km\/h in ([\d.]+)s/i);
    if (!match) return value;
    return t('car.detail.formats.acceleration', { seconds: match[1] });
  };

  return (
    <section className="relative overflow-hidden bg-muted/30 py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative aspect-[4/3] overflow-hidden rounded-3xl"
          >
            <Image
              src={featuredCar.thumbnail || featuredCar.images[0]}
              alt={featuredTitle}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={76}
              placeholder="blur"
              blurDataURL={getBlurDataURL('#111827', '#0f172a')}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </motion.div>

          {/* CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center"
          >
            <div className="space-y-6">
              <div>
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t('car.card.featured')}
                </span>

                <h2 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
                  {featuredTitle}
                </h2>
                {featuredDescription && (
                  <p className="text-lg text-muted-foreground">{featuredDescription}</p>
                )}
              </div>

              {/* Condensed key specs */}
              <div className="grid grid-cols-2 gap-4">
                {featuredCar.horsepower && (
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-accent" />
                    <span className="text-foreground">
                      {t('car.detail.formats.horsepower', { value: featuredCar.horsepower })}
                    </span>
                  </div>
                )}

                {featuredCar.topSpeed && (
                  <div className="flex items-center gap-3">
                    <Gauge className="h-5 w-5 text-accent" />
                    <span className="text-foreground">
                      {t('car.detail.formats.speed', { value: featuredCar.topSpeed })}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-accent" />
                  <span className="text-foreground">
                    {t('car.detail.formats.seats', { count: featuredCar.seats })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Fuel className="h-5 w-5 text-accent" />
                  <span className="capitalize text-foreground">
                    {enumLabel('fuelType', featuredCar.fuelType)}
                  </span>
                </div>
              </div>

              {/* Acceleration highlight */}
              {featuredCar.acceleration && (
                <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl">
                  <p className="text-sm text-muted-foreground">
                    {t('car.detail.labels.acceleration')}
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatAcceleration(featuredCar.acceleration)!}
                  </p>
                </div>
              )}

              {/* CTA */}
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href={`/${locale}/fleet/${featuredCar.slug}`}
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-accent px-8 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  {t('car.detail.learn_more_about', { vehicle: featuredTitle })}
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <Link
                  href={`/${locale}/fleet`}
                  className="inline-flex items-center justify-center gap-3 rounded-xl border border-border bg-background/60 px-8 py-4 font-semibold text-accent backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-accent hover:text-white"
                >
                  {tb('our_fleet')}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
