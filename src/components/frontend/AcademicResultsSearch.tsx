import React, { useState, useRef, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Search,
  Bookmark,
  Award,
  Printer,
  Download,
  Loader2,
  CheckCircle,
  FileText,
  AlertCircle,
  Sparkles,
  GraduationCap,
  UserCheck,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { ExamResult } from '../../types';
import { getStudentResultImage, getStudentPhoto } from '../../utils/studentPhoto';

// Convert Bengali numerals to English digits for flexible search
const toEnglishDigits = (str: string): string => {
  return str.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));
};

// Translate subject names to fluent Bengali
export const translateSubject = (name: string): string => {
  const map: Record<string, string> = {
    'Bangla (1st & 2nd)': 'বাংলা (১ম ও ২য় পত্র)',
    'English (1st & 2nd)': 'ইংরেজি (১ম ও ২য় পত্র)',
    'Mathematics': 'সাধারণ গণিত',
    'Physics': 'পদার্থবিজ্ঞান',
    'Chemistry': 'রসায়ন',
    'Biology': 'জীববিজ্ঞান',
    'Higher Mathematics': 'উচ্চতর গণিত',
    'Information & Communication Technology (ICT)': 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
    'Bangladesh & Global Studies': 'বাংলাদেশ ও বিশ্বপরিচয়',
    'Islam & Moral Education': 'ইসলাম ও নৈতিক শিক্ষা',
    'Hindu Religion & Moral Education': 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
    'General Science': 'সাধারণ বিজ্ঞান',
    'Accounting': 'হিসাববিজ্ঞান',
    'Business Entrepreneurship': 'ব্যবসায় উদ্যোগ',
    'Finance & Banking': 'ফিন্যান্স ও ব্যাংকিং',
    'Agriculture Studies': 'কৃষি শিক্ষা',
    'Home Science': 'গার্হস্থ্য বিজ্ঞান',
    'Physical Education & Health': 'শারীরিক শিক্ষা ও স্বাস্থ্য',
    'Art & Craft': 'চারু ও কারুকলা',
    'Career Education': 'ক্যারিয়ার শিক্ষা',
  };
  return map[name] || name;
};

// Translate term names - keep exact string to match Result Add
export const translateTerm = (term: string): string => {
  return term;
};

// Translate class name to Bengali
export const translateClass = (cls: string): string => {
  if (cls.includes('১০ম') || cls.includes('৯ম') || cls.includes('৮ম') || cls.includes('৭ম') || cls.includes('৬ষ্ঠ')) {
    return cls;
  }
  if (cls.includes('Class 10')) return cls.replace('Class 10', '১০ম শ্রেণি');
  if (cls.includes('Class 9')) return cls.replace('Class 9', '৯ম শ্রেণি');
  if (cls.includes('Class 8')) return cls.replace('Class 8', '৮ম শ্রেণি');
  if (cls.includes('Class 7')) return cls.replace('Class 7', '৭ম শ্রেণি');
  if (cls.includes('Class 6')) return cls.replace('Class 6', '৬ষ্ঠ শ্রেণি');
  return cls;
};

// Translate student names for initial records if needed
const translateStudentName = (name: string): string => {
  const map: Record<string, string> = {
    'Sadia Jahan': 'সাদিয়া জাহান',
    'Tanvir Ahmed': 'তানভীর আহমেদ',
    'Nusrat Jahan': 'নুসরাত জাহান',
  };
  return map[name] || name;
};

import { AVAILABLE_EXAM_TERMS } from '../admin/ManageExamResults';

// Available Class Options for Selection - Exact matching names as used in Result Add
export const AVAILABLE_SEARCH_CLASSES = [
  '১০ম শ্রেণি (বিজ্ঞান বিভাগ)',
  '১০ম শ্রেণি (মানবিক বিভাগ)',
  '১০ম শ্রেণি (ব্যবসায় শিক্ষা বিভাগ)',
  '৯ম শ্রেণি (বিজ্ঞান বিভাগ)',
  '৯ম শ্রেণি (মানবিক বিভাগ)',
  '৯ম শ্রেণি (ব্যবসায় শিক্ষা বিভাগ)',
  '৮ম শ্রেণি',
  '৭ম শ্রেণি',
  '৬ষ্ঠ শ্রেণি',
];

/**
 * Normalizes class strings to determine grade number and group/stream
 */
export const parseClassDetails = (cls: string): { grade: string; group: string } => {
  const normalized = cls.toLowerCase();

  let grade = '';
  if (normalized.includes('10') || normalized.includes('১০ম') || normalized.includes('১০')) grade = '10';
  else if (normalized.includes('9') || normalized.includes('৯ম') || normalized.includes('৯')) grade = '9';
  else if (normalized.includes('8') || normalized.includes('৮ম') || normalized.includes('৮')) grade = '8';
  else if (normalized.includes('7') || normalized.includes('৭ম') || normalized.includes('৭')) grade = '7';
  else if (normalized.includes('6') || normalized.includes('৬ষ্ঠ') || normalized.includes('৬')) grade = '6';

  let group = '';
  if (normalized.includes('বিজ্ঞান') || normalized.includes('science')) group = 'science';
  else if (normalized.includes('মানবিক') || normalized.includes('humanities') || normalized.includes('arts')) group = 'humanities';
  else if (normalized.includes('ব্যবসায়') || normalized.includes('ব্যবসায়') || normalized.includes('business') || normalized.includes('commerce')) group = 'commerce';

  return { grade, group };
};

