'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,

} from 'react';

import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';


import HeroPopularSearches from './HeroPopularSearches';


import { useHeroSearch } from '@/hooks/useHeroSearch';
import { useHeroPlaceholder } from '@/hooks/useHeroPlaceholder';
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
    const qs = params.toString();
    return `/${locale}/fleet${qs ? `?${qs}` : ''}`;
  }, [filters, locale]);

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