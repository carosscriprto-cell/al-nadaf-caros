'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';

import { useTenantContact } from '@/components/providers/TenantContactProvider';
import { cn } from '@/components/ui/utils';

const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
});

export type MapSectionMode = 'about' | 'contact';

type MapSectionProps = {
  // Kept for API compatibility with existing callers; the map is identical for
  // both (a single tenant location), so it's no longer used.
  mode?: MapSectionMode;
  className?: string;
};

export default function MapSection({ className }: MapSectionProps) {
  const locale = useLocale();
  const contact = useTenantContact();
  const center = contact.mapCenter;

  // No tenant location set → render no map at all. The old platform fallback
  // (Netherlands coverage cities + markers) has been removed entirely.
  if (!center) return null;

  const address = locale === 'ar' ? contact.addressAr : contact.addressEn;
  const label = locale === 'ar' ? 'موقعنا' : 'Our location';

  return (
    <div
      className={cn(
        'relative mt-16 overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 backdrop-blur-xl',
        className
      )}
    >
      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-primary/10 z-10 pointer-events-none" />

      {/* Map — single marker at the tenant's location */}
      <div className="relative z-0">
        <MapClient center={center} label={address} />
      </div>

      {/* Floating Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="absolute bottom-6 left-1/2 z-20 w-[90%] max-w-3xl -translate-x-1/2 rounded-2xl border border-border/60 bg-background/70 p-4 text-center backdrop-blur-xl md:w-auto"
      >
        <p className="text-sm text-muted-foreground">{label}</p>
        {address && <p className="mt-1 font-semibold text-foreground">{address}</p>}
      </motion.div>
    </div>
  );
}
