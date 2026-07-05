'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Sparkles, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import type { Car } from '@/types/vehicles';
import { formatPrice } from '@/lib/vehicles/pricing';

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
  /** Text query is being debounced — show the loading state. Presentation-only:
   *  driven by the panel, never changes the search pipeline. */
  isSearching?: boolean;
  /** Localised live count of all matching cars, e.g. "324 cars" */
  countLabel?: string;
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

// Tenant-currency price string. For rent/'both' cars the daily rate leads (lower
// commitment, more likely what a browsing user expects); sale-only shows total.
function formatCarPrice(car: Car, locale: string): string {
  const dayLabel = locale === 'ar' ? 'يوم' : 'day';
  if (
    (car.listingType === 'rent' || car.listingType === 'both') &&
    car.pricing.daily
  ) {
    return `${formatPrice(car.pricing.daily, car.pricing.currency, locale)} / ${dayLabel}`;
  }
  if (
    (car.listingType === 'sale' || car.listingType === 'both') &&
    car.pricing.total
  ) {
    return formatPrice(car.pricing.total, car.pricing.currency, locale);
  }
  return locale === 'ar' ? 'عند الطلب' : 'On Request';
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

function ResultRow({
  car,
  locale,
  active,
  onHover,
  onClose,
  setRef,
}: {
  car: Car;
  locale: string;
  active: boolean;
  onHover: () => void;
  onClose?: () => void;
  setRef: (el: HTMLAnchorElement | null) => void;
}) {
  const t = useTranslations();
  const badge = getBadgeLabel(car, t);
  const price = formatCarPrice(car, locale);

  return (
    <Link
      ref={setRef}
      href={`/${locale}/fleet/${car.slug}`}
      onClick={onClose}
      onMouseEnter={onHover}
      role="option"
      aria-selected={active}
      className={`group flex items-center gap-4 px-4 py-3 outline-none transition-colors ${
        active ? 'bg-accent-subtle ring-1 ring-inset ring-accent/30' : 'hover:bg-accent-subtle'
      }`}
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

      {/* Price — numerals stay LTR even under RTL */}
      <p className="shrink-0 text-sm font-semibold text-foreground" dir="ltr">
        {price}
      </p>
    </Link>
  );
}

// Loading skeleton — mirrors the row rhythm so the swap to real results is calm.
function SkeletonRows() {
  return (
    <div className="divide-y divide-border" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <div className="h-14 w-20 shrink-0 animate-pulse rounded-lg bg-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-3 w-14 shrink-0 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────

export default function HeroResultsDropdown({
  cars,
  allCars,
  hasQuery,
  hasActiveFilters = false,
  isSearching = false,
  countLabel,
  searchURL,
  onClose,
}: Props) {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();

  const curated = useMemo(() => getCuratedFallback(allCars), [allCars]);

  const hasResultsToShow = cars.length > 0;

  // Curated fallback only for pure browse (no query AND no active filters).
  // When a filter (e.g. a fuel type) is active but matches nothing, show the
  // empty state — never fall back to unrelated cars.
  const isCurated = !hasQuery && !hasActiveFilters;
  const isEmpty = !isSearching && (hasQuery || hasActiveFilters) && cars.length === 0;

  const displayCars = useMemo(
    () => (hasResultsToShow ? cars : curated).slice(0, 6),
    [hasResultsToShow, cars, curated],
  );

  // ── Keyboard navigation (↑/↓/Enter) ─────────────────────────────────────
  // The search input (in the panel) keeps focus, so we intercept at the
  // document in the CAPTURE phase: Arrow keys move the highlight, Enter opens
  // the highlighted row and is stopped from also triggering the panel's
  // "Enter → view all" search. With nothing highlighted, Enter falls through.
  const [activeIndex, setActiveIndex] = useState(-1);
  const rowRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  // Reset the highlight whenever the visible list (or mode) changes.
  const listKey = displayCars.map((c) => c.id).join('|');
  useEffect(() => {
    setActiveIndex(-1);
  }, [listKey, isEmpty, isSearching]);

  useEffect(() => {
    const navigable = !isEmpty && !isSearching && displayCars.length > 0;
    if (!navigable) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % displayCars.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i <= 0 ? displayCars.length - 1 : i - 1));
      } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < displayCars.length) {
        // A row is highlighted → open it, and stop the panel's Enter handler.
        e.preventDefault();
        e.stopImmediatePropagation();
        const car = displayCars[activeIndex];
        onClose?.();
        router.push(`/${locale}/fleet/${car.slug}`);
      }
    };

    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [displayCars, activeIndex, isEmpty, isSearching, locale, onClose, router]);

  // Keep the highlighted row in view during keyboard traversal.
  useEffect(() => {
    if (activeIndex >= 0) {
      rowRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  return (
    <div aria-busy={isSearching}>
      {/* ── Header — leads with the live count ─────────────────────── */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold tabular-nums text-foreground">
            {countLabel ?? `${displayCars.length}`}
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {isSearching ? (
              <>
                <Loader2 size={11} className="animate-spin" aria-hidden="true" />
                {t('hero.searching', { defaultValue: 'Searching…' })}
              </>
            ) : isCurated ? (
              t('hero.curated_sub', { defaultValue: 'Popular picks' })
            ) : (
              t('hero.recommended_vehicles', { defaultValue: 'Matching your search' })
            )}
          </p>
        </div>

        {isCurated && !isSearching && (
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-[10px] text-muted-foreground">
            <Sparkles size={10} aria-hidden="true" />
            {t('hero.curated_badge', { defaultValue: 'Featured' })}
          </div>
        )}
      </div>

      {/* ── Loading state ───────────────────────────────────────────── */}
      {isSearching ? (
        <div className="max-h-[256px] overflow-hidden">
          <SkeletonRows />
        </div>
      ) : isEmpty ? (
        /* ── Empty state ───────────────────────────────────────────── */
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
      ) : displayCars.length > 0 ? (
        /* ── Results — uniform rows, hairline dividers ───────────────── */
        <div className="max-h-[256px] overflow-y-auto">
          <div className="divide-y divide-border">
            {displayCars.map((car, i) => (
              <ResultRow
                key={car.id}
                car={car}
                locale={locale}
                active={i === activeIndex}
                onHover={() => setActiveIndex(i)}
                onClose={onClose}
                setRef={(el) => {
                  rowRefs.current[i] = el;
                }}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* ── Footer: View All — always preserves context ─────────────── */}
      {!isEmpty && !isSearching && (
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
