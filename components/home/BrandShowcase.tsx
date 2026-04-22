'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { cars } from '@/data/cars';
import Image from 'next/image';
import HeadSection from '../HeadSection';

// 🔹 Logos
const getBrandLogo = (brand: string) => `/brands/${brand}.png`;

const BrandShowcase = () => {
  const locale = useLocale();
  const t = useTranslations('')

  const brands = Object.entries(
    cars.reduce((acc, car) => {
      acc[car.brand] = (acc[car.brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-7xl px-4">

        <HeadSection
          title={t('brand-section.brand-title')}
          description={t('brand-section.brand-subtitle')}
          divider={true}
        />


        {/* 🔥 Grid */}
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7"> 
          {brands.slice(0,7).map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              viewport={{ once: true }}
              className={index >= 6 ? 'hidden sm:block' : ''}
            >
              <Link
                href={`/${locale}/fleet?brand=${brand.name}`}
                className="group relative flex h-full flex-col items-center rounded-3xl border border-border/60 bg-card/80 p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-accent/30 hover:shadow-2xl"
              >
                {/* Glow */}
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-accent/20" />

                {/* 🔥 Count Badge */}
                <div className="absolute right-3 top-3 rounded-full bg-muted/70 px-2 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur transition group-hover:bg-accent group-hover:text-white">
                  {brand.count}
                </div>

                {/* Logo */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative h-14 w-14 overflow-hidden flex items-center justify-center">
                    <Image
                      src={getBrandLogo(brand.name)}
                      alt={brand.name}
                      fill
                      className="object-contain grayscale group-hover:grayscale-0 transition"
                    />
                  </div>
                </div>

                {/* Name */}
                <div className="mt-auto text-center">
                  <p className="text-sm capitalize pt-2 font-semibold text-muted-foreground group-hover:text-accent transition">
                    {brand.name.replace('-', ' ')}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BrandShowcase;