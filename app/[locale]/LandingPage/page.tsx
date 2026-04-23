import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Globe,
  LayoutPanelTop,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { siteConfig } from '@/config';
import { getBlurDataURL } from '@/lib/image';

import {
  getLandingContent,
  type LandingContent,
} from './content';

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = getLandingContent(locale);
  const canonicalPath = `/${locale}/LandingPage`;

  return {
    title: content.seo.title,
    description: content.seo.description,
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: '/en/LandingPage',
        ar: '/ar/LandingPage',
      },
    },
    openGraph: {
      title: content.seo.ogTitle,
      description: content.seo.ogDescription,
      url: canonicalPath,
      siteName: siteConfig.brand.name,
      images: [
        {
          url: '/hero-bg.png',
          width: 1200,
          height: 630,
          alt: content.seo.title,
        },
      ],
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.seo.ogTitle,
      description: content.seo.ogDescription,
      images: ['/hero-bg.png'],
    },
  };
}

export default async function LandingPage({
  params,
}: PageProps) {
  const { locale } = await params;
  const content = getLandingContent(locale);
  const isArabic = locale === 'ar';

  return (
    <div className="bg-background text-foreground">
      <HeroSection
        locale={locale}
        content={content}
        isArabic={isArabic}
      />
      <ProblemSolutionSection content={content} />
      <ProductShowcaseSection content={content} />
      <VisualPreviewSection content={content} />
      <BenefitsSection content={content} />
      <ServiceOfferingSection
        content={content}
        locale={locale}
      />
      <PricingSection content={content} locale={locale} />
      <UseCasesSection content={content} />
      <WhyCarosSection content={content} />
      <FinalCtaSection content={content} locale={locale} />
    </div>
  );
}

function HeroSection({
  locale,
  content,
  isArabic,
}: {
  locale: string;
  content: LandingContent;
  isArabic: boolean;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/50 bg-background py-20 lg:py-28">
      <div className="absolute inset-0">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute right-0 top-10 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <SectionShell className="relative z-10">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.05fr]">
          <div className="max-w-2xl">
            <Eyebrow>{content.hero.eyebrow}</Eyebrow>
            <h1 className="mt-5 text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
              {content.hero.title}{' '}
              <span className="text-accent">
                {content.hero.highlight}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              {content.hero.description}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <PrimaryLink href={`/${locale}/contact`}>
                {content.hero.primaryCta}
              </PrimaryLink>
              <SecondaryLink href={`/${locale}/fleet`}>
                {content.hero.secondaryCta}
              </SecondaryLink>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {content.hero.proofPoints.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-border/60 bg-card/70 px-4 py-3 text-sm font-medium text-foreground backdrop-blur-xl"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 p-4 shadow-2xl backdrop-blur-xl">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1.6rem]">
                <Image
                  src="/hero-bg.png"
                  alt="Caros product preview"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  quality={72}
                  placeholder="blur"
                  blurDataURL={getBlurDataURL('#0f172a', '#111827')}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/25 to-transparent" />
              </div>

              <div className="absolute inset-x-10 top-10 rounded-3xl border border-white/20 bg-black/35 p-5 text-white backdrop-blur-xl">
                <div className="text-xs uppercase tracking-[0.28em] text-white/70">
                  {isArabic ? 'منصة جاهزة' : 'Ready Platform'}
                </div>
                <div className="mt-2 text-2xl font-semibold">
                  {isArabic
                    ? 'واجهة سيارات متعددة اللغات جاهزة للإطلاق'
                    : 'Multilingual automotive interface ready to launch'}
                </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6 grid gap-3 md:grid-cols-3">
                <MiniStat
                  icon={Globe}
                  label={
                    isArabic ? 'ثنائي اللغة' : 'Bilingual'
                  }
                />
                <MiniStat
                  icon={Search}
                  label={isArabic ? 'بحث وفلاتر' : 'Search + Filters'}
                />
                <MiniStat
                  icon={MessageCircle}
                  label={isArabic ? 'تدفق واتساب' : 'WhatsApp Flow'}
                />
              </div>
            </div>
          </div>
        </div>
      </SectionShell>
    </section>
  );
}

