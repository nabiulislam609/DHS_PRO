import React, { useState, useRef, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Pin,
  Tag,
  Calendar,
  Upload,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Eye,
  Printer,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  CheckSquare,
  Square,
  Clock,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Notice } from '../../types';
import { processNoticeFile } from '../../utils/imageUpload';
import { printNotice, downloadNoticePdf } from '../../utils/noticePdfGenerator';
import { triggerFileDownload, openFileInNewTab } from '../../utils/fileDownloader';

export const ManageNotices: React.FC = () => {
  const {
    notices,
    addNotice,
    updateNotice,
    deleteNotice,
    deleteMultipleNotices,
    togglePinNotice,
    siteSettings,
  } = useSchool();

  // Modals & Active Notice States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [viewingNotice, setViewingNotice] = useState<Notice | null>(null);
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // File upload state
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('সব');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Action Loading & Toast Feedback
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'warning' | 'info';
    text: string;
  } | null>(null);

  const showToast = (type: 'success' | 'warning' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const categories = [
    'সব',
    'জরুরি',
    'ভর্তি',
    'পরীক্ষা',
    'সাধারণ',
    'গুরুত্বপূর্ণ',
    'ক্রীড়া',
    'অনুষ্ঠান',
  ];

  // Add / Edit Form State
  const [form, setForm] = useState({
    title: '',
    code: '',
    category: 'জরুরি' as Notice['category'],
    date: '',
    content: '',
    pinned: false,
    attachmentUrl: '' as string | undefined,
    attachmentType: undefined as 'image' | 'pdf' | undefined,
    attachmentName: '' as string | undefined,
    attachmentSize: '' as string | undefined,
  });

  const openAddModal = () => {
    setEditingNotice(null);
    setUploadError(null);
    const today = new Date();
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const dateFormatted = `${String(today.getDate()).padStart(2, '0')} ${
      months[today.getMonth()]
    } ${today.getFullYear()}`;

    setForm({
      title: '',
      code: `${100 + notices.length + 1}`,
      category: 'জরুরি',
      date: dateFormatted,
      content: '',
      pinned: false,
      attachmentUrl: undefined,
      attachmentType: undefined,
      attachmentName: undefined,
      attachmentSize: undefined,
    });
    setModalOpen(true);
  };

  const openEditModal = (n: Notice) => {
    setEditingNotice(n);
    setUploadError(null);
    setForm({
      title: n.title,
      code: n.code || '',
      category: n.category,
      date: n.date,
      content: n.content,
      pinned: !!n.pinned,
      attachmentUrl: n.attachmentUrl,
      attachmentType: n.attachmentType,
      attachmentName: n.attachmentName,
      attachmentSize: n.attachmentSize,
    });
    setModalOpen(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadError(null);
      setIsProcessingFile(true);
      const res = await processNoticeFile(file);
      setForm((prev) => ({
        ...prev,
        attachmentUrl: res.dataUrl,
        attachmentType: res.type,
        attachmentName: res.name,
        attachmentSize: res.size,
      }));
      showToast('success', '✓ ফাইল সফলভাবে সংযুক্ত করা হয়েছে');
    } catch (err: any) {
      setUploadError(err.message || 'ফাইলটি আপলোড করতে সমস্যা হয়েছে');
      showToast('warning', err.message || 'ফাইল আপলোড ব্যর্থ হয়েছে');
    } finally {
      setIsProcessingFile(false);
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = () => {
    setForm((prev) => ({
      ...prev,
      attachmentUrl: undefined,
      attachmentType: undefined,
      attachmentName: undefined,
      attachmentSize: undefined,
    }));
    setUploadError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('warning', 'দয়া করে নোটিশের শিরোনাম লিখুন');
      return;
    }

    const noticePayload = {
      title: form.title.trim(),
      code: form.code.trim(),
      category: form.category,
      date: form.date.trim(),
      content: form.content.trim(),
      pinned: form.pinned,
      attachmentUrl: form.attachmentUrl,
      attachmentType: form.attachmentType,
      attachmentName: form.attachmentName,
      attachmentSize: form.attachmentSize,
    };

    if (editingNotice) {
      updateNotice(editingNotice.id, noticePayload);
      showToast('success', '✓ নোটিশ সফলভাবে হালনাগাদ করা হয়েছে');
    } else {
      addNotice(noticePayload);
      showToast('success', '✓ নতুন নোটিশ সফলভাবে প্রকাশ করা হয়েছে');
    }

    setModalOpen(false);
  };

  // Filtered Notices
  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      const matchCat =
        selectedCategory === 'সব' || n.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.code && n.code.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [notices, selectedCategory, searchQuery]);

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotices.map((n) => n.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Delete Notice Handler (Reliable in-app confirmation)
  const confirmDeleteNotice = () => {
    if (!noticeToDelete) return;
    const deletedTitle = noticeToDelete.title;
    deleteNotice(noticeToDelete.id);
    setSelectedIds((prev) => prev.filter((id) => id !== noticeToDelete.id));
    if (viewingNotice?.id === noticeToDelete.id) {
      setViewingNotice(null);
    }
    setNoticeToDelete(null);
    showToast('success', `✓ নোটিশ "${deletedTitle}" মুছে ফেলা হয়েছে`);
  };

  // Bulk Delete Handler
  const confirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    deleteMultipleNotices(selectedIds);
    setSelectedIds([]);
    setShowBulkDeleteModal(false);
    showToast('success', `✓ নির্বাচিত ${count}টি নোটিশ মুছে ফেলা হয়েছে`);
  };

  // Print Handler
  const handlePrint = (notice: Notice) => {
    printNotice(notice, siteSettings);
  };

  // PDF Download Handler
  const handleDownloadPdf = async (notice: Notice) => {
    setIsGeneratingPdf(true);
    showToast('info', 'নোটিশটির অফিসিয়াল PDF তৈরি ও ডাউনলোড হচ্ছে...');
    try {
      const ok = await downloadNoticePdf(notice, siteSettings);
      if (ok) {
        showToast('success', '✓ PDF ফাইল সফলভাবে ডাউনলোড হয়েছে');
      } else {
        showToast('info', 'প্রিন্ট অপশন সক্রিয় করা হয়েছে');
      }
    } catch (e) {
      console.error('PDF error:', e);
      showToast('warning', 'PDF সরাসরি সংরক্ষণ না হওয়ায় প্রিন্ট অপশন খুলছে...');
      printNotice(notice, siteSettings);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'জরুরি':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'ভর্তি':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'পরীক্ষা':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ক্রীড়া':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'অনুষ্ঠান':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'গুরুত্বপূর্ণ':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 transition transform animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : toastMessage.type === 'warning'
              ? 'bg-amber-900 text-white border-amber-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {toastMessage.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
          {toastMessage.type === 'info' && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
          <span className="text-xs sm:text-sm font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900">নোটিশ ব্যবস্থাপনা</h1>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              মোট: {notices.length} টি
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            বিদ্যালয়ের সকল নোটিশ প্রকাশ, ছবি/পিডিএফ সংযুক্তি, সরাসরি ভিউ, প্রিন্ট ও পিডিএফ ডাউনলোড পরিচালনা
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {selectedIds.length > 0 && (
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>নির্বাচিত ({selectedIds.length}) টি মুছুন</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন নোটিশ তৈরি করুন</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 block">মোট প্রকাশিত নোটিশ</span>
          <span className="text-xl font-black text-gray-900 mt-0.5 block">{notices.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-700 block">হোমপেজে পিন করা নোটিশ</span>
          <span className="text-xl font-black text-amber-600 mt-0.5 block">
            {notices.filter((n) => n.pinned).length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-700 block">জরুরি নোটিশ</span>
          <span className="text-xl font-black text-rose-600 mt-0.5 block">
            {notices.filter((n) => n.category === 'জরুরি').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-700 block">সংযুক্তিসহ নোটিশ (ছবি/PDF)</span>
          <span className="text-xl font-black text-blue-600 mt-0.5 block">
            {notices.filter((n) => n.attachmentUrl).length}
          </span>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="নোটিশের শিরোনাম, বিবরণ বা কোড দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
            <button
              onClick={handleSelectAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 font-semibold text-gray-700 transition cursor-pointer"
            >
              {selectedIds.length === filteredNotices.length && filteredNotices.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-emerald-700" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              <span>সব নির্বাচন ({selectedIds.length}/{filteredNotices.length})</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
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
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#15803d] text-white shadow-2xs font-bold'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
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

      {/* Notices List */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        {filteredNotices.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-800">কোনো নোটিশ পাওয়া যায়নি</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              অনুসন্ধানের সাথে মিল রেখে কোনো নোটিশ নেই। নতুন নোটিশ যুক্ত করতে উপরের বাটনে ক্লিক করুন।
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotices.map((n) => {
              const isSelected = selectedIds.includes(n.id);
              return (
                <div
                  key={n.id}
                  className={`p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition hover:bg-emerald-50/20 ${
                    isSelected ? 'bg-emerald-50/50' : ''
                  }`}
                >
                  {/* Left: Checkbox + Notice Content */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleSelectOne(n.id)}
                      className="mt-1 p-0.5 text-gray-400 hover:text-emerald-700 transition cursor-pointer"
                      title={isSelected ? 'নির্বাচন বাতিল করুন' : 'নির্বাচন করুন'}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-300" />
                      )}
                    </button>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getCategoryBadgeClass(
                            n.category
                          )}`}
                        >
                          {n.category}
                        </span>

                        {n.code && (
                          <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            স্মারক: {n.code}
                          </span>
                        )}

                        {n.pinned && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Pin className="w-3 h-3 fill-amber-500" />
                            <span>পিন্ড</span>
                          </span>
                        )}

                        {n.attachmentUrl && (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                              n.attachmentType === 'pdf'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {n.attachmentType === 'pdf' ? (
                              <>
                                <FileText className="w-3 h-3 text-rose-600" />
                                <span>PDF সংযুক্তি</span>
                              </>
                            ) : (
                              <>
                                <ImageIcon className="w-3 h-3 text-blue-600" />
                                <span>ছবি সংযুক্তি</span>
                              </>
                            )}
                          </span>
                        )}

                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{n.date}</span>
                        </span>
                      </div>

                      <h3
                        onClick={() => setViewingNotice(n)}
                        className="text-sm sm:text-base font-bold text-gray-900 hover:text-emerald-800 transition cursor-pointer truncate"
                        title={n.title}
                      >
                        {n.title}
                      </h3>

                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {n.content}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions: View, Print, PDF, Pin, Edit, Delete */}
                  <div className="flex flex-wrap items-center gap-1.5 self-end lg:self-center shrink-0">
                    {/* View Button (Requested by User) */}
                    <button
                      onClick={() => setViewingNotice(n)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-[#15803d] text-emerald-800 hover:text-white border border-emerald-200 transition cursor-pointer shadow-2xs"
                      title="নোটিশের বিস্তারিত দেখুন"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>ভিউ</span>
                    </button>

                    {/* Print Button (Requested by User) */}
                    <button
                      onClick={() => handlePrint(n)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border border-gray-200 transition cursor-pointer shadow-2xs"
                      title="অফিসিয়াল নোটিশ প্রিন্ট করুন"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="hidden sm:inline">প্রিন্ট</span>
                    </button>

                    {/* PDF Download Button (Requested by User) */}
                    <button
                      onClick={() => handleDownloadPdf(n)}
                      disabled={isGeneratingPdf}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-rose-50 text-gray-700 hover:text-rose-700 border border-gray-200 transition cursor-pointer shadow-2xs disabled:opacity-50"
                      title="অফিসিয়াল PDF ডাউনলোড করুন"
                    >
                      <Download className="w-3.5 h-3.5 text-rose-600" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>

                    {/* Pin / Unpin */}
                    <button
                      onClick={() => {
                        togglePinNotice(n.id);
                        showToast(
                          'info',
                          n.pinned ? 'নোটিশটি আনপিন করা হয়েছে' : 'নোটিশটি হোমপেজে পিন করা হয়েছে'
                        );
                      }}
                      className={`p-1.5 rounded-lg text-xs font-medium border transition cursor-pointer flex items-center gap-1 ${
                        n.pinned
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-100'
                      }`}
                      title={n.pinned ? 'আনপিন করুন' : 'হোমপেজে পিন করুন'}
                    >
                      <Pin className={`w-3.5 h-3.5 ${n.pinned ? 'fill-amber-500' : ''}`} />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => openEditModal(n)}
                      className="p-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                      title="সম্পাদনা করুন"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-emerald-700" />
                    </button>

                    {/* Delete with In-App Confirmation Modal (Fixed!) */}
                    <button
                      onClick={() => setNoticeToDelete(n)}
                      className="p-1.5 rounded-lg text-xs font-medium border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="নোটিশ মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. Official Notice View Modal (Full Official Format with Print & PDF)     */}
      {/* ========================================================================= */}
      {viewingNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 my-8 max-h-[92vh] overflow-y-auto">
            {/* Top Close Button */}
            <button
              onClick={() => setViewingNotice(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Letterhead Header */}
            <div id="admin-notice-view-modal" className="space-y-6">
              <div className="text-center pb-4 border-b-2 border-emerald-800/30 space-y-1">
                <div className="flex items-center justify-center gap-3">
                  {siteSettings.logoUrl ? (
                    <img
                      src={siteSettings.logoUrl}
                      alt="Logo"
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-800 text-amber-300 font-black flex items-center justify-center text-xl shadow-xs">
                      দ
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
                      {siteSettings.schoolNameBangla}
                    </h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      {siteSettings.schoolNameEnglish}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 font-medium">
                  {siteSettings.address} • স্থাপিত: {siteSettings.establishedYear || '১৯৮২'} • EIIN: ১২৩৪৫৬
                </p>
                <div className="inline-block bg-emerald-800 text-white font-bold text-[11px] px-3.5 py-0.5 rounded-full mt-1.5">
                  অফিসিয়াল বিজ্ঞপ্তি / নোটিশ
                </div>
              </div>

              {/* Metadata Table */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-600">স্মারক নম্বর:</span>
                  <span className="font-mono text-gray-900 font-semibold">
                    {viewingNotice.code ? `DHS/২০২৬/বিজ্ঞপ্তি-${viewingNotice.code}` : 'DHS/২০২৬/বিজ্ঞপ্তি'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span className="font-bold text-gray-600">তারিখ:</span>
                  <span className="text-gray-900 font-medium">{viewingNotice.date}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(
                      viewingNotice.category
                    )}`}
                  >
                    {viewingNotice.category}
                  </span>
                  {viewingNotice.pinned && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      📌 পিন্ড
                    </span>
                  )}
                </div>
              </div>

              {/* Notice Title & Content */}
              <div className="space-y-4">
                <div className="bg-emerald-50/60 border-l-4 border-emerald-700 p-3 rounded-r-xl">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                    বিষয়: {viewingNotice.title}
                  </h3>
                </div>

                <div className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-[#fcfaf7] p-5 rounded-xl border border-gray-200/80">
                  {viewingNotice.content}
                </div>

                {/* Notice Attachment (Photo or PDF) */}
                {viewingNotice.attachmentUrl && (
                  <div className="space-y-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                        {viewingNotice.attachmentType === 'pdf' ? (
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
                      {viewingNotice.attachmentSize && (
                        <span className="text-[10px] text-gray-400 font-mono">
                          ফাইলের আকার: {viewingNotice.attachmentSize}
                        </span>
                      )}
                    </div>

                    {viewingNotice.attachmentType === 'image' ? (
                      <div className="space-y-2">
                        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-2">
                          <img
                            src={viewingNotice.attachmentUrl}
                            alt={viewingNotice.attachmentName || viewingNotice.title}
                            className="max-h-96 w-auto object-contain rounded-lg"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openFileInNewTab(viewingNotice.attachmentUrl!)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition cursor-pointer border border-emerald-200"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>নতুন ট্যাবে দেখুন</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              triggerFileDownload(
                                viewingNotice.attachmentUrl!,
                                viewingNotice.attachmentName || 'notice-photo.jpg'
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
                              {viewingNotice.attachmentName || 'অফিসিয়াল বিজ্ঞপ্তি ডকুমেন্ট.pdf'}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              মুদ্রণযোগ্য ও সত্যায়িত পিডিএফ অনুলিপি
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => openFileInNewTab(viewingNotice.attachmentUrl!)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>পিডিএফ দেখুন</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              triggerFileDownload(
                                viewingNotice.attachmentUrl!,
                                viewingNotice.attachmentName || 'notice-document.pdf'
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
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
              <div className="flex justify-between items-end pt-6 border-t border-gray-200">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-800 flex items-center justify-center text-[10px] font-bold text-emerald-800 text-center transform -rotate-12 opacity-80">
                  বিদ্যালয়<br />সিলমোহর
                </div>

                <div className="text-center space-y-1">
                  <div className="w-28 h-6 border-b border-gray-400 mx-auto flex items-end justify-center text-xs text-gray-500 italic">
                    স্বাক্ষরিত
                  </div>
                  <p className="text-xs font-bold text-gray-900">প্রধান শিক্ষক</p>
                  <p className="text-[11px] text-gray-500">{siteSettings.schoolNameBangla}</p>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                {/* Print Button in Modal */}
                <button
                  type="button"
                  onClick={() => handlePrint(viewingNotice)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#15803d] hover:bg-[#166534] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>প্রিন্ট করুন</span>
                </button>

                {/* PDF Download Button in Modal */}
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(viewingNotice)}
                  disabled={isGeneratingPdf}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isGeneratingPdf ? 'PDF তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const noticeToEdit = viewingNotice;
                    setViewingNotice(null);
                    openEditModal(noticeToEdit);
                  }}
                  className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  সম্পাদনা
                </button>

                <button
                  type="button"
                  onClick={() => setViewingNotice(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. In-App Single Notice Delete Confirmation Modal (Guaranteed to Work!)    */}
      {/* ========================================================================= */}
      {noticeToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-gray-900">নোটিশটি মুছে ফেলতে চান?</h3>
              <p className="text-xs text-gray-500">
                আপনি কি নিশ্চিত যে নিচের নোটিশটি তালিকা থেকে মুছে ফেলতে চান? এটি মুছে ফেললে হোমপেজ ও নোটিশ বোর্ড থেকে সরানো হবে।
              </p>
            </div>

            <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-200 text-xs space-y-1">
              <p className="font-bold text-gray-900 line-clamp-2">{noticeToDelete.title}</p>
              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                <span className="font-medium">ক্যাটাগরি: {noticeToDelete.category}</span>
                <span>•</span>
                <span>তারিখ: {noticeToDelete.date}</span>
                {noticeToDelete.code && (
                  <>
                    <span>•</span>
                    <span>স্মারক: {noticeToDelete.code}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setNoticeToDelete(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={confirmDeleteNotice}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. In-App Bulk Delete Confirmation Modal                                   */}
      {/* ========================================================================= */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-gray-900">
                একসাথে {selectedIds.length}টি নোটিশ মুছে ফেলতে চান?
              </h3>
              <p className="text-xs text-gray-500">
                নির্বাচিত সকল নোটিশ ডেটাবেস থেকে স্থায়ীভাবে মুছে ফেলা হবে।
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={confirmBulkDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                হ্যাঁ, সব মুছুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. Add / Edit Notice Modal                                               */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingNotice ? 'নোটিশ সম্পাদনা করুন' : 'নতুন নোটিশ তৈরি করুন'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">
                    নোটিশের শিরোনাম *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ২০২৪ শিক্ষাবর্ষে ভর্তি বিজ্ঞপ্তি"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    স্মারক কোড (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="101"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ক্যাটাগরি</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
                  >
                    <option value="জরুরি">জরুরি</option>
                    <option value="ভর্তি">ভর্তি</option>
                    <option value="পরীক্ষা">পরীক্ষা</option>
                    <option value="ক্রীড়া">ক্রীড়া</option>
                    <option value="সাধারণ">সাধারণ</option>
                    <option value="অনুষ্ঠান">অনুষ্ঠান</option>
                    <option value="গুরুত্বপূর্ণ">গুরুত্বপূর্ণ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">তারিখ</label>
                  <input
                    type="text"
                    placeholder="যেমন: 22 Sep 2026"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  নোটিশের বিবরণ / বিষয়বস্তু *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="নোটিশের বিস্তারিত বক্তব্য..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 resize-none leading-relaxed"
                />
              </div>

              {/* Photo or PDF Attachment Section */}
              <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-700 flex items-center gap-1.5 text-xs">
                    <Paperclip className="w-3.5 h-3.5 text-emerald-700" />
                    <span>ছবি অথবা পিডিএফ ফাইল সংযুক্তি</span>
                  </label>
                  <span className="text-[10px] text-gray-500">ছবি বা PDF (সর্বোচ্চ ৮MB)</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,application/pdf,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!form.attachmentUrl ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-xl p-4 text-center bg-white cursor-pointer transition hover:bg-emerald-50/30 group"
                  >
                    <div className="flex items-center justify-center gap-3 text-gray-400 group-hover:text-emerald-700 mb-1.5">
                      <ImageIcon className="w-5 h-5" />
                      <span className="text-gray-300">|</span>
                      <FileText className="w-5 h-5 text-rose-500" />
                    </div>
                    <p className="text-xs font-semibold text-gray-700 group-hover:text-emerald-800">
                      ডিভাইস থেকে ছবি বা পিডিএফ নির্বাচন করতে ক্লিক করুন
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      JPG, PNG, WebP অথবা PDF ডকুমেন্ট আপলোড করা যাবে
                    </p>
                  </div>
                ) : (
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {form.attachmentType === 'image' ? (
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-100 flex items-center justify-center">
                          <img
                            src={form.attachmentUrl}
                            alt="Attachment preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-rose-50 border border-rose-200 flex flex-col items-center justify-center shrink-0 text-rose-700">
                          <FileText className="w-6 h-6 mb-0.5 text-rose-600" />
                          <span className="text-[9px] font-bold">PDF</span>
                        </div>
                      )}

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              form.attachmentType === 'image'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {form.attachmentType === 'image' ? 'ছবি সংযুক্ত' : 'পিডিএফ ডকুমেন্ট'}
                          </span>
                          {form.attachmentSize && (
                            <span className="text-[10px] text-gray-400 font-mono">
                              {form.attachmentSize}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-gray-800 truncate">
                          {form.attachmentName ||
                            (form.attachmentType === 'image' ? 'সংযুক্ত ছবি' : 'সংযুক্ত পিডিএফ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition cursor-pointer border border-emerald-200"
                      >
                        পরিবর্তন
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveAttachment}
                        className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer border border-rose-200"
                      >
                        মুছুন
                      </button>
                    </div>
                  </div>
                )}

                {isProcessingFile && (
                  <p className="text-[11px] text-emerald-700 font-medium animate-pulse">
                    ফাইল প্রসেস হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...
                  </p>
                )}
                {uploadError && (
                  <p className="text-[11px] text-rose-600 font-medium">{uploadError}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinnedCheck"
                  checked={form.pinned}
                  onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <label
                  htmlFor="pinnedCheck"
                  className="text-gray-700 font-medium cursor-pointer"
                >
                  হোমপেজে প্রধান পিন করা নোটিশ হিসেবে প্রদর্শন করুন
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#15803d] hover:bg-[#166534] text-white font-semibold rounded-lg transition cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
