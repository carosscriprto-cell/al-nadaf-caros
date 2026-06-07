'use client';

import { useRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { getBlurDataURL } from '@/lib/image';
import HeroTrustBar from './hero/HeroTrustBar';
import HeroSearchPanel from './hero/HeroSearchPanel';

// ─── Animation variants ────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      ease: [0.22, 1, 0.36, 1] as const,
      delay,
    },
  }),
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
      delay,
    },
  }),
};

// ─── Component ────────────────────────────────────────────────────────────

export default function HeroSection() {
  const t = useTranslations();
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      aria-label={t('hero.section_label', { defaultValue: 'Vehicle showroom' })}
      className="relative rounded-[32px]"
    >
      {/* ── Background ──────────────────────────────────────────────── */}
      {/* bg-[#0a0f1a] is a solid fallback so the section never flashes   */}
      {/* white while the hero image is loading on slow connections.       */}
      <div className="absolute inset-0 bg-background">
        <Image
          src="/hero-bg.webp"
          alt=""
          aria-hidden="true"
          fill
          priority
          quality={85}
          sizes="100vw"
          placeholder="blur"
          blurDataURL={getBlurDataURL('#0a0f1a', '#0d1220')}
          className="object-cover object-center"
        />
        {/* Base darkening overlay */}
        <div
          className="
          absolute inset-0
           bg-black/25
           dark:bg-black/55
          "
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.20) 100%)',
          }}
        />
        <div
          className="
            absolute inset-0
            bg-gradient-to-t
            from-black/35
            via-black/15
            to-transparent
          "
        />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background:
              'radial-gradient(circle at 50% 75%, rgba(212,175,55,0.18) 0%, transparent 45%)',
          }}
        />
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-7xl">
        <div
          className="
            flex min-h-[88vh] flex-col
            px-4 pb-10 
            sm:px-6 pt-8 
            lg:min-h-[90vh] lg:px-8
          "
        >
          {/* ── Brand badge ─────────────────────────────────── */}
          <motion.div
            className="flex justify-center"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <span
              className="
                inline-flex items-center gap-2
                rounded-full
                border border-white/12
                bg-white/8
                px-4 py-1.5
                text-[10px] font-semibold
                uppercase tracking-[0.22em]
                text-white/70
                backdrop-blur-xl
              "
            >
              <span
                className="h-1 w-1 rounded-full bg-accent"
                aria-hidden="true"
              />
              {t('hero.badge')}
            </span>
          </motion.div>

          {/* ── Headline ────────────────────────────────────── */}
          <motion.div
            className="mt-4 text-center"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.08}
          >
            <h1
              className="
                text-[clamp(2.4rem,6vw,4.75rem)]
                font-semibold
                leading-[1.03]
                tracking-[-0.025em]
                text-white
              "
            >
              {t('hero.title_line_1')}
              <br />
              <span className="text-white/80">{t('hero.title_line_2')}</span>
            </h1>

            <p
              className="
                mx-auto mt-5
                max-w-xl
                text-base leading-relaxed
                text-white/55
                md:text-[1.05rem]
              "
            >
              {t('hero.description')}
            </p>
          </motion.div>

          {/* ── Trust bar ───────────────────────────────────── */}
          <motion.div
            className="mt-8"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={0.28}
          >
            <HeroTrustBar />
          </motion.div>

          {/* ── Search ──────────────────────────────────────── */}
          <motion.div
            className="mt-8"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.36}
          >
            <HeroSearchPanel />
          </motion.div>
        </div>
      </div>
    </section>
  );
}