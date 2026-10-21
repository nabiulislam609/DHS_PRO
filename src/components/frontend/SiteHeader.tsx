import React, { useState, useRef, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { SITE_CONFIG } from '../../config/siteConfig';
import { ArrowLeft, GraduationCap, MoreVertical, X } from 'lucide-react';

export interface MobileHeaderAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

export interface SiteHeaderProps {
  pageName: string;
  portalTitle?: string; // Backwards compatible alias
  extraActions?: React.ReactNode;
  mobileActions?: MobileHeaderAction[];
  showEiinBadge?: boolean;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  pageName,
  portalTitle,
  extraActions,
  mobileActions = [],
  showEiinBadge = false,
}) => {
  const { siteSettings, setCurrentFrontendPage } = useSchool();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayPageTitle = pageName || portalTitle || 'পোর্টাল';

  const handleGoHome = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    setCurrentFrontendPage('home');
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E2E8E4] shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand Logo & Name - Strict 12px min gap, Flex layout, No overlap */}
        <div
          className="flex items-center gap-3 sm:gap-3.5 cursor-pointer select-none group min-w-0"
          onClick={handleGoHome}
          title="হোম পেজে ফিরুন"
        >
          <img
            src={siteSettings.logoUrl || '/assets/aistudio/image_08094a8b.png'}
            alt={siteSettings.schoolNameBangla || SITE_CONFIG.schoolNameBangla}
            className="w-12 h-12 rounded-full object-cover border-[2.5px] border-[#F59E0B] shadow-xs bg-[#00A859] shrink-0 aspect-square group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />

          <div className="min-w-0 flex flex-col justify-center">
            <h1 className="text-base sm:text-lg font-bold text-[#14211B] leading-tight truncate group-hover:text-[#0B7A55] transition">
              {siteSettings.schoolNameBangla || SITE_CONFIG.schoolNameBangla}
            </h1>
            <p className="text-xs sm:text-[13px] text-[#5B6B63] font-medium tracking-wide truncate mt-0.5">
              <span>{siteSettings.schoolNameEnglish || SITE_CONFIG.schoolNameEnglish}</span>
              <span className="mx-1.5 text-gray-400 font-bold">·</span>
              <span className="text-[#0B7A55] font-semibold">{displayPageTitle}</span>
            </p>
          </div>
        </div>

        {/* Right Actions & EIIN Badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* EIIN Badge: Desktop only if explicitly requested */}
          {showEiinBadge && (
            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E8F5EE] border border-[#0B7A55]/30 text-[#064E3B] text-xs font-semibold font-mono tracking-wider shadow-2xs">
              <span className="text-[#0B7A55] font-sans text-[11px] font-bold">EIIN:</span>
              <span>{SITE_CONFIG.eiinBangla}</span>
            </div>
          )}

          {/* Desktop Navigation / Custom Actions */}
          <div className="hidden sm:flex items-center gap-2">
            {extraActions}
          </div>

          {/* Mobile "More" dropdown trigger (3 dots) */}
          {mobileActions.length > 0 && (
            <div className="relative sm:hidden" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="w-11 h-11 flex items-center justify-center rounded-xl border border-[#E2E8E4] bg-gray-50 hover:bg-gray-100 text-gray-700 transition cursor-pointer"
                aria-label="অতিরিক্ত অপশন"
                title="অতিরিক্ত অপশন"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <MoreVertical className="w-5 h-5" />}
              </button>

              {mobileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#E2E8E4] rounded-2xl shadow-xl py-2 z-50 animate-fadeIn space-y-1">
                  <div className="px-3.5 py-1.5 border-b border-[#E2E8E4] text-[11px] font-bold text-[#5B6B63] uppercase tracking-wider">
                    পেজ অপশন
                  </div>
                  {mobileActions.map((action, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        action.onClick();
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-[#14211B] hover:bg-[#E8F5EE] hover:text-[#064E3B] text-left transition cursor-pointer"
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Home button: matching screenshot 1 with [← হোম] */}
          <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-[#0B7A55] hover:bg-[#064E3B] active:bg-[#043327] text-white rounded-xl text-sm font-bold shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer min-w-[44px]"
            title="হোম পেজে ফিরুন"
            aria-label="হোম"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>হোম</span>
          </button>
        </div>
      </div>
    </header>
  );
};

// Also export DedicatedHeader for backward compatibility
export const DedicatedHeader = SiteHeader;
