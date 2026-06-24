'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { ArrowRight, Sparkles, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import type { Car } from '@/types/vehicles';

// ─── Types ────────────────────────────────────────────────────────────────

interface Props {
  /** Filtered/searched result set — may be empty if no query yet */
  cars: Car[];
  /** Full inventory (from Supabase) used to build the curated fallback */
  allCars: Car[];
  /** Whether the user has typed anything */
  hasQuery: boolean;
  /** Whether any structured filter (brand/model/fuel/type) is active */
  hasActiveFilters?: boolean;
  /** Pre-built URL with all current filter params */
  searchURL: string;
  onClose?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Vehicles to surface when the user has not yet typed — curated fallback.
 *  Priority vehicles are sorted by badge importance so the most curated car
 *  always appears first. */
function getCuratedFallback(allCars: Car[]): Car[] {
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

// Single subtle badge label (theme-aware accent chip applied in the row).
// Priority order: Featured > New Arrival > Best Seller > Popular.
function getBadgeLabel(
  car: Car,
  t: (key: string, opts?: Record<string, string>) => string,
): string | null {
  if (car.isFeatured) return t('hero.curated_badge', { defaultValue: 'Featured' });
  if (car.isNewArrival) return t('hero.new_badge', { defaultValue: 'New' });
  if (car.isBestSeller) return t('hero.best_seller_badge', { defaultValue: 'Best Seller' });
  if (car.isPopular) return t('hero.popular_badge', { defaultValue: 'Popular' });
  return null;
}

// ─── Result row — uniform [thumbnail | name + meta | price] ─────────────────

function ResultRow({ car, onClose }: { car: Car; onClose?: () => void }) {
  const locale = useLocale();
  const t = useTranslations();
  const badge = getBadgeLabel(car, t);
  const price = getPrice(car);

  return (
    <Link
      href={`/${locale}/fleet/${car.slug}`}
      onClick={onClose}
      className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-accent-subtle"
      aria-label={`${car.brand} ${car.model} — ${price}`}
    >
      {/* Thumbnail — consistent size for every row */}
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image
          src={car.thumbnail || car.images?.[0]}
          alt={`${car.brand} ${car.model}`}
          fill
          sizes="80px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
        />
      </div>

      {/* Name + meta */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">
            {car.brand} {car.model}
            {car.trim && <span className="text-muted-foreground"> {car.trim}</span>}
          </p>
          {badge && (
            <span className="shrink-0 rounded-full border border-accent/20 bg-accent-subtle px-2 py-0.5 text-[10px] font-medium text-accent">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {car.year} · {car.class}
        </p>
      </div>

      {/* Price — aligned right */}
      <p className="shrink-0 text-sm font-semibold text-foreground" dir="ltr">
        {price}
      </p>
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────

export default function HeroResultsDropdown({
  cars,
  allCars,
  hasQuery,
  hasActiveFilters = false,
  searchURL,
  onClose,
}: Props) {
  const locale = useLocale();
  const t = useTranslations();

  const curated = useMemo(() => getCuratedFallback(allCars), [allCars]);

  const hasResultsToShow = cars.length > 0;

  // Curated fallback only for pure browse (no query AND no active filters).
  // When a filter (e.g. a fuel type) is active but matches nothing, show the
  // empty state — never fall back to unrelated cars.
  const isCurated = !hasQuery && !hasActiveFilters;
  const isEmpty = (hasQuery || hasActiveFilters) && cars.length === 0;

  const displayCars = (hasResultsToShow ? cars : curated).slice(0, 6);

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-xs font-semibold text-foreground">
            {isCurated
              ? t('hero.curated_vehicles', { defaultValue: 'Curated for you' })
              : t('hero.recommended_vehicles', { defaultValue: 'Matching vehicles' })}
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {isCurated
              ? t('hero.curated_sub', { defaultValue: 'Our finest selection' })
              : `${displayCars.length} ${t('hero.available_vehicles', { defaultValue: 'available' })}`}
          </p>
        </div>

        {!isEmpty && (
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-[10px] text-muted-foreground">
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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted">
            <Search size={20} className="text-muted-foreground" aria-hidden="true" />
          </div>
          <h4 className="mt-4 text-sm font-semibold text-foreground">
            {t('hero.no_exact_match', { defaultValue: 'No vehicles found' })}
          </h4>
          <p className="mx-auto mt-1.5 max-w-xs text-xs text-muted-foreground">
            {t('hero.no_exact_match_description', {
              defaultValue: 'Try a different term or browse our full inventory.',
            })}
          </p>
          <Link
            href={`/${locale}/fleet`}
            onClick={onClose}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-xs font-medium text-foreground transition hover:border-accent/40 hover:bg-accent-subtle"
          >
            {t('hero.browse_inventory', { defaultValue: 'Browse All Vehicles' })}
            <ArrowRight size={14} aria-hidden="true" className="rtl:rotate-180" />
          </Link>
        </div>
      )}

      {/* ── Results — uniform rows, hairline dividers ───────────────── */}
      {!isEmpty && displayCars.length > 0 && (
        <div className="max-h-[360px] overflow-y-auto">
          <div className="divide-y divide-border">
            {displayCars.map((car) => (
              <ResultRow key={car.id} car={car} onClose={onClose} />
            ))}
          </div>
        </div>
      )}

      {/* ── Footer: View All — always preserves context ─────────────── */}
      {!isEmpty && (
        <div className="border-t border-border p-2">
          <Link
            href={searchURL}
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-accent transition hover:bg-accent-subtle"
          >
            {t('hero.view_inventory', { defaultValue: 'View All Vehicles' })}
            <ArrowRight size={14} aria-hidden="true" className="rtl:rotate-180" />
          </Link>
        </div>
      )}
    </div>
  );
}
