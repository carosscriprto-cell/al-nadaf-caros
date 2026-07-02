'use client';

// components/pages/FinancingPageClient.tsx — standalone financing page (V2).
//
// Section A: payment-method copy. Title/description/CTA come from the per-tenant
// tenants.content.financing overrides (resolved server-side, passed as `overrides`)
// and fall back to the static i18n `financing.*` namespace. The eyebrow + "how it
// works" terms are static i18n.
// Section B: a grid of financeable inventory (getFinanceableCars) rendered with the
// shared CarCard in its `financing` variant (down payment + monthly installment).
// The CTA opens the shared capture form as a general inquiry (type=inquiry, no car).

import { BadgePercent, CalendarClock, ShieldCheck, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LeadCaptureDialog from '@/components/leads/LeadCaptureDialog';
import CarCard from '@/components/CarCard';
import type { Car, CarContentMap } from '@/types/vehicles';

// Static "how it works" rows — copy is i18n (financing.terms.<key>), icons are fixed.
const TERMS = [
  { key: 'installments', icon: BadgePercent },
  { key: 'flexible', icon: CalendarClock },
  { key: 'requirements', icon: ShieldCheck },
  { key: 'indicative', icon: FileText },
] as const;

type Overrides = { title?: string; description?: string; cta?: string };

export default function FinancingPageClient({
  locale,
  cars,
  contentMap,
  overrides,
}: {
  locale: string;
  cars: Car[];
  contentMap: CarContentMap;
  overrides: Overrides;
}) {
  const t = useTranslations('financing');

  // Per-tenant override wins; else the static i18n default.
  const title = overrides.title ?? t('title');
  const description = overrides.description ?? t('description');
  const ctaButton = overrides.cta ?? t('ctaButton');

  return (
    <div className="min-h-screen bg-background">
      {/* Section A — hero / payment method copy */}
      <section className="relative overflow-hidden border-b border-border/50 py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            <BadgePercent className="h-3.5 w-3.5" />
            {t('eyebrow')}
          </span>
          <h1 className="text-4xl font-bold text-foreground md:text-5xl">{title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            {description}
          </p>
        </div>
      </section>

      {/* Section A — how it works */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground md:text-3xl">
            {t('termsTitle')}
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {TERMS.map(({ key, icon: Icon }) => (
              <div
                key={key}
                className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-accent/30"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {t(`terms.${key}.title`)}
                </h3>
                <p className="text-sm leading-7 text-muted-foreground">
                  {t(`terms.${key}.text`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section B — financeable inventory */}
      <section className="pb-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-2 text-center text-2xl font-bold text-foreground md:text-3xl">
            {t('carsTitle')}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
            {t('carsSubtitle')}
          </p>

          {cars.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cars.map((car, i) => (
                <CarCard
                  key={car.id}
                  car={car}
                  content={contentMap[car.slug]}
                  financing
                  imagePriority={i < 3}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-border/60 bg-card/60 py-16 text-center text-muted-foreground">
              {t('empty')}
            </p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-accent/20 bg-gradient-to-br from-accent/10 via-card/60 to-background p-8 text-center shadow-xl backdrop-blur-xl sm:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">{t('ctaTitle')}</h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t('ctaText')}</p>

              <div className="mt-6 flex justify-center">
                <LeadCaptureDialog
                  intent="inquiry"
                  subject={t('subject')}
                  source="financing"
                  locale={locale}
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-8 py-4 font-semibold text-white shadow-lg shadow-accent/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    >
                      {ctaButton}
                    </button>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
