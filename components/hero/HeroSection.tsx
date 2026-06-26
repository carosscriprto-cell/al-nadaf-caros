'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import HeroTrustStrip from './HeroTrustStrip';
import HeroSearchPanel from './HeroSearchPanel';
import { useTenantContent } from '@/components/providers/TenantContentProvider';
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
  const badge = hero.badge || t('hero.badge');
  const subheadline = hero.subheadline || t('hero.description');

  return (
    <section
      aria-label={t('hero.section_label', { defaultValue: 'Vehicle showroom' })}
      className="relative isolate overflow-hidden"
    >
      {/* ── Background — one cohesive brand glow ──────────────────────────
          The boldness here is the typography, so the backdrop stays disciplined:
          a single soft radial of the tenant accent (var(--color-accent) →
          white-label) from the top, plus a quiet settle into the next section.
          Low opacity throughout so it never competes with the panel. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-background">
        <div
          className="absolute inset-x-0 top-0 h-[70vh] opacity-[0.10]"
          style={{
            background:
              'radial-gradient(75% 55% at 50% 0%, var(--color-accent) 0%, transparent 62%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-border" />
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="mx-auto flex min-h-[88svh] max-w-5xl flex-col justify-center px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
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
          className="mt-6 text-center"
          variants={fadeUp}
          initial={initial}
          animate="visible"
          custom={0.08}
        >
          <h1 className="mx-auto max-w-4xl text-balance font-heading text-[clamp(2.75rem,8vw,5.75rem)] font-semibold leading-[1.0] tracking-[-0.02em] text-foreground">
            {hero.headline ? (
              hero.headline
            ) : (
              <>
                {t('hero.title_line_1')}{' '}
                <span className="text-accent-strong">{t('hero.title_line_2')}</span>
              </>
            )}
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {subheadline}
          </p>
        </motion.div>

        {/* Search — the functional hero / visual anchor */}
        <motion.div
          className="mt-12"
          variants={fadeUp}
          initial={initial}
          animate="visible"
          custom={0.2}
        >
          <HeroSearchPanel cars={cars} contentAr={contentAr} contentEn={contentEn} showTypeFilter={showTypeFilter} />
        </motion.div>

        {/* Trust — quiet reassurance line */}
        <motion.div
          className="mt-10"
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
