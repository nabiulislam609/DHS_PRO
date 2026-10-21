import React from 'react';
import { AcademicResultsSearch } from './AcademicResultsSearch';
import { Footer } from './Footer';
import { DedicatedHeader } from './DedicatedHeader';

export const DedicatedResultsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F6F7F5] text-[#14211B] flex flex-col font-sans subpage-fade-in">
      {/* Top Institutional Header */}
      <DedicatedHeader pageName="ফলাফল ও মার্কশীট" />

      {/* Main Content Area */}
      <main className="flex-1">
        <AcademicResultsSearch />
      </main>

      {/* Institutional Website Footer */}
      <Footer />
    </div>
  );
};