/**
 * Strict class comparison:
 * - Grade MUST match exactly (Class 10 cannot match Class 6 or 8 or 9)
 * - If group is specified (science, humanities, commerce), group MUST match strictly
 */
export const isClassMatchStrict = (recordClass: string, selectedClass: string): boolean => {
  if (!selectedClass || selectedClass.trim() === '' || selectedClass.startsWith('--')) {
    return false;
  }
  if (recordClass.trim() === selectedClass.trim()) {
    return true;
  }
  const r = parseClassDetails(recordClass);
  const s = parseClassDetails(selectedClass);

  if (!r.grade || !s.grade) {
    return recordClass.trim().toLowerCase() === selectedClass.trim().toLowerCase();
  }

  // Grade must match exactly
  if (r.grade !== s.grade) {
    return false;
  }

  // If selected specifies a group (e.g. Science or Humanities), record must match that group
  if (s.group && r.group && s.group !== r.group) {
    return false;
  }

  // If selected requires a specific group but record has no group
  if (s.group && !r.group) {
    return false;
  }

  return true;
};

/**
 * Normalizes examination term to canonical key
 */
export const getTermCanonicalKey = (term: string): string => {
  const lower = term.toLowerCase();
  if (lower.includes('pre-test') || lower.includes('প্রি-টেস্ট') || lower.includes('প্রাক-নির্বাচনী')) return 'pre-test';
  if (lower.includes('test') || lower.includes('নির্বাচনী')) return 'test';
  if (lower.includes('1st term') || lower.includes('১ম সাময়িক') || lower.includes('প্রথম সাময়িক')) return '1st-term';
  if (lower.includes('2nd term') || lower.includes('২য় সাময়িক') || lower.includes('দ্বিতীয় সাময়িক')) return '2nd-term';
  if (lower.includes('annual') || lower.includes('বার্ষিক')) return 'annual';
  if (lower.includes('half-yearly') || lower.includes('অর্ধবার্ষিক') || lower.includes('অর্ধ-বার্ষিক')) return 'half-yearly';
  if (lower.includes('model test') || lower.includes('মডেল টেস্ট')) return 'model-test';
  if (lower.includes('monthly') || lower.includes('মাসিক')) return 'monthly';
  if (lower.includes('special') || lower.includes('বিশেষ')) return 'special';
  return lower.trim();
};

/**
 * Strict exam term matching
 */
export const isTermMatchStrict = (recordTerm: string, selectedTerm: string): boolean => {
  if (!selectedTerm || selectedTerm.trim() === '' || selectedTerm.startsWith('--')) {
    return false;
  }
  if (recordTerm.trim().toLowerCase() === selectedTerm.trim().toLowerCase()) {
    return true;
  }
  const rKey = getTermCanonicalKey(recordTerm);
  const sKey = getTermCanonicalKey(selectedTerm);
  return rKey !== '' && rKey === sKey;
};

