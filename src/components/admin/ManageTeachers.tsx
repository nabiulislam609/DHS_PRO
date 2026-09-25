import React, { useState, useRef, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Printer,
  FileDown,
  Download,
  Search,
  Filter,
  RotateCcw,
  Loader2,
  GraduationCap,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Teacher } from '../../types';
import { compressImageFile } from '../../utils/imageUpload';

export const ManageTeachers: React.FC = () => {
  const { teachers, addTeacher, updateTeacher, deleteTeacher, siteSettings } = useSchool();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('ALL');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Dynamic designation and subject options
  const designationOptions = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => {
      if (t.designation?.trim()) set.add(t.designation.trim());
    });
    return Array.from(set);
  }, [teachers]);

  const subjectOptions = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => {
      if (t.subject?.trim()) set.add(t.subject.trim());
    });
    return Array.from(set);
  }, [teachers]);

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchName = t.name.toLowerCase().includes(q);
        const matchDesig = t.designation?.toLowerCase().includes(q);
        const matchSubj = t.subject?.toLowerCase().includes(q);
        const matchPhone = t.phone?.toLowerCase().includes(q);
        const matchEmail = t.email?.toLowerCase().includes(q);
        if (!matchName && !matchDesig && !matchSubj && !matchPhone && !matchEmail) {
          return false;
        }
      }

      if (filterDesignation !== 'ALL' && t.designation !== filterDesignation) {
        return false;
      }

      if (filterSubject !== 'ALL' && t.subject !== filterSubject) {
        return false;
      }

      return true;
    });
  }, [teachers, searchQuery, filterDesignation, filterSubject]);

  const resetFilters = () => {
    setSearchQuery('');
    setFilterDesignation('ALL');
    setFilterSubject('ALL');
  };

  const isFilterActive =
    searchQuery.trim() !== '' ||
    filterDesignation !== 'ALL' ||
    filterSubject !== 'ALL';

  // Dedicated iframe / direct print executor
  const executePrint = () => {
    const sheetElement = document.getElementById('printable-teacher-sheet');
    if (!sheetElement) {
      window.print();
      return;
    }

    setIsPrinting(true);

    try {
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      printFrame.setAttribute('aria-hidden', 'true');
      document.body.appendChild(printFrame);

      const frameDoc = printFrame.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${siteSettings?.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়'} - শিক্ষক তালিকা</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hind Siliguri", sans-serif; margin: 0; padding: 12px; color: #1e293b; background: #fff; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
    th { background-color: #065f46 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; border: 1px solid #044e3a; padding: 6px 8px; text-align: left; }
    td { border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 11px; }
    tr:nth-child(even) { background-color: #f8fafc; }
    img { max-width: 100%; height: auto; }
    @media print {
      body { padding: 0; }
      th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  ${sheetElement.innerHTML}
</body>
</html>`);
        frameDoc.close();

        setTimeout(() => {
          try {
            printFrame.contentWindow?.focus();
            printFrame.contentWindow?.print();
          } catch {
            window.print();
          } finally {
            setIsPrinting(false);
          }
          setTimeout(() => {
            if (document.body.contains(printFrame)) {
              document.body.removeChild(printFrame);
            }
          }, 3500);
        }, 350);
      } else {
        window.print();
        setIsPrinting(false);
      }
    } catch {
      window.print();
      setIsPrinting(false);
    }
  };

  // Real PDF Generator using jsPDF and html2canvas
  const handleSavePdf = async () => {
    const sheetElement = document.getElementById('printable-teacher-sheet');
    if (!sheetElement) {
      handleDownloadHtmlRoster();
      return;
    }

    setIsExportingPdf(true);

    try {
      const canvas = await html2canvas(sheetElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfPageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfPageHeight;
      }

      const fileName = `teachers_list_${Date.now()}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF error:', error);
      handleDownloadHtmlRoster();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Download Offline Standalone HTML File
  const handleDownloadHtmlRoster = () => {
    const schoolName = siteSettings?.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়';
    const address = siteSettings?.address || 'দাদরা, বগুড়া';
    const dateStr = new Date().toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const rowsHtml = filteredTeachers
      .map((t, idx) => {
        return `
        <tr>
          <td style="text-align:center; padding: 6px 8px; border: 1px solid #cbd5e1;">${idx + 1}</td>
          <td style="text-align:center; padding: 6px 8px; border: 1px solid #cbd5e1;">
            ${
              t.image
                ? `<img src="${t.image}" alt="" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; display: inline-block;" />`
                : `<div style="width:32px;height:32px;border-radius:50%;background:#ecfdf5;color:#065f46;display:inline-flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;">${
                    t.initial || t.name.charAt(0)
                  }</div>`
            }
          </td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold;">${t.name}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #047857; font-weight: bold;">${t.designation}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${t.subject || '—'}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace;">${t.phone || '—'}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${t.email || '—'}</td>
        </tr>`;
      })
      .join('');

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${schoolName} - শিক্ষক তালিকা</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hind Siliguri", sans-serif; margin: 20px; color: #1e293b; background: #fff; }
    .school-title { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 10px; margin-bottom: 12px; }
    .school-name { font-size: 22px; font-weight: bold; color: #065f46; margin: 0; }
    .school-meta { font-size: 11px; color: #64748b; margin: 4px 0 0; }
    .badge { display: inline-block; padding: 3px 12px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; font-size: 11px; font-weight: bold; color: #065f46; margin-top: 6px; }
    .meta-bar { font-size: 11px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 6px; display: flex; justify-content: space-between; margin-bottom: 14px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
    th { background-color: #065f46 !important; color: white !important; border: 1px solid #044e3a; padding: 6px 8px; text-align: left; }
    td { border: 1px solid #cbd5e1; padding: 6px 8px; }
    tr:nth-child(even) { background-color: #f8fafc; }
    .footer-sign { margin-top: 45px; display: flex; justify-content: space-between; font-size: 11px; }
    .sign-col { text-align: center; border-top: 1px dashed #64748b; width: 150px; padding-top: 4px; }
  </style>
</head>
<body>
  <div class="school-title">
    <h1 class="school-name">${schoolName}</h1>
    <p class="school-meta">${address} • ফোন: ${siteSettings?.phone1 || '+৮৮০১৭১২-৩৪৫৬৭৮'}</p>
    <div class="badge">শিক্ষক তথ্য বিবরণী ও তালিকা</div>
  </div>
  <div class="meta-bar">
    <div>
      <span>পদবী: <b>${filterDesignation === 'ALL' ? 'সকল পদবী' : filterDesignation}</b></span>
      <span style="margin: 0 6px;">•</span>
      <span>বিষয়: <b>${filterSubject === 'ALL' ? 'সকল বিষয়' : filterSubject}</b></span>
    </div>
    <div>তারিখ: <b>${dateStr}</b> • প্রদর্শিত শিক্ষক: <b>${filteredTeachers.length} জন</b></div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 35px; text-align: center;">ক্র.</th>
        <th style="width: 45px; text-align: center;">ছবি</th>
        <th>শিক্ষকের নাম</th>
        <th>পদবী</th>
        <th>বিষয়</th>
        <th>মোবাইল নম্বর</th>
        <th>ইমেইল</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
  <div class="footer-sign">
    <div class="sign-col">হিসাবরক্ষক</div>
    <div class="sign-col">সহকারী প্রধান শিক্ষক</div>
    <div class="sign-col">প্রধান শিক্ষকের স্বাক্ষর ও সিল</div>
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `teachers_roster_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const [form, setForm] = useState({
    name: '',
    designation: '',
    subject: '',
    email: '',
    phone: '',
    initial: '',
    image: '' as string | undefined,
  });

  const openAddModal = () => {
    setEditingTeacher(null);
    setUploadError(null);
    setForm({
      name: '',
      designation: 'সহকারী শিক্ষক',
      subject: '',
      email: '',
      phone: '',
      initial: '',
      image: undefined,
    });
    setModalOpen(true);
  };

  const openEditModal = (t: Teacher) => {
    setEditingTeacher(t);
    setUploadError(null);
    setForm({
      name: t.name,
      designation: t.designation,
      subject: t.subject,
      email: t.email,
      phone: t.phone,
      initial: t.initial || t.name.charAt(0),
      image: t.image,
    });
    setModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadError(null);
      const dataUrl = await compressImageFile(file, 500, 500, 0.85);
      setForm((prev) => ({ ...prev, image: dataUrl }));
    } catch (err: any) {
      setUploadError(err.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে');
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, image: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const initial = form.initial || form.name.trim().charAt(0);

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, {
        ...form,
        initial,
      });
    } else {
      addTeacher({
        ...form,
        initial,
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">শিক্ষক ব্যবস্থাপনা</h1>
          <p className="text-xs text-gray-500">
            বিদ্যালয়ের সকল শিক্ষকের ছবি, তালিকা ও তথ্য নিয়ন্ত্রণ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            title="শিক্ষক তালিকা প্রিন্ট ও পিডিএফ প্রিভিউ"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>প্রিন্ট / পিডিএফ</span>
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন শিক্ষক যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="শিক্ষকের নাম, পদবী, বিষয়, ফোন বা ইমেইল দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Action buttons (Print & PDF) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="তালিকাবদ্ধ শিক্ষকদের তালিকা প্রিন্ট করুন"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-700" />
              <span>প্রিন্ট করুন</span>
            </button>

            <button
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="পিডিএফ সংরক্ষণ বা ডাউনলোড করুন"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-700" />
              <span>পিডিএফ ডাউনলোড</span>
            </button>
          </div>
        </div>

        {/* Dropdowns and counter row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mr-1">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>ফিল্টার:</span>
          </div>

          {/* Designation Dropdown */}
          <select
            value={filterDesignation}
            onChange={(e) => setFilterDesignation(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-hidden focus:border-emerald-600 font-medium cursor-pointer"
          >
            <option value="ALL">সকল পদবী</option>
            {designationOptions.map((desig) => (
              <option key={desig} value={desig}>
                {desig}
              </option>
            ))}
          </select>

          {/* Subject Dropdown */}
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-hidden focus:border-emerald-600 font-medium cursor-pointer"
          >
            <option value="ALL">সকল বিষয়</option>
            {subjectOptions.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>

          {/* Reset Filters button */}
          {isFilterActive && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ফিল্টার রিসেট</span>
            </button>
          )}

          {/* Count Badge */}
          <div className={`text-xs text-gray-500 font-medium ${isFilterActive ? '' : 'ml-auto'}`}>
            প্রদর্শিত শিক্ষক: <span className="font-bold text-emerald-800">{filteredTeachers.length} জন</span> (মোট: {teachers.length} জন)
          </div>
        </div>
      </div>

      {/* Teachers Table / Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/80 text-gray-700 font-bold uppercase tracking-wider text-[11px] border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4">শিক্ষক</th>
                <th className="py-3.5 px-4">পদবী</th>
                <th className="py-3.5 px-4">বিষয়</th>
                <th className="py-3.5 px-4">যোগাযোগ</th>
                <th className="py-3.5 px-4 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    কোনো শিক্ষক পাওয়া যায়নি। অন্য কোনো ফিল্টার ব্যবহার করে চেষ্টা করুন।
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {t.image ? (
                          <img
                            src={t.image}
                            alt={t.name}
                            className="w-10 h-10 rounded-full object-cover border border-emerald-300 shadow-xs shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                            {t.initial || t.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-gray-900 block">{t.name}</span>
                          <span className="text-[10px] text-gray-400">ID: {t.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-800">{t.designation}</td>
                    <td className="py-3 px-4">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">{t.subject}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>{t.email}</div>
                      <div className="text-gray-400 text-[11px]">{t.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition cursor-pointer"
                          title="সম্পাদনা করুন"
                        >
                          <Edit2 className="w-4 h-4 text-emerald-700" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`আপনি কি "${t.name}" কে মুছে ফেলতে চান?`)) {
                              deleteTeacher(t.id);
                            }
                          }}
                          className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingTeacher ? 'শিক্ষকের তথ্য পরিবর্তন করুন' : 'নতুন শিক্ষক যোগ করুন'}
            </h3>

            {uploadError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Photo Upload from Device Section */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2">
                <label className="block font-bold text-gray-800">শিক্ষকের ছবি (ডিভাইস থেকে)</label>
                <div className="flex items-center gap-4">
                  {form.image ? (
                    <img
                      src={form.image}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-emerald-600 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-dashed border-emerald-300 text-emerald-700 font-bold text-xl flex items-center justify-center shrink-0">
                      {form.initial || form.name.charAt(0) || <ImageIcon className="w-6 h-6 text-emerald-400" />}
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-2xs transition cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{form.image ? 'ছবি পরিবর্তন করুন' : 'ডিভাইস থেকে ছবি আপলোড'}</span>
                      </button>

                      {form.image && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-medium transition cursor-pointer"
                        >
                          ছবি মুছুন
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">
                      কম্পিউটার বা মোবাইল থেকে JPG, PNG ছবি বেছে নিন (স্বয়ংক্রিয় রিসাইজ হবে)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">শিক্ষকের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ আবদুল করিম"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">পদবী *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: প্রধান শিক্ষক, সিনিয়র শিক্ষক"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">পাঠদানের বিষয় *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: গণিত, বাংলা, পদার্থবিজ্ঞান"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ইমেইল</label>
                  <input
                    type="email"
                    placeholder="email@dadrahs.edu.bd"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">মোবাইল নম্বর</label>
                  <input
                    type="tel"
                    placeholder="+88017..."
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">অবতার আদ্যক্ষর (Initial)</label>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="যেমন: ম, শ, র"
                  value={form.initial}
                  onChange={(e) => setForm({ ...form, initial: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
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
                  className="px-5 py-2 bg-[#15803d] hover:bg-[#166534] text-white font-semibold rounded-lg transition cursor-pointer shadow-xs"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print & PDF Document Preview Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl relative border border-gray-100 max-h-[95vh] flex flex-col">
            {/* Close Button placed at Absolute Top Right Corner */}
            <button
              type="button"
              onClick={() => setShowPrintModal(false)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition cursor-pointer z-30 shadow-2xs"
              title="বন্ধ করুন (Close)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Top Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 no-print pr-10 sm:pr-12">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Printer className="w-4 h-4 text-emerald-700" />
                  <span>শিক্ষক তালিকা প্রিন্ট ও পিডিএফ প্রিভিউ</span>
                </h3>
                <p className="text-xs text-gray-500">
                  নিচের অফিসিয়াল ফরম্যাটে তালিকাটি প্রিন্ট করুন অথবা সরাসরি পিডিএফ ফাইল ডাউনলোড করুন
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={executePrint}
                  disabled={isPrinting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#15803d] hover:bg-[#166534] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-60"
                  title="প্রিন্টার দিয়ে প্রিন্ট করুন"
                >
                  {isPrinting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Printer className="w-3.5 h-3.5" />
                  )}
                  <span>{isPrinting ? 'প্রিন্ট হচ্ছে...' : 'এখনই প্রিন্ট করুন'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSavePdf}
                  disabled={isExportingPdf}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-60"
                  title="পিডিএফ ফাইল সরাসরি ডাউনলোড করুন"
                >
                  {isExportingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5" />
                  )}
                  <span>{isExportingPdf ? 'PDF তৈরি হচ্ছে...' : 'PDF সেভ করুন'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadHtmlRoster}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition cursor-pointer"
                  title="অফলাইন ফাইল ডাউনলোড"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>অফলাইন ফাইল</span>
                </button>
              </div>
            </div>

            {/* Document Content View */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50 rounded-2xl my-3 border border-gray-100">
              <div
                id="printable-teacher-sheet"
                className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-gray-200 text-gray-900 mx-auto max-w-3xl"
              >
                {/* Official School Header */}
                <div className="text-center border-b-2 border-emerald-700 pb-3 mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-emerald-900">
                    {siteSettings?.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়'}
                  </h2>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {siteSettings?.address || 'দাদরা, বগুড়া'} • ফোন: {siteSettings?.phone1 || '+৮৮০১৭১২-৩৪৫৬৭৮'}
                  </p>
                  <div className="inline-block mt-2 px-3 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-full text-xs font-bold">
                    শিক্ষক তথ্য বিবরণী ও পূর্ণাঙ্গ তালিকা
                  </div>
                </div>

                {/* Filter Meta Bar */}
                <div className="flex items-center justify-between text-[11px] bg-gray-50 border border-gray-200 p-2.5 rounded-lg mb-4 font-medium">
                  <div>
                    <span>পদবী: <b>{filterDesignation === 'ALL' ? 'সকল পদবী' : filterDesignation}</b></span>
                    <span className="mx-1.5">•</span>
                    <span>বিষয়: <b>{filterSubject === 'ALL' ? 'সকল বিষয়' : filterSubject}</b></span>
                  </div>
                  <div className="text-gray-600">
                    তারিখ: <b>{new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'numeric', day: 'numeric' })}</b> • মোট: <b className="text-emerald-800">{filteredTeachers.length} জন</b>
                  </div>
                </div>

                {/* Official Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-gray-200 text-xs">
                    <thead>
                      <tr className="bg-emerald-800 text-white text-[11px]">
                        <th className="border border-emerald-900 p-2 text-center w-8 font-bold">ক্র.</th>
                        <th className="border border-emerald-900 p-2 text-center w-12 font-bold">ছবি</th>
                        <th className="border border-emerald-900 p-2 font-bold">শিক্ষকের নাম</th>
                        <th className="border border-emerald-900 p-2 font-bold">পদবী</th>
                        <th className="border border-emerald-900 p-2 font-bold">বিষয়</th>
                        <th className="border border-emerald-900 p-2 font-bold">মোবাইল নম্বর</th>
                        <th className="border border-emerald-900 p-2 font-bold">ইমেইল</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredTeachers.map((t, idx) => (
                        <tr key={t.id} className="odd:bg-white even:bg-gray-50/70">
                          <td className="border border-gray-200 p-2 text-center font-medium">{idx + 1}</td>
                          <td className="border border-gray-200 p-2 text-center">
                            {t.image ? (
                              <img
                                src={t.image}
                                alt={t.name}
                                className="w-7 h-7 rounded-full object-cover inline-block border border-gray-300"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] mx-auto">
                                {t.initial || t.name.charAt(0)}
                              </div>
                            )}
                          </td>
                          <td className="border border-gray-200 p-2 font-bold text-gray-900">{t.name}</td>
                          <td className="border border-gray-200 p-2 text-emerald-800 font-semibold">{t.designation}</td>
                          <td className="border border-gray-200 p-2 text-gray-700">{t.subject || '—'}</td>
                          <td className="border border-gray-200 p-2 font-mono text-gray-600">{t.phone || '—'}</td>
                          <td className="border border-gray-200 p-2 text-gray-600">{t.email || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Official Signatures Row */}
                <div className="mt-12 pt-6 flex items-center justify-between text-xs text-gray-600 border-t border-dashed border-gray-300">
                  <div className="text-center">
                    <div className="w-32 border-t border-gray-400 pt-1 font-semibold text-gray-700">হিসাবরক্ষক</div>
                  </div>
                  <div className="text-center">
                    <div className="w-36 border-t border-gray-400 pt-1 font-semibold text-gray-700">সহকারী প্রধান শিক্ষক</div>
                  </div>
                  <div className="text-center">
                    <div className="w-40 border-t border-gray-400 pt-1 font-semibold text-gray-700">
                      প্রধান শিক্ষকের স্বাক্ষর ও সিল
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
