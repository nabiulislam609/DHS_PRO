import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { DownloadableForm } from '../../types';
import { DedicatedHeader } from './DedicatedHeader';
import { PageHero } from './PageHero';
import { trackFormDownload } from '../../utils/analytics';
import {
  FileText,
  Download,
  Search,
  Bookmark,
  Eye,
  CheckCircle,
  Calendar,
  ArrowLeft,
  X,
  Printer,
  Sparkles,
  Info,
  GraduationCap,
  Paperclip,
  CheckCircle2,
  Clock,
  Loader2,
  FileCheck2,
} from 'lucide-react';
import {
  printForm,
  downloadEditableForm,
  downloadFormPdf,
  buildFormHtml,
  getFormKind,
  getFormTheme,
} from '../../utils/formDocumentHelper';
import { Footer } from './Footer';

export const DedicatedFormsPage: React.FC = () => {
  const { siteSettings, downloadableForms, setCurrentFrontendPage } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('সকল');
  const [previewForm, setPreviewForm] = useState<DownloadableForm | null>(null);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);

  const categories = ['সকল', 'ভর্তি', 'ছুটি', 'প্রশংসাপত্র ও টিসি', 'অন্যান্য'];

  const filteredForms = downloadableForms.filter((f) => {
    if (!f.active) return false;
    const matchCat = selectedCategory === 'সকল' || f.category === selectedCategory;
    const matchSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handleDownloadPdf = async (form: DownloadableForm) => {
    try {
      setGeneratingPdfId(form.id);

      // Fire Google Analytics 4 Custom Event
      trackFormDownload({
        formTitle: form.title,
        category: form.category,
        fileType: form.fileType || 'PDF',
      });

      await downloadFormPdf(form, siteSettings);
    } finally {
      setGeneratingPdfId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F5] text-[#14211B] flex flex-col font-sans subpage-fade-in">
      {/* Top Institutional Header */}
      <DedicatedHeader pageName="ফরম ও ডাউনলোড" />

      {/* Unified PageHero Banner */}
      <PageHero
        title="গুরুত্বপূর্ণ প্রাতিষ্ঠানিক ফরমসমূহ"
        description="ভর্তি, ছুটি, প্রশংসাপত্র, টিসি ও অন্যান্য ফরম প্রিভিউ, ইউনিকোড PDF ডাউনলোড ও সরাসরি প্রিন্ট করুন।"
        badgeText="প্রাতিষ্ঠানিক ফরম ও ডাউনলোড পোর্টাল"
        badgeIcon={<Bookmark className="w-3.5 h-3.5 text-emerald-300" />}
        breadcrumbs={[{ label: 'ফরম ও ডাউনলোড' }]}
      />

      {/* Main Content Area - Overlapping Hero Banner with -mt-16 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 space-y-6 -mt-16 relative z-20 pb-16 flex-1 w-full">
        {/* Search & Category Filter Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8E4] shadow-md p-6 sm:p-8 space-y-6 print:hidden">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-base sm:text-lg">
              <Search className="w-5 h-5 text-emerald-600" />
              <span>প্রয়োজনীয় প্রাতিষ্ঠানিক ফরম অনুসন্ধান করুন</span>
            </div>
            <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold">
              মোট {downloadableForms.filter((f) => f.active).length}টি প্রাতিষ্ঠানিক ফরম উন্মুক্ত
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ফরমের নাম দিয়ে খুঁজুন... (যেমন: ভর্তি, ছুটি, প্রত্যয়ন)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50/70 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  title="অনুসন্ধান মুছুন"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="md:col-span-7 flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Popular Form Chips - Matching Results Page Demo Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 text-xs">
            <span className="text-gray-500 font-bold">জনপ্রিয় ফরমসমূহ:</span>
            {['ভর্তি ফরম', 'ছুটির আবেদন', 'প্রশংসাপত্র', 'ছাড়পত্র (টিসি)'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchQuery(tag)}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-semibold transition cursor-pointer text-[11px]"
              >
                {tag}
              </button>
            ))}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-gray-500 hover:text-gray-700 underline text-[11px] ml-1 cursor-pointer"
              >
                সব ফরম প্রদর্শন
              </button>
            )}
          </div>
        </div>

        {/* Notice Info Box */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-950 shadow-2xs">
          <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span>
            প্রয়োজনীয় ফরমটি সম্পূর্ণ বাংলায় <strong>ইউনিকোড (Unicode) PDF</strong> ফরম্যাটে ডাউনলোড করতে <strong>'PDF'</strong> বাটনে ক্লিক করুন, অথবা সরাসরি প্রিন্ট করতে <strong>'প্রিন্ট'</strong> বাটনে ক্লিক করুন। সম্পাদনার জন্য <strong>'.DOCX'</strong> ফাইলও নামাতে পারেন।
          </span>
        </div>

        {/* Forms Card Grid - Distinct Layout and Styling for each form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredForms.map((form) => {
            const kind = getFormKind(form.title, form.category);
            const theme = getFormTheme(kind);
            const isWord =
              form.fileType?.toUpperCase() === 'DOCX' ||
              form.fileType?.toUpperCase() === 'DOC' ||
              form.fileName?.endsWith('.docx');
            const isGeneratingThis = generatingPdfId === form.id;

            return (
              <div
                key={form.id}
                className="bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg flex flex-col justify-between group overflow-hidden"
                style={{ borderColor: theme.borderColor }}
              >
                {/* Top Distinct Themed Accent Bar */}
                <div
                  className="h-2 w-full"
                  style={{ backgroundColor: theme.primaryColor }}
                />

                <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category & Badge Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs"
                        style={{
                          backgroundColor: theme.badgeBg,
                          color: theme.badgeText,
                          borderColor: theme.borderColor,
                        }}
                      >
                        {theme.label || form.category}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                            isWord
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {isWord ? 'DOCX' : form.fileType || 'PDF'}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {form.fileSize || '২০০ KB'}
                        </span>
                      </div>
                    </div>

                    {/* Title & Icon */}
                    <div className="flex items-start gap-3 mt-1">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition group-hover:scale-105"
                        style={{
                          backgroundColor: theme.accentBg,
                          color: theme.primaryColor,
                          border: `1px solid ${theme.borderColor}`,
                        }}
                      >
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3
                          className="font-bold text-sm leading-snug transition group-hover:underline line-clamp-2"
                          style={{ color: '#0f172a' }}
                        >
                          {form.title}
                        </h3>
                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                          {form.description || 'বিদ্যালয়ের অফিসিয়াল প্রাতিষ্ঠানিক ফরম'}
                        </p>
                        {form.fileName && (
                          <div className="text-[10px] text-blue-600 font-mono mt-1 flex items-center gap-1 truncate">
                            <Paperclip className="w-3 h-3 shrink-0" />
                            <span className="truncate">{form.fileName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Date & Quick Meta */}
                  <div className="pt-2 text-[10.5px] text-gray-400 flex items-center justify-between border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>আপডেট: {form.updatedDate || '১৫ সেপ্টেম্বর ২০২৬'}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      অফিসিয়াল ফরম
                    </span>
                  </div>

                  {/* Action Buttons: 4 buttons equal size, 2x2 on mobile, single row on desktop, PDF in primary color */}
                  <div className="pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* 1. View / Preview Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewForm(form)}
                      className="inline-flex items-center justify-center gap-1.5 h-10 px-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                      title="ফরম প্রিভিউ ও বিবরণ দেখুন"
                    >
                      <Eye className="w-3.5 h-3.5 text-gray-600" />
                      <span>ভিউ</span>
                    </button>

                    {/* 2. Print Button */}
                    <button
                      type="button"
                      onClick={() => printForm(form, siteSettings)}
                      className="inline-flex items-center justify-center gap-1.5 h-10 px-2.5 rounded-xl text-xs font-bold text-[#064E3B] bg-white border border-[#0B7A55]/40 hover:bg-[#E8F5EE] transition cursor-pointer shadow-2xs"
                      title="সরাসরি A4 সাইজে প্রিন্ট করুন"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#0B7A55]" />
                      <span>প্রিন্ট</span>
                    </button>

                    {/* 3. Unicode PDF Download Button - Primary Color */}
                    <button
                      type="button"
                      disabled={isGeneratingThis}
                      onClick={() => handleDownloadPdf(form)}
                      className="inline-flex items-center justify-center gap-1.5 h-10 px-2.5 rounded-xl text-xs font-bold text-white bg-[#0B7A55] hover:bg-[#064E3B] transition cursor-pointer shadow-xs disabled:opacity-60"
                      title="সম্পূর্ণ বাংলায় ইউনিকোড PDF ফাইল ডাউনলোড করুন"
                    >
                      {isGeneratingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>{isGeneratingThis ? 'তৈরি...' : 'PDF'}</span>
                    </button>

                    {/* 4. Word (.DOCX) Download Button */}
                    <button
                      type="button"
                      onClick={() => downloadEditableForm(form, siteSettings)}
                      className="inline-flex items-center justify-center gap-1.5 h-10 px-2.5 rounded-xl text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition cursor-pointer shadow-2xs"
                      title="মাইক্রোসফট ওয়ার্ড (.docx) এডিটেবল ফাইল ডাউনলোড"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-700" />
                      <span>.DOCX</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
      </main>

      {/* Form Preview Modal with High-Fidelity Custom Render */}
      {previewForm && (() => {
        const previewKind = getFormKind(previewForm.title, previewForm.category);
        const previewTheme = getFormTheme(previewKind);
        const isGeneratingThisModal = generatingPdfId === previewForm.id;

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100">
              {/* Modal Header */}
              <div
                className="p-4 sm:p-5 text-white flex items-center justify-between gap-3 border-b"
                style={{ backgroundColor: previewTheme.primaryColor, borderColor: previewTheme.secondaryColor }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 flex-wrap">
                      <span>{previewForm.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                        {previewTheme.label || previewForm.category}
                      </span>
                    </h3>
                    <p className="text-[11px] text-white/80 mt-0.5">
                      অফিসিয়াল প্রাতিষ্ঠানিক ফরম প্রিভিউ • ইউনিকোড A4 ফরম্যাট • সাইজ: {previewForm.fileSize || '২০০ KB'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Quick Print Button */}
                  <button
                    type="button"
                    onClick={() => printForm(previewForm, siteSettings)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-purple-900 hover:bg-gray-100 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                    title="সরাসরি প্রিন্ট করুন (A4)"
                  >
                    <Printer className="w-4 h-4 text-purple-700" />
                    <span className="hidden sm:inline">প্রিন্ট</span>
                  </button>

                  {/* Quick Unicode PDF Download */}
                  <button
                    type="button"
                    disabled={isGeneratingThisModal}
                    onClick={() => handleDownloadPdf(previewForm)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
                    title="বাংলা ইউনিকোড PDF ডাউনলোড করুন"
                  >
                    {isGeneratingThisModal ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">
                      {isGeneratingThisModal ? 'তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}
                    </span>
                  </button>

                  {/* Close Modal Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewForm(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body: Realistic Paper View with the Specific HTML Design */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex flex-col items-center">
                {/* Uploaded File Banner if present */}
                {previewForm.fileUrl && (
                  <div className="w-full max-w-[794px] mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                        DOCX
                      </div>
                      <div>
                        <p className="font-bold text-blue-950">{previewForm.fileName || 'uploaded_form.docx'}</p>
                        <p className="text-[10px] text-blue-700">ডিভাইস থেকে আপলোডকৃত আসল ফাইল ({previewForm.fileSize || '২০০ KB'})</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadEditableForm(previewForm, siteSettings)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>আসল ফাইল ডাউনলোড</span>
                    </button>
                  </div>
                )}

                {/* Render the exact custom styled HTML of this specific form */}
                <div
                  className="bg-white rounded-xl shadow-lg border border-gray-300 w-full max-w-[794px] overflow-hidden"
                  dangerouslySetInnerHTML={{
                    __html: buildFormHtml(previewForm, siteSettings),
                  }}
                />
              </div>

              {/* Modal Bottom Footer Actions */}
              <div className="p-4 border-t border-gray-200 bg-white flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    ইউনিকোড বাংলা ফন্ট সাপোর্টেড • প্রিন্ট ও এডিটেবল ফরম্যাট প্রস্তুত
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Print Button */}
                  <button
                    type="button"
                    onClick={() => printForm(previewForm, siteSettings)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>প্রিন্ট করুন (A4)</span>
                  </button>

                  {/* Unicode PDF Download */}
                  <button
                    type="button"
                    disabled={isGeneratingThisModal}
                    onClick={() => handleDownloadPdf(previewForm)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    {isGeneratingThisModal ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>{isGeneratingThisModal ? 'পিডিএফ তৈরি হচ্ছে...' : 'PDF ডাউনলোড (Unicode)'}</span>
                  </button>

                  {/* Word .docx Download */}
                  <button
                    type="button"
                    onClick={() => downloadEditableForm(previewForm, siteSettings)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>ওয়ার্ড (.docx)</span>
                  </button>

                  {/* Close */}
                  <button
                    type="button"
                    onClick={() => setPreviewForm(null)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Institutional Website Footer */}
      <Footer />
    </div>
  );
};
