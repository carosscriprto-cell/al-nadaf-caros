'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import * as Slider from '@radix-ui/react-slider';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Search, X, ArrowRight, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';


import HeroQuickFilters, { type QuickChip } from './HeroQuickFilters';


import { useHeroSearch } from '@/hooks/useHeroSearch';
import { useHeroPlaceholder } from '@/hooks/useHeroPlaceholder';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import { useTenantFeatures } from '@/components/providers/TenantFeaturesProvider';
import { deriveVehicleOptions } from '@/lib/vehicles/options';
import { FilterSelect } from './FilterSelecte';
import HeroResultsDropdown from './HeroResultsDropdown';
import { FuelType } from '@/types/vehicles';
import type { Car, CarContentMap, CarCondition, CarCategory } from '@/types/vehicles';


// ─── Shared styling ─────────────────────────────────────────────────────────
// Token-based select trigger. Deliberately SUBORDINATE to the search input:
// calmer muted fill, hairline-only on hover, smaller height — so the primary
// search field reads as the hero element and the filters as secondary refiners.

const SELECT_TRIGGER_CLASS =
  'flex w-full items-center justify-between rounded-lg border border-transparent bg-muted px-3 py-2 text-sm text-muted-foreground outline-none transition cursor-pointer hover:border-border hover:text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20';

// ─── Component ────────────────────────────────────────────────────────────

type HeroSearchPanelProps = {
  cars: Car[];
  contentAr?: CarContentMap;
  contentEn?: CarContentMap;
  showTypeFilter?: boolean;
};

