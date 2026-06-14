'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Zap, Gauge, Users } from 'lucide-react';
import { useLocale } from 'next-intl';

import type { Car } from '@/types/vehicles';

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Select up to 3 spotlight vehicles: prefer featured/popular/bestSeller */
function selectSpotlightCars(inventory: Car[]): Car[] {
  const priority = inventory.filter(
    (c) => c.available && (c.isFeatured || c.isPopular || c.isBestSeller),
  );
  const fallback = inventory.filter(
    (c) => c.available && !c.isFeatured && !c.isPopular && !c.isBestSeller,
  );
  return [...priority, ...fallback].slice(0, 3);
}

function getSpotlightPrice(car: Car): { label: string; value: string } {
  if (
    (car.listingType === 'sale' || car.listingType === 'both') &&
    car.pricing.total
  ) {
    return {
      label: 'From',
      value: `$${car.pricing.total.toLocaleString()}`,
    };
  }
  if (
    (car.listingType === 'rent' || car.listingType === 'both') &&
    car.pricing.daily
  ) {
    return {
      label: 'From',
      value: `$${car.pricing.daily.toLocaleString()}/day`,
    };
  }
  return { label: '', value: 'Price on Request' };
}

function getConditionLabel(condition: Car['condition']): string {
  const map: Record<Car['condition'], string> = {
    new: 'New',
    used: 'Pre-owned',
    certified: 'Certified',
  };
  return map[condition];
}

// ─── Animation variants ───────────────────────────────────────────────────

