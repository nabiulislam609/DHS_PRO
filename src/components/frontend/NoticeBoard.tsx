import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Pin,
  Calendar,
  Tag,
  ArrowRight,
  Eye,
  X,
  FileText,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Printer,
} from 'lucide-react';
import { Notice } from '../../types';
import { triggerFileDownload, openFileInNewTab } from '../../utils/fileDownloader';
import { printNotice, downloadNoticePdf } from '../../utils/noticePdfGenerator';

export const NoticeBoard: React.FC = () => {
  const { notices, siteSettings, setCurrentFrontendPage } = useSchool();
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const pinnedNotice = notices.find((n) => n.pinned) || notices[0];
  const regularNotices = notices;

  const parseDate = (dateStr: string) => {
    // Expected format like "22 Sep 2026" or "2026-09-22"
    const parts = dateStr.split(' ');
    if (parts.length >= 2) {
      return { day: parts[0], month: parts[1] };
    }
    return { day: '০১', month: 'নোটিশ' };
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'জরুরি':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'ভর্তি':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'পরীক্ষা':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ক্রীড়া':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'অনুষ্ঠান':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <section id="notices" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-10">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full">
          নোটিশ বোর্ড
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          সর্বশেষ নোটিশ
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          বিদ্যালয়ের সকল গুরুত্বপূর্ণ নোটিশ ও বিজ্ঞপ্তির একনজরে
        </p>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Pinned Notice Card (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
            {/* Dark green header bar */}
            <div className="bg-[#0f5338] text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Pin className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>পিন করা নোটিশ</span>
              </div>
              <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {pinnedNotice?.category || 'জরুরি'}
              </span>
            </div>

            {/* Pinned Card Content */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{pinnedNotice?.date}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>গুরুত্বপূর্ণ</span>
                  </span>
                  {pinnedNotice?.attachmentUrl && (
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                        pinnedNotice.attachmentType === 'pdf'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {pinnedNotice.attachmentType === 'pdf' ? (
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

                <h3 className="text-lg font-bold text-gray-900 mb-3 hover:text-emerald-700 transition">
                  {pinnedNotice?.code ? `${pinnedNotice.code} ` : ''}{pinnedNotice?.title}
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                  {pinnedNotice?.content}
                </p>
              </div>

              <div className="pt-6 border-t border-gray-100 mt-6 flex items-center gap-2">
                <button
                  onClick={() => setSelectedNotice(pinnedNotice)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer shadow-xs"
                >
                  <Eye className="w-4 h-4" />
                  <span>বিস্তারিত পড়ুন</span>
                </button>
                <button
                  onClick={() => printNotice(pinnedNotice, siteSettings)}
                  title="নোটিশ প্রিন্ট করুন"
                  className="p-2.5 rounded-xl border border-gray-200 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 transition cursor-pointer shadow-2xs"
                >
                  <Printer className="w-4 h-4 text-emerald-700" />
                </button>
                <button
                  disabled={downloadingId === pinnedNotice.id}
                  onClick={async () => {
                    setDownloadingId(pinnedNotice.id);
                    try {
                      await downloadNoticePdf(pinnedNotice, siteSettings);
                    } finally {
                      setDownloadingId(null);
                    }
                  }}
                  title="PDF ডাউনলোড করুন"
                  className="p-2.5 rounded-xl border border-gray-200 hover:bg-rose-50 text-gray-700 hover:text-rose-700 transition cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  {downloadingId === pinnedNotice.id ? (
                    <span className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin inline-block" />
                  ) : (
                    <Download className="w-4 h-4 text-rose-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Notices List (8 cols) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-base">সাম্প্রতিক নোটিশ</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                (মোট: {regularNotices.length} টি)
              </span>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-100">
              {regularNotices.slice(0, 5).map((item) => {
                const { day, month } = parseDate(item.date);
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedNotice(item)}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/80 px-2 rounded-lg transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Date Badge */}
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                        <span className="text-sm font-bold text-emerald-900 group-hover:text-white leading-none">
                          {day}
                        </span>
                        <span className="text-[10px] text-emerald-700 group-hover:text-emerald-100 uppercase mt-0.5">
                          {month}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getCategoryColor(
                              item.category
                            )}`}
                          >
                            {item.category}
                          </span>
                          {item.pinned && (
                            <span className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                              <Pin className="w-2.5 h-2.5 fill-amber-500" />
                              পিন্ড
                            </span>
                          )}
                          {item.attachmentUrl && (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                item.attachmentType === 'pdf'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {item.attachmentType === 'pdf' ? (
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
                        <h4 className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 transition truncate">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {item.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNotice(item);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-[#15803d] text-emerald-800 hover:text-white text-xs font-semibold transition cursor-pointer border border-emerald-200"
                        title="বিস্তারিত দেখুন"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">ভিউ</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          printNotice(item, siteSettings);
                        }}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-emerald-800 transition cursor-pointer"
                        title="প্রিন্ট করুন"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={downloadingId === item.id}
                        onClick={async (e) => {
                          e.stopPropagation();
                          setDownloadingId(item.id);
                          try {
                            await downloadNoticePdf(item, siteSettings);
                          } finally {
                            setDownloadingId(null);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-rose-50 text-gray-600 hover:text-rose-700 transition cursor-pointer disabled:opacity-50"
                        title="PDF ডাউনলোড করুন"
                      >
                        {downloadingId === item.id ? (
                          <span className="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin inline-block" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition hidden sm:inline" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom View All Button */}
            <div className="text-center pt-4 mt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setCurrentFrontendPage('notices');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl border border-emerald-600/30 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 transition cursor-pointer shadow-2xs group"
              >
                <span>সব নোটিশ দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-700 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedNotice(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <Calendar className="w-4 h-4" />
              <span>{selectedNotice.date}</span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getCategoryColor(selectedNotice.category)}`}>
                {selectedNotice.category}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-3">
              {selectedNotice.code ? `${selectedNotice.code}: ` : ''}{selectedNotice.title}
            </h3>

            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-100">
              {selectedNotice.content}
            </div>

            {/* Notice Attachment Block */}
            {selectedNotice.attachmentUrl && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                {selectedNotice.attachmentType === 'image' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        <span>সংযুক্ত ছবি:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          triggerFileDownload(
                            selectedNotice.attachmentUrl!,
                            selectedNotice.attachmentName || 'notice-photo.jpg'
                          )
                        }
                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer text-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>ডাউনলোড</span>
                      </button>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-h-72 flex items-center justify-center">
                      <img
                        src={selectedNotice.attachmentUrl}
                        alt={selectedNotice.attachmentName || selectedNotice.title}
                        className="max-h-72 w-full object-contain cursor-pointer hover:opacity-95 transition"
                        onClick={() => openFileInNewTab(selectedNotice.attachmentUrl!)}
                        title="নতুন ট্যাবে দেখতে ক্লিক করুন"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="font-bold flex items-center gap-1.5 text-xs text-rose-800">
                      <FileText className="w-4 h-4 text-rose-600" />
                      <span>সংযুক্ত অফিসিয়াল পিডিএফ:</span>
                    </span>

                    <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-9 h-9 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">
                            {selectedNotice.attachmentName || 'অফিসিয়াল নোটিশ ডকুমেন্ট.pdf'}
                          </p>
                          {selectedNotice.attachmentSize && (
                            <p className="text-[10px] text-gray-500 font-mono">
                              ফাইলের আকার: {selectedNotice.attachmentSize}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => openFileInNewTab(selectedNotice.attachmentUrl!)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
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
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>ডাউনলোড</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => printNotice(selectedNotice, siteSettings)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#15803d] hover:bg-[#166534] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>প্রিন্ট করুন</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setIsExportingPdf(true);
                    try {
                      await downloadNoticePdf(selectedNotice, siteSettings);
                    } finally {
                      setIsExportingPdf(false);
                    }
                  }}
                  disabled={isExportingPdf}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExportingPdf ? 'PDF তৈরি হচ্ছে...' : 'পিডিএফ ডাউনলোড'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
