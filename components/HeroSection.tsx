'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Car, Shield, Clock } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { cars } from '@/data/cars';
import HomeVehicleSearchForm from './HomeVehicleSearchForm';

const HeroSection = () => {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden rounded-4xl text-white">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden rounded-4xl pointer-events-none">
        <Image
          src="/hero-bg.png"
          alt="hero"
          fill
          priority
          sizes="100vw"
          className="object-cover object-bottom rounded-4xl"
        />
        <div className="absolute inset-0 rounded-4xl bg-black/70" />
      </div>

      {/* Content */}
      <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 2xl:py-12">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 lg:pt-8"
          >
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
              >
                <span className="text-accent">{t('hero.welcome')}</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="max-w-lg text-xl text-blue-100"
              >
                {t('hero.description')}
              </motion.p>
            </div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-3"
            >
              <div className="flex items-center gap-3">
                <Car className="h-6 w-6 text-accent" />
                <span className="text-sm">{t('hero.premium_fleet')}</span>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-accent" />
                <span className="text-sm">{t('hero.safe_secure')}</span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-accent" />
                <span className="text-sm">{t('hero.service_247')}</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
           <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col gap-4 sm:flex-row sm:gap-6"
            >
              <Link
                href={`/${locale}/rental`}
                className="flex items-center justify-center gap-3 rounded-xl bg-accent px-8 py-4 font-semibold text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-accent/90 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2"
              >
                <span>{t('hero.explore_rentals')}</span>
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                href={`/${locale}/sales`}
                className="inline-flex items-center justify-center gap-3 rounded-xl border border-border bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-background hover:text-accent hover:scale-105"
              >
                {t('hero.explore_sales')}
                <ArrowRight className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity duration-200" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Side - Vehicle Search Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative lg:sticky lg:top-8"
          >
            <div className="mx-auto">
              <HomeVehicleSearchForm cars={cars} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
