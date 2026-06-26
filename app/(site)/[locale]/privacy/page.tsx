import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { siteConfig } from '@/config';

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const sectionKeys = [
  'collection',
  'usage',
  'sharing',
  'retention',
  'rights',
] as const;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'legalPages.privacy',
  });

  const title = t('title');
  const description = t('description');
  const canonicalPath = `/${locale}/privacy`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: '/en/privacy',
        ar: '/ar/privacy',
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      siteName: siteConfig.brand.name,
      images: [
        {
          url: siteConfig.media.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [siteConfig.media.ogImage],
    },
  };
}

export default async function PrivacyPage({
  params,
}: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'legalPages.privacy',
  });

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-10">
          <div className="mb-8 border-b border-border/60 pb-6">
            <p className="text-sm font-medium text-accent">
              {t('updated')}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
              {t('description')}
            </p>
          </div>

          <div className="space-y-6">
            {sectionKeys.map((sectionKey) => (
              <section
                key={sectionKey}
                className="rounded-[1.5rem] border border-border/50 bg-background/70 p-6"
              >
                <h2 className="text-xl font-semibold text-foreground">
                  {t(`sections.${sectionKey}.title`)}
                </h2>
                <p className="mt-3 leading-7 text-muted-foreground">
                  {t(`sections.${sectionKey}.body`)}
                </p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
