'use client';

import { FormEvent, KeyboardEvent, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Car } from '@/data/cars';
import useDebouncedValue from './hooks/useDebouncedValue';
import useSearchHistory from './hooks/useSearchHistory';
import { ArrowDown, ArrowRight, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { carContentAr } from '@/data/cars-content/ar';
import { carContentEn } from '@/data/cars-content/en';
import { getCarTitleFallback } from '@/data/cars-content';
import { useCarContentMap } from '@/data/cars-content/useCarContent';
import { prepareCarsForSearch } from '@/lib/search/buildIndex';
import { createSearch } from '@/lib/search/createSearch';
import { normalize } from '@/lib/search/normalize';
import { searchVehicles } from '@/lib/search/searchVehicles';
import type { SearchableCar } from '@/lib/search/types';

export type SearchMode = 'rent' | 'sale' | 'both';

interface Props {
  cars: Car[];
  initialListingType?: SearchMode;
}

const STORAGE_KEY = 'vehicle-search-history';

function getCarPrice(car: Car, mode: SearchMode) {
  if (mode === 'rent') return car.pricing.daily ?? null;
  if (mode === 'sale') return car.pricing.total ?? null;
  return car.pricing.daily ?? car.pricing.total ?? null;
}

function getBadgeKey(car: Car) {
  if (car.listingType === 'both') return 'all';
  if (car.listingType === 'rent') return 'rent';
  return 'sale';
}


/* ================= COMPONENT ================= */

export default function HomeVehicleSearchForm({
  cars,
  initialListingType = 'both',
}: Props) {
  const router = useRouter();
  const t = useTranslations('heroForm');
  const tCar = useTranslations('car');
  const params = useParams() as { locale?: string };
  const localePrefix = params.locale ? `/${params.locale}` : '';
  const contentMap = useCarContentMap(params.locale);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>(initialListingType);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  

  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
  });

  const debouncedQuery = useDebouncedValue(query, 300);
  const { saveHistory } = useSearchHistory(STORAGE_KEY);
  const preparedCars = useMemo(() => {
    return prepareCarsForSearch(cars, carContentAr, carContentEn);
  }, [cars]);

    

  /* ================= QUICK TAGS ================= */

  const quickTags = useMemo(() => {
    const brands = Array.from(new Set(cars.map((c) => c.brand))).map(
      (b) => ({ type: 'brand', value: b })
    );

    const categories = Array.from(
      new Set(cars.map((c) => c.category))
    ).map((c) => ({ type: 'category', value: c }));

    return [...brands.slice(0, 3), ...categories.slice(0, 3)];
  }, [cars]);

  /* ================= FILTERS ================= */

  const carsByMode = useMemo(() => {
    if (mode === 'both') return cars;

    return cars.filter((car) =>
      mode === 'rent'
        ? car.listingType === 'rent' || car.listingType === 'both'
        : car.listingType === 'sale' || car.listingType === 'both'
    );
  }, [cars, mode]);

  const searchableCarsByMode = useMemo(() => {
    const allowedIds = new Set(carsByMode.map((car) => car.id));
    return preparedCars.filter((car) => allowedIds.has(car.id));
  }, [carsByMode, preparedCars]);

  const filteredCars = useMemo(() => {
    return searchableCarsByMode.filter((car) => {
      const price = getCarPrice(car, mode);
      if (price === null) return false;

      if (filters.minPrice && price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && price > Number(filters.maxPrice)) return false;

      return true;
    });
  }, [searchableCarsByMode, filters, mode]);

  const vehicleSearch = useMemo(() => {
    return createSearch(filteredCars);
  }, [filteredCars]);

  const normalizedQuery = normalize(debouncedQuery);

  const previewCars = useMemo(() => {
    return searchVehicles({
      cars: filteredCars,
      query: normalizedQuery,
      search: vehicleSearch,
    }).slice(0, 5);
  }, [filteredCars, normalizedQuery, vehicleSearch]);


  /* ================= HANDLERS ================= */

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();

    const params = new URLSearchParams();

    if (query) params.set('search', query);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);

    const route =
      mode === 'sale' ? 'sales' : mode === 'rent' ? 'rental' : 'fleet';

    if (query) saveHistory(query);

    router.push(`${localePrefix}/${route}?${params.toString()}`);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((prev) =>
        Math.min(prev + 1, previewCars.length - 1)
      );
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.max(prev - 1, 0));
    }

    if (e.key === 'Enter') {
      if (activeSuggestion >= 0) {
        const car = previewCars[activeSuggestion];
        router.push(`${localePrefix}/fleet/${car.slug}`);
        return;
      }
      handleSubmit();
    }
  };

  const suggestedCars = useMemo(() => {
    return searchVehicles({
      cars: filteredCars,
      query: '',
      search: vehicleSearch,
    }).slice(0, 5);
  }, [filteredCars, vehicleSearch]);

