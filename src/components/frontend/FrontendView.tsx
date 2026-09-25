import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Header } from './Header';
import { HeroSlider } from './HeroSlider';
import { NoticeTicker } from './NoticeTicker';
import { QuickActions } from './QuickActions';
import { NoticeBoard } from './NoticeBoard';
import { LeadershipMessages } from './LeadershipMessages';
import { AboutSection } from './AboutSection';
import { AcademicPrograms } from './AcademicPrograms';
import { SchoolStats } from './SchoolStats';
import { ResultsTrend } from './ResultsTrend';
import { NewsSection } from './NewsSection';
import { EventsSection } from './EventsSection';
import { AchievementsSection } from './AchievementsSection';
import { GallerySection } from './GallerySection';
import { ContactSection } from './ContactSection';
import { Footer } from './Footer';

export const FrontendView: React.FC = () => {
  const { sectionVisibility, siteSettings } = useSchool();

  return (
    <div id="home" className="min-h-screen bg-[#fafaf9] text-gray-800 flex flex-col antialiased selection:bg-emerald-200 selection:text-emerald-900 scroll-mt-0">
      <div id="top-header-area" className="w-full shrink-0">
        <Header />
        {sectionVisibility.ticker && siteSettings.showNoticeTicker !== false && <NoticeTicker />}
      </div>
      {sectionVisibility.hero && <HeroSlider />}
      {sectionVisibility.quick_actions && <QuickActions />}
      {sectionVisibility.notices && <NoticeBoard />}
      {sectionVisibility.leadership && <LeadershipMessages />}
      {sectionVisibility.about && <AboutSection />}
      {sectionVisibility.programs && <AcademicPrograms />}
      {sectionVisibility.stats && <SchoolStats />}
      {sectionVisibility.results_trend && <ResultsTrend />}
      {sectionVisibility.news && <NewsSection />}
      {sectionVisibility.events && <EventsSection />}
      {sectionVisibility.achievements && <AchievementsSection />}
      {sectionVisibility.gallery && <GallerySection />}
      {sectionVisibility.contact && <ContactSection />}
      <Footer />
    </div>
  );
};
