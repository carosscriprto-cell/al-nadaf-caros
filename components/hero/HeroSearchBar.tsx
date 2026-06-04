'use client';

import { useCallback, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

// FilterSelect now lives in its own file — no longer cross-imported from CarsFilters

import HeroSearchDropdown from './HeroSearchDropdown';

import { FilterSelect } from './FilterSelecte';
import { useHeroSearch } from '@/hooks/useHeroSearch';



/**
 * Refactored HeroSearchBar — changes vs original:
 *
 * ✓ Search button has onClick → navigates to fleet page with filters in URL
 * ✓ Enter key on input triggers the same navigation
 * ✓ Outside-click closes the results dropdown
 * ✓ `open` is now an explicit boolean (isOpen) from the hook
 * ✓ FilterSelect imported from its own file, not from CarsFilters
 * ✓ label prop omitted (was passing label="" which rendered an empty <label>)
 * ✓ setFilter unified API replaces setBrand/setModel/setFuelType/setListingType
 */
export default function HeroSearchBar() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    filters,
    setFilter,
    results,

    isOpen,

    closeDropdown,

    brandOptions,
    modelOptions,
    fuelTypeOptions,
  } = useHeroSearch();

  // Hero → Fleet handoff: serialize current filter state to fleet page URL
  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.query.trim()) params.set('search', filters.query.trim());
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.model) params.set('model', filters.model);
    if (filters.fuelType) params.set('fuelType', filters.fuelType);
    if (filters.listingType) params.set('type', filters.listingType);

    const qs = params.toString();
    router.push(`/${locale}/fleet${qs ? `?${qs}` : ''}`);
  }, [filters, locale, router]);

  // Close dropdown when clicking outside the component
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        closeDropdown();;
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeDropdown, setFilter]);

  return (
    <div ref={containerRef} className="relative max-w-6xl">
      <div
        className="
          rounded-[28px]
          border
          border-white/10
          bg-white/10
          p-3
          backdrop-blur-2xl
        "
      >
        {/* Search input */}
        <div className="relative mb-3">
          <input
            value={filters.query}
            onChange={(e) => setFilter('query', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            placeholder={t('hero.search_placeholder')}
            className="
              h-14
              w-full
              rounded-2xl
              border
              border-white/10
              bg-white/5
              px-5
              pr-28
              text-white
              outline-none
              placeholder:text-white/50
            "
          />

          <button
            onClick={handleSearch}
            className="
              absolute
              right-2
              top-1/2
              flex
              h-10
              -translate-y-1/2
              items-center
              gap-2
              rounded-xl
              bg-accent
              px-4
              text-sm
              font-semibold
              text-white
              transition
              hover:opacity-90
            "
          >
            <Search size={16} />
            {t('hero.search')}
          </button>
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
            onChange={(v) => setFilter('fuelType', v)}
            options={fuelTypeOptions}
            anyLabel={t('hero.fuel')}
          />

          <FilterSelect
            value={filters.listingType}
            onChange={(v) => setFilter('listingType', v)}
            options={[
              { value: 'sale', label: t('hero.buy') },
              { value: 'rent', label: t('hero.rent') },
            ]}
            anyLabel={t('hero.type')}
          />
        </div>
      </div>

      {/* Results dropdown */}
      {isOpen && (
        <div
          className="
            absolute
            left-0
            right-0
            z-50
            mt-3
            overflow-hidden
            rounded-[28px]
            border
            border-border
            bg-background
            shadow-2xl
            backdrop-blur-xl
          "
        >

          <HeroSearchDropdown cars={results} />
        </div>
      )}
    </div>
  );
}