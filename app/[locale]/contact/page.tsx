import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import ContactPageClient from '@/components/pages/ContactPageClient';
import { siteConfig } from '@/config';

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'contact',
  });

  const title = t('seo.title');
  const description = t('seo.description');
  const canonicalPath = `/${locale}/contact`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: '/en/contact',
        ar: '/ar/contact',
      },
    },
    openGraph: {
      title: t('seo.og_title'),
      description: t('seo.og_description'),
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
      title: t('seo.og_title'),
      description: t('seo.og_description'),
      images: [siteConfig.media.ogImage],
    },
  };
}

export default async function ContactPage({
  params,
}: PageProps) {
  const { locale } = await params;

  return <ContactPageClient locale={locale} />;
}