// Defined outside the component so the object reference is stable.
// `as const` on the ease tuple narrows number[] → readonly [number,number,number,number],
// which satisfies Framer Motion's BezierDefinition type.
const slideVariants: Variants = {
  enter: (d: number) => ({
    x: d > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: (d: number) => ({
    x: d > 0 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeIn' as const },
  }),
};

// ─── Sub-components ───────────────────────────────────────────────────────

function SpotlightStat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="
          flex h-8 w-8 shrink-0 items-center justify-center
          rounded-full
          border border-white/10
          bg-white/6
          backdrop-blur-sm
        "
      >
        <Icon size={14} className="text-white/70" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{value}</p>
        <p className="text-[11px] text-white/50">{label}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────

type HeroSpotlightProps = {
  cars: Car[];
};

export default function HeroSpotlight({ cars }: HeroSpotlightProps) {
  const locale = useLocale();


  const spotlightCars = useMemo(() => selectSpotlightCars(cars), [cars]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const car = spotlightCars[activeIndex];

  if (!car) return null;

  const price = getSpotlightPrice(car);

  function navigate(dir: 1 | -1) {
    setDirection(dir);
    setActiveIndex(
      (prev) => (prev + dir + spotlightCars.length) % spotlightCars.length,
    );
  }

  return (
    <div
      className="
        relative mx-auto max-w-5xl
        overflow-hidden
        rounded-[24px]
        border border-white/8
        bg-white/[0.04]
        backdrop-blur-sm
      "
      aria-label="Featured vehicle spotlight"
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={car.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="grid grid-cols-1 lg:grid-cols-[1fr_420px]"
        >
          {/* ── Left: Vehicle image ──────────────────────────────────── */}
          <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[360px]">
            <Image
              src={car.thumbnail || car.images?.[0]}
              alt={`${car.brand} ${car.model}${car.trim ? ` ${car.trim}` : ''}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover transition-transform duration-700"
            />

            {/* Gradient fade to content panel on desktop */}
            <div
              className="
                absolute inset-0
                bg-gradient-to-t from-black/60 via-transparent to-transparent
                lg:bg-gradient-to-r lg:from-transparent lg:to-black/30
              "
            />

            {/* Condition badge */}
            <div className="absolute left-4 top-4">
              <span
                className="
                  inline-flex items-center gap-1.5
                  rounded-full
                  border border-white/14
                  bg-black/40
                  px-3 py-1
                  text-[10px] font-semibold
                  uppercase tracking-[0.18em]
                  text-white/85
                  backdrop-blur-xl
                "
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    car.condition === 'new'
                      ? 'bg-emerald-400'
                      : car.condition === 'certified'
                        ? 'bg-sky-400'
                        : 'bg-white/50'
                  }`}
                  aria-hidden="true"
                />
                {getConditionLabel(car.condition)}
              </span>
            </div>

            {/* Year badge */}
            <div className="absolute right-4 top-4">
              <span
                className="
                  rounded-full
                  border border-white/12
                  bg-black/35
                  px-3 py-1
                  text-[11px] font-semibold
                  text-white/80
                  backdrop-blur-xl
                "
              >
                {car.year}
              </span>
            </div>

            {/* Dot navigation — only on mobile/tablet */}
            {spotlightCars.length > 1 && (
              <div
                className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 lg:hidden"
                role="tablist"
                aria-label="Spotlight navigation"
              >
                {spotlightCars.map((_, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={i === activeIndex}
                    aria-label={`Vehicle ${i + 1}`}
                    onClick={() => {
                      setDirection(i > activeIndex ? 1 : -1);
                      setActiveIndex(i);
                    }}
                    className={`
                      h-1.5 rounded-full transition-all duration-300
                      ${i === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/35'}
                    `}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Vehicle details ───────────────────────────────── */}
          <div
            className="
              flex flex-col justify-between
              p-6
              lg:p-8
            "
          >
            <div>
              {/* Overline */}
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent/80">
                {car.class} · {car.category}
              </p>

              {/* Name */}
              <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-white lg:text-3xl">
                {car.brand} {car.model}
                {car.trim && (
                  <span className="text-white/60"> {car.trim}</span>
                )}
              </h2>

              {/* Stats row */}
              <div className="mt-5 flex flex-wrap gap-4">
                {car.horsepower && (
                  <SpotlightStat
                    icon={Zap}
                    value={`${car.horsepower} HP`}
                    label="Power"
                  />
                )}
                {car.topSpeed && (
                  <SpotlightStat
                    icon={Gauge}
                    value={`${car.topSpeed} km/h`}
                    label="Top Speed"
                  />
                )}
                {car.seats && (
                  <SpotlightStat
                    icon={Users}
                    value={`${car.seats} seats`}
                    label="Capacity"
                  />
                )}
              </div>

              {/* Divider */}
              <div className="mt-6 h-px bg-white/8" />

              {/* Price */}
              <div className="mt-5">
                {price.label && (
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">
                    {price.label}
                  </p>
                )}
                <p className="mt-0.5 text-2xl font-semibold text-white">
                  {price.value}
                </p>
                {car.pricing.negotiable && (
                  <p className="mt-0.5 text-xs text-white/40">
                    Price negotiable
                  </p>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-6 flex items-center gap-3">
              <Link
                href={`/${locale}/fleet/${car.slug}`}
                className="
                  group
                  flex flex-1 items-center justify-center gap-2
                  rounded-xl
                  bg-accent
                  px-5 py-3
                  text-sm font-semibold text-white
                  transition-all duration-200
                  hover:opacity-90
                  focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent
                "
              >
                Explore Vehicle
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>

              <Link
                href={`/${locale}/fleet`}
                className="
                  flex items-center justify-center
                  rounded-xl
                  border border-white/12
                  bg-white/6
                  px-4 py-3
                  text-sm font-medium text-white/80
                  transition-all duration-200
                  hover:border-white/20 hover:bg-white/10 hover:text-white
                  focus-visible:outline  focus-visible:outline-offset-2 focus-visible:outline-white/40
                "
                aria-label="View all inventory"
              >
                View All
              </Link>
            </div>

            {/* Desktop dot + arrow navigation */}
            {spotlightCars.length > 1 && (
              <div className="mt-5 hidden items-center justify-between lg:flex">
                <div
                  className="flex gap-1.5"
                  role="tablist"
                  aria-label="Spotlight navigation"
                >
                  {spotlightCars.map((_, i) => (
                    <button
                      key={i}
                      role="tab"
                      aria-selected={i === activeIndex}
                      aria-label={`Vehicle ${i + 1}`}
                      onClick={() => {
                        setDirection(i > activeIndex ? 1 : -1);
                        setActiveIndex(i);
                      }}
                      className={`
                        h-1 rounded-full transition-all duration-300
                        ${i === activeIndex ? 'w-5 bg-white' : 'w-2 bg-white/25 hover:bg-white/40'}
                      `}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(-1)}
                    aria-label="Previous vehicle"
                    className="
                      flex h-8 w-8 items-center justify-center
                      rounded-full
                      border border-white/10
                      bg-white/6
                      text-white/60
                      transition hover:border-white/20 hover:bg-white/12 hover:text-white
                      focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white/40
                    "
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    onClick={() => navigate(1)}
                    aria-label="Next vehicle"
                    className="
                      flex h-8 w-8 items-center justify-center
                      rounded-full
                      border border-white/10
                      bg-white/6
                      text-white/60
                      transition hover:border-white/20 hover:bg-white/12 hover:text-white
                      focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white/40
                    "
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}