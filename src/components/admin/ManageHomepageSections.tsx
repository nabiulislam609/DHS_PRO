import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { SectionVisibility, SiteSettings } from '../../types';
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
  Edit3,
  X,
  Save,
  Check,
  Type,
} from 'lucide-react';

interface SectionConfig {
  key: keyof SectionVisibility;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  isHighlighted?: boolean; // Specifically marked in user's screenshots
  editTab?: string;
  badgeKey?: keyof SiteSettings;
  titleKey?: keyof SiteSettings;
  subtitleKey?: keyof SiteSettings;
  defaultBadge?: string;
  defaultTitle?: string;
  defaultSubtitle?: string;
  hasExtraCharts?: boolean;
}

export const ManageHomepageSections: React.FC = () => {
  const {
    sectionVisibility,
    toggleSectionVisibility,
    updateSectionVisibility,
    resetSectionVisibility,
    setAdminTab,
    siteSettings,
    updateSiteSettings,
  } = useSchool();

  const [editingSection, setEditingSection] = useState<SectionConfig | null>(null);
  const [modalBadge, setModalBadge] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalSubtitle, setModalSubtitle] = useState('');
  // Extra fields for Results Trend Charts
  const [modalChart1Title, setModalChart1Title] = useState('');
  const [modalChart1Subtitle, setModalChart1Subtitle] = useState('');
  const [modalChart2Title, setModalChart2Title] = useState('');
  const [modalChart2Subtitle, setModalChart2Subtitle] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // The 5 key sections specifically highlighted by user's screenshots
  const highlightedSections: SectionConfig[] = [
    {
      key: 'results_trend',
      label: 'এসএসসি ফলাফলের ধারা (একাডেমিক পারফরম্যান্স)',
      sublabel: 'পাশের হার, A+ সংখ্যা এবং গড় জিপিএ (GPA) ট্রেন্ড চার্ট',
      icon: TrendingUp,
      isHighlighted: true,
      editTab: 'performance',
      badgeKey: 'resultsTrendBadge',
      titleKey: 'resultsTrendTitle',
      subtitleKey: 'resultsTrendSubtitle',
      defaultBadge: 'একাডেমিক পারফরম্যান্স',
      defaultTitle: 'এসএসসি ফলাফলের ধারা',
      defaultSubtitle: 'গত ৫ বছরের একাডেমিক পারফরম্যান্স এক নজরে',
      hasExtraCharts: true,
    },
    {
      key: 'gallery',
      label: 'আলোকিত গ্যালারি (ফটোগ্যালারি)',
      sublabel: 'ক্যাম্পাস, শ্রেণিকক্ষ, ক্রীড়া, সাংস্কৃতিক ও বিজ্ঞান মেলার ফটো অ্যালবাম',
      icon: ImageIcon,
      isHighlighted: true,
      editTab: 'gallery',
      badgeKey: 'galleryBadge',
      titleKey: 'galleryTitle',
      subtitleKey: 'gallerySubtitle',
      defaultBadge: 'ফটোগ্যালারি',
      defaultTitle: 'আলোকিত গ্যালারি',
      defaultSubtitle: 'ক্যাম্পাস, অনুষ্ঠান ও শিক্ষার্থী জীবনের কিছু মুহূর্ত',
    },
    {
      key: 'achievements',
      label: 'আমাদের গর্ব (বিদ্যালয়ের অর্জনসমূহ)',
      sublabel: 'অলিম্পিয়াড, ক্রীড়া, মেধা বৃত্তি ও একাডেমিক সাফল্যের তালিকা',
      icon: Trophy,
      isHighlighted: true,
      editTab: 'achievements',
      badgeKey: 'achievementsBadge',
      titleKey: 'achievementsTitle',
      subtitleKey: 'achievementsSubtitle',
      defaultBadge: 'অর্জন',
      defaultTitle: 'আমাদের গর্ব',
      defaultSubtitle: 'মেধা ও ঐতিহ্যে বিদ্যালয়ের অর্জনের কিছু দৃষ্টান্ত',
    },
    {
      key: 'events',
      label: 'আসন্ন ইভেন্ট (ইভেন্ট ও কার্যক্রম)',
      sublabel: 'বিদ্যালয় প্রতিষ্ঠা দিবস, বিজ্ঞান মেলা, বার্ষিক ক্রীড়া প্রতিযোগিতা',
      icon: Calendar,
      isHighlighted: true,
      editTab: 'events',
      badgeKey: 'eventsBadge',
      titleKey: 'eventsTitle',
      subtitleKey: 'eventsSubtitle',
      defaultBadge: 'ইভেন্ট',
      defaultTitle: 'আসন্ন ইভেন্ট',
      defaultSubtitle: 'বিদ্যালয়ের আসন্ন কার্যক্রম ও অনুষ্ঠান',
    },
    {
      key: 'news',
      label: 'সর্বশেষ সংবাদ (প্রেস ও নোটিসফিড)',
      sublabel: 'বিদ্যালয়ের সাম্প্রতিক ঘটনা, সাফল্য ও বিশেষ প্রেস রিলিজ',
      icon: Newspaper,
      isHighlighted: true,
      editTab: 'news',
      badgeKey: 'newsBadge',
      titleKey: 'newsTitle',
      subtitleKey: 'newsSubtitle',
      defaultBadge: 'সংবাদ',
      defaultTitle: 'সর্বশেষ সংবাদ',
      defaultSubtitle: 'বিদ্যালয়ের সাম্প্রতিক ঘটনাবলি ও সংবাদ',
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
      titleKey: 'quickActionsTitle',
      subtitleKey: 'quickActionsSubtitle',
      defaultTitle: 'দ্রুত সেবা বাটনসমূহ',
      defaultSubtitle: 'অনলাইন ফলাফল, নোটিশ, রুটিন ও ফি পরিশোধের শর্টকাট',
    },
    {
      key: 'notices',
      label: 'প্রধান নোটিশ বোর্ড',
      sublabel: 'জরুরি, পরীক্ষা ও সাধারণ নোটিশ তালিকা',
      icon: FileText,
      editTab: 'notices',
      badgeKey: 'noticesBadge',
      titleKey: 'noticesTitle',
      subtitleKey: 'noticesSubtitle',
      defaultBadge: 'নোটিশ বোর্ড',
      defaultTitle: 'সাম্প্রতিক নোটিশ ও সার্কুলার',
      defaultSubtitle: 'বিদ্যালয়ের সকল গুরুত্বপূর্ণ বিজ্ঞপ্তি ও তথ্যাবলি',
    },
    {
      key: 'leadership',
      label: 'নেতৃত্বের বাণী (প্রধান শিক্ষক ও সভাপতি)',
      sublabel: 'প্রধান শিক্ষক ও সভাপতির বক্তব্য ও পরিচিতি',
      icon: User,
      editTab: 'leadership',
      badgeKey: 'leadershipBadge',
      titleKey: 'leadershipTitle',
      subtitleKey: 'leadershipSubtitle',
      defaultBadge: 'নেতৃত্ব',
      defaultTitle: 'নেতৃত্বের বার্তা',
      defaultSubtitle: 'বিদ্যালয়ের প্রধান ও পরিচালনা পরিষদের বার্তা',
    },
    {
      key: 'about',
      label: 'বিদ্যালয় পরিচিতি ও উদ্দেশ্য',
      sublabel: 'সংক্ষিপ্ত ইতিহাস, লক্ষ্য, উদ্দেশ্য ও সুবিধা',
      icon: Info,
      editTab: 'settings',
      badgeKey: 'aboutBadge',
      titleKey: 'aboutTitle',
      subtitleKey: 'aboutSubtitle',
      defaultBadge: 'পরিচিতি',
      defaultTitle: 'বিদ্যালয় পরিচিতি',
      defaultSubtitle: 'ঐতিহ্য, মানসম্মত শিক্ষা ও আধুনিক সুযোগ-সুবিধা',
    },
    {
      key: 'programs',
      label: 'একাডেমিক প্রোগ্রামসমূহ',
      sublabel: 'বিজ্ঞান, মানবিক, ব্যবসায় শিক্ষা ও কারিগরি বিভাগ',
      icon: BookOpen,
      editTab: 'programs',
      badgeKey: 'programsBadge',
      titleKey: 'programsTitle',
      subtitleKey: 'programsSubtitle',
      defaultBadge: 'একাডেমিক',
      defaultTitle: 'একাডেমিক প্রোগ্রাম',
      defaultSubtitle: 'শ্রেণিভিত্তিক ও বিষয়ভিত্তিক মানসম্মত পাঠ্য-পাঠন',
    },
    {
      key: 'stats',
      label: 'প্রধান পরিসংখ্যান কাউন্টার',
      sublabel: 'মোট শিক্ষার্থী, শিক্ষক, পাশের হার ও জিপিএ-৫ কাউন্টার',
      icon: BarChart3,
      editTab: 'settings',
      badgeKey: 'statsBadge',
      titleKey: 'statsTitle',
      subtitleKey: 'statsSubtitle',
      defaultBadge: 'পরিসংখ্যান',
      defaultTitle: 'বিদ্যালয় এক নজরে',
      defaultSubtitle: 'একটি সফল যাত্রায় ঐতিহ্য ও সাফল্যের কথা',
    },
    {
      key: 'contact',
      label: 'যোগাযোগ সেকশন ও গুগল ম্যাপ',
      sublabel: 'ঠিকানা, ফোন নম্বর, সরাসরি বার্তা পাঠানোর ফর্ম ও গুগল ম্যাপ',
      icon: Mail,
      editTab: 'settings',
      badgeKey: 'contactBadge',
      titleKey: 'contactTitle',
      subtitleKey: 'contactSubtitle',
      defaultBadge: 'যোগাযোগ',
      defaultTitle: 'আমাদের সাথে যোগাযোগ',
      defaultSubtitle: 'প্রশ্ন, পরামর্শ বা তথ্যের জন্য সরাসরি যোগাযোগ করুন',
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
    showToast('সবগুলো সেকশন দৃশ্যমান করা হয়েছে');
  };

  const handleReset = () => {
    if (
      window.confirm(
        'আপনি কি নিশ্চিত যে সকল হোমপেজ সেকশন ডিফল্ট দৃশ্যমান অবস্থায় রিসেট করতে চান?'
      )
    ) {
      resetSectionVisibility();
      showToast('সেকশনগুলো ডিফল্ট অবস্থায় রিসেট করা হয়েছে');
    }
  };

  const openEditModal = (sec: SectionConfig) => {
    setEditingSection(sec);
    const bKey = sec.badgeKey ? (siteSettings[sec.badgeKey] as string) : '';
    const tKey = sec.titleKey ? (siteSettings[sec.titleKey] as string) : '';
    const sKey = sec.subtitleKey ? (siteSettings[sec.subtitleKey] as string) : '';

    setModalBadge(bKey !== undefined && bKey !== '' ? bKey : sec.defaultBadge || '');
    setModalTitle(tKey !== undefined && tKey !== '' ? tKey : sec.defaultTitle || '');
    setModalSubtitle(sKey !== undefined && sKey !== '' ? sKey : sec.defaultSubtitle || '');

    if (sec.hasExtraCharts) {
      setModalChart1Title(siteSettings.resultsTrendChart1Title || 'পাশের হার ও A+ হার');
      setModalChart1Subtitle(siteSettings.resultsTrendChart1Subtitle || 'গত ৫ বছরে পাশের হার ও জিপিএ ৫');
      setModalChart2Title(siteSettings.resultsTrendChart2Title || 'গড় জিপিএ (GPA) ধারা');
      setModalChart2Subtitle(siteSettings.resultsTrendChart2Subtitle || 'গত ৫ বছরে গড়ে প্রাপ্ত জিপিএ');
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    const updates: Partial<SiteSettings> = {};
    if (editingSection.badgeKey) {
      updates[editingSection.badgeKey] = modalBadge.trim() as any;
    }
    if (editingSection.titleKey) {
      updates[editingSection.titleKey] = modalTitle.trim() as any;
    }
    if (editingSection.subtitleKey) {
      updates[editingSection.subtitleKey] = modalSubtitle.trim() as any;
    }

    if (editingSection.hasExtraCharts) {
      updates.resultsTrendChart1Title = modalChart1Title.trim();
      updates.resultsTrendChart1Subtitle = modalChart1Subtitle.trim();
      updates.resultsTrendChart2Title = modalChart2Title.trim();
      updates.resultsTrendChart2Subtitle = modalChart2Subtitle.trim();
    }

    await updateSiteSettings(updates);
    showToast(`"${editingSection.label}" সেকশনের টাইটেল ও বিবরণ সফলভাবে আপডেট করা হয়েছে!`);
    setEditingSection(null);
  };

  const handleResetToDefault = () => {
    if (!editingSection) return;
    setModalBadge(editingSection.defaultBadge || '');
    setModalTitle(editingSection.defaultTitle || '');
    setModalSubtitle(editingSection.defaultSubtitle || '');
    if (editingSection.hasExtraCharts) {
      setModalChart1Title('পাশের হার ও A+ হার');
      setModalChart1Subtitle('গত ৫ বছরে পাশের হার ও জিপিএ ৫');
      setModalChart2Title('গড় জিপিএ (GPA) ধারা');
      setModalChart2Subtitle('গত ৫ বছরে গড়ে প্রাপ্ত জিপিএ');
    }
  };

  const renderSectionCard = (sec: SectionConfig) => {
    const isVisible = sectionVisibility[sec.key];
    const Icon = sec.icon;

    const currentBadge = sec.badgeKey
      ? (siteSettings[sec.badgeKey] as string) || sec.defaultBadge
      : undefined;
    const currentTitle = sec.titleKey
      ? (siteSettings[sec.titleKey] as string) || sec.defaultTitle
      : undefined;
    const currentSubtitle = sec.subtitleKey
      ? (siteSettings[sec.subtitleKey] as string) || sec.defaultSubtitle
      : undefined;

    return (
      <div
        key={sec.key}
        className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
          isVisible
            ? sec.isHighlighted
              ? 'bg-white border-amber-300 shadow-sm hover:shadow-md ring-1 ring-amber-100'
              : 'bg-white border-gray-200/90 shadow-xs hover:border-emerald-300'
            : 'bg-gray-50/80 border-gray-200/50 opacity-75'
        }`}
      >
        <div>
          {/* Header row: Icon, Name and Toggle switch */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  isVisible
                    ? sec.isHighlighted
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
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
                    <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-2xs">
                      মার্ক করা সেকশন (Editable)
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
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

          {/* Current Live Text Preview Box */}
          {(currentTitle || currentBadge || currentSubtitle) && (
            <div className="mt-3.5 p-3 rounded-xl bg-gray-50/90 border border-gray-200/70 space-y-1 text-xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500">
                <span>বর্তমান লাইভ শিরোনাম ও বিবরণ:</span>
                {sec.titleKey && (
                  <button
                    type="button"
                    onClick={() => openEditModal(sec)}
                    className="text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>পরিবর্তন করুন</span>
                  </button>
                )}
              </div>
              <div className="pt-1 flex flex-wrap items-center gap-2">
                {currentBadge && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    {currentBadge}
                  </span>
                )}
                <span className="font-bold text-gray-900 text-xs sm:text-sm">
                  {currentTitle}
                </span>
              </div>
              {currentSubtitle && (
                <p className="text-[11px] text-gray-600 line-clamp-2">
                  {currentSubtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer with Status Badge & Action Buttons */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
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
                <span>লুকানো (Hidden)</span>
              </>
            )}
          </span>

          <div className="flex items-center gap-2">
            {sec.titleKey && (
              <button
                type="button"
                onClick={() => openEditModal(sec)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition cursor-pointer shadow-2xs"
                title="সেকশনের নাম, ব্যাজ ও বিবরণ পরিবর্তন করুন"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                <span>টাইটেল এডিট</span>
              </button>
            )}

            {sec.editTab && (
              <button
                onClick={() => setAdminTab(sec.editTab as any)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-gray-200 text-gray-700 text-xs font-semibold transition cursor-pointer"
                title="এই সেকশনের ভেতরের ডাটা বা কার্ডসমূহ ম্যানেজ করুন"
              >
                <span>ডাটা কন্ট্রোল</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-700 flex items-center gap-2.5 text-xs font-bold animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              হোমপেজ সেকশন নিয়ন্ত্রণ ও টেক্সট পরিবর্তন
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {visibleCount} / {totalSections} দৃশ্যমান
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            মার্ক করা এরিয়াসহ যেকোনো সেকশন Show/Hide করুন এবং সরাসরি সেকশনের নাম, ব্যাজ ও সাবটাইটেল পরিবর্তন করুন।
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
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

      {/* Notice Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-amber-100/50 to-emerald-50 border border-amber-300 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 bg-amber-600 text-white rounded-xl shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-amber-950">
              ছবিতে মার্ক করা ৫টি সেকশন সরাসরি ব্যাকএন্ড থেকে পরিবর্তনের সুবিধা যুক্ত করা হয়েছে!
            </h4>
            <p className="text-[11px] sm:text-xs text-amber-900/90 mt-0.5">
              এসএসসি ফলাফলের ধারা, আলোকিত গ্যালারি, আমাদের গর্ব, আসন্ন ইভেন্ট ও সর্বশেষ সংবাদ—যেকোনোটির "টাইটেল এডিট" বাটনে ক্লিক করে নাম ও বিবরণ পছন্দমতো পরিবর্তন করুন।
            </p>
          </div>
        </div>
      </div>

      {/* Primary Highlighted Sections Group (From User's Uploaded Images) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block animate-pulse" />
            <h2 className="text-base font-bold text-gray-900">
              ছবিতে উল্লেখিত প্রধান সেকশনসমূহ (৫টি) — টেক্সট ও শিরোনাম পরিবর্তন
            </h2>
          </div>
          <span className="text-xs text-amber-800 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
            মার্ক করা এরিয়া
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
            নোটিশবোর্ড, পরিচিতি, শিক্ষক, কর্মসূচি ও যোগাযোগ
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {standardSections.map(renderSectionCard)}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Modal: Edit Section Title, Subtitle and Badge                             */}
      {/* ========================================================================= */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative border border-gray-100 space-y-5 animate-scaleUp my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100">
                  <editingSection.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingSection.label}
                  </h3>
                  <p className="text-xs text-gray-500">
                    মেইন ওয়েবসাইটে প্রদর্শিত শিরোনাম, ব্যাজ ও বিবরণ পরিবর্তন করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Preview Inside Modal */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/70 p-4 rounded-2xl text-center space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                লাইভ প্রিভিউ (ওয়েবসাইটে যেমন দেখা যাবে)
              </span>
              {modalBadge && (
                <span className="inline-block bg-white text-emerald-800 text-[11px] font-bold px-3 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                  {modalBadge}
                </span>
              )}
              <h4 className="text-lg font-extrabold text-gray-900">
                {modalTitle || 'শিরোনাম লিখুন...'}
              </h4>
              <p className="text-xs text-gray-600 max-w-md mx-auto">
                {modalSubtitle || 'উপশিরোনাম বা সংক্ষিপ্ত বিবরণ লিখুন...'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              {editingSection.badgeKey && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    সেকশন ব্যাজ টেক্সট (ছোট ট্যাগ)
                  </label>
                  <input
                    type="text"
                    value={modalBadge}
                    onChange={(e) => setModalBadge(e.target.value)}
                    placeholder={editingSection.defaultBadge || 'যেমন: একাডেমি'}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-600 font-medium"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    * মূল টাইটেলের উপরে ছোট ক্যাপসুল ব্যাজে এটি প্রদর্শিত হয়।
                  </p>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  সেকশনের প্রধান শিরোনাম (Main Title)
                </label>
                <input
                  type="text"
                  required
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder={editingSection.defaultTitle || 'যেমন: আমাদের অর্জন'}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-600 font-bold text-gray-900 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  সেকশন সাবটাইটেল বা বিবরণ (Subtitle)
                </label>
                <textarea
                  rows={2}
                  value={modalSubtitle}
                  onChange={(e) => setModalSubtitle(e.target.value)}
                  placeholder={editingSection.defaultSubtitle || 'সংক্ষিপ্ত বর্ণনা লিখুন'}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-600 font-medium leading-relaxed"
                />
              </div>

              {/* Extra Chart Titles for Results Trend */}
              {editingSection.hasExtraCharts && (
                <div className="pt-2 border-t border-gray-100 space-y-3">
                  <h4 className="font-bold text-gray-800 text-xs flex items-center gap-1.5 text-emerald-800">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>চার্ট কার্ড দুটির টাইটেল পরিবর্তন:</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1 text-[11px]">
                        ১ম চার্ট টাইটেল (পাশের হার)
                      </label>
                      <input
                        type="text"
                        value={modalChart1Title}
                        onChange={(e) => setModalChart1Title(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1 text-[11px]">
                        ১ম চার্ট সাবটাইটেল
                      </label>
                      <input
                        type="text"
                        value={modalChart1Subtitle}
                        onChange={(e) => setModalChart1Subtitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1 text-[11px]">
                        ২য় চার্ট টাইটেল (জিপিএ ধারা)
                      </label>
                      <input
                        type="text"
                        value={modalChart2Title}
                        onChange={(e) => setModalChart2Title(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1 text-[11px]">
                        ২য় চার্ট সাবটাইটেল
                      </label>
                      <input
                        type="text"
                        value={modalChart2Subtitle}
                        onChange={(e) => setModalChart2Subtitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-xs font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ডিফল্ট টেক্সট আনুন</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSection(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 bg-[#15803d] hover:bg-[#166534] text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>সংরক্ষণ করুন</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
