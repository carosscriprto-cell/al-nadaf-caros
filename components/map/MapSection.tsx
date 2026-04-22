'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';

import { siteConfig, type LocaleCode } from '@/config/site';
import { cn } from '@/components/ui/utils';

const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
});

export type MapSectionMode = 'about' | 'contact';

type MapSectionProps = {
  mode?: MapSectionMode;
  className?: string;
};

export default function MapSection({
  mode = 'about',
  className,
}: MapSectionProps) {
  const locale = useLocale() as LocaleCode;
  const t = useTranslations(mode);
  const coverageCities = siteConfig.map.coverageCities.map(
    (city) => city.name[locale]
  );
  const helperText = t('map_section.description', {
    country: siteConfig.map.country[locale],
  });
  const details =
    mode === 'contact'
      ? siteConfig.contact.address.localized[locale].full
      : coverageCities.join(' • ');

  return (
    <div
      className={cn(
        'relative mt-16 overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 backdrop-blur-xl',
        className
      )}
    >
      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-primary/10 z-10 pointer-events-none" />

      {/* Map */}
      <div className="relative z-0">
        <MapClient />
      </div>

      {/* Floating Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="absolute bottom-6 left-1/2 z-20 w-[90%] max-w-3xl -translate-x-1/2 rounded-2xl border border-border/60 bg-background/70 p-4 text-center backdrop-blur-xl md:w-auto"
      >
        <p className="text-sm text-muted-foreground">
          {helperText}
        </p>

        <p className="mt-1 font-semibold text-foreground">
          {details}
        </p>
      </motion.div>
    </div>
  );
}
