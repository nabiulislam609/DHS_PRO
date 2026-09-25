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
} from 'lucide-react';

export const ManageSiteSettings: React.FC = () => {
  const { siteSettings, updateSiteSettings, setAdminTab } = useSchool();
  const [form, setForm] = useState({ ...siteSettings });
  const [saved, setSaved] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);

  const logoFileRef = useRef<HTMLInputElement | null>(null);
  const faviconFileRef = useRef<HTMLInputElement | null>(null);
  const ogImageFileRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'faviconUrl' | 'ogImageUrl',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings(form);
    setSaved(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setSaved(false), 3500);
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
              <label className="block font-semibold text-gray-700 mb-1">ট্যাগলাইন</label>
              <input
                type="text"
                placeholder="যেমন: শিক্ষা, নীতি, আদর্শ — গড়ব আগামী দিন"
                value={form.tagline || form.motto || ''}
                onChange={(e) => setForm({ ...form, tagline: e.target.value, motto: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
              />
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
                  <div className="relative w-12 h-12 rounded-lg border border-gray-300 bg-white p-1 flex items-center justify-center shrink-0">
                    <img src={form.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, logoUrl: '' })}
                      className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5"
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

            <div>
              <label className="block font-semibold text-gray-700 mb-1">কপিরাইট টেক্সট</label>
              <input
                type="text"
                value={form.copyrightText || ''}
                onChange={(e) => setForm({ ...form, copyrightText: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
              />
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
