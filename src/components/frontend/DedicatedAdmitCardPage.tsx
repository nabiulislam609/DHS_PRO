import React, { useState } from 'react';
import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import {
  CreditCard,
  Search,
  Printer,
  Download,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Building2,
  FileCheck,
  ShieldCheck,
  User,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { CLASS_OPTIONS, GROUP_OPTIONS, isClassWithGroups, getSubjectsForClassAndGroup } from '../../data/curriculumSubjects';
import { getStudentResultImage } from '../../utils/studentPhoto';

export const DedicatedAdmitCardPage: React.FC = () => {
  const { siteSettings, students, admitCardConfig, setCurrentFrontendPage } = useSchool();

  const [selectedClass, setSelectedClass] = useState('১০ম শ্রেণি');
  const [selectedGroup, setSelectedGroup] = useState('বিজ্ঞান');
  const [rollInput, setRollInput] = useState('');
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [searched, setSearched] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualId, setManualId] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const isClass910 = isClassWithGroups(selectedClass);

  const normalizeNum = (val: string | number) => {
    const str = String(val || '').trim();
    const bnToEn: Record<string, string> = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
    };
    return str.replace(/[০-৯]/g, (d) => bnToEn[d] || d).replace(/^0+/, '');
  };

  const normalizeClassName = (cls: string) => {
    const c = String(cls || '').toLowerCase();
    if (c.includes('১০') || c.includes('10')) return '10';
    if (c.includes('৯') || c.includes('9')) return '9';
    if (c.includes('৮') || c.includes('8')) return '8';
    if (c.includes('৭') || c.includes('7')) return '7';
    if (c.includes('৬') || c.includes('6')) return '6';
    return c.trim();
  };

  const normalizeGroup = (grp: string) => {
    const g = String(grp || '').toLowerCase();
    if (g.includes('বিজ্ঞান') || g.includes('science')) return 'বিজ্ঞান';
    if (g.includes('মানবিক') || g.includes('humanities')) return 'মানবিক';
    if (g.includes('ব্যবসায়') || g.includes('ব্যবসায়') || g.includes('commerce') || g.includes('business')) return 'ব্যবসায় শিক্ষা';
    return 'সাধারণ';
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearched(true);

    const trimmedRoll = rollInput.trim();
    if (!trimmedRoll) {
      setFoundStudent(null);
      return;
    }

    const rollNorm = normalizeNum(trimmedRoll);
    const clsNorm = normalizeClassName(selectedClass);

    const match = students.find((s) => {
      const sRoll = normalizeNum(s.roll);
      if (sRoll !== rollNorm) return false;

      const sClass = normalizeClassName(s.class || s.studentClass || '');
      if (sClass !== clsNorm) return false;

      if (clsNorm === '9' || clsNorm === '10') {
        const sGrp = s.group || (s.section?.includes('বিজ্ঞান') ? 'বিজ্ঞান' : s.section?.includes('মানবিক') ? 'মানবিক' : s.section?.includes('ব্যবসায়') || s.section?.includes('ব্যবসায়') ? 'ব্যবসায় শিক্ষা' : '');
        if (sGrp) {
          return normalizeGroup(sGrp) === normalizeGroup(selectedGroup);
        }
      }
      return true;
    });

    if (match) {
      setFoundStudent(match);
      setManualName(match.name);
      setManualId(match.id.startsWith('stu-') ? `DHS-2026-${match.roll}` : match.id);
    } else {
      setFoundStudent(null);
      setManualName('');
      setManualId(`DHS-2026-${trimmedRoll}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const el = document.getElementById('printable-admit-card');
    if (!el) {
      window.print();
      return;
    }
    setIsDownloadingPdf(true);
    let container: HTMLElement | null = null;
    try {
      // Create dedicated capture container to avoid overflow or responsive clipping
      container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px';
      container.style.zIndex = '-99999';
      container.style.pointerEvents = 'none';
      container.style.opacity = '1';
      container.style.background = '#ffffff';

      const clone = el.cloneNode(true) as HTMLElement;
      clone.style.width = '800px';
      clone.style.margin = '0';
      clone.style.boxSizing = 'border-box';
      container.appendChild(clone);
      document.body.appendChild(container);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const captureWidth = 800;
      const captureHeight = clone.scrollHeight || clone.offsetHeight || 1000;

      let dataUrl = '';
      try {
        dataUrl = await toPng(clone, {
          width: captureWidth,
          height: captureHeight,
          canvasWidth: captureWidth * 2,
          canvasHeight: captureHeight * 2,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          skipFonts: true,
          cacheBust: true,
        });
      } catch (err) {
        console.warn('toPng failed for admit card, trying html2canvas:', err);
        const canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false,
          backgroundColor: '#ffffff',
          width: captureWidth,
        });
        dataUrl = canvas.toDataURL('image/png', 0.95);
      }

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image failed to load'));
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (img.height * pdfWidth) / img.width;
      pdf.addImage(dataUrl, 'PNG', 0, 5, pdfWidth, pdfHeight, undefined, 'FAST');

      const studentName = (foundStudent?.name || manualName || 'Student').replace(/\s+/g, '_');
      const fileName = `Admit_Card_${studentName}_Roll_${rollInput || 'Admit'}.pdf`;

      try {
        const blob = pdf.output('blob');
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (document.body.contains(a)) document.body.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);
        }, 2000);
      } catch {
        pdf.save(fileName);
      }
    } catch (err) {
      console.error('Admit card PDF error:', err);
      window.print();
    } finally {
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }
      setIsDownloadingPdf(false);
    }
  };

  // Subjects for the admit card routine
  const subjectsList = getSubjectsForClassAndGroup(selectedClass, isClass910 ? selectedGroup : 'সাধারণ');

  // Generate schedule routine
  const examSubjectsRoutine = subjectsList.slice(0, 8).map((sub, idx) => {
    const startDate = new Date(2026, 9, 20 + idx * 2); // Sample scheduled dates
    const dateFormatted = `${startDate.getDate()} অক্টোবর ২০২৬`;
    return {
      subject: sub,
      date: dateFormatted,
      time: 'সকাল ১০:০০ - দুপুর ০১:০০',
      room: `১০${(idx % 4) + 1}`,
    };
  });

  const studentImage = foundStudent
    ? foundStudent.image || getStudentResultImage({ studentName: foundStudent.name, roll: foundStudent.roll, studentId: foundStudent.id }, students)
    : '';

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 pb-16 font-sans">
      {/* Top Header Banner */}
      <section className="bg-gradient-to-r from-[#052e20] via-[#0b4833] to-[#04281b] text-white py-10 px-4 sm:px-8 border-b border-emerald-900/50 shadow-md print:hidden">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  পরীক্ষার প্রবেশপত্র (Admit Card)
                </h1>
                <p className="text-xs text-emerald-200 mt-0.5">
                  শ্রেণি, বিভাগ ও রোল নম্বর দিয়ে তাৎক্ষণিক প্রবেশপত্র যাচাই ও ডাউনলোড করুন
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-emerald-800/80 border border-emerald-600/50 text-emerald-100 text-xs px-3 py-1.5 rounded-xl font-semibold">
              টার্ম: {admitCardConfig?.examTerm || 'বার্ষিক পরীক্ষা ২০২৬'}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {/* Search Box Card (Hidden in print) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-7 space-y-4 print:hidden">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm sm:text-base font-bold text-gray-900">
                প্রবেশপত্র অনুসন্ধানের তথ্য পূরণ করুন
              </h2>
            </div>
            <span className="text-[11px] text-gray-500">
              * সঠিক শ্রেণি ও রোল নম্বর নির্বাচন করুন
            </span>
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
            {/* Class */}
            <div className={isClass910 ? 'sm:col-span-4' : 'sm:col-span-5'}>
              <label className="block text-xs font-bold text-gray-700 mb-1">শ্রেণি (Class) *</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSearched(false);
                }}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              >
                {CLASS_OPTIONS.map((cls, idx) => (
                  <option key={idx} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* Group */}
            {isClass910 && (
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-gray-700 mb-1">বিভাগ (Group) *</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => {
                    setSelectedGroup(e.target.value);
                    setSearched(false);
                  }}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                >
                  {GROUP_OPTIONS.map((grp, idx) => (
                    <option key={idx} value={grp}>{grp} বিভাগ</option>
                  ))}
                </select>
              </div>
            )}

            {/* Roll Number */}
            <div className={isClass910 ? 'sm:col-span-3' : 'sm:col-span-4'}>
              <label className="block text-xs font-bold text-gray-700 mb-1">ক্লাস রোল নম্বর *</label>
              <input
                type="text"
                required
                placeholder="যেমন: ১ বা ১০১"
                value={rollInput}
                onChange={(e) => {
                  setRollInput(e.target.value);
                  setSearched(false);
                }}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              />
            </div>

            {/* Submit Button */}
            <div className={isClass910 ? 'sm:col-span-2' : 'sm:col-span-3'}>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>প্রবেশপত্র খুঁজুন</span>
              </button>
            </div>
          </form>

          {/* Search Result Feedback */}
          {searched && (
            <div className="pt-2">
              {foundStudent ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      নিবন্ধিত শিক্ষার্থী <strong>{foundStudent.name}</strong> এর প্রবেশপত্র সফলভাবে প্রস্তুত হয়েছে।
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>প্রিন্ট</span>
                    </button>
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isDownloadingPdf}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloadingPdf ? 'PDF তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      এই শ্রেণি ও রোলের কোনো নিবন্ধিত শিক্ষার্থী পাওয়া যায়নি। আপনি নিচে সরাসরি নাম ও আইডি লিখে অ্যাডমিট কার্ড তৈরি ও প্রিন্ট করতে পারেন:
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="শিক্ষার্থীর নাম লিখুন..."
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="শিক্ষার্থী আইডি লিখুন..."
                      value={manualId}
                      onChange={(e) => setManualId(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Printable Official Admit Card Document */}
        {(searched || rollInput) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between print:hidden">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-700" />
                অফিসিয়াল প্রবেশপত্র প্রিভিউ
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>প্রিন্ট করুন</span>
                </button>
                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloadingPdf ? 'PDF তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
                </button>
              </div>
            </div>

            {/* Official Admit Card Paper Container */}
            <div
              id="printable-admit-card"
              className="bg-white rounded-2xl shadow-md border-2 border-emerald-800 p-6 sm:p-9 relative overflow-hidden"
              style={{ minHeight: '680px' }}
            >
              {/* Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <GraduationCap className="w-96 h-96 text-emerald-950" />
              </div>

              {/* Decorative Corner Borders */}
              <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-emerald-800 pointer-events-none" />
              <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-emerald-800 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-emerald-800 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-emerald-800 pointer-events-none" />

              {/* School Header */}
              <div className="text-center border-b-2 border-emerald-900 pb-4 mb-5 relative">
                <div className="flex items-center justify-center gap-3.5 mb-1.5">
                  {siteSettings.logoUrl ? (
                    <img
                      src={siteSettings.logoUrl}
                      alt="Logo"
                      className="w-14 h-14 rounded-full object-cover border-2 border-emerald-800 shadow-2xs"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center shadow-2xs">
                      <GraduationCap className="w-7 h-7" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950 tracking-tight">
                      {siteSettings.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়'}
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold text-gray-700 tracking-wide">
                      {siteSettings.schoolNameEnglish || 'Dadra High School'}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {siteSettings.address || 'দাদরা, জয়পুরহাট সদর, জয়পুরহাট'} • স্থাপিত: ১৯৬২ • EIIN: 121980
                    </p>
                  </div>
                </div>

                {/* Admit Card Banner Title */}
                <div className="mt-3 inline-block bg-emerald-900 text-white px-6 py-1 rounded-full text-xs sm:text-sm font-extrabold tracking-wide uppercase shadow-xs">
                  প্রবেশপত্র • ADMIT CARD
                </div>
                <p className="text-xs font-bold text-emerald-900 mt-1">
                  {admitCardConfig?.examTerm || 'Pre-Test Examination (2026)'}
                </p>
              </div>

              {/* Student Details Grid & Photo */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 mb-6">
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4 text-xs">
                  <div>
                    <span className="block text-[11px] text-gray-500 font-medium">শিক্ষার্থীর নাম:</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {foundStudent?.name || manualName || 'সাদিয়া জাহান'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 font-medium">ক্লাস রোল:</span>
                    <span className="font-bold text-emerald-900 text-sm font-mono">
                      {foundStudent?.roll || rollInput || '১'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 font-medium">শিক্ষার্থী আইডি:</span>
                    <span className="font-bold text-gray-900 font-mono">
                      {manualId || foundStudent?.id || 'DHS-2026-1001'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 font-medium">শ্রেণি:</span>
                    <span className="font-bold text-gray-900">{selectedClass}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 font-medium">বিভাগ / শাখা:</span>
                    <span className="font-bold text-gray-900">
                      {isClass910 ? selectedGroup : 'সাধারণ'} {foundStudent?.section ? `(${foundStudent.section})` : '(শাখা ক)'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 font-medium">সেশন ও শিক্ষাবর্ষ:</span>
                    <span className="font-bold text-gray-900">২০২৬ - ২০২৭</span>
                  </div>
                </div>

                {/* Student Photo Frame */}
                <div className="w-24 h-28 border-2 border-emerald-800 rounded-lg overflow-hidden bg-white shadow-2xs shrink-0 flex items-center justify-center relative">
                  {studentImage ? (
                    <img src={studentImage} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2">
                      <User className="w-8 h-8 text-gray-300 mx-auto" />
                      <span className="text-[10px] text-gray-400 font-bold block mt-1">ছবি সংযুক্ত</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-emerald-900/80 text-white text-[8px] text-center py-0.5 font-bold">
                    যাচাইকৃত
                  </div>
                </div>
              </div>

              {/* Exam Routine Table */}
              <div className="mb-6 overflow-hidden rounded-xl border border-gray-300">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-emerald-900 text-white text-[11px] uppercase tracking-wider font-bold">
                      <th className="py-2 px-3 border border-emerald-800 w-12 text-center">ক্র.নং</th>
                      <th className="py-2 px-3 border border-emerald-800">পরীক্ষার বিষয়</th>
                      <th className="py-2 px-3 border border-emerald-800">তারিখ</th>
                      <th className="py-2 px-3 border border-emerald-800">সময়</th>
                      <th className="py-2 px-3 border border-emerald-800 text-center">কক্ষ নং</th>
                      <th className="py-2 px-3 border border-emerald-800 text-center">পরিদর্শকের স্বাক্ষর</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-800 font-medium">
                    {examSubjectsRoutine.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                        <td className="py-1.5 px-3 border border-gray-200 text-center font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-3 border border-gray-200 font-bold text-gray-900">
                          {item.subject}
                        </td>
                        <td className="py-1.5 px-3 border border-gray-200 text-[11px]">
                          {item.date}
                        </td>
                        <td className="py-1.5 px-3 border border-gray-200 text-[11px]">
                          {item.time}
                        </td>
                        <td className="py-1.5 px-3 border border-gray-200 text-center font-mono text-[11px]">
                          {item.room}
                        </td>
                        <td className="py-1.5 px-3 border border-gray-200 text-center text-gray-300">
                          —
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Instructions */}
              <div className="border border-emerald-200 rounded-xl p-3.5 bg-emerald-50/40 text-[11px] text-gray-700 space-y-1 mb-8">
                <span className="font-bold text-emerald-950 block text-xs mb-1">
                  পরীক্ষার্থীদের জন্য বিশেষ নির্দেশাবলী:
                </span>
                <ol className="list-decimal list-inside space-y-0.5 text-gray-600">
                  {admitCardConfig?.instructions && admitCardConfig.instructions.length > 0 ? (
                    admitCardConfig.instructions.map((inst, idx) => (
                      <li key={idx}>{inst}</li>
                    ))
                  ) : (
                    <>
                      <li>পরীক্ষা শুরুর কমপক্ষে ১৫ মিনিট পূর্বে নিজ নিজ আসনে উপস্থিত হতে হবে।</li>
                      <li>প্রবেশপত্র (Admit Card) ছাড়া কোনো অবস্থাতেই পরীক্ষা কক্ষে প্রবেশ করতে দেওয়া হবে না।</li>
                      <li>পরীক্ষা কক্ষে মোবাইল ফোন, অপ্রয়োজনীয় কাগজপত্র বা অননুমোদিত সামগ্রী আনা সম্পূর্ণ নিষিদ্ধ।</li>
                      <li>উত্তরপত্রে রোল নম্বর ও রেজিস্ট্রেশন নম্বর যথাযথভাবে বৃত্ত ভরাট করতে হবে।</li>
                    </>
                  )}
                </ol>
              </div>

              {/* Signatures */}
              <div className="flex items-end justify-between pt-6 border-t border-gray-300 text-center text-xs text-gray-700">
                <div className="space-y-1">
                  <div className="w-36 border-b border-gray-400 mx-auto mb-1" />
                  <span className="font-bold text-gray-800">শ্রেণি শিক্ষকের স্বাক্ষর</span>
                </div>

                <div className="space-y-1 text-center">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-700 mx-auto flex items-center justify-center text-[10px] text-emerald-800 font-bold opacity-80 rotate-[-12deg]">
                    বিদ্যালয় সিল
                  </div>
                  <span className="text-[10px] text-gray-500">অফিসিয়াল সিলমোহর</span>
                </div>

                <div className="space-y-1">
                  <div className="font-serif italic text-emerald-950 text-sm font-bold opacity-80 mb-0.5">
                    Md. Abdul Karim
                  </div>
                  <div className="w-36 border-b border-gray-400 mx-auto mb-1" />
                  <span className="font-bold text-gray-800">প্রধান শিক্ষকের স্বাক্ষর</span>
                  <span className="block text-[10px] text-gray-500">দাদরা উচ্চ বিদ্যালয়</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Specific CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-admit-card, #printable-admit-card * {
            visibility: visible;
          }
          #printable-admit-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none;
            border: 2px solid #064e3b;
          }
        }
      `}} />
    </div>
  );
};
