'use client';

import CarsFilters from '@/components/CarsFilters';
import ActiveFilters from '@/components/ActiveFilters';

import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  useTransition,
} from 'react';
import CarCard from '@/components/CarCard';
import CarCardSkeleton from '@/components/skeletons/CarCardSkeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  useRouter,
  useSearchParams,
  usePathname,
} from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { prepareCarsForSearch } from '@/lib/search/buildIndex';
import { createSearch } from '@/lib/search/createSearch';
import { normalize } from '@/lib/search/normalize';
import { searchVehicles } from '@/lib/search/searchVehicles';
import ScrollToTopButton from '../ScrollToTopButton';
import { FilterSelect } from '../hero/FilterSelecte';
import type { Car, CarContentMap } from '@/types/vehicles';

// ─── Props ────────────────────────────────────────────────────

type Props = {
  // البيانات تأتي من Server Component — لا جلب هنا
  cars:       Car[];
  contentMap: CarContentMap;
  contentAr:  CarContentMap;
  contentEn:  CarContentMap;
  // إعدادات الصفحة
  type:           'rent' | 'sale' | 'all';
  showTypeFilter?: boolean;
};

const ITEMS_PER_PAGE = 9;
// 150 ms gives the skeleton enough visibility to signal activity without
// feeling sluggish. The original 380 ms was perceptibly laggy.
const UI_LOADING_DELAY = 150;

