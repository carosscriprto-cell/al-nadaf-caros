'use client';

// components/home/FinancingBanner.tsx — home section (key: financing).
// Shown only for tenants with financing enabled (gated in resolveVisibleSections).
// Brief "financing available" banner with a CTA to the financing page.

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowRight, BadgePercent } from 'lucide-react';

const COPY = {
  en: {
    eyebrow: 'Flexible payment',
    title: 'Financing available',
    description: 'Drive now and pay in installments. Ask us about monthly plans tailored to your budget.',
    cta: 'Explore financing',
  },
  ar: {
    eyebrow: 'دفع مرن',
    title: 'التقسيط متاح',
    description: 'استلم سيارتك الآن وادفع على أقساط. اسألنا عن خطط شهرية تناسب ميزانيتك.',
    cta: 'تعرّف على التقسيط',
  },
} as const;

export default function FinancingBanner() {
  const locale = useLocale();
  const c = COPY[locale === 'ar' ? 'ar' : 'en'];

  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-accent/20 bg-gradient-to-br from-accent/10 via-card/60 to-background p-8 shadow-xl backdrop-blur-xl sm:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />

          <div className="relative z-10 flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                <BadgePercent className="h-3.5 w-3.5" />
                {c.eyebrow}
              </span>

              <h2 className="text-3xl font-bold text-foreground md:text-4xl">{c.title}</h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground md:text-lg">
                {c.description}
              </p>
            </div>

            <Link
              href={`/${locale}/financing`}
              className="inline-flex shrink-0 items-center justify-center gap-3 rounded-2xl bg-accent px-8 py-4 font-semibold text-white shadow-lg shadow-accent/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              {c.cta}
              <ArrowRight className="h-5 w-5 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
