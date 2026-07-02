'use client';

// components/home/FinancingBanner.tsx — home section (key: financing).
// Shown only for tenants with financing enabled (auto-hidden in
// resolveVisibleSections — see app/(site)/[locale]/page.tsx). A payment-method
// teaser: value copy + "how it works" points + a primary CTA to the full
// /[locale]/financing page. Copy comes from tenants.content.financing (per-tenant
// override) with the static `financing.*` i18n as the per-field fallback — the
// same content plumbing the /financing page uses (no new wiring).

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, BadgePercent, CalendarClock, ShieldCheck } from 'lucide-react';
import { useTenantContent } from '@/components/providers/TenantContentProvider';

// "How it works" teaser points — copy reuses the financing namespace's terms.*
// (also shown in full on /financing); icons are fixed here.
const POINTS = [
  { key: 'installments', icon: BadgePercent },
  { key: 'flexible', icon: CalendarClock },
  { key: 'requirements', icon: ShieldCheck },
] as const;

export default function FinancingBanner() {
  const locale = useLocale();
  const t = useTranslations('financing');
  // Per-tenant override → i18n fallback. Partial overrides are fine: each field
  // falls back independently. Eyebrow is not tenant-editable (i18n only).
  const fc = useTenantContent().financing[locale === 'ar' ? 'ar' : 'en'];
  const c = {
    eyebrow: t('eyebrow'),
    title: fc.title || t('title'),
    description: fc.desc || t('description'),
    cta: fc.cta || t('ctaButton'),
  };

  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-accent/20 bg-gradient-to-br from-accent/10 via-card/60 to-background p-8 shadow-xl backdrop-blur-xl sm:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-center">
            {/* Copy + CTA */}
            <div className="max-w-2xl">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                <BadgePercent className="h-3.5 w-3.5" />
                {c.eyebrow}
              </span>

              <h2 className="text-3xl font-bold text-foreground md:text-4xl">{c.title}</h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground md:text-lg">
                {c.description}
              </p>

              <Link
                href={`/${locale}/financing`}
                className="mt-8 inline-flex shrink-0 items-center justify-center gap-3 rounded-2xl bg-accent px-8 py-4 font-semibold text-white shadow-lg shadow-accent/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                {c.cta}
                <ArrowRight className="h-5 w-5 rtl:rotate-180" />
              </Link>
            </div>

            {/* Payment-method teaser — "how it works" at a glance */}
            <div className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t('termsTitle')}
              </p>
              <ul className="space-y-4">
                {POINTS.map(({ key, icon: Icon }) => (
                  <li key={key} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t(`terms.${key}.title`)}
                      </p>
                      <p className="mt-0.5 text-xs leading-6 text-muted-foreground">
                        {t(`terms.${key}.text`)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
