import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { GraduationCap, MapPin, Phone, Mail, Heart, LogIn } from 'lucide-react';

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
    <footer className="w-full bg-[#062117] text-gray-300 pt-16 pb-8 border-t border-emerald-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-white/10">
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
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">দ্রুত লিংক</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button onClick={() => scrollTo('about')} className="hover:text-amber-300 transition cursor-pointer">
                  পরিচিতি
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentFrontendPage('teachers')} className="hover:text-amber-300 transition cursor-pointer">
                  শিক্ষক মণ্ডলী
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentFrontendPage('staff')} className="hover:text-amber-300 transition cursor-pointer">
                  কর্মকর্তা ও কর্মচারী
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('notices')} className="hover:text-amber-300 transition cursor-pointer">
                  নোটিশ বোর্ড
                </button>
              </li>
              <li>
                <button onClick={navigateToNotices} className="hover:text-amber-300 transition cursor-pointer">
                  সকল নোটিশ আর্কাইভ
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('programs')} className="hover:text-amber-300 transition cursor-pointer">
                  একাডেমিক প্রোগ্রাম
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('gallery')} className="hover:text-amber-300 transition cursor-pointer">
                  গ্যালারি
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('contact')} className="hover:text-amber-300 transition cursor-pointer">
                  যোগাযোগ
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Menu (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">মেনু</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><button onClick={() => scrollTo('hero')} className="hover:text-amber-300 transition cursor-pointer">হোম</button></li>
              <li><button onClick={() => scrollTo('about')} className="hover:text-amber-300 transition cursor-pointer">পরিচিতি</button></li>
              <li><button onClick={navigateToTeachers} className="hover:text-amber-300 transition cursor-pointer">শিক্ষক</button></li>
              <li><button onClick={() => scrollTo('notices')} className="hover:text-amber-300 transition cursor-pointer">নোটিশ</button></li>
              <li><button onClick={() => scrollTo('news')} className="hover:text-amber-300 transition cursor-pointer">সংবাদ</button></li>
              <li><button onClick={() => scrollTo('events')} className="hover:text-amber-300 transition cursor-pointer">ইভেন্ট</button></li>
              <li><button onClick={() => scrollTo('programs')} className="hover:text-amber-300 transition cursor-pointer">একাডেমিক</button></li>
              <li><button onClick={() => scrollTo('gallery')} className="hover:text-amber-300 transition cursor-pointer">গ্যালারি</button></li>
            </ul>
          </div>

          {/* Col 4: Contact (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">যোগাযোগ</h4>
            <div className="space-y-2.5 text-xs text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{siteSettings.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{siteSettings.phone1}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{siteSettings.email}</span>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => setViewMode('backend')}
                  className="flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded border border-white/10 transition cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>অ্যাডমিন প্যানেলে প্রবেশ</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-3">
          <p>{siteSettings.copyrightText || `© 2025 ${siteSettings.schoolNameBangla} (${siteSettings.schoolNameEnglish})। সর্বস্বত্ব সংরক্ষিত।`}</p>
          <div className="flex items-center gap-1 text-emerald-400">
            <span>সাথে</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>ছাত্র-শিক্ষক ঐক্য</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
