import HeroSection from '@/components/HeroSection';
import ServicesPreview from '@/components/ServicesPreview';
import FleetSlider from '@/components/FleetSlider';
import WhyChooseUs from '@/components/WhyChooseUs';
import PromoBanner from '@/components/PromoBanner';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ServicesPreview />
      <FleetSlider />
      <WhyChooseUs />
      <PromoBanner />
    </div>
  );
}
