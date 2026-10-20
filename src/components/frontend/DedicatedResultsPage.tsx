import React from 'react';
import { AcademicResultsSearch } from './AcademicResultsSearch';
import { Footer } from './Footer';
import { DedicatedHeader } from './DedicatedHeader';

export const DedicatedResultsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col font-sans">
      {/* Top Institutional Header matching Home Page logo & unified EIIN */}
      <DedicatedHeader portalTitle="অনলাইন একাডেমিক ফলাফল ও মার্কশীট পোর্টাল" />

      {/* Main Content Area */}
      <main className="flex-1">
        <AcademicResultsSearch />
      </main>

      {/* Institutional Website Footer */}
      <Footer />
    </div>
  );
};
