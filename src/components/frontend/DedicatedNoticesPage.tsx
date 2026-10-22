import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Notice } from '../../types';
import { DedicatedHeader } from './DedicatedHeader';
import { PageHero } from './PageHero';
import { SITE_CONFIG } from '../../config/siteConfig';
import { toBengaliDigits, formatBengaliDate, getBengaliDateParts } from '../../utils/bengaliFormatters';
import {
  Search,
  Pin,
  Calendar,
  Eye,
  Printer,
  Download,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { triggerFileDownload, openFileInNewTab } from '../../utils/fileDownloader';
import { printNotice, downloadNoticePdf } from '../../utils/noticePdfGenerator';
import { Footer } from './Footer';

export const DedicatedNoticesPage: React.FC = () => {
  const { siteSettings, setCurrentFrontendPage, notices } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('সব');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [viewLayout, setViewLayout] = useState<'list' | 'grid'>('list');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const categories = ['সব', 'জরুরি', 'সাধারণ', 'পরীক্ষা', 'ভর্তি', 'গুরুত্বপূর্ণ', 'ক্রীড়া', 'অনুষ্ঠান'];

  // Filter notices based on search & category with pinned notices on top
  const filteredNotices = useMemo(() => {
    const list = notices.filter((notice) => {
      const matchesCategory =
        selectedCategory === 'সব' || notice.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        notice.title.toLowerCase().includes(q) ||
        notice.content.toLowerCase().includes(q) ||
        (notice.code && notice.code.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });

    // Pinned notices always on top
    return list.slice().sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
  }, [notices, selectedCategory, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredNotices.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredNotices.length);
  const currentNotices = filteredNotices.slice(startIndex, endIndex);

  // Stats
  const urgentCount = notices.filter((n) => n.category === 'জরুরি').length;
  const pinnedCount = notices.filter((n) => n.pinned).length;

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (val: number) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'জরুরি':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
      case 'পরীক্ষা':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ভর্তি':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'গুরুত্বপূর্ণ':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'ক্রীড়া':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'অনুষ্ঠান':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handlePrintModal = () => {
    if (selectedNotice) {
      printNotice(selectedNotice, siteSettings);
    } else {
      window.print();
    }
  };

  const handleDownloadPdfModal = async () => {
    if (!selectedNotice) return;
    setIsExportingPdf(true);
    try {
      await downloadNoticePdf(selectedNotice, siteSettings);
    } catch (e) {
      console.error('PDF export failed:', e);
      printNotice(selectedNotice, siteSettings);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F5] text-[#14211B] flex flex-col font-sans subpage-fade-in">
      {/* Top Institutional Header */}
      <DedicatedHeader pageName="নোটিশ বোর্ড" />

      {/* Unified PageHero Banner */}
      <PageHero
        title="বিদ্যালয়ের সকল নোটিশ ও বিজ্ঞপ্তি"
        description="দাদরা উচ্চ বিদ্যালয়ের সাম্প্রতিক ও পূর্ববর্তী সকল নোটিশ, সার্কুলার, পরীক্ষার সময়সূচী ও জরুরি বার্তা একনজরে দেখুন।"
        badgeText="নোটিশ ও বিজ্ঞপ্তি আর্কাইভ"
        badgeIcon={<FileText className="w-3.5 h-3.5 text-emerald-300" />}
        breadcrumbs={[{ label: 'নোটিশ বোর্ড' }]}
        stats={
          <div className="flex items-center gap-2">
            <div className="bg-emerald-900/60 border border-emerald-600/40 rounded-xl px-3.5 py-1.5 text-center backdrop-blur-xs min-w-[70px]">
              <span className="block text-xl font-black text-white">
                {toBengaliDigits(notices.length)}
              </span>
              <span className="text-[10px] font-semibold text-emerald-200">মোট নোটিশ</span>
            </div>
            {urgentCount > 0 && (
              <div className="bg-rose-950/60 border border-rose-600/40 rounded-xl px-3.5 py-1.5 text-center backdrop-blur-xs min-w-[70px]">
                <span className="block text-xl font-black text-rose-300">
                  {toBengaliDigits(urgentCount)}
                </span>
                <span className="text-[10px] font-semibold text-rose-200">জরুরি</span>
              </div>
            )}
          </div>
        }
      />

      {/* Main Content Area - Overlapping Hero Banner with -mt-16 */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 space-y-6 -mt-16 relative z-20 pb-16">
        {/* Search, Filter and Items Per Page Control Bar - Sticky */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8E4] shadow-md space-y-3.5 print:hidden sticky top-20 z-30 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="নোটিশের শিরোনাম, বিষয়বস্তু বা কোড দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  aria-label="মুছুন"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Items Per Page Selector & Layout Switcher */}
            <div className="flex flex-wrap items-center gap-3 self-end lg:self-auto">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700">
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                <label htmlFor="itemsPerPageSelect" className="shrink-0">
                  প্রতি পেজে:
                </label>
                <select
                  id="itemsPerPageSelect"
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs font-bold text-gray-800 focus:outline-hidden focus:border-emerald-600 cursor-pointer"
                >
                  <option value={5}>৫ টি</option>
                  <option value={10}>১০ টি</option>
                  <option value={15}>১৫ টি</option>
                  <option value={20}>২০ টি</option>
                  <option value={50}>৫০ টি</option>
                </select>
              </div>

              {/* Layout Switcher */}
              <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setViewLayout('list')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer min-h-[36px] ${
                    viewLayout === 'list'
                      ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  তালিকা
                </button>
                <button
                  type="button"
                  onClick={() => setViewLayout('grid')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer min-h-[36px] ${
                    viewLayout === 'grid'
                      ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  কার্ড
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter Pills - Horizontally scrollable on mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> ক্যাটাগরি:
            </span>
            {categories.map((cat) => {
              const count =
                cat === 'সব'
                  ? notices.length
                  : notices.filter((n) => n.category === cat).length;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5 min-h-[36px] ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200/80 text-gray-700'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white text-gray-600'
                    }`}
                  >
                    {toBengaliDigits(count)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
          <span>
            মোট <strong className="text-gray-900 font-bold font-mono">{toBengaliDigits(filteredNotices.length)}</strong> টি নোটিশের মধ্যে{' '}
            <strong className="text-emerald-800 font-bold font-mono">
              {filteredNotices.length > 0 ? toBengaliDigits(startIndex + 1) : toBengaliDigits(0)} - {toBengaliDigits(endIndex)}
            </strong>{' '}
            দেখাচ্ছে
          </span>
          <span>
            পৃষ্ঠা <strong className="text-gray-900 font-bold font-mono">{toBengaliDigits(safeCurrentPage)}</strong> এর{' '}
            <strong className="text-gray-900 font-bold font-mono">{toBengaliDigits(totalPages)}</strong>
          </span>
        </div>

        {/* Notices Content */}
        {filteredNotices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center space-y-3 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">কোনো নোটিশ পাওয়া যায়নি</h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
              আপনার অনুসন্ধান বা নির্বাচিত ক্যাটাগরির সাথে মিলে এমন কোনো নোটিশ বর্তমানে নেই।
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('সব');
              }}
              className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer min-h-[44px]"
            >
              সকল নোটিশ পুনরায় দেখুন
            </button>
          </div>
        ) : viewLayout === 'list' ? (
          /* List View: Left Date Box, Center Title & 2-line Desc, Right Action Buttons */
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs divide-y divide-gray-100 overflow-hidden">
            {currentNotices.map((notice) => {
              const dateParts = getBengaliDateParts(notice.date);
              return (
                <div
                  key={notice.id}
                  onClick={() => setSelectedNotice(notice)}
                  className="p-4 sm:p-5 hover:bg-emerald-50/40 transition cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
                    {/* Left Date Block - Completely in Bengali */}
                    <div className="w-13 h-13 rounded-xl bg-emerald-50 border border-emerald-200/80 flex flex-col items-center justify-center shrink-0 group-hover:bg-emerald-700 transition duration-200 text-center p-1">
                      <span className="text-base sm:text-lg font-black text-emerald-950 group-hover:text-white leading-none font-mono">
                        {dateParts.dayBangla || '০১'}
                      </span>
                      <span className="text-[10px] text-emerald-800 group-hover:text-emerald-100 font-bold truncate mt-0.5 max-w-full">
                        {dateParts.monthBangla || 'অক্টোবর'}
                      </span>
                    </div>

                    {/* Center Details: Tags, Title, max 2-line Description */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(
                            notice.category
                          )}`}
                        >
                          {notice.category}
                        </span>

                        {notice.pinned && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-md">
                            <Pin className="w-2.5 h-2.5 fill-amber-500 text-amber-600" />
                            <span>পিন করা</span>
                          </span>
                        )}

                        {notice.attachmentUrl && (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              notice.attachmentType === 'pdf'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {notice.attachmentType === 'pdf' ? (
                              <>
                                <FileText className="w-2.5 h-2.5" />
                                <span>PDF</span>
                              </>
                            ) : (
                              <>
                                <ImageIcon className="w-2.5 h-2.5" />
                                <span>ছবি</span>
                              </>
                            )}
                          </span>
                        )}

                        {notice.code && (
                          <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            স্মারক: {toBengaliDigits(notice.code)}
                          </span>
                        )}

                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatBengaliDate(notice.date)}</span>
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-emerald-800 transition line-clamp-1">
                        {notice.title}
                      </h3>

                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {notice.content}
                      </p>
                    </div>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        printNotice(notice, siteSettings);
                      }}
                      className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-emerald-800 transition cursor-pointer border border-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="প্রিন্ট করুন"
                      aria-label="প্রিন্ট করুন"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      disabled={downloadingId === notice.id}
                      onClick={async (e) => {
                        e.stopPropagation();
                        setDownloadingId(notice.id);
                        try {
                          await downloadNoticePdf(notice, siteSettings);
                        } finally {
                          setDownloadingId(null);
                        }
                      }}
                      className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition cursor-pointer border border-emerald-200 disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="PDF ডাউনলোড"
                      aria-label="PDF ডাউনলোড"
                    >
                      {downloadingId === notice.id ? (
                        <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin inline-block" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedNotice(notice)}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-700 group-hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs min-h-[44px]"
                    >
                      <span>বিস্তারিত</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {currentNotices.map((notice) => (
              <div
                key={notice.id}
                onClick={() => setSelectedNotice(notice)}
                className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(
                        notice.category
                      )}`}
                    >
                      {notice.category}
                    </span>

                    {notice.pinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-md">
                        <Pin className="w-2.5 h-2.5 fill-amber-500 text-amber-600" />
                        <span>পিন করা</span>
                      </span>
                    )}

                    {notice.attachmentUrl && (
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          notice.attachmentType === 'pdf'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {notice.attachmentType === 'pdf' ? (
                          <>
                            <FileText className="w-2.5 h-2.5" />
                            <span>PDF</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-2.5 h-2.5" />
                            <span>ছবি</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-800 transition line-clamp-2">
                    {notice.title}
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {notice.content}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-500 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{formatBengaliDate(notice.date)}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        printNotice(notice, siteSettings);
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-emerald-800 transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="প্রিন্ট করুন"
                      aria-label="প্রিন্ট করুন"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={downloadingId === notice.id}
                      onClick={async (e) => {
                        e.stopPropagation();
                        setDownloadingId(notice.id);
                        try {
                          await downloadNoticePdf(notice, siteSettings);
                        } finally {
                          setDownloadingId(null);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700 transition cursor-pointer disabled:opacity-50 min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="PDF ডাউনলোড"
                      aria-label="PDF ডাউনলোড"
                    >
                      {downloadingId === notice.id ? (
                        <span className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin inline-block" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 group-hover:text-emerald-900 ml-1 text-xs">
                      <span>পড়ুন</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Big Tap-Friendly Pagination Bar */}
        {totalPages > 1 && (
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-600 font-medium">
              পৃষ্ঠা <strong className="font-bold text-gray-900 font-mono">{toBengaliDigits(safeCurrentPage)}</strong> এর{' '}
              <strong className="font-bold text-gray-900 font-mono">{toBengaliDigits(totalPages)}</strong> (মোট {toBengaliDigits(filteredNotices.length)} টি নোটিশ)
            </div>

            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {/* Prev Button */}
              <button
                disabled={safeCurrentPage <= 1}
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 200, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold border border-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>পূর্ববর্তী</span>
              </button>

              {/* Page Number Buttons - Minimum 44px tap targets */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= safeCurrentPage - 2 && pageNum <= safeCurrentPage + 2)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 200, behavior: 'smooth' });
                      }}
                      className={`min-w-[44px] h-11 rounded-xl text-xs font-bold font-mono transition cursor-pointer px-2 flex items-center justify-center ${
                        pageNum === safeCurrentPage
                          ? 'bg-emerald-700 text-white shadow-xs font-extrabold'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {toBengaliDigits(pageNum)}
                    </button>
                  );
                } else if (
                  pageNum === safeCurrentPage - 3 ||
                  pageNum === safeCurrentPage + 3
                ) {
                  return (
                    <span key={pageNum} className="text-gray-400 text-xs px-1">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              {/* Next Button */}
              <button
                disabled={safeCurrentPage >= totalPages}
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 200, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold border border-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
              >
                <span>পরবর্তী</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Notice Detail & Print Modal */}
      {selectedNotice && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
          onClick={() => setSelectedNotice(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 max-h-[92vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Actions */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${getCategoryBadgeClass(
                    selectedNotice.category
                  )}`}
                >
                  {selectedNotice.category}
                </span>
                {selectedNotice.pinned && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full">
                    <Pin className="w-3 h-3 fill-amber-500" />
                    <span>পিন করা নোটিশ</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition cursor-pointer min-h-[36px]"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">প্রিন্ট</span>
                </button>

                <button
                  type="button"
                  disabled={isExportingPdf}
                  onClick={handleDownloadPdfModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 min-h-[36px]"
                >
                  {isExportingPdf ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedNotice(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Notice Letterhead */}
            <div className="text-center space-y-1.5 border-b border-gray-100 pb-4">
              <div className="flex items-center justify-center gap-2.5">
                <img
                  src={siteSettings.logoUrl || '/assets/aistudio/Logo_a3f5277a.png'}
                  alt="Logo"
                  className="w-10 h-10 rounded-full object-cover border-[2.5px] border-[#F59E0B] bg-[#00A859] shadow-xs"
                  loading="lazy"
                />
                <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
                  {siteSettings.schoolNameBangla || SITE_CONFIG.schoolNameBangla}
                </h2>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {SITE_CONFIG.address} • স্থাপিত: {SITE_CONFIG.establishedYear}
              </p>
              <div className="inline-block bg-emerald-100 text-emerald-900 font-bold text-[11px] px-3.5 py-0.5 rounded-full mt-1">
                অফিসিয়াল বিজ্ঞপ্তি / নোটিশ
              </div>
            </div>

            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-600">স্মারক নং:</span>
                <span className="font-mono text-gray-800">
                  {selectedNotice.code ? toBengaliDigits(selectedNotice.code) : 'DHS/২০২৬/বিজ্ঞপ্তি'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-600">তারিখ:</span>
                <span className="text-gray-800 font-medium">
                  {formatBengaliDate(selectedNotice.date)}
                </span>
              </div>
            </div>

            {/* Notice Title & Content */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-black text-gray-900 leading-snug">
                {selectedNotice.title}
              </h3>

              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line font-sans">
                {selectedNotice.content}
              </div>
            </div>

            {/* Attachment preview if any */}
            {selectedNotice.attachmentUrl && (
              <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <span>সংযুক্ত ফাইল ({selectedNotice.attachmentType?.toUpperCase() || 'FILE'})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      triggerFileDownload(
                        selectedNotice.attachmentUrl!,
                        `Notice-${selectedNotice.code || 'Attachment'}`
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ডাউনলোড করুন</span>
                  </button>
                </div>

                {selectedNotice.attachmentType === 'image' && (
                  <div className="max-h-80 overflow-hidden rounded-xl border border-emerald-200/80 bg-white flex items-center justify-center">
                    <img
                      src={selectedNotice.attachmentUrl}
                      alt="Notice Attachment"
                      className="max-h-80 w-auto object-contain cursor-pointer"
                      onClick={() => openFileInNewTab(selectedNotice.attachmentUrl!)}
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Notice Footer Authority Signature */}
            <div className="pt-6 border-t border-gray-200 flex justify-end">
              <div className="text-center space-y-1">
                <div className="w-32 border-b border-gray-400 mx-auto" />
                <p className="text-xs font-bold text-gray-900">প্রধান শিক্ষক</p>
                <p className="text-[11px] text-gray-500">{SITE_CONFIG.schoolNameBangla}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Website Footer */}
      <Footer />
    </div>
  );
};
