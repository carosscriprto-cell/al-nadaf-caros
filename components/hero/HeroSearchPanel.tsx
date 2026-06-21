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
import type { Car, CarContentMap } from '@/types/vehicles';


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

  // Quick price filter for sale-capable tenants; rental-only tenants get a fast
  // "book by date" entry into the wizard instead.
  const showPriceFilter = features.enableSellCar;
  const rentalOnly = features.enableRental && !features.enableSellCar;
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
    brandOptions,
    modelOptions,
    fuelTypeOptions,
  } = useHeroSearch(cars, 'all', contentAr, contentEn);

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

  const showDropdown = isOpen && (hasResults || hasQuery);

  return (
    <div className="mx-auto max-w-5xl">

      {/* ── Desktop search bar — visible from md up ─────────────────── */}
      <div
        ref={containerRef}
        className="relative block"
        role="search"
        aria-label={t('hero.search_label', { defaultValue: 'Search vehicles' })}
      >
        <div
          className="
            rounded-[24px]
            border border-white/10
            bg-white/[0.04]
            backdrop-blur-sm
            divide-x divide-white/8
            p-3
          "
        >
          {/* Search input row */}
          <div className="relative mb-3">
            <Search
              size={17}
              aria-hidden="true"
              className={`
                absolute top-1/2 z-10
                -translate-y-1/2
                text-foreground/35
                ${isRTL ? 'right-4' : 'left-4'}
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
                h-13 w-full
                rounded-[18px]
                border border-border/60
                bg-background/5
                text-sm text-white
                outline-none
                placeholder:text-white/35
                transition
                focus:border-background/18 focus:bg-background/[0.08]
                ${isRTL ? 'pr-11 pl-28' : 'pl-11 pr-28'}
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
                  text-foreground/40 transition hover:text-foreground/80
                  focus-visible:outline focus-visible:outline-offset-1 focus-visible:outline-white/40
                  ${isRTL ? 'left-24' : 'right-24'}
                `}
              >
                <X size={15} />
              </button>
            )}

            <button
              onClick={handleSearch}
              aria-label={t('hero.search', { defaultValue: 'Search' })}
              className={`
                absolute top-1/2 -translate-y-1/2
                flex h-9 items-center gap-1.5
                rounded-[14px]
                bg-accent
                px-4
                text-xs font-semibold text-white
                transition-all hover:opacity-90
                focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent
                ${isRTL ? 'left-2' : 'right-2'}
              `}
            >
              <Search size={14} aria-hidden="true" />
              {t('hero.search')}
            </button>
          </div>

          {/* Filter row */}
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <FilterSelect
              value={filters.brand}
              onChange={(v) => setFilter('brand', v)}
              options={brandOptions}
              anyLabel={t('hero.brand')}
            />
            <FilterSelect
              value={filters.model}
              onChange={(v) => setFilter('model', v)}
              options={modelOptions}
              anyLabel={t('hero.model')}
            />
            <FilterSelect
              value={filters.fuelType}
              onChange={(v) => setFilter('fuelType', v as '' | FuelType)}
              options={fuelTypeOptions}
              anyLabel={t('hero.fuel')}
            />
            {showTypeFilter && (
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
              />
            )}
          </div>

          {/* Quick price filter (sale-capable tenants) — dual-handle range slider */}
          {showPriceFilter && (
            <div className="mt-3 px-2">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium uppercase tracking-[0.14em] text-white/45">
                  {priceCopy.label}
                </span>
                <span className="font-semibold text-white/80" dir="ltr">
                  {priceRange[0].toLocaleString()} – {priceRange[1].toLocaleString()}
                  {priceRange[1] >= priceMax ? '+' : ''}
                </span>
              </div>
              <Slider.Root
                min={0}
                max={priceMax}
                step={priceStep}
                value={priceRange}
                onValueChange={([min, max]) => setPriceRange([min, max])}
                minStepsBetweenThumbs={1}
                dir="ltr"
                className="relative flex h-5 w-full touch-none select-none items-center"
              >
                <Slider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/15">
                  <Slider.Range className="absolute h-full bg-accent" />
                </Slider.Track>
                <Slider.Thumb
                  aria-label={priceCopy.min}
                  className="block h-4 w-4 rounded-full border-2 border-accent bg-background shadow-md shadow-accent/30 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
                <Slider.Thumb
                  aria-label={priceCopy.max}
                  className="block h-4 w-4 rounded-full border-2 border-accent bg-background shadow-md shadow-accent/30 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </Slider.Root>
            </div>
          )}

          {/* Rental-only tenants: a fast entry into the booking wizard */}
          {rentalOnly && (
            <div className="mt-2 px-1">
              <Link
                href={`/${locale}/booking`}
                className="inline-flex items-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white transition hover:border-accent/40 hover:bg-accent/20"
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
              rounded-[22px]
              border border-white/10
              bg-background/96
              shadow-[0_24px_80px_rgba(0,0,0,0.5)]
              backdrop-blur-2xl
            "
            id={listboxId}
            role="listbox"
            aria-label="Search results"
          >
            <HeroResultsDropdown
              cars={results}
              allCars={cars}
              hasQuery={hasQuery}
              searchURL={buildSearchURL()}
              onClose={closeDropdown}
            />
          </div>
        )}
      </div>

      {/* ── Popular searches — always visible ────────────────────────── */}
      <div className="mt-4">
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