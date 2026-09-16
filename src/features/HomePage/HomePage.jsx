import React from 'react'
import HeroSection from './components/HeroSection/HeroSection';
import LatestJobsSection from './components/LatestJobsSection';
import PhilosophySection from './components/PhilosophySection/PhilosophySection';
import CategoriesSection from './components/CategoriesSection/CategoriesSection';
import WhySkillMatchSection from './components/WhyMatchIn/WhyMatchInSection';
import FinalCTASection from './components/FinalCTASection';

export default function HomePage() {
  return <div>

    <HeroSection />
    <LatestJobsSection />
    <PhilosophySection/>
    <CategoriesSection />
    <WhySkillMatchSection />
    <FinalCTASection/>
  </div>;
}
