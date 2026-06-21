'use client';

// components/pages/FinancingPageClient.tsx — static financing explainer (P2.5-3b).
// Content is static i18n for now (per-tenant editable content is a later phase).
// The CTA opens the shared capture form as a general inquiry (type=inquiry, no
// car) → persists a lead, then WhatsApp.

import { BadgePercent, CalendarClock, ShieldCheck, FileText } from 'lucide-react';
import LeadCaptureDialog from '@/components/leads/LeadCaptureDialog';

const COPY = {
  en: {
    eyebrow: 'Flexible payment',
    title: 'Financing available',
    description:
      'Drive the car you want now and spread the cost over comfortable monthly installments. Tell us your budget and our team will tailor a plan.',
    termsTitle: 'How it works',
    terms: [
      { icon: BadgePercent, title: 'Monthly installments', text: 'Pay a part upfront and the rest in scheduled monthly payments.' },
      { icon: CalendarClock, title: 'Flexible terms', text: 'Plan lengths are arranged with you based on the vehicle and your budget.' },
      { icon: ShieldCheck, title: 'Simple requirements', text: 'Basic ID and proof of income are usually all that is needed to start.' },
      { icon: FileText, title: 'Indicative only', text: 'Final terms and approval are confirmed directly with the dealer.' },
    ],
    ctaTitle: 'Interested in financing?',
    ctaText: 'Leave your details and we will get back to you with a plan.',
    ctaButton: 'Inquire about financing',
    subject: 'financing',
  },
  ar: {
    eyebrow: 'دفع مرن',
    title: 'التقسيط متاح',
    description:
      'احصل على السيارة التي تريدها الآن وقسّم التكلفة على دفعات شهرية مريحة. أخبرنا بميزانيتك وسيقوم فريقنا بإعداد خطة مناسبة.',
    termsTitle: 'كيف يعمل',
    terms: [
      { icon: BadgePercent, title: 'أقساط شهرية', text: 'ادفع جزءاً مقدّماً والباقي على دفعات شهرية مجدولة.' },
      { icon: CalendarClock, title: 'شروط مرنة', text: 'تُحدَّد مدة الخطة معك حسب السيارة وميزانيتك.' },
      { icon: ShieldCheck, title: 'متطلبات بسيطة', text: 'عادةً يكفي إثبات هوية وإثبات دخل للبدء.' },
      { icon: FileText, title: 'إرشادي فقط', text: 'تُؤكَّد الشروط النهائية والموافقة مباشرةً مع المعرض.' },
    ],
    ctaTitle: 'مهتم بالتقسيط؟',
    ctaText: 'اترك بياناتك وسنعاود التواصل معك بخطة مناسبة.',
    ctaButton: 'استفسر عن التقسيط',
    subject: 'التقسيط',
  },
} as const;

export default function FinancingPageClient({ locale }: { locale: string }) {
  const l = locale === 'ar' ? 'ar' : 'en';
  const c = COPY[l];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50 py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            <BadgePercent className="h-3.5 w-3.5" />
            {c.eyebrow}
          </span>
          <h1 className="text-4xl font-bold text-foreground md:text-5xl">{c.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            {c.description}
          </p>
        </div>
      </section>

      {/* Terms */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground md:text-3xl">
            {c.termsTitle}
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {c.terms.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-accent/30"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm leading-7 text-muted-foreground">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-accent/20 bg-gradient-to-br from-accent/10 via-card/60 to-background p-8 text-center shadow-xl backdrop-blur-xl sm:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">{c.ctaTitle}</h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{c.ctaText}</p>

              <div className="mt-6 flex justify-center">
                <LeadCaptureDialog
                  intent="inquiry"
                  subject={c.subject}
                  source="financing"
                  locale={locale}
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-8 py-4 font-semibold text-white shadow-lg shadow-accent/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    >
                      {c.ctaButton}
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
