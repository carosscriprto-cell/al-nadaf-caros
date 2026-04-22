'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

import { services } from '@/data/services';

const ServicesPreview = () => {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <section className="relative overflow-hidden bg-background py-24">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-accent/5 blur-2xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            {t('services.section_header')}
          </h2>

          <p className="mx-auto max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
            {t('services.section_description')}
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {services.slice(0, 4).map((service, index) => {
            const largeCard = index === 0 || index === 3;

            return (
              <motion.div
                key={service.titleKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                viewport={{ once: true }}
                className={largeCard ? 'lg:col-span-7' : 'lg:col-span-5'}
              >
                <Link href={`/${locale}${service.href}`} className="group block h-full">
                  <div className="relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-accent/30 hover:shadow-2xl">
                    {/* Glow */}
                    <div
                      className={`absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-20 blur-3xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-40 ${service.color}`}
                    />

                    {/* Top */}
                    <div className="relative z-10 mb-8 flex items-start justify-between">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${service.color}`}
                      >
                        <service.icon className="h-7 w-7 text-white" />
                      </div>

                      <div className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        0{index + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex-1 max-w-lg">
                      <h3 className="mb-4 text-2xl font-bold text-foreground transition-colors duration-300 group-hover:text-accent md:text-3xl">
                        {t(service.titleKey)}
                      </h3>

                      <p className="line-clamp-3 text-base leading-7 text-muted-foreground md:text-lg">
                        {t(service.descriptionKey)}
                      </p>
                    </div>

                    {/* Bottom */}
                    <div className="relative z-10 mt-10 flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                        {t('services.learn_more')}
                      </span>

                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          viewport={{ once: true }}
          className="mt-14 text-center"
        >
          <Link
            href={`/${locale}/services`}
            className="group inline-flex items-center gap-3 rounded-2xl bg-accent px-8 py-4 font-semibold text-accent-foreground shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-accent/90 hover:shadow-xl"
          >
            <span>{t('services.view_all')}</span>
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesPreview;