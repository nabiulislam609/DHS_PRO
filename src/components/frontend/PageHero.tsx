import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export interface PageHeroProps {
  title: string;
  description: string;
  breadcrumbs?: Array<{ label: string; onClick?: () => void }>;
  pageName?: string; // fallback for breadcrumb
  badgeText?: string;
  badgeIcon?: React.ReactNode;
  stats?: React.ReactNode;
}

export const PageHero: React.FC<PageHeroProps> = ({
  title,
  description,
  breadcrumbs,
  pageName,
  badgeText,
  badgeIcon,
  stats,
}) => {
  const { setCurrentFrontendPage } = useSchool();

  const handleGoHome = () => {
    setCurrentFrontendPage('home');
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#064E3B] text-white pt-9 pb-24 px-4 sm:px-8 relative overflow-hidden print:hidden select-none">
      {/* Decorative crisp circular arc on top right (exact match to user screenshot 2) */}
      <div
        className="absolute -top-20 -right-20 sm:-top-28 sm:-right-28 md:-top-32 md:-right-32 w-80 h-80 sm:w-[460px] sm:h-[460px] md:w-[540px] md:h-[540px] rounded-full pointer-events-none"
        style={{ backgroundColor: '#0B7A55', opacity: 0.38 }}
      />
      <div
        className="absolute -top-8 -right-8 sm:-top-12 sm:-right-12 w-48 h-48 sm:w-[280px] sm:h-[280px] rounded-full pointer-events-none"
        style={{ backgroundColor: '#0B7A55', opacity: 0.2 }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-emerald-200/90 mb-3.5 flex-wrap font-medium"
        >
          <button
            type="button"
            onClick={handleGoHome}
            className="inline-flex items-center gap-1 hover:text-white transition cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>হোম</span>
          </button>

          {breadcrumbs && breadcrumbs.length > 0 ? (
            breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400/60 shrink-0" />
                {crumb.onClick ? (
                  <button
                    type="button"
                    onClick={crumb.onClick}
                    className="hover:text-white transition cursor-pointer"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-white font-semibold">{crumb.label}</span>
                )}
              </React.Fragment>
            ))
          ) : (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400/60 shrink-0" />
              <span className="text-white font-semibold">{pageName || title}</span>
            </>
          )}
        </nav>

        {/* Hero Title & Description + Right stats if any */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-3xl">
            {badgeText && (
              <div className="inline-flex items-center gap-1.5 bg-[#0B7A55]/70 text-emerald-100 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-2.5 backdrop-blur-xs">
                {badgeIcon}
                <span>{badgeText}</span>
              </div>
            )}

            <h1 className="text-[26px] sm:text-[38px] font-extrabold text-white tracking-tight leading-tight">
              {title}
            </h1>

            <p className="text-emerald-100/85 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              {description}
            </p>
          </div>

          {stats && <div className="shrink-0">{stats}</div>}
        </div>
      </div>
    </div>
  );
};

// Also export DedicatedHeroBanner for backward compatibility
export const DedicatedHeroBanner = PageHero;