export default function HeroSearchPanel({ cars, contentAr, contentEn, showTypeFilter = true }: HeroSearchPanelProps) {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const features = useTenantFeatures();

  // Sale-capable tenants get a quick price filter; rental tenants get a fast
  // "book by date" entry into the wizard. Sale-only tenants never see booking
  // (the route 404s and no link points to it).
  const showPriceFilter = features.enableSellCar;
  const showBooking = features.enableRental;
  // The sale/rent type filter is only meaningful for HYBRID tenants (both sale
  // AND rental). Gate on the actual feature flags — not just the caller's prop —
  // so a sale-only or rent-only tenant never shows an empty, useless filter.
  const showTypeSelect =
    showTypeFilter && features.enableSellCar && features.enableRental;
  // Optional installments-only toggle — only for sale tenants that also offer
  // financing. Feeds the shared fleet filter via `financing=true` in the URL.
  const showFinancingToggle =
    features.enableFinancing && features.enableSellCar;
  const priceCopy = isRTL
    ? { label: 'السعر', min: 'الأدنى', max: 'الأعلى', book: 'احجز بالتاريخ' }
    : { label: 'Price', min: 'Min', max: 'Max', book: 'Book by date' };

  // Dual-handle price range. Bound to the inventory's max price (same derivation
  // the fleet filters use); step keeps drags to ~100 increments.
  const priceMax = useMemo(() => deriveVehicleOptions(cars, 'all').priceMax, [cars]);
  const priceStep = Math.max(1, Math.round(priceMax / 100));
  const [priceRange, setPriceRange] = useState<[number, number]>([0, priceMax]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Accessibility ids
  const inputId = useId();
  const listboxId = useId();

  const placeholder = useHeroPlaceholder();



  const {
    filters,
    setFilter,
    results,
    isOpen,
    setIsOpen,
    hasQuery,
    closeDropdown,
    clearSearch,
    hasFilters,
    filteredAllCars,
    brandOptions,
    modelOptions,
    fuelTypeOptions,
    conditionOptions,
    categoryOptions,
  } = useHeroSearch(cars, 'all', contentAr, contentEn);

  // Localised fuel labels for every fuel type present in the inventory. The
  // option *values* stay the raw enum (derived from the cars) so matching is
  // exact; only the display label is localised. Falls back to the derived
  // English label for any future enum value not listed here.
  const fuelLabels: Record<string, string> = isRTL
    ? {
        petrol: 'بنزين',
        diesel: 'ديزل',
        electric: 'كهرباء',
        hybrid: 'هجين',
        'plug-in-hybrid': 'هجين قابل للشحن',
      }
    : {
        petrol: 'Petrol',
        diesel: 'Diesel',
        electric: 'Electric',
        hybrid: 'Hybrid',
        'plug-in-hybrid': 'Plug-in Hybrid',
      };
  const localizedFuelOptions = fuelTypeOptions.map((opt) => ({
    value: opt.value,
    label: fuelLabels[opt.value.toLowerCase()] ?? opt.label,
  }));

  // ── 4th filter slot ─────────────────────────────────────────────────────
  // Never empty: hybrid → listing-type (sale/rent), sale-only → condition,
  // rental-only → body type. Gated purely on the tenant feature flags. Values
  // stay the raw enum (exact matching); only labels are localised.
  const isSaleOnly = features.enableSellCar && !features.enableRental;
  const isRentalOnly = features.enableRental && !features.enableSellCar;

  const conditionLabels: Record<string, string> = isRTL
    ? { new: 'جديد', used: 'مستعمل', certified: 'معتمد' }
    : { new: 'New', used: 'Used', certified: 'Certified' };
  const localizedConditionOptions = conditionOptions.map((opt) => ({
    value: opt.value,
    label: conditionLabels[opt.value.toLowerCase()] ?? opt.label,
  }));

  const bodyTypeLabels: Record<string, string> = isRTL
    ? {
        sedan: 'سيدان',
        suv: 'دفع رباعي',
        pickup: 'بيك أب',
        sports: 'رياضية',
        coupe: 'كوبيه',
        hatchback: 'هاتشباك',
        convertible: 'مكشوفة',
        wagon: 'ستيشن',
        crossover: 'كروس أوفر',
        van: 'فان',
        minivan: 'ميني فان',
        truck: 'شاحنة',
        mpv: 'MPV',
        supercar: 'سيارة خارقة',
        roadster: 'رودستر',
      }
    : {
        sedan: 'Sedan',
        suv: 'SUV',
        pickup: 'Pickup',
        sports: 'Sports',
        coupe: 'Coupe',
        hatchback: 'Hatchback',
        convertible: 'Convertible',
        wagon: 'Wagon',
        crossover: 'Crossover',
        van: 'Van',
        minivan: 'Minivan',
        truck: 'Truck',
        mpv: 'MPV',
        supercar: 'Supercar',
        roadster: 'Roadster',
      };
  const localizedBodyTypeOptions = categoryOptions.map((opt) => ({
    value: opt.value,
    label: bodyTypeLabels[opt.value.toLowerCase()] ?? opt.label,
  }));

  const prefersReduced = useReducedMotion();

  // ── Quick-filter chips (carwow-style fast browse) ───────────────────────
  // Derived from real inventory: the two most common body types in stock, plus
  // electric/hybrid/new when present. Each chip toggles a real filter (apply on
  // click, clear on second click), so they intersect through the same pipeline.
  const chipFacets = useMemo(() => {
    const categoryCounts = new Map<string, number>();
    let hasElectric = false;
    let hasHybrid = false;
    let hasNew = false;
    for (const car of cars) {
      // Runtime can still carry 'electric' (pending P3 remap; see guardCategory
      // in lib/supabase/mappers.ts) even though the type excludes it — compare
      // as a string and skip it so it never becomes a body-type chip.
      if (car.category && String(car.category) !== 'electric') {
        categoryCounts.set(car.category, (categoryCounts.get(car.category) ?? 0) + 1);
      }
      const fuel = String(car.fuelType).toLowerCase();
      if (fuel === 'electric') hasElectric = true;
      if (fuel === 'hybrid') hasHybrid = true;
      if (String(car.condition).toLowerCase() === 'new') hasNew = true;
    }
    const topCategories = [...categoryCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([value]) => value);
    return { topCategories, hasElectric, hasHybrid, hasNew };
  }, [cars]);

  const quickChips: QuickChip[] = [
    ...chipFacets.topCategories.map((cat) => ({
      id: `cat-${cat}`,
      label: bodyTypeLabels[cat] ?? cat,
      active: filters.category === cat,
      onToggle: () =>
        setFilter('category', filters.category === cat ? '' : (cat as CarCategory)),
    })),
    ...(chipFacets.hasElectric
      ? [{
          id: 'fuel-electric',
          label: fuelLabels.electric,
          active: filters.fuelType === 'electric',
          onToggle: () =>
            setFilter('fuelType', filters.fuelType === 'electric' ? '' : 'electric'),
        }]
      : []),
    ...(chipFacets.hasHybrid
      ? [{
          id: 'fuel-hybrid',
          label: fuelLabels.hybrid,
          active: filters.fuelType === 'hybrid',
          onToggle: () =>
            setFilter('fuelType', filters.fuelType === 'hybrid' ? '' : 'hybrid'),
        }]
      : []),
    ...(chipFacets.hasNew
      ? [{
          id: 'cond-new',
          label: conditionLabels.new,
          active: filters.condition === 'new',
          onToggle: () =>
            setFilter('condition', filters.condition === 'new' ? '' : 'new'),
        }]
      : []),
  ];

  // ── Live price filter (F5) — applied to the hero results dropdown so the
  //    visible results update as the user drags the slider (not only on Search).
  const priceTouched = priceRange[0] > 0 || priceRange[1] < priceMax;
  const inPriceRange = useCallback(
    (car: Car) => {
      // Same context price the fleet uses: total else daily.
      const p = car.pricing.total ?? car.pricing.daily ?? 0;
      return (priceRange[0] <= 0 || p >= priceRange[0]) && (priceRange[1] >= priceMax || p <= priceRange[1]);
    },
    [priceRange, priceMax],
  );
  const liveResults = useMemo(
    () => (priceTouched ? results.filter(inPriceRange) : results),
    [results, priceTouched, inPriceRange],
  );
  // Curated-fallback pool — start from the structured-filtered inventory (NOT
  // the full raw `cars`), so a fuel/brand/type selection that yields no results
  // can never fall back to showing unrelated cars (e.g. petrol when electric
  // is selected).
  const liveAllCars = useMemo(
    () => (priceTouched ? filteredAllCars.filter(inPriceRange) : filteredAllCars),
    [filteredAllCars, priceTouched, inPriceRange],
  );

  // Live count of matching cars — search results when a query is active, else
  // the structured+price filtered inventory. Updates immediately as filters
  // change, so the user sees each filter's effect (carwow feedback pattern).
  const queryActive = filters.query.trim().length >= 2;
  // Presentation-only loading flag: a query is typed but the (same 250ms)
  // debounce that feeds useHeroSearch hasn't settled yet. Drives the dropdown's
  // loading state; the search pipeline itself is untouched.
  const debouncedHeroQuery = useDebouncedValue(filters.query, 250);
  const isSearching =
    queryActive && filters.query.trim() !== debouncedHeroQuery.trim();
  const matchCount = queryActive ? liveResults.length : liveAllCars.length;
  const countLabel = isRTL
    ? `${matchCount.toLocaleString()} سيارة`
    : `${matchCount.toLocaleString()} ${matchCount === 1 ? 'car' : 'cars'}`;

  // ── Navigation helper — preserves all filter context in URL ──────────

  const buildSearchURL = useCallback((): string => {
    const params = new URLSearchParams();
    if (filters.query.trim()) params.set('search', filters.query.trim());
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.model) params.set('model', filters.model);
    if (filters.fuelType) params.set('fuelType', filters.fuelType);
    if (filters.listingType) params.set('type', filters.listingType);
    if (filters.financing) params.set('financing', 'true');
    // Only send bounds the user actually moved off the extremes.
    if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]));
    if (priceRange[1] < priceMax) params.set('maxPrice', String(priceRange[1]));
    const qs = params.toString();
    return `/${locale}/fleet${qs ? `?${qs}` : ''}`;
  }, [filters, locale, priceRange, priceMax]);

  const handleSearch = useCallback(() => {
    closeDropdown();
    router.push(buildSearchURL());
  }, [buildSearchURL, closeDropdown, router]);

  // ── Close dropdown on outside click ──────────────────────────────────

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Ignore clicks inside Radix Select portal
      if (
        target.closest('[data-radix-select-content]') ||
        target.closest('[role="listbox"]')
      ) {
        return;
      }

      if (
        containerRef.current &&
        !containerRef.current.contains(target)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', onMouseDown);

    return () => {
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [closeDropdown]);

  // ── Keyboard: Escape closes, Enter navigates ──────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        closeDropdown();
        inputRef.current?.blur();
      }
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [closeDropdown, handleSearch],
  );

  // Suggestions appear on interaction only (focus, type, filter, price) — never
  // by default. Once opened, the dropdown content decides curated vs results vs
  // empty; outside-click / Escape close it.
  const showDropdown = isOpen;

  return (
    <div className="mx-auto max-w-4xl">

      {/* ── Search panel ────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative block"
        role="search"
        aria-label={t('hero.search_label', { defaultValue: 'Search vehicles' })}
      >
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-2xl shadow-foreground/10 ring-1 ring-foreground/[0.04] sm:p-6">
          {/* ── Row a — search bar: full-width input + primary Search + clear ──
              Logical insets (start-/end-/ps-/pe-) auto-mirror under dir="rtl". */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
            <div className="relative flex-1">
              <Search
                size={20}
                aria-hidden="true"
                className="absolute start-5 top-1/2 z-10 -translate-y-1/2 text-muted-foreground"
              />

              <label htmlFor={inputId} className="sr-only">
                {t('hero.search_placeholder', { defaultValue: 'Search vehicles' })}
              </label>

              <input
                id={inputId}
                ref={inputRef}
                role="combobox"
                aria-expanded={showDropdown}
                aria-haspopup="listbox"
                aria-controls={showDropdown ? listboxId : undefined}
                aria-autocomplete="list"
                autoComplete="off"
                spellCheck={false}
                value={filters.query}
                onFocus={() => setIsOpen(true)}
                onChange={(e) => setFilter('query', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`
                  h-14 w-full
                  rounded-xl
                  border border-input
                  bg-background
                  text-base text-foreground sm:text-lg
                  outline-none
                  placeholder:text-muted-foreground
                  transition
                  focus:border-accent focus:ring-2 focus:ring-accent/20
                  ps-12 ${hasQuery ? 'pe-11' : 'pe-4'}
                `}
              />

              {hasQuery && (
                <button
                  onClick={() => {
                    clearSearch();
                    inputRef.current?.focus();
                  }}
                  aria-label={t('hero.clear_search', { defaultValue: 'Clear search' })}
                  className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground focus-visible:outline focus-visible:outline-offset-1 focus-visible:outline-accent/40"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <button
              onClick={handleSearch}
              aria-label={t('hero.search', { defaultValue: 'Search' })}
              className="
                flex h-14 w-full items-center justify-center gap-2 sm:w-auto
                rounded-xl
                bg-accent-strong
                px-7
                text-sm font-semibold text-white
                shadow-sm
                transition-all hover:opacity-90
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
              "
            >
              <Search size={18} aria-hidden="true" />
              {t('hero.search')}
            </button>
          </div>

          {/* ── Row b — filter row (existing filters; dynamic 4th slot) ──────── */}
          <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            <FilterSelect
              value={filters.brand}
              onChange={(v) => setFilter('brand', v)}
              options={brandOptions}
              anyLabel={t('hero.brand')}
              triggerClassName={SELECT_TRIGGER_CLASS}
            />
            <FilterSelect
              value={filters.model}
              onChange={(v) => setFilter('model', v)}
              options={modelOptions}
              anyLabel={t('hero.model')}
              triggerClassName={SELECT_TRIGGER_CLASS}
            />
            <FilterSelect
              value={filters.fuelType}
              onChange={(v) => setFilter('fuelType', v as '' | FuelType)}
              options={localizedFuelOptions}
              anyLabel={t('hero.fuel')}
              triggerClassName={SELECT_TRIGGER_CLASS}
            />
            {/* 4th slot — exactly one filter per tenant type, never empty. */}
            {showTypeSelect ? (
              <FilterSelect
                value={filters.listingType}
                onChange={(v) => {
                  if (v === '' || v === 'rent' || v === 'sale') {
                    setFilter('listingType', v);
                  }
                }}
                options={[
                  { value: 'sale', label: t('hero.buy') },
                  { value: 'rent', label: t('hero.rent') },
                ]}
                anyLabel={t('hero.type')}
                triggerClassName={SELECT_TRIGGER_CLASS}
              />
            ) : isSaleOnly ? (
              <FilterSelect
                value={filters.condition}
                onChange={(v) => setFilter('condition', v as '' | CarCondition)}
                options={localizedConditionOptions}
                anyLabel={t('hero.condition', { defaultValue: isRTL ? 'الحالة' : 'Condition' })}
                triggerClassName={SELECT_TRIGGER_CLASS}
              />
            ) : isRentalOnly ? (
              <FilterSelect
                value={filters.category}
                onChange={(v) => setFilter('category', v as '' | CarCategory)}
                options={localizedBodyTypeOptions}
                anyLabel={t('hero.body_type', { defaultValue: isRTL ? 'نوع السيارة' : 'Body Type' })}
                triggerClassName={SELECT_TRIGGER_CLASS}
              />
            ) : null}
          </div>

          {/* Quick price filter (sale-capable tenants) — dual-handle range slider */}
          {showPriceFilter && (
            <div className="mt-6 px-1">
              <div className="mb-2.5 flex items-center justify-between text-xs">
                <span className="font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {priceCopy.label}
                </span>
                <span className="font-semibold text-foreground" dir="ltr">
                  {priceRange[0].toLocaleString()} – {priceRange[1].toLocaleString()}
                  {priceRange[1] >= priceMax ? '+' : ''}
                </span>
              </div>
              <Slider.Root
                min={0}
                max={priceMax}
                step={priceStep}
                value={priceRange}
                onValueChange={([min, max]) => { setPriceRange([min, max]); setIsOpen(true); }}
                minStepsBetweenThumbs={1}
                dir="ltr"
                className="relative flex h-5 w-full touch-none select-none items-center"
              >
                <Slider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
                  <Slider.Range className="absolute h-full bg-accent" />
                </Slider.Track>
                <Slider.Thumb
                  aria-label={priceCopy.min}
                  className="block h-4 w-4 rounded-full border-2 border-accent bg-card shadow-sm transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
                <Slider.Thumb
                  aria-label={priceCopy.max}
                  className="block h-4 w-4 rounded-full border-2 border-accent bg-card shadow-sm transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </Slider.Root>
            </div>
          )}

          {/* ── Row c — quick-filter chips (inventory-derived) + live count on
              one side; the rental "pick by date" booking entry on the other.
              Booking renders ONLY when enableRental (sale-only tenants never see
              it). justify-between keeps the two sides apart; the row wraps and
              the booking entry pushes to the end on its own line on mobile. */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <HeroQuickFilters
                chips={quickChips}
                label={isRTL ? 'فلاتر سريعة' : 'Quick filters'}
              />
              <span
                aria-live="polite"
                className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground"
              >
                {countLabel}
              </span>

              {showFinancingToggle && (
                <button
                  type="button"
                  onClick={() => setFilter('financing', !filters.financing)}
                  aria-pressed={filters.financing}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    filters.financing
                      ? 'border-accent bg-accent text-white'
                      : 'border-border bg-background text-foreground hover:border-accent/40 hover:text-accent'
                  }`}
                >
                  <Wallet size={14} aria-hidden="true" />
                  {isRTL ? 'التقسيط فقط' : 'Installments only'}
                </button>
              )}
            </div>

            {showBooking && (
              <Link
                href={`/${locale}/booking`}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:border-accent/40 hover:bg-accent-subtle"
              >
                {priceCopy.book}
                <ArrowRight size={14} className="rtl:rotate-180" />
              </Link>
            )}
          </div>
        </div>

        {/* Results dropdown — appears on interaction, subtle reveal */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              key="hero-suggestions"
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="
                absolute left-0 right-0 z-50
                mt-2
                overflow-hidden
                rounded-xl
                border border-border
                bg-card
                shadow-lg
              "
              id={listboxId}
              role="listbox"
              aria-label="Search results"
            >
              <HeroResultsDropdown
                cars={liveResults}
                allCars={liveAllCars}
                hasQuery={hasQuery}
                hasActiveFilters={hasFilters}
                isSearching={isSearching}
                countLabel={countLabel}
                searchURL={buildSearchURL()}
                onClose={closeDropdown}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
