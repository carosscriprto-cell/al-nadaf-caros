'use client';

import { motion, type Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';
import HeroTrustBar from '../hero/HeroTrustBar';
import HeroSearchPanel from '../hero/HeroSearchPanel';
import type { Car, CarContentMap } from '@/types/vehicles';

// ─── Animation variants ─────────────────────────────────────────────────────
// Restrained, refined entrance — small travel, soft easing. No flash.

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
      delay,
    },
  }),
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const, delay },
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

  return (
    <section
      aria-label={t('hero.section_label', { defaultValue: 'Vehicle showroom' })}
      className="relative isolate"
    >
      {/* ── Background ───────────────────────────────────────────────────
          Clean token surface (no photo). Layers: a soft accent wash that
          carries the tenant brand colour (var(--color-accent) → white-label),
          a barely-there dot-grid for SaaS depth (theme-aware via currentColor),
          and a hairline that fades the hero into the next section. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-background">
        <div
          className="absolute inset-x-0 top-0 h-[520px] opacity-[0.08]"
          style={{
            background:
              'radial-gradient(60% 100% at 50% 0%, var(--color-accent) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 text-foreground opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            maskImage:
              'radial-gradient(ellipse 80% 60% at 50% 32%, #000 0%, transparent 78%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 80% 60% at 50% 32%, #000 0%, transparent 78%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-px bg-border" />
      </div>

      {/* ── Content — one column, centered. The search panel is the hero. ── */}
      <div className="mx-auto flex min-h-[82vh] max-w-5xl flex-col justify-center px-4 pb-20 pt-10 sm:px-6 sm:py-24 lg:px-8">
        {/* ── Brand badge ─────────────────────────────────────────── */}
        <motion.div
          className="flex justify-center"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            {t('hero.badge')}
          </span>
        </motion.div>

        {/* ── Headline ────────────────────────────────────────────── */}
        <motion.div
          className="mt-7 text-center"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.08}
        >
          <h1 className="mx-auto max-w-3xl text-balance text-[clamp(2.75rem,6vw,5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground">
            {t('hero.title_line_1')}
            <br />
            <span className="text-muted-foreground">{t('hero.title_line_2')}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {t('hero.description')}
          </p>
        </motion.div>

        {/* ── Search — full width, its natural rich layout ────────── */}
        <motion.div
          className="mt-12"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.18}
        >
          <HeroSearchPanel cars={cars} contentAr={contentAr} contentEn={contentEn} showTypeFilter={showTypeFilter} />
        </motion.div>

        {/* ── Trust bar ───────────────────────────────────────────── */}
        <motion.div
          className="mt-10"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={0.3}
        >
          <HeroTrustBar />
        </motion.div>
      </div>
    </section>
  );
}
