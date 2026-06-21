'use client';

import HeadSection from '@/components/HeadSection';
import FinalCTA from '@/components/home/FinalCTA';
import FAQSection from '@/components/home/FAQSection';
import MapSection from '@/components/map/MapSection';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import PageHero from '@/components/PageHero';

export default function AboutPageClient() {
  const locale = useLocale();
  const t = useTranslations('about');

  const stats = [
    { number: '10+', label: t('stats.years_experience') },
    { number: '500+', label: t('stats.happy_clients') },
    { number: '50+', label: t('stats.vehicles') },
    { number: '24/7', label: t('stats.support') },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <PageHero
        // badge={t('hero.badge')}
        title={t('hero.title')}
        highlight={t('hero.highlight')}
        description={t('hero.description_primary')}
        secondaryDescription={t('hero.description_secondary')}
        primaryButton={{
          label: t('actions.browse_fleet'),
          href: `/${locale}/fleet`,
        }}
        secondaryButton={{
          label: t('actions.contact_us'),
          href: `/${locale}/contact`,
        }}
      >
        {/* RIGHT SIDE (children) */}
        <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">

          <div className="absolute -top-20 -right-20 h-64 w-64 bg-accent/10 blur-3xl rounded-full transition group-hover:scale-125" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 bg-primary/10 blur-3xl rounded-full" />

          <div className="relative z-10 space-y-6">

            <div>
              <p className="text-sm text-muted-foreground">
                {t('experience_card.label')}
              </p>
              <h2 className="text-5xl font-bold text-accent">
                {stats[0].number}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {stats.slice(1).map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/60 bg-background/60 p-4 backdrop-blur-xl hover:scale-[1.04] hover:shadow-xl transition"
                >
                  <p className="text-lg font-semibold text-foreground">
                    {stat.number}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/60 p-4 backdrop-blur-xl">
              <p className="text-sm font-medium text-foreground">
                {t('experience_card.title')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('experience_card.description')}
              </p>
            </div>

          </div>
        </div>
      </PageHero>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <HeadSection
            title={t('story.title')}
            description={t('story.description')}
            divider
          />

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {t('story.paragraph_one')}
          </p>

          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            {t('story.paragraph_two')}
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <HeadSection
            title={t('numbers.title')}
            description={t('numbers.description')}
            divider
          />

          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 mt-10">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-6 text-center backdrop-blur-xl hover:-translate-y-2 hover:shadow-2xl transition"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition" />

                <div className="relative z-10">
                  <div className="text-3xl font-bold text-accent">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FAQSection group="about" />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <HeadSection
            title={t('locations.title')}
            description={t('locations.description')}
            divider
          />

          <MapSection mode="about" />
        </div>
      </section>

      <FinalCTA />
    </div>
  );
}
