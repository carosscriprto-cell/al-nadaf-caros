'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Fuel,
  Settings2,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';

import WhatsAppButton from '@/components/WhatsAppButton';
import { Car } from '@/data/cars';
import {
  getCarTitleFallback,
  type CarContentEntry,
} from '@/data/cars-content';
import { getBlurDataURL } from '@/lib/image';
import { useLocale, useTranslations } from 'next-intl';

type Props = {
  car: Car;
  content?: CarContentEntry;
  type?: 'rent' | 'sale' | 'all';
  imagePriority?: boolean;
};

function formatMoney(value: number) {
  return `$${value.toLocaleString()}`;
}

export default function CarCard({
  car,
  content,
  imagePriority = false,
}: Props) {
  const locale = useLocale();
  const t = useTranslations('car');
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const title = content?.title || getCarTitleFallback(car);
  const cardImage = car.thumbnail || car.images[0];
  // const shortDescription = content?.shortDescription || '';

  const isRent =
    car.listingType === 'rent' || car.listingType === 'both';
  const isSale =
    car.listingType === 'sale' || car.listingType === 'both';
  const isBoth = car.listingType === 'both';

  const rentalPrice = car.pricing.daily
    ? formatMoney(car.pricing.daily)
    : null;
  const salePrice = car.pricing.total
    ? formatMoney(car.pricing.total)
    : null;
  const categoryLabel = t(
    `detail.enums.category.${car.category}`
  );
  const classLabel = t(`detail.enums.class.${car.class}`);
  const transmissionLabel = t(
    `detail.enums.transmission.${car.transmission}`
  );
  const fuelTypeLabel = t(
    `detail.enums.fuelType.${car.fuelType}`
  );

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all duration-400 hover:-translate-y-1 hover:shadow-xl">

      {/* subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/30 via-transparent to-accent/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <Link
        href={`/${locale}/fleet/${car.slug}`}
        className="relative block h-60 overflow-hidden rounded-2xl"
        target='_blank'
      >
        {!isImageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
        <Image
          src={cardImage}
          alt={title}
          fill
          priority={imagePriority}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          quality={74}
          placeholder="blur"
          blurDataURL={getBlurDataURL('#1f2937', '#0f172a')}
          onLoad={() => setIsImageLoaded(true)}
          className={`object-cover transition-all duration-700 group-hover:scale-105 ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/30" />

        <div className="absolute left-4 right-4 top-3 flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {car.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
                <Sparkles className="h-3 w-3 text-amber-300" />
                {t('card.featured')}
              </span>
            )}

            {isBoth && (
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
                {t('card.rent_or_buy')}
              </span>
            )}

            {car.condition === 'new' && (
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
                {t('card.new_arrival')}
              </span>
            )}
          </div>

          <div className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[10px] font-semibold text-white/80 backdrop-blur-md">
            {car.year}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-5 text-white">
          <div className="mb-2">
            <h3 className="text-[22px] font-semibold tracking-tight text-white/90">
              {title}
            </h3>

            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/60">
              {categoryLabel} / {classLabel}
            </p>
          </div>
        </div>
      </Link>

      <div className="relative flex flex-1 flex-col px-5 py-4">
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-white/8 bg-muted/40 p-1.5 text-center">
            <Users className="mx-auto mb-1 h-4 w-4 text-accent" />
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {t('card.seats')}
            </p>
            <p className="mt-1 text-[13px] font-semibold text-foreground">
              {car.seats}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-muted/40 p-1.5 text-center">
            <Settings2 className="mx-auto mb-1 h-4 w-4 text-accent" />
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {t('card.gearbox')}
            </p>
            <p className="mt-1 text-[13px] font-semibold capitalize text-foreground">
              {transmissionLabel}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-muted/40 p-1.5 text-center">
            {car.fuelType === 'electric' ? (
              <Zap className="mx-auto mb-1 h-4 w-4 text-accent" />
            ) : (
              <Fuel className="mx-auto mb-1 h-4 w-4 text-accent" />
            )}
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {car.fuelType === 'electric'
                ? t('card.range')
                : t('card.fuel')}
            </p>
            <p className="mt-1 text-[13px] font-semibold text-foreground">
              {car.fuelType === 'electric'
                ? `${car.electricRange ?? 'N/A'} km`
                : fuelTypeLabel}
            </p>
          </div>
        </div>

        {/* <p className="mb-4 flex h-[40px] items-center line-clamp-2 text-[13px] leading-5 text-muted-foreground/80 xl:text-[15px]">
          {shortDescription}
        </p> */}

        <div className="mb-3 flex flex-nowrap gap-2 justify-center">
          {(content?.features || []).slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="truncate rounded-full border border-accent/10 bg-accent/5 px-3 py-1 text-[10px] font-medium text-accent 2xl:text-[12px]"
            >
              {feature}
            </span>
          ))}
        </div>

        <div className="mb-3 rounded-3xl border border-white/8 bg-gradient-to-r from-accent/10 to-accent/5 px-4 py-3 backdrop-blur-2xl">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {isBoth
              ? t('card.rent_or_buy')
              : isRent
              ? t('card.daily_rate')
              : t('card.purchase_price')}
          </p>

          <div className="mt-2">
            {isBoth ? (
              <div className="flex items-end justify-between gap-4">
                <div className="flex items-end gap-1 whitespace-nowrap">
                  <div className="flex items-end gap-1">
                    <span className="text-center text-[28px] font-semibold text-foreground">
                      {rentalPrice || '-'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      /{t('detail.values.day')}
                    </span>
                  </div>
                </div>

                <div className="h-8 w-px bg-border" />

                <div className="flex w-full flex-col items-start">
                  <div className="flex w-full items-end gap-1">
                    <span className="text-[28px] font-semibold tracking-tight text-foreground">
                      {salePrice || '-'}
                    </span>
                    {car.pricing.oldPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatMoney(car.pricing.oldPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : isRent ? (
              <div className="flex items-end gap-1">
                <span className="text-[28px] font-semibold tracking-tight text-foreground">
                  {rentalPrice || '-'}
                </span>
                <span className="text-sm text-muted-foreground">
                  /{t('detail.values.day')}
                </span>
              </div>
            ) : isSale ? (
              <div className="flex items-end gap-1">
                <span className="text-[28px] font-semibold tracking-tight text-foreground">
                  {salePrice || '-'}
                </span>
                {car.pricing.oldPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatMoney(car.pricing.oldPrice)}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('card.price_on_request')}
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
           {/* CTA TEXT */}
          <div className="text-center">
            <p className="text-sm font-medium text-foreground mt-1">
              {isRent
                ? t('card.cta_rent')
                : isSale
                ? t('card.cta_buy')
                : t('card.cta_both')}
            </p>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-2" dir="ltr">
            {/* WhatsApp (Primary) */}
            <WhatsAppButton
              car={car}
              content={content}
              className="flex-1 flex items-center justify-center w-full gap-2 rounded-2xl 
              bg-[#25D366] py-3 text-[14px] font-semibold text-white  truncate
              shadow-lg shadow-[#25D366]/20 
              transition-all duration-300 
              hover:scale-[1.02] hover:shadow-xl hover:shadow-[#25D366]/30"
            >
              {isRent
                ? t('actions.book_now')
                : isSale
                ? t('actions.buy_now')
                : t('actions.contact_now')}
              <Image 
                src="/WhatsApp.png" 
                alt="WhatsApp" 
                width={24} 
                height={24} 
                loading="lazy"
              />  
            </WhatsAppButton>
          </div>

          {/* Secondary link */}
          <Link
            href={`/${locale}/fleet/${car.slug}`}
            className="flex items-center justify-center gap-2 rounded-2xl 
            border border-border/60 bg-white/[0.03] py-3 
            text-[14px] font-medium text-foreground 
            transition hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
          >
            {t('card.explore_specs')}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
