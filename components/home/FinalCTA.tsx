'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useTenantContent } from '@/components/providers/TenantContentProvider';

// Accent-gradient banner. Every colour is derived from var(--color-accent) via
// OKLCH relative colors (same technique as --accent-strong/--accent-subtle in
// globals.css), so a tenant with a green accent gets a green banner — no
// hardcoded hex. White is used only as the on-accent ink (text + decorations),
// which is the established white-label foreground for accent surfaces.
//
// The deep stops keep enough contrast that white text reads in light AND dark.
const BANNER_GRADIENT =
  'linear-gradient(120deg, ' +
  'oklch(from var(--color-accent) calc(l - 0.20) calc(c + 0.04) h) 0%, ' +
  'var(--accent-strong) 52%, ' +
  'oklch(from var(--color-accent) calc(l - 0.12) calc(c + 0.05) h) 100%)';

const FinalCTA = () => {
  const locale = useLocale();
  const tb = useTranslations('buttons');
  const t = useTranslations('');

  // Per-tenant override → i18n fallback (each field independent). The secondary
  // "contact" CTA stays i18n-only. Empty override = identical to before.
  const fc = useTenantContent().finalCta[locale === 'ar' ? 'ar' : 'en'];
  const title = fc.title || t('final_cta.title');
  const description = fc.desc || t('final_cta.description');
  const primaryCta = fc.cta || tb('start_your_journey');

  // If the car asset is missing/broken, drop it — the banner still reads with
  // just the gradient + text + button (no broken-image icon).
  const [carBroken, setCarBroken] = useState(false);

  return (
    <section className="mx-4 my-16 md:mx-6">
      <div
        className="relative overflow-hidden rounded-3xl px-7 py-14 text-white md:px-14 md:py-16"
        style={{ background: BANNER_GRADIENT }}
      >
        {/* Decorative flow lines — low-opacity white ink, purely token-driven */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full text-white/[0.08]"
          preserveAspectRatio="none"
          viewBox="0 0 1200 400"
          fill="none"
        >
          <path
            d="M-50 320 C 250 220, 500 360, 800 240 S 1300 180, 1300 180"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M-50 360 C 300 280, 560 400, 860 290 S 1300 230, 1300 230"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M-50 120 C 200 60, 480 160, 760 90 S 1300 40, 1300 40"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>

        {/* Soft accent glow for depth (white-on-accent, no hex) */}
        <div className="pointer-events-none absolute -top-16 start-1/3 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        {/* Car — bleeds off the END edge (right in LTR, left in RTL). Hidden below
            lg so it never crowds the text on small/medium screens. */}
        {!carBroken && (
          <div className="pointer-events-none absolute bottom-0 end-[-3%] top-0 hidden w-[46%] max-w-[620px] lg:block">
            <Image
              src="/hero/car-2.png"
              alt=""
              fill
              sizes="46vw"
              quality={90}
              onError={() => setCarBroken(true)}
              className="select-none object-contain [object-position:right_center] rtl:[object-position:left_center]"
            />
          </div>
        )}

        {/* Text + button — START side (left in LTR, right in RTL). Centered on
            small screens where the car is hidden. */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-xl text-center lg:text-start"
        >
          <h2 className="text-balance text-3xl font-bold leading-tight md:text-5xl">
            {title}
          </h2>

          <p className="mx-auto mt-5 max-w-lg text-pretty text-base text-white/80 lg:mx-0 md:text-lg">
            {description}
          </p>

          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
            {/* Primary — white pill, accent-colored text, hover lift */}
            <Link
              href={`/${locale}/fleet`}
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-8 py-3.5 font-semibold text-accent-strong shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
            >
              {primaryCta}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </Link>

            {/* Secondary — quiet ghost on the accent surface */}
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-8 py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10"
            >
              {tb('contact_us')}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
