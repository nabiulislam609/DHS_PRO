import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Sliders,
  Eye,
  EyeOff,
  Bell,
  Gauge,
  Maximize2,
  CheckCircle,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Share2,
  Globe,
  Edit3,
} from 'lucide-react';

export const ManageHeaderAndTicker: React.FC = () => {
  const { siteSettings, updateSiteSettings, sectionVisibility, toggleSectionVisibility, notices } = useSchool();

  const [topBarVisible, setTopBarVisible] = useState<boolean>(siteSettings.showTopBar !== false);
  const [topBarPhone, setTopBarPhone] = useState<string>(
    siteSettings.topBarPhone || siteSettings.phone1 || '+880 1711-123456'
  );
  const [topBarEmail, setTopBarEmail] = useState<string>(
    siteSettings.topBarEmail || siteSettings.email || 'info@dadrahs.edu.bd'
  );
  const [topBarOfficeHours, setTopBarOfficeHours] = useState<string>(
    siteSettings.topBarOfficeHours || siteSettings.officeHours || 'শনি-বৃহঃ সকাল ৯টা - বিকাল ৪টা'
  );
  const [topBarFacebookText, setTopBarFacebookText] = useState<string>(
    siteSettings.topBarFacebookText || 'Facebook'
  );
  const [topBarFacebookUrl, setTopBarFacebookUrl] = useState<string>(
    siteSettings.topBarFacebookUrl || siteSettings.facebook || 'https://facebook.com/dadrahighschool'
  );
  const [topBarYoutubeText, setTopBarYoutubeText] = useState<string>(
    siteSettings.topBarYoutubeText || 'YouTube'
  );
  const [topBarYoutubeUrl, setTopBarYoutubeUrl] = useState<string>(
    siteSettings.topBarYoutubeUrl || siteSettings.youtube || 'https://youtube.com/@dadrahighschool'
  );
  const [topBarInstagramText, setTopBarInstagramText] = useState<string>(
    siteSettings.topBarInstagramText || 'Instagram'
  );
  const [topBarInstagramUrl, setTopBarInstagramUrl] = useState<string>(
    siteSettings.topBarInstagramUrl || siteSettings.instagram || 'https://instagram.com/dadrahighschool'
  );
  const [topBarAdminText, setTopBarAdminText] = useState<string>(
    siteSettings.topBarAdminText || 'Admin'
  );
  const [topBarHeight, setTopBarHeight] = useState<'compact' | 'normal' | 'spacious' | 'custom'>(
    siteSettings.topBarHeight || 'normal'
  );
  const [topBarPaddingY, setTopBarPaddingY] = useState<number>(
    siteSettings.topBarPaddingY !== undefined ? siteSettings.topBarPaddingY : 6
  );

  const [navbarHeight, setNavbarHeight] = useState<'compact' | 'normal' | 'spacious' | 'custom'>(
    siteSettings.navbarHeight || 'compact'
  );
  const [navbarPaddingY, setNavbarPaddingY] = useState<number>(
    siteSettings.navbarPaddingY !== undefined ? siteSettings.navbarPaddingY : 10
  );

  const [tickerVisible, setTickerVisible] = useState<boolean>(
    (siteSettings.showNoticeTicker !== false) && (sectionVisibility.ticker !== false)
  );
  const [tickerSpeed, setTickerSpeed] = useState<number>(siteSettings.noticeTickerSpeed || 60);
  const [tickerLabel, setTickerLabel] = useState<string>(siteSettings.noticeTickerLabel || 'সর্বশেষ নোটিশ:');
  const [tickerHeight, setTickerHeight] = useState<'compact' | 'normal' | 'spacious' | 'custom'>(
    siteSettings.noticeTickerHeight || 'normal'
  );
  const [tickerPaddingY, setTickerPaddingY] = useState<number>(
    siteSettings.noticeTickerPaddingY !== undefined ? siteSettings.noticeTickerPaddingY : 8
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    updateSiteSettings({
      showTopBar: topBarVisible,
      topBarPhone: topBarPhone.trim(),
      topBarEmail: topBarEmail.trim(),
      topBarOfficeHours: topBarOfficeHours.trim(),
      topBarFacebookText: topBarFacebookText.trim() || 'Facebook',
      topBarFacebookUrl: topBarFacebookUrl.trim(),
      topBarYoutubeText: topBarYoutubeText.trim() || 'YouTube',
      topBarYoutubeUrl: topBarYoutubeUrl.trim(),
      topBarInstagramText: topBarInstagramText.trim() || 'Instagram',
      topBarInstagramUrl: topBarInstagramUrl.trim(),
      topBarAdminText: topBarAdminText.trim() || 'Admin',
      topBarHeight,
      topBarPaddingY,
      navbarHeight,
      navbarPaddingY,
      showNoticeTicker: tickerVisible,
      noticeTickerSpeed: tickerSpeed,
      noticeTickerLabel: tickerLabel.trim() || 'সর্বশেষ নোটিশ:',
      noticeTickerHeight: tickerHeight,
      noticeTickerPaddingY: tickerPaddingY,
    });

    if (sectionVisibility.ticker !== tickerVisible) {
      toggleSectionVisibility('ticker');
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleResetDefaults = () => {
    setTopBarVisible(true);
    setTopBarPhone('+880 1711-123456');
    setTopBarEmail('info@dadrahs.edu.bd');
    setTopBarOfficeHours('শনি-বৃহঃ সকাল ৯টা - বিকাল ৪টা');
    setTopBarFacebookText('Facebook');
    setTopBarFacebookUrl('https://facebook.com/dadrahighschool');
    setTopBarYoutubeText('YouTube');
    setTopBarYoutubeUrl('https://youtube.com/@dadrahighschool');
    setTopBarInstagramText('Instagram');
    setTopBarInstagramUrl('https://instagram.com/dadrahighschool');
    setTopBarAdminText('Admin');
    setTopBarHeight('normal');
    setTopBarPaddingY(6);
    setNavbarHeight('compact');
    setNavbarPaddingY(10);
    setTickerVisible(true);
    setTickerSpeed(60);
    setTickerLabel('সর্বশেষ নোটিশ:');
    setTickerHeight('normal');
    setTickerPaddingY(8);
  };

  // Speed descriptions for display
  const getSpeedLabel = (sec: number) => {
    if (sec <= 25) return '⚡ অত্যন্ত দ্রুত (Very Fast)';
    if (sec <= 45) return '⏩ দ্রুত (Fast)';
    if (sec <= 75) return '⏱️ স্বাভাবিক / আদর্শ (Normal)';
    if (sec <= 105) return '🐢 ধীরগতি (Slow)';
    return '⏳ খুব ধীর (Very Slow)';
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 w-full">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Sliders className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-800">হেডার ও নোটিফিকেশন বার সেটিংস</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            টপ গ্রিন বার শো/হাইড, ন্যাভবারের উচ্চতা (Height) কম-বেশি এবং মুভিং নোটিশ বারের গতি ও দৃশ্যমানতা নিয়ন্ত্রণ করুন
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
            title="ডিফল্ট সেটিংসে ফিরিয়ে নিন"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ডিফল্ট মান</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs hover:shadow transition cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>পরিবর্তন সংরক্ষণ করুন</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5 text-sm font-semibold">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>হেডার ও নোটিফিকেশন বারের সমস্ত সেটিংস সফলভাবে সংরক্ষিত ও লাইভ আপডেট হয়েছে!</span>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 underline"
          >
            হোমপেজে দেখুন <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* 1. Top Bar Show/Hide Control */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h3 className="font-bold text-gray-800 text-base">১. ন্যাভবারের উপরের টপ বার (Top Bar Show / Hide)</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ন্যাভবারের সবার উপরে থাকা গাঢ় সবুজ স্ট্রিপ (যেখানে ফোন নম্বর, ইমেইল, অফিস সময় ও অ্যাডমিন বাটন রয়েছে)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setTopBarVisible(!topBarVisible)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
              topBarVisible
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-gray-100 border-gray-200 text-gray-500'
            }`}
          >
            {topBarVisible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
            <span>{topBarVisible ? 'টপ বার দৃশ্যমান (ON)' : 'টপ বার লুকানো (OFF)'}</span>
          </button>
        </div>

        {/* Live Mini Preview for Top Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">টপ বার লাইভ প্রিভিউ:</span>
            {topBarVisible && (
              <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> লাইভ প্রিভিউ (রিয়েল-টাইম আপডেট)
              </span>
            )}
          </div>
          {topBarVisible ? (
            <div
              className="bg-[#0f5338] text-white text-[11px] px-4 rounded-xl flex items-center justify-between gap-2 overflow-x-auto shadow-inner transition-all duration-200"
              style={{
                paddingTop: `${topBarPaddingY}px`,
                paddingBottom: `${topBarPaddingY}px`,
              }}
            >
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-300" />
                  {topBarPhone || siteSettings.phone1 || '+880 1711-123456'}
                </span>
                <span className="hidden sm:flex items-center gap-1">
                  <Mail className="w-3 h-3 text-emerald-300" />
                  {topBarEmail || siteSettings.email || 'info@dadrahs.edu.bd'}
                </span>
                <span className="hidden md:flex items-center gap-1 text-emerald-100">
                  <Clock className="w-3 h-3 text-emerald-300" />
                  {topBarOfficeHours || siteSettings.officeHours || 'শনি-বৃহঃ সকাল ৯টা - বিকাল ৪টা'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-200 hidden lg:inline">
                  {topBarFacebookText || 'Facebook'} • {topBarYoutubeText || 'YouTube'}{topBarInstagramText ? ` • ${topBarInstagramText}` : ''}
                </span>
                <span className="bg-white/15 px-2 py-0.5 rounded text-[10px] font-bold border border-white/20">
                  {topBarAdminText || 'Admin'}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 border border-dashed border-gray-300 rounded-xl p-3 text-center text-xs text-gray-500 font-medium">
              🚫 টপ বার বর্তমানে বন্ধ (Hidden) রাখা হয়েছে। মূল ন্যাভবারে স্বয়ংক্রিয়ভাবে একটি বিকল্প অ্যাডমিন বাটন থাকবে।
            </div>
          )}
        </div>

        {/* Top Bar Height / Size Control - Navbar এর মতো হাইট কম-বেশি করার কন্ট্রোল */}
        {topBarVisible && (
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-emerald-200/60">
              <div>
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    টপ বারের উচ্চতা (Top Bar Height কম / বেশি করা)
                  </h4>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  ন্যাভবারের মতো টপ বারের উল্লম্ব প্যাডিং ও উচ্চতা পছন্দমতো স্লিম বা বড় করুন
                </p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-xs font-mono font-bold self-start sm:self-auto border border-emerald-300 shadow-2xs">
                বর্তমান প্যাডিং: {topBarPaddingY}px
              </span>
            </div>

            {/* Preset Height Buttons */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                প্রিসেট আকার নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'compact', label: 'অতি স্লিম / সংকুচিত', sub: '৩px প্যাডিং', pad: 3 },
                  { id: 'normal', label: 'স্বাভাবিক / স্ট্যান্ডার্ড', sub: '৬px প্যাডিং', pad: 6 },
                  { id: 'spacious', label: 'প্রশস্ত / বড়', sub: '১২px প্যাডিং', pad: 12 },
                  { id: 'custom', label: 'কাস্টম সাইজ', sub: 'স্লাইডার দিয়ে সেট', pad: topBarPaddingY },
                ].map((preset) => {
                  const isSelected =
                    preset.id === 'custom'
                      ? topBarHeight === 'custom' || (topBarPaddingY !== 3 && topBarPaddingY !== 6 && topBarPaddingY !== 12)
                      : topBarPaddingY === preset.pad && topBarHeight === preset.id;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setTopBarHeight(preset.id as any);
                        if (preset.id !== 'custom') {
                          setTopBarPaddingY(preset.pad);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-white border-emerald-200/70 hover:bg-emerald-100/40 text-gray-800'
                      }`}
                    >
                      <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {preset.label}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-gray-500'}`}>
                        {preset.sub}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Range Slider for Height / Vertical Padding */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">উচ্চতা / প্যাডিং স্লাইডার (২px - ২০px):</span>
                <span className="font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {topBarPaddingY} পিক্সেল
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={20}
                step={1}
                value={topBarPaddingY}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setTopBarPaddingY(val);
                  setTopBarHeight('custom');
                }}
                className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>২px (সবচেয়ে স্লিম)</span>
                <span>৬px (স্ট্যান্ডার্ড)</span>
                <span>১২px (বড়)</span>
                <span>২০px (সর্বোচ্চ বড়)</span>
              </div>
            </div>
          </div>
        )}

        {/* Top Bar Text Content Editor */}
        {topBarVisible && (
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  টপ বার টেক্সট কনটেন্ট ও লিঙ্ক সম্পাদনা
                </h4>
              </div>
              <span className="text-[11px] text-gray-400">নিচে পরিবর্তন লিখলে সাথে সাথে উপরের লাইভ বারে দেখতে পাবেন</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>ফোন নম্বর</span>
                </label>
                <input
                  type="text"
                  value={topBarPhone}
                  onChange={(e) => setTopBarPhone(e.target.value)}
                  placeholder="+880 1711-123456"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-emerald-600" />
                  <span>ইমেইল ঠিকানা</span>
                </label>
                <input
                  type="text"
                  value={topBarEmail}
                  onChange={(e) => setTopBarEmail(e.target.value)}
                  placeholder="info@dadrahs.edu.bd"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                />
              </div>

              {/* Office Hours */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  <span>অফিস সময় / টেক্সট</span>
                </label>
                <input
                  type="text"
                  value={topBarOfficeHours}
                  onChange={(e) => setTopBarOfficeHours(e.target.value)}
                  placeholder="শনি-বৃহঃ সকাল ৯টা - বিকাল ৪টা"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Social Links and Admin Text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
              {/* Facebook */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Share2 className="w-3 h-3 text-blue-600" />
                  <span>ফেসবুক টেক্সট ও লিঙ্ক</span>
                </label>
                <input
                  type="text"
                  value={topBarFacebookText}
                  onChange={(e) => setTopBarFacebookText(e.target.value)}
                  placeholder="Facebook"
                  className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                />
                <input
                  type="url"
                  value={topBarFacebookUrl}
                  onChange={(e) => setTopBarFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full px-3 py-1 text-[11px] bg-gray-50 border border-gray-200 rounded-lg text-gray-600 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                />
              </div>

              {/* YouTube */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Share2 className="w-3 h-3 text-red-600" />
                  <span>ইউটিউব টেক্সট ও লিঙ্ক</span>
                </label>
                <input
                  type="text"
                  value={topBarYoutubeText}
                  onChange={(e) => setTopBarYoutubeText(e.target.value)}
                  placeholder="YouTube"
                  className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                />
                <input
                  type="url"
                  value={topBarYoutubeUrl}
                  onChange={(e) => setTopBarYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full px-3 py-1 text-[11px] bg-gray-50 border border-gray-200 rounded-lg text-gray-600 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                />
              </div>

              {/* Instagram */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Share2 className="w-3 h-3 text-pink-600" />
                  <span>ইনস্টাগ্রাম টেক্সট ও লিঙ্ক</span>
                </label>
                <input
                  type="text"
                  value={topBarInstagramText}
                  onChange={(e) => setTopBarInstagramText(e.target.value)}
                  placeholder="Instagram"
                  className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                />
                <input
                  type="url"
                  value={topBarInstagramUrl}
                  onChange={(e) => setTopBarInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full px-3 py-1 text-[11px] bg-gray-50 border border-gray-200 rounded-lg text-gray-600 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                />
              </div>

              {/* Admin Button Label */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-emerald-600" />
                  <span>অ্যাডমিন বাটন টেক্সট</span>
                </label>
                <input
                  type="text"
                  value={topBarAdminText}
                  onChange={(e) => setTopBarAdminText(e.target.value)}
                  placeholder="Admin বা অ্যাডমিন"
                  className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                />
                <p className="text-[10px] text-gray-400">টপ বারের ডান পাশের বাটন লেবেল</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Navbar Height / Size Control */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h3 className="font-bold text-gray-800 text-base">২. মূল ন্যাভবারের উচ্চতা (Navbar Height কম / বেশি করা)</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ন্যাভবারের উল্লম্ব প্যাডিং (Vertical Padding) ও উচ্চতা নিজের পছন্দমতো স্লিম বা বড় করুন
            </p>
          </div>
          <span className="bg-blue-50 text-blue-800 px-3 py-1 rounded-lg text-xs font-mono font-bold">
            বর্তমান প্যাডিং: {navbarPaddingY}px
          </span>
        </div>

        {/* Preset Height Buttons */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">প্রিসেট আকার নির্বাচন করুন:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'compact', label: 'স্লিম / সংকুচিত', sub: '৬px প্যাডিং', pad: 6 },
              { id: 'normal', label: 'স্বাভাবিক / স্ট্যান্ডার্ড', sub: '১০px প্যাডিং', pad: 10 },
              { id: 'spacious', label: 'প্রশস্ত / বড়', sub: '১৮px প্যাডিং', pad: 18 },
              { id: 'custom', label: 'কাস্টম সাইজ', sub: 'স্লাইডার দিয়ে সেট', pad: navbarPaddingY },
            ].map((preset) => {
              const isSelected =
                preset.id === 'custom'
                  ? navbarHeight === 'custom' || (navbarPaddingY !== 6 && navbarPaddingY !== 10 && navbarPaddingY !== 18)
                  : navbarPaddingY === preset.pad && navbarHeight === preset.id;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setNavbarHeight(preset.id as any);
                    if (preset.id !== 'custom') {
                      setNavbarPaddingY(preset.pad);
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-2xs'
                      : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <p className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                    {preset.label}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{preset.sub}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fine-Tuning Range Slider */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-700">উচ্চতা / প্যাডিং স্লাইডার (৪px - ২৮px):</span>
            <span className="font-mono font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
              {navbarPaddingY} পিক্সেল
            </span>
          </div>
          <input
            type="range"
            min={4}
            max={28}
            step={1}
            value={navbarPaddingY}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setNavbarPaddingY(val);
              setNavbarHeight('custom');
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-mono">
            <span>৪px (খুব স্লিম)</span>
            <span>১০px (স্বাভাবিক)</span>
            <span>১৮px (বড়)</span>
            <span>২৮px (সর্বোচ্চ বড়)</span>
          </div>
        </div>

        {/* Live Navbar Height Preview */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-gray-600">ন্যাভবার লাইভ উচ্চতা প্রিভিউ:</span>
          <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-2xs overflow-hidden">
            <div
              className="bg-gray-50/80 rounded-lg px-4 border border-dashed border-gray-300 flex items-center justify-between transition-all duration-200"
              style={{ paddingTop: `${navbarPaddingY}px`, paddingBottom: `${navbarPaddingY}px` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-full bg-emerald-800 flex items-center justify-center text-white transition-all duration-200 ${
                    navbarPaddingY <= 7 ? 'w-8 h-8' : navbarPaddingY >= 16 ? 'w-12 h-12' : 'w-10 h-10'
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm leading-tight">
                    {siteSettings.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়'}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-medium">Dadra High School</p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-3 text-xs text-gray-600 font-medium">
                <span className="text-emerald-800 font-bold">হোম</span>
                <span>পরিচিতি</span>
                <span>নোটিশ</span>
                <span>ফলাফল</span>
                <span className="bg-emerald-700 text-white px-2.5 py-1 rounded text-[11px] font-semibold">
                  ভর্তি আবেদন
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Moving Notification Bar (NoticeTicker) Control */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h3 className="font-bold text-gray-800 text-base">
                ৩. মুভিং নোটিফিকেশন বার (Moving Notification Bar Show / Hide ও Speed)
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              স্ক্রলিং নোটিশ বার দেখানো বা লুকানো এবং স্ক্রোল করার গতি (Speed) দ্রুত বা ধীর করা
            </p>
          </div>

          <button
            type="button"
            onClick={() => setTickerVisible(!tickerVisible)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
              tickerVisible
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {tickerVisible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-rose-500" />}
            <span>{tickerVisible ? 'মুভিং বার দৃশ্যমান (ON)' : 'মুভিং বার লুকানো (OFF)'}</span>
          </button>
        </div>

        {/* Ticker Label / Title Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            নোটিশ ব্যাজ টাইটেল (Title Text):
          </label>
          <input
            type="text"
            value={tickerLabel}
            onChange={(e) => setTickerLabel(e.target.value)}
            placeholder="সর্বশেষ নোটিশ:"
            className="w-full sm:w-80 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-600"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            বিকল্প উদাহরণ: "জরুরি নোটিশ:", "ব্রেকিং নিউজ:", "বিজ্ঞপ্তি:"
          </p>
        </div>

        {/* Speed Preset Buttons */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-700">স্ক্রোলিং গতি প্রিসেট নির্বাচন:</label>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {getSpeedLabel(tickerSpeed)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { label: '⚡ খুব দ্রুত', sub: '২০ সেকেন্ড', sec: 20 },
              { label: '⏩ দ্রুত', sub: '৪০ সেকেন্ড', sec: 40 },
              { label: '⏱️ স্বাভাবিক', sub: '৬০ সেকেন্ড', sec: 60 },
              { label: '🐢 ধীরগতি', sub: '৯০ সেকেন্ড', sec: 90 },
              { label: '⏳ খুব ধীর', sub: '১২০ সেকেন্ড', sec: 120 },
            ].map((speedPreset) => {
              const isSelected = tickerSpeed === speedPreset.sec;
              return (
                <button
                  key={speedPreset.sec}
                  type="button"
                  onClick={() => setTickerSpeed(speedPreset.sec)}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-600 shadow-2xs font-bold text-emerald-950'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <p className="text-xs font-bold">{speedPreset.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{speedPreset.sub}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Precision Speed Slider */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-700 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-emerald-600" />
              <span>প্রিসিশন স্পিড স্লাইডার (১০ সেকেন্ড - ১৫০ সেকেন্ড):</span>
            </span>
            <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              এক চক্র শেষ হতে সময়: {tickerSpeed}s
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={150}
            step={5}
            value={tickerSpeed}
            onChange={(e) => setTickerSpeed(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-mono">
            <span>১০s (সর্বোচ্চ স্পিড)</span>
            <span>৪০s (দ্রুত)</span>
            <span>৬০s (স্বাভাবিক)</span>
            <span>১০০s (ধীর)</span>
            <span>১৫০s (খুব ধীর)</span>
          </div>
          <p className="text-[11px] text-gray-500">
            💡 তথ্য: সময় যত <strong>কম</strong> হবে নোটিশ তত <strong>দ্রুত গতিতে</strong> বাম দিকে চলবে; সময় যত <strong>বেশি</strong> হবে তত <strong>ধীরে</strong> চলবে।
          </p>
        </div>

        {/* Notice Ticker Height / Size Control - নোটিশ বারের উচ্চতা কম / বেশি করা */}
        {tickerVisible && (
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-amber-200/60">
              <div>
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-amber-700" />
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    মুভিং নোটিফিকেশন বারের উচ্চতা (Notice Bar Height কম / বেশি করা)
                  </h4>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  ন্যাভবারের মতো নোটিশ বারের উল্লম্ব প্যাডিং ও উচ্চতা পছন্দমতো স্লিম বা বড় করুন
                </p>
              </div>
              <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-lg text-xs font-mono font-bold self-start sm:self-auto border border-amber-300 shadow-2xs">
                বর্তমান প্যাডিং: {tickerPaddingY}px
              </span>
            </div>

            {/* Preset Height Buttons */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                প্রিসেট আকার নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'compact', label: 'অতি স্লিম / সংকুচিত', sub: '৪px প্যাডিং', pad: 4 },
                  { id: 'normal', label: 'স্বাভাবিক / স্ট্যান্ডার্ড', sub: '৮px প্যাডিং', pad: 8 },
                  { id: 'spacious', label: 'প্রশস্ত / বড়', sub: '১৪px প্যাডিং', pad: 14 },
                  { id: 'custom', label: 'কাস্টম সাইজ', sub: 'স্লাইডার দিয়ে সেট', pad: tickerPaddingY },
                ].map((preset) => {
                  const isSelected =
                    preset.id === 'custom'
                      ? tickerHeight === 'custom' || (tickerPaddingY !== 4 && tickerPaddingY !== 8 && tickerPaddingY !== 14)
                      : tickerPaddingY === preset.pad && tickerHeight === preset.id;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setTickerHeight(preset.id as any);
                        if (preset.id !== 'custom') {
                          setTickerPaddingY(preset.pad);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                          : 'bg-white border-amber-200/70 hover:bg-amber-100/40 text-gray-800'
                      }`}
                    >
                      <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {preset.label}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-amber-100' : 'text-gray-500'}`}>
                        {preset.sub}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Range Slider for Notice Bar Height */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">উচ্চতা / প্যাডিং স্লাইডার (২px - ২৪px):</span>
                <span className="font-mono font-bold text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {tickerPaddingY} পিক্সেল
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={24}
                step={1}
                value={tickerPaddingY}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setTickerPaddingY(val);
                  setTickerHeight('custom');
                }}
                className="w-full h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>২px (সবচেয়ে স্লিম)</span>
                <span>৮px (স্ট্যান্ডার্ড)</span>
                <span>১৪px (বড়)</span>
                <span>২৪px (সর্বোচ্চ বড়)</span>
              </div>
            </div>
          </div>
        )}

        {/* Live Moving Ticker Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>লাইভ মুভিং প্রিভিউ (নিচের বক্সে সরাসরি গতি দেখুন):</span>
            </span>
            {tickerVisible && (
              <span className="text-[11px] text-emerald-600 font-medium">
                মাউস নিলে থেমে থাকবে (Hover to pause)
              </span>
            )}
          </div>

          {tickerVisible ? (
            <div
              className="w-full bg-[#053527] border border-[#042b1f] text-white px-3 rounded-xl overflow-hidden shadow-inner transition-all duration-200"
              style={{
                paddingTop: `${tickerPaddingY}px`,
                paddingBottom: `${tickerPaddingY}px`,
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="inline-flex items-center gap-1.5 bg-[#0f4d3a] text-amber-300 border border-[#1b6a52] px-3 py-1 rounded-full text-xs font-bold shrink-0">
                  <Bell className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="leading-none pt-0.5">{tickerLabel || 'সর্বশেষ নোটিশ:'}</span>
                </div>

                <div className="overflow-hidden relative w-full whitespace-nowrap">
                  <div
                    className="inline-flex items-center gap-6 animate-marquee"
                    style={{ animationDuration: `${tickerSpeed}s` }}
                  >
                    {[...notices.slice(0, 5), ...notices.slice(0, 5)].map((notice, idx) => (
                      <span
                        key={`${notice.id}-${idx}`}
                        className="inline-flex items-center gap-2 text-xs font-medium shrink-0"
                      >
                        <span className="inline-flex items-center justify-center px-2 h-[20px] rounded-md text-[10px] font-bold leading-none bg-emerald-600 text-white shadow-2xs select-none shrink-0">
                          <span className="inline-block leading-none text-center transform translate-y-[1.5px]">
                            {notice.category || 'সাধারণ'}
                          </span>
                        </span>
                        <span>{notice.title}</span>
                        <span className="text-emerald-400 font-bold">•</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 border border-dashed border-gray-300 rounded-xl p-3 text-center text-xs text-rose-500 font-medium">
              🚫 মুভিং নোটিফিকেশন বার বন্ধ রাখা হয়েছে। হোমপেজে এটি দেখাবে না।
            </div>
          )}
        </div>
      </div>

      {/* Save Button Footer */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
        >
          <CheckCircle className="w-4 h-4" />
          <span>সেটিংস পরিবর্তন সংরক্ষণ করুন</span>
        </button>
      </div>
    </div>
  );
};