const MIN_RESULTS = 4;

const displayCars = useMemo(() => {
  let baseList: SearchableCar[];

  if (!normalizedQuery) {
    baseList = suggestedCars;
  } else if (previewCars.length > 0) {
    baseList = previewCars;
  } else {
    baseList = [];
  }

  if (baseList.length < MIN_RESULTS) {
    const extra = suggestedCars
      .filter((s) => !baseList.some((b) => b.id === s.id))
      .slice(0, MIN_RESULTS - baseList.length);

    baseList = [...baseList, ...extra];
  }

  return baseList.map((car) => ({
    ...car,
    content: contentMap?.[car.slug],
  }));
}, [normalizedQuery, previewCars, suggestedCars, contentMap]);



  /* ================= UI ================= */

  return (
    <div
      className="
      w-full 
      rounded-2xl 
      p-4 md:p-5 lg:p-6
      max-w-full
      h-auto
      bg-card/80 border border-border/60 backdrop-blur-xl
      flex flex-col
    "
    >
      {/* TITLE */}
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-foreground">{t('title')}</h2>
          <p className="text-muted-foreground text-sm">
            {t('subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setQuery('');
            setFilters({ minPrice: '', maxPrice: '' });
            setMode('both');
          }}
          className="text-md opacity-70 hover:opacity-100 underline cursor-pointer font-semibold text-foreground"
        >
          {t('clear')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4 flex flex-col flex-1">

        {/* TABS */}
        <div className="flex rounded-xl bg-muted/90 p-1 gap-1">
          {(['both', 'rent', 'sale'] as SearchMode[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`flex-1 py-2 rounded-xl text-sm transition cursor-pointer font-semibold ${
                mode === item
                  ? 'bg-accent text-white'
                  : 'text-muted-foreground hover:bg-accent/10'
              }`}
            >
              {item === 'both'
                ? t('tabs.all')
                : item === 'rent'
                ? t('tabs.rent')
                : t('tabs.sale')}
              </button>
          ))}
        </div>

        {/* INPUT */}
        <div className="flex items-center rounded-xl border py-2 px-3 bg-card/60">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('placeholder')}
            className="w-full h-full outline-none text-[14px] bg-transparent text-foreground"
          />
          <button type="submit" 
          className="bg-accent hover:bg-accent/90 shadow-md shadow-accent/20 py-2 px-3 font-semibold rounded-lg text-white text-sm cursor-pointer whitespace-nowrap transition">
            {t('submit')} <Search size={16} className="ml-1 inline-block" />
          </button>
        </div>

        {/* QUICK TAGS */}
        <div className="flex flex-wrap gap-2 max-h-[60px] overflow-hidden">
          {quickTags.map((tag) => {
            const label =
              tag.type === 'category'
                ? tCar(`detail.enums.category.${tag.value}`)
                : tag.value;

            return (
              <button
                key={`${tag.type}-${tag.value}`}
                type="button"
                onClick={() => setQuery(tag.value)}
                className="px-3 py-1 text-xs 2xl:text-sm rounded-full bg-card/60 border border-border/60 text-foreground
                hover:border-accent/50 hover:bg-accent hover:text-white transition cursor-pointer font-medium whitespace-nowrap"
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* PRICE */}
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs opacity-50 text-foreground/80">
              $
            </span>
            <input
              type="number"
              placeholder={t('filters.minPrice')}
              value={filters.minPrice}
              onChange={(e) =>
                setFilters((f) => ({ ...f, minPrice: e.target.value }))
              }
              className="pl-5 bg-white/5 text-foreground border rounded-xl px-3 py-2 text-sm w-full"
            />
          </div>

          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs opacity-50 text-foreground/80">
              $
            </span>
            <input
              type="number"
              placeholder={t('filters.maxPrice')}
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters((f) => ({ ...f, maxPrice: e.target.value }))
              }
              className="pl-5 bg-white/5 text-foreground border rounded-xl px-3 py-2 text-sm w-full"
            />
          </div>
        </div>

        {/* RESULTS */}
        <div
          className="
          flex-1
          overflow-y-auto 
          rounded-xl
          max-h-[200px]
          lg:max-h-[260px]
          overflow-hidden
          border border-border/60 divide-y bg-card/60
        "
        >
          {normalizedQuery && previewCars.length === 0 && (
            <div className="p-3 text-[15px] font-semibold italic text-center text-muted-foreground flex flex-col items-center gap-2">
              {t('results.emptyTitle')} : <br />
              {t('results.emptyDescription')}
              <span className='text-accent font-semibold uppercase'>
                {t('results.suggestions')}
                <ArrowDown size={16} className="inline-block ml-1" />
              </span>
            </div>
          )}
          {displayCars.map((car, i) => {
            const categoryLabel = tCar(`detail.enums.category.${car.category}`);
            const transmissionLabel = tCar(`detail.enums.transmission.${car.transmission}`);
            return(  
              <button
                key={car.id}
                type="button"
                onClick={() =>
                  router.push(`${localePrefix}/fleet/${car.slug}`)
                }
                className={`w-full flex items-center gap-3 p-3 transition cursor-pointer bg-muted/90 ${
                  i === activeSuggestion
                    ? 'bg-accent/20'
                    : 'hover:bg-white/10'
                }`}
              >
                <div className="group relative w-24 h-14 xl:w-30 xl:h-16 rounded-lg overflow-hidden border border-accent/40 bg-muted/30">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60" />
                  <Image
                    src={car.thumbnail}
                    alt={car.model}
                    fill 
                    sizes="120px"
                    className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    placeholder="blur"
                    blurDataURL="/placeholder.png"
                  />
                </div>
  
                <div className="flex-1 text-left">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm 2xl:text-lg text-foreground">
                      {car.content?.title || getCarTitleFallback(car)}
                    </span>
  
  
                  </div>
  
                  <div className="flex items-center gap-2 text-xs 2xl:text-sm mt-1 text-foreground">
                    <span className="opacity-60">
                      {categoryLabel} • {transmissionLabel}
                    </span>
  
                    <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] 2xl:text-[12px]">
                      {t(`tabs.${getBadgeKey(car)}`)}
                    </span>
                  </div>
                </div>
  
                <div className="flex flex-col items-end text-foreground">
                  <span className="text-sm font-semibold 2xl:text-lg opacity-60">
                     ${getCarPrice(car, mode)}
                  </span>
  
                  <span className="text-xs font-semibold 2xl:text-sm opacity-60 mt-1 inline-block">
                    {t('results.viewDetails')}
                    <ArrowRight size={12} className="ml-1 inline-block" /> 
                  </span>
                </div>
              </button>
            )})}
          
          
        </div>
      </form>
    </div>
  );
}
