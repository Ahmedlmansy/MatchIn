import React from 'react'
import HeroSection from './components/HeroSection/HeroSection';
import LatestJobsSection from './components/LatestJobsSection';
import PhilosophySection from './components/PhilosophySection/PhilosophySection';
import CategoriesSection from './components/CategoriesSection/CategoriesSection';
import WhyMatchInSection from './components/WhyMatchIn/WhyMatchInSection';
import FinalCTASection from './components/FinalCTASection';
import Header from './components/Header';
import Footer from './components/Footer';
// import PricingSection from './components/PricingSection';

export default function HomePage() {
  return <div>
    <Header/>
    <HeroSection />
    <LatestJobsSection />
    <PhilosophySection/>
    <CategoriesSection />
    <WhyMatchInSection />
    {/* <PricingSection/> */}
    <FinalCTASection />
    <Footer/>
  </div>;
}
