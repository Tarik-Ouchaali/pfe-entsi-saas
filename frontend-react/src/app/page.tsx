'use client';

import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import StatsBar from '../components/StatsBar';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorks from '../components/HowItWorks';
import PricingSection from '../components/PricingSection';
import CTABanner from '../components/CTABanner';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-bg font-body">
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <FeaturesSection />
        <HowItWorks />
        <PricingSection />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
