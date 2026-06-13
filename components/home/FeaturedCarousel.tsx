'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { useTranslations } from 'next-intl';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

import CarCard from '@/components/CarCard';
import CarCardSkeleton from '@/components/skeletons/CarCardSkeleton';
import HeadSection from '../HeadSection';
import type { Car, CarContentMap } from '@/types/vehicles';

type FeaturedTab = 'featured' | 'rent' | 'sale' | 'new';

const TABS = [
  { id: 'featured', label: 'featured'  },
  { id: 'rent',     label: 'for_rent'  },
  { id: 'sale',     label: 'for_sale'  },
  { id: 'new',      label: 'new'       },
] as const;

type Props = {
  cars:       Car[];
  contentMap: CarContentMap;
  locale:     string;
};

const UI_LOADING_DELAY = 300;

export default function FeaturedCarousel({ cars, contentMap, locale }: Props) {
  const tb = useTranslations('buttons');
  const tf = useTranslations('filters');
  const t  = useTranslations('');

  const [activeTab,     setActiveTab]     = useState<FeaturedTab>('featured');
  const [isLoading,     setIsLoading]     = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount,     setSnapCount]     = useState(0);
  const loadingRef = useRef<number | null>(null);

  // فلترة السيارات حسب الـ tab — من الـ props مباشرة
  const filteredCars = useMemo(() => {
    switch (activeTab) {
      case 'featured':
        return cars.filter(c => c.isFeatured).slice(0, 6);
      case 'rent':
        return cars
          .filter(c => c.listingType === 'rent' || c.listingType === 'both')
          .slice(0, 6);
      case 'sale':
        return cars
          .filter(c => c.listingType === 'sale' || c.listingType === 'both')
          .slice(0, 6);
      case 'new':
        return cars.filter(c => c.isNewArrival).slice(0, 6);
    }
  }, [cars, activeTab]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align:     'start',
    direction: locale === 'ar' ? 'rtl' : 'ltr',
  });

  const triggerLoading = useCallback(() => {
    if (loadingRef.current) clearTimeout(loadingRef.current);
    setIsLoading(true);
    loadingRef.current = window.setTimeout(() => {
      setIsLoading(false);
    }, UI_LOADING_DELAY);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setSnapCount(emblaApi.scrollSnapList().length);
    };
    emblaApi.on('select', update);
    emblaApi.on('reInit', update);
    update();
    return () => {
      emblaApi.off('select', update);
      emblaApi.off('reInit', update);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    emblaApi.scrollTo(0);
    setSelectedIndex(0);
  }, [activeTab, emblaApi]);

  const handleTabChange = (tab: FeaturedTab) => {
    if (tab === activeTab) return;
    triggerLoading();
    setActiveTab(tab);
  };

  return (
    <section className="relative overflow-hidden bg-background py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HeadSection
          title={t('featured-section.featured-title')}
          description={t('featured-section.featured-subtitle')}
          divider
        />

        <div className="mb-2 flex items-center justify-between">
          <div className="flex flex-wrap gap-2 border-b border-border/40 rounded-xl p-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'border-accent bg-accent text-white shadow-md shadow-accent/20'
                      : 'border-border/60 bg-card/60 text-muted-foreground hover:border-accent/40 hover:text-foreground'
                  }`}
                >
                  {tf(tab.label)}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/60 backdrop-blur-sm transition hover:border-accent/40 hover:bg-accent hover:text-white"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/60 backdrop-blur-sm transition hover:border-accent/40 hover:bg-accent hover:text-white"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl" ref={emblaRef}>
          <div className="flex items-center py-1.5">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="pl-4 w-full md:w-1/2 lg:w-1/3 shrink-0">
                    <CarCardSkeleton />
                  </div>
                ))
              : filteredCars.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="pl-4 w-full md:w-1/2 lg:w-1/3 shrink-0"
                  >
                    <CarCard
                      car={car}
                      content={contentMap[car.slug]}
                      imagePriority={index < 3}
                    />
                  </motion.div>
                ))}
          </div>
        </div>

        {!isLoading && (
          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: snapCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === selectedIndex
                    ? 'w-8 bg-accent'
                    : 'w-2.5 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Link
            href={`/${locale}/fleet`}
            className="group inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition hover:scale-105"
          >
            {tb('explore_all')}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}