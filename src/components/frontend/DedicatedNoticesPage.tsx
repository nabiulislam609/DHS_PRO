import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Notice } from '../../types';
import {
  ArrowLeft,
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
} from 'lucide-react';
import { triggerFileDownload, openFileInNewTab } from '../../utils/fileDownloader';
import { printNotice, downloadNoticePdf } from '../../utils/noticePdfGenerator';

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

  const handleGoHome = () => {
    setCurrentFrontendPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = ['সব', 'জরুরি', 'সাধারণ', 'পরীক্ষা', 'ভর্তি', 'গুরুত্বপূর্ণ', 'ক্রীড়া', 'অনুষ্ঠান'];

  // Filter notices based on search & category
  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
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
  }, [notices, selectedCategory, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredNotices.length / itemsPerPage));
  
  // Ensure current page is valid
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
        return 'bg-rose-50 text-rose-700 border-rose-200';
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
    <div className="min-h-screen bg-[#fafaf9] flex flex-col font-sans">
      {/* Top Institutional Notification Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Logo & School Branding */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={handleGoHome}>
            {siteSettings.logoUrl ? (
              <img
                src={siteSettings.logoUrl}
                alt="Logo"
                className="w-11 h-11 rounded-2xl object-cover border-2 border-emerald-700 shadow-md bg-white p-0.5"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-amber-300 font-extrabold text-xl shadow-md border border-emerald-600/30">
                দ
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                  {siteSettings.schoolNameBangla}
                </h1>
                <span className="hidden sm:inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  EIIN: ১২৩৪৫৬
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                {siteSettings.schoolNameEnglish} • সকল নোটিশ ও অফিসিয়াল বিজ্ঞপ্তি আর্কাইভ
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoHome}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#15803d] hover:bg-[#166534] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>মূল ওয়েবসাইটে ফিরুন</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Breadcrumb */}
      <section className="bg-gradient-to-b from-white to-[#f4f7f5] border-b border-gray-200/80 py-8 px-4 sm:px-8 print:hidden">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4 font-medium">
            <button
              onClick={handleGoHome}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              হোম
            </button>
            <span>/</span>
            <span>নোটিশ বোর্ড</span>
            <span>/</span>
            <span className="text-emerald-800 font-bold">সকল নোটিশ</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-100/80 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-2.5 border border-emerald-200">
                <FileText className="w-3.5 h-3.5" />
                <span>নোটিশ ও বিজ্ঞপ্তি আর্কাইভ</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                বিদ্যালয়ের সকল নোটিশ ও বিজ্ঞপ্তি
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
                দাদরা উচ্চ বিদ্যালয়ের সাম্প্রতিক ও পূর্ববর্তী সকল নোটিশ, সার্কুলার, পরীক্ষার সময়সূচী ও জরুরি বার্তা একনজরে দেখুন।
              </p>
            </div>

            {/* Quick Stat Badges */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white border border-gray-200/90 rounded-xl px-4 py-2.5 shadow-2xs text-center min-w-[90px]">
                <span className="block text-xl font-black text-emerald-800">
                  {notices.length}
                </span>
                <span className="text-[11px] font-semibold text-gray-500">মোট নোটিশ</span>
              </div>

              <div className="bg-white border border-rose-200 rounded-xl px-4 py-2.5 shadow-2xs text-center min-w-[90px]">
                <span className="block text-xl font-black text-rose-600">
                  {urgentCount}
                </span>
                <span className="text-[11px] font-semibold text-rose-600">জরুরি নোটিশ</span>
              </div>

              <div className="bg-white border border-amber-200 rounded-xl px-4 py-2.5 shadow-2xs text-center min-w-[90px]">
                <span className="block text-xl font-black text-amber-600">
                  {pinnedCount}
                </span>
                <span className="text-[11px] font-semibold text-amber-700">পিন করা নোটিশ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 space-y-6">
        {/* Search, Filter and Items Per Page Control Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Items Per Page Selector (Requested by User) & View Toggle */}
            <div className="flex flex-wrap items-center gap-3 self-end lg:self-auto">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700">
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                <label htmlFor="itemsPerPageSelect" className="shrink-0">
                  প্রতি পেজে নোটিশ:
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
                  onClick={() => setViewLayout('list')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    viewLayout === 'list'
                      ? 'bg-white text-emerald-800 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  তালিকা (List)
                </button>
                <button
                  onClick={() => setViewLayout('grid')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    viewLayout === 'grid'
                      ? 'bg-white text-emerald-800 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  কার্ড (Grid)
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-thin">
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
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#15803d] text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200/80 text-gray-700'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white text-gray-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
          <span>
            মোট <strong className="text-gray-900 font-bold">{filteredNotices.length}</strong> টি নোটিশের মধ্যে{' '}
            <strong className="text-emerald-800 font-bold">
              {filteredNotices.length > 0 ? startIndex + 1 : 0} - {endIndex}
            </strong>{' '}
            দেখাচ্ছে
          </span>
          <span>
            পৃষ্ঠা <strong className="text-gray-900 font-bold">{safeCurrentPage}</strong> এর{' '}
            <strong className="text-gray-900 font-bold">{totalPages}</strong>
          </span>
        </div>

        {/* Notices Content */}
        {filteredNotices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-800">কোনো নোটিশ পাওয়া যায়নি</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              আপনার অনুসন্ধান বা নির্বাচিত ক্যাটাগরির সাথে মিলে এমন কোনো নোটিশ বর্তমানে নেই।
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('সব');
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline pt-2"
            >
              সকল নোটিশ পুনরায় দেখুন
            </button>
          </div>
        ) : viewLayout === 'list' ? (
          /* List View */
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs divide-y divide-gray-100 overflow-hidden">
            {currentNotices.map((notice) => (
              <div
                key={notice.id}
                onClick={() => setSelectedNotice(notice)}
                className="p-4 sm:p-5 hover:bg-emerald-50/40 transition cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  {/* Date Badge */}
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center shrink-0 group-hover:bg-[#15803d] transition">
                    <span className="text-sm font-bold text-emerald-900 group-hover:text-white leading-none">
                      {notice.date.split(' ')[0] || '০১'}
                    </span>
                    <span className="text-[10px] text-emerald-700 group-hover:text-emerald-100 uppercase mt-0.5 font-bold">
                      {notice.date.split(' ')[1] || 'SEP'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(
                          notice.category
                        )}`}
                      >
                        {notice.category}
                      </span>

                      {notice.pinned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          <Pin className="w-2.5 h-2.5 fill-amber-500" />
                          <span>পিন্ড</span>
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
                              <span>PDF ফাইল</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-2.5 h-2.5" />
                              <span>ছবি সংযুক্ত</span>
                            </>
                          )}
                        </span>
                      )}

                      {notice.code && (
                        <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          স্মারক: {notice.code}
                        </span>
                      )}

                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{notice.date}</span>
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-emerald-800 transition">
                      {notice.title}
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {notice.content}
                    </p>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="shrink-0 flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNotice(notice);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-[#15803d] text-emerald-800 hover:text-white font-semibold text-xs transition cursor-pointer border border-emerald-200"
                    title="বিস্তারিত দেখুন"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>বিস্তারিত</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      printNotice(notice, siteSettings);
                    }}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-emerald-800 transition cursor-pointer"
                    title="প্রিন্ট করুন"
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
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-rose-50 text-gray-600 hover:text-rose-700 transition cursor-pointer disabled:opacity-50"
                    title="PDF ডাউনলোড করুন"
                  >
                    {downloadingId === notice.id ? (
                      <span className="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin inline-block" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentNotices.map((notice) => (
              <div
                key={notice.id}
                onClick={() => setSelectedNotice(notice)}
                className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between p-5 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(
                        notice.category
                      )}`}
                    >
                      {notice.category}
                    </span>

                    {notice.pinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        <Pin className="w-2.5 h-2.5 fill-amber-500" />
                        <span>পিন্ড</span>
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

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-400 text-[11px]">
                    <Calendar className="w-3 h-3" />
                    <span>{notice.date}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        printNotice(notice, siteSettings);
                      }}
                      className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-emerald-800 transition cursor-pointer"
                      title="প্রিন্ট করুন"
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
                      className="p-1 rounded-md hover:bg-rose-50 text-gray-500 hover:text-rose-700 transition cursor-pointer disabled:opacity-50"
                      title="PDF ডাউনলোড"
                    >
                      {downloadingId === notice.id ? (
                        <span className="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin inline-block" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 group-hover:text-emerald-900 ml-1">
                      <span>পড়ুন</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-600 font-medium">
              পৃষ্ঠা <strong className="font-bold text-gray-900">{safeCurrentPage}</strong> এর{' '}
              <strong className="font-bold text-gray-900">{totalPages}</strong> (মোট {filteredNotices.length} টি নোটিশ)
            </div>

            <div className="flex items-center gap-1.5">
              {/* Prev Button */}
              <button
                disabled={safeCurrentPage <= 1}
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold border border-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>পূর্ববর্তী</span>
              </button>

              {/* Page Number Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                // Show max 5 page buttons around current
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
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                        pageNum === safeCurrentPage
                          ? 'bg-[#15803d] text-white shadow-xs'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {pageNum}
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
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold border border-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>পরবর্তী</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Official Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div
            id="printable-notice-modal"
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 my-8"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedNotice(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Header */}
            <div className="text-center pb-4 border-b-2 border-emerald-800/20 mb-6 space-y-1">
              <div className="flex items-center justify-center gap-2">
                {siteSettings.logoUrl ? (
                  <img
                    src={siteSettings.logoUrl}
                    alt="Logo"
                    className="w-10 h-10 object-contain"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-base">
                    দ
                  </div>
                )}
                <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
                  {siteSettings.schoolNameBangla}
                </h2>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                দাদরা, জয়পুরহাট সদর, জয়পুরহাট • স্থাপিত: ১৯৮২ • EIIN: ১২৩৪৫৬
              </p>
              <div className="inline-block bg-emerald-100 text-emerald-900 font-bold text-[11px] px-3 py-0.5 rounded-full mt-1">
                বিজ্ঞপ্তি / নোটিশ
              </div>
            </div>

            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200 mb-6">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-600">স্মারক নং:</span>
                <span className="font-mono text-gray-800">
                  {selectedNotice.code || 'DHS/২০২৬/বিজ্ঞপ্তি'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-600">তারিখ:</span>
                <span className="text-gray-800 font-medium">{selectedNotice.date}</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${getCategoryBadgeClass(
                    selectedNotice.category
                  )}`}
                >
                  {selectedNotice.category}
                </span>
                {selectedNotice.pinned && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    📌 পিন্ড
                  </span>
                )}
              </div>
            </div>

            {/* Notice Title */}
            <div className="space-y-4 mb-8">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug border-l-4 border-emerald-700 pl-3">
                বিষয়: {selectedNotice.title}
              </h3>

              {/* Full Content */}
              <div className="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-3 whitespace-pre-line bg-[#fcfaf7] p-5 rounded-xl border border-gray-200/70">
                {selectedNotice.content}
              </div>

              {/* Notice Photo / PDF Attachment */}
              {selectedNotice.attachmentUrl && (
                <div className="space-y-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                      {selectedNotice.attachmentType === 'pdf' ? (
                        <>
                          <FileText className="w-4 h-4 text-rose-600" />
                          <span>সংযুক্ত অফিসিয়াল পিডিএফ কপি:</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4 text-emerald-600" />
                          <span>সংযুক্ত অফিসিয়াল নোটিশের ছবি:</span>
                        </>
                      )}
                    </span>
                    {selectedNotice.attachmentSize && (
                      <span className="text-[10px] text-gray-400 font-mono">
                        ফাইলের আকার: {selectedNotice.attachmentSize}
                      </span>
                    )}
                  </div>

                  {selectedNotice.attachmentType === 'image' ? (
                    <div className="space-y-2">
                      <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-2">
                        <img
                          src={selectedNotice.attachmentUrl}
                          alt={selectedNotice.attachmentName || selectedNotice.title}
                          className="max-h-96 w-auto object-contain rounded-lg"
                        />
                      </div>
                      <div className="flex justify-end gap-2 print:hidden">
                        <button
                          type="button"
                          onClick={() => openFileInNewTab(selectedNotice.attachmentUrl!)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition cursor-pointer border border-emerald-200"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>নতুন ট্যাবে দেখুন</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            triggerFileDownload(
                              selectedNotice.attachmentUrl!,
                              selectedNotice.attachmentName || 'notice-photo.jpg'
                            )
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>ছবি ডাউনলোড</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-rose-100 border border-rose-200 flex flex-col items-center justify-center text-rose-700 shrink-0">
                          <FileText className="w-6 h-6" />
                          <span className="text-[9px] font-black uppercase">PDF</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                            {selectedNotice.attachmentName || 'অফিসিয়াল বিজ্ঞপ্তি ডকুমেন্ট.pdf'}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            মুদ্রণযোগ্য ও সত্যায়িত পিডিএফ অনুলিপি
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0 print:hidden">
                        <button
                          type="button"
                          onClick={() => openFileInNewTab(selectedNotice.attachmentUrl!)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>পিডিএফ দেখুন</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            triggerFileDownload(
                              selectedNotice.attachmentUrl!,
                              selectedNotice.attachmentName || 'notice-document.pdf'
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>ডাউনলোড</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Signature Block */}
            <div className="flex justify-end pt-4 border-t border-gray-200 mb-6">
              <div className="text-center space-y-1">
                <div className="w-28 h-8 border-b border-gray-400 mx-auto flex items-end justify-center font-script text-xs text-gray-500 italic">
                  স্বাক্ষরিত
                </div>
                <p className="text-xs font-bold text-gray-900">প্রধান শিক্ষক</p>
                <p className="text-[11px] text-gray-500">{siteSettings.schoolNameBangla}</p>
              </div>
            </div>

            {/* Footer Buttons (Hidden during Print) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100 print:hidden text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#15803d] hover:bg-[#166534] text-white rounded-xl font-bold transition cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>প্রিন্ট করুন</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdfModal}
                  disabled={isExportingPdf}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExportingPdf ? 'PDF তৈরি হচ্ছে...' : 'পিডিএফ ডাউনলোড'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Footer */}
      <footer className="bg-[#052e22] text-emerald-100/90 py-8 border-t border-emerald-900/60 print:hidden text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-bold text-white block text-sm mb-1">{siteSettings.schoolNameBangla}</span>
            <p className="text-[11px] text-emerald-200/70">
              {siteSettings.address} • ফোন: {siteSettings.phone1} • ইমেইল: {siteSettings.email}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <button onClick={handleGoHome} className="hover:text-white transition cursor-pointer">
              হোম পেজ
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setCurrentFrontendPage('results');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-white transition cursor-pointer text-amber-300"
            >
              ফলাফল পোর্টাল
            </button>
            <span>•</span>
            <span className="text-emerald-300">মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, রাজশাহী</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
