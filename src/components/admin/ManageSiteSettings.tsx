import React, { useState, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { compressImageFile } from '../../utils/imageUpload';
import {
  Save,
  CheckCircle,
  Upload,
  Image as ImageIcon,
  Trash2,
  Globe,
  Share2,
  Phone,
  FileText,
  Building,
  Sliders,
  ExternalLink,
  AlertCircle,
  PenTool,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { trackEvent } from '../../utils/analytics';

export const ManageSiteSettings: React.FC = () => {
  const { siteSettings, updateSiteSettings, setAdminTab } = useSchool();
  const [form, setForm] = useState({
    headmasterName: 'মো: সাদেকুল ইসলাম',
    headmasterDesignation: 'প্রধান শিক্ষক',
    headmasterSignatureUrl: '',
    ...siteSettings,
  });
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [testPingSent, setTestPingSent] = useState(false);

  const handleSendTestPing = () => {
    trackEvent('test_admin_ping', {
      source: 'Admin Settings Test',
      school: form.schoolNameBangla || 'Dadra High School',
      sent_at: new Date().toLocaleTimeString(),
    });
    setTestPingSent(true);
    setTimeout(() => setTestPingSent(false), 6000);
  };

  const logoFileRef = useRef<HTMLInputElement | null>(null);
  const faviconFileRef = useRef<HTMLInputElement | null>(null);
  const ogImageFileRef = useRef<HTMLInputElement | null>(null);
  const signatureFileRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'faviconUrl' | 'ogImageUrl' | 'headmasterSignatureUrl',
    maxWidth = 600,
    maxHeight = 600
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingTarget(field);
      const base64 = await compressImageFile(file, maxWidth, maxHeight, 0.85);
      setForm((prev) => ({ ...prev, [field]: base64 }));
    } catch (err: any) {
      alert(err.message || 'ছবি আপলোড করতে ত্রুটি হয়েছে');
    } finally {
      setUploadingTarget(null);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await updateSiteSettings(form);
      setSaved(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSaved(false), 3500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'সাইট সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">সাইট সেটিংস</h1>
          <p className="text-xs text-gray-500">বিদ্যালয়ের মৌলিক তথ্য, যোগাযোগ, সামাজিক মাধ্যম ও SEO</p>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>সংরক্ষণ করুন</span>
        </button>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>সাইট সেটিংস সফলভাবে আপডেট ও সংরক্ষিত হয়েছে!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-semibold animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Header, Top Bar & Ticker Banner Card */}
        <div className="bg-emerald-950 text-white rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-800 rounded-lg text-emerald-300">
                <Sliders className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-white">হেডার, টপ বার ও মুভিং নোটিফিকেশন বার সেটিংস</h3>
            </div>
            <p className="text-xs text-emerald-200">
              ন্যাভবারের টপ বার Show/Hide, ন্যাভবারের উচ্চতা (Height) কম-বেশি এবং মুভিং নোটিশ বারের স্ক্রোলিং গতি (Speed) নিয়ন্ত্রণ করুন
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAdminTab('header_settings')}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 shadow-xs"
          >
            <span>হেডার ও নোটিফিকেশন বার কন্ট্রোলার খুলুন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Section 1: প্রাথমিক তথ্য */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Building className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-gray-900">প্রাথমিক তথ্য</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">বিদ্যালয়ের নাম (English)</label>
              <input
                type="text"
                value={form.schoolNameEnglish || ''}
                onChange={(e) => setForm({ ...form, schoolNameEnglish: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">বিদ্যালয়ের নাম (Bangla)</label>
              <input
                type="text"
                value={form.schoolNameBangla || ''}
                onChange={(e) => setForm({ ...form, schoolNameBangla: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">সংক্ষিপ্ত নাম</label>
              <input
                type="text"
                placeholder="যেমন: DHS"
                value={form.shortName || ''}
                onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">EIIN নম্বর (EIIN Number)</label>
              <input
                type="text"
                placeholder="যেমন: 121820"
                value={form.eiin || ''}
                onChange={(e) => setForm({ ...form, eiin: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">স্থাপিত সন (Established Year)</label>
              <input
                type="text"
                placeholder="যেমন: ১৯৮২ বা 1982"
                value={form.establishedYear || ''}
                onChange={(e) => setForm({ ...form, establishedYear: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">ট্যাগলাইন / মূলমন্ত্র (Tagline / Motto)</label>
              <input
                type="text"
                placeholder="যেমন: শিক্ষা, নীতি, আদর্শ — গড়ব আগামী দিন"
                value={form.tagline || form.motto || ''}
                onChange={(e) => setForm({ ...form, tagline: e.target.value, motto: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                * এটি হোমপেজ ও ফুটারের ব্র্যান্ডিং সেকশনে প্রদর্শিত হয়।
              </p>
            </div>

            {/* Logo Upload */}
            <div className="sm:col-span-2 bg-gray-50/80 p-4 rounded-xl border border-gray-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
                  <span>লোগো (Logo) — ডিভাইস থেকে আপলোড করুন বা লিংক দিন</span>
                </label>
                <input
                  type="file"
                  ref={logoFileRef}
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logoUrl', 300, 300)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoFileRef.current?.click()}
                  disabled={uploadingTarget === 'logoUrl'}
                  className="inline-flex items-center gap-1 bg-[#15803d] hover:bg-[#166534] text-white px-3 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3 h-3" />
                  <span>{uploadingTarget === 'logoUrl' ? 'আপলোড হচ্ছে...' : 'ডিভাইস থেকে ফটো নির্বাচন করুন'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {form.logoUrl ? (
                  <div className="relative w-12 h-12 rounded-full border-2 border-[#F59E0B] bg-[#00A859] p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                    <img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-full" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, logoUrl: '' })}
                      className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 shadow-xs"
                      title="সরান"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg border border-dashed border-gray-300 bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 text-[10px]">
                    নো লোগো
                  </div>
                )}
                <input
                  type="text"
                  placeholder="লোগো URL (অথবা উপরের বাটন চাপুন)"
                  value={form.logoUrl || ''}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Favicon Upload */}
            <div className="sm:col-span-2 bg-gray-50/80 p-4 rounded-xl border border-gray-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
                  <span>ফেভিকন (Favicon) — ডিভাইস থেকে আপলোড করুন বা লিংক দিন</span>
                </label>
                <input
                  type="file"
                  ref={faviconFileRef}
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'faviconUrl', 128, 128)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => faviconFileRef.current?.click()}
                  disabled={uploadingTarget === 'faviconUrl'}
                  className="inline-flex items-center gap-1 bg-[#15803d] hover:bg-[#166534] text-white px-3 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3 h-3" />
                  <span>{uploadingTarget === 'faviconUrl' ? 'আপলোড হচ্ছে...' : 'ডিভাইস থেকে ফটো নির্বাচন করুন'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {form.faviconUrl ? (
                  <div className="relative w-10 h-10 rounded-lg border border-gray-300 bg-white p-1 flex items-center justify-center shrink-0">
                    <img src={form.faviconUrl} alt="Favicon" className="max-w-full max-h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, faviconUrl: '' })}
                      className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5"
                      title="সরান"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg border border-dashed border-gray-300 bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 text-[10px]">
                    নো আইকন
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Favicon URL (অথবা উপরের বাটন চাপুন)"
                  value={form.faviconUrl || ''}
                  onChange={(e) => setForm({ ...form, faviconUrl: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: প্রধান শিক্ষকের তথ্য ও ডিজিটাল স্বাক্ষর */}
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <PenTool className="w-4 h-4 text-emerald-700" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  প্রধান শিক্ষকের স্বাক্ষর ও পরিচিতি (Headmaster Signature & Seal)
                </h3>
                <p className="text-[11px] text-gray-500">
                  ওয়েবসাইটের সকল অফিসিয়াল ফরম, প্রবেশপত্র (Admit Card), নম্বরপত্র (Marksheet) ও নোটিশে এই স্বাক্ষর ও নাম ব্যবহৃত হবে।
                </p>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10.5px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              সকল নথিতে সক্রিয়
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                প্রধান শিক্ষকের নাম (Headmaster Name) *
              </label>
              <input
                type="text"
                placeholder="যেমন: মো: সাদেকুল ইসলাম"
                value={form.headmasterName || 'মো: সাদেকুল ইসলাম'}
                onChange={(e) => setForm({ ...form, headmasterName: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-bold text-gray-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                পদবী (Designation) *
              </label>
              <input
                type="text"
                placeholder="যেমন: প্রধান শিক্ষক"
                value={form.headmasterDesignation || 'প্রধান শিক্ষক'}
                onChange={(e) => setForm({ ...form, headmasterDesignation: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
              />
            </div>

            {/* Signature Upload & Live Preview */}
            <div className="sm:col-span-2 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                    <PenTool className="w-3.5 h-3.5 text-emerald-700" />
                    <span>প্রধান শিক্ষকের ডিজিটাল স্বাক্ষর (Signature Image)</span>
                  </label>
                  <p className="text-[10.5px] text-gray-500 mt-0.5">
                    স্বচ্ছ ব্যাকগ্রাউন্ডের (PNG/WebP/JPG) স্বাক্ষরের স্পষ্ট ছবি আপলোড করুন
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={signatureFileRef}
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'headmasterSignatureUrl', 450, 180)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => signatureFileRef.current?.click()}
                    disabled={uploadingTarget === 'headmasterSignatureUrl'}
                    className="inline-flex items-center gap-1.5 bg-[#15803d] hover:bg-[#166534] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50 shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingTarget === 'headmasterSignatureUrl' ? 'আপলোড হচ্ছে...' : 'ডিভাইস থেকে স্বাক্ষর আপলোড'}</span>
                  </button>
                  {form.headmasterSignatureUrl && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, headmasterSignatureUrl: '' })}
                      className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>স্বাক্ষর মুছুন</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Signature Preview & URL Input */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center pt-1">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    স্বাক্ষর ইমেজ URL (ঐচ্ছিক — ডিভাইস আপলোড না থাকলে লিংক দিন):
                  </label>
                  <input
                    type="text"
                    placeholder="https://... অথবা উপরের বাটনে ক্লিক করে ডিভাইস থেকে ফাইল আপলোড করুন"
                    value={form.headmasterSignatureUrl || ''}
                    onChange={(e) => setForm({ ...form, headmasterSignatureUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                {/* Live Preview Box */}
                <div className="bg-white p-3 rounded-xl border border-emerald-200 text-center shadow-2xs">
                  <span className="text-[10px] font-bold text-gray-500 block mb-1">
                    নথিপত্রে যেমন দেখা যাবে:
                  </span>
                  <div className="h-12 flex items-center justify-center">
                    {form.headmasterSignatureUrl ? (
                      <img
                        src={form.headmasterSignatureUrl}
                        alt="Headmaster Signature"
                        className="max-h-12 max-w-[150px] object-contain"
                      />
                    ) : (
                      <div className="font-serif italic text-emerald-950 text-base font-bold opacity-80">
                        {form.headmasterName || 'মো: সাদেকুল ইসলাম'}
                      </div>
                    )}
                  </div>
                  <div className="w-32 border-b border-gray-400 mx-auto my-1" />
                  <span className="text-[10px] font-bold text-gray-800 block">
                    {form.headmasterName || 'মো: সাদেকুল ইসলাম'}
                  </span>
                  <span className="text-[9px] text-gray-500 block">
                    {form.headmasterDesignation || 'প্রধান শিক্ষক'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: যোগাযোগ তথ্য */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Phone className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-gray-900">যোগাযোগ তথ্য</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">ঠিকানা</label>
              <input
                type="text"
                value={form.address || ''}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">ফোন</label>
              <input
                type="text"
                value={form.phone1 || ''}
                onChange={(e) => setForm({ ...form, phone1: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">ইমেইল</label>
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">জরুরি ফোন</label>
              <input
                type="text"
                value={form.emergencyPhone || form.phone2 || ''}
                onChange={(e) =>
                  setForm({ ...form, emergencyPhone: e.target.value, phone2: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">অফিস সময়</label>
              <input
                type="text"
                value={form.officeHours || ''}
                onChange={(e) => setForm({ ...form, officeHours: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-gray-700">Google Map Embed URL</label>
                <button
                  type="button"
                  onClick={() => {
                    const q = encodeURIComponent(`${form.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়'}, ${form.address || 'জয়পুরহাট'}`);
                    setForm({
                      ...form,
                      googleMapEmbedUrl: `https://maps.google.com/maps?q=${q}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
                    });
                  }}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                >
                  ⚡ ঠিকানা অনুযায়ী অটো ম্যাপ তৈরি করুন
                </button>
              </div>
              <input
                type="text"
                placeholder="Google Maps Embed URL অথবা iframe কোড দিন"
                value={form.googleMapEmbedUrl || ''}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val.includes('<iframe')) {
                    const m = val.match(/src=["'](.*?)["']/);
                    if (m && m[1]) val = m[1];
                  }
                  setForm({ ...form, googleMapEmbedUrl: val });
                }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono text-[11px]"
              />
              <p className="text-[10px] text-gray-500">
                টিপস: গুগল ম্যাপ থেকে Share {'>'} Embed a map এর লিংক পেস্ট করতে পারেন অথবা উপরের অটো ম্যাপ বাটন চাপুন।
              </p>

              {/* Map Preview */}
              <div className="mt-2 h-44 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                <iframe
                  title="Admin Map Preview"
                  src={
                    form.googleMapEmbedUrl && !form.googleMapEmbedUrl.includes('pb=!1m18!1m12!1m3!1d3648.5')
                      ? form.googleMapEmbedUrl
                      : `https://maps.google.com/maps?q=${encodeURIComponent(
                          `${form.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়'}, ${form.address || 'জয়পুরহাট'}`
                        )}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                  }
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: সামাজিক মাধ্যম */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Share2 className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-gray-900">সামাজিক মাধ্যম</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Facebook</label>
              <input
                type="text"
                value={form.facebook || ''}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                placeholder="https://facebook.com/dadrahighschool"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">YouTube</label>
              <input
                type="text"
                value={form.youtube || ''}
                onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                placeholder="https://youtube.com/@dadrahighschool"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Instagram</label>
              <input
                type="text"
                value={form.instagram || ''}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="https://instagram.com/dadrahighschool"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">LinkedIn</label>
              <input
                type="text"
                value={form.linkedin || ''}
                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                placeholder=""
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">WhatsApp</label>
              <input
                type="text"
                value={form.whatsapp || ''}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="https://wa.me/8801711123456"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 4: SEO ও মেটা */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Globe className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-gray-900">SEO ও মেটা</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">মেটা টাইটেল</label>
              <input
                type="text"
                value={form.metaTitle || ''}
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">মেটা ডেসক্রিপশন</label>
              <textarea
                rows={2}
                value={form.metaDescription || ''}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            {/* OG Image Upload */}
            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
                  <span>OG Image URL — ডিভাইস থেকে আপলোড করুন বা লিংক দিন</span>
                </label>
                <input
                  type="file"
                  ref={ogImageFileRef}
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'ogImageUrl', 1200, 630)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => ogImageFileRef.current?.click()}
                  disabled={uploadingTarget === 'ogImageUrl'}
                  className="inline-flex items-center gap-1 bg-[#15803d] hover:bg-[#166534] text-white px-3 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3 h-3" />
                  <span>{uploadingTarget === 'ogImageUrl' ? 'আপলোড হচ্ছে...' : 'ডিভাইস থেকে ফটো নির্বাচন করুন'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {form.ogImageUrl ? (
                  <div className="relative w-16 h-10 rounded-lg border border-gray-300 bg-gray-900 overflow-hidden shrink-0">
                    <img src={form.ogImageUrl} alt="OG" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, ogImageUrl: '' })}
                      className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5"
                      title="সরান"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-10 rounded-lg border border-dashed border-gray-300 bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 text-[10px]">
                    নো ইমেজ
                  </div>
                )}
                <input
                  type="text"
                  placeholder="OG Image URL (সোশ্যাল শেয়ার প্রিভিউ)"
                  value={form.ogImageUrl || ''}
                  onChange={(e) => setForm({ ...form, ogImageUrl: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Google Analytics 4 (GA4) Configuration */}
            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-gray-800 flex items-center gap-1.5 text-xs">
                  <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Google Analytics Measurement ID (গুগল অ্যানালিটিক্স ট্র্যাকিং)</span>
                </label>
                {form.googleAnalyticsId?.trim().startsWith('G-') ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    সক্রিয় (Active)
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-500 font-medium">ঐচ্ছিক (Optional)</span>
                )}
              </div>
              <input
                type="text"
                placeholder="যেমন: G-XXXXXXXXXX (Google Analytics 4 Measurement ID)"
                value={form.googleAnalyticsId || ''}
                onChange={(e) => setForm({ ...form, googleAnalyticsId: e.target.value.trim() })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono font-medium focus:outline-hidden focus:border-amber-600"
              />
              <p className="text-[11px] text-gray-600 leading-relaxed">
                💡 <strong>সহজ নির্দেশনা</strong>: গুগল অ্যানালিটিক্স (GA4) থেকে আপনার প্রপার্টির <em>Data Streams</em> থেকে <strong>Measurement ID</strong> (যা দেখতে <code>G-XXXXXXXXXX</code> এর মতো) কপি করে এখানে পেস্ট করে সংরক্ষণ করুন। কোনো কোডিং প্রয়োজন নেই—ওয়েবসাইটের সকল ভিজিটর, পেজ ভিউ ও ট্রাফিক তথ্য স্বয়ংক্রিয়ভাবে আপনার গুগল অ্যানালিটিক্স ড্যাশবোর্ডে জমা হবে।
              </p>

              {/* Active Custom Events List */}
              <div className="pt-2 border-t border-amber-200/60">
                <span className="text-[11px] font-bold text-gray-800 block mb-1.5">
                  🔥 স্বয়ংক্রিয়ভাবে সক্রিয় কাস্টম ইভেন্টস (Auto-tracked Custom Events):
                </span>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="bg-white/90 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-mono">
                    admission_form_submit (ভর্তি আবেদন)
                  </span>
                  <span className="bg-white/90 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-mono">
                    result_search (ফলাফল অনুসন্ধান)
                  </span>
                  <span className="bg-white/90 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-mono">
                    result_download (মার্কশীট ডাউনলোড)
                  </span>
                  <span className="bg-white/90 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-mono">
                    admit_card_search (প্রবেশপত্র অনুসন্ধান)
                  </span>
                  <span className="bg-white/90 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-mono">
                    admit_card_download (প্রবেশপত্র ডাউনলোড)
                  </span>
                  <span className="bg-white/90 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-mono">
                    file_download (ফরম ডাউনলোড)
                  </span>
                  <span className="bg-white/90 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-mono">
                    contact_form_submit (মেসেজ জমা)
                  </span>
                  <span className="bg-white/90 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-mono">
                    social_click (সোশ্যাল লিঙ্ক ক্লিক)
                  </span>
                </div>
              </div>

              {/* Live Test Trigger Button */}
              <div className="pt-2 border-t border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleSendTestPing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>গুগল অ্যানালিটিক্সে একটি লাইভ টেস্ট ইভেন্ট পাঠান</span>
                </button>
                {testPingSent && (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 animate-fadeIn">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>টেস্ট ইভেন্ট সফলভাবে পাঠানো হয়েছে! Google Analytics-এর Realtime পেজে দেখুন।</span>
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">কপিরাইট টেক্সট (Copyright Text)</label>
              <input
                type="text"
                placeholder="যেমন: © 2026 দাদরা উচ্চ বিদ্যালয় | Dadra High School. সর্বস্বত্ব সংরক্ষিত।"
                value={form.copyrightText || ''}
                onChange={(e) => setForm({ ...form, copyrightText: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">অনুমোদিত শিক্ষা বোর্ড টেক্সট (Board Affiliation)</label>
              <input
                type="text"
                placeholder="যেমন: মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, রাজশাহী অনুমোদিত"
                value={form.boardAffiliation || ''}
                onChange={(e) => setForm({ ...form, boardAffiliation: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                * এটি ফুটারের নিচে ডানপাশে সবুজ ব্যাজে প্রদর্শিত হয়।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">ফুটার ক্রেডিট প্রিফিক্স</label>
                <input
                  type="text"
                  placeholder="যেমন: সাথে"
                  value={form.footerCreditPrefix || ''}
                  onChange={(e) => setForm({ ...form, footerCreditPrefix: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">ফুটার ঐক্য / ডেডিকেশন টেক্সট (Heart Credit)</label>
                <input
                  type="text"
                  placeholder="যেমন: ছাত্র-শিক্ষক ঐক্য"
                  value={form.footerCreditText || ''}
                  onChange={(e) => setForm({ ...form, footerCreditText: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  * ফুটারের নিচে লাল হার্ট চিহ্নের সাথে প্রদর্শিত হয় (যেমন: সাথে ❤️ ছাত্র-শিক্ষক ঐক্য)।
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: পেজ কনটেন্ট (About / History / Vision ইত্যাদি) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <FileText className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-gray-900">পেজ কনটেন্ট (About / History / Vision ইত্যাদি)</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">পরিচিতি (ভূমিকা)</label>
              <textarea
                rows={3}
                value={form.aboutIntro || ''}
                onChange={(e) => setForm({ ...form, aboutIntro: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">লক্ষ্য (Mission)</label>
              <textarea
                rows={3}
                value={form.mission || ''}
                onChange={(e) => setForm({ ...form, mission: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">দৃষ্টি (Vision)</label>
              <textarea
                rows={3}
                value={form.vision || ''}
                onChange={(e) => setForm({ ...form, vision: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">উদ্দেশ্য</label>
              <textarea
                rows={4}
                value={form.objectives || ''}
                onChange={(e) => setForm({ ...form, objectives: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 leading-relaxed font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">ইতিহাস</label>
              <textarea
                rows={4}
                value={form.history || ''}
                onChange={(e) => setForm({ ...form, history: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">আমরা কেন</label>
              <textarea
                rows={4}
                value={form.whyUs || ''}
                onChange={(e) => setForm({ ...form, whyUs: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 leading-relaxed font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">সুবিধা</label>
              <textarea
                rows={3}
                value={form.facilities || ''}
                onChange={(e) => setForm({ ...form, facilities: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 6: হোমপেজ সেকশন সমূহের টাইটেল, ব্যাজ ও বিবরণ (মার্ক করা এরিয়া) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                <Sliders className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  হোমপেজ সেকশন সমূহের টাইটেল, ব্যাজ ও বিবরণ (মার্ক করা ৫টি প্রধান সেকশনসহ)
                </h3>
                <p className="text-[11px] text-gray-500">
                  ওয়েবসাইটের প্রধান সেকশনগুলোর শিরোনাম, ছোট ব্যাজ টেক্সট ও সাবটাইটেল এখান থেকে পরিবর্তন করুন।
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAdminTab('sections')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <span>সেকশন নিয়ন্ত্রণ পেজ দেখুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-6 text-xs">
            {/* 1. Results Trend (Marked) */}
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>১. এসএসসি ফলাফলের ধারা (একাডেমিক পারফরম্যান্স) — মার্ক করা সেকশন</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">ব্যাজ টেক্সট</label>
                  <input
                    type="text"
                    value={form.resultsTrendBadge || ''}
                    placeholder="একাডেমিক পারফরম্যান্স"
                    onChange={(e) => setForm({ ...form, resultsTrendBadge: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">প্রধান শিরোনাম</label>
                  <input
                    type="text"
                    value={form.resultsTrendTitle || ''}
                    placeholder="এসএসসি ফলাফলের ধারা"
                    onChange={(e) => setForm({ ...form, resultsTrendTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">সাবটাইটেল / বিবরণ</label>
                  <input
                    type="text"
                    value={form.resultsTrendSubtitle || ''}
                    placeholder="গত ৫ বছরের একাডেমিক পারফরম্যান্স এক নজরে"
                    onChange={(e) => setForm({ ...form, resultsTrendSubtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* 2. Gallery (Marked) */}
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>২. আলোকিত গ্যালারি (ফটোগ্যালারি) — মার্ক করা সেকশন</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">ব্যাজ টেক্সট</label>
                  <input
                    type="text"
                    value={form.galleryBadge || ''}
                    placeholder="ফটোগ্যালারি"
                    onChange={(e) => setForm({ ...form, galleryBadge: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">প্রধান শিরোনাম</label>
                  <input
                    type="text"
                    value={form.galleryTitle || ''}
                    placeholder="আলোকিত গ্যালারি"
                    onChange={(e) => setForm({ ...form, galleryTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">সাবটাইটেল / বিবরণ</label>
                  <input
                    type="text"
                    value={form.gallerySubtitle || ''}
                    placeholder="ক্যাম্পাস, অনুষ্ঠান ও শিক্ষার্থী জীবনের কিছু মুহূর্ত"
                    onChange={(e) => setForm({ ...form, gallerySubtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* 3. Achievements (Marked) */}
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>৩. আমাদের গর্ব (অর্জনসমূহ) — মার্ক করা সেকশন</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">ব্যাজ টেক্সট</label>
                  <input
                    type="text"
                    value={form.achievementsBadge || ''}
                    placeholder="অর্জন"
                    onChange={(e) => setForm({ ...form, achievementsBadge: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">প্রধান শিরোনাম</label>
                  <input
                    type="text"
                    value={form.achievementsTitle || ''}
                    placeholder="আমাদের গর্ব"
                    onChange={(e) => setForm({ ...form, achievementsTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">সাবটাইটেল / বিবরণ</label>
                  <input
                    type="text"
                    value={form.achievementsSubtitle || ''}
                    placeholder="মেধা ও ঐতিহ্যে বিদ্যালয়ের অর্জনের কিছু দৃষ্টান্ত"
                    onChange={(e) => setForm({ ...form, achievementsSubtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* 4. Events (Marked) */}
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>৪. আসন্ন ইভেন্ট — মার্ক করা সেকশন</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">ব্যাজ টেক্সট</label>
                  <input
                    type="text"
                    value={form.eventsBadge || ''}
                    placeholder="ইভেন্ট"
                    onChange={(e) => setForm({ ...form, eventsBadge: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">প্রধান শিরোনাম</label>
                  <input
                    type="text"
                    value={form.eventsTitle || ''}
                    placeholder="আসন্ন ইভেন্ট"
                    onChange={(e) => setForm({ ...form, eventsTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">সাবটাইটেল / বিবরণ</label>
                  <input
                    type="text"
                    value={form.eventsSubtitle || ''}
                    placeholder="বিদ্যালয়ের আসন্ন কার্যক্রম ও অনুষ্ঠান"
                    onChange={(e) => setForm({ ...form, eventsSubtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* 5. News (Marked) */}
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>৫. সর্বশেষ সংবাদ — মার্ক করা সেকশন</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">ব্যাজ টেক্সট</label>
                  <input
                    type="text"
                    value={form.newsBadge || ''}
                    placeholder="সংবাদ"
                    onChange={(e) => setForm({ ...form, newsBadge: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">প্রধান শিরোনাম</label>
                  <input
                    type="text"
                    value={form.newsTitle || ''}
                    placeholder="সর্বশেষ সংবাদ"
                    onChange={(e) => setForm({ ...form, newsTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">সাবটাইটেল / বিবরণ</label>
                  <input
                    type="text"
                    value={form.newsSubtitle || ''}
                    placeholder="বিদ্যালয়ের সাম্প্রতিক ঘটনাবলি ও সংবাদ"
                    onChange={(e) => setForm({ ...form, newsSubtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* 6. Teachers, Staff, Notices & Programs */}
            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 space-y-4">
              <h4 className="font-bold text-gray-800 text-xs">অন্যান্য সেকশনসমূহের শিরোনাম:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">শিক্ষক মণ্ডলী সেকশন টাইটেল</label>
                  <input
                    type="text"
                    value={form.teachersTitle || ''}
                    placeholder="আমাদের শিক্ষক মণ্ডলী"
                    onChange={(e) => setForm({ ...form, teachersTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">কর্মকর্তা ও কর্মচারী সেকশন টাইটেল</label>
                  <input
                    type="text"
                    value={form.staffTitle || ''}
                    placeholder="আমাদের কর্মকর্তা ও কর্মচারী"
                    onChange={(e) => setForm({ ...form, staffTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">নোটিশ বোর্ড সেকশন টাইটেল</label>
                  <input
                    type="text"
                    value={form.noticesTitle || ''}
                    placeholder="সাম্প্রতিক নোটিশ ও সার্কুলার"
                    onChange={(e) => setForm({ ...form, noticesTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">একাডেমিক প্রোগ্রাম সেকশন টাইটেল</label>
                  <input
                    type="text"
                    value={form.programsTitle || ''}
                    placeholder="একাডেমিক প্রোগ্রাম"
                    onChange={(e) => setForm({ ...form, programsTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Admission Portal Settings (Backend Editable) */}
            <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>অনলাইন ভর্তি পোর্টাল সেটিংস (Admission Portal Settings)</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-900">
                  <input
                    type="checkbox"
                    checked={form.admissionOpen !== false}
                    onChange={(e) => setForm({ ...form, admissionOpen: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>অনলাইন ভর্তি কার্যক্রম চালু রাখুন</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">ভর্তি ফর্ম টাইটেল</label>
                  <input
                    type="text"
                    value={form.admissionTitle || ''}
                    placeholder="অনলাইন ভর্তি আবেদন ফর্ম"
                    onChange={(e) => setForm({ ...form, admissionTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">ভর্তির সেশন / শিক্ষাবর্ষ</label>
                  <input
                    type="text"
                    value={form.admissionSession || ''}
                    placeholder="যেমন: ২০২৬ শিক্ষাবর্ষ"
                    onChange={(e) => setForm({ ...form, admissionSession: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">ভর্তি হেল্পলাইন নম্বর</label>
                  <input
                    type="text"
                    value={form.admissionHelpline || ''}
                    placeholder="+880 1711-123456"
                    onChange={(e) => setForm({ ...form, admissionHelpline: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">আবেদনের শেষ তারিখ</label>
                  <input
                    type="text"
                    value={form.admissionEndDate || ''}
                    placeholder="যেমন: ৩১ ডিসেম্বর ২০২৬"
                    onChange={(e) => setForm({ ...form, admissionEndDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">আবেদন ফি</label>
                  <input
                    type="text"
                    value={form.admissionFee || ''}
                    placeholder="যেমন: বিনামূল্যে বা ১০০ টাকা"
                    onChange={(e) => setForm({ ...form, admissionFee: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">ভর্তি ফর্ম সাবটাইটেল</label>
                  <input
                    type="text"
                    value={form.admissionSubtitle || ''}
                    placeholder="নতুন শিক্ষাবর্ষে ভর্তির জন্য আবেদন করুন"
                    onChange={(e) => setForm({ ...form, admissionSubtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-medium"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block font-semibold text-gray-700 mb-1">ভর্তি বিজ্ঞপ্তি ও নির্দেশনা (ব্যানার টেক্সট)</label>
                  <textarea
                    rows={2}
                    value={form.admissionNotice || ''}
                    placeholder="ভর্তি সংক্রান্ত জরুরি নির্দেশনা যা ফর্মের শুরুতে প্রদর্শিত হবে..."
                    onChange={(e) => setForm({ ...form, admissionNotice: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Button matching screenshot */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white px-6 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>সংরক্ষণ করুন</span>
          </button>
        </div>
      </form>
    </div>
  );
};
