import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { GraduationCap, MapPin, Phone, Mail, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { siteSettings, setViewMode, setCurrentFrontendPage, currentFrontendPage } = useSchool();

  const navigateToTeachers = () => {
    setCurrentFrontendPage('teachers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToStaff = () => {
    setCurrentFrontendPage('staff');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToNotices = () => {
    setCurrentFrontendPage('notices');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToResults = () => {
    setCurrentFrontendPage('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmitCard = () => {
    setCurrentFrontendPage('admit-card');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToForms = () => {
    setCurrentFrontendPage('important-forms');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollTo = (id: string) => {
    if (id === 'teachers') {
      navigateToTeachers();
      return;
    }
    if (id === 'staff') {
      navigateToStaff();
      return;
    }
    if (id === 'hero' || id === 'home') {
      if (currentFrontendPage !== 'home') {
        setCurrentFrontendPage('home');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentFrontendPage !== 'home') {
      setCurrentFrontendPage('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#062117] text-gray-300 pt-14 pb-8 border-t border-emerald-950/80 print:hidden mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-white/10">
          {/* Col 1: Brand (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              {siteSettings.logoUrl ? (
                <img
                  src={siteSettings.logoUrl}
                  alt="Logo"
                  className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 bg-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-400 border-2 border-emerald-600 flex items-center justify-center text-emerald-950">
                  <GraduationCap className="w-6 h-6" />
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  {siteSettings.schoolNameBangla}
                </h3>
                <p className="text-[11px] text-emerald-400 font-medium">
                  {siteSettings.schoolNameEnglish}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              {siteSettings.tagline || siteSettings.motto}
            </p>

            {/* Social media links */}
            <div className="flex items-center gap-3 pt-2 text-xs">
              {siteSettings.facebook && (
                <a
                  href={siteSettings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-emerald-600 flex items-center justify-center transition cursor-pointer text-white font-bold"
                  title="Facebook"
                >
                  f
                </a>
              )}
              {siteSettings.youtube && (
                <a
                  href={siteSettings.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-emerald-600 flex items-center justify-center transition cursor-pointer text-white font-bold"
                  title="YouTube"
                >
                  yt
                </a>
              )}
              {siteSettings.instagram && (
                <a
                  href={siteSettings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-emerald-600 flex items-center justify-center transition cursor-pointer text-white font-bold"
                  title="Instagram"
                >
                  in
                </a>
              )}
              {siteSettings.whatsapp && (
                <a
                  href={siteSettings.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-emerald-600 flex items-center justify-center transition cursor-pointer text-white font-bold"
                  title="WhatsApp"
                >
                  wa
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Quick Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">অনলাইন সেবা ও লিংক</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button onClick={navigateToAdmitCard} className="hover:text-amber-300 transition cursor-pointer flex items-center gap-1.5 text-emerald-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  অনলাইন প্রবেশপত্র (Admit Card)
                </button>
              </li>
              <li>
                <button onClick={navigateToResults} className="hover:text-amber-300 transition cursor-pointer flex items-center gap-1.5 text-emerald-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  একাডেমিক ফলাফল ও নম্বরপত্র
                </button>
              </li>
              <li>
                <button onClick={navigateToNotices} className="hover:text-amber-300 transition cursor-pointer">
                  নোটিশ বোর্ড ও সার্কুলার
                </button>
              </li>
              <li>
                <button onClick={navigateToForms} className="hover:text-amber-300 transition cursor-pointer">
                  ফরম ও ডাউনলোড পোর্টাল
                </button>
              </li>
              <li>
                <button onClick={navigateToTeachers} className="hover:text-amber-300 transition cursor-pointer">
                  শিক্ষক মণ্ডলীর তালিকা
                </button>
              </li>
              <li>
                <button onClick={navigateToStaff} className="hover:text-amber-300 transition cursor-pointer">
                  কর্মকর্তা ও কর্মচারী
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('programs')} className="hover:text-amber-300 transition cursor-pointer">
                  একাডেমিক প্রোগ্রাম ও পাঠ্যসূচি
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Menu (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">মেনু নেভিগেশন</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><button onClick={() => scrollTo('hero')} className="hover:text-amber-300 transition cursor-pointer">হোম পেজ</button></li>
              <li><button onClick={() => scrollTo('about')} className="hover:text-amber-300 transition cursor-pointer">পরিচিতি ও ইতিহাস</button></li>
              <li><button onClick={navigateToTeachers} className="hover:text-amber-300 transition cursor-pointer">শিক্ষকবৃন্দ</button></li>
              <li><button onClick={navigateToNotices} className="hover:text-amber-300 transition cursor-pointer">নোটিশ</button></li>
              <li><button onClick={() => scrollTo('news')} className="hover:text-amber-300 transition cursor-pointer">সর্বশেষ সংবাদ</button></li>
              <li><button onClick={() => scrollTo('events')} className="hover:text-amber-300 transition cursor-pointer">ইভেন্ট ক্যালেন্ডার</button></li>
              <li><button onClick={() => scrollTo('gallery')} className="hover:text-amber-300 transition cursor-pointer">ফটো গ্যালারি</button></li>
              <li><button onClick={() => scrollTo('contact')} className="hover:text-amber-300 transition cursor-pointer">যোগাযোগ</button></li>
            </ul>
          </div>

          {/* Col 4: Contact (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">যোগাযোগ</h4>
            <div className="space-y-2.5 text-xs text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{siteSettings.address || 'দাদরা, জয়পুরহাট সদর, রাজশাহী'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{siteSettings.phone1 || '+880 1711-123456'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{siteSettings.email || 'info@dadrahs.edu.bd'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Affiliation */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-3 text-center md:text-left">
          <div>
            <p>
              {siteSettings.copyrightText || `© 2026 ${siteSettings.schoolNameBangla} (${siteSettings.schoolNameEnglish})। সর্বস্বত্ব সংরক্ষিত।`}
            </p>
            <p className="text-[11px] text-emerald-400/80 mt-0.5">
              EIIN: {siteSettings.eiin || '121820'} • স্থাপিত: {siteSettings.establishedYear || '১৯৮২'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 text-xs">
            <span className="text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/60 font-medium">
              {siteSettings.boardAffiliation || 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, রাজশাহী অনুমোদিত'}
            </span>
            <div className="flex items-center gap-1 text-emerald-400">
              <span>{siteSettings.footerCreditPrefix || 'সাথে'}</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>{siteSettings.footerCreditText || 'ছাত্র-শিক্ষক ঐক্য'}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