export default function CarsListingPage({
  cars,
  contentMap,
  contentAr,
  contentEn,
  type,
  showTypeFilter,
}: Props) {
  const locale       = useLocale();
  const searchParams = useSearchParams();
  const pathname     = usePathname();
  const router       = useRouter();
  const t            = useTranslations('car');
  const tf           = useTranslations('filters');

  const getFilterValue = useCallback(
    (key: string) => searchParams.get(key) ?? '',
    [searchParams]
  );

  const [page,          setPage]          = useState(1);
  const [isGridLoading, setIsGridLoading] = useState(false);
  const [, startTransition]               = useTransition();
  const loadingTimeoutRef                 = useRef<number | null>(null);

  // Derive the active listing type: URL param wins, falls back to the page-
  // level prop. Guard against unexpected URL values by only allowing the
  // three valid values; anything else falls back to the page prop.
  const urlTypeRaw = getFilterValue('type');
  const urlType = (
    urlTypeRaw === 'rent' || urlTypeRaw === 'sale' || urlTypeRaw === 'all'
      ? urlTypeRaw
      : type
  ) as 'all' | 'rent' | 'sale';

  const filters = useMemo(
    () => ({
      search:       normalize(getFilterValue('search')),
      brand:        getFilterValue('brand').split(',').filter(Boolean),
      category:     getFilterValue('category').split(',').filter(Boolean),
      transmission: getFilterValue('transmission').split(',').filter(Boolean),
      class:        getFilterValue('class'),
      fuelType:     getFilterValue('fuelType'),
      seats:        getFilterValue('seats'),
      minPrice:     getFilterValue('minPrice'),
      maxPrice:     getFilterValue('maxPrice'),
      condition:    getFilterValue('condition'),
      delivery:     getFilterValue('delivery'),
      sort:         getFilterValue('sort') || 'all',
    }),
    [getFilterValue]
  );

  // ─── Search index ─────────────────────────────────────────────
  // يستخدم كلا اللغتين للـ search — يُبنى مرة واحدة

  const preparedCars = useMemo(
    () => prepareCarsForSearch(cars, contentAr, contentEn),
    [cars, contentAr, contentEn]
  );

  const vehicleSearch = useMemo(
    () => createSearch(preparedCars),
    [preparedCars]
  );

  // ─── Filtering + sorting ──────────────────────────────────────

  const filteredCars = useMemo(() => {
    const searchedCars = searchVehicles({
      cars:   preparedCars,
      query:  filters.search,
      search: vehicleSearch,
    });

    return searchedCars
      .filter((car) => {
        const matchesType =
          urlType === 'all'
            ? true
            : urlType === 'rent'
            ? car.listingType === 'rent' || car.listingType === 'both'
            : car.listingType === 'sale' || car.listingType === 'both';

        const matchesBrand =
          !filters.brand.length || filters.brand.includes(car.brand);

        const matchesCategory =
          !filters.category.length || filters.category.includes(car.category);

        const matchesTransmission =
          !filters.transmission.length ||
          filters.transmission.includes(car.transmission);

        const matchesClass =
          !filters.class || filters.class === car.class;

        const matchesFuelType =
          !filters.fuelType || filters.fuelType === car.fuelType;

        const matchesSeats =
          !filters.seats || car.seats >= Number(filters.seats);

        const matchesCondition =
          !filters.condition || filters.condition === car.condition;

        const matchesDelivery =
          !filters.delivery || car.deliveryAvailable === true;

        const carPrice =
          urlType === 'rent'
            ? car.pricing.daily ?? Infinity
            : urlType === 'sale'
            ? car.pricing.total ?? Infinity
            : Math.min(
                car.pricing.daily ?? Infinity,
                car.pricing.total ?? Infinity
              );

        const matchesMinPrice =
          !filters.minPrice || carPrice >= Number(filters.minPrice);

        const matchesMaxPrice =
          !filters.maxPrice || carPrice <= Number(filters.maxPrice);

        return (
          matchesType        &&
          matchesBrand       &&
          matchesCategory    &&
          matchesTransmission &&
          matchesClass       &&
          matchesFuelType    &&
          matchesSeats       &&
          matchesCondition   &&
          matchesDelivery    &&
          matchesMinPrice    &&
          matchesMaxPrice
        );
      })
      .sort((a, b) => {
        if (filters.sort === 'price-low' || filters.sort === 'price-high') {
          // Use the same price resolution as the price-range filter above so
          // the sort order matches what the user sees on each card.
          const getContextPrice = (car: typeof a) => {
            if (urlType === 'rent') return car.pricing.daily ?? Infinity;
            if (urlType === 'sale') return car.pricing.total ?? Infinity;
            // 'all' — use the lower of the two available prices
            return Math.min(
              car.pricing.daily ?? Infinity,
              car.pricing.total ?? Infinity,
            );
          };

          const priceA = getContextPrice(a);
          const priceB = getContextPrice(b);

          return filters.sort === 'price-low'
            ? priceA - priceB
            : priceB - priceA;
        }
        if (filters.sort === 'newest') {
          return b.year - a.year;
        }

        // Default: featured first, then best-seller, then popular
        const rankA =
          (a.isFeatured ? 4 : 0) +
          (a.isBestSeller ? 2 : 0) +
          (a.isPopular ? 1 : 0);
        const rankB =
          (b.isFeatured ? 4 : 0) +
          (b.isBestSeller ? 2 : 0) +
          (b.isPopular ? 1 : 0);
        return rankB - rankA;
      });
  }, [preparedCars, filters, urlType, vehicleSearch]);

  // ─── Pagination ───────────────────────────────────────────────

  const searchParamsKey = searchParams.toString();

  useEffect(() => {
    setPage(1);
  }, [searchParamsKey]);

  const totalPages = Math.ceil(filteredCars.length / ITEMS_PER_PAGE);

  const paginatedCars = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredCars.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCars, page]);

  // ─── Loading state ────────────────────────────────────────────

  const triggerLoading = useCallback(() => {
    if (loadingTimeoutRef.current !== null) {
      window.clearTimeout(loadingTimeoutRef.current);
    }
    setIsGridLoading(true);
    loadingTimeoutRef.current = window.setTimeout(() => {
      setIsGridLoading(false);
      loadingTimeoutRef.current = null;
    }, UI_LOADING_DELAY);
  }, []);

  const updateURL = useCallback(
    (newParams: Record<string, string>) => {
      triggerLoading();
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (!value) params.delete(key);
        else params.set(key, value);
      });
      const nextQuery = params.toString();
      const nextHref  = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      startTransition(() => {
        router.replace(nextHref, { scroll: false });
      });
    },
    [pathname, router, searchParams, startTransition, triggerLoading]
  );

  useEffect(() => {
    triggerLoading();
  }, [searchParamsKey, triggerLoading]);

  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current !== null) {
        window.clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background" dir="ltr">
      <div className="mx-auto max-w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <CarsFilters cars={cars} type={urlType} />

          <div className="flex-1">
            <div className="flex flex-col-reverse">
              <ActiveFilters />

              <div
                className="mb-6 flex flex-wrap md:flex-row gap-3 items-center justify-between"
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              >
                <span className="font-bold text-lg">
                  {t('car_listing.showing-cars', {
                    count: filteredCars.length,
                  })}
                </span>

                <div className="flex items-center justify-end gap-4">
                  <div className="min-w-30 shrink-0">
                    {showTypeFilter && (
                      <FilterSelect
                        label=""
                        value={urlType}
                        onChange={(value) => updateURL({ type: value })}
                        options={[
                          { value: 'all',  label: tf('all-type') },
                          { value: 'rent', label: tf('for_rent') },
                          { value: 'sale', label: tf('for_sale') },
                        ]}
                      />
                    )}
                  </div>
                  <div className="min-w-30 shrink-0">
                    <FilterSelect
                      label=""
                      value={filters.sort}
                      onChange={(value) => updateURL({ sort: value })}
                      options={[
                        { value: 'all',        label: t('car_listing.tabs-filter.any') },
                        { value: 'price-low',  label: t('car_listing.tabs-filter.low-high') },
                        { value: 'price-high', label: t('car_listing.tabs-filter.high-low') },
                        { value: 'newest',     label: t('car_listing.tabs-filter.newest') },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            {isGridLoading ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <CarCardSkeleton key={index} />
                ))}
              </div>
            ) : paginatedCars.length === 0 ? (
              <div className="border rounded-2xl p-10 text-center">
                No vehicles found
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {paginatedCars.map((car, index) => (
                    <CarCard
                      key={car.id}
                      car={car}
                      content={contentMap[car.slug]}
                      type={urlType}
                      imagePriority={page === 1 && index < 3}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => { triggerLoading(); setPage(page - 1); }}
                      className="border px-3 py-2 rounded-lg"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { triggerLoading(); setPage(i + 1); }}
                        className={`px-3 py-2 rounded-lg ${
                          page === i + 1 ? 'bg-accent text-white' : 'border'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      disabled={page === totalPages}
                      onClick={() => { triggerLoading(); setPage(page + 1); }}
                      className="border px-3 py-2 rounded-lg"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <ScrollToTopButton />
      </div>
    </div>
  );
}