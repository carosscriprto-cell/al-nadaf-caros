'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import HeroTrustStrip from './HeroTrustStrip';
import HeroSearchPanel from './HeroSearchPanel';
import HeroBackgroundCars from './HeroBackgroundCars';
import { useTenantContent } from '@/components/providers/TenantContentProvider';
import { useTenantFeatures } from '@/components/providers/TenantFeaturesProvider';
import type { Car, CarContentMap } from '@/types/vehicles';

// ─── Animation ──────────────────────────────────────────────────────────────
// One restrained entrance curve, staggered top→bottom. Reduced-motion users get
// the final state with no travel (initial=false).

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay },
  }),
};

// ─── Component ──────────────────────────────────────────────────────────────

type HeroSectionProps = {
  cars: Car[];
  contentAr?: CarContentMap;
  contentEn?: CarContentMap;
  showTypeFilter?: boolean;
};

export default function HeroSection({ cars, contentAr, contentEn, showTypeFilter = true }: HeroSectionProps) {
  const t = useTranslations();
  const locale = useLocale();
  const prefersReduced = useReducedMotion();
  const initial = prefersReduced ? false : 'hidden';

  // Per-tenant headline override → i18n fallback (each field independent). When
  // `headline` is unset the original two-line i18n title (with accent on line 2)
  // renders unchanged, so an empty tenants.content looks identical to before.
  const hero = useTenantContent().hero[locale === 'ar' ? 'ar' : 'en'];
  const features = useTenantFeatures();

  // Type-aware DEFAULT subheadline (same mechanism as HowItWorks): sale-only →
  // sale framing, rental-only → rental framing, hybrid (or neither) → generic.
  // A tenant's content override (hero.subheadline) always wins.
  const variant =
    features.enableSellCar && !features.enableRental
      ? 'sale'
      : features.enableRental && !features.enableSellCar
        ? 'rental'
        : null;

  const badge = hero.badge || t('hero.badge');
  const subheadline =
    hero.subheadline || t(variant ? `hero.${variant}.description` : 'hero.description');

  // Two-line headline: per-line override → i18n default. line2 is the accent line.
  // An empty override renders the exact i18n two-line title as before.
  const headlineLine1 = hero.headline?.line1 || t('hero.title_line_1');
  const headlineLine2 = hero.headline?.line2 || t('hero.title_line_2');

  return (
    <section
      aria-label={t('hero.section_label', { defaultValue: 'Vehicle showroom' })}
      className="relative isolate "
    >
      {/* ── Background — two showroom cars bleeding in from the edges over a
          single accent wash. RTL-aware, white-label, graceful fallback when the
          asset is missing (gradient only). See HeroBackgroundCars. */}
      <HeroBackgroundCars />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="mx-auto flex min-h-[88svh] max-w-5xl flex-col justify-center px-4 pb-28 pt-16 sm:px-6 sm:pb-32 sm:pt-14 lg:px-8">
        {/* Kicker — tiny tracked label against the big display headline */}
        <motion.div
          className="flex items-center justify-center gap-2.5"
          variants={fadeUp}
          initial={initial}
          animate="visible"
          custom={0}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
          <span className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {badge}
          </span>
        </motion.div>

        {/* Headline — the signature: Space Grotesk display face, oversized,
            confident, with a brand-accent emphasis on the second phrase */}
        <motion.div
          className="mt-8 text-center sm:mt-10"
          variants={fadeUp}
          initial={initial}
          animate="visible"
          custom={0.08}
        >
          <h1 className="mx-auto max-w-4xl text-balance font-heading text-[clamp(2.75rem,8vw,5.75rem)] font-semibold leading-[1.0] tracking-[-0.02em] text-foreground">
            {headlineLine1}{' '}
            <span className="text-accent-strong">{headlineLine2}</span>
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {subheadline}
          </p>
        </motion.div>

        {/* Search — the functional hero / visual anchor */}
        <motion.div
          className="mt-14 sm:mt-16"
          variants={fadeUp}
          initial={initial}
          animate="visible"
          custom={0.2}
        >
          <HeroSearchPanel cars={cars} contentAr={contentAr} contentEn={contentEn} showTypeFilter={showTypeFilter} />
        </motion.div>

        {/* Trust — quiet reassurance line */}
        <motion.div
          className="mt-12 sm:mt-14"
          variants={fadeUp}
          initial={initial}
          animate="visible"
          custom={0.32}
        >
          <HeroTrustStrip />
        </motion.div>
      </div>
    </section>
  );
}
