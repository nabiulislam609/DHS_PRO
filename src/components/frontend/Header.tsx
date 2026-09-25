import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { NavigationItem } from '../../types';
import {
  Phone,
  Mail,
  Clock,
  LogIn,
  GraduationCap,
  Menu,
  X,
  ChevronDown,
  Award,
  Users,
  Building2,
  Download,
  CreditCard,
  FileText,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    siteSettings,
    setViewMode,
    setIsAdmissionModalOpen,
    currentFrontendPage,
    setCurrentFrontendPage,
    navigationItems,
  } = useSchool();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false);
  const [mobileDownloadOpen, setMobileDownloadOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const aboutDropdownRef = useRef<HTMLDivElement>(null);
  const downloadDropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking anywhere outside on the website or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (aboutDropdownRef.current && !aboutDropdownRef.current.contains(target)) {
        setAboutDropdownOpen(false);
      }
      if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(target)) {
        setDownloadDropdownOpen(false);
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(target)) {
        setMoreDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAboutDropdownOpen(false);
        setDownloadDropdownOpen(false);
        setMoreDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Strictly respect navigationItems order and visibility configured in backend
  const processedNavItems = useMemo(() => {
    return navigationItems
      .filter(
        (item) =>
          item.visible &&
          item.url !== '#teachers' &&
          item.url !== '#staff' &&
          item.label !== 'শিক্ষক' &&
          !item.label.includes('কর্মচারী')
      )
      .slice()
      .sort((a, b) => a.order - b.order);
  }, [navigationItems]);

  const handleHomeClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    setAboutDropdownOpen(false);
    setMoreDropdownOpen(false);

    if (currentFrontendPage !== 'home') {
      setCurrentFrontendPage('home');
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }, 50);
      return;
    }

    // Scroll directly to the very top so Header and NoticeTicker are fully visible
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    setAboutDropdownOpen(false);
    setMoreDropdownOpen(false);

    if (id === 'home' || id === 'hero') {
      handleHomeClick();
      return;
    }

    if (currentFrontendPage !== 'home') {
      setCurrentFrontendPage('home');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigateToResults = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    setCurrentFrontendPage('results');
  };

  const navigateToNotices = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    setCurrentFrontendPage('notices');
  };

  const navigateToTeachers = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    setAboutDropdownOpen(false);
    setMoreDropdownOpen(false);
    setCurrentFrontendPage('teachers');
  };

  const navigateToStaff = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    setAboutDropdownOpen(false);
    setDownloadDropdownOpen(false);
    setMoreDropdownOpen(false);
    setCurrentFrontendPage('staff');
  };

  const navigateToAdmitCard = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    setAboutDropdownOpen(false);
    setDownloadDropdownOpen(false);
    setMoreDropdownOpen(false);
    setCurrentFrontendPage('admit-card');
  };

  const navigateToForms = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    setAboutDropdownOpen(false);
    setDownloadDropdownOpen(false);
    setMoreDropdownOpen(false);
    setCurrentFrontendPage('important-forms');
  };

  const topBarPaddingY =
    siteSettings.topBarPaddingY !== undefined
      ? siteSettings.topBarPaddingY
      : siteSettings.topBarHeight === 'compact'
      ? 3
      : siteSettings.topBarHeight === 'spacious'
      ? 12
      : 6;

  const navPaddingY =
    siteSettings.navbarPaddingY !== undefined
      ? siteSettings.navbarPaddingY
      : siteSettings.navbarHeight === 'compact'
      ? 6
      : siteSettings.navbarHeight === 'spacious'
      ? 18
      : 10;

  const logoSizeClass =
    navPaddingY <= 7
      ? 'w-9 h-9 sm:w-10 sm:h-10'
      : navPaddingY >= 16
      ? 'w-12 h-12 sm:w-14 sm:h-14'
      : 'w-10 h-10 sm:w-11 sm:h-11';

  return (
    <header className="w-full bg-white shadow-xs border-b border-gray-100 sticky top-0 z-40 transition-all duration-200">
      {/* Top Bar with Deep Green Background */}
      {siteSettings.showTopBar !== false && (
        <div
          className="bg-[#0f5338] text-white text-xs px-4 sm:px-8 transition-all"
          style={{
            paddingTop: `${topBarPaddingY}px`,
            paddingBottom: `${topBarPaddingY}px`,
          }}
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            {/* Left Contact Info */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-1.5 hover:text-emerald-200 transition">
                <Phone className="w-3.5 h-3.5 text-emerald-300" />
                <span>{siteSettings.topBarPhone || siteSettings.phone1}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 hover:text-emerald-200 transition">
                <Mail className="w-3.5 h-3.5 text-emerald-300" />
                <span>{siteSettings.topBarEmail || siteSettings.email}</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 text-emerald-100">
                <Clock className="w-3.5 h-3.5 text-emerald-300" />
                <span>{siteSettings.topBarOfficeHours || siteSettings.officeHours}</span>
              </div>
            </div>

            {/* Right Social & Admin Panel Switcher */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-3 text-emerald-200">
                <a
                  href={siteSettings.topBarFacebookUrl || siteSettings.facebook || '#'}
                  target={siteSettings.facebook ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  {siteSettings.topBarFacebookText || 'Facebook'}
                </a>
                <span>•</span>
                <a
                  href={siteSettings.topBarYoutubeUrl || siteSettings.youtube || '#'}
                  target={siteSettings.youtube ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  {siteSettings.topBarYoutubeText || 'YouTube'}
                </a>
                <span>•</span>
                <a
                  href={siteSettings.topBarInstagramUrl || siteSettings.instagram || '#'}
                  target={siteSettings.instagram ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  {siteSettings.topBarInstagramText || 'Instagram'}
                </a>
              </div>

              {/* Admin Login / Panel Button matching the screenshot */}
              <button
                onClick={() => setViewMode('backend')}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded text-xs font-medium text-emerald-50 transition border border-white/20 hover:border-white/40 cursor-pointer"
                title="অ্যাডমিন প্যানেল এ প্রবেশ করুন"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{siteSettings.topBarAdminText || 'Admin'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div
        className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between transition-all duration-200"
        style={{ paddingTop: `${navPaddingY}px`, paddingBottom: `${navPaddingY}px` }}
      >
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer" onClick={handleHomeClick}>
          {siteSettings.logoUrl ? (
            <img
              src={siteSettings.logoUrl}
              alt="Logo"
              className={`${logoSizeClass} rounded-full object-cover border-2 border-emerald-800 shadow-xs bg-white transition-all`}
            />
          ) : (
            <div className={`${logoSizeClass} rounded-full bg-amber-400 border-2 border-emerald-800 flex items-center justify-center shadow-xs text-emerald-950 font-bold transition-all`}>
              <GraduationCap className="w-6 h-6 text-emerald-900" />
            </div>
          )}
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-emerald-900 leading-tight">
              {siteSettings.schoolNameBangla}
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium tracking-wide">
              {siteSettings.schoolNameEnglish}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-4 sm:gap-4.5 text-[13px] sm:text-sm font-medium text-gray-700">
          {processedNavItems.map((item) => {
            const isAbout = item.label === 'পরিচিতি' || item.url === '#about';
            if (isAbout) {
              return (
                <div className="relative" key={item.id} ref={aboutDropdownRef}>
                  <button
                    onClick={() => {
                      setAboutDropdownOpen((prev) => {
                        if (!prev) setMoreDropdownOpen(false);
                        return !prev;
                      });
                    }}
                    className={`flex items-center gap-1 hover:text-emerald-700 transition cursor-pointer ${
                      aboutDropdownOpen ? 'text-emerald-700 font-semibold' : ''
                    }`}
                  >
                    <span>পরিচিতি</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${aboutDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {aboutDropdownOpen && (
                    <div
                      className="absolute top-full mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50 animate-fadeIn"
                      onMouseLeave={() => setAboutDropdownOpen(false)}
                    >
                      <button
                        onClick={() => {
                          scrollToSection('about');
                          setAboutDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-gray-700 text-xs transition cursor-pointer"
                      >
                        বিদ্যালয় পরিচিতি
                      </button>
                      <button
                        onClick={() => {
                          navigateToTeachers();
                          setAboutDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-gray-700 text-xs transition cursor-pointer"
                      >
                        শিক্ষক মণ্ডলী
                      </button>
                      <button
                        onClick={() => {
                          navigateToStaff();
                          setAboutDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-gray-700 text-xs transition cursor-pointer"
                      >
                        কর্মকর্তা ও কর্মচারী
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            const isDownloads =
              item.label === 'ডাউনলোড' ||
              item.url === '#downloads' ||
              item.id === 'nav-downloads' ||
              (item.subItems && item.subItems.length > 0);

            if (isDownloads) {
              const activeSubItems = item.subItems?.filter((s) => s.visible !== false) || [
                {
                  id: 'sub-admit',
                  label: 'অ্যাডমিট কার্ড',
                  url: '/admit-card',
                  order: 0,
                  visible: true,
                  badge: 'Admit Card',
                  description: 'পরীক্ষার প্রবেশপত্র ও সিট প্ল্যান ডাউনলোড',
                },
                {
                  id: 'sub-forms',
                  label: 'গুরুত্বপূর্ণ ফরমসমূহ',
                  url: '/important-forms',
                  order: 1,
                  visible: true,
                  badge: 'Forms',
                  description: 'ভর্তি ফরম, প্রশংসাপত্র, প্রত্যয়ন ও প্রাতিষ্ঠানিক ফরম',
                },
              ];

              return (
                <div className="relative" key={item.id} ref={downloadDropdownRef}>
                  <button
                    onClick={() => {
                      setDownloadDropdownOpen((prev) => {
                        if (!prev) {
                          setAboutDropdownOpen(false);
                          setMoreDropdownOpen(false);
                        }
                        return !prev;
                      });
                    }}
                    className={`flex items-center gap-1 hover:text-emerald-700 transition cursor-pointer ${
                      downloadDropdownOpen || currentFrontendPage === 'admit-card' || currentFrontendPage === 'important-forms'
                        ? 'text-emerald-700 font-semibold'
                        : ''
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        downloadDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {downloadDropdownOpen && (
                    <div
                      className="absolute top-full mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 animate-fadeIn"
                      onMouseLeave={() => setDownloadDropdownOpen(false)}
                    >
                      <div className="px-3.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
                        ডাউনলোড পোর্টাল
                      </div>
                      {activeSubItems.map((sub) => {
                        const isAdmit =
                          sub.url.includes('admit') ||
                          sub.url.includes('admin') ||
                          sub.label.includes('অ্যাডমিট') ||
                          sub.label.includes('এডমিট') ||
                          sub.label.includes('অ্যাডমিন') ||
                          sub.label.includes('প্রবেশপত্র');
                        const isForms =
                          sub.url.includes('form') ||
                          sub.label.includes('ফরম') ||
                          sub.label.includes('ফ্রম');

                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setDownloadDropdownOpen(false);
                              if (isAdmit) {
                                navigateToAdmitCard();
                              } else if (isForms) {
                                navigateToForms();
                              } else if (sub.url.startsWith('#')) {
                                scrollToSection(sub.url.substring(1));
                              } else {
                                window.location.href = sub.url;
                              }
                            }}
                            className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50/80 text-gray-700 text-xs transition cursor-pointer flex items-start gap-2.5 group"
                          >
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-700 group-hover:text-white transition">
                              {isAdmit ? (
                                <CreditCard className="w-3.5 h-3.5" />
                              ) : (
                                <FileText className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-gray-900 group-hover:text-emerald-900">
                                  {sub.label}
                                </span>
                                {sub.badge && (
                                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                                    {sub.badge}
                                  </span>
                                )}
                              </div>
                              {sub.description && (
                                <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                                  {sub.description}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isResults = item.label === 'ফলাফল' || item.url === '/results' || item.url === '#results';

            return (
              <button
                key={item.id}
                onClick={() => {
                  setAboutDropdownOpen(false);
                  setMoreDropdownOpen(false);
                  if (
                    item.label === 'হোম' ||
                    item.url === '#home' ||
                    item.url === '#hero' ||
                    item.url === '/' ||
                    item.url === '#'
                  ) {
                    handleHomeClick();
                  } else if (isResults) {
                    navigateToResults();
                  } else if (item.url === '/notices' || item.url === '#notices-page') {
                    navigateToNotices();
                  } else if (item.url.startsWith('#')) {
                    scrollToSection(item.url.substring(1));
                  } else {
                    window.location.href = item.url;
                  }
                }}
                className={`transition cursor-pointer ${
                  isResults
                    ? 'hover:text-emerald-700 text-emerald-800 font-semibold'
                    : 'hover:text-emerald-700'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* More Dropdown */}
          <div className="relative" ref={moreDropdownRef}>
            <button
              onClick={() => {
                setMoreDropdownOpen((prev) => {
                  if (!prev) setAboutDropdownOpen(false);
                  return !prev;
                });
              }}
              className={`flex items-center gap-1 hover:text-emerald-700 transition cursor-pointer ${
                moreDropdownOpen ? 'text-emerald-700 font-semibold' : ''
              }`}
            >
              <span>আরও</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {moreDropdownOpen && (
              <div
                className="absolute top-full mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50 animate-fadeIn"
                onMouseLeave={() => setMoreDropdownOpen(false)}
              >
                <button
                  onClick={() => { scrollToSection('leadership'); setMoreDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-gray-700 text-xs transition cursor-pointer"
                >
                  নেতৃত্বের বার্তা
                </button>
                <button
                  onClick={() => { scrollToSection('achievements'); setMoreDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-gray-700 text-xs transition cursor-pointer"
                >
                  আমাদের অর্জন
                </button>
              </div>
            )}
          </div>

          {/* Admission Apply Button */}
          <button
            onClick={() => {
              setAboutDropdownOpen(false);
              setMoreDropdownOpen(false);
              setIsAdmissionModalOpen(true);
            }}
            className="bg-[#15803d] hover:bg-[#166534] text-white px-3.5 py-1.5 rounded-lg font-semibold shadow-xs hover:shadow transition cursor-pointer text-xs sm:text-sm"
          >
            ভর্তি আবেদন
          </button>

          {siteSettings.showTopBar === false && (
            <button
              onClick={() => setViewMode('backend')}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border border-gray-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
              title="অ্যাডমিন প্যানেল এ প্রবেশ করুন"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-700" />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex xl:hidden items-center gap-2">
          <button
            onClick={() => setIsAdmissionModalOpen(true)}
            className="bg-[#15803d] text-white px-3 py-1.5 rounded text-xs font-semibold"
          >
            ভর্তি আবেদন
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700 hover:text-emerald-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3 text-sm font-medium text-gray-800 shadow-md">
          {processedNavItems.map((item) => {
            const isAbout = item.label === 'পরিচিতি' || item.url === '#about';
            if (isAbout) {
                return (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between py-1">
                      <button
                        onClick={() => scrollToSection('about')}
                        className="text-left hover:text-emerald-700 cursor-pointer font-medium"
                      >
                        পরিচিতি
                      </button>
                      <button
                        onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                        className="p-1 text-gray-500 hover:text-emerald-700 cursor-pointer"
                        title="সাবমেনু খুলুন/বন্ধ করুন"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            mobileAboutOpen ? 'rotate-180 text-emerald-700' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {mobileAboutOpen && (
                      <div className="pl-4 pr-2 py-1.5 space-y-1 text-xs bg-gray-50 rounded-lg border-l-2 border-emerald-600">
                        <button
                          onClick={() => scrollToSection('about')}
                          className="block w-full text-left py-1 text-gray-700 hover:text-emerald-800"
                        >
                          বিদ্যালয় পরিচিতি
                        </button>
                        <button
                          onClick={navigateToTeachers}
                          className="block w-full text-left py-1 text-gray-700 hover:text-emerald-800"
                        >
                          শিক্ষক মণ্ডলী
                        </button>
                        <button
                          onClick={navigateToStaff}
                          className="block w-full text-left py-1 text-gray-700 hover:text-emerald-800"
                        >
                          কর্মকর্তা ও কর্মচারী
                        </button>
                      </div>
                    )}
                  </div>
                );
              }

              const isDownloads =
                item.label === 'ডাউনলোড' ||
                item.url === '#downloads' ||
                item.id === 'nav-downloads' ||
                (item.subItems && item.subItems.length > 0);

              if (isDownloads) {
                const activeSubItems = item.subItems?.filter((s) => s.visible !== false) || [
                  {
                    id: 'sub-admit',
                    label: 'অ্যাডমিট কার্ড',
                    url: '/admit-card',
                  },
                  {
                    id: 'sub-forms',
                    label: 'গুরুত্বপূর্ণ ফরমসমূহ',
                    url: '/important-forms',
                  },
                ];

                return (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between py-1">
                      <button
                        onClick={() => setMobileDownloadOpen(!mobileDownloadOpen)}
                        className="text-left hover:text-emerald-700 cursor-pointer font-medium flex items-center gap-1.5"
                      >
                        <Download className="w-4 h-4 text-emerald-700" />
                        <span>{item.label}</span>
                      </button>
                      <button
                        onClick={() => setMobileDownloadOpen(!mobileDownloadOpen)}
                        className="p-1 text-gray-500 hover:text-emerald-700 cursor-pointer"
                        title="সাবমেনু খুলুন/বন্ধ করুন"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            mobileDownloadOpen ? 'rotate-180 text-emerald-700' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {mobileDownloadOpen && (
                      <div className="pl-4 pr-2 py-1.5 space-y-1 text-xs bg-emerald-50/50 rounded-lg border-l-2 border-emerald-600">
                        {activeSubItems.map((sub) => {
                          const isAdmit =
                            sub.url.includes('admit') ||
                            sub.url.includes('admin') ||
                            sub.label.includes('অ্যাডমিট') ||
                            sub.label.includes('এডমিট') ||
                            sub.label.includes('অ্যাডমিন') ||
                            sub.label.includes('প্রবেশপত্র');
                          const isForms =
                            sub.url.includes('form') ||
                            sub.label.includes('ফরম') ||
                            sub.label.includes('ফ্রম');

                          return (
                            <button
                              key={sub.id}
                              onClick={() => {
                                setMobileMenuOpen(false);
                                if (isAdmit) {
                                  navigateToAdmitCard();
                                } else if (isForms) {
                                  navigateToForms();
                                } else if (sub.url.startsWith('#')) {
                                  scrollToSection(sub.url.substring(1));
                                } else {
                                  window.location.href = sub.url;
                                }
                              }}
                              className="block w-full text-left py-1 text-gray-700 hover:text-emerald-800 font-medium"
                            >
                              • {sub.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (
                      item.label === 'হোম' ||
                      item.url === '#home' ||
                      item.url === '#hero' ||
                      item.url === '/' ||
                      item.url === '#'
                    ) {
                      handleHomeClick();
                    } else if (item.url.startsWith('#') && item.url !== '#notices-page') {
                      scrollToSection(item.url.substring(1));
                    } else if (item.url === '/results' || item.url === '#results' || item.label === 'ফলাফল') {
                      navigateToResults();
                    } else if (item.url === '/notices' || item.url === '#notices-page') {
                      navigateToNotices();
                    } else {
                      window.location.href = item.url;
                    }
                  }}
                  className="block w-full text-left py-1 hover:text-emerald-700 cursor-pointer"
                >
                  {item.label}
                </button>
              );
            })}
          <button
            onClick={navigateToResults}
            className="block w-full text-left py-1 text-emerald-800 font-bold hover:text-emerald-900 cursor-pointer"
          >
            পরীক্ষার ফলাফল ও মার্কশীট
          </button>
          <button
            onClick={navigateToNotices}
            className="block w-full text-left py-1 text-emerald-800 font-bold hover:text-emerald-900 cursor-pointer"
          >
            সকল নোটিশ ও বিজ্ঞপ্তি
          </button>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setViewMode('backend');
              }}
              className="flex items-center gap-2 text-emerald-800 font-semibold"
            >
              <LogIn className="w-4 h-4" />
              <span>অ্যাডমিন ড্যাশবোর্ডে যান</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
