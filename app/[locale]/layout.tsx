import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { dir } from 'i18next';
import NextIntlProvider from './NextIntlProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import ThemeProvider from '@/components/providers/ThemeProvider';
import UiLoadingProvider from '@/components/providers/UiLoadingProvider';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { seoConfig, siteConfig } from '@/config';
import { getTenantConfig } from '@/lib/supabase/getTenant';
import WhatsAppFloatingButton from "@/components/WhatsappFloatingButton";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';

  // Per-tenant SEO + branding (P4) — resolved from the tenants row.
  const tenant = await getTenantConfig();

  const title =
    (isAr ? tenant.seo_title_ar : tenant.seo_title_en) ??
    (isAr ? tenant.name_ar : tenant.name) ??
    tenant.name;
  const description =
    (isAr ? tenant.seo_desc_ar : tenant.seo_desc_en) ?? seoConfig.description;
  const ogImage = tenant.og_image_url ?? siteConfig.media.ogImage;

  return {
    title,
    description,
    keywords: seoConfig.keywords,
    authors: [{ name: tenant.name }],
    metadataBase: new URL(siteConfig.urls.website),
    icons: tenant.favicon_url ? { icon: tenant.favicon_url } : undefined,
    openGraph: {
      title,
      description,
      url: siteConfig.urls.website,
      siteName: tenant.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      locale: isAr ? 'ar_SA' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
    verification: { google: seoConfig.googleVerification },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params;

  // Make the locale available to server-side next-intl APIs (getLocale,
  // getTranslations) for THIS request — fixes server getLocale() defaulting to
  // 'ar'. Without next-intl's own middleware, this is the supported source.
  setRequestLocale(locale);

  // ─── Per-tenant branding (P4) ────────────────────────────────
  const tenant = await getTenantConfig();
  const brandName =
    (locale === 'ar' ? tenant.name_ar : tenant.name) ?? tenant.name;
  // Inject tenant colors as CSS variables; Tailwind v4 utilities reference
  // var(--color-*), so these override the globals.css @theme defaults.
  const brandStyle = {
    '--color-primary': tenant.color_primary,
    '--color-secondary': tenant.color_secondary,
    '--color-accent': tenant.color_accent,
  } as React.CSSProperties;

  return (
    <html lang={locale} dir={dir(locale)} suppressHydrationWarning>
      <body style={brandStyle}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlProvider locale={locale}>
            <UiLoadingProvider>
              <ErrorBoundary>
                <div className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
                  <Navbar brandName={brandName} logoUrl={tenant.logo_url} />
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                  <WhatsAppFloatingButton />
                </div>
              </ErrorBoundary>
            </UiLoadingProvider>
          </NextIntlProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
