'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { services } from '@/data/services';
import PageHero from '@/components/PageHero';

export default function ServicesPageClient() {
  const t = useTranslations();

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <PageHero
        // badge={t('services.section_header')}
        title={t('services.section_title')}
        highlight={t('services.section_highlight')}
        description={t('services.section_description')}
        primaryButton={{
          label: t('services.learn_more'),
          href: '/contact',
        }}
        secondaryButton={{
          label: t('services.view_all'),
          href: '/fleet',
        }}
      >
        <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 p-6 backdrop-blur-xl shadow-2xl">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

          <div className="grid gap-4 md:grid-cols-2">
            {services.slice(0, 3).map((service, index) => (
              <div
                key={service.titleKey}
                className={`group rounded-3xl border border-border/60 bg-background/60 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 ${
                  index === 0 ? 'md:col-span-2' : ''
                }`}
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${service.color}`}>
                  <service.icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="mb-2 text-lg font-semibold text-foreground transition-colors group-hover:text-accent">
                  {t(service.titleKey)}
                </h3>

                <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {t(service.descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </PageHero>

      <section className="py-24">
        <div className="mx-auto max-w-7xl space-y-24 px-4 sm:px-6 lg:px-8">
          {services.map((service, index) => (
            <motion.div
              key={service.titleKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              viewport={{ once: true }}
              className={`grid items-center gap-12 lg:grid-cols-2 ${
                index % 2 !== 0 ? 'lg:grid-flow-col-dense' : ''
              }`}
            >
              <div className={index % 2 !== 0 ? 'lg:col-start-2' : ''}>
                <div className="mb-6 flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${service.color}`}>
                    <service.icon className="h-6 w-6 text-white" />
                  </div>

                  <span className="text-sm text-muted-foreground">0{index + 1}</span>
                </div>

                <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                  {t(service.titleKey)}
                </h2>

                <p className="mb-6 max-w-lg leading-8 text-muted-foreground">
                  {t(service.descriptionKey)}
                </p>

                <Link
                  href={service.href}
                  className="inline-flex items-center gap-3 rounded-2xl bg-accent px-6 py-3 font-semibold text-accent-foreground shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {t('services.learn_more')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className={index % 2 !== 0 ? 'lg:col-start-1' : ''}>
                <div className="relative flex h-[280px] items-center justify-center overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 p-10 backdrop-blur-xl">
                  <div className={`absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-10 blur-3xl ${service.color}`} />

                  <div className="relative z-10 text-center">
                    <service.icon className="mx-auto mb-4 h-16 w-16 text-accent" />
                    <h3 className="text-xl font-semibold text-foreground">
                      {t(service.titleKey)}
                    </h3>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
