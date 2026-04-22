import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { dir } from 'i18next';
import NextIntlProvider from './NextIntlProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import ThemeProvider from '@/components/providers/ThemeProvider';
import UiLoadingProvider from '@/components/providers/UiLoadingProvider';
import { Metadata } from 'next';
import { seoConfig, siteConfig } from '@/config';
import WhatsAppFloatingButton from "@/components/WhatsappFloatingButton";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: seoConfig.defaultTitle,
    description: seoConfig.description,
    keywords: seoConfig.keywords,
    authors: [{ name: siteConfig.brand.name }],
    metadataBase: new URL(siteConfig.urls.website),
    openGraph: {
      title: seoConfig.defaultTitle,
      description: seoConfig.description,
      url: siteConfig.urls.website,
      siteName: siteConfig.brand.name,
      images: [
        {
          url: siteConfig.media.ogImage,
          width: 1200,
          height: 630,
          alt: seoConfig.defaultTitle,
        },
      ],
      locale: seoConfig.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoConfig.defaultTitle,
      description: seoConfig.description,
      images: [siteConfig.media.ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
    verification: {
      google: seoConfig.googleVerification,
    },
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
  
  return (
    <html lang={locale} dir={dir(locale)} suppressHydrationWarning>
      <body>
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
                  <Navbar />
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
