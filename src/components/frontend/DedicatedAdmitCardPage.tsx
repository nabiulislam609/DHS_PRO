import React, { useState, useMemo, useEffect } from 'react';
import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { generatePdfFromElement } from '../../utils/universalPdfGenerator';
import { useSchool } from '../../context/SchoolContext';
import { SiteHeader } from './SiteHeader';
import { PageHero } from './PageHero';
import { SiteFooter } from './SiteFooter';
import { Student, ActiveExam } from '../../types';
import {
  CreditCard,
  Search,
  Bookmark,
  Printer,
  Download,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  X,
  ArrowLeft,
  Calendar,
  FileCheck,
  ShieldCheck,
  User,
  GraduationCap,
  BookOpen,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import {
  CLASS_OPTIONS,
  GROUP_OPTIONS,
  isClassWithGroups,
  getElectivesForClassAndGroup,
  validateSubjectsForClassAndGroup,
  getSubjectCode,
} from '../../data/curriculumSubjects';
import { getStudentResultImage } from '../../utils/studentPhoto';
import {
  getEligibleClassesText,
  getEnrolledStudentCount,
  getExamRoutineSchedule,
  printExamSchedule,
  downloadExamRoutinePdf,
} from '../../utils/examDocumentHelper';
import { Footer } from './Footer';

export const DedicatedAdmitCardPage: React.FC = () => {
  const { siteSettings, students, admitCardConfig, setCurrentFrontendPage } = useSchool();

  const [selectedClass, setSelectedClass] = useState('১০ম শ্রেণি');
  const [selectedGroup, setSelectedGroup] = useState('বিজ্ঞান');
  const [rollInput, setRollInput] = useState('');
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [searched, setSearched] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [selectedElective, setSelectedElective] = useState<string>('');
  const [viewingExamRoutine, setViewingExamRoutine] = useState<ActiveExam | null>(null);
  const [isDownloadingRoutinePdf, setIsDownloadingRoutinePdf] = useState(false);

  // Class normalization helper
  const normalizeCls = (cls: string) => {
    const c = String(cls || '').toLowerCase();
    if (c.includes('১০') || c.includes('10')) return '10';
    if (c.includes('৯') || c.includes('9')) return '9';
    if (c.includes('৮') || c.includes('8')) return '8';
    if (c.includes('৭') || c.includes('7')) return '7';
    if (c.includes('৬') || c.includes('6')) return '6';
    return c.trim();
  };

  const isExamEligibleForClass = (exam: ActiveExam, targetClass: string) => {
    if (
      !exam.eligibleClasses ||
      exam.eligibleClasses.length === 0 ||
      exam.eligibleClasses.includes('all') ||
      exam.eligibleClasses.includes('সকল শ্রেণি')
    ) {
      return true;
    }
    const tNorm = normalizeCls(targetClass);
    return exam.eligibleClasses.some(
      (ec: string) => normalizeCls(ec) === tNorm || ec.includes(targetClass) || targetClass.includes(ec)
    );
  };

  // All active exams configured in backend
  const allActiveExams = useMemo(() => {
    if (admitCardConfig?.isActive === false) return [];
    const list = (admitCardConfig?.availableExams || []).filter((e) => e.isActive);
    if (list.length > 0) return list;
    if (admitCardConfig?.examTerm) {
      return [
        {
          id: 'default',
          examTerm: admitCardConfig.examTerm,
          examYear: admitCardConfig.examYear || '২০২৬',
          examStartDate: admitCardConfig.examStartDate || '২০ অক্টোবর ২০২৬',
          isActive: true,
          eligibleClasses: ['৬ষ্ঠ শ্রেণি', '৭ম শ্রেণি', '৮ম শ্রেণি', '৯ম শ্রেণি', '১০ম শ্রেণি'],
        },
      ];
    }
    return [];
  }, [admitCardConfig]);

  // Active exams that are held for the currently selected class
  const activeExamsForSelectedClass = useMemo(() => {
    return allActiveExams.filter((ex) => isExamEligibleForClass(ex, selectedClass));
  }, [allActiveExams, selectedClass]);

  // Exam Term Selection State in the search form
  const [selectedExamTerm, setSelectedExamTerm] = useState<string>(() => {
    const defaultActive = (admitCardConfig?.availableExams || []).find((e) => e.isActive)?.examTerm;
    return defaultActive || admitCardConfig?.examTerm || 'Pre-Test Examination (2026)';
  });

  // Keep selectedExamTerm synced if activeExams for current class change
  useEffect(() => {
    if (activeExamsForSelectedClass.length > 0) {
      const alreadyValid = activeExamsForSelectedClass.some(
        (e) => e.examTerm === selectedExamTerm
      );
      if (!alreadyValid) {
        setSelectedExamTerm(activeExamsForSelectedClass[0].examTerm);
      }
    } else if (allActiveExams.length > 0) {
      const alreadyValid = allActiveExams.some((e) => e.examTerm === selectedExamTerm);
      if (!alreadyValid) {
        setSelectedExamTerm(allActiveExams[0].examTerm);
      }
    }
  }, [activeExamsForSelectedClass, allActiveExams, selectedClass]);

  // Current active exam object matching selected term
  const currentExam = useMemo(() => {
    if (activeExamsForSelectedClass.length > 0) {
      const found = activeExamsForSelectedClass.find(
        (e) =>
          e.examTerm === selectedExamTerm ||
          e.examTerm.includes(selectedExamTerm) ||
          selectedExamTerm.includes(e.examTerm)
      );
      if (found) return found;
      return activeExamsForSelectedClass[0];
    }
    const foundAll = allActiveExams.find(
      (e) =>
        e.examTerm === selectedExamTerm ||
        e.examTerm.includes(selectedExamTerm) ||
        selectedExamTerm.includes(e.examTerm)
    );
    return foundAll || null;
  }, [activeExamsForSelectedClass, allActiveExams, selectedExamTerm]);

  // Fallback activeExam for compatibility
  const activeExam = currentExam;

  // Empty/Not Found message reason (matching Results page style)
  const [notFoundReason, setNotFoundReason] = useState<string>('');

  // Available Exam Options for the dropdown
  const examTermOptions = useMemo(() => {
    const list: { label: string; value: string; isActive: boolean; isForCurrentClass: boolean }[] = [];
    const addedExams = admitCardConfig?.availableExams || [];

    if (addedExams.length > 0) {
      addedExams.forEach((ex) => {
        const isOnline = ex.isActive && admitCardConfig?.isActive !== false;
        const isEligible = isExamEligibleForClass(ex, selectedClass);
        let badge = '';
        if (isOnline) {
          badge = isEligible
            ? '● (আপনার শ্রেণির জন্য সক্রিয়)'
            : '○ (অন্য শ্রেণির জন্য সক্রিয়)';
        } else {
          badge = '✕ (নিষ্ক্রিয়)';
        }
        list.push({
          label: `${ex.examTerm} ${badge}`,
          value: ex.examTerm,
          isActive: isOnline,
          isForCurrentClass: isEligible,
        });
      });
    } else if (admitCardConfig?.examTerm) {
      const isOnline = admitCardConfig.isActive !== false;
      list.push({
        label: `${admitCardConfig.examTerm} ${isOnline ? '(সক্রিয়)' : '(নিষ্ক্রিয়)'}`,
        value: admitCardConfig.examTerm,
        isActive: isOnline,
        isForCurrentClass: true,
      });
    }

    return list;
  }, [admitCardConfig?.availableExams, admitCardConfig?.examTerm, admitCardConfig?.isActive, selectedClass]);

  const isClass910 = isClassWithGroups(selectedClass);

  // Available electives for current class and group
  const availableElectives = useMemo(() => {
    return getElectivesForClassAndGroup(selectedClass, isClass910 ? selectedGroup : 'সাধারণ');
  }, [selectedClass, selectedGroup, isClass910]);

  // Sync elective when class or group changes
  useEffect(() => {
    if (availableElectives.length > 0 && !availableElectives.includes(selectedElective)) {
      setSelectedElective(availableElectives[0]);
    }
  }, [availableElectives, selectedElective]);

  // Validation details computation
  const validationDetails = useMemo(() => {
    return validateSubjectsForClassAndGroup(
      selectedClass,
      isClass910 ? selectedGroup : 'সাধারণ',
      foundStudent?.subjects
    );
  }, [selectedClass, selectedGroup, isClass910, foundStudent?.subjects]);

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
    if (g.includes('ব্যবসায়') || g.includes('ব্যবসায়') || g.includes('commerce') || g.includes('business')) return 'ব্যবসায় শিক্ষা';
    return 'সাধারণ';
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedExam = (selectedExamTerm || '').trim();
    const trimmedRoll = rollInput.trim();

    // 1. Basic field validation
    if (!trimmedRoll) {
      setInputError('শ্রেণির রোল নম্বর প্রদান করুন।');
      setSearched(false);
      return;
    }

    const isDigitsOnly = /^[\d০-৯]+$/.test(trimmedRoll);
    if (!isDigitsOnly) {
      setInputError('রোল নম্বরে শুধুমাত্র সংখ্যা লিখুন।');
      setSearched(false);
      return;
    }

    if (!selectedClass) {
      setInputError('শ্রেণি নির্বাচন করুন।');
      setSearched(false);
      return;
    }

    if (!trimmedExam) {
      setInputError('পরীক্ষার নাম নির্বাচন করুন।');
      setSearched(false);
      return;
    }

    // 2. Check active exams for selected class
    if (admitCardConfig?.isActive === false || allActiveExams.length === 0 || activeExamsForSelectedClass.length === 0) {
      setInputError(null);
      setFoundStudent(null);
      setSearched(true);
      setNotFoundReason(`বর্তমানে ${selectedClass}-এর জন্য কোনো সক্রিয় পরীক্ষা নির্ধারিত নেই।`);
      return;
    }

    const matchingExamForClass = activeExamsForSelectedClass.find(
      (ex) =>
        ex.examTerm.trim().toLowerCase() === trimmedExam.toLowerCase() ||
        ex.examTerm.trim().includes(trimmedExam) ||
        trimmedExam.includes(ex.examTerm.trim())
    );

    if (!matchingExamForClass) {
      setInputError(null);
      setFoundStudent(null);
      setSearched(true);
      setNotFoundReason(`"${trimmedExam}" পরীক্ষাটি বর্তমানে ${selectedClass}-এর জন্য সক্রিয় নয়।`);
      return;
    }

    const rollNorm = normalizeNum(trimmedRoll);
    const clsNorm = normalizeClassName(selectedClass);

    // Exact match in selected class & group from database
    const match = students.find((s) => {
      const sRoll = normalizeNum(s.roll);
      if (sRoll !== rollNorm) return false;

      const sClass = normalizeClassName(s.class || s.studentClass || '');
      if (sClass !== clsNorm) return false;

      if (clsNorm === '9' || clsNorm === '10') {
        const sGrp = s.group || (s.section?.includes('বিজ্ঞান') ? 'বিজ্ঞান' : s.section?.includes('মানবিক') ? 'মানবিক' : s.section?.includes('ব্যবসায়') || s.section?.includes('ব্যবসায়') ? 'ব্যবসায় শিক্ষা' : '');
        if (sGrp) {
          return normalizeGroup(sGrp) === normalizeGroup(selectedGroup);
        }
      }
      return true;
    });

    if (match) {
      setInputError(null);
      setSearched(true);
      setFoundStudent(match);
      setNotFoundReason('');

      // Detect elective subject from student's registered subjects
      if (match.subjects && match.subjects.length > 0) {
        const matchedElec = availableElectives.find((elec) =>
          match!.subjects!.some((s) => s.toLowerCase().includes(elec.toLowerCase()))
        );
        if (matchedElec) {
          setSelectedElective(matchedElec);
        }
      }
    } else {
      setFoundStudent(null);
      setSearched(true);
      setInputError(null);
      setNotFoundReason('সঠিক রোল নম্বর ও শ্রেণি মিলিয়ে পুনরায় অনুসন্ধান করুন।');
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
    try {
      const studentName = (foundStudent?.name || 'Student').replace(/[\s/\\?%*:|"<>]/g, '_').slice(0, 30);
      const fileName = `Admit_Card_${studentName}_Roll_${rollInput || 'Admit'}.pdf`;

      const ok = await generatePdfFromElement(el, {
        orientation: 'portrait',
        docKind: 'certificate',
        fileName,
      });

      if (!ok) {
        window.print();
      }
    } catch (err) {
      console.error('Admit card PDF error:', err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Build the certified validated subject list for this student and class
  const activeValidatedSubjects = useMemo(() => {
    const baseList = validationDetails.validatedSubjectList;
    if (selectedElective && availableElectives.includes(selectedElective)) {
      return baseList.map((item) => {
        if (item.type === 'elective') {
          return {
            ...item,
            name: selectedElective,
            code: getSubjectCode(selectedElective),
          };
        }
        return item;
      });
    }
    return baseList;
  }, [validationDetails.validatedSubjectList, selectedElective, availableElectives]);

  // Generate official exam schedule routine for ALL validated subjects
  const examSubjectsRoutine = useMemo(() => {
    const configuredStart = currentExam?.examStartDate?.trim() || admitCardConfig?.examStartDate?.trim();
    let startDay = 20;
    let startMonth = 9; // October (0-indexed)
    let startYear = 2026;

    if (configuredStart) {
      const bnToEn: Record<string, string> = {
        '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
        '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
      };
      const normalizedStr = configuredStart.replace(/[০-৯]/g, (d) => bnToEn[d] || d);
      const matchNumbers = normalizedStr.match(/\d+/g);
      if (matchNumbers && matchNumbers.length > 0) {
        const parsedDay = parseInt(matchNumbers[0], 10);
        if (parsedDay > 0 && parsedDay <= 31) startDay = parsedDay;
        if (matchNumbers.length > 1) {
          const parsedYear = parseInt(matchNumbers[matchNumbers.length - 1], 10);
          if (parsedYear >= 2020 && parsedYear <= 2040) startYear = parsedYear;
        }
      }
    }

    const bnMonths = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const enToBnDigits = (n: number) => {
      const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      return String(n).replace(/\d/g, (d) => bnDigits[Number(d)]);
    };

    return activeValidatedSubjects.map((subItem, idx) => {
      const dayOffset = idx * 2;
      const examDate = new Date(startYear, startMonth, startDay + dayOffset);
      const dayBn = enToBnDigits(examDate.getDate());
      const monthBn = bnMonths[examDate.getMonth()];
      const yearBn = enToBnDigits(examDate.getFullYear());
      const dateFormatted = `${dayBn} ${monthBn} ${yearBn}`;

      const isIct = subItem.name.includes('তথ্য ও যোগাযোগ') || subItem.name.includes('ICT');
      const configuredTime = currentExam?.examTime?.trim() || admitCardConfig?.examTime?.trim();
      const timeStr = isIct ? 'সকাল ১০:০০ - দুপুর ১২:০০' : (configuredTime || 'সকাল ১০:০০ - দুপুর ০১:০০');

      return {
        serial: idx + 1,
        code: subItem.code,
        subject: subItem.name,
        type: subItem.type,
        typeLabel: subItem.typeLabel,
        date: dateFormatted,
        time: timeStr,
      };
    });
  }, [activeValidatedSubjects, currentExam?.examStartDate, currentExam?.examTime, admitCardConfig?.examStartDate, admitCardConfig?.examTime]);

  const studentImage = foundStudent
    ? foundStudent.image || getStudentResultImage({ studentName: foundStudent.name, roll: foundStudent.roll, studentId: foundStudent.id }, students)
    : '';

  return (
    <div className="min-h-screen bg-[#F6F7F5] text-[#14211B] flex flex-col font-sans subpage-fade-in">
      {/* Top Institutional Header */}
      <SiteHeader pageName="অনলাইন অ্যাডমিট কার্ড" />

      {/* Unified PageHero Banner */}
      <PageHero
        title="অনলাইন পরীক্ষার প্রবেশপত্র (অ্যাডমিট কার্ড)"
        description="সঠিক পরীক্ষার নাম, শ্রেণি ও রোল নম্বর দিয়ে প্রবেশপত্র ও পরীক্ষার সময়সূচি যাচাই করুন এবং অফিশিয়াল কপি ডাউনলোড ও সরাসরি প্রিন্ট করুন।"
        badgeText="অনলাইন পরীক্ষা ব্যবস্থাপনা ও প্রবেশপত্র পোর্টাল"
        badgeIcon={<Bookmark className="w-3.5 h-3.5 text-emerald-300" />}
        breadcrumbs={[{ label: 'অ্যাডমিট কার্ড' }]}
      />

      {/* Main Content Area - Overlapping Hero Banner with -mt-16 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 space-y-6 -mt-16 relative z-20 pb-16 flex-1 w-full">
        {/* Global Inactive Warning if no exam is active */}
        {(allActiveExams.length === 0 || admitCardConfig?.isActive === false) && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs px-4 py-3 rounded-2xl flex items-center gap-2.5 print:hidden shadow-xs">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>বর্তমানে বিদ্যালয়ে কোনো পরীক্ষা অনুষ্ঠিত হচ্ছে না বা প্রবেশপত্র ডাউনলোড সাময়িকভাবে স্থগিত রয়েছে।</span>
          </div>
        )}

        {/* Search Student Examination Record Card */}
        <div id="admit-search-card" className="bg-white rounded-2xl border border-[#E2E8E4] shadow-md p-6 sm:p-8 space-y-5 print:hidden">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#E2E8E4] pb-4">
            <div className="flex items-center gap-2.5 text-[#14211B] font-bold text-base sm:text-lg">
              <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] text-[#0B7A55] flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <span>শিক্ষার্থীর পরীক্ষার প্রবেশপত্র অনুসন্ধান করুন</span>
            </div>
            <span className="text-xs text-[#5B6B63] font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
              * পরীক্ষার নাম, শ্রেণি ও রোল নম্বর আবশ্যক
            </span>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            {/* 4 Fields Grid - Clean 2x2 or 4-column layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
              {/* Field: Roll Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  শ্রেণির রোল নম্বর <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ১, ২, ৩... (e.g. 1, 2, 3)"
                  value={rollInput}
                  onChange={(e) => {
                    setRollInput(e.target.value);
                    setInputError(null);
                    setSearched(false);
                    setFoundStudent(null);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition h-11 ${
                    inputError && !rollInput.trim()
                      ? 'border-2 border-red-500 bg-red-50/40 text-red-900 placeholder-red-400 focus:outline-hidden focus:border-red-600'
                      : 'bg-gray-50/70 border border-[#E2E8E4] text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-[#0B7A55] focus:bg-white'
                  }`}
                />
              </div>

              {/* Field: Class */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  শ্রেণি নির্বাচন করুন <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setInputError(null);
                    setSearched(false);
                    setFoundStudent(null);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer transition bg-gray-50/70 border border-[#E2E8E4] text-gray-800 focus:outline-hidden focus:border-[#0B7A55] focus:bg-white h-11"
                >
                  {CLASS_OPTIONS.map((cls, idx) => (
                    <option key={idx} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* Field: Group (if class 9/10) or Info */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  শাখা / বিভাগ {isClass910 && <span className="text-red-500">*</span>}
                </label>
                {isClass910 ? (
                  <select
                    value={selectedGroup}
                    onChange={(e) => {
                      setSelectedGroup(e.target.value);
                      setInputError(null);
                      setSearched(false);
                      setFoundStudent(null);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer transition bg-gray-50/70 border border-[#E2E8E4] text-gray-800 focus:outline-hidden focus:border-[#0B7A55] focus:bg-white h-11"
                  >
                    {GROUP_OPTIONS.map((grp, idx) => (
                      <option key={idx} value={grp}>{grp} বিভাগ</option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-100/70 border border-[#E2E8E4] text-gray-500 flex items-center h-11">
                    সাধারণ (সকল বিষয়)
                  </div>
                )}
              </div>

              {/* Field: Exam Term - Fully visible without truncation */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  পরীক্ষার নাম / টার্ম <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedExamTerm}
                  onChange={(e) => {
                    setSelectedExamTerm(e.target.value);
                    setInputError(null);
                    setSearched(false);
                    setFoundStudent(null);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer transition bg-gray-50/70 border border-[#E2E8E4] text-gray-800 focus:outline-hidden focus:border-[#0B7A55] focus:bg-white h-11 min-w-0"
                >
                  <option value="">-- পরীক্ষার নাম নির্বাচন করুন --</option>
                  {examTermOptions.map((term, idx) => (
                    <option key={idx} value={term.value}>
                      {term.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Validation Error in Bengali */}
            {inputError && (
              <p className="text-xs text-red-600 font-semibold flex items-center gap-1.5 bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{inputError}</span>
              </p>
            )}

            {/* Primary Submit Button on single line */}
            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto min-w-[200px] h-11 bg-[#0B7A55] hover:bg-[#064E3B] text-white py-2.5 px-6 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs hover:shadow-md cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>প্রবেশপত্র অনুসন্ধান করুন</span>
              </button>
            </div>
          </form>

          {/* Search Result Summary Card when found */}
          {searched && foundStudent && (
            <div className="pt-2">
              <div className="bg-[#E8F5EE] border border-[#0B7A55]/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-[#064E3B] shadow-xs animate-fadeIn">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#0B7A55] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#14211B]">
                      {foundStudent.name} (রোল: {foundStudent.roll})
                    </h3>
                    <p className="text-xs text-[#5B6B63] mt-0.5">
                      শ্রেণি: {selectedClass} {selectedGroup ? `(${selectedGroup} বিভাগ)` : ''} · {selectedExamTerm || currentExam?.examTerm || 'বার্ষিক পরীক্ষা'}
                    </p>
                  </div>
                </div>

                {/* Action buttons: PDF filled green, Print outline */}
                <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloadingPdf}
                    className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-[#0B7A55] hover:bg-[#064E3B] text-white rounded-xl font-bold text-xs shadow-xs hover:shadow-md transition cursor-pointer disabled:opacity-50 min-w-[120px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isDownloadingPdf ? 'তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-white border-2 border-[#0B7A55] text-[#064E3B] hover:bg-[#E8F5EE] rounded-xl font-bold text-xs shadow-2xs transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>প্রিন্ট</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3-Step Guide Card when not searched yet */}
        {!searched && (
          <div className="bg-white rounded-2xl border border-[#E2E8E4] p-6 sm:p-8 space-y-6 print:hidden shadow-xs">
            <div className="text-center max-w-lg mx-auto space-y-1.5">
              <span className="text-[11px] font-bold text-[#0B7A55] tracking-wider uppercase bg-[#E8F5EE] px-3 py-1 rounded-full">
                সহজ ৩ ধাপের নির্দেশিকা
              </span>
              <h3 className="text-lg font-bold text-[#14211B] pt-1">
                প্রবেশপত্র সংগ্রহের সহজ নিয়মাবলী
              </h3>
              <p className="text-xs text-[#5B6B63] leading-relaxed">
                অনলাইনে মাত্র ৩টি তথ্য প্রদান করে পরীক্ষার অফিশিয়াল প্রবেশপত্র ডাউনলোড ও প্রিন্ট করুন।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-gray-50/80 rounded-xl p-4 border border-[#E2E8E4] text-center space-y-2 hover:border-[#0B7A55]/40 transition">
                <div className="w-10 h-10 rounded-full bg-[#E8F5EE] text-[#0B7A55] font-black text-sm flex items-center justify-center mx-auto">
                  ১
                </div>
                <h4 className="font-bold text-sm text-[#14211B]">শ্রেণি বাছুন</h4>
                <p className="text-xs text-[#5B6B63] leading-relaxed">
                  ড্রপডাউন তালিকা থেকে শিক্ষার্থীর অধ্যয়নরত শ্রেণি ও বিভাগ নির্বাচন করুন।
                </p>
              </div>

              <div className="bg-gray-50/80 rounded-xl p-4 border border-[#E2E8E4] text-center space-y-2 hover:border-[#0B7A55]/40 transition">
                <div className="w-10 h-10 rounded-full bg-[#E8F5EE] text-[#0B7A55] font-black text-sm flex items-center justify-center mx-auto">
                  ২
                </div>
                <h4 className="font-bold text-sm text-[#14211B]">রোল নম্বর দিন</h4>
                <p className="text-xs text-[#5B6B63] leading-relaxed">
                  শ্রেণি শিক্ষকের দেওয়া সঠিক ক্লাস রোল নম্বর ইনপুট বক্সে লিখুন।
                </p>
              </div>

              <div className="bg-gray-50/80 rounded-xl p-4 border border-[#E2E8E4] text-center space-y-2 hover:border-[#0B7A55]/40 transition">
                <div className="w-10 h-10 rounded-full bg-[#E8F5EE] text-[#0B7A55] font-black text-sm flex items-center justify-center mx-auto">
                  ৩
                </div>
                <h4 className="font-bold text-sm text-[#14211B]">পরীক্ষা বাছুন</h4>
                <p className="text-xs text-[#5B6B63] leading-relaxed">
                  চলতি পরীক্ষার নাম বাছাই করে অনুসন্ধান বাটনে ক্লিক করলেই কার্ড প্রস্তুত হবে।
                </p>
              </div>
            </div>

            <div className="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-200/60 text-xs text-emerald-900 flex items-start gap-2.5">
              <CreditCard className="w-4 h-4 text-[#0B7A55] shrink-0 mt-0.5" />
              <span>
                <strong>জরুরি নির্দেশনা:</strong> পরীক্ষা কক্ষে অবশ্যই প্রবেশপত্রের রঙ্গিন বা সাদাকালো স্পষ্ট প্রিন্ট কপি সঙ্গে আনতে হবে। কোনো অসঙ্গতি পরিলক্ষিত হলে দ্রুত শ্রেণি শিক্ষকের সাথে যোগাযোগ করুন।
              </span>
            </div>
          </div>
        )}

        {/* Not Found State - EXACTLY matching Results Page (Image 3) */}
        {searched && !foundStudent && (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sm:p-8 text-center space-y-4 max-w-md mx-auto print:hidden">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200/80 shadow-2xs">
              <Search className="w-6 h-6 text-amber-600" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-bold text-gray-900">কোনো প্রবেশপত্র পাওয়া যায়নি</h4>
              <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                {notFoundReason || 'সঠিক রোল নম্বর ও শ্রেণি মিলিয়ে পুনরায় অনুসন্ধান করুন।'}
              </p>
            </div>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setSearched(false);
                  setRollInput('');
                  setInputError(null);
                  setFoundStudent(null);
                  setNotFoundReason('');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                <span>নতুন অনুসন্ধান</span>
              </button>
            </div>
          </div>
        )}

        {/* Printable Official Admit Card Document (ONLY shown when student info is 100% correct) */}
        {searched && foundStudent && (
          <div className="space-y-4">
            {/* Top Action Bar & Elective Selector if applicable */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-emerald-200 print:hidden shadow-xs">
              <div>
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-700" />
                  <span>অফিসিয়াল প্রবেশপত্র প্রস্তুত</span>
                </span>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  শিক্ষার্থী: {foundStudent.name} • রোল: {foundStudent.roll} • {selectedClass} {isClass910 ? `(${selectedGroup} বিভাগ)` : ''}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* 4th Elective Selector for Class 9/10 if multiple electives available */}
                {availableElectives.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 text-xs">
                    <span className="text-[11px] font-bold text-emerald-900">৪র্থ বিষয়:</span>
                    <select
                      value={selectedElective}
                      onChange={(e) => setSelectedElective(e.target.value)}
                      className="bg-white border border-emerald-300 rounded-lg px-2 py-0.5 text-xs font-bold text-emerald-950 focus:outline-hidden"
                    >
                      {availableElectives.map((elec, idx) => (
                        <option key={idx} value={elec}>{elec}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>প্রিন্ট করুন</span>
                </button>
                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloadingPdf ? 'PDF তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
                </button>
              </div>
            </div>

            {/* Official Admit Card Paper Container */}
            <div
              id="printable-admit-card"
              className="bg-white rounded-2xl shadow-md border-2 border-emerald-800 p-5 sm:p-7 relative overflow-hidden"
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

              {/* School Header - Symmetrical Balanced Grid for 100% Exact Center Alignment */}
              <div className="text-center border-b-2 border-emerald-900 pb-3 mb-4 relative">
                <div className="grid grid-cols-[60px_1fr_60px] items-center mb-2">
                  <div className="flex justify-start">
                    <img
                      src={siteSettings.logoUrl || '/assets/aistudio/Logo_a3f5277a.png'}
                      alt="Logo"
                      className="w-13 h-13 rounded-full object-cover border-[2.5px] border-[#F59E0B] bg-[#00A859] shadow-2xs"
                    />
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight leading-tight">
                      {siteSettings.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়'}
                    </h2>
                    <p className="text-xs sm:text-sm font-bold text-gray-700 tracking-wide uppercase">
                      {siteSettings.schoolNameEnglish || 'Dadra High School'}
                    </p>
                    <p className="text-[10.5px] text-gray-500 font-medium mt-0.5">
                      {siteSettings.address || 'দাদরা, জয়পুরহাট সদর, জয়পুরহাট'} • স্থাপিত: {siteSettings.establishedYear || '১৯৮২'}
                    </p>
                  </div>
                  <div className="w-13" aria-hidden="true" />
                </div>

                {/* Admit Card Banner Title & Exam Title */}
                <div className="inline-block bg-[#064E3B] text-white px-6 py-0.5 rounded-full text-xs font-extrabold tracking-wide uppercase shadow-xs">
                  প্রবেশপত্র • ADMIT CARD
                </div>
                <p className="text-xs sm:text-sm font-bold text-emerald-950 mt-1">
                  {currentExam?.examTerm || selectedExamTerm || admitCardConfig?.examTerm || 'বার্ষিক পরীক্ষা'}
                </p>
              </div>

              {/* Student Details Grid & Photo */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 bg-emerald-50/50 p-3 sm:p-3.5 rounded-xl border border-emerald-200 mb-4">
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-xs">
                  <div>
                    <span className="block text-[10.5px] text-gray-500 font-medium">শিক্ষার্থীর নাম:</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {foundStudent?.name || ''}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10.5px] text-gray-500 font-medium">ক্লাস রোল:</span>
                    <span className="font-bold text-emerald-900 text-sm font-mono">
                      {foundStudent?.roll || rollInput}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10.5px] text-gray-500 font-medium">শিক্ষার্থী আইডি:</span>
                    <span className="font-bold text-gray-900 font-mono">
                      {foundStudent?.id || `DHS-2026-${foundStudent?.roll || '00'}`}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10.5px] text-gray-500 font-medium">শ্রেণি:</span>
                    <span className="font-bold text-gray-900">{selectedClass}</span>
                  </div>
                  <div>
                    <span className="block text-[10.5px] text-gray-500 font-medium">বিভাগ / শাখা:</span>
                    <span className="font-bold text-gray-900">
                      {isClass910 ? `${selectedGroup} বিভাগ` : 'সাধারণ পাঠ্যক্রম'} {foundStudent?.section ? `(${foundStudent.section})` : '(শাখা ক)'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10.5px] text-gray-500 font-medium">পিতা / অভিভাবক:</span>
                    <span className="font-bold text-gray-900 truncate block">
                      {foundStudent?.guardianName || foundStudent?.fatherName || 'অভিভাবক'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10.5px] text-gray-500 font-medium">শিক্ষাবর্ষ:</span>
                    <span className="font-bold text-gray-900">{currentExam?.examYear || admitCardConfig?.examYear || '২০২৬'}</span>
                  </div>
                  <div>
                    <span className="block text-[10.5px] text-gray-500 font-medium">নিরাপত্তা ও ডাটা ভ্যালিডেশন:</span>
                    <span className="font-bold text-emerald-700 text-[11px] flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>যাচাইকৃত • VERIFIED</span>
                    </span>
                  </div>
                </div>

                {/* Student Photo Frame */}
                <div className="w-22 h-26 border-2 border-emerald-800 rounded-lg overflow-hidden bg-white shadow-2xs shrink-0 flex items-center justify-center relative">
                  {studentImage ? (
                    <img src={studentImage} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2">
                      <User className="w-7 h-7 text-gray-300 mx-auto" />
                      <span className="text-[9px] text-gray-400 font-bold block mt-1">ছবি সংযুক্ত</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-emerald-900/80 text-white text-[8px] text-center py-0.5 font-bold">
                    যাচাইকৃত
                  </div>
                </div>
              </div>

              {/* Official NCTB Validated Exam Routine Table */}
              <div className="mb-4 overflow-hidden rounded-xl border border-gray-300">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-emerald-900 text-white text-[10.5px] uppercase tracking-wider font-bold">
                      <th className="py-1.5 px-2 border border-emerald-800 w-10 text-center">ক্র.নং</th>
                      <th className="py-1.5 px-2.5 border border-emerald-800 w-20 text-center">বিষয় কোড</th>
                      <th className="py-1.5 px-3 border border-emerald-800">পরীক্ষার বিষয়</th>
                      <th className="py-1.5 px-3 border border-emerald-800 w-32">তারিখ</th>
                      <th className="py-1.5 px-3 border border-emerald-800 w-44">সময়</th>
                      <th className="py-1.5 px-2 border border-emerald-800 text-center w-28">পরিদর্শকের স্বাক্ষর</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-800 font-medium">
                    {examSubjectsRoutine.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'}>
                        <td className="py-1.5 px-2 border border-gray-200 text-center font-mono text-[10.5px]">
                          {item.serial}
                        </td>
                        <td className="py-1.5 px-2.5 border border-gray-200 text-center font-mono font-bold text-emerald-900 text-[10.5px]">
                          {item.code}
                        </td>
                        <td className="py-1.5 px-3 border border-gray-200 font-bold text-gray-900 text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <span>{item.subject}</span>
                            {item.type === 'elective' && (
                              <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-normal">
                                ৪র্থ বিষয়
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-1.5 px-3 border border-gray-200 text-[10.5px]">
                          {item.date}
                        </td>
                        <td className="py-1.5 px-3 border border-gray-200 text-[10.5px]">
                          {item.time}
                        </td>
                        <td className="py-1.5 px-2 border border-gray-200 text-center text-gray-300">
                          —
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Instructions */}
              <div className="border border-emerald-200 rounded-xl p-3 bg-emerald-50/40 text-[10px] sm:text-[10.5px] text-gray-700 space-y-0.5 mb-5">
                <span className="font-bold text-emerald-950 block text-[11px] mb-0.5">
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

              {/* Unified Headmaster Signature Only */}
              <div className="flex items-end justify-between pt-4 border-t border-gray-300 text-xs text-gray-700">
                <div className="text-[10px] text-gray-500 space-y-0.5">
                  <p className="font-semibold text-emerald-900">
                    * প্রবেশপত্রটি ডিজিটাল ভেরিফাইড ও সংরক্ষিত।
                  </p>
                  <p>মুদ্রণ তারিখ: {new Date().toLocaleDateString('bn-BD')}</p>
                </div>

                <div className="text-center min-w-[170px] space-y-1">
                  {siteSettings.headmasterSignatureUrl ? (
                    <img
                      src={siteSettings.headmasterSignatureUrl}
                      alt="প্রধান শিক্ষকের স্বাক্ষর"
                      className="h-10 max-w-[140px] mx-auto object-contain mb-0.5"
                    />
                  ) : (
                    <div className="font-serif italic text-emerald-950 text-sm font-bold opacity-90 mb-0.5">
                      {siteSettings.headmasterName || 'মো: সাদেকুল ইসলাম'}
                    </div>
                  )}
                  <div className="w-36 border-b-2 border-emerald-950 mx-auto mb-1" />
                  <span className="font-bold text-gray-900 text-xs block">
                    {siteSettings.headmasterName || 'মো: সাদেকুল ইসলাম'}
                  </span>
                  <span className="font-medium text-[11px] text-gray-700 block">
                    {siteSettings.headmasterDesignation || 'প্রধান শিক্ষক'}
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    {siteSettings.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Exam Routine & Notice Modal for Frontend */}
      {viewingExamRoutine && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
                  <Calendar className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base sm:text-lg text-white">
                      {viewingExamRoutine.examTerm}
                    </h3>
                    <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-bold">
                      ● সক্রিয় পরীক্ষা
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    শিক্ষাবর্ষ: {viewingExamRoutine.examYear} • পরীক্ষা শুরুর তারিখ: {viewingExamRoutine.examStartDate}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingExamRoutine(null)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <span className="text-[11px] text-emerald-800 font-bold block">প্রযোজ্য শ্রেণি:</span>
                  <div className="font-bold text-gray-900 text-xs mt-1">
                    {getEligibleClassesText(viewingExamRoutine)}
                  </div>
                </div>
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <span className="text-[11px] text-blue-800 font-bold block">প্রবেশপত্র সংগ্রহ:</span>
                  <div className="font-bold text-emerald-800 text-xs mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>অনলাইনে উন্মুক্ত রয়েছে</span>
                  </div>
                </div>
              </div>

              {viewingExamRoutine.description && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
                  <span className="font-bold text-gray-900 block mb-0.5">পরীক্ষার বিবরণ / বিশেষ নির্দেশনা:</span>
                  <p>{viewingExamRoutine.description}</p>
                </div>
              )}

              {/* Routine Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>পরীক্ষার সময়সূচি ও বিষয়ভিত্তিক রুটিন (Exam Schedule):</span>
                  </h4>
                  <span className="text-[11px] text-gray-500">পরীক্ষার কেন্দ্র: বিদ্যালয় ক্যাম্পাস</span>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                        <th className="py-2.5 px-3 w-10 text-center">ক্রম</th>
                        <th className="py-2.5 px-3">তারিখ ও বার</th>
                        <th className="py-2.5 px-3">বিষয় ও বিষয় কোড</th>
                        <th className="py-2.5 px-3 text-center">সময়</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {getExamRoutineSchedule(viewingExamRoutine).map((item) => (
                        <tr key={item.sl} className="hover:bg-gray-50">
                          <td className="py-2 px-3 text-center font-bold text-gray-500">{item.sl}</td>
                          <td className="py-2 px-3 font-medium text-gray-800">
                            <div>{item.date}</div>
                            <div className="text-[10px] text-gray-500">{item.day}</div>
                          </td>
                          <td className="py-2 px-3 font-bold text-gray-900">
                            {item.subject}{' '}
                            <span className="text-[10px] font-normal text-gray-500">({item.subjectCode})</span>
                          </td>
                          <td className="py-2 px-3 text-center font-medium text-emerald-800">{item.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => printExamSchedule(viewingExamRoutine, siteSettings, students)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold border border-gray-300 transition shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-700" />
                  <span>রুটিন প্রিন্ট করুন</span>
                </button>
                <button
                  type="button"
                  disabled={isDownloadingRoutinePdf}
                  onClick={async () => {
                    setIsDownloadingRoutinePdf(true);
                    try {
                      await downloadExamRoutinePdf(viewingExamRoutine, siteSettings, students);
                    } catch (err) {
                      console.error('Download error:', err);
                    } finally {
                      setIsDownloadingRoutinePdf(false);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isDownloadingRoutinePdf ? 'ডাউনলোড হচ্ছে...' : 'রুটিন PDF ডাউনলোড'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const ex = viewingExamRoutine;
                    setSelectedExamTerm(ex.examTerm);
                    if (ex.eligibleClasses && ex.eligibleClasses.length > 0) {
                      setSelectedClass(ex.eligibleClasses[0]);
                    }
                    setViewingExamRoutine(null);
                    const el = document.getElementById('admit-search-card');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>এই পরীক্ষার প্রবেশপত্র খুঁজুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingExamRoutine(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Website Footer */}
      <Footer />

      {/* Print Specific CSS with Narrow Margin and A4 Single-Page Fit */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
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
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 16px !important;
            box-shadow: none !important;
            border: 2px solid #064e3b !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}} />
    </div>
  );
};
