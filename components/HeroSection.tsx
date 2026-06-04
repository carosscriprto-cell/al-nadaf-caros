'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { getBlurDataURL } from '@/lib/image';

import HeroSearchBar from './hero/HeroSearchBar';
import HeroPopularSearches from './hero/HeroPopularSearches';

export default function HeroSection() {
  const t = useTranslations();

  return (
    <section className="relative rounded-[32px]">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden rounded-[32px]">
        <Image
          src="/hero-bg.png"
          alt="Luxury Vehicles"
          fill
          priority
          quality={80}
          sizes="100vw"
          placeholder="blur"
          blurDataURL={getBlurDataURL('#0f172a', '#111827')}
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
      </div>

      <div className="relative z-10">
        <div
          className="
            mx-auto
            flex
            min-h-[80vh]
            max-w-7xl
            flex-col
            justify-center
            px-4
            sm:px-6
            lg:min-h-[85vh]
            lg:px-8
          "
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto w-full max-w-5xl text-center"
          >
            {/* Badge */}
            <span
              className="
                inline-flex
                rounded-full
                border
                border-white/10
                bg-white/10
                px-4
                py-2
                text-xs
                font-medium
                uppercase
                tracking-[0.18em]
                text-white/80
                backdrop-blur-xl
              "
            >
              {t('hero.badge')}
            </span>

            {/* Title */}
            <h1
              className="
                mt-6
                text-4xl
                font-semibold
                leading-[1.05]
                tracking-tight
                text-white
                sm:text-5xl
                md:text-6xl
                lg:text-7xl
              "
            >
              {t('hero.title_line_1')}
              <br />
              <span className="text-white/90">
                {t('hero.title_line_2')}
              </span>
            </h1>

            {/* Description */}
            <p
              className="
                mx-auto
                mt-6
                max-w-2xl
                text-base
                leading-relaxed
                text-white/70
                md:text-lg
              "
            >
              {t('hero.description')}
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mx-auto mt-12 w-full max-w-6xl"
          >
            <HeroSearchBar />
          </motion.div>

          {/* Popular Searches */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-4"
          >
            <HeroPopularSearches />
          </motion.div>
        </div>
      </div>
    </section>
  );
}