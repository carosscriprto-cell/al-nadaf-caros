import { setRequestLocale } from 'next-intl/server';
import { getAllCarsForSearch } from '@/lib/supabase/queries.server';
import HeroSection from '@/components/hero/HeroSection';
import FeaturedCarsSection from '@/components/home/FeaturedCarsSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import BrandShowcase from '@/components/home/BrandShowcase';
import RentVsBuyBanner from '@/components/home/RentVsBuyBanner';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import HowItWorks from '@/components/home/HowItWorks';
import FAQSection from '@/components/home/FAQSection';
import FinalCTA from '@/components/home/FinalCTA';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Use the route param (authoritative from the URL). next-intl's server
  // getLocale() can't resolve here — this app uses a custom middleware with no
  // setRequestLocale — so it would default to 'ar' and serve Arabic content.
  const { locale: rawLocale } = await params;
  const locale = rawLocale === 'ar' ? 'ar' : 'en';
  setRequestLocale(locale); // make server getLocale()/getTranslations correct in this subtree

  // Single source: Supabase. Fetch once on the server, drill into the client
  // hero/brand/banner components (which previously imported static data/cars.ts).
  const { cars, contentMap, contentAr, contentEn } =
    await getAllCarsForSearch(locale);

  return (
    <div>
      <HeroSection cars={cars} contentAr={contentAr} contentEn={contentEn} />
      <BrandShowcase cars={cars} />
      <FeaturedCarsSection locale={locale} />
      <WhyChooseUs />
      <RentVsBuyBanner cars={cars} contentMap={contentMap} />
      <TestimonialsSection />
      <HowItWorks />
      <FAQSection />
      <FinalCTA />
    </div>
  );
}
