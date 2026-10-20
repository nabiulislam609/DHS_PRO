import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ArrowLeft, GraduationCap } from 'lucide-react';

interface DedicatedHeaderProps {
  portalTitle: string;
  extraActions?: React.ReactNode;
}

export const DedicatedHeader: React.FC<DedicatedHeaderProps> = ({
  portalTitle,
  extraActions,
}) => {
  const { siteSettings, setCurrentFrontendPage } = useSchool();

  const handleGoHome = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setCurrentFrontendPage('home');
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const eiinNumber = siteSettings?.eiin || '121820';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs print:hidden transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Name - Exactly matching Home Page Header styling */}
        <div
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
          onClick={handleGoHome}
          title="হোম পেজে ফিরে যান"
        >
          {siteSettings.logoUrl ? (
            <img
              src={siteSettings.logoUrl}
              alt={siteSettings.schoolNameBangla}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-emerald-800 shadow-xs bg-white transition-transform duration-200 group-hover:scale-105 shrink-0 aspect-square"
            />
          ) : (
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-400 border-2 border-emerald-800 flex items-center justify-center shadow-xs text-emerald-950 font-bold transition-transform duration-200 group-hover:scale-105 shrink-0 aspect-square">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-900" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-emerald-900 leading-tight truncate">
                {siteSettings.schoolNameBangla}
              </h1>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-2xs font-mono shrink-0">
                EIIN: {eiinNumber}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium tracking-wide truncate">
              {siteSettings.schoolNameEnglish} • <span className="text-emerald-700 font-semibold">{portalTitle}</span>
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {extraActions}

          <button
            onClick={handleGoHome}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline">মূল ওয়েবসাইটে ফিরুন</span>
            <span className="xs:hidden">হোম</span>
          </button>
        </div>
      </div>
    </header>
  );
};
