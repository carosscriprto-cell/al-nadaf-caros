'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { ArrowRight, Sparkles, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { cars as allCars } from '@/data/cars';
import type { Car } from '@/types/vehicles';

// ─── Types ────────────────────────────────────────────────────────────────

interface Props {
  /** Filtered/searched result set — may be empty if no query yet */
  cars: Car[];
  /** Whether the user has typed anything */
  hasQuery: boolean;
  /** Pre-built URL with all current filter params */
  searchURL: string;
  onClose?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Vehicles to surface when the user has not yet typed — curated fallback.
 *  Priority vehicles are sorted by badge importance so the most curated car
 *  always appears as the featured card. */
function getCuratedFallback(): Car[] {
  const priority = allCars
    .filter(
      (c) =>
        c.available &&
        (c.isFeatured || c.isPopular || c.isBestSeller || c.isNewArrival),
    )
    .sort((a, b) => {
      const rank = (c: Car) =>
        (c.isFeatured ? 8 : 0) +
        (c.isBestSeller ? 4 : 0) +
        (c.isPopular ? 2 : 0) +
        (c.isNewArrival ? 1 : 0);
      return rank(b) - rank(a);
    });

  const rest = allCars.filter(
    (c) =>
      c.available &&
      !c.isFeatured &&
      !c.isPopular &&
      !c.isBestSeller &&
      !c.isNewArrival,
  );
  return [...priority, ...rest].slice(0, 6);
}

function getPrice(car: Car): string {
  // For rent-only or 'both' cars: show daily rate first — it's the lower
  // commitment price and more likely what a browsing user expects.
  if (
    (car.listingType === 'rent' || car.listingType === 'both') &&
    car.pricing.daily
  ) {
    return `$${car.pricing.daily.toLocaleString()}/day`;
  }
  // Sale-only cars: show the total price.
  if (
    (car.listingType === 'sale' || car.listingType === 'both') &&
    car.pricing.total
  ) {
    return `$${car.pricing.total.toLocaleString()}`;
  }
  return 'On Request';
}

// ─── Badge helper ─────────────────────────────────────────────────────────
// Accepts the translation function so labels are always localised.
// Priority order: Featured > New Arrival > Best Seller > Popular

type BadgeResult = { label: string; className: string } | null;

function getBadge(
  car: Car,
  t: (key: string, opts?: Record<string, string>) => string,
): BadgeResult {
  if (car.isFeatured)
    return {
      label: t('hero.curated_badge', { defaultValue: 'Featured' }),
      className: 'bg-amber-500/15 text-amber-300 border-amber-400/20',
    };
  if (car.isNewArrival)
    return {
      label: t('hero.new_badge', { defaultValue: 'New' }),
      className: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20',
    };
  if (car.isBestSeller)
    return {
      label: t('hero.best_seller_badge', { defaultValue: 'Best Seller' }),
      className: 'bg-sky-500/15 text-sky-300 border-sky-400/20',
    };
  if (car.isPopular)
    return {
      label: t('hero.popular_badge', { defaultValue: 'Popular' }),
      className: 'bg-violet-500/15 text-violet-300 border-violet-400/20',
    };
  return null;
}

// ─── Result card ──────────────────────────────────────────────────────────

function ResultCard({
  car,
  size = 'compact',
  onClose,
}: {
  car: Car;
  size?: 'featured' | 'compact';
  onClose?: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations();
  const badge = getBadge(car, t);
  const price = getPrice(car);

  if (size === 'featured') {
    return (
      <Link
        href={`/${locale}/fleet/${car.slug}`}
        onClick={onClose}
        className="
         group relative flex overflow-hidden
          rounded-[18px]
          border border-border/60
          bg-card/80
          backdrop-blur-xl
          transition-all duration-300
          hover:border-accent/20
          hover:bg-accent/5"
        aria-label={`${car.brand} ${car.model} — ${price}`}
      >
        {/* Image */}
        <div className="relative h-36 w-52 shrink-0 overflow-hidden sm:h-40 sm:w-64">
          <Image
            src={car.thumbnail || car.images?.[0]}
            alt={`${car.brand} ${car.model}`}
            fill
            sizes="256px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40" />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between p-4">
          <div>
            {badge && (
              <span
                className={`
                  inline-block rounded-full border px-2.5 py-0.5
                  text-[9px] font-semibold uppercase tracking-[0.16em]
                  ${badge.className}
                  mb-2
                `}
              >
                {badge.label}
              </span>
            )}
            <h3 className="text-sm font-semibold text-foreground">
              {car.brand} {car.model}
              {car.trim && <span className="text-foreground/55"> {car.trim}</span>}
            </h3>
            <p className="mt-0.5 text-[11px] text-foreground/45">
              {car.year} · {car.class}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-base font-semibold text-foreground">{price}</p>
            <span className="flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              View <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // compact
  return (
    <Link
      href={`/${locale}/fleet/${car.slug}`}
      onClick={onClose}
      className="
         group flex items-center gap-3
        rounded-[14px]
        border border-border/60
        bg-card/70
        p-3
        backdrop-blur-xl
        transition-all duration-200
        hover:border-accent/20
        hover:bg-accent/5
      "
      aria-label={`${car.brand} ${car.model} — ${price}`}
    >
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-[10px]">
        <Image
          src={car.thumbnail || car.images?.[0]}
          alt={`${car.brand} ${car.model}`}
          fill
          sizes="80px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.06]"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-foreground">
          {car.brand} {car.model}
        </p>
        <p className="text-[11px] text-foreground/45">{car.year} · {car.class}</p>
      </div>
      <p className="shrink-0 text-xs font-semibold text-foreground/70">{price}</p>
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────

export default function HeroResultsDropdown({
  cars,
  hasQuery,
  searchURL,
  onClose,
}: Props) {
  const locale = useLocale();
  const t = useTranslations();

  const curated = useMemo(() => getCuratedFallback(), []);

  // If user hasn't typed, show curated fallback
  const hasResultsToShow = cars.length > 0;

const displayCars = hasResultsToShow
  ? cars
  : curated;
  const isCurated = !hasQuery;
  const isEmpty = hasQuery && cars.length === 0;

  const featured = displayCars[0];
  const grid = displayCars.slice(1, 5);

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-boder/60 px-5 py-3.5">
        <div>
          <h3 className="text-xs font-semibold text-foreground">
            {isCurated
              ? t('hero.curated_vehicles', { defaultValue: 'Curated for you' })
              : t('hero.recommended_vehicles', { defaultValue: 'Matching vehicles' })}
          </h3>
          <p className="mt-0.5 text-[11px] text-foreground/45">
            {isCurated
              ? t('hero.curated_sub', { defaultValue: 'Our finest selection' })
              : `${displayCars.length} ${t('hero.available_vehicles', { defaultValue: 'available' })}`}
          </p>
        </div>

        {!isEmpty && (
          <div className="flex items-center gap-1.5 rounded-full border border-border/10 bg-white/5 px-3 py-1 text-[10px] text-foreground/60">
            <Sparkles size={10} aria-hidden="true" />
            {isCurated
              ? t('hero.curated_badge', { defaultValue: 'Featured' })
              : `${displayCars.length} ${t('hero.matches', { defaultValue: 'matches' })}`}
          </div>
        )}
      </div>

      {/* ── Empty state ─────────────────────────────────────────────── */}
      {isEmpty && (
        <div className="px-6 py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border/10 bg-white/5">
            <Search size={20} className="text-foreground/40" aria-hidden="true" />
          </div>
          <h4 className="mt-4 text-sm font-semibold text-foreground">
            {t('hero.no_exact_match', { defaultValue: 'No vehicles found' })}
          </h4>
          <p className="mx-auto mt-1.5 max-w-xs text-xs text-foreground/50">
            {t('hero.no_exact_match_description', {
              defaultValue: 'Try a different term or browse our full inventory.',
            })}
          </p>
          <Link
            href={`/${locale}/fleet`}
            onClick={onClose}
            className="
              mt-5 inline-flex items-center gap-2
              rounded-xl
              border border-border/60
              bg-card/80
              px-5 py-2.5
              text-xs font-medium text-foreground
              transition-all
              hover:border-accent/20
              hover:bg-accent/5
            "
          >
            {t('hero.browse_inventory', { defaultValue: 'Browse All Vehicles' })}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────── */}
      {!isEmpty && displayCars.length > 0 && (
        <>
          {/* Featured card */}
          {featured && (
            <div className="p-3">
              <ResultCard car={featured} size="featured" onClose={onClose} />
            </div>
          )}

          {/* Compact grid */}
          {grid.length > 0 && (
            <div className="max-h-[280px] overflow-y-auto px-3 pb-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {grid.map((car) => (
                  <ResultCard
                    key={car.id}
                    car={car}
                    size="compact"
                    onClose={onClose}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Footer: View All — always preserves context ─────────────── */}
      {!isEmpty && (
        <div className="border-t border-border/8 p-3">
          <Link
            href={searchURL}
            onClick={onClose}
            className="
            text-center
              mt-5 inline-flex items-center justify-center gap-2
              rounded-xl
              border border-border/60
              bg-card/80
              px-5 py-2.5 w-full
              text-xs font-medium text-foreground
              transition-all
              hover:border-accent/20
              hover:bg-accent/5
            "
          >
            {t('hero.view_inventory', { defaultValue: 'View All Vehicles' })}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}