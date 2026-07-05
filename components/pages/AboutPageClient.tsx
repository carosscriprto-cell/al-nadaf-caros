'use client';

import HeadSection from '@/components/HeadSection';
import FinalCTA from '@/components/home/FinalCTA';
import FAQSection from '@/components/home/FAQSection';
import MapSection from '@/components/map/MapSection';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import PageHero from '@/components/PageHero';
import { useTenantContent } from '@/components/providers/TenantContentProvider';

export default function AboutPageClient() {
  const locale = useLocale();
  const t = useTranslations('about');

  // Per-tenant About override (every field). Empty field → static i18n default,
  // so a blank/partial content.about renders exactly like the original page.
  const ab = useTenantContent().about[locale === 'ar' ? 'ar' : 'en'];

  // Hero
  const heroTitle = ab.hero?.title || t('hero.title');
  const heroHighlight = ab.hero?.highlight || t('hero.highlight');
  const heroDescPrimary = ab.hero?.descPrimary || t('hero.description_primary');
  const heroDescSecondary = ab.hero?.descSecondary || t('hero.description_secondary');

  // Experience card
  const expLabel = ab.experienceCard?.label || t('experience_card.label');
  const expTitle = ab.experienceCard?.title || t('experience_card.title');
  const expDescription = ab.experienceCard?.description || t('experience_card.description');

  // Story
  const storyHeading = ab.heading || t('story.title');
  const storyDescription = ab.storyDescription || t('story.description');
  const storyParagraphs = ab.body
    ? ab.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
    : [t('story.paragraph_one'), t('story.paragraph_two')];

  // Numbers + locations section headers
  const numbersTitle = ab.numbers?.title || t('numbers.title');
  const numbersDescription = ab.numbers?.description || t('numbers.description');
  const locationsTitle = ab.locations?.title || t('locations.title');
  const locationsDescription = ab.locations?.description || t('locations.description');

  // Stat cards: tenant-supplied set wins; empty → the original 4 i18n/literal
  // defaults. No hardcoded figures remain outside this fallback list.
  const defaultStats = [
    { number: '10+', label: t('stats.years_experience') },
    { number: '500+', label: t('stats.happy_clients') },
    { number: '50+', label: t('stats.vehicles') },
    { number: '24/7', label: t('stats.support') },
  ];
  const tenantStats = (ab.stats ?? [])
    .map((s) => ({ number: s.value ?? '', label: s.label ?? '' }))
    .filter((s) => s.number || s.label);
  const stats = tenantStats.length ? tenantStats : defaultStats;

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <PageHero
        // badge={t('hero.badge')}
        title={heroTitle}
        highlight={heroHighlight}
        description={heroDescPrimary}
        secondaryDescription={heroDescSecondary}
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
                {expLabel}
              </p>
              <h2 className="text-5xl font-bold text-accent">
                {stats[0]?.number || '10+'}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {stats.slice(1).map((stat, i) => (
                <div
                  key={i}
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
                {expTitle}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {expDescription}
              </p>
            </div>

          </div>
        </div>
      </PageHero>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <HeadSection
            title={storyHeading}
            description={storyDescription}
            divider
          />

          {storyParagraphs.map((paragraph, i) => (
            <p key={i} className={`${i === 0 ? 'mt-6' : 'mt-4'} text-lg leading-8 text-muted-foreground`}>
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <HeadSection
            title={numbersTitle}
            description={numbersDescription}
            divider
          />

          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 mt-10">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
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
            title={locationsTitle}
            description={locationsDescription}
            divider
          />

          <MapSection mode="about" />
        </div>
      </section>

      <FinalCTA />
    </div>
  );
}
