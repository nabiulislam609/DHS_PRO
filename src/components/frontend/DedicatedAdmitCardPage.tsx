import React, { useState, useMemo, useEffect } from 'react';
import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useSchool } from '../../context/SchoolContext';
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

  // Popup Modal State for "এখন কোনো পরীক্ষা অনুষ্ঠিত হচ্ছে না"
  const [noExamPopup, setNoExamPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: 'এখন কোনো পরীক্ষা অনুষ্ঠিত হচ্ছে না',
    message: '',
  });

  // Popup Modal State for "তথ্য ভুল / তথ্য মেলেনি" (Strict validation popup without any suggestions)
  const [infoWrongPopup, setInfoWrongPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: 'তথ্য সঠিক নয়',
    message: '',
  });

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

    // 1. Check if ANY exam is active in backend or master switch is off
    if (admitCardConfig?.isActive === false || allActiveExams.length === 0) {
      setNoExamPopup({
        isOpen: true,
        title: 'এখন কোনো পরীক্ষা অনুষ্ঠিত হচ্ছে না',
        message: 'বর্তমানে বিদ্যালয়ে কোনো পরীক্ষা অনুষ্ঠিত হচ্ছে না এবং প্রবেশপত্র ডাউনলোডের সময়সূচি এখনও নির্ধারণ করা হয়নি। বিদ্যালয়ের পরবর্তী নোটিশের জন্য অপেক্ষা করুন।',
      });
      setFoundStudent(null);
      setSearched(false);
      return;
    }

    // 2. Check if selected class has any active exam
    if (activeExamsForSelectedClass.length === 0) {
      setNoExamPopup({
        isOpen: true,
        title: 'এখন কোনো পরীক্ষা অনুষ্ঠিত হচ্ছে না',
        message: `বর্তমানে ${selectedClass}-এর জন্য কোনো সক্রিয় পরীক্ষা নির্ধারিত নেই। বিদ্যালয়ের পরবর্তী নোটিশের জন্য অপেক্ষা করুন।`,
      });
      setInputError(`বর্তমানে ${selectedClass}-এর জন্য কোনো পরীক্ষা অনুষ্ঠিত হচ্ছে না।`);
      setFoundStudent(null);
      setSearched(true);
      return;
    }

    // 3. Validate Exam Term selection
    const trimmedExam = (selectedExamTerm || '').trim();
    if (!trimmedExam) {
      setInputError('অনুগ্রহ করে পরীক্ষার নাম (Exam Term) নির্বাচন করুন।');
      setSearched(true);
      setFoundStudent(null);
      setInfoWrongPopup({
        isOpen: true,
        title: 'পরীক্ষার নাম নির্বাচন করুন',
        message: 'প্রবেশপত্র পাওয়ার জন্য পরীক্ষার নাম (Exam Term) নির্বাচন করা বাধ্যতামূলক।',
      });
      return;
    }

    // Strict validation: Does selected exam match an active exam eligible for this class?
    const matchingExamForClass = activeExamsForSelectedClass.find(
      (ex) =>
        ex.examTerm.trim().toLowerCase() === trimmedExam.toLowerCase() ||
        ex.examTerm.trim().includes(trimmedExam) ||
        trimmedExam.includes(ex.examTerm.trim())
    );

    if (!matchingExamForClass) {
      setNoExamPopup({
        isOpen: true,
        title: 'পরীক্ষা সক্রিয় নয়',
        message: `"${trimmedExam}" পরীক্ষাটি বর্তমানে ${selectedClass}-এর জন্য সক্রিয় নয় অথবা অনুষ্ঠিত হচ্ছে না। ব্যাকএন্ডে যে পরীক্ষাগুলো সক্রিয় রয়েছে শুধুমাত্র সেগুলোর প্রবেশপত্র সংগ্রহ করা যাবে।`,
      });
      setInputError(`"${trimmedExam}" পরীক্ষাটি ${selectedClass}-এর জন্য সক্রিয় নয়।`);
      setSearched(true);
      setFoundStudent(null);
      return;
    }

    const trimmedRoll = rollInput.trim();
    if (!trimmedRoll) {
      setInputError('রোল নম্বর প্রদান করা বাধ্যতামূলক। সঠিক রোল নম্বর লিখুন।');
      setSearched(true);
      setFoundStudent(null);
      setInfoWrongPopup({
        isOpen: true,
        title: 'রোল নম্বর প্রদান করুন',
        message: 'প্রবেশপত্র অনুসন্ধানের জন্য শিক্ষার্থীর সঠিক ক্লাস রোল নম্বর প্রদান করা বাধ্যতামূলক।',
      });
      return;
    }

    // Validate that roll consists of valid digits (Bangla ০-৯ or English 0-9)
    const isDigitsOnly = /^[\d০-৯]+$/.test(trimmedRoll);
    if (!isDigitsOnly) {
      setInputError('রোল নম্বরে শুধুমাত্র সংখ্যা লিখুন।');
      setSearched(true);
      setFoundStudent(null);
      setInfoWrongPopup({
        isOpen: true,
        title: 'অসঠিক রোল নম্বর',
        message: 'রোল নম্বরে কোনো বর্ণ বা প্রতীক ব্যবহার করা যাবে না। শুধুমাত্র সঠিক সংখ্যা লিখুন।',
      });
      return;
    }

    const rollNorm = normalizeNum(trimmedRoll);
    const clsNorm = normalizeClassName(selectedClass);

    // Exact strict match in selected class & group from database
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
      // STRICT DATA VALIDATION: If info is incorrect, DO NOT show admit card and NEVER show suggestions
      setFoundStudent(null);
      setSearched(true);
      setInputError('প্রদত্ত তথ্য সঠিক নয়। রোল নম্বর বা নির্বাচিত শ্রেণি/বিভাগে কোনো তথ্য পাওয়া যায়নি।');
      setInfoWrongPopup({
        isOpen: true,
        title: 'তথ্য সঠিক নয় (Wrong Info)',
        message: 'আপনার প্রদত্ত পরীক্ষার নাম, শ্রেণি, বিভাগ বা রোল নম্বরের সাথে বিদ্যালয়ের ডাটাবেজে কোনো রেকর্ড মেলেনি। একটি তথ্য ভুল থাকলেও প্রবেশপত্র দেখা যাবে না। অনুগ্রহ করে সঠিক তথ্য দিয়ে পুনরায় চেষ্টা করুন।',
      });
    }
  };

  const selectDemoRecord = (roll: string, targetClass: string, targetGroup?: string) => {
    setRollInput(roll);
    setSelectedClass(targetClass);
    if (targetGroup) setSelectedGroup(targetGroup);
    setInputError(null);
    setSearched(false);

    const rollNorm = normalizeNum(roll);
    const clsNorm = normalizeClassName(targetClass);

    const match = students.find((s) => {
      const sRoll = normalizeNum(s.roll);
      if (sRoll !== rollNorm) return false;

      const sClass = normalizeClassName(s.class || s.studentClass || '');
      if (sClass !== clsNorm) return false;

      if (clsNorm === '9' || clsNorm === '10') {
        const sGrp = s.group || (s.section?.includes('বিজ্ঞান') ? 'বিজ্ঞান' : s.section?.includes('মানবিক') ? 'মানবিক' : s.section?.includes('ব্যবসায়') || s.section?.includes('ব্যবসায়') ? 'ব্যবসায় শিক্ষা' : '');
        if (sGrp && targetGroup) {
          return normalizeGroup(sGrp) === normalizeGroup(targetGroup);
        }
      }
      return true;
    });

    if (match) {
      setFoundStudent(match);
      setSearched(true);
      if (match.subjects && match.subjects.length > 0) {
        const matchedElec = availableElectives.find((elec) =>
          match.subjects!.some((s) => s.toLowerCase().includes(elec.toLowerCase()))
        );
        if (matchedElec) {
          setSelectedElective(matchedElec);
        }
      }
      setTimeout(() => {
        const el = document.getElementById('printable-admit-card');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
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
      container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '820px';
      container.style.zIndex = '-99999';
      container.style.pointerEvents = 'none';
      container.style.opacity = '1';
      container.style.background = '#ffffff';

      const clone = el.cloneNode(true) as HTMLElement;
      clone.style.width = '820px';
      clone.style.margin = '0';
      clone.style.boxSizing = 'border-box';
      container.appendChild(clone);
      document.body.appendChild(container);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const captureWidth = 820;
      const captureHeight = clone.scrollHeight || clone.offsetHeight || 1100;

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

      const studentName = (foundStudent?.name || 'Student').replace(/\s+/g, '_');
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
      const timeStr = isIct ? 'সকাল ১০:০০ - দুপুর ১২:০০' : 'সকাল ১০:০০ - দুপুর ০১:০০';
      const roomNum = `১০${(idx % 4) + 1}`;

      return {
        serial: idx + 1,
        code: subItem.code,
        subject: subItem.name,
        type: subItem.type,
        typeLabel: subItem.typeLabel,
        date: dateFormatted,
        time: timeStr,
        room: roomNum,
      };
    });
  }, [activeValidatedSubjects, currentExam?.examStartDate, admitCardConfig?.examStartDate]);

  const studentImage = foundStudent
    ? foundStudent.image || getStudentResultImage({ studentName: foundStudent.name, roll: foundStudent.roll, studentId: foundStudent.id }, students)
    : '';

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
                {siteSettings.schoolNameEnglish} • অনলাইন অ্যাডমিট কার্ড (প্রবেশপত্র) ও রুটিন পোর্টাল
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

      {/* Main Content Area - Matching Result Page Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-6 py-8">
        {/* Top Dark Emerald Header Banner - Completely in Bengali matching Results page */}
        <div className="bg-gradient-to-br from-[#063326] via-[#094132] to-[#042018] rounded-3xl p-8 sm:p-12 shadow-xl border border-emerald-900/40 relative overflow-hidden print:hidden">
          {/* Subtle decorative circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-[#0f4d3a]/80 text-[#34d399] border border-[#16654a] px-3.5 py-1 rounded-full text-xs font-semibold mb-4">
              <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
              <span>অনলাইন পরীক্ষা ব্যবস্থাপনা ও প্রবেশপত্র পোর্টাল</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              অনলাইন পরীক্ষার প্রবেশপত্র (অ্যাডমিট কার্ড)
            </h2>

            <p className="text-emerald-100/80 text-xs sm:text-sm mt-2.5 max-w-2xl leading-relaxed">
              সঠিক পরীক্ষার নাম, শ্রেণি ও রোল নম্বর দিয়ে প্রবেশপত্র ও পরীক্ষার সময়সূচি যাচাই করুন এবং অফিশিয়াল কপি ডাউনলোড ও সরাসরি প্রিন্ট করুন।
            </p>
          </div>
        </div>

        {/* Global Inactive Warning if no exam is active */}
        {(allActiveExams.length === 0 || admitCardConfig?.isActive === false) && (
          <div className="bg-amber-500/15 border border-amber-400/40 text-amber-900 text-xs px-4 py-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>সতর্কবার্তা: বর্তমানে বিদ্যালয়ে কোনো পরীক্ষা অনুষ্ঠিত হচ্ছে না বা প্রবেশপত্র ডাউনলোড সাময়িকভাবে স্থগিত রয়েছে।</span>
            </div>
            <button
              type="button"
              onClick={() => setNoExamPopup({
                isOpen: true,
                title: 'এখন কোনো পরীক্ষা অনুষ্ঠিত হচ্ছে না',
                message: 'বর্তমানে বিদ্যালয়ে কোনো পরীক্ষা অনুষ্ঠিত হচ্ছে না এবং কোনো প্রবেশপত্র ডাউনলোডের জন্য উন্মুক্ত নেই। বিদ্যালয় কর্তৃপক্ষ ব্যাকএন্ডে পরীক্ষা যুক্ত ও সক্রিয় করলে প্রবেশপত্র সংগ্রহ করা যাবে।',
              })}
              className="bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold px-3 py-1 rounded-lg text-xs shrink-0 transition cursor-pointer"
            >
              সতর্কবার্তা দেখুন
            </button>
          </div>
        )}

        {/* Search Student Examination Record Card - Completely in Bengali matching Results Page */}
        <div id="admit-search-card" className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8 space-y-6 print:hidden">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-base sm:text-lg">
              <Search className="w-5 h-5 text-emerald-600" />
              <span>শিক্ষার্থীর পরীক্ষার প্রবেশপত্র অনুসন্ধান করুন</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              * পরীক্ষার নাম, শ্রেণি ও রোল নম্বর প্রদান করুন
            </span>
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Field: Roll Number */}
            <div className="md:col-span-3 space-y-1.5">
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
                className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm transition ${
                  inputError
                    ? 'border-2 border-red-500 bg-red-50/40 text-red-900 placeholder-red-400 focus:outline-hidden focus:border-red-600'
                    : 'bg-gray-50/70 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-emerald-600 focus:bg-white'
                }`}
              />
            </div>

            {/* Field: Class */}
            <div className={isClass910 ? 'md:col-span-3 space-y-1.5' : 'md:col-span-3 space-y-1.5'}>
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
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer transition bg-gray-50/70 border border-gray-200 text-gray-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              >
                {CLASS_OPTIONS.map((cls, idx) => (
                  <option key={idx} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* Field: Group (if 9 or 10) */}
            {isClass910 && (
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  বিভাগ <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => {
                    setSelectedGroup(e.target.value);
                    setInputError(null);
                    setSearched(false);
                    setFoundStudent(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer transition bg-gray-50/70 border border-gray-200 text-gray-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                >
                  {GROUP_OPTIONS.map((grp, idx) => (
                    <option key={idx} value={grp}>{grp} বিভাগ</option>
                  ))}
                </select>
              </div>
            )}

            {/* Field: Exam Term */}
            <div className={isClass910 ? 'md:col-span-2 space-y-1.5' : 'md:col-span-4 space-y-1.5'}>
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
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer transition bg-gray-50/70 border border-gray-200 text-gray-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              >
                <option value="">-- পরীক্ষার নাম নির্বাচন করুন --</option>
                {examTermOptions.map((term, idx) => (
                  <option key={idx} value={term.value}>
                    {term.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-[#059669] hover:bg-[#047857] text-white py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:shadow"
              >
                <Search className="w-4 h-4" />
                <span>প্রবেশপত্র অনুসন্ধান</span>
              </button>
            </div>
          </form>

          {/* Quick Demo Records Buttons - Matching Results Page */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 text-xs">
            <span className="text-gray-500 font-bold">সঠিক তথ্য দিয়ে দ্রুত যাচাই করুন:</span>
            <button
              type="button"
              onClick={() => selectDemoRecord('1', '১০ম শ্রেণি', 'বিজ্ঞান')}
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
              onClick={() => selectDemoRecord('2', '১০ম শ্রেণি', 'বিজ্ঞান')}
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
              onClick={() => selectDemoRecord('1', '৮ম শ্রেণি')}
              className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 pl-1.5 pr-3 py-1 rounded-full font-semibold transition cursor-pointer flex items-center gap-2 text-[11px]"
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80"
                alt="Rafsan Zaman"
                className="w-5 h-5 rounded-full object-cover border border-purple-300 shrink-0"
              />
              <span>রাফসান জামান (৮ম শ্রেণি - রোল ১)</span>
            </button>
            <button
              type="button"
              onClick={() => selectDemoRecord('1', '৯ম শ্রেণি', 'মানবিক')}
              className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 pl-1.5 pr-3 py-1 rounded-full font-semibold transition cursor-pointer flex items-center gap-2 text-[11px]"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80"
                alt="Sumaiya Akter"
                className="w-5 h-5 rounded-full object-cover border border-amber-300 shrink-0"
              />
              <span>সুমাইয়া আক্তার (৯ম মানবিক - রোল ১)</span>
            </button>
          </div>

          {/* Inline Input Validation / Error Banner */}
          {inputError && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-300 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 animate-fadeIn shadow-2xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-bold">{inputError}</span>
              </div>
              <button
                type="button"
                onClick={() => setInfoWrongPopup({
                  isOpen: true,
                  title: 'তথ্য সঠিক নয়',
                  message: 'আপনার প্রদত্ত তথ্যের সাথে ডাটাবেজের কোনো রেকর্ড মেলেনি। অনুগ্রহ করে সঠিক রোল নম্বর ও শ্রেণি নির্বাচন করে পুনরায় চেষ্টা করুন।',
                })}
                className="text-[11px] text-rose-800 underline font-semibold hover:text-rose-950 shrink-0 cursor-pointer"
              >
                পপআপ সতর্কবার্তা দেখুন
              </button>
            </div>
          )}

          {/* Search Result Feedback */}
          {searched && (
            <div className="pt-1">
              {foundStudent ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-2xs animate-fadeIn">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      ✓ তথ্য সঠিক ও অনুমোদিত! শিক্ষার্থী <strong>{foundStudent.name}</strong> (রোল: <strong>{foundStudent.roll}</strong>, শ্রেণি: <strong>{selectedClass}</strong>) এর অফিশিয়াল প্রবেশপত্র নিচে প্রস্তুত।
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>প্রিন্ট</span>
                    </button>
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isDownloadingPdf}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloadingPdf ? 'PDF তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* STRICT DATA VALIDATION FAILURE: No suggestions, clean clear error message */
                <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 sm:p-5 text-rose-950 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 shadow-sm animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
                      <ShieldAlert className="w-6 h-6 text-rose-600" />
                    </div>
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-rose-900 text-sm sm:text-base">
                          তথ্য সঠিক নয় — প্রবেশপত্র প্রদর্শিত হবে না
                        </h4>
                        <span className="bg-rose-200 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          রেকর্ড মেলেনি
                        </span>
                      </div>
                      <p className="text-xs text-rose-800 leading-relaxed">
                        আপনার প্রদত্ত পরীক্ষার নাম, শ্রেণি, বিভাগ বা রোল নম্বরের সাথে বিদ্যালয়ের ডাটাবেজে কোনো মিল পাওয়া যায়নি। সঠিক তথ্য ছাড়া অ্যাকাডেমিক নিয়মানুযায়ী প্রবেশপত্র দেখা যাবে না।
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRollInput('');
                      setInputError(null);
                      setSearched(false);
                      setFoundStudent(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>নতুন করে খুঁজুন</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Initial Prompt When Not Searched Yet */}
        {!searched && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-3 print:hidden shadow-xs">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">
              প্রবেশপত্র পেতে সঠিক তথ্য প্রদান করুন
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              শিক্ষার্থীর সঠিক শ্রেণি, বিভাগ (প্রযোজ্য ক্ষেত্রে) এবং ক্লাস রোল নম্বর প্রদান করে &quot;প্রবেশপত্র খুঁজুন&quot; বাটনে ক্লিক করুন। ডাটাবেজে তথ্য যাচাইয়ের পর কেবল বৈধ প্রবেশপত্র প্রদর্শিত হবে।
            </p>
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

              {/* School Header */}
              <div className="text-center border-b-2 border-emerald-900 pb-3 mb-4 relative">
                <div className="flex items-center justify-center gap-3.5 mb-1">
                  {siteSettings.logoUrl ? (
                    <img
                      src={siteSettings.logoUrl}
                      alt="Logo"
                      className="w-13 h-13 rounded-full object-cover border-2 border-emerald-800 shadow-2xs"
                    />
                  ) : (
                    <div className="w-13 h-13 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center shadow-2xs">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg sm:text-2xl font-extrabold text-emerald-950 tracking-tight">
                      {siteSettings.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়'}
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold text-gray-700 tracking-wide">
                      {siteSettings.schoolNameEnglish || 'Dadra High School'}
                    </p>
                    <p className="text-[10.5px] text-gray-500">
                      {siteSettings.address || 'দাদরা, জয়পুরহাট সদর, জয়পুরহাট'} • স্থাপিত: ১৯৬২ • EIIN: 121980
                    </p>
                  </div>
                </div>

                {/* Admit Card Banner Title */}
                <div className="mt-2 inline-block bg-emerald-900 text-white px-5 py-0.5 rounded-full text-xs font-extrabold tracking-wide uppercase shadow-xs">
                  প্রবেশপত্র • ADMIT CARD
                </div>
                <p className="text-xs font-bold text-emerald-900 mt-0.5">
                  {currentExam?.examTerm || selectedExamTerm || admitCardConfig?.examTerm || 'বার্ষিক পরীক্ষা ২০২৬'}
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
                      <th className="py-1.5 px-2.5 border border-emerald-800 w-18 text-center">বিষয় কোড</th>
                      <th className="py-1.5 px-3 border border-emerald-800">পরীক্ষার বিষয়</th>
                      <th className="py-1.5 px-2.5 border border-emerald-800 w-28">তারিখ</th>
                      <th className="py-1.5 px-2.5 border border-emerald-800 w-36">সময়</th>
                      <th className="py-1.5 px-2 border border-emerald-800 text-center w-16">কক্ষ নং</th>
                      <th className="py-1.5 px-2 border border-emerald-800 text-center w-24">পরিদর্শকের স্বাক্ষর</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-800 font-medium">
                    {examSubjectsRoutine.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'}>
                        <td className="py-1 px-2 border border-gray-200 text-center font-mono text-[10.5px]">
                          {item.serial}
                        </td>
                        <td className="py-1 px-2.5 border border-gray-200 text-center font-mono font-bold text-emerald-900 text-[10.5px]">
                          {item.code}
                        </td>
                        <td className="py-1 px-3 border border-gray-200 font-bold text-gray-900 text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <span>{item.subject}</span>
                            {item.type === 'elective' && (
                              <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-normal">
                                ৪র্থ বিষয়
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-1 px-2.5 border border-gray-200 text-[10.5px]">
                          {item.date}
                        </td>
                        <td className="py-1 px-2.5 border border-gray-200 text-[10.5px]">
                          {item.time}
                        </td>
                        <td className="py-1 px-2 border border-gray-200 text-center font-mono text-[10.5px]">
                          {item.room}
                        </td>
                        <td className="py-1 px-2 border border-gray-200 text-center text-gray-300">
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

              {/* Signatures */}
              <div className="flex items-end justify-between pt-4 border-t border-gray-300 text-center text-xs text-gray-700">
                <div className="space-y-1">
                  <div className="w-32 border-b border-gray-400 mx-auto mb-1" />
                  <span className="font-bold text-gray-800 text-[11px]">শ্রেণি শিক্ষকের স্বাক্ষর</span>
                </div>

                <div className="space-y-1 text-center">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-emerald-700 mx-auto flex items-center justify-center text-[9px] text-emerald-800 font-bold opacity-80 rotate-[-12deg]">
                    বিদ্যালয় সিল
                  </div>
                  <span className="text-[9px] text-gray-500">অফিসিয়াল সিলমোহর</span>
                </div>

                <div className="space-y-1">
                  <div className="font-serif italic text-emerald-950 text-sm font-bold opacity-80 mb-0.5">
                    Md. Abdul Karim
                  </div>
                  <div className="w-32 border-b border-gray-400 mx-auto mb-1" />
                  <span className="font-bold text-gray-800 text-[11px]">প্রধান শিক্ষকের স্বাক্ষর</span>
                  <span className="block text-[9px] text-gray-500">দাদরা উচ্চ বিদ্যালয়</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Popup 1: "এখন কোনো পরীক্ষা অনুষ্ঠিত হচ্ছে না" */}
      {noExamPopup.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border-2 border-rose-300 relative text-center">
            {/* Top Close icon */}
            <button
              type="button"
              onClick={() => setNoExamPopup((prev) => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Icon Badge */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center border-2 border-rose-200 shadow-md">
              <Calendar className="w-8 h-8 text-rose-600" />
            </div>

            <div className="space-y-2">
              <span className="bg-rose-100 text-rose-800 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                পরীক্ষা নোটিশ • NOTICE
              </span>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                {noExamPopup.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
                {noExamPopup.message}
              </p>
            </div>

            {/* Current Active Status Pill */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-left space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-gray-500 font-bold text-[10px] uppercase">
                <span>বর্তমান প্রবেশপত্র পোর্টাল অবস্থা</span>
                <span className="text-rose-600 font-bold">
                  {activeExam ? 'অন্য পরীক্ষা সক্রিয়' : 'কোনো পরীক্ষা চলমান নেই'}
                </span>
              </div>
              <p className="text-gray-800 font-medium">
                {activeExam
                  ? `বর্তমানে শুধুমাত্র "${activeExam.examTerm}" এর প্রবেশপত্র উন্মুক্ত রয়েছে।`
                  : 'বিদ্যালয় কর্তৃপক্ষ যখন ব্যাকএন্ড থেকে পরীক্ষা সক্রিয় করবেন, কেবলমাত্র সেই পরীক্ষার প্রবেশপত্র ডাউনলোড করা যাবে।'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setNoExamPopup((prev) => ({ ...prev, isOpen: false }))}
                className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                ঠিক আছে (বুঝেছি)
              </button>
              <button
                type="button"
                onClick={() => {
                  setNoExamPopup((prev) => ({ ...prev, isOpen: false }));
                  setCurrentFrontendPage('notices');
                }}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>নোটিশ বোর্ড দেখুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Popup 2: "তথ্য ভুল / তথ্য সঠিক নয়" (Strict Validation Popup without suggestions) */}
      {infoWrongPopup.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border-2 border-rose-400 relative text-center">
            {/* Top Close icon */}
            <button
              type="button"
              onClick={() => setInfoWrongPopup((prev) => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Warning Badge Icon */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center border-2 border-rose-200 shadow-md">
              <AlertTriangle className="w-8 h-8 text-rose-600" />
            </div>

            <div className="space-y-2">
              <span className="bg-rose-100 text-rose-800 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                ভুল তথ্য • INVALID INFO
              </span>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                {infoWrongPopup.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
                {infoWrongPopup.message}
              </p>
            </div>

            {/* Strict Notice Card */}
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3 text-left space-y-1.5 text-xs text-rose-950">
              <div className="flex items-center gap-1.5 font-bold text-rose-800 text-[11px]">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>নিরাপত্তা ও ডাটা ভ্যালিডেশন নীতি:</span>
              </div>
              <p className="text-gray-700 text-[11.5px] leading-relaxed">
                একটি একক তথ্যে গরমিল থাকলেও কোনো প্রবেশপত্র তৈরি বা প্রদর্শন করা হবে না। সঠিক পরীক্ষার নাম, শ্রেণি, বিভাগ ও রোল নম্বর মিলিয়ে পুনরায় অনুসন্ধান করুন।
              </p>
            </div>

            {/* Action Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setInfoWrongPopup((prev) => ({ ...prev, isOpen: false }))}
                className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                ঠিক আছে, বুঝেছি
              </button>
            </div>
          </div>
        </div>
      )}

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
