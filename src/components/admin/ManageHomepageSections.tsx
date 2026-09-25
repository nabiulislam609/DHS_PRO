import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { SectionVisibility } from '../../types';
import {
  TrendingUp,
  Image as ImageIcon,
  Trophy,
  Calendar,
  Newspaper,
  Bell,
  Sliders,
  Zap,
  FileText,
  User,
  Info,
  BookOpen,
  BarChart3,
  Mail,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

interface SectionConfig {
  key: keyof SectionVisibility;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  isHighlighted?: boolean; // Highlighted from the user's provided screenshots
  editTab?: string;
}

export const ManageHomepageSections: React.FC = () => {
  const {
    sectionVisibility,
    toggleSectionVisibility,
    updateSectionVisibility,
    resetSectionVisibility,
    setAdminTab,
  } = useSchool();

  // The 5 key sections specifically highlighted by user's screenshots
  const highlightedSections: SectionConfig[] = [
    {
      key: 'results_trend',
      label: 'এসএসসি ফলাফলের ধারা (একাডেমিক পারফরম্যান্স)',
      sublabel: 'পাশের হার, A+ সংখ্যা এবং গড় জিপিএ (GPA) ট্রেন্ড চার্ট',
      icon: TrendingUp,
      isHighlighted: true,
      editTab: 'performance',
    },
    {
      key: 'gallery',
      label: 'আলোকিত গ্যালারি (ফটোগ্যালারি)',
      sublabel: 'ক্যাম্পাস, শ্রেণিকক্ষ, ক্রীড়া, সাংস্কৃতিক ও বিজ্ঞান মেলার ফটো অ্যালবাম',
      icon: ImageIcon,
      isHighlighted: true,
      editTab: 'gallery',
    },
    {
      key: 'achievements',
      label: 'আমাদের গর্ব (বিদ্যালয়ের অর্জনসমূহ)',
      sublabel: 'অলিম্পিয়াড, ক্রীড়া, মেধা বৃত্তি ও একাডেমিক সাফল্যের তালিকা',
      icon: Trophy,
      isHighlighted: true,
      editTab: 'achievements',
    },
    {
      key: 'events',
      label: 'আসন্ন ইভেন্ট (ইভেন্ট ও কার্যক্রম)',
      sublabel: 'বিদ্যালয় প্রতিষ্ঠা দিবস, বিজ্ঞান মেলা, বার্ষিক ক্রীড়া প্রতিযোগিতা',
      icon: Calendar,
      isHighlighted: true,
      editTab: 'events',
    },
    {
      key: 'news',
      label: 'সর্বশেষ সংবাদ (প্রেস ও নোটিসফিড)',
      sublabel: 'বিদ্যালয়ের সাম্প্রতিক ঘটনা, সাফল্য ও বিশেষ প্রেস রিলিজ',
      icon: Newspaper,
      isHighlighted: true,
      editTab: 'news',
    },
  ];

  // Other standard homepage sections
  const standardSections: SectionConfig[] = [
    {
      key: 'ticker',
      label: 'মুভিং নোটিফিকেশন বার (সর্বশেষ নোটিশ)',
      sublabel: 'ন্যাভবারের নিচে চলমান জরুরি নোটিশ স্ক্রলার (স্পিড ও ভিজিবিলিটি কন্ট্রোল)',
      icon: Bell,
      editTab: 'header_settings',
    },
    {
      key: 'hero',
      label: 'হিরো স্লাইডার ব্যানার',
      sublabel: 'হোমপেজের মূল বড় স্লাইডার ব্যানার ও ভর্তি লিংক',
      icon: Sliders,
      editTab: 'hero',
    },
    {
      key: 'quick_actions',
      label: 'দ্রুত সেবা বাটনসমূহ (Quick Actions)',
      sublabel: 'অনলাইন ফলাফল, নোটিশ, রুটিন ও ফি পরিশোধ শর্টকাট',
      icon: Zap,
    },
    {
      key: 'notices',
      label: 'প্রধান নোটিশ বোর্ড',
      sublabel: 'জরুরি, পরীক্ষা ও সাধারণ নোটিশ তালিকা',
      icon: FileText,
      editTab: 'notices',
    },
    {
      key: 'leadership',
      label: 'নেতৃত্বের বাণী (প্রধান শিক্ষক ও সভাপতি)',
      sublabel: 'প্রধান শিক্ষক ও সভাপতির বক্তব্য ও পরিচিতি',
      icon: User,
      editTab: 'leadership',
    },
    {
      key: 'about',
      label: 'বিদ্যালয় পরিচিতি ও উদ্দেশ্য',
      sublabel: 'সংক্ষিপ্ত ইতিহাস, লক্ষ্য, উদ্দেশ্য ও সুবিধা',
      icon: Info,
      editTab: 'settings',
    },
    {
      key: 'programs',
      label: 'একাডেমিক প্রোগ্রামসমূহ',
      sublabel: 'বিজ্ঞান, মানবিক, ব্যবসায় শিক্ষা ও কারিগরি বিভাগ',
      icon: BookOpen,
      editTab: 'programs',
    },
    {
      key: 'stats',
      label: 'প্রধান পরিসংখ্যান কাউন্টার',
      sublabel: 'মোট শিক্ষার্থী, শিক্ষক, পাশের হার ও জিপিএ-৫ কাউন্টার',
      icon: BarChart3,
      editTab: 'settings',
    },
    {
      key: 'contact',
      label: 'যোগাযোগ সেকশন ও গুগল ম্যাপ',
      sublabel: 'ঠিকানা, ফোন নম্বর, সরাসরি বার্তা পাঠানোর ফর্ম ও গুগল ম্যাপ',
      icon: Mail,
      editTab: 'settings',
    },
  ];

  const totalSections = highlightedSections.length + standardSections.length;
  const visibleCount = Object.values(sectionVisibility).filter(Boolean).length;

  const handleShowAll = () => {
    const allVisible = Object.keys(sectionVisibility).reduce((acc, key) => {
      acc[key as keyof SectionVisibility] = true;
      return acc;
    }, {} as SectionVisibility);
    updateSectionVisibility(allVisible);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'আপনি কি নিশ্চিত যে সকল হোমপেজ সেকশন ডিফল্ট দৃশ্যমান অবস্থায় রিসেট করতে চান?'
      )
    ) {
      resetSectionVisibility();
    }
  };

  const renderSectionCard = (sec: SectionConfig) => {
    const isVisible = sectionVisibility[sec.key];
    const Icon = sec.icon;

    return (
      <div
        key={sec.key}
        className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
          isVisible
            ? 'bg-white border-gray-200/90 shadow-xs hover:border-emerald-300'
            : 'bg-gray-50/80 border-gray-200/50 opacity-75'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                isVisible
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm text-gray-900 leading-snug">
                  {sec.label}
                </h3>
                {sec.isHighlighted && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.2 rounded-full">
                    ছবিতে উল্লেখিত সেকশন
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {sec.sublabel}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => toggleSectionVisibility(sec.key)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              isVisible ? 'bg-emerald-700' : 'bg-gray-300'
            }`}
            title={isVisible ? 'সেকশনটি লুকান' : 'সেকশনটি প্রদর্শন করুন'}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isVisible ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Footer with Status Badge & Edit Link */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              isVisible
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}
          >
            {isVisible ? (
              <>
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>মেইন পেজে দৃশ্যমান (Show)</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                <span>মেইন পেজ থেকে লুকানো (Hidden)</span>
              </>
            )}
          </span>

          {sec.editTab && (
            <button
              onClick={() => setAdminTab(sec.editTab as any)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 cursor-pointer hover:underline"
            >
              <span>ডাটা এডিট করুন</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              হোমপেজ সেকশন নিয়ন্ত্রণ (Show / Hide)
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {visibleCount} / {totalSections} দৃশ্যমান
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            মূল হোমপেজে কোন কোন সেকশন প্রদর্শন করবেন বা সাময়িকভাবে লুকিয়ে রাখবেন তা এখান থেকে এক ক্লিকে টগল করুন।
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
            title="সবগুলো সেকশন ডিফল্ট দৃশ্যমান করুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট রিসেট</span>
          </button>

          <button
            onClick={handleShowAll}
            className="inline-flex items-center gap-1.5 bg-[#15803d] hover:bg-[#166534] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>সবগুলো দৃশ্যমান করুন</span>
          </button>
        </div>
      </div>

      {/* Quick link banner to Header & Ticker settings */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-700 text-white rounded-xl shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
              ন্যাভবার সাইজ, টপ বার এবং মুভিং নোটিশ বারের স্পিড কন্ট্রোল করতে চান?
            </h4>
            <p className="text-[11px] sm:text-xs text-emerald-800">
              টপ বার Show/Hide, ন্যাভবারের উচ্চতা (Height) কম-বেশি এবং নোটিশ বারের স্ক্রলিং স্পিড এক ক্লিকেই পরিবর্তন করুন
            </p>
          </div>
        </div>
        <button
          onClick={() => setAdminTab('header_settings')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0 shadow-xs"
        >
          <span>হেডার ও নোটিফিকেশন বার সেটিংস</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Guide Callout */}
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
        <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>সহজ নিয়ন্ত্রণ:</strong> আপনি ছবিতে দেওয়া ৫টি সেকশন (এসএসসি ফলাফলের ধারা, আলোকিত গ্যালারি, আমাদের গর্ব, আসন্ন ইভেন্ট ও সর্বশেষ সংবাদ) সহ যেকোনো সেকশনের সুইচে ক্লিক করলেই মূল পেজে তা সঙ্গে সঙ্গে দেখা যাবে বা বন্ধ হয়ে যাবে।
        </p>
      </div>

      {/* Primary Highlighted Sections Group (From User's Uploaded Images) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block animate-pulse" />
            <h2 className="text-base font-bold text-gray-900">
              ছবিতে উল্লেখিত প্রধান সেকশনসমূহ (৫টি)
            </h2>
          </div>
          <span className="text-xs text-gray-500">
            এসএসসি ফলাফলের ধারা • গ্যালারি • অর্জন • ইভেন্ট • সংবাদ
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {highlightedSections.map(renderSectionCard)}
        </div>
      </div>

      {/* Other Homepage Sections Group */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">
            হোমপেজের অন্যান্য সেকশনসমূহ ({standardSections.length}টি)
          </h2>
          <span className="text-xs text-gray-500">
            স্লাইডার, নোটিশবোর্ড, পরিচিতি ও যোগাযোগ
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {standardSections.map(renderSectionCard)}
        </div>
      </div>
    </div>
  );
};
