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
import useDebouncedValue from '@/hooks/useDebouncedValue';
import { FiltersPanelSkeleton } from '@/components/skeletons/PageSkeletons';
import { useLocale, useTranslations } from 'next-intl';
import * as Slider from '@radix-ui/react-slider';
import {
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X,
  Search,
} from 'lucide-react';
import {
  motion,
  AnimatePresence,
  useDragControls,
} from 'framer-motion';

// Architecture doc § 3.2 — single 'both' guard
import { matchesListingType } from '@/lib/vehicles/listingType';
// Architecture doc § 3.3 — single-pass option derivation
import { deriveVehicleOptions } from '@/lib/vehicles/options';
// Architecture doc § 5 — FilterSelect in its own file

import { Car } from '@/types/vehicles';
import { FilterSelect } from './hero/FilterSelecte';

// ─── Local types ─────────────────────────────────────────────────────────────

type ListingPageType = 'rent' | 'sale' | 'all';

type Props = {
  cars: Car[];
  type: ListingPageType;
  isLoading?: boolean;
};

type PriceRange = [number, number];

// ─── Constants ────────────────────────────────────────────────────────────────

const TRANSMISSION_OPTIONS: Car['transmission'][] = ['automatic', 'manual'];

// ─── Pure helpers (no React) ──────────────────────────────────────────────────

function clampPriceRange(range: PriceRange, maxPrice: number): PriceRange {
  const safeMin = Math.max(0, Math.min(range[0], maxPrice));
  const safeMax = Math.max(safeMin, Math.min(range[1], maxPrice));
  return [safeMin, safeMax];
}

function areRangesEqual(a: PriceRange, b: PriceRange) {
  return a[0] === b[0] && a[1] === b[1];
}

