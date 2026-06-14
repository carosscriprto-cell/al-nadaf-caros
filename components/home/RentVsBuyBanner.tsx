'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { ArrowRight, Zap, Gauge, Users, Fuel } from 'lucide-react';
import { getCarTitleFallback } from '@/data/cars-content';
import { getBlurDataURL } from '@/lib/image';
import type { Car, CarContentMap } from '@/types/vehicles';

type RentVsBuyBannerProps = {
  cars: Car[];
  contentMap?: CarContentMap;
};

export default function RentBuyExperienceSection({
  cars,
  contentMap = {},
}: RentVsBuyBannerProps) {
  const locale = useLocale();
  const t = useTranslations();
  const tb = useTranslations('buttons');

  const featuredCar =
    cars
      .filter(car => car.isFeatured)
      .sort((a, b) => (b.horsepower || 0) - (a.horsepower || 0))[0] ||
    cars[0];

  if (!featuredCar) return null;

  // const featuredCar =
  // cars.find(car => car.isHero) ||
  // cars[0];

  const featuredContent = contentMap[featuredCar.slug];
  const featuredTitle =
    featuredContent?.title || getCarTitleFallback(featuredCar);
  const featuredDescription =
    featuredContent?.shortDescription || '';

  const enumLabel = (
    group:
      | 'category'
      | 'class'
      | 'condition'
      | 'drivetrain'
      | 'fuelType'
      | 'transmission',
    value: string
  ) => t(`car.detail.enums.${group}.${value}`);


  const formatAcceleration = (value?: string) => {
    if (!value) return null;

    const match = value.match(/0-100 km\/h in ([\d.]+)s/i);

    if (!match) {
      return value;
    }

    return t('car.detail.formats.acceleration', {
      seconds: match[1],
    });
  };
  
  return (
    <section className="relative overflow-hidden bg-muted/30 py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">

        {/* ===================== */}
        {/* PART 1 */}
        {/* ===================== */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* RENT */}
          <div className="group relative aspect-[16/9] overflow-hidden rounded-3xl">
            <Image
              src="/hero/rent.png"
              alt="Rent"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={72}
              placeholder="blur"
              blurDataURL={getBlurDataURL('#0f172a', '#1f2937')}
              className="object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/10" />

            <div className="relative z-10 flex h-full flex-col justify-end p-8 text-white">
              <h3 className="text-3xl font-bold">{t('rent_vs_buy.rent-title')}</h3>
              <p className="text-white/70 mt-2">
                {t('rent_vs_buy.rent-description')}
              </p>

              <Link
                href={`/${locale}/rental`}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold"
              >
                {tb('rent_now')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* BUY */}
          <div className="group relative aspect-[16/9] overflow-hidden rounded-3xl">
            <Image
              src="/hero/buy.png"
              alt="Buy"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={72}
              placeholder="blur"
              blurDataURL={getBlurDataURL('#111827', '#1f2937')}
              className="object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/10" />

            <div className="relative z-10 flex h-full flex-col justify-end p-8 text-white">
              <h3 className="text-3xl font-bold">{t('rent_vs_buy.buy-title')}</h3>
              <p className="text-white/70 mt-2">
                {t('rent_vs_buy.buy-description')}
              </p>

              <Link
                href={`/${locale}/sales`}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3"
              >
                {tb('buy_now')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* ===================== */}
        {/* PART 2 */}
        {/* ===================== */}
        <div className="grid gap-12 lg:grid-cols-2">

          {/* IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="relative aspect-[4/3] overflow-hidden rounded-3xl"
          >
            <Image
              src={featuredCar.thumbnail || featuredCar.images[0]}
              alt={featuredTitle}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={74}
              placeholder="blur"
              blurDataURL={getBlurDataURL('#111827', '#0f172a')}
              className="object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center"
          >
            <div className="space-y-6">
              <div>
                <h2 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
                  {featuredTitle}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {featuredDescription}
                </p>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-4">
                {featuredCar.horsepower && (
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-accent" />
                    <span className="text-foreground">
                      {t('car.detail.formats.horsepower', {
                        value: featuredCar.horsepower,
                      })}
                    </span>
                  </div>
                )}

                {featuredCar.topSpeed && (
                  <div className="flex items-center gap-3">
                    <Gauge className="h-5 w-5 text-accent" />
                    <span className="text-foreground">
                      {t('car.detail.formats.speed', {
                        value: featuredCar.topSpeed,
                      })}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-accent" />
                  <span className="text-foreground">
                    {t('car.detail.formats.seats', {
                      count: featuredCar.seats,
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Fuel className="h-5 w-5 text-accent" />
                  <span className="text-foreground capitalize">
                    {enumLabel('fuelType', featuredCar.fuelType)}
                  </span>
                </div>
              </div>

              {/* Acceleration */}
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
                  {t('car.detail.learn_more_about', {
                    vehicle: featuredTitle,
                  })}
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <Link
                  href={`/${locale}/fleet`}
                  className="inline-flex items-center justify-center gap-3 rounded-xl border border-border bg-background/60 px-8 py-4 font-semibold text-accent backdrop-blur-md transition-all duration-300 hover:bg-accent hover:text-white hover:scale-105"
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
