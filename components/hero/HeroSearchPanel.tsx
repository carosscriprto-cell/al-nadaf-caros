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
import { Search, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';


import HeroPopularSearches from './HeroPopularSearches';


import { useHeroSearch } from '@/hooks/useHeroSearch';
import { useHeroPlaceholder } from '@/hooks/useHeroPlaceholder';
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
    hasQuery,
    hasResults,
    openDropdown,
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

  // ── Navigation helper — preserves all filter context in URL ──────────

  const buildSearchURL = useCallback((): string => {
    const params = new URLSearchParams();
    if (filters.query.trim()) params.set('search', filters.query.trim());
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.model) params.set('model', filters.model);
    if (filters.fuelType) params.set('fuelType', filters.fuelType);
    if (filters.listingType) params.set('type', filters.listingType);
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

  const showDropdown = isOpen && (hasResults || hasQuery || priceTouched);

  return (
    <div className="mx-auto max-w-4xl">

      {/* ── Search panel ────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative block"
        role="search"
        aria-label={t('hero.search_label', { defaultValue: 'Search vehicles' })}
      >
        <div className="rounded-2xl border border-border bg-card p-4 shadow-md sm:p-6">
          {/* Search input row — the primary, prominent element */}
          <div className="relative mb-5">
            <Search
              size={20}
              aria-hidden="true"
              className={`
                absolute top-1/2 z-10
                -translate-y-1/2
                text-muted-foreground
                ${isRTL ? 'right-5' : 'left-5'}
              `}
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
              onFocus={openDropdown}
              onChange={(e) => setFilter('query', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`
                h-16 w-full
                rounded-xl
                border border-input
                bg-background
                text-lg text-foreground
                outline-none
                placeholder:text-muted-foreground
                transition
                focus:border-accent focus:ring-2 focus:ring-accent/20
                ${isRTL ? 'pr-14 pl-36' : 'pl-14 pr-36'}
              `}
            />

            {hasQuery && (
              <button
                onClick={() => {
                  clearSearch();
                  inputRef.current?.focus();
                }}
                aria-label={t('hero.clear_search', { defaultValue: 'Clear search' })}
                className={`
                  absolute top-1/2 -translate-y-1/2
                  text-muted-foreground transition hover:text-foreground
                  focus-visible:outline focus-visible:outline-offset-1 focus-visible:outline-accent/40
                  ${isRTL ? 'left-32' : 'right-32'}
                `}
              >
                <X size={18} />
              </button>
            )}

            <button
              onClick={handleSearch}
              aria-label={t('hero.search', { defaultValue: 'Search' })}
              className={`
                absolute top-1/2 -translate-y-1/2
                flex h-11 items-center gap-2
                rounded-lg
                bg-accent-strong
                px-5
                text-sm font-semibold text-white
                shadow-sm
                transition-all hover:opacity-90
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
                ${isRTL ? 'left-2.5' : 'right-2.5'}
              `}
            >
              <Search size={16} aria-hidden="true" />
              {t('hero.search')}
            </button>
          </div>

          {/* Filter row */}
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
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
                onValueChange={([min, max]) => { setPriceRange([min, max]); openDropdown(); }}
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

          {/* Rental tenants: a fast entry into the booking wizard */}
          {showBooking && (
            <div className="mt-5 px-1">
              <Link
                href={`/${locale}/booking`}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:border-accent/40 hover:bg-accent-subtle"
              >
                {priceCopy.book}
                <ArrowRight size={14} className="rtl:rotate-180" />
              </Link>
            </div>
          )}
        </div>

        {/* Results dropdown — portals below the panel */}
        {showDropdown && (
          <div
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
              searchURL={buildSearchURL()}
              onClose={closeDropdown}
            />
          </div>
        )}
      </div>

      {/* ── Popular searches — always visible ────────────────────────── */}
      <div className="mt-5">
        <HeroPopularSearches
          onSelect={(term) => {
            setFilter('query', term);
            openDropdown();
            // Focus input on desktop so results appear
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        />
      </div>
    </div>
  );
}
