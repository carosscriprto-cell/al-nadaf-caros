import HeroSection from '@/components/hero/HeroSection';
import FeaturedCarsSection from '@/components/home/FeaturedCarsSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import BrandShowcase from '@/components/home/BrandShowcase';
import RentVsBuyBanner from '@/components/home/RentVsBuyBanner';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import HowItWorks from '@/components/home/HowItWorks';
import FAQSection from '@/components/home/FAQSection';
import FinalCTA from '@/components/home/FinalCTA';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <BrandShowcase />
      <FeaturedCarsSection />
      <WhyChooseUs />
      <RentVsBuyBanner />
      <TestimonialsSection />
      <HowItWorks />
      <FAQSection />
      <FinalCTA />
    </div>
  );
}
