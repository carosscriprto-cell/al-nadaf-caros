'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import CarCard from './CarCard';
import { cars } from '../data/cars';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const FleetSlider = () => {
  const t = useTranslations();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Responsive cards per view
  const getCardsPerView = () => {
    if (typeof window === 'undefined') return 3; // Default for SSR
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  };

  const [cardsPerView, setCardsPerView] = useState(3); // Start with default
  const totalCards = cars.length;
  const maxIndex = Math.max(0, totalCards - cardsPerView);

  // Handle client-side initialization
  useEffect(() => {
    setIsClient(true);
    setCardsPerView(getCardsPerView());
  }, []);

  // Handle responsive changes
  useEffect(() => {
    if (!isClient) return;

    const handleResize = () => {
      const newCardsPerView = getCardsPerView();
      setCardsPerView(newCardsPerView);
      setCurrentIndex(0); // Reset to first slide on resize
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || !isClient) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, maxIndex, isClient]);

  // Update arrow visibility
  useEffect(() => {
    setShowLeftArrow(currentIndex > 0);
    setShowRightArrow(currentIndex < maxIndex);
  }, [currentIndex, maxIndex]);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  return (
    <section className="py-20 bg-muted/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        {isClient ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('fleet.our_fleet')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('fleet.choose')}
            </p>
          </motion.div>
        ) : (
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('fleet.our_fleet')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('fleet.choose')}
            </p>
          </div>
        )}

        {/* Fleet Slider Container */}
        <div 
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Navigation Arrows - Outside the slider */}
          {isClient && showLeftArrow && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={prevSlide}
              className="absolute -left-16 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-background/95 backdrop-blur-md rounded-full shadow-lg border border-border flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="h-6 w-6" />
            </motion.button>
          )}

          {isClient && showRightArrow && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={nextSlide}
              className="absolute -right-16 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-background/95 backdrop-blur-md rounded-full shadow-lg border border-border flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="h-6 w-6" />
            </motion.button>
          )}

          {/* Slider Track */}
          <div className="overflow-hidden rounded-2xl">
            {isClient ? (
              <motion.div
                ref={sliderRef}
                className="flex gap-4 md:gap-6 transition-transform duration-700 ease-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`,
                }}
              >
                {cars.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex-shrink-0 px-2"
                    style={{ 
                      width: `calc(100% / ${cardsPerView})`,
                      minWidth: `calc(100% / ${cardsPerView})`
                    }}
                  >
                    <CarCard car={car} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="flex gap-4 md:gap-6">
                {cars.slice(0, 3).map((car) => (
                  <div key={car.id} className="flex-1 px-2">
                    <CarCard car={car} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dots Indicator */}
          {isClient && maxIndex > 0 && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: maxIndex + 1 }, (_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-accent scale-125'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        {isClient ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              href="/rental"
              className="inline-flex items-center px-8 py-4 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition-colors duration-200 shadow-lg hover:shadow-xl group"
            >
              <span>{t('fleet.view_all')}</span>
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </motion.div>
        ) : (
          <div className="text-center mt-12">
            <Link
              href="/rental"
              className="inline-flex items-center px-8 py-4 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition-colors duration-200 shadow-lg hover:shadow-xl group"
            >
              <span>{t('fleet.view_all')}</span>
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        )}
      </div>

      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-accent/3 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </section>
  );
};

export default FleetSlider; 