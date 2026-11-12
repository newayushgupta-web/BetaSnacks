import HeroSection from '../../components/home/HeroSection';
import CategorySection from '../../components/home/CategorySection';
import BestsellerSection from '../../components/home/BestsellerSection';
import HomeMenuShowcase from '../../components/home/HomeMenuShowcase';
import SpecialOffers from '../../components/home/SpecialOffers';
import FeaturesSection from '../../components/home/FeaturesSection';
import Testimonials from '../../components/home/Testimonials';
import NewsletterSection from '../../components/home/NewsletterSection';

export default function HomePage() {
  return (
    <div className="space-y-0">
      <HeroSection />
      <CategorySection />
      <HomeMenuShowcase />
      <BestsellerSection />
      <SpecialOffers />
      <FeaturesSection />
      <Testimonials />
      <NewsletterSection />
    </div>
  );
}