function ProblemSolutionSection({
  content,
}: {
  content: LandingContent;
}) {
  return (
    <section className="py-20 lg:py-24">
      <SectionShell>
        <SectionIntro
          eyebrow={content.problemSolution.eyebrow}
          title={content.problemSolution.title}
          description={content.problemSolution.description}
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-border/60 bg-card/70 p-8 shadow-xl backdrop-blur-xl">
            <h3 className="text-2xl font-semibold text-foreground">
              {content.problemSolution.leftTitle}
            </h3>
            <div className="mt-6 space-y-4">
              {content.problemSolution.leftItems.map((item) => (
                <BulletRow key={item}>{item}</BulletRow>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-accent/20 bg-accent/5 p-8 shadow-xl">
            <div className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">
              Caros
            </div>
            <h3 className="mt-5 text-3xl font-semibold text-foreground">
              {content.problemSolution.rightTitle}
            </h3>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              {content.problemSolution.rightDescription}
            </p>
          </div>
        </div>
      </SectionShell>
    </section>
  );
}

function ProductShowcaseSection({
  content,
}: {
  content: LandingContent;
}) {
  const icons = [Globe, LayoutPanelTop, Search, Sparkles];

  return (
    <section className="border-y border-border/50 bg-card/30 py-20 lg:py-24">
      <SectionShell>
        <SectionIntro
          title={content.productShowcase.title}
          description={content.productShowcase.description}
          centered
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {content.productShowcase.items.map((item, index) => {
            const Icon = icons[index] || Sparkles;

            return (
              <InfoCard
                key={item.title}
                icon={Icon}
                title={item.title}
                description={item.description}
              />
            );
          })}
        </div>
      </SectionShell>
    </section>
  );
}

function VisualPreviewSection({
  content,
}: {
  content: LandingContent;
}) {
  const previewImages = [
    '/hero-bg.png',
    '/Fleet/default/default-1.webp',
    '/Fleet/default/default-2.webp',
    '/hero/rent.png',
  ];

  return (
    <section className="py-20 lg:py-24">
      <SectionShell>
        <SectionIntro
          title={content.visualPreview.title}
          description={content.visualPreview.description}
          centered
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {content.visualPreview.items.map((item, index) => (
              <div
                key={item.title}
                className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/70 shadow-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={previewImages[index] || previewImages[0]}
                    alt={item.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 25vw"
                    quality={70}
                    placeholder="blur"
                    blurDataURL={getBlurDataURL('#111827', '#1f2937')}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="rounded-2xl bg-black/40 px-4 py-3 text-white backdrop-blur-md">
                      <div className="font-semibold">{item.title}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-xl backdrop-blur-xl">
            <h3 className="text-3xl font-semibold text-foreground">
              {content.visualPreview.title}
            </h3>
            <div className="mt-6 space-y-5">
              {content.visualPreview.items.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border/50 bg-background/60 p-5"
                >
                  <div className="font-semibold text-foreground">
                    {item.title}
                  </div>
                  <p className="mt-2 leading-7 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-base leading-7 text-muted-foreground">
              {content.visualPreview.demoNote}
            </p>
          </div>
        </div>
      </SectionShell>
    </section>
  );
}

function BenefitsSection({
  content,
}: {
  content: LandingContent;
}) {
  return (
    <section className="border-y border-border/50 bg-card/30 py-20 lg:py-24">
      <SectionShell>
        <SectionIntro
          title={content.benefits.title}
          centered
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {content.benefits.items.map((item) => (
            <InfoCard
              key={item.title}
              icon={ShieldCheck}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </SectionShell>
    </section>
  );
}

function ServiceOfferingSection({
  content,
  locale,
}: {
  content: LandingContent;
  locale: string;
}) {
  return (
    <section className="py-20 lg:py-24">
      <SectionShell>
        <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-start">
          <div>
            <SectionIntro
              eyebrow={content.serviceOffering.eyebrow}
              title={content.serviceOffering.title}
              description={content.serviceOffering.description}
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {content.serviceOffering.bullets.map((item) => (
                <BulletCard key={item}>{item}</BulletCard>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-accent/20 bg-accent/5 p-8 shadow-2xl">
            <div className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">
              Service
            </div>
            <h3 className="mt-5 text-3xl font-semibold text-foreground">
              {content.serviceOffering.cardTitle}
            </h3>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              {content.serviceOffering.cardDescription}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <PrimaryLink href={`/${locale}/contact`}>
                {content.serviceOffering.primaryCta}
              </PrimaryLink>
              <SecondaryLink href={`/${locale}/contact`}>
                {content.serviceOffering.secondaryCta}
              </SecondaryLink>
            </div>
          </div>
        </div>
      </SectionShell>
    </section>
  );
}

function PricingSection({
  content,
  locale,
}: {
  content: LandingContent;
  locale: string;
}) {
  return (
    <section className="border-y border-border/50 bg-card/30 py-20 lg:py-24">
      <SectionShell>
        <SectionIntro
          title={content.pricing.title}
          description={content.pricing.description}
          centered
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <PricingCard plan={content.pricing.product} />
          <PricingCard
            plan={content.pricing.service}
            featured
          />
        </div>

        <div className="mt-10 text-center">
          <SecondaryLink href={`/${locale}/contact`}>
            {content.pricing.footerCta}
          </SecondaryLink>
        </div>
      </SectionShell>
    </section>
  );
}

function UseCasesSection({
  content,
}: {
  content: LandingContent;
}) {
  return (
    <section className="py-20 lg:py-24">
      <SectionShell>
        <SectionIntro title={content.useCases.title} centered />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {content.useCases.items.map((item) => (
            <InfoCard
              key={item.title}
              icon={BadgeCheck}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </SectionShell>
    </section>
  );
}

function WhyCarosSection({
  content,
}: {
  content: LandingContent;
}) {
  return (
    <section className="border-y border-border/50 bg-card/30 py-20 lg:py-24">
      <SectionShell>
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <SectionIntro
              title={content.whyCaros.title}
              description={content.whyCaros.description}
            />
          </div>

          <div className="rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-xl backdrop-blur-xl">
            <div className="space-y-4">
              {content.whyCaros.items.map((item) => (
                <BulletRow key={item}>{item}</BulletRow>
              ))}
            </div>
            <div className="mt-8">
              <SecondaryButton>{content.whyCaros.cta}</SecondaryButton>
            </div>
          </div>
        </div>
      </SectionShell>
    </section>
  );
}

function FinalCtaSection({
  content,
  locale,
}: {
  content: LandingContent;
  locale: string;
}) {
  return (
    <section className="py-20 lg:py-28">
      <SectionShell>
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-foreground px-8 py-14 text-background shadow-2xl lg:px-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.35),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_30%)]" />
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold leading-tight md:text-5xl">
              {content.finalCta.title}
            </h2>
            <p className="mt-6 text-lg leading-8 text-background/80">
              {content.finalCta.description}
            </p>
            <p className="mt-4 text-sm font-medium uppercase tracking-[0.18em] text-background/60">
              {content.finalCta.urgency}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <PrimaryLink
                href={`/${locale}/contact`}
                inverted
              >
                {content.finalCta.primaryCta}
              </PrimaryLink>
              <GhostLink href={`/${locale}/fleet`}>
                {content.finalCta.secondaryCta}
              </GhostLink>
            </div>
          </div>
        </div>
      </SectionShell>
    </section>
  );
}

function SectionShell({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-lg leading-8 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
      {children}
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[2rem] border border-border/60 bg-card/80 p-7 shadow-xl backdrop-blur-xl">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-2xl font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-3 leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function BulletRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-background/60 p-4">
      <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent">
        <Check className="h-4 w-4" />
      </div>
      <div className="font-medium leading-7 text-foreground">
        {children}
      </div>
    </div>
  );
}

function BulletCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-lg backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Check className="h-4 w-4" />
        </div>
        <div className="font-medium leading-7 text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  plan,
  featured = false,
}: {
  plan: {
    name: string;
    price: string;
    audience: string;
    includes: string[];
    cta: string;
  };
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-[2rem] border p-8 shadow-2xl ${
        featured
          ? 'border-accent/30 bg-accent/5'
          : 'border-border/60 bg-card/80 backdrop-blur-xl'
      }`}
    >
      <div className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {plan.name}
      </div>
      <div className="mt-4 text-4xl font-bold text-foreground">
        {plan.price}
      </div>
      <p className="mt-4 leading-7 text-muted-foreground">
        {plan.audience}
      </p>

      <div className="mt-8 space-y-3">
        {plan.includes.map((item) => (
          <BulletRow key={item}>{item}</BulletRow>
        ))}
      </div>

      <div className="mt-8">
        <SecondaryButton>{plan.cta}</SecondaryButton>
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-black/35 px-4 py-3 text-white backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-accent" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}

function PrimaryLink({
  href,
  children,
  inverted = false,
}: {
  href: string;
  children: React.ReactNode;
  inverted?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold transition ${
        inverted
          ? 'bg-background text-foreground hover:bg-background/90'
          : 'bg-accent text-white shadow-lg shadow-accent/20 hover:-translate-y-0.5'
      }`}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-2xl border border-border/60 bg-card/70 px-6 py-3.5 text-sm font-semibold text-foreground transition hover:border-accent/30 hover:text-accent"
    >
      {children}
    </Link>
  );
}

function GhostLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
    >
      {children}
    </Link>
  );
}

function SecondaryButton({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-2xl border border-border/60 bg-card/70 px-6 py-3.5 text-sm font-semibold text-foreground transition hover:border-accent/30 hover:text-accent"
    >
      {children}
    </button>
  );
}
