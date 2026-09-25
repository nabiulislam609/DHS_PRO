import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { DownloadableForm } from '../../types';
import {
  FileText,
  Download,
  Search,
  Eye,
  CheckCircle,
  FileCheck,
  Calendar,
  ArrowLeft,
  X,
  Printer,
  Sparkles,
  Info,
  GraduationCap,
} from 'lucide-react';

export const DedicatedFormsPage: React.FC = () => {
  const { siteSettings, downloadableForms, setCurrentFrontendPage } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('সকল');
  const [previewForm, setPreviewForm] = useState<DownloadableForm | null>(null);

  const categories = ['সকল', 'ভর্তি', 'ছুটি', 'প্রশংসাপত্র ও টিসি', 'অন্যান্য'];

  const filteredForms = downloadableForms.filter((f) => {
    if (!f.active) return false;
    const matchCat = selectedCategory === 'সকল' || f.category === selectedCategory;
    const matchSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handleDownload = (form: DownloadableForm) => {
    // Simulate real download by generating a downloadable text/PDF file representation
    const element = document.createElement('a');
    const content = `========================================================
${siteSettings.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়'}
${siteSettings.schoolNameEnglish || 'Dadra High School'}
ঠিকানা: ${siteSettings.address || 'দাদরা, জয়পুরহাট সদর, জয়পুরহাট'}
========================================================

ফরমের নাম: ${form.title}
ক্যাটাগরি: ${form.category}
আপডেট তারিখ: ${form.updatedDate || '২০২৬'}

[ এই অফিসিয়াল ফরমটি বিদ্যালয় কার্যালয়ে অথবা অনলাইনে পূরণ করে জমা দিন ]
========================================================`;

    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${form.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 pb-16 font-sans">
      {/* Top Hero Banner */}
      <section className="bg-gradient-to-r from-[#052e20] via-[#0b4833] to-[#04281b] text-white py-10 px-4 sm:px-8 border-b border-emerald-900/50 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => setCurrentFrontendPage('home')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200 hover:text-white mb-3 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>হোমপেজে ফিরে যান</span>
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-amber-300 shadow-inner">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  গুরুত্বপূর্ণ ফরমসমূহ (Important Forms)
                </h1>
                <p className="text-xs text-emerald-200 mt-0.5">
                  ভর্তি, ছুটি, প্রশংসাপত্র ও অন্যান্য প্রাতিষ্ঠানিক ফরম ডাউনলোড করুন
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100 bg-emerald-800/70 border border-emerald-600/40 px-3.5 py-2 rounded-xl">
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span>মোট {downloadableForms.filter((f) => f.active).length}টি প্রাতিষ্ঠানিক ফরম উন্মুক্ত</span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        {/* Search & Category Filter Toolbar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Categories Tab Pill */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ফরমের নাম দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Notice Info Box */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-950">
          <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span>
            প্রয়োজনীয় ফরমটি ডাউনলোড করে প্রিন্ট করুন এবং যথাযথ তথ্য পূরণ করে বিদ্যালয়ের প্রধান কার্যালয় বা সংশ্লিষ্ট শ্রেণি শিক্ষকের নিকট জমা দিন।
          </span>
        </div>

        {/* Forms Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredForms.map((form) => (
            <div
              key={form.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {form.category}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                    {form.fileType || 'PDF'} • {form.fileSize || '200 KB'}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-800 group-hover:text-white transition">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm group-hover:text-emerald-800 transition line-clamp-2">
                      {form.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">
                      {form.description || 'বিদ্যালয়ের অফিসিয়াল আবেদন ফরম'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-gray-400">
                  আপডেট: {form.updatedDate || '১৫ সেপ্টেম্বর ২০২৬'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewForm(form)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                    title="প্রিভিউ দেখুন"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(form)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ডাউনলোড</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredForms.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center space-y-2">
            <FileText className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="text-sm font-bold text-gray-700">কোনো ফরম পাওয়া যায়নি</h4>
            <p className="text-xs text-gray-500">
              ভিন্ন ক্যাটাগরি বা অন্য কি-ওয়ার্ড দিয়ে পুনরায় চেষ্টা করুন।
            </p>
          </div>
        )}
      </div>

      {/* Form Preview Modal */}
      {previewForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-950 text-white">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold">{previewForm.title}</h3>
                  <span className="text-[10px] text-emerald-300">{previewForm.category} ফরম প্রিভিউ</span>
                </div>
              </div>
              <button
                onClick={() => setPreviewForm(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Paper View */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-gray-50 text-xs text-gray-800 space-y-4">
              <div className="bg-white border-2 border-emerald-900 p-6 rounded-xl shadow-xs space-y-4">
                <div className="text-center border-b border-gray-200 pb-3">
                  <h2 className="text-base font-extrabold text-emerald-950">
                    {siteSettings.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়'}
                  </h2>
                  <p className="text-[11px] text-gray-600">{siteSettings.address || 'দাদরা, জয়পুরহাট'}</p>
                  <div className="mt-2 inline-block bg-emerald-800 text-white px-4 py-0.5 rounded-full font-bold text-[11px]">
                    {previewForm.title}
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-gray-700 leading-relaxed">
                  <p className="font-semibold">বরাবর,</p>
                  <p>প্রধান শিক্ষক,</p>
                  <p>{siteSettings.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়'}, জয়পুরহাট।</p>
                  <p className="font-bold pt-2">বিষয়: {previewForm.title} প্রসঙ্গে।</p>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2 mt-4 text-[11px]">
                    <p className="text-gray-500 italic">
                      [ আবেদনকারীর নাম, শ্রেণি, রোল, অভিভাবকের বিবরণ ও প্রয়োজনীয় তথ্যাবলী লিপিবদ্ধ করার নির্ধারিত ছক ও ফরম্যাট এখানে অন্তর্ভুক্ত থাকবে ]
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="border-b border-dotted border-gray-400 py-1">শিক্ষার্থীর নাম: .....................</div>
                      <div className="border-b border-dotted border-gray-400 py-1">শ্রেণি ও রোল: .....................</div>
                      <div className="border-b border-dotted border-gray-400 py-1">পিতার নাম: .....................</div>
                      <div className="border-b border-dotted border-gray-400 py-1">মোবাইল: .....................</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-8 text-[11px] text-gray-600">
                  <div>অভিভাবকের স্বাক্ষর</div>
                  <div>শিক্ষার্থীর স্বাক্ষর</div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-end gap-2.5">
              <button
                onClick={() => setPreviewForm(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => {
                  handleDownload(previewForm);
                  setPreviewForm(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ডাউনলোড করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
