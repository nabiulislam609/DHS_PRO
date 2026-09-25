import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AcademicResultsSearch } from './AcademicResultsSearch';
import {
  GraduationCap,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Award,
} from 'lucide-react';

export const DedicatedResultsPage: React.FC = () => {
  const { siteSettings, setCurrentFrontendPage } = useSchool();

  const handleGoHome = () => {
    setCurrentFrontendPage('home');
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col font-sans">
      {/* Top Institutional Notification Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Logo & School Branding */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={handleGoHome}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-amber-300 font-extrabold text-xl shadow-md border border-emerald-600/30">
              দ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                  {siteSettings.schoolNameBangla}
                </h1>
                <span className="hidden sm:inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  EIIN: ১২৩৪৫৬
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                {siteSettings.schoolNameEnglish} • অনলাইন একাডেমিক ফলাফল ও মার্কশীট পোর্টাল
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoHome}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>মূল ওয়েবসাইটে ফিরুন</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <AcademicResultsSearch />
      </main>

      {/* Institutional Footer */}
      <footer className="bg-[#052e22] text-emerald-100/90 py-8 border-t border-emerald-900/60 print:hidden text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-bold text-white block text-sm mb-1">{siteSettings.schoolNameBangla}</span>
            <p className="text-[11px] text-emerald-200/70">
              দাদরা, জয়পুরহাট সদর, রাজশাহী • ফোন: {siteSettings.phone1} • ইমেইল: {siteSettings.email}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <button onClick={handleGoHome} className="hover:text-white transition cursor-pointer">
              হোম পেজ
            </button>
            <span>•</span>
            <span className="text-emerald-300">মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, রাজশাহী</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
