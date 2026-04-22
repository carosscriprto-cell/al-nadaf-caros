'use client';

import { motion } from 'framer-motion';
import { Search, Calendar, Car, CreditCard, ArrowRight } from 'lucide-react';
import HeadSection from '../HeadSection';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export const HowItWorks = () => {
  const locale = useLocale();
  const t = useTranslations('how_it_works');
  
  const steps = [
    {
      icon: Search,
      title: t('steps.choose.title'),
      description: t('steps.choose.description'),
      step: '01',
    },
    {
      icon: Calendar,
      title: t('steps.book.title'),
      description: t('steps.book.description'),
      step: '02',
    },
    {
      icon: Car,
      title: t('steps.delivery.title'),
      description: t('steps.delivery.description'),
      step: '03',
    },
    {
      icon: CreditCard,
      title: t('steps.drive.title'),
      description: t('steps.drive.description'),
      step: '04',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-muted/30 py-20">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <HeadSection
          title={t('title')}
          description={t('description')}
          divider
        />

        {/* Steps (Same Design) */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: index * 0.07 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="relative h-full overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-accent/30 hover:shadow-2xl">
                  {/* Glow */}
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-accent/20" />

                  <div className="relative z-10 text-center">
                    {/* Step Number */}
                    <div className="mb-6 flex items-center justify-center">
                      <span className="absolute -top-2 -right-2 text-xs font-bold text-accent/60">
                        {step.step}
                      </span>
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-all duration-300 group-hover:scale-110 group-hover:bg-accent group-hover:text-accent-foreground">
                        <Icon className="h-7 w-7" />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="mb-4 text-xl font-semibold text-foreground transition-colors duration-300 group-hover:text-accent">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute top-1/2 left-full hidden w-8 -translate-y-1/2 lg:block">
                    <div className="h-0.5 w-full bg-border/60" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Strong CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="mb-4 text-lg text-muted-foreground">
            {t('cta_description')}
          </p>

          <Link
              href={`/${locale}/fleet`}
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-accent px-8 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              {t('cta')}
              <ArrowRight className="h-5 w-5" />
            </Link>
        </motion.div>
      </div>
    </section>
  );
};


export default HowItWorks;