function roundToStep(value: number, step: number) {
  return Math.round(value / step) * step;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
        onClick={() => setOpen((v) => !v)}
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

// ─── Main component ───────────────────────────────────────────────────────────

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

  // ── Architecture doc § 3.2: matchesListingType replaces inline 'both' guard ──
  const scopedCars = useMemo(
    () => cars.filter((car) => matchesListingType(car, type)),
    [cars, type]
  );

  // ── Architecture doc § 3.3: single-pass option derivation ────────────────────
  // Replaces: brands, categories, classes, fuelTypes, conditions,
  //           seatsOptions, priceValues — 7 separate useMemo iterations.
  const options = useMemo(
    () => deriveVehicleOptions(scopedCars, type),
    [scopedCars, type]
  );

  const maxPrice = options.priceMax;

  // ── URL param helpers ─────────────────────────────────────────────────────────

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

  // ── Price range state ─────────────────────────────────────────────────────────

  const urlSearch = get('search');
  const urlMin = Number(get('minPrice')) || 0;
  const urlMax = Number(get('maxPrice')) || maxPrice;
  const normalizedUrlPriceRange = useMemo(
    () => clampPriceRange([urlMin, urlMax], maxPrice),
    [urlMin, urlMax, maxPrice]
  );

  const [search, setSearch] = useState(urlSearch);
  const [priceRange, setPriceRange] = useState<PriceRange>(normalizedUrlPriceRange);
  const debouncedSearch = useDebouncedValue(search, 350);
  const lastCommittedSearchRef = useRef(urlSearch);

  useEffect(() => {
    if (urlSearch === lastCommittedSearchRef.current) return;
    lastCommittedSearchRef.current = urlSearch;
    setSearch(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    setPriceRange((current) =>
      areRangesEqual(current, normalizedUrlPriceRange)
        ? current
        : normalizedUrlPriceRange
    );
  }, [normalizedUrlPriceRange]);

  // ── URL param updaters ────────────────────────────────────────────────────────

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
    [pathname, router, searchParamsString]
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
    (key: string, value: string) =>
      updateParams((d) => {
        if (!value) d.delete(key);
        else d.set(key, value);
      }),
    [updateParams]
  );

  const setMulti = useCallback(
    (key: string, value: string) =>
      updateParams((d) => {
        const current = (d.get(key) || '').split(',').filter(Boolean);
        const next = current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value];
        if (!next.length) d.delete(key);
        else d.set(key, next.join(','));
      }),
    [updateParams]
  );

  const commitPriceRange = useCallback(
    (nextRange: PriceRange) => {
      const [minValue, maxValue] = clampPriceRange(nextRange, maxPrice);
      updateParams((d) => {
        if (minValue <= 0) d.delete('minPrice');
        else d.set('minPrice', String(minValue));
        if (maxValue >= maxPrice) d.delete('maxPrice');
        else d.set('maxPrice', String(maxValue));
      });
    },
    [maxPrice, updateParams]
  );

  useEffect(() => {
    if (debouncedSearch === lastCommittedSearchRef.current) return;
    lastCommittedSearchRef.current = debouncedSearch;
    setSingle('search', debouncedSearch);
  }, [debouncedSearch, setSingle]);

  const clear = useCallback(() => {
    setSearch('');
    lastCommittedSearchRef.current = '';
    setPriceRange([0, maxPrice]);
    startTransition(() => router.replace(pathname, { scroll: false }));
  }, [maxPrice, pathname, router]);

  // ── Body scroll lock when mobile drawer open ──────────────────────────────────

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

  // ── Active filter count ───────────────────────────────────────────────────────

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

  // ── Price input helpers ───────────────────────────────────────────────────────

  const handleMinInputChange = useCallback(
    (value: string) => {
      const next = value === '' ? 0 : Number(value);
      if (!Number.isNaN(next))
        setPriceRange((c) => clampPriceRange([next, c[1]], maxPrice));
    },
    [maxPrice]
  );

  const handleMaxInputChange = useCallback(
    (value: string) => {
      const next = value === '' ? maxPrice : Number(value);
      if (!Number.isNaN(next))
        setPriceRange((c) => clampPriceRange([c[0], next], maxPrice));
    },
    [maxPrice]
  );

  const handlePriceInputCommit = useCallback(
    () => commitPriceRange(priceRange),
    [commitPriceRange, priceRange]
  );

  // ── i18n label helpers (kept — they use translation keys, not formatOptionLabel) ──

  const getCategoryLabel = useCallback(
    (category: Car['category']) => tCar(`detail.enums.category.${category}`),
    [tCar]
  );
  const getTransmissionLabel = useCallback(
    (transmission: Car['transmission']) =>
      tCar(`detail.enums.transmission.${transmission}`),
    [tCar]
  );
  const getFuelTypeLabel = useCallback(
    (fuelType: Car['fuelType']) => tCar(`detail.enums.fuelType.${fuelType}`),
    [tCar]
  );
  const getConditionLabel = useCallback(
    (condition: Car['condition']) => tCar(`detail.enums.condition.${condition}`),
    [tCar]
  );
  const getClassLabel = useCallback(
    (carClass: Car['class']) => tCar(`detail.enums.class.${carClass}`),
    [tCar]
  );

  // ── Price slider config ───────────────────────────────────────────────────────

  const step = type === 'rent' ? 5 : 500;
  const normalizedMaxPrice = useMemo(
    () => Math.ceil(maxPrice / step) * step,
    [maxPrice, step]
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Filters content (shared between desktop sidebar and mobile drawer)
  // ─────────────────────────────────────────────────────────────────────────────

  const FiltersContent = (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tFilters('search_placeholder')}
          className="w-full rounded-2xl border border-border/60 bg-card/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 backdrop-blur-sm outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
        />
        {!search ? (
          <span
            className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${
              locale === 'ar' ? 'left-3' : 'right-3'
            }`}
          >
            <Search size={14} />
          </span>
        ) : (
          <button
            onClick={() => {
              setSearch('');
              lastCommittedSearchRef.current = '';
              setSingle('search', '');
            }}
            className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground ${
              locale === 'ar' ? 'left-3' : 'right-3'
            }`}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Price range */}
      <FilterSection
        title={type === 'sale' ? tFilters('price_range') : tFilters('daily_price')}
        defaultOpen
      >
        <div className="space-y-4 px-1">
          <Slider.Root
            min={0}
            max={normalizedMaxPrice}
            step={step}
            value={priceRange}
            onValueChange={([min, max]) =>
              setPriceRange([roundToStep(min, step), roundToStep(max, step)])
            }
            onValueCommit={([min, max]) =>
              commitPriceRange([roundToStep(min, step), roundToStep(max, step)])
            }
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
            <span className="rounded-lg border border-border/40 bg-card/80 px-2 py-1">
              {priceRange[0].toLocaleString()}
            </span>
            <span className="rounded-lg border border-border/40 bg-card/80 px-2 py-1">
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
              onKeyDown={(e) => e.key === 'Enter' && handlePriceInputCommit()}
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
              onKeyDown={(e) => e.key === 'Enter' && handlePriceInputCommit()}
              placeholder={tFilters('max')}
              className="w-full rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>
      </FilterSection>

      {/* Details (condition, fuel, class, seats) — options from deriveVehicleOptions */}
      <FilterSection title={tFilters('details')}>
        <div className="grid grid-cols-2 gap-3">
          <FilterSelect
            label={tCar('detail.labels.condition')}
            value={get('condition')}
            onChange={(v) => setSingle('condition', v)}
            options={options.conditionOptions.map((o) => ({
              value: o.value,
              label: getConditionLabel(o.value as Car['condition']),
            }))}
            anyLabel={tFilters('any')}
          />
          <FilterSelect
            label={tFilters('fuel')}
            value={get('fuelType')}
            onChange={(v) => setSingle('fuelType', v)}
            options={options.fuelTypeOptions.map((o) => ({
              value: o.value,
              label: getFuelTypeLabel(o.value as Car['fuelType']),
            }))}
            anyLabel={tFilters('any')}
          />
          <FilterSelect
            label={tCar('detail.labels.class')}
            value={get('class')}
            onChange={(v) => setSingle('class', v)}
            options={options.classOptions.map((o) => ({
              value: o.value,
              label: getClassLabel(o.value as Car['class']),
            }))}
            anyLabel={tFilters('any')}
          />
          <FilterSelect
            label={tFilters('seats')}
            value={get('seats')}
            onChange={(v) => setSingle('seats', v)}
            options={options.seatsOptions.map((o) => ({
              value: o.value,
              label: `${o.value}+ ${tFilters('seats_label')}`,
            }))}
            anyLabel={tFilters('any')}
          />
        </div>
      </FilterSection>

      {/* Category chips */}
      <FilterSection title={tFilters('category')}>
        <div className="flex flex-wrap gap-2">
          {options.categoryOptions.map((o) => (
            <Chip
              key={o.value}
              label={getCategoryLabel(o.value as Car['category'])}
              active={selectedCategory.includes(o.value)}
              onClick={() => setMulti('category', o.value)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Brand chips */}
      <FilterSection title={tFilters('brand')}>
        <div className="flex flex-wrap gap-2">
          {options.brandOptions.map((o) => (
            <Chip
              key={o.value}
              label={o.label}
              active={selectedBrand.includes(o.value)}
              onClick={() => setMulti('brand', o.value)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Transmission chips */}
      <FilterSection title={tFilters('transmission')}>
        <div className="flex gap-2">
          {TRANSMISSION_OPTIONS.map((t) => (
            <Chip
              key={t}
              label={getTransmissionLabel(t)}
              active={selectedTransmission.includes(t)}
              onClick={() => setMulti('transmission', t)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Delivery toggle */}
      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm backdrop-blur-sm transition hover:border-accent/40 hover:bg-accent/5">
        <div
          className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${
            get('delivery') === 'true' ? 'bg-accent' : 'bg-border'
          }`}
        >
          <div
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
              get('delivery') === 'true' ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
          <input
            type="checkbox"
            checked={get('delivery') === 'true'}
            onChange={(e) => setSingle('delivery', e.target.checked ? 'true' : '')}
            className="sr-only"
          />
        </div>
        <span className="text-sm text-foreground">
          {tFilters('delivery_available_only')}
        </span>
      </label>

      {/* Clear all */}
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Mobile trigger button */}
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

      {/* Desktop sidebar */}
      <aside className="sticky top-24 z-[70] hidden w-72 shrink-0 lg:block max-h-[calc(100vh-10rem)] overflow-y-auto">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl">
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

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && !isLoading && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
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
              className="fixed bottom-0 left-0 right-0 z-[80] max-h-[80vh] overflow-y-auto rounded-t-3xl border-t border-border/60 bg-background p-6 lg:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label={tFilters('title')}
                className="mx-auto mb-4 flex w-full cursor-grab justify-center py-2 active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
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