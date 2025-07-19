import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { dir } from 'i18next';
import NextIntlProvider from './NextIntlProvider';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params;
  
  return (
    <html lang={locale} dir={dir(locale)}>
      <body>
        <NextIntlProvider locale={locale}>
          <div className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </NextIntlProvider>
      </body>
    </html>
  );
}
