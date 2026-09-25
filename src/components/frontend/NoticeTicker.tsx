import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Bell } from 'lucide-react';

export const NoticeTicker: React.FC = () => {
  const { notices, siteSettings } = useSchool();

  // If set to hidden from settings, do not render
  if (siteSettings.showNoticeTicker === false) {
    return null;
  }

  const speedDuration = siteSettings.noticeTickerSpeed || 60;
  const tickerLabel = siteSettings.noticeTickerLabel || 'সর্বশেষ নোটিশ:';

  const tickerPaddingY =
    siteSettings.noticeTickerPaddingY !== undefined
      ? siteSettings.noticeTickerPaddingY
      : siteSettings.noticeTickerHeight === 'compact'
      ? 4
      : siteSettings.noticeTickerHeight === 'spacious'
      ? 14
      : 8;

  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'জরুরি':
        return 'bg-rose-600 text-white';
      case 'ভর্তি':
        return 'bg-amber-600 text-white';
      case 'পরীক্ষা':
        return 'bg-purple-600 text-white';
      case 'ক্রীড়া':
        return 'bg-blue-600 text-white';
      case 'অনুষ্ঠান':
        return 'bg-emerald-600 text-white';
      default:
        return 'bg-teal-700 text-white';
    }
  };

  return (
    <div
      id="notice-ticker"
      className="w-full bg-[#053527] border-b border-[#042b1f] text-white px-4 sm:px-8 overflow-hidden relative z-20 shadow-xs transition-all"
      style={{
        paddingTop: `${tickerPaddingY}px`,
        paddingBottom: `${tickerPaddingY}px`,
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-3 sm:gap-4">
        {/* Ticker Title Badge - perfectly centered with header container */}
        <div className="inline-flex items-center justify-center gap-2 bg-[#0f4d3a] text-amber-300 border border-[#1b6a52] px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 shadow-xs select-none">
          <Bell className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="leading-none text-center pt-0.5">{tickerLabel}</span>
        </div>

        {/* Subtle Vertical Divider */}
        <div className="h-4 w-px bg-white/15 shrink-0 hidden sm:block" />

        {/* Marquee Content with smooth edge gradient */}
        <div className="overflow-hidden relative w-full whitespace-nowrap mask-fade">
          {/* Subtle Left Fade so items don't collide with the badge */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#053527] to-transparent z-10 pointer-events-none" />
          {/* Subtle Right Fade */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#053527] to-transparent z-10 pointer-events-none" />

          <div
            className="inline-flex items-center gap-6 animate-marquee py-0.5"
            style={{ animationDuration: `${speedDuration}s` }}
          >
            {[...notices, ...notices].map((notice, idx) => (
              <a
                key={`${notice.id}-${idx}`}
                href="#notices"
                className="inline-flex items-center gap-2.5 hover:text-amber-300 transition text-xs sm:text-sm font-medium shrink-0 group select-none"
              >
                <span
                  className={`inline-flex items-center justify-center px-2.5 h-[21px] rounded-md text-[11px] font-bold leading-none shadow-2xs select-none shrink-0 ${getBadgeColor(
                    notice.category
                  )}`}
                >
                  <span className="inline-block leading-none text-center transform translate-y-[1.5px]">
                    {notice.category}
                  </span>
                </span>
                <span className="leading-normal group-hover:underline flex items-center">
                  {notice.code ? `${notice.code} : ` : ''}{notice.title}
                </span>
                <span className="text-emerald-400/80 font-bold ml-1">•</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
