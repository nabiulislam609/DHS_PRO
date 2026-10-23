import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { GraduationCap, MapPin, Phone, Mail, Heart } from 'lucide-react';

// Authentic Brand Icons
const FacebookIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const YouTubeIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const InstagramIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const WhatsAppIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

const LinkedInIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const getWhatsAppUrl = (val: string) => {
  if (!val) return '';
  if (val.startsWith('http://') || val.startsWith('https://')) return val;
  const digitsOnly = val.replace(/[^0-9]/g, '');
  return `https://wa.me/${digitsOnly}`;
};

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
              <img
                src={siteSettings.logoUrl || '/assets/aistudio/Logo_a3f5277a.png'}
                alt="Logo"
                className="w-11 h-11 rounded-full object-cover border-[2.5px] border-[#F59E0B] bg-[#00A859] shadow-xs"
              />
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
            <div className="flex items-center gap-2.5 pt-2 text-xs">
              {siteSettings.facebook && (
                <a
                  href={siteSettings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#1877F2] flex items-center justify-center transition-all duration-200 cursor-pointer text-white/90 hover:text-white shadow-xs hover:scale-110"
                  title="Facebook"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-4 h-4 fill-current" />
                </a>
              )}
              {siteSettings.youtube && (
                <a
                  href={siteSettings.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#FF0000] flex items-center justify-center transition-all duration-200 cursor-pointer text-white/90 hover:text-white shadow-xs hover:scale-110"
                  title="YouTube"
                  aria-label="YouTube"
                >
                  <YouTubeIcon className="w-4 h-4 fill-current" />
                </a>
              )}
              {siteSettings.instagram && (
                <a
                  href={siteSettings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] flex items-center justify-center transition-all duration-200 cursor-pointer text-white/90 hover:text-white shadow-xs hover:scale-110"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-4 h-4 fill-current" />
                </a>
              )}
              {siteSettings.whatsapp && (
                <a
                  href={getWhatsAppUrl(siteSettings.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#25D366] flex items-center justify-center transition-all duration-200 cursor-pointer text-white/90 hover:text-white shadow-xs hover:scale-110"
                  title="WhatsApp"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current" />
                </a>
              )}
              {siteSettings.linkedin && (
                <a
                  href={siteSettings.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#0A66C2] flex items-center justify-center transition-all duration-200 cursor-pointer text-white/90 hover:text-white shadow-xs hover:scale-110"
                  title="LinkedIn"
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon className="w-4 h-4 fill-current" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Quick Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">
              {siteSettings.footerCol2Title || 'অনলাইন সেবা ও লিংক'}
            </h4>
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
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">
              {siteSettings.footerCol3Title || 'মেনু নেভিগেশন'}
            </h4>
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
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">
              {siteSettings.footerCol4Title || 'যোগাযোগ'}
            </h4>
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
            <p className="text-[11px] text-emerald-400/80 mt-0.5 flex items-center gap-2 justify-center md:justify-start">
              <span>স্থাপিত: {siteSettings.establishedYear || '১৯৮২'}</span>
              <span>•</span>
              <span className="font-mono text-emerald-300 font-semibold">EIIN: {siteSettings.eiin || '121820'}</span>
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
