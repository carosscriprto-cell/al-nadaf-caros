'use client';

import type { ReactNode } from 'react';
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Car } from '@/data/cars';
import useDebouncedValue from '@/components/hooks/useDebouncedValue';
import { FiltersPanelSkeleton } from '@/components/skeletons/PageSkeletons';
import { useLocale, useTranslations } from 'next-intl';
import * as Slider from '@radix-ui/react-slider';
import {
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X,
  Check,
  Search,
} from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import {
  motion,
  AnimatePresence,
  useDragControls,
} from 'framer-motion';

type ListingPageType = 'rent' | 'sale' | 'all';

type Props = {
  cars: Car[];
  type: ListingPageType;
  isLoading?: boolean;
};

type PriceRange = [number, number];

const TRANSMISSION_OPTIONS: Car['transmission'][] = [
  'automatic',
  'manual',
];
const EMPTY_SELECT_VALUE = '__all__';

function clampPriceRange(
  range: PriceRange,
  maxPrice: number
): PriceRange {
  const safeMin = Math.max(0, Math.min(range[0], maxPrice));
  const safeMax = Math.max(safeMin, Math.min(range[1], maxPrice));
  return [safeMin, safeMax];
}

function areRangesEqual(a: PriceRange, b: PriceRange) {
  return a[0] === b[0] && a[1] === b[1];
}

function FilterSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/40 pb-4">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between py-2 text-sm font-semibold text-foreground transition hover:text-accent"
      >
        {title}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