export const AcademicResultsSearch: React.FC = () => {
  const { examResults, students } = useSchool();
  const [searchRoll, setSearchRoll] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    roll?: string;
    studentClass?: string;
    examTerm?: string;
  }>({});
  const [searchedResult, setSearchedResult] = useState<ExamResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchedCriteria, setLastSearchedCriteria] = useState<{
    roll: string;
    studentClass: string;
    examTerm: string;
  } | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const marksheetRef = useRef<HTMLDivElement>(null);

  // Dynamically assemble available exam terms and classes, matching Result Add exactly
  const availableExamTerms = useMemo(() => {
    const list = [...AVAILABLE_EXAM_TERMS];
    examResults.forEach((r) => {
      if (r.examTerm && r.examTerm.trim() && !list.includes(r.examTerm.trim())) {
        list.push(r.examTerm.trim());
      }
    });
    return list;
  }, [examResults]);

  const availableClasses = useMemo(() => {
    const list = [...AVAILABLE_SEARCH_CLASSES];
    examResults.forEach((r) => {
      if (r.studentClass && r.studentClass.trim() && !list.includes(r.studentClass.trim())) {
        list.push(r.studentClass.trim());
      }
    });
    return list;
  }, [examResults]);

  const handleSearch = (rollOverride?: string, classOverride?: string, termOverride?: string) => {
    const rawRoll = (rollOverride !== undefined ? rollOverride : searchRoll).trim();
    const rawClass = (classOverride !== undefined ? classOverride : selectedClass).trim();
    const rawTerm = (termOverride !== undefined ? termOverride : selectedTerm).trim();

    // Data Validation Checks
    const errors: { roll?: string; studentClass?: string; examTerm?: string } = {};

    if (!rawRoll) {
      errors.roll = 'শ্রেণির রোল নম্বর প্রদান করা বাধ্যতামূলক।';
    }
    if (!rawClass || rawClass === '') {
      errors.studentClass = 'অনুগ্রহ করে শ্রেণি নির্বাচন করুন।';
    }
    if (!rawTerm || rawTerm === '') {
      errors.examTerm = 'অনুগ্রহ করে পরীক্ষার নাম নির্বাচন করুন।';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setSearchedResult(null);
      setHasSearched(false);
      return;
    }

    // Clear validation errors and record search state
    setValidationErrors({});
    setHasSearched(true);
    setLastSearchedCriteria({
      roll: rawRoll,
      studentClass: rawClass,
      examTerm: rawTerm,
    });

    const engRoll = toEnglishDigits(rawRoll).toLowerCase();
    const origRoll = rawRoll.toLowerCase();

    // STRICT MATCHING: Roll + Class + Term MUST ALL MATCH!
    const match = examResults.find((r) => {
      // 1. Roll Match (Bengali and English digit normalization)
      const rRollEng = toEnglishDigits(r.roll).trim().toLowerCase();
      const rRollOrig = r.roll.trim().toLowerCase();
      const matchRoll = rRollEng === engRoll || rRollOrig === origRoll;
      if (!matchRoll) return false;

      // 2. Class Match (Strict grade level and group/stream verification)
      const matchClass = isClassMatchStrict(r.studentClass, rawClass);
      if (!matchClass) return false;

      // 3. Exam Term Match (Strict examination term verification)
      const matchTerm = isTermMatchStrict(r.examTerm, rawTerm);
      if (!matchTerm) return false;

      return true;
    });

    // ABSOLUTELY NO FALLBACK: If roll, class, or exam does not match, return null
    setSearchedResult(match || null);
  };

  const selectDemoRecord = (roll: string, cls: string, term: string) => {
    setSearchRoll(roll);
    setSelectedClass(cls);
    setSelectedTerm(term);
    setValidationErrors({});
    handleSearch(roll, cls, term);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!marksheetRef.current || !searchedResult) return;
    setIsGeneratingPdf(true);
    try {
      const element = marksheetRef.current;

      // 1. Create a dedicated off-screen capture container attached directly to document.body
      // This completely eliminates any parent container overflow clipping, viewport constraints, or mobile width limitations!
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px';
      container.style.zIndex = '-99999';
      container.style.pointerEvents = 'none';
      container.style.opacity = '1';
      container.style.overflow = 'visible';
      container.style.background = '#ffffff';

      const clone = element.cloneNode(true) as HTMLElement;
      clone.id = 'marksheet-pdf-render-clone';
      clone.style.width = '800px';
      clone.style.minWidth = '800px';
      clone.style.maxWidth = '800px';
      clone.style.height = 'auto';
      clone.style.minHeight = 'unset';
      clone.style.maxHeight = 'unset';
      clone.style.margin = '0';
      clone.style.boxSizing = 'border-box';
      clone.style.overflow = 'visible';

      container.appendChild(clone);
      document.body.appendChild(container);

      // Brief tick for DOM reflow
      await new Promise((resolve) => setTimeout(resolve, 80));

      const captureWidth = 800;
      const captureHeight = clone.offsetHeight || clone.scrollHeight || 1130;

      let dataUrl: string;
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
        console.warn('html-to-image with skipFonts failed, trying fallback:', err);
        dataUrl = await toPng(clone, {
          width: captureWidth,
          height: captureHeight,
          pixelRatio: 1.5,
          backgroundColor: '#ffffff',
        });
      } finally {
        if (container.parentElement) {
          document.body.removeChild(container);
        }
      }

      // 2. Load the rendered image to get exact natural dimensions
      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image failed to load'));
      });

      // 3. Create single-page A4 PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      // Comfortable top margin (12mm) as requested by user, with side & bottom margins to guarantee 1 single page!
      const marginTop = 12; // 12mm space from the top of the A4 page
      const marginBottom = 10;
      const marginSide = 8;
      const printableWidth = pageWidth - marginSide * 2; // 194mm
      const printableHeight = pageHeight - marginTop - marginBottom; // 275mm

      let renderWidth = printableWidth;
      let renderHeight = (img.height * printableWidth) / img.width;

      if (renderHeight > printableHeight) {
        const scale = printableHeight / renderHeight;
        renderHeight = printableHeight;
        renderWidth = printableWidth * scale;
      }

      const posX = (pageWidth - renderWidth) / 2;
      const posY = marginTop; // Positioned with top spacing from the A4 page

      pdf.addImage(dataUrl, 'PNG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');

      const safeRoll = searchedResult.roll.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `Dadra_High_School_Marksheet_Roll_${safeRoll || 'Student'}.pdf`;

      // 4. Trigger download reliably (native save + direct Blob link fallback for sandboxed iframes)
      try {
        const blob = pdf.output('blob');
        const blobUrl = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.style.display = 'none';
        downloadLink.href = blobUrl;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();

        setTimeout(() => {
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(blobUrl);
        }, 1500);
      } catch {
        pdf.save(fileName);
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      // Fallback: If browser completely blocks canvas/pdf download, open browser print dialog
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <section id="results" className="py-12 sm:py-16 bg-[#fafaf9] relative scroll-mt-20">
      {/* Dedicated Print Isolation Styles: When window.print() is called, ONLY the marksheet prints */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm;
          }
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            height: 100% !important;
          }
          body * {
            visibility: hidden !important;
          }
          #marksheet-printable-card, #marksheet-printable-card * {
            visibility: visible !important;
          }
          #marksheet-printable-card {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: 285mm !important;
            min-height: 285mm !important;
            margin: 0 !important;
            padding: 6mm 8mm !important;
            box-shadow: none !important;
            border: 3px double #064e3b !important;
            box-sizing: border-box !important;
            overflow: visible !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
          }
          .print-exclude {
            display: none !important;
          }
        }
      `}</style>
      <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-6">
        {/* Top Dark Emerald Header Banner - Completely in Bengali */}
        <div className="bg-gradient-to-br from-[#063326] via-[#094132] to-[#042018] rounded-3xl p-8 sm:p-12 shadow-xl border border-emerald-900/40 relative overflow-hidden print:hidden">
          {/* Subtle decorative circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-[#0f4d3a]/80 text-[#34d399] border border-[#16654a] px-3.5 py-1 rounded-full text-xs font-semibold mb-4">
              <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
              <span>রাজশাহী শিক্ষা বোর্ড কারিকুলাম মানদণ্ড</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              অনলাইন একাডেমিক ফলাফল ও নম্বরপত্র (মার্কশীট)
            </h2>

            <p className="text-emerald-100/80 text-xs sm:text-sm mt-2.5 max-w-2xl leading-relaxed">
              টার্ম পরীক্ষার ফলাফল, বিষয়ভিত্তিক নম্বর যাচাই করুন এবং প্রাতিষ্ঠানিক অফিশিয়াল গ্রেড শিট ডাউনলোড ও প্রিন্ট করুন।
            </p>
          </div>
        </div>

        {/* Search Student Examination Record Card - Completely in Bengali */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8 space-y-6 print:hidden">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-base sm:text-lg">
            <Search className="w-5 h-5 text-emerald-600" />
            <span>শিক্ষার্থীর পরীক্ষার ফলাফল অনুসন্ধান করুন</span>
          </div>

          {/* Validation Alert Banner if inputs are incomplete */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl p-4 text-xs sm:text-sm flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">অনুগ্রহ করে প্রয়োজনীয় তথ্যগুলো সঠিকভাবে পূরণ করুন:</span>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs text-amber-800">
                  {validationErrors.roll && <li>{validationErrors.roll}</li>}
                  {validationErrors.studentClass && <li>{validationErrors.studentClass}</li>}
                  {validationErrors.examTerm && <li>{validationErrors.examTerm}</li>}
                </ul>
              </div>
            </div>
          )}

          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start"
          >
            {/* Class Roll Number Input */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                শ্রেণির রোল নম্বর <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="যেমন: ১, ২, ৩... (e.g. 1, 2, 3)"
                value={searchRoll}
                onChange={(e) => {
                  setSearchRoll(e.target.value);
                  if (validationErrors.roll) {
                    setValidationErrors((prev) => ({ ...prev, roll: undefined }));
                  }
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm transition ${
                  validationErrors.roll
                    ? 'border-2 border-red-500 bg-red-50/40 text-red-900 placeholder-red-400 focus:outline-hidden focus:border-red-600'
                    : 'bg-gray-50/70 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-emerald-600 focus:bg-white'
                }`}
              />
              {validationErrors.roll && (
                <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{validationErrors.roll}</span>
                </p>
              )}
            </div>

            {/* Class Selection Dropdown */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                শ্রেণি নির্বাচন করুন <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  if (validationErrors.studentClass) {
                    setValidationErrors((prev) => ({ ...prev, studentClass: undefined }));
                  }
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer transition ${
                  validationErrors.studentClass
                    ? 'border-2 border-red-500 bg-red-50/40 text-red-900 focus:outline-hidden focus:border-red-600'
                    : 'bg-gray-50/70 border border-gray-200 text-gray-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white'
                }`}
              >
                <option value="">-- শ্রেণি নির্বাচন করুন (বাধ্যতামূলক) --</option>
                {availableClasses.map((c, idx) => (
                  <option key={idx} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {validationErrors.studentClass && (
                <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{validationErrors.studentClass}</span>
                </p>
              )}
            </div>

            {/* Examination Term Dropdown - EXACT SAME options as Result Add */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                পরীক্ষার নাম / টার্ম <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedTerm}
                onChange={(e) => {
                  setSelectedTerm(e.target.value);
                  if (validationErrors.examTerm) {
                    setValidationErrors((prev) => ({ ...prev, examTerm: undefined }));
                  }
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer transition ${
                  validationErrors.examTerm
                    ? 'border-2 border-red-500 bg-red-50/40 text-red-900 focus:outline-hidden focus:border-red-600'
                    : 'bg-gray-50/70 border border-gray-200 text-gray-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white'
                }`}
              >
                <option value="">-- পরীক্ষার নাম / টার্ম নির্বাচন করুন (বাধ্যতামূলক) --</option>
                {availableExamTerms.map((t, idx) => (
                  <option key={idx} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {validationErrors.examTerm && (
                <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{validationErrors.examTerm}</span>
                </p>
              )}
            </div>

            {/* Search Button */}
            <div className="md:col-span-2 pt-5.5">
              <button
                type="submit"
                className="w-full bg-[#059669] hover:bg-[#047857] text-white py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:shadow"
              >
                <Search className="w-4 h-4" />
                <span>ফলাফল অনুসন্ধান</span>
              </button>
            </div>
          </form>

          {/* Quick Demo Records Buttons - Sets Exact Roll, Class, and Exam */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 text-xs">
            <span className="text-gray-500 font-bold">সঠিক তথ্য দিয়ে দ্রুত যাচাই করুন:</span>
            <button
              type="button"
              onClick={() => selectDemoRecord('1', '১০ম শ্রেণি (বিজ্ঞান বিভাগ)', 'Pre-Test Examination (2026)')}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 pl-1.5 pr-3 py-1 rounded-full font-semibold transition cursor-pointer flex items-center gap-2 text-[11px]"
            >
              <img
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&h=100&fit=crop&crop=faces&q=80"
                alt="Sadia Jahan"
                className="w-5 h-5 rounded-full object-cover border border-emerald-300 shrink-0"
              />
              <span>সাদিয়া জাহান (১০ম বিজ্ঞান - রোল ১)</span>
            </button>
            <button
              type="button"
              onClick={() => selectDemoRecord('2', '১০ম শ্রেণি (বিজ্ঞান বিভাগ)', 'Pre-Test Examination (2026)')}
              className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 pl-1.5 pr-3 py-1 rounded-full font-semibold transition cursor-pointer flex items-center gap-2 text-[11px]"
            >
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=faces&q=80"
                alt="Tanvir Ahmed"
                className="w-5 h-5 rounded-full object-cover border border-blue-300 shrink-0"
              />
              <span>তানভীর আহমেদ (১০ম বিজ্ঞান - রোল ২)</span>
            </button>
            <button
              type="button"
              onClick={() => selectDemoRecord('1', '৮ম শ্রেণি', 'Annual Examination / বার্ষিক পরীক্ষা (2026)')}
              className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 pl-1.5 pr-3 py-1 rounded-full font-semibold transition cursor-pointer flex items-center gap-2 text-[11px]"
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80"
                alt="Rafsan Zaman"
                className="w-5 h-5 rounded-full object-cover border border-purple-300 shrink-0"
              />
              <span>রাফসান জামান (৮ম শ্রেণি - রোল ১, বার্ষিক)</span>
            </button>
            <button
              type="button"
              onClick={() => selectDemoRecord('1', '৯ম শ্রেণি (মানবিক বিভাগ)', '1st Term Examination / ১ম সাময়িক পরীক্ষা (2026)')}
              className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 pl-1.5 pr-3 py-1 rounded-full font-semibold transition cursor-pointer flex items-center gap-2 text-[11px]"
            >
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&q=80"
                alt="Sumaiya Akter"
                className="w-5 h-5 rounded-full object-cover border border-amber-300 shrink-0"
              />
              <span>সুমাইয়া আক্তার (৯ম মানবিক - রোল ১, ১ম সাময়িক)</span>
            </button>
          </div>
        </div>

        {/* Search Result Display / Marksheet */}
        {hasSearched && (
          <div className="transition-all duration-300">
            {searchedResult ? (
              <div className="space-y-4">
                {/* Control Action Bar - Completely separated from the marksheet so it never appears in PDF or Print */}
                <div className="print-exclude bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-emerald-900 font-semibold text-xs sm:text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>ফলাফল সফলভাবে পাওয়া গেছে! নিচের বাটন থেকে সরাসরি ডাউনলোড অথবা প্রিন্ট করুন:</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {/* Direct Download Button */}
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isGeneratingPdf}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm hover:shadow cursor-pointer disabled:opacity-60"
                      title="সরাসরি পিডিএফ (PDF) ডাউনলোড করুন"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                          <span>পিডিএফ তৈরি হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 text-emerald-200" />
                          <span>পিডিএফ ডাউনলোড</span>
                        </>
                      )}
                    </button>

                    {/* Print Button */}
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-300 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
                      title="প্রিন্টার ডায়ালগ খুলুন"
                    >
                      <Printer className="w-4 h-4 text-gray-600" />
                      <span>প্রিন্ট করুন</span>
                    </button>
                  </div>
                </div>

                {/* The Marksheet Document Itself (Ref captured by html-to-image and isolated for Print) */}
                <div
                  ref={marksheetRef}
                  id="marksheet-printable-card"
                  className="bg-white rounded-2xl border-4 border-double border-emerald-950 shadow-2xl p-5 sm:p-7 max-w-[800px] mx-auto relative overflow-hidden text-gray-900"
                  style={{ width: '100%', maxWidth: '800px' }}
                >
                  {/* Subtle Background Watermark */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.035] flex items-center justify-center">
                    <div className="w-[480px] h-[480px] rounded-full border-[22px] border-emerald-950 flex items-center justify-center">
                      <span className="text-9xl font-black text-emerald-950">দ</span>
                    </div>
                  </div>

                  {/* Inner Decorative Diploma Frame */}
                  <div className="border-2 border-emerald-900/35 rounded-xl p-4 sm:p-5 relative z-10 bg-white/95 space-y-3.5">
                    {/* Institutional Header with Official Credentials */}
                    <div className="border-b-2 border-emerald-950 pb-3 text-center">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        {/* Left Crest */}
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-amber-300 font-black flex items-center justify-center text-xl shadow-md border-2 border-amber-400 shrink-0">
                            দ
                          </div>
                          <div>
                            <h3 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight leading-tight">
                              দাদরা উচ্চ বিদ্যালয়
                            </h3>
                            <p className="text-[10px] sm:text-[10.5px] font-semibold text-gray-700 uppercase tracking-wide">
                              DADRA HIGH SCHOOL • স্থাপিত: ১৯৬৮
                            </p>
                            <p className="text-[10px] text-gray-600 font-medium">
                              EIIN: ১২৩৪৫৬ • বিদ্যালয় কোড: ৫৬৭৮ • রাজশাহী শিক্ষা বোর্ড
                            </p>
                          </div>
                        </div>

                        {/* Right Verification Seal */}
                        <div className="text-center sm:text-right shrink-0">
                          <div className="inline-block bg-emerald-50 border border-emerald-300 rounded-lg px-3 py-1.5 text-center shadow-2xs">
                            <div className="flex items-center gap-1 text-emerald-900 font-bold text-[11px] justify-center sm:justify-end">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                              <span>অফিসিয়াল ডিজিটাল প্রতিলিপি</span>
                            </div>
                            <div className="text-[9px] text-gray-600 font-medium mt-0.5 tracking-tight flex items-center justify-center sm:justify-end gap-1.5">
                              <span>শিক্ষাবর্ষ: ২০২৬</span>
                              <span>•</span>
                              <span>সনদ ক্রম: #{searchedResult.roll.padStart(4, '0')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Official Transcript Ribbon Banner */}
                      <div className="mt-2.5 pt-2 border-t border-dashed border-gray-300 flex justify-center">
                        <span className="inline-block bg-emerald-950 text-amber-300 text-[11px] sm:text-xs font-black px-6 py-1 rounded-full shadow-xs uppercase tracking-wide border border-amber-400/40 whitespace-nowrap">
                          একাডেমিক ট্রান্সক্রিপ্ট ও নম্বরপত্র (ACADEMIC TRANSCRIPT)
                        </span>
                      </div>
                    </div>

                    {/* Student Information Credentials Box with Official Photo */}
                    {(() => {
                      const studentPhoto = getStudentResultImage(searchedResult, students);
                      return (
                        <div className="bg-[#f8fafc] rounded-xl border border-gray-300 overflow-hidden text-xs space-y-0">
                          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-300">
                            {/* Student Passport Photo Box */}
                            <div className="p-3 bg-white flex sm:flex-col items-center justify-center gap-2 shrink-0 sm:w-28 text-center border-b sm:border-b-0 border-gray-200">
                              <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border-2 border-emerald-800 shadow-2xs bg-gray-50 flex items-center justify-center relative">
                                {studentPhoto ? (
                                  <img
                                    src={studentPhoto}
                                    alt={searchedResult.studentName}
                                    crossOrigin="anonymous"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="text-center p-1 text-gray-400">
                                    <UserCheck className="w-7 h-7 mx-auto text-gray-300" />
                                    <span className="text-[9px] font-bold block mt-1">ছবি সংরক্ষিত</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-left sm:text-center">
                                <span className="inline-block text-[9px] font-bold text-emerald-900 bg-emerald-100/70 border border-emerald-300 px-1.5 py-0.5 rounded leading-none">
                                  শিক্ষার্থীর ছবি
                                </span>
                              </div>
                            </div>

                            {/* Credentials Grid */}
                            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-300">
                              <div className="p-2.5">
                                <span className="text-gray-500 block text-[10px] font-medium">শিক্ষার্থীর নাম</span>
                                <span className="text-gray-950 font-bold text-xs sm:text-sm block mt-0.5">
                                  {translateStudentName(searchedResult.studentName)}
                                </span>
                              </div>
                              <div className="p-2.5 bg-emerald-50/60">
                                <span className="text-emerald-900 block text-[10px] font-bold">শ্রেণির রোল নম্বর</span>
                                <span className="text-emerald-950 font-black text-sm sm:text-base block mt-0.5">
                                  রোল: {searchedResult.roll}
                                </span>
                              </div>
                              <div className="p-2.5">
                                <span className="text-gray-500 block text-[10px] font-medium">শ্রেণি ও শাখা</span>
                                <span className="text-gray-950 font-bold text-xs sm:text-sm block mt-0.5">
                                  {translateClass(searchedResult.studentClass)} {searchedResult.section ? `• শাখা: ${searchedResult.section}` : ''}
                                </span>
                              </div>
                              <div className="p-2.5">
                                <span className="text-gray-500 block text-[10px] font-medium">পরীক্ষার নাম</span>
                                <span className="text-gray-950 font-bold text-xs sm:text-sm block mt-0.5">
                                  {translateTerm(searchedResult.examTerm)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Secondary Institutional Meta Bar */}
                          <div className="bg-gray-100/90 px-3 py-1.5 border-t border-gray-300 flex flex-wrap items-center justify-between text-[9.5px] text-gray-600 font-medium gap-2">
                            <span>শিক্ষাবর্ষ: ২০২৬</span>
                            <span>শাখা/গ্রুপ: {searchedResult.section || 'সাধারণ'}</span>
                            <span>শিক্ষার্থী আইডি: {searchedResult.studentId || `DHS-2026-${searchedResult.roll}`}</span>
                            <span>ফলাফল প্রকাশের তারিখ: ২৪ ফেব্রুয়ারি ২০২৬</span>
                            <span>সনদ ট্র্যাকিং: DHS-2026-R{searchedResult.roll}</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* GPA & Result Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-2 text-center min-h-[68px] flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-emerald-900 block leading-tight">জিপিএ (GPA)</span>
                        <span className="text-xl sm:text-2xl font-black text-emerald-950 block my-auto">
                          {searchedResult.gpa.toFixed(2)}
                        </span>
                      </div>

                      <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-2 text-center min-h-[68px] flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-amber-900 block leading-tight">লেটার গ্রেড</span>
                        <span className="text-xl sm:text-2xl font-black text-amber-950 block my-auto">
                          {searchedResult.grade}
                        </span>
                      </div>

                      <div className="bg-blue-50/70 border border-blue-300 rounded-xl p-2 text-center min-h-[68px] flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-blue-900 block leading-tight">মোট প্রাপ্ত নম্বর</span>
                        <span className="text-xl sm:text-2xl font-black text-blue-950 block my-auto">
                          {searchedResult.totalMarks}
                        </span>
                      </div>

                      <div className="bg-purple-50/70 border border-purple-300 rounded-xl p-2 text-center min-h-[68px] flex flex-col justify-between items-center">
                        <span className="text-[10px] font-bold text-purple-900 block leading-tight">ফলাফল স্ট্যাটাস</span>
                        <div className="my-auto pt-0.5">
                          <span className="inline-block bg-emerald-800 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs whitespace-nowrap">
                            {searchedResult.status === 'PUBLISHED' ? 'উত্তীর্ণ (PASSED)' : searchedResult.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Subject-Wise Detailed Marks Table */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between pb-0.5">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-950 flex items-center gap-1.5 whitespace-nowrap">
                          <FileText className="w-3.5 h-3.5 text-emerald-900 shrink-0" />
                          <span>বিষয়ভিত্তিক নম্বর ও গ্রেড বিবরণী</span>
                        </h4>
                        <span className="text-[10.5px] text-gray-600 font-semibold whitespace-nowrap">
                          মানদণ্ড: ১০০/২০০ নম্বর
                        </span>
                      </div>

                      <div className="rounded-xl border border-gray-300 shadow-2xs overflow-hidden">
                        <table className="w-full text-left text-xs text-gray-800">
                          <thead className="bg-emerald-950 text-white font-bold text-[10.5px]">
                            <tr>
                              <th className="py-2 px-3 text-center w-10">ক্র.</th>
                              <th className="py-2 px-3">বিষয়ের নাম</th>
                              <th className="py-2 px-3 text-center w-24">পূর্ণমান</th>
                              <th className="py-2 px-3 text-center w-24">প্রাপ্ত নম্বর</th>
                              <th className="py-2 px-3 text-center w-28">গ্রেড পয়েন্ট (GP)</th>
                              <th className="py-2 px-3 text-center w-24">লেটার গ্রেড</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {searchedResult.subjects.map((sub, idx) => {
                              const fullMarks = sub.marks > 100 ? 200 : 100;
                              return (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/80'}>
                                  <td className="py-1.5 px-3 text-center font-mono text-gray-500 text-[11px]">{idx + 1}</td>
                                  <td className="py-1.5 px-3 font-bold text-gray-950 text-[11px]">
                                    {translateSubject(sub.subject)}
                                  </td>
                                  <td className="py-1.5 px-3 text-center font-mono text-gray-700 text-[11px]">{fullMarks}</td>
                                  <td className="py-1.5 px-3 text-center font-mono font-black text-gray-950 text-xs">
                                    {sub.marks}
                                  </td>
                                  <td className="py-1.5 px-3 text-center font-mono font-bold text-emerald-950 text-[11px]">
                                    {sub.gradePoint.toFixed(2)}
                                  </td>
                                  <td className="py-1.5 px-3 text-center">
                                    <span
                                      className={`inline-block w-8 py-0.5 rounded font-black text-[10px] text-center ${
                                        sub.grade === 'A+'
                                          ? 'bg-emerald-100 text-emerald-950 border border-emerald-400'
                                          : sub.grade === 'A'
                                          ? 'bg-blue-100 text-blue-950 border border-blue-400'
                                          : 'bg-amber-100 text-amber-950 border border-amber-400'
                                      }`}
                                    >
                                      {sub.grade}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="bg-gray-100 font-bold text-[11px] border-t-2 border-gray-300 text-gray-950">
                            <tr>
                              <td colSpan={3} className="py-2 px-3 text-right">সর্বমোট প্রাপ্ত নম্বর ও অর্জিত ফলাফল:</td>
                              <td className="py-2 px-3 text-center font-mono font-black text-emerald-950 text-xs">
                                {searchedResult.totalMarks}
                              </td>
                              <td className="py-2 px-3 text-center font-mono font-black text-emerald-950 text-xs">
                                {searchedResult.gpa.toFixed(2)}
                              </td>
                              <td className="py-2 px-3 text-center font-black text-emerald-950 text-xs">
                                {searchedResult.grade}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    {/* Grading Scale & Remarks Section */}
                    <div className="pt-2.5 border-t-2 border-dashed border-gray-300 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-stretch text-xs">
                      {/* Left: Standard Grading Reference */}
                      <div className="sm:col-span-7 bg-[#f8fafc] p-2 rounded-lg border border-gray-300 text-[9.5px] text-gray-700 space-y-0.5">
                        <span className="font-bold text-gray-900 block text-[10px]">বাংলাদেশ শিক্ষা বোর্ড গ্রেডিং স্কেল:</span>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 leading-tight">
                          <span>৮০-১০০ = A+ (GP: ৫.০)</span>
                          <span>৭০-৭৯ = A (GP: ৪.০)</span>
                          <span>৬০-৬৯ = A- (GP: ৩.৫)</span>
                          <span>৫০-৫৯ = B (GP: ৩.০)</span>
                          <span>৪০-৪৯ = C (GP: ২.০)</span>
                          <span>৩৩-৩৯ = D (GP: ১.০)</span>
                          <span className="text-red-600 font-semibold col-span-2">০-৩২ = F (অকৃতকার্য, GP: ০.০)</span>
                        </div>
                      </div>

                      {/* Right: Institutional Remarks / Conduct */}
                      <div className="sm:col-span-5 bg-emerald-50/60 p-2 rounded-lg border border-emerald-300 text-[9.5px] text-emerald-950 flex flex-col justify-between">
                        <div>
                          <span className="font-bold block text-[10px] text-emerald-900">শ্রেণি শিক্ষকের মন্তব্য:</span>
                          <p className="mt-0.5 leading-tight text-gray-800">
                            "অত্যন্ত চমৎকার ও প্রশংসনীয় ফলাফল। প্রাতিষ্ঠানিক আচরণ ও নিয়মানুবর্তিতা সন্তোষজনক।"
                          </p>
                        </div>
                        <div className="mt-1.5 text-[8.5px] text-gray-500 text-right font-medium">
                          মূল্যায়ন স্ট্যাটাস: অতি উত্তম ★★★
                        </div>
                      </div>
                    </div>

                    {/* Institutional Signatures & Official Stamp */}
                    <div className="pt-2.5 border-t border-gray-200 grid grid-cols-2 gap-8 items-end text-xs">
                      {/* Left: Class Teacher Signature */}
                      <div className="text-center space-y-1">
                        <div className="h-8 flex items-end justify-center">
                          <span className="font-serif italic text-sm text-gray-700 tracking-wider">A. Rahman</span>
                        </div>
                        <div className="w-32 border-b-2 border-gray-600 mx-auto" />
                        <span className="text-[10.5px] font-bold text-gray-800 block">শ্রেণি শিক্ষকের স্বাক্ষর</span>
                        <span className="text-[9.5px] text-gray-500">তারিখ: ২৪/০২/২০২৬</span>
                      </div>

                      {/* Right: Headmaster Signature with Official Stamp Seal */}
                      <div className="text-center space-y-1 relative">
                        {/* Circular Institutional Stamp Seal Graphic */}
                        <div className="w-16 h-16 rounded-full border-2 border-emerald-900/80 p-1 mx-auto flex flex-col items-center justify-center transform -rotate-6 text-emerald-950 pointer-events-none mb-1 bg-emerald-50/30 shadow-2xs">
                          <div className="w-full h-full rounded-full border border-dashed border-emerald-800/70 flex flex-col items-center justify-center p-0.5 leading-none text-center">
                            <span className="text-[6.5px] font-black uppercase tracking-tighter">DADRA HIGH SCHOOL</span>
                            <span className="text-[7.5px] font-black text-emerald-900 my-0.5">★ SEAL ★</span>
                            <span className="text-[6.5px] font-bold uppercase tracking-tight text-emerald-800">JOYPURHAT</span>
                          </div>
                        </div>
                        <div className="w-36 border-b-2 border-gray-700 mx-auto" />
                        <span className="text-[10.5px] font-bold text-gray-950 block">প্রধান শিক্ষকের স্বাক্ষর ও সীল</span>
                        <span className="text-[9.5px] text-gray-600 font-medium">দাদরা উচ্চ বিদ্যালয়, জয়পুরহাট</span>
                      </div>
                    </div>

                    {/* Document Footer Security & Verification Bar */}
                    <div className="pt-2 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-[9.5px] text-gray-500 font-medium">
                      <span>* এটি একটি কম্পিউটার জেনারেটেড প্রাতিষ্ঠানিক ডিজিটাল প্রতিলিপি।</span>
                      <span className="font-mono text-gray-600 font-semibold">
                        যাচাই কোড: DHS-VERIFIED-2026-R{searchedResult.roll}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-rose-100 shadow-md p-8 text-center space-y-4 max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border-2 border-rose-200 shadow-inner">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">কোনো ফলাফল পাওয়া যায়নি</h4>
                  <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto mt-2 leading-relaxed">
                    আপনার প্রদানকৃত তথ্যের সাথে মিলিয়ে কোনো প্রকাশিত ফলাফল পাওয়া যায়নি।
                  </p>
                </div>

                {/* Searched Criteria Summary Box */}
                {lastSearchedCriteria && (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-left max-w-md mx-auto space-y-2">
                    <span className="font-bold text-gray-700 block border-b border-gray-200 pb-1.5">
                      অনুসন্ধানকৃত বিবরণ:
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-gray-600">
                      <div>
                        <span className="text-gray-400 block text-[10px]">রোল নম্বর:</span>
                        <span className="font-semibold text-gray-900">{lastSearchedCriteria.roll}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">নির্বাচিত শ্রেণি:</span>
                        <span className="font-semibold text-gray-900">{lastSearchedCriteria.studentClass}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">পরীক্ষার নাম:</span>
                        <span className="font-semibold text-gray-900 truncate block" title={lastSearchedCriteria.examTerm}>
                          {lastSearchedCriteria.examTerm}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Helpful Validation Guideline */}
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-[11.5px] text-amber-900 text-left max-w-md mx-auto leading-relaxed flex items-start gap-2">
                  <span className="text-sm">⚠️</span>
                  <span>
                    <strong>ডেটা ভ্যালিডেশন নিয়ম:</strong> ফলাফল দেখার জন্য শিক্ষার্থীর রোল নম্বর, শ্রেণি এবং সংশ্লিষ্ট পরীক্ষার নাম — এই তিনটি তথ্যই অবিকল সঠিক হতে হবে। যেকোনো একটি তথ্য অমিল থাকলে ফলাফল দেখা যাবে না।
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
