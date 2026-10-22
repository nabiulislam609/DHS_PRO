import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Globe,
  Sliders,
  Navigation,
  User,
  Bookmark,
  BookOpen,
  BarChart3,
  Phone,
  Layout,
  Save,
  CheckCircle,
  Eye,
  RefreshCw,
  Sparkles,
  MapPin,
  Mail,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  ChevronRight,
  ArrowRight,
  Target,
  Compass,
} from 'lucide-react';
import { AcademicProgram, LeadershipMessage, NavigationItem } from '../../types';

type FrontendSectionTab =
  | 'header'
  | 'menu'
  | 'hero'
  | 'leadership'
  | 'about'
  | 'programs'
  | 'stats'
  | 'contact'
  | 'footer';

export const ManageFrontendContent: React.FC = () => {
  const {
    siteSettings,
    updateSiteSettings,
    setViewMode,
    heroSlides,
    updateHeroSlide,
    navigationItems,
    updateNavigationItem,
    addNavigationItem,
    deleteNavigationItem,
    leadership,
    updateLeadership,
    academicPrograms,
    updateProgram,
    addProgram,
    deleteProgram,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<FrontendSectionTab>('header');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for Site Settings
  const [formData, setFormData] = useState({ ...siteSettings });

  // Sync formData whenever siteSettings updates externally
  useEffect(() => {
    setFormData({ ...siteSettings });
  }, [siteSettings]);

  // First Hero Slide State
  const firstSlide = heroSlides[0] || {
    id: 'slide-1',
    title: 'শিক্ষাই জাতির মূল সম্পদ',
    subtitle: 'ষাটের বেশি বছরের ঐতিহ্য, আধুনিক শিক্ষার দীপ্তি',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-538b6d0a2e23?w=1600&q=80',
    badgeText: 'দাদরা উচ্চ বিদ্যালয়',
    buttonText: 'ভর্তি চলছে',
    buttonLink: '#admission',
    active: true,
    overlayOpacity: 65,
    imageOpacity: 85,
  };
  const [heroSlideData, setHeroSlideData] = useState({ ...firstSlide });

  useEffect(() => {
    if (heroSlides[0]) {
      setHeroSlideData({ ...heroSlides[0] });
    }
  }, [heroSlides]);

  // Leadership Messages State (Chairman & Headmaster)
  const chairman = leadership.find((l) => l.role.includes('সভাপতি') || l.id === 'lead-1') || leadership[0] || {
    id: 'lead-1',
    name: 'আলহাজ্ব মো: রফিকুল ইসলাম',
    role: 'সভাপতি, বিদ্যালয় পরিচালনা পরিষদ',
    credentials: 'বিএ (অনার্স), এমএ',
    message: 'দাদরা উচ্চ বিদ্যালয় শুধুমাত্র একটি শিক্ষা প্রতিষ্ঠান নয়, এটি আমাদের অঞ্চলের আলোকবর্তিকা। প্রতিটি শিক্ষার্থীকে নৈতিকতা, মানবিকতা ও আধুনিক শিক্ষায় দীক্ষিত করে তোলাই আমাদের সংকল্প।',
    image: '',
  };

  const headmaster = leadership.find((l) => l.role.includes('প্রধান শিক্ষক') || l.id === 'lead-2') || leadership[1] || {
    id: 'lead-2',
    name: 'মো: সাদেকুল ইসলাম',
    role: 'প্রধান শিক্ষক',
    credentials: 'এম.এসসি (গণিত), বি.এড (১ম শ্রেণি)',
    message: 'আমাদের মূল ব্রত হলো মেধা ও নৈতিকতার অপূর্ব সমন্বয় সাধন। অভিজ্ঞ শিক্ষক মণ্ডলী এবং আধুনিক শিক্ষা উপকরণের মাধ্যমে আমরা শিক্ষার্থীদের দেশপ্রেমিক ও দক্ষ নাগরিক হিসেবে গড়ে তুলছি।',
    image: '',
  };

  const [chairmanData, setChairmanData] = useState<LeadershipMessage>({ ...chairman });
  const [headmasterData, setHeadmasterData] = useState<LeadershipMessage>({ ...headmaster });

  useEffect(() => {
    const c = leadership.find((l) => l.role.includes('সভাপতি') || l.id === 'lead-1') || leadership[0];
    if (c) setChairmanData({ ...c });
    const h = leadership.find((l) => l.role.includes('প্রধান শিক্ষক') || l.id === 'lead-2') || leadership[1];
    if (h) setHeadmasterData({ ...h });
  }, [leadership]);

  // Handle Save
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      // 1. Update siteSettings
      await updateSiteSettings(formData);

      // 2. Update Hero Slide if on hero tab
      if (activeTab === 'hero' && heroSlides[0]) {
        await updateHeroSlide(heroSlideData.id, heroSlideData);
      }

      // 3. Update Leadership if on leadership tab
      if (activeTab === 'leadership') {
        if (chairmanData.id) await updateLeadership(chairmanData.id, chairmanData);
        if (headmasterData.id) await updateLeadership(headmasterData.id, headmasterData);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to save frontend changes:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Section tabs configuration
  const tabs = [
    { id: 'header', label: 'হেডার ও টপবার', icon: Layout, desc: 'লোগো, শিরোনাম, ইআইআইএন ও টপবার তথ্য' },
    { id: 'menu', label: 'মেনু নেভিগেশন', icon: Navigation, desc: 'মূল মেনু আইটেম ও লিংকসমূহ' },
    { id: 'hero', label: 'হিরো এরিয়া', icon: Sliders, desc: 'প্রধান ব্যানার, টাইটেল ও অ্যাকশন বাটন' },
    { id: 'leadership', label: 'নেতৃত্বের বার্তা', icon: User, desc: 'সভাপতি ও প্রধান শিক্ষকের বাণী' },
    { id: 'about', label: 'বিদ্যালয় পরিচিতি', icon: Bookmark, desc: 'ইতিহাস, ভূমিকা, উদ্দেশ্য, লক্ষ্য ও সুবিধা' },
    { id: 'programs', label: 'একাডেমিক প্রোগ্রাম', icon: BookOpen, desc: 'শ্রেণিভিত্তিক প্রোগ্রাম ও কারিকুলাম' },
    { id: 'stats', label: 'বিদ্যালয় এক নজরে', icon: BarChart3, desc: 'পরিসংখ্যান ও সাফল্য কার্ডসমূহ' },
    { id: 'contact', label: 'আমাদের সাথে যোগাযোগ', icon: Phone, desc: 'ঠিকানা, ফোন, ইমেইল ও গুগল ম্যাপ' },
    { id: 'footer', label: 'ফুটার এরিয়া', icon: Globe, desc: 'কপিরাইট, বোর্ড স্বীকৃতি ও ফুটার টেক্সট' },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Hero Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
            <Globe className="w-3.5 h-3.5 text-emerald-700" />
            <span>সম্পূর্ণ ওয়েবসাইট কাস্টমাইজেশন পোর্টাল</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            ফ্রন্টএন্ড কাস্টমাইজেশন (Frontend Content)
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-3xl leading-relaxed">
            ওয়েবসাইটের হেডার থেকে শুরু করে মেনু, হিরো ব্যানার, নেতৃত্বের বাণী, পরিচিতি, একাডেমিক প্রোগ্রাম, পরিসংখ্যান, যোগাযোগ ও ফুটারের প্রতিটি শব্দ ও অক্ষর এখান থেকে অনায়াসে এডিট ও আপডেট করুন।
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('frontend')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shadow-xs"
          >
            <Eye className="w-4 h-4 text-emerald-700" />
            <span>ওয়েবসাইটে প্রিভিউ দেখুন</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সকল পরিবর্তন সেভ করুন'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold animate-fadeIn shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>✓ ফ্রন্টএন্ডের সকল পরিবর্তন সফলভাবে সংরক্ষিত ও ওয়েবসাইটে কার্যকর করা হয়েছে!</span>
        </div>
      )}

      {/* Section Switcher Tabs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2 bg-gray-100/80 p-2 rounded-2xl border border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FrontendSectionTab)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl text-xs font-bold transition cursor-pointer text-center gap-1.5 ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-white/70 hover:bg-white text-gray-700 hover:text-emerald-800'
              }`}
              title={tab.desc}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-gray-500'}`} />
              <span className="truncate w-full">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area Form Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs">
        {/* ========================================================= */}
        {/* TAB 1: HEADER & TOPBAR                                    */}
        {/* ========================================================= */}
        {activeTab === 'header' && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Layout className="w-5 h-5 text-emerald-700" />
                <span>হেডার ও নোটিফিকেশন টপবার কাস্টমাইজেশন</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                প্রতিষ্ঠানের মূল নাম, লোগো, ইআইআইএন, স্থাপিত বছর ও টপবারের জরুরি তথ্যসমূহ
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  প্রতিষ্ঠানের পূর্ণ নাম (বাংলা) *
                </label>
                <input
                  type="text"
                  value={formData.schoolNameBangla || ''}
                  onChange={(e) => setFormData({ ...formData, schoolNameBangla: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                  placeholder="যেমন: দাদরা উচ্চ বিদ্যালয়"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  প্রতিষ্ঠানের পূর্ণ নাম (ইংরেজি) *
                </label>
                <input
                  type="text"
                  value={formData.schoolNameEnglish || ''}
                  onChange={(e) => setFormData({ ...formData, schoolNameEnglish: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                  placeholder="যেমন: Dadra High School"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">EIIN নম্বর *</label>
                <input
                  type="text"
                  value={formData.eiin || ''}
                  onChange={(e) => setFormData({ ...formData, eiin: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                  placeholder="১২১৮২০"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">প্রতিষ্ঠা সাল *</label>
                <input
                  type="text"
                  value={formData.establishedYear || ''}
                  onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                  placeholder="১৯৮২"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">সংক্ষিপ্ত নাম (Short Name)</label>
                <input
                  type="text"
                  value={formData.shortName || ''}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                  placeholder="DHS"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  হেডার ভর্তি আবেদন বাটন টেক্সট
                </label>
                <input
                  type="text"
                  value={formData.headerAdmissionBtnText || ''}
                  onChange={(e) => setFormData({ ...formData, headerAdmissionBtnText: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-emerald-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                  placeholder="ভর্তি আবেদন"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  মূল স্লোগান / ট্যাগলাইন (Tagline / Motto)
                </label>
                <input
                  type="text"
                  value={formData.tagline || ''}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value, motto: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                  placeholder="শিক্ষা, নীতি, আদর্শ — গড়ব আগামী দিন"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">টপবার হটলাইন ফোন নম্বর</label>
                <input
                  type="text"
                  value={formData.topBarPhone || ''}
                  onChange={(e) => setFormData({ ...formData, topBarPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                  placeholder="+880 1711-123456"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">টপবার অফিসিয়াল ইমেইল</label>
                <input
                  type="text"
                  value={formData.topBarEmail || ''}
                  onChange={(e) => setFormData({ ...formData, topBarEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                  placeholder="info@dadrahs.edu.bd"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">টপবার অফিস সময়সূচি</label>
                <input
                  type="text"
                  value={formData.topBarOfficeHours || ''}
                  onChange={(e) => setFormData({ ...formData, topBarOfficeHours: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                  placeholder="শনি-বৃহস্পতিবার: সকাল ৮টা - বিকাল ৫টা"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">টিকার নোটিশ লেবেল</label>
                <input
                  type="text"
                  value={formData.noticeTickerLabel || ''}
                  onChange={(e) => setFormData({ ...formData, noticeTickerLabel: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-amber-700 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                  placeholder="সর্বশেষ নোটিশ:"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MENU & NAVIGATION                                  */}
        {/* ========================================================= */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-emerald-700" />
                  <span>নেভিগেশন মেনু আইটেমসমূহ</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  মেনুর প্রতিটি বাটনের নাম, লিংক ও দৃশ্যমানতা (Show/Hide) নিয়ন্ত্রণ করুন
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newLabel = prompt('নতুন মেনু আইটেমের নাম লিখুন (যেমন: লাইব্রেরি):');
                  if (newLabel?.trim()) {
                    const newUrl = prompt('মেনুর লিংক বা সেকশন আইডি লিখুন (যেমন: #library বা /notices):') || '#';
                    addNavigationItem({
                      label: newLabel.trim(),
                      url: newUrl.trim(),
                      order: navigationItems.length + 1,
                      visible: true,
                    });
                  }
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন মেনু আইটেম যোগ করুন</span>
              </button>
            </div>

            <div className="space-y-3">
              {navigationItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 flex-1">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block mb-0.5">মেনু লেবেল (নাম)</span>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => updateNavigationItem(item.id, { label: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:outline-hidden focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block mb-0.5">লিংক বা ইউআরএল (URL)</span>
                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => updateNavigationItem(item.id, { url: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono text-gray-700 focus:outline-hidden focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block mb-0.5">ক্রম (Order)</span>
                      <input
                        type="number"
                        value={item.order}
                        onChange={(e) => updateNavigationItem(item.id, { order: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono text-gray-700 focus:outline-hidden focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-gray-700">
                      <input
                        type="checkbox"
                        checked={item.visible}
                        onChange={(e) => updateNavigationItem(item.id, { visible: e.target.checked })}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span>{item.visible ? 'সক্রিয়' : 'লুকানো'}</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`আপনি কি "${item.label}" মেনু আইটেমটি মুছে ফেলতে চান?`)) {
                          deleteNavigationItem(item.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-rose-600 transition cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: HERO AREA                                          */}
        {/* ========================================================= */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-700" />
                <span>হিরো এরিয়া ও প্রধান ব্যানার টেক্সট</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                হোমপেজের মূল ব্যানারে প্রদর্শিত বড় শিরোনাম, সাবটাইটেল, ব্যাজ ও অ্যাকশন বাটনসমূহ
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    ব্যানার ব্যাজ টেক্সট (ছোট টপ লেবেল)
                  </label>
                  <input
                    type="text"
                    value={heroSlideData.badgeText || ''}
                    onChange={(e) => setHeroSlideData({ ...heroSlideData, badgeText: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-amber-700 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                    placeholder="দাদরা উচ্চ বিদ্যালয়"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    মূল অ্যাকশন বাটন টেক্সট (CTA Button)
                  </label>
                  <input
                    type="text"
                    value={heroSlideData.buttonText || ''}
                    onChange={(e) => setHeroSlideData({ ...heroSlideData, buttonText: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-emerald-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                    placeholder="ভর্তি চলছে"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  মূল বড় শিরোনাম (Main Headline) *
                </label>
                <textarea
                  rows={2}
                  value={heroSlideData.title || ''}
                  onChange={(e) => setHeroSlideData({ ...heroSlideData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-base font-extrabold text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                  placeholder="শিক্ষাই জাতির মূল সম্পদ"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  উপ-শিরোনাম / বিবরণ (Subtitle)
                </label>
                <textarea
                  rows={2}
                  value={heroSlideData.subtitle || ''}
                  onChange={(e) => setHeroSlideData({ ...heroSlideData, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                  placeholder="ষাটের বেশি বছরের ঐতিহ্য, আধুনিক শিক্ষার দীপ্তি"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    বাটন অ্যাকশন লিংক (URL)
                  </label>
                  <input
                    type="text"
                    value={heroSlideData.buttonLink || ''}
                    onChange={(e) => setHeroSlideData({ ...heroSlideData, buttonLink: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-700 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                    placeholder="#admission"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    ব্যাকগ্রাউন্ড ইমেজ লিঙ্ক (URL)
                  </label>
                  <input
                    type="text"
                    value={heroSlideData.imageUrl || ''}
                    onChange={(e) => setHeroSlideData({ ...heroSlideData, imageUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-700 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: LEADERSHIP MESSAGES                                */}
        {/* ========================================================= */}
        {activeTab === 'leadership' && (
          <div className="space-y-8">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-700" />
                <span>নেতৃত্বের বার্তা (Leadership Messages)</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                ম্যানেজিং কমিটির সভাপতি ও প্রধান শিক্ষক মহোদয়ের বাণী, ছবি ও পরিচিতি
              </p>
            </div>

            {/* Section Headings */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">সেকশন ব্যাজ</label>
                <input
                  type="text"
                  value={formData.leadershipBadge || ''}
                  onChange={(e) => setFormData({ ...formData, leadershipBadge: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-600"
                  placeholder="নেতৃত্ব"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">সেকশন মূল শিরোনাম</label>
                <input
                  type="text"
                  value={formData.leadershipTitle || ''}
                  onChange={(e) => setFormData({ ...formData, leadershipTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:outline-hidden focus:border-emerald-600"
                  placeholder="নেতৃত্বের বার্তা"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">সেকশন সাবটাইটেল</label>
                <input
                  type="text"
                  value={formData.leadershipSubtitle || ''}
                  onChange={(e) => setFormData({ ...formData, leadershipSubtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-600"
                  placeholder="বিদ্যালয়ের প্রধান ও পরিচালনা পরিষদের বার্তা"
                />
              </div>
            </div>

            {/* Two Cards: Chairman and Headmaster */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Chairman Message */}
              <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-emerald-800 font-bold">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>সভাপতি মহোদয়ের বাণী ও পরিচিতি</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">সভাপতির পূর্ণ নাম *</label>
                  <input
                    type="text"
                    value={chairmanData.name || ''}
                    onChange={(e) => setChairmanData({ ...chairmanData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">পদবী *</label>
                  <input
                    type="text"
                    value={chairmanData.role || ''}
                    onChange={(e) => setChairmanData({ ...chairmanData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-emerald-800 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">শিক্ষাগত যোগ্যতা / উপাধি</label>
                  <input
                    type="text"
                    value={chairmanData.credentials || ''}
                    onChange={(e) => setChairmanData({ ...chairmanData, credentials: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">বাণীর পূর্ণ টেক্সট (Message) *</label>
                  <textarea
                    rows={6}
                    value={chairmanData.message || ''}
                    onChange={(e) => setChairmanData({ ...chairmanData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 leading-relaxed focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ছবি URL</label>
                  <input
                    type="text"
                    value={chairmanData.image || ''}
                    onChange={(e) => setChairmanData({ ...chairmanData, image: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-600 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Card 2: Headmaster Message */}
              <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-emerald-800 font-bold">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>প্রধান শিক্ষক মহোদয়ের বাণী ও পরিচিতি</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">প্রধান শিক্ষকের পূর্ণ নাম *</label>
                  <input
                    type="text"
                    value={headmasterData.name || ''}
                    onChange={(e) => {
                      setHeadmasterData({ ...headmasterData, name: e.target.value });
                      setFormData({ ...formData, headmasterName: e.target.value });
                    }}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">পদবী *</label>
                  <input
                    type="text"
                    value={headmasterData.role || ''}
                    onChange={(e) => {
                      setHeadmasterData({ ...headmasterData, role: e.target.value });
                      setFormData({ ...formData, headmasterDesignation: e.target.value });
                    }}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-emerald-800 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">শিক্ষাগত যোগ্যতা / উপাধি</label>
                  <input
                    type="text"
                    value={headmasterData.credentials || ''}
                    onChange={(e) => setHeadmasterData({ ...headmasterData, credentials: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">বাণীর পূর্ণ টেক্সট (Message) *</label>
                  <textarea
                    rows={6}
                    value={headmasterData.message || ''}
                    onChange={(e) => setHeadmasterData({ ...headmasterData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 leading-relaxed focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ছবি URL</label>
                  <input
                    type="text"
                    value={headmasterData.image || ''}
                    onChange={(e) => setHeadmasterData({ ...headmasterData, image: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-600 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ABOUT SCHOOL                                       */}
        {/* ========================================================= */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-emerald-700" />
                <span>বিদ্যালয় পরিচিতি ও ইতিহাস</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                ভূমিকা, উদ্দেশ্য, লক্ষ্য (Mission), দৃষ্টি (Vision) এবং আমাদের বেছে নেওয়ার সুবিধাসমূহ
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">সেকশন ব্যাজ</label>
                <input
                  type="text"
                  value={formData.aboutBadge || ''}
                  onChange={(e) => setFormData({ ...formData, aboutBadge: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-600"
                  placeholder="পরিচিতি"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">সেকশন মূল শিরোনাম</label>
                <input
                  type="text"
                  value={formData.aboutTitle || ''}
                  onChange={(e) => setFormData({ ...formData, aboutTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:outline-hidden focus:border-emerald-600"
                  placeholder="বিদ্যালয় পরিচিতি"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">সেকশন সাবটাইটেল</label>
                <input
                  type="text"
                  value={formData.aboutSubtitle || ''}
                  onChange={(e) => setFormData({ ...formData, aboutSubtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-600"
                  placeholder="ঐতিহ্য, মানসম্মত শিক্ষা ও আধুনিক সুযোগ-সুবিধা"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: ভূমিকা */}
              <div className="p-5 rounded-2xl border border-gray-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">কার্ড ১: ভূমিকা</span>
                  <input
                    type="text"
                    value={formData.aboutIntroTitle || ''}
                    onChange={(e) => setFormData({ ...formData, aboutIntroTitle: e.target.value })}
                    className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg font-bold"
                    placeholder="ভূমিকা"
                  />
                </div>
                <textarea
                  rows={6}
                  value={formData.aboutIntro || ''}
                  onChange={(e) => setFormData({ ...formData, aboutIntro: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 leading-relaxed focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>

              {/* Card 2: উদ্দেশ্য */}
              <div className="p-5 rounded-2xl border border-gray-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">কার্ড ২: উদ্দেশ্য</span>
                  <input
                    type="text"
                    value={formData.aboutObjectivesTitle || ''}
                    onChange={(e) => setFormData({ ...formData, aboutObjectivesTitle: e.target.value })}
                    className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg font-bold"
                    placeholder="উদ্দেশ্য"
                  />
                </div>
                <textarea
                  rows={6}
                  value={formData.objectives || ''}
                  onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 leading-relaxed focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>

              {/* Card 3: লক্ষ্য (Mission) */}
              <div className="p-5 rounded-2xl border border-gray-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">কার্ড ৩: লক্ষ্য (Mission)</span>
                  <input
                    type="text"
                    value={formData.aboutMissionTitle || ''}
                    onChange={(e) => setFormData({ ...formData, aboutMissionTitle: e.target.value })}
                    className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg font-bold"
                    placeholder="লক্ষ্য (Mission)"
                  />
                </div>
                <textarea
                  rows={6}
                  value={formData.mission || ''}
                  onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 leading-relaxed focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>

              {/* Card 4: দৃষ্টি (Vision) */}
              <div className="p-5 rounded-2xl border border-gray-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">কার্ড ৪: দৃষ্টি (Vision)</span>
                  <input
                    type="text"
                    value={formData.aboutVisionTitle || ''}
                    onChange={(e) => setFormData({ ...formData, aboutVisionTitle: e.target.value })}
                    className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg font-bold"
                    placeholder="দৃষ্টি (Vision)"
                  />
                </div>
                <textarea
                  rows={6}
                  value={formData.vision || ''}
                  onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 leading-relaxed focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Why Choose Us Banner */}
            <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 pb-3">
                <span className="text-sm font-bold text-emerald-900">ডানপাশের বিশেষ সুবিধা ব্যানার (Why Choose Us)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.whyUsBadge || ''}
                    onChange={(e) => setFormData({ ...formData, whyUsBadge: e.target.value })}
                    className="px-2.5 py-1 text-xs border border-emerald-300 rounded-lg font-bold bg-white"
                    placeholder="সুবিধা"
                  />
                  <input
                    type="text"
                    value={formData.whyUsTitle || ''}
                    onChange={(e) => setFormData({ ...formData, whyUsTitle: e.target.value })}
                    className="px-2.5 py-1 text-xs border border-emerald-300 rounded-lg font-bold bg-white"
                    placeholder="কেন আমাদের বেছে নিবেন"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  সুবিধাসমূহের তালিকা (প্রতি লাইনে একটি সুবিধা লিখুন):
                </label>
                <textarea
                  rows={6}
                  value={formData.whyUs || ''}
                  onChange={(e) => setFormData({ ...formData, whyUs: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 leading-relaxed focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ব্যানার নিচের অ্যাকশন বাটন টেক্সট
                </label>
                <input
                  type="text"
                  value={formData.aboutCtaText || ''}
                  onChange={(e) => setFormData({ ...formData, aboutCtaText: e.target.value })}
                  className="w-full sm:w-1/2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-emerald-900 focus:outline-hidden focus:border-emerald-600"
                  placeholder="অনলাইনে ভর্তি আবেদন করুন"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: ACADEMIC PROGRAMS                                  */}
        {/* ========================================================= */}
        {activeTab === 'programs' && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-700" />
                  <span>একাডেমিক প্রোগ্রাম কাস্টমাইজেশন</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  শ্রেণিভিত্তিক ও বিভাগভিত্তিক প্রোগ্রামসমূহের শিরোনাম, বিবরণ ও বিষয় তালিকা
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const title = prompt('নতুন প্রোগ্রামের শিরোনাম (যেমন: কারিগরি শাখা):');
                  if (title?.trim()) {
                    addProgram({
                      title: title.trim(),
                      level: 'মাধ্যমিক',
                      description: 'ব্যবহারিক ও কারিগরি শিক্ষার মাধ্যমে দক্ষ জনশক্তি গড়ে তোলার আধুনিক কোর্স।',
                      subjects: ['কম্পিউটার', 'জেনারেল মেকানিক্স', 'ইলেকট্রিক্যাল'],
                    });
                  }
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন প্রোগ্রাম যোগ করুন</span>
              </button>
            </div>

            {/* Section Headings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">সেকশন ব্যাজ</label>
                <input
                  type="text"
                  value={formData.programsBadge || ''}
                  onChange={(e) => setFormData({ ...formData, programsBadge: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-600"
                  placeholder="একাডেমিক"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">সেকশন মূল শিরোনাম</label>
                <input
                  type="text"
                  value={formData.programsTitle || ''}
                  onChange={(e) => setFormData({ ...formData, programsTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:outline-hidden focus:border-emerald-600"
                  placeholder="একাডেমিক প্রোগ্রাম"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">বিস্তারিত বাটন টেক্সট</label>
                <input
                  type="text"
                  value={formData.programsDetailBtnText || ''}
                  onChange={(e) => setFormData({ ...formData, programsDetailBtnText: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-emerald-800 focus:outline-hidden focus:border-emerald-600"
                  placeholder="বিস্তারিত জানুন"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ভর্তি আবেদন বাটন টেক্সট</label>
                <input
                  type="text"
                  value={formData.programsApplyBtnText || ''}
                  onChange={(e) => setFormData({ ...formData, programsApplyBtnText: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-emerald-800 focus:outline-hidden focus:border-emerald-600"
                  placeholder="ভর্তি আবেদন →"
                />
              </div>
            </div>

            {/* List of Programs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {academicPrograms.map((prog) => (
                <div
                  key={prog.id}
                  className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {prog.level}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`আপনি কি "${prog.title}" মুছে ফেলতে চান?`)) {
                          deleteProgram(prog.id);
                        }
                      }}
                      className="p-1 text-gray-300 hover:text-rose-600 transition cursor-pointer"
                      title="প্রোগ্রাম মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">প্রোগ্রাম শিরোনাম</label>
                    <input
                      type="text"
                      value={prog.title}
                      onChange={(e) => updateProgram(prog.id, { title: e.target.value })}
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">শ্রেণি স্তর (Level)</label>
                    <input
                      type="text"
                      value={prog.level}
                      onChange={(e) => updateProgram(prog.id, { level: e.target.value })}
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">বিবরণ (Description)</label>
                    <textarea
                      rows={3}
                      value={prog.description}
                      onChange={(e) => updateProgram(prog.id, { description: e.target.value })}
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 leading-relaxed focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">
                      মূল বিষয়সমূহ (কমা দিয়ে আলাদা করুন)
                    </label>
                    <input
                      type="text"
                      value={prog.subjects.join(', ')}
                      onChange={(e) =>
                        updateProgram(prog.id, {
                          subjects: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: SCHOOL STATS / AT A GLANCE                         */}
        {/* ========================================================= */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-700" />
                <span>বিদ্যালয় এক নজরে (School at a Glance)</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                পরিসংখ্যান সেকশনের প্রতিটি কার্ডের লেবেল ও সংখ্যাগত মান সরাসরি পরিবর্তন করুন
              </p>
            </div>

            {/* Section Headings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">সেকশন ব্যাজ</label>
                <input
                  type="text"
                  value={formData.statsBadge || ''}
                  onChange={(e) => setFormData({ ...formData, statsBadge: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-600"
                  placeholder="পরিসংখ্যান"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">সেকশন মূল শিরোনাম</label>
                <input
                  type="text"
                  value={formData.statsTitle || ''}
                  onChange={(e) => setFormData({ ...formData, statsTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:outline-hidden focus:border-emerald-600"
                  placeholder="বিদ্যালয় এক নজরে"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">সেকশন সাবটাইটেল</label>
                <input
                  type="text"
                  value={formData.statsSubtitle || ''}
                  onChange={(e) => setFormData({ ...formData, statsSubtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-600"
                  placeholder="একটি সফল যাত্রায় ঐতিহ্য ও সাফল্যের কথা"
                />
              </div>
            </div>

            {/* 6 Key Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Stat 1: Students */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2">
                <span className="text-[11px] font-bold text-emerald-700 uppercase">কার্ড ১ (শিক্ষার্থী)</span>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">লেবেল</label>
                  <input
                    type="text"
                    value={formData.statStudentsLabel || ''}
                    onChange={(e) => setFormData({ ...formData, statStudentsLabel: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold"
                    placeholder="মোট শিক্ষার্থী"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">মান / সংখ্যা</label>
                  <input
                    type="text"
                    value={formData.totalStudents || ''}
                    onChange={(e) => setFormData({ ...formData, totalStudents: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-emerald-800"
                    placeholder="১,২০০+"
                  />
                </div>
              </div>

              {/* Stat 2: Teachers */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2">
                <span className="text-[11px] font-bold text-emerald-700 uppercase">কার্ড ২ (শিক্ষক)</span>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">লেবেল</label>
                  <input
                    type="text"
                    value={formData.statTeachersLabel || ''}
                    onChange={(e) => setFormData({ ...formData, statTeachersLabel: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold"
                    placeholder="শিক্ষক মণ্ডলী"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">মান / সংখ্যা</label>
                  <input
                    type="text"
                    value={formData.totalTeachers || ''}
                    onChange={(e) => setFormData({ ...formData, totalTeachers: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-emerald-800"
                    placeholder="২৮+"
                  />
                </div>
              </div>

              {/* Stat 3: Pass Rate */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2">
                <span className="text-[11px] font-bold text-emerald-700 uppercase">কার্ড ৩ (পাশের হার)</span>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">লেবেল</label>
                  <input
                    type="text"
                    value={formData.statPassRateLabel || ''}
                    onChange={(e) => setFormData({ ...formData, statPassRateLabel: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold"
                    placeholder="সর্বমোট পাশের হার"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">মান / শতাংশ</label>
                  <input
                    type="text"
                    value={formData.passRate || ''}
                    onChange={(e) => setFormData({ ...formData, passRate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-emerald-800"
                    placeholder="৯৮%"
                  />
                </div>
              </div>

              {/* Stat 4: GPA-5 */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2">
                <span className="text-[11px] font-bold text-emerald-700 uppercase">কার্ড ৪ (জিপিএ-৫)</span>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">লেবেল</label>
                  <input
                    type="text"
                    value={formData.statGpa5Label || ''}
                    onChange={(e) => setFormData({ ...formData, statGpa5Label: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold"
                    placeholder="জিপিএ-৫ (এ বছর)"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">মান / সংখ্যা</label>
                  <input
                    type="text"
                    value={formData.gpa5Count || ''}
                    onChange={(e) => setFormData({ ...formData, gpa5Count: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-emerald-800"
                    placeholder="৪২"
                  />
                </div>
              </div>

              {/* Stat 5: Classrooms */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2">
                <span className="text-[11px] font-bold text-emerald-700 uppercase">কার্ড ৫ (শ্রেণিকক্ষ ও ল্যাব)</span>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">লেবেল</label>
                  <input
                    type="text"
                    value={formData.statClassroomsLabel || ''}
                    onChange={(e) => setFormData({ ...formData, statClassroomsLabel: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold"
                    placeholder="ক্লাসরুম ও ল্যাব"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">মান / সংখ্যা</label>
                  <input
                    type="text"
                    value={formData.totalClassrooms || ''}
                    onChange={(e) => setFormData({ ...formData, totalClassrooms: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-emerald-800"
                    placeholder="৬০+"
                  />
                </div>
              </div>

              {/* Stat 6: Awards */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2">
                <span className="text-[11px] font-bold text-emerald-700 uppercase">কার্ড ৬ (পুরস্কার)</span>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">লেবেল</label>
                  <input
                    type="text"
                    value={formData.statAwardsLabel || ''}
                    onChange={(e) => setFormData({ ...formData, statAwardsLabel: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold"
                    placeholder="অর্জিত পুরস্কার"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">মান / সংখ্যা</label>
                  <input
                    type="text"
                    value={formData.totalAwards || ''}
                    onChange={(e) => setFormData({ ...formData, totalAwards: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-emerald-800"
                    placeholder="১৭"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: CONTACT US SECTION                                 */}
        {/* ========================================================= */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-700" />
                <span>যোগাযোগ ও আমাদের সাথে যোগাযোগ সেকশন</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                ঠিকানা, ফোন নম্বর, ইমেইল, গুগল ম্যাপ ও যোগাযোগ ফর্মের শিরোনামসমূহ
              </p>
            </div>

            {/* Section Headings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">সেকশন ব্যাজ</label>
                <input
                  type="text"
                  value={formData.contactBadge || ''}
                  onChange={(e) => setFormData({ ...formData, contactBadge: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-600"
                  placeholder="যোগাযোগ"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">সেকশন মূল শিরোনাম</label>
                <input
                  type="text"
                  value={formData.contactTitle || ''}
                  onChange={(e) => setFormData({ ...formData, contactTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:outline-hidden focus:border-emerald-600"
                  placeholder="আমাদের সাথে যোগাযোগ"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">সেকশন সাবটাইটেল</label>
                <input
                  type="text"
                  value={formData.contactSubtitle || ''}
                  onChange={(e) => setFormData({ ...formData, contactSubtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-600"
                  placeholder="প্রশ্ন, পরামর্শ বা তথ্যের জন্য সরাসরি যোগাযোগ করুন"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">ঠিকানা লেবেল</label>
                <input
                  type="text"
                  value={formData.contactAddressLabel || ''}
                  onChange={(e) => setFormData({ ...formData, contactAddressLabel: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  placeholder="ঠিকানা"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">সম্পূর্ণ ঠিকানা *</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  placeholder="দাদরা, জয়পুরহাট সদর, রাজশাহী, বাংলাদেশ"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">ফোন লেবেল</label>
                <input
                  type="text"
                  value={formData.contactPhoneLabel || ''}
                  onChange={(e) => setFormData({ ...formData, contactPhoneLabel: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  placeholder="ফোন"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">প্রধান ফোন নম্বর (Phone 1) *</label>
                <input
                  type="text"
                  value={formData.phone1 || ''}
                  onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold"
                  placeholder="+880 1711-123456"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">বিকল্প ফোন নম্বর (Phone 2)</label>
                <input
                  type="text"
                  value={formData.phone2 || ''}
                  onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                  placeholder="+880 1711-654321"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">ইমেইল ঠিকানা *</label>
                <input
                  type="text"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  placeholder="info@dadrahs.edu.bd"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">অফিস সময়সূচি *</label>
                <input
                  type="text"
                  value={formData.officeHours || ''}
                  onChange={(e) => setFormData({ ...formData, officeHours: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  placeholder="শনি-বৃহস্পতিবার: সকাল ৮টা - বিকাল ৫টা"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">সামাজিক যোগাযোগ লেবেল</label>
                <input
                  type="text"
                  value={formData.contactSocialLabel || ''}
                  onChange={(e) => setFormData({ ...formData, contactSocialLabel: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  placeholder="সামাজিক যোগাযোগ"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">গুগল ম্যাপ শিরোনাম</label>
                <input
                  type="text"
                  value={formData.contactMapTitle || ''}
                  onChange={(e) => setFormData({ ...formData, contactMapTitle: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  placeholder="বিদ্যালয়ের অবস্থান (গুগল ম্যাপ)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">বড় ম্যাপে দেখুন বাটন টেক্সট</label>
                <input
                  type="text"
                  value={formData.contactMapBtnText || ''}
                  onChange={(e) => setFormData({ ...formData, contactMapBtnText: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-emerald-800"
                  placeholder="বড় ম্যাপে দেখুন"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">বার্তা পাঠান ফর্মের শিরোনাম</label>
                <input
                  type="text"
                  value={formData.contactFormTitle || ''}
                  onChange={(e) => setFormData({ ...formData, contactFormTitle: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  placeholder="আমাদের বার্তা পাঠান"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">বার্তা পাঠান বাটন টেক্সট</label>
                <input
                  type="text"
                  value={formData.contactSubmitBtnText || ''}
                  onChange={(e) => setFormData({ ...formData, contactSubmitBtnText: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-emerald-800"
                  placeholder="বার্তা পাঠান"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">গুগল ম্যাপ এমবেড কোড / সার্চ URL</label>
              <textarea
                rows={2}
                value={formData.googleMapEmbedUrl || ''}
                onChange={(e) => setFormData({ ...formData, googleMapEmbedUrl: e.target.value })}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-700"
                placeholder="https://maps.google.com/maps?q=...&output=embed"
              />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 9: FOOTER AREA                                        */}
        {/* ========================================================= */}
        {activeTab === 'footer' && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-700" />
                <span>ফুটার এরিয়া কাস্টমাইজেশন</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                কলাম শিরোনাম, কপিরাইট নোটিশ, বোর্ড স্বীকৃতি ও ফুটার ক্রেডিট টেক্সট
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  ফুটার কলাম ২ শিরোনাম
                </label>
                <input
                  type="text"
                  value={formData.footerCol2Title || ''}
                  onChange={(e) => setFormData({ ...formData, footerCol2Title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  placeholder="অনলাইন সেবা ও লিংক"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  ফুটার কলাম ৩ শিরোনাম
                </label>
                <input
                  type="text"
                  value={formData.footerCol3Title || ''}
                  onChange={(e) => setFormData({ ...formData, footerCol3Title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  placeholder="মেনু নেভিগেশন"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  ফুটার কলাম ৪ শিরোনাম
                </label>
                <input
                  type="text"
                  value={formData.footerCol4Title || ''}
                  onChange={(e) => setFormData({ ...formData, footerCol4Title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  placeholder="যোগাযোগ"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                কপিরাইট টেক্সট (Copyright Notice) *
              </label>
              <input
                type="text"
                value={formData.copyrightText || ''}
                onChange={(e) => setFormData({ ...formData, copyrightText: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                placeholder="© 2026 দাদরা উচ্চ বিদ্যালয় | Dadra High School. সর্বস্বত্ব সংরক্ষিত।"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                বোর্ড স্বীকৃতি ব্যাজ টেক্সট (Board Affiliation)
              </label>
              <input
                type="text"
                value={formData.boardAffiliation || ''}
                onChange={(e) => setFormData({ ...formData, boardAffiliation: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                placeholder="মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, রাজশাহী অনুমোদিত"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  ফুটার ক্রেডিট প্রিফিক্স
                </label>
                <input
                  type="text"
                  value={formData.footerCreditPrefix || ''}
                  onChange={(e) => setFormData({ ...formData, footerCreditPrefix: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  placeholder="সাথে"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  ফুটার ক্রেডিট টেক্সট
                </label>
                <input
                  type="text"
                  value={formData.footerCreditText || ''}
                  onChange={(e) => setFormData({ ...formData, footerCreditText: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  placeholder="ছাত্র-শিক্ষক ঐক্য"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 mt-8">
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>পরিবর্তন সংরক্ষণ করার সাথে সাথেই ওয়েবসাইট ভিউতে দৃশ্যমান হবে।</span>
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-7 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সকল পরিবর্তন সেভ করুন (Save All)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
