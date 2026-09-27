import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { DownloadableForm } from '../../types';
import {
  FileText,
  Download,
  Search,
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
      await downloadFormPdf(form, siteSettings);
    } finally {
      setGeneratingPdfId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 pb-16 font-sans">
      {/* Top Institutional Notification Bar (Result Page-style Header) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Logo & School Branding */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setCurrentFrontendPage('home')}>
            {siteSettings.logoUrl ? (
              <img
                src={siteSettings.logoUrl}
                alt={siteSettings.schoolNameBangla}
                className="w-11 h-11 rounded-2xl object-cover border border-emerald-600/30 shadow-xs"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-amber-300 font-extrabold text-xl shadow-md border border-emerald-600/30">
                {siteSettings.schoolNameBangla?.charAt(0) || 'দ'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                  {siteSettings.schoolNameBangla}
                </h1>
                <span className="hidden sm:inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  EIIN: {siteSettings.eiin || '১২৩৪৫৬'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                {siteSettings.schoolNameEnglish} • গুরুত্বপূর্ণ প্রাতিষ্ঠানিক ফরম ও ডাউনলোড পোর্টাল
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentFrontendPage('home')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>মূল ওয়েবসাইটে ফিরুন</span>
            </button>
          </div>
        </div>
      </header>

      {/* Top Hero Banner */}
      <section className="bg-gradient-to-r from-[#052e20] via-[#0b4833] to-[#04281b] text-white py-10 px-4 sm:px-8 border-b border-emerald-900/50 shadow-md print:hidden">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-xs text-emerald-200/90 mb-3 font-medium">
              <button
                onClick={() => setCurrentFrontendPage('home')}
                className="hover:text-white transition cursor-pointer"
              >
                মূল ওয়েবসাইট
              </button>
              <span>/</span>
              <span className="text-emerald-100">ডাউনলোড পোর্টাল</span>
              <span>/</span>
              <span className="text-white font-bold">প্রাতিষ্ঠানিক ফরমসমূহ</span>
            </nav>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-amber-300 shadow-inner">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  গুরুত্বপূর্ণ প্রাতিষ্ঠানিক ফরমসমূহ (Forms & Downloads)
                </h1>
                <p className="text-xs text-emerald-200 mt-0.5">
                  ভর্তি, ছুটি, প্রশংসাপত্র, টিসি ও অন্যান্য ফরম প্রিভিউ, ইউনিকোড PDF ডাউনলোড ও সরাসরি প্রিন্ট করুন
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
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
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

                  {/* Action Buttons Grid */}
                  <div className="pt-3 border-t border-gray-100 grid grid-cols-4 gap-1.5">
                    {/* 1. View / Preview Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewForm(form)}
                      className="inline-flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                      title="ফরম প্রিভিউ ও বিবরণ দেখুন"
                    >
                      <Eye className="w-3.5 h-3.5 text-gray-600" />
                      <span>ভিউ</span>
                    </button>

                    {/* 2. Print Button */}
                    <button
                      type="button"
                      onClick={() => printForm(form, siteSettings)}
                      className="inline-flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition cursor-pointer shadow-2xs"
                      title="সরাসরি A4 সাইজে প্রিন্ট করুন"
                    >
                      <Printer className="w-3.5 h-3.5 text-purple-700" />
                      <span>প্রিন্ট</span>
                    </button>

                    {/* 3. Unicode PDF Download Button */}
                    <button
                      type="button"
                      disabled={isGeneratingThis}
                      onClick={() => handleDownloadPdf(form)}
                      className="inline-flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition cursor-pointer shadow-xs disabled:opacity-60"
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
                      className="inline-flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition cursor-pointer shadow-2xs"
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
      </div>

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

      {/* Institutional Footer */}
      <footer className="bg-[#052e22] text-emerald-100/90 py-8 border-t border-emerald-900/60 print:hidden text-xs mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-bold text-white block text-sm mb-1">{siteSettings.schoolNameBangla}</span>
            <p className="text-[11px] text-emerald-200/70">
              {siteSettings.address || 'দাদরা, জয়পুরহাট সদর, রাজশাহী'} • ফোন: {siteSettings.phone1} • ইমেইল: {siteSettings.email}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <button onClick={() => setCurrentFrontendPage('home')} className="hover:text-white transition cursor-pointer">
              হোম পেজ
            </button>
            <span>•</span>
            <span className="text-emerald-300">মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, রাজশাহী</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