const Chip = memo(function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
        active
          ? 'border-accent bg-accent text-white shadow-md shadow-accent/20'
          : 'border-border/60 bg-card/60 text-muted-foreground hover:border-accent/50 hover:text-accent'
      }`}
    >
      {active && (
        <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-accent text-[8px] text-white shadow">
          x
        </span>
      )}
      {label}
    </button>
  );
});

function roundToStep(value: number, step: number) {
  return Math.round(value / step) * step;
}



export function FilterSelect({
  label,
  value,
  onChange,
  options,
  anyLabel = 'Any',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  anyLabel?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>

      <Select.Root
        value={value || EMPTY_SELECT_VALUE}
        onValueChange={(nextValue) =>
          onChange(nextValue === EMPTY_SELECT_VALUE ? '' : nextValue)
        }
      >
        {/* Trigger */}
        <Select.Trigger
          className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm text-foreground backdrop-blur-sm outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20 cursor-pointer"
        >
          <Select.Value placeholder={anyLabel} />
          <Select.Icon>
            <ChevronDown size={12} className="text-muted-foreground" />
          </Select.Icon>
        </Select.Trigger>

        {/* Dropdown */}
        <Select.Portal>
          <Select.Content
            className="z-[120] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg backdrop-blur-xl"
            position="popper"
            side="bottom"
            sideOffset={8}
            collisionPadding={16}
          >
            <Select.Viewport className="p-1">
              {/* Default option */}
              <Select.Item
                value={EMPTY_SELECT_VALUE}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm text-muted-foreground outline-none hover:bg-accent hover:text-white"
              >
                <Select.ItemText>{anyLabel}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-2">
                  <Check size={14} />
                </Select.ItemIndicator>
              </Select.Item>

              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm text-foreground outline-none hover:bg-accent hover:text-white"
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-2">
                    <Check size={14} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

// export default FilterSelect;
export default function CarsFilters({
  cars,
  type,
  isLoading = false,
}: Props) {
  const tFilters = useTranslations('filters');
  const tCar = useTranslations('car');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const locale = useLocale(); 
  const dragControls = useDragControls();

  const searchParamsString = searchParams.toString();

  const scopedCars = useMemo(
    () =>
      cars.filter((car) => {
        if (type === 'all') return true;
        return car.listingType === type || car.listingType === 'both';
      }),
    [cars, type]
  );

  const params = useMemo(
    () => new URLSearchParams(searchParamsString),
    [searchParamsString]
  );

  const get = useCallback(
    (key: string) => params.get(key) || '',
    [params]
  );

  const selectedBrand = useMemo(
    () => get('brand').split(',').filter(Boolean),
    [get]
  );
  const selectedCategory = useMemo(
    () => get('category').split(',').filter(Boolean),
    [get]
  );
  const selectedTransmission = useMemo(
    () => get('transmission').split(',').filter(Boolean),
    [get]
  );

  const brands = useMemo(
    () => [...new Set(scopedCars.map((car) => car.brand))].sort(),
    [scopedCars]
  );
  const categories = useMemo(
    () => [...new Set(scopedCars.map((car) => car.category))].sort(),
    [scopedCars]
  );
  const classes = useMemo(
    () => [...new Set(scopedCars.map((car) => car.class))].sort(),
    [scopedCars]
  );
  const fuelTypes = useMemo(
    () => [...new Set(scopedCars.map((car) => car.fuelType))].sort(),
    [scopedCars]
  );
  const conditions = useMemo(
    () => [...new Set(scopedCars.map((car) => car.condition))].sort(),
    [scopedCars]
  );
  const seatsOptions = useMemo(
    () =>
      [...new Set(scopedCars.map((car) => car.seats))]
        .sort((a, b) => a - b)
        .map(String),
    [scopedCars]
  );
  const priceValues = useMemo(
    () =>
      scopedCars
        .map((car) => {
          if (type === 'sale') return car.pricing.total ?? 0;
          if (type === 'rent') return car.pricing.daily ?? 0;
          return car.pricing.daily ?? car.pricing.total ?? 0;
        })
        .filter((price) => price > 0),
    [scopedCars, type]
  );

  const maxPrice = useMemo(
    () => Math.max(...priceValues, 500),
    [priceValues]
  );

  const urlSearch = get('search');
  const urlMin = Number(get('minPrice')) || 0;
  const urlMax = Number(get('maxPrice')) || maxPrice;
  const normalizedUrlPriceRange = useMemo(
    () => clampPriceRange([urlMin, urlMax], maxPrice),
    [urlMin, urlMax, maxPrice]
  );

  const [search, setSearch] = useState(urlSearch);
  const [priceRange, setPriceRange] = useState<PriceRange>(
    normalizedUrlPriceRange
  );
  const debouncedSearch = useDebouncedValue(search, 350);
  const lastCommittedSearchRef = useRef(urlSearch);

  useEffect(() => {
    if (urlSearch === lastCommittedSearchRef.current) {
      return;
    }

    lastCommittedSearchRef.current = urlSearch;
    setSearch(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    setPriceRange((current) => {
      if (!areRangesEqual(current, normalizedUrlPriceRange)) {
        return normalizedUrlPriceRange;
      }

      return current;
    });
  }, [normalizedUrlPriceRange]);

  const replaceParams = useCallback(
    (nextParams: URLSearchParams) => {
      const nextQuery = nextParams.toString();
      if (nextQuery === searchParamsString) return;

      startTransition(() => {
        router.replace(
          nextQuery ? `${pathname}?${nextQuery}` : pathname,
          { scroll: false }
        );
      });
    },
    [pathname, router, searchParamsString, startTransition]
  );

  const updateParams = useCallback(
    (updater: (draft: URLSearchParams) => void) => {
      const nextParams = new URLSearchParams(searchParamsString);
      updater(nextParams);
      replaceParams(nextParams);
    },
    [replaceParams, searchParamsString]
  );

  const setSingle = useCallback(
    (key: string, value: string) => {
      updateParams((draft) => {
        if (!value) draft.delete(key);
        else draft.set(key, value);
      });
    },
    [updateParams]
  );

  const setMulti = useCallback(
    (key: string, value: string) => {
      updateParams((draft) => {
        const currentValues =
          (draft.get(key) || '').split(',').filter(Boolean);
        const nextValues = currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value];

        if (!nextValues.length) draft.delete(key);
        else draft.set(key, nextValues.join(','));
      });
    },
    [updateParams]
  );

  const commitPriceRange = useCallback(
    (nextRange: PriceRange) => {
      const [minValue, maxValue] = clampPriceRange(nextRange, maxPrice);

      updateParams((draft) => {
        if (minValue <= 0) draft.delete('minPrice');
        else draft.set('minPrice', String(minValue));

        if (maxValue >= maxPrice) draft.delete('maxPrice');
        else draft.set('maxPrice', String(maxValue));
      });
    },
    [maxPrice, updateParams]
  );

  useEffect(() => {
    if (debouncedSearch === lastCommittedSearchRef.current) {
      return;
    }

    lastCommittedSearchRef.current = debouncedSearch;
    setSingle('search', debouncedSearch);
  }, [debouncedSearch, setSingle]);

  const clear = useCallback(() => {
    setSearch('');
    lastCommittedSearchRef.current = '';
    setPriceRange([0, maxPrice]);
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }, [maxPrice, pathname, router, startTransition]);

  useEffect(() => {
    if (!mobileOpen) {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      return;
    }

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const activeCount = useMemo(
    () =>
      [
        get('search'),
        get('condition'),
        get('fuelType'),
        get('class'),
        get('seats'),
        get('brand'),
        get('category'),
        get('transmission'),
        get('minPrice'),
        get('maxPrice'),
        get('delivery'),
      ].filter(Boolean).length,
    [get]
  );

  const handleMinInputChange = useCallback(
    (value: string) => {
      const nextMin = value === '' ? 0 : Number(value);
      if (Number.isNaN(nextMin)) return;

      setPriceRange((current) =>
        clampPriceRange([nextMin, current[1]], maxPrice)
      );
    },
    [maxPrice]
  );

  const handleMaxInputChange = useCallback(
    (value: string) => {
      const nextMax = value === '' ? maxPrice : Number(value);
      if (Number.isNaN(nextMax)) return;

      setPriceRange((current) =>
        clampPriceRange([current[0], nextMax], maxPrice)
      );
    },
    [maxPrice]
  );

  const handlePriceInputCommit = useCallback(() => {
    commitPriceRange(priceRange);
  }, [commitPriceRange, priceRange]);

  const getCategoryLabel = useCallback(
    (category: Car['category']) =>
      tCar(`detail.enums.category.${category}`),
    [tCar]
  );

  const getTransmissionLabel = useCallback(
    (transmission: Car['transmission']) =>
      tCar(`detail.enums.transmission.${transmission}`),
    [tCar]
  );

  const getFuelTypeLabel = useCallback(
    (fuelType: Car['fuelType']) =>
      tCar(`detail.enums.fuelType.${fuelType}`),
    [tCar]
  );

  const getConditionLabel = useCallback(
    (condition: Car['condition']) =>
      tCar(`detail.enums.condition.${condition}`),
    [tCar]
  );

  const getClassLabel = useCallback(
    (carClass: Car['class']) =>
      tCar(`detail.enums.class.${carClass}`),
    [tCar]
  );

  const step = type === 'rent' ? 5 : 500;

  const normalizedMaxPrice = useMemo(() => {
    return Math.ceil(maxPrice / step) * step;
  }, [maxPrice, step]);
    

  const FiltersContent = (
    <div className="space-y-4">
      <div className="relative" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tFilters('search_placeholder')}
          className="w-full rounded-2xl border border-border/60 bg-card/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 backdrop-blur-sm outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
        />
        {!search && (
          <button
            onClick={() => {
              setSearch('');
              lastCommittedSearchRef.current = '';
              setSingle('search', '');
            }}
            className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition 
              ${locale === 'ar' ? 'left-3 right-auto mr-2' : 'right-3'}`}
          >
            <Search size={14} />
          </button>
        )}
        {search && (
          <button
            onClick={() => {
              setSearch('');
              lastCommittedSearchRef.current = '';
              setSingle('search', '');
            }}
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition
              ${locale === 'ar' ? 'left-3 right-auto mr-2' : 'right-3'}`}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <FilterSection
        title={
          type === 'sale'
            ? tFilters('price_range')
            : tFilters('daily_price')
        }
        defaultOpen={true}
      >
        <div className="space-y-4 px-1">
          <Slider.Root
            min={0}
            max={normalizedMaxPrice}
            step={step}
            value={priceRange}
            onValueChange={(value) => {
              const [min, max] = value as PriceRange;

              setPriceRange([
                roundToStep(min, step),
                roundToStep(max, step),
              ]);
            }}
            onValueCommit={(value) => {
              const [min, max] = value as PriceRange;

              commitPriceRange([
                roundToStep(min, step),
                roundToStep(max, step),
              ]);
            }}
            className="relative flex h-5 w-full touch-none select-none items-center"
          >
            <Slider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-border/60">
              <Slider.Range className="absolute h-full bg-accent" />
            </Slider.Track>

            <Slider.Thumb
              className="block h-4 w-4 rounded-full border-2 border-accent bg-background shadow-md shadow-accent/30 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent/40"
              aria-label={tFilters('min')}
            />

            <Slider.Thumb
              className="block h-4 w-4 rounded-full border-2 border-accent bg-background shadow-md shadow-accent/30 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent/40"
              aria-label={tFilters('max')}
            />
          </Slider.Root>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="rounded-lg bg-card/80 px-2 py-1 border border-border/40">
              {priceRange[0].toLocaleString()}
            </span>
            <span className="rounded-lg bg-card/80 px-2 py-1 border border-border/40">
              {priceRange[1].toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min={0}
              max={priceRange[1]}
              value={priceRange[0] || ''}
              onChange={(e) => handleMinInputChange(e.target.value)}
              onBlur={handlePriceInputCommit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePriceInputCommit();
                }
              }}
              placeholder={tFilters('min')}
              className="w-full rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
            />
            <input
              type="number"
              min={priceRange[0]}
              max={maxPrice}
              value={priceRange[1] === maxPrice ? '' : priceRange[1]}
              onChange={(e) => handleMaxInputChange(e.target.value)}
              onBlur={handlePriceInputCommit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePriceInputCommit();
                }
              }}
              placeholder={tFilters('max')}
              className="w-full rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title={tFilters('details')}>
        <div className="grid grid-cols-2 gap-3">
          <FilterSelect
            label={tCar('detail.labels.condition')}
            value={get('condition')}
            onChange={(value) => setSingle('condition', value)}
            options={conditions.map((condition) => ({
              value: condition,
              label: getConditionLabel(condition),
            }))}
            anyLabel={tFilters('any')}
          />
          <FilterSelect
            label={tFilters('fuel')}
            value={get('fuelType')}
            onChange={(value) => setSingle('fuelType', value)}
            options={fuelTypes.map((fuelType) => ({
              value: fuelType,
              label: getFuelTypeLabel(fuelType),
            }))}
            anyLabel={tFilters('any')}
          />
          <FilterSelect
            label={tCar('detail.labels.class')}
            value={get('class')}
            onChange={(value) => setSingle('class', value)}
            options={classes.map((carClass) => ({
              value: carClass,
              label: getClassLabel(carClass),
            }))}
            anyLabel={tFilters('any')}
          />
          <FilterSelect
            label={tFilters('seats')}
            value={get('seats')}
            onChange={(value) => setSingle('seats', value)}
            options={seatsOptions.map((seatCount) => ({
              value: seatCount,
              label: `${seatCount}+ ${tFilters('seats_label')}`,
            }))}
            anyLabel={tFilters('any')}
          />
        </div>
      </FilterSection>

      <FilterSection title={tFilters('category')}>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Chip
              key={category}
              label={getCategoryLabel(category)}
              active={selectedCategory.includes(category)}
              onClick={() => setMulti('category', category)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title={tFilters('brand')}>
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <Chip
              key={brand}
              label={brand}
              active={selectedBrand.includes(brand)}
              onClick={() => setMulti('brand', brand)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title={tFilters('transmission')}>
        <div className="flex gap-2">
          {TRANSMISSION_OPTIONS.map((transmission) => (
            <Chip
              key={transmission}
              label={getTransmissionLabel(transmission)}
              active={selectedTransmission.includes(transmission)}
              onClick={() => setMulti('transmission', transmission)}
            />
          ))}
        </div>
      </FilterSection>

      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm backdrop-blur-sm transition hover:border-accent/40 hover:bg-accent/5">
        <div
          className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${
            get('delivery') === 'true' ? 'bg-accent' : 'bg-border'
          }`}
        >
          <div
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
              get('delivery') === 'true'
                ? 'translate-x-4'
                : 'translate-x-0.5'
            }`}
          />
          <input
            type="checkbox"
            checked={get('delivery') === 'true'}
            onChange={(e) =>
              setSingle('delivery', e.target.checked ? 'true' : '')
            }
            className="sr-only"
          />
        </div>
        <span className="text-sm text-foreground">
          {tFilters('delivery_available_only')}
        </span>
      </label>

      {activeCount > 0 && (
        <button
          onClick={clear}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-border/60 py-2.5 text-sm text-muted-foreground transition hover:border-red-400/60 hover:bg-red-500/5 hover:text-red-400"
        >
          <X size={14} className="transition group-hover:rotate-90" />
          {tFilters('clear_all_filters')}
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
            {activeCount}
          </span>
        </button>
      )}
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-accent/30 transition hover:scale-105 disabled:cursor-wait disabled:opacity-80 lg:hidden"
        disabled={isLoading || isPending}
      >
        <SlidersHorizontal size={15} />
        {tFilters('title')}
        {activeCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-accent">
            {activeCount}
          </span>
        )}
      </button>

      <aside className="sticky z-70 top-24 hidden w-72 shrink-0 lg:block max-h-[calc(100vh-10rem)] overflow-y-auto">
        
        <div className="relative rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl overflow-hidden">
          
          <div className="p-5">
            
            <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-accent/10 blur-2xl" />

            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground">
                  {tFilters('title')}
                </h2>
                {activeCount > 0 && (
                  <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                    {activeCount} {tFilters('active')}
                  </span>
                )}
              </div>

              {isLoading ? <FiltersPanelSkeleton /> : FiltersContent}
            </div>
          </div>
        </div>
      </aside>
      
      <AnimatePresence>
        {mobileOpen && !isLoading && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 25
              }}
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.18 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 700) {
                  setMobileOpen(false);
                }
              }}
              className="fixed bottom-0 left-0 right-0 z-80 max-h-[80vh] overflow-y-auto rounded-t-3xl border-t border-border/60 bg-background p-6 lg:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label={tFilters('title')}
                className="mx-auto mb-4 flex w-full cursor-grab justify-center py-2 active:cursor-grabbing"
                onPointerDown={(event) => dragControls.start(event)}
              >
                <span className="block h-1 w-10 rounded-full bg-border" />
              </button>

              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold">{tFilters('title')}</h2>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl border border-border/60 p-2 transition hover:bg-muted bg-red-200 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {FiltersContent}

              <div className="sticky bottom-0 mt-6 flex gap-3 bg-background pt-4">
                <button
                  type="button"
                  onClick={clear}
                  className="w-full rounded-2xl border border-border/60 py-3 text-sm transition hover:bg-muted"
                >
                  {tFilters('reset')}
                </button>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-full rounded-2xl bg-accent py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition hover:scale-[1.02]"
                >
                  {tFilters('show_results')}
                </button>
              </div>
            </motion.div>
          </>
        )}

      </AnimatePresence>
    </>
  );
}
