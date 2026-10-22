import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { DownloadableForm, NavigationSubItem, ActiveExam, ExamSubjectSchedule } from '../../types';
import {
  Download,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  FileText,
  CreditCard,
  Settings,
  Sparkles,
  Layers,
  HelpCircle,
  ExternalLink,
  Printer,
  Upload,
  Paperclip,
  CheckCircle2,
  Loader2,
  ListChecks,
  CheckCheck,
  BookOpen,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Power,
  Users,
} from 'lucide-react';
import {
  printForm,
  downloadEditableForm,
  downloadFormPdf,
  buildFormHtml,
  getFormKind,
  getFormTheme,
} from '../../utils/formDocumentHelper';
import {
  printExamSchedule,
  downloadExamSchedulePdf,
  getEligibleClassesText,
  getEnrolledStudentCount,
  getExamRoutineSchedule,
} from '../../utils/examDocumentHelper';
import {
  CLASS_OPTIONS,
  GROUP_OPTIONS,
  isClassWithGroups,
  validateSubjectsForClassAndGroup,
  getSubjectCode,
} from '../../data/curriculumSubjects';

export const AVAILABLE_EXAM_CLASSES = [
  '৬ষ্ঠ শ্রেণি',
  '৭ম শ্রেণি',
  '৮ম শ্রেণি',
  '৯ম শ্রেণি',
  '১০ম শ্রেণি',
];

export const PRESET_EXAM_SUGGESTIONS = [
  'বার্ষিক পরীক্ষা (Annual Examination)',
  'অর্ধবার্ষিক পরীক্ষা (Half-Yearly Examination)',
  'Pre-Test Examination',
  'Test Examination',
  '১ম সাময়িক পরীক্ষা (1st Terminal Examination)',
  '২য় সাময়িক পরীক্ষা (2nd Terminal Examination)',
  'মডেল টেস্ট পরীক্ষা (Model Test Examination)',
  'মেধাবৃত্তি প্রস্তুতি পরীক্ষা',
  'এসএসসি প্রস্তুতিমূলক পরীক্ষা (SSC Preparatory Exam)',
  'বিশেষ সাপ্তাহিক মূল্যায়ন পরীক্ষা',
];

export const ManageDownloads: React.FC = () => {
  const {
    siteSettings,
    navigationItems,
    addSubItem,
    updateSubItem,
    deleteSubItem,
    moveSubItem,
    toggleSubItemVisible,
    downloadableForms,
    addDownloadableForm,
    updateDownloadableForm,
    deleteDownloadableForm,
    toggleFormActive,
    admitCardConfig,
    updateAdmitCardConfig,
    addActiveExam,
    updateActiveExam,
    deleteActiveExam,
    setActiveExam,
    toggleActiveExam,
    students,
    setCurrentFrontendPage,
    setViewMode,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'submenus' | 'forms' | 'admit_card'>('forms');
  const [viewingForm, setViewingForm] = useState<DownloadableForm | null>(null);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);

  // Uploaded file state for Add/Edit Form Modal
  const [uploadedFile, setUploadedFile] = useState<{
    fileUrl: string;
    fileName: string;
    fileSize: string;
    fileType: string;
  } | null>(null);

  // Find the 'ডাউনলোড' navigation item
  const downloadNavItem = navigationItems.find(
    (item) => item.id === 'nav-downloads' || item.label === 'ডাউনলোড' || item.url === '#downloads'
  );

  const subItems = downloadNavItem?.subItems ? [...downloadNavItem.subItems].sort((a, b) => a.order - b.order) : [];

  // Modal State for Submenu
  const [submenuModalOpen, setSubmenuModalOpen] = useState(false);
  const [editingSubmenu, setEditingSubmenu] = useState<NavigationSubItem | null>(null);
  const [submenuForm, setSubmenuForm] = useState({
    label: '',
    url: '',
    badge: '',
    description: '',
    iconName: 'FileText',
    order: 0,
    visible: true,
  });

  // Modal State for Downloadable Form
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<DownloadableForm | null>(null);
  const [formFields, setFormFields] = useState({
    title: '',
    category: 'ভর্তি' as 'ভর্তি' | 'ছুটি' | 'প্রশংসাপত্র ও টিসি' | 'অন্যান্য',
    description: '',
    fileSize: '২০০ KB',
    fileType: 'DOCX',
    updatedDate: '১৫ সেপ্টেম্বর ২০২৬',
    active: true,
  });

  // Admit Card config local form
  const [admitForm, setAdmitForm] = useState({
    examTerm: admitCardConfig?.examTerm || 'Pre-Test Examination (2026)',
    examYear: admitCardConfig?.examYear || '২০২৬',
    session: admitCardConfig?.session || '২০২৬-২০২৭',
    examStartDate: admitCardConfig?.examStartDate || '২০ অক্টোবর ২০২৬',
    isActive: admitCardConfig?.isActive !== false,
  });

  const [instructionInput, setInstructionInput] = useState('');
  const [instructionsList, setInstructionsList] = useState<string[]>(
    admitCardConfig?.instructions || []
  );

  // Exam Management Modal State (নতুন পরীক্ষা যুক্ত ও পরিচালনা)
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ActiveExam | null>(null);
  const [viewingExam, setViewingExam] = useState<ActiveExam | null>(null);
  const [generatingExamPdfId, setGeneratingExamPdfId] = useState<string | null>(null);
  // Helper to generate default subject schedules for an exam
  const generateDefaultSubjectSchedules = (
    startDateStr: string,
    baseTime: string = 'সকাল ১০:০০ - দুপুর ০১:০০',
    existingSubjects?: { subject: string; code?: string }[]
  ): ExamSubjectSchedule[] => {
    const subjectsToUse = existingSubjects && existingSubjects.length > 0 ? existingSubjects : [
      { subject: 'বাংলা ১ম পত্র', code: '১০১' },
      { subject: 'বাংলা ২য় পত্র', code: '১০২' },
      { subject: 'ইংরেজি ১ম পত্র', code: '১০৭' },
      { subject: 'ইংরেজি ২য় পত্র', code: '১০৮' },
      { subject: 'সাধারণ গণিত', code: '১০৯' },
      { subject: 'ধর্ম ও নৈতিক শিক্ষা', code: '১১১' },
      { subject: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', code: '১৫৪' },
      { subject: 'বিজ্ঞান / পদার্থবিজ্ঞান / হিসাববিজ্ঞান', code: '১২৭' },
      { subject: 'বাংলাদেশ ও বিশ্বপরিচয় / রসায়ন / ব্যবসায় উদ্যোগ', code: '১৫০' },
      { subject: 'উচ্চতর গণিত / জীববিজ্ঞান / ফিন্যান্স ও ব্যাংকিং', code: '১৩৮' },
    ];

    let startDay = 20;
    let startMonth = 9; // October (0-indexed)
    let startYear = 2026;

    if (startDateStr) {
      const bnToEn: Record<string, string> = {
        '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
        '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
      };
      const normalizedStr = startDateStr.replace(/[০-৯]/g, (d) => bnToEn[d] || d);
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

    return subjectsToUse.map((s, idx) => {
      const dayOffset = idx * 2;
      const examDate = new Date(startYear, startMonth, startDay + dayOffset);
      const dayBn = enToBnDigits(examDate.getDate());
      const monthBn = bnMonths[examDate.getMonth()];
      const yearBn = enToBnDigits(examDate.getFullYear());
      const dateFormatted = `${dayBn} ${monthBn} ${yearBn}`;

      const isIct = s.subject.includes('তথ্য ও যোগাযোগ') || s.subject.includes('ICT');
      const timeStr = isIct ? 'সকাল ১০:০০ - দুপুর ১২:০০' : baseTime;

      return {
        subject: s.subject,
        code: s.code || `${idx + 101}`,
        date: dateFormatted,
        time: timeStr,
      };
    });
  };

  const [examForm, setExamForm] = useState<{
    examTerm: string;
    examYear: string;
    examStartDate: string;
    examTime: string;
    isActive: boolean;
    eligibleClasses: string[];
    description: string;
    subjectSchedules: ExamSubjectSchedule[];
  }>({
    examTerm: 'বার্ষিক পরীক্ষা (Annual Examination)',
    examYear: '২০২৬',
    examStartDate: '১৫ নভেম্বর ২০২৬',
    examTime: 'সকাল ১০:০০ - দুপুর ০১:০০',
    isActive: true,
    eligibleClasses: [...AVAILABLE_EXAM_CLASSES] as string[],
    description: '',
    subjectSchedules: [],
  });

  // Keep local form in sync with admitCardConfig updates
  useEffect(() => {
    if (admitCardConfig) {
      setAdmitForm((prev) => ({
        ...prev,
        examTerm: admitCardConfig.examTerm || prev.examTerm,
        examYear: admitCardConfig.examYear || prev.examYear,
        examStartDate: admitCardConfig.examStartDate || prev.examStartDate,
        isActive: admitCardConfig.isActive !== false,
      }));
      if (admitCardConfig.instructions) {
        setInstructionsList(admitCardConfig.instructions);
      }
    }
  }, [admitCardConfig]);

  // Class-wise Subject Validation preview state in Admin
  const [validationPreviewClass, setValidationPreviewClass] = useState('১০ম শ্রেণি');
  const [validationPreviewGroup, setValidationPreviewGroup] = useState('বিজ্ঞান');
  const isPreviewClass910 = isClassWithGroups(validationPreviewClass);

  const adminValidationDetails = useMemo(() => {
    return validateSubjectsForClassAndGroup(
      validationPreviewClass,
      isPreviewClass910 ? validationPreviewGroup : 'সাধারণ'
    );
  }, [validationPreviewClass, validationPreviewGroup, isPreviewClass910]);

  // Device File Upload Handler (.docx / .doc / .pdf)
  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const ext = fileName.split('.').pop()?.toUpperCase() || 'DOCX';
    const sizeKB = Math.round(file.size / 1024);
    const sizeFormatted = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      const newUploaded = {
        fileUrl: dataUrl,
        fileName: fileName,
        fileSize: sizeFormatted,
        fileType: ext === 'DOC' ? 'DOC' : ext === 'PDF' ? 'PDF' : 'DOCX',
      };
      setUploadedFile(newUploaded);

      // Propose title from file name if empty
      const cleanTitle = fileName
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .trim();

      setFormFields((prev) => ({
        ...prev,
        title: prev.title.trim() ? prev.title : cleanTitle,
        fileSize: sizeFormatted,
        fileType: newUploaded.fileType,
      }));

      // Open the modal if it's not open so user can review/save
      setFormModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Submenu Handlers
  const openAddSubmenu = () => {
    setEditingSubmenu(null);
    setSubmenuForm({
      label: '',
      url: '/important-forms',
      badge: '',
      description: '',
      iconName: 'FileText',
      order: subItems.length,
      visible: true,
    });
    setSubmenuModalOpen(true);
  };

  const openEditSubmenu = (item: NavigationSubItem) => {
    setEditingSubmenu(item);
    setSubmenuForm({
      label: item.label,
      url: item.url,
      badge: item.badge || '',
      description: item.description || '',
      iconName: item.iconName || 'FileText',
      order: item.order,
      visible: item.visible,
    });
    setSubmenuModalOpen(true);
  };

  const handleSubmenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadNavItem) return;
    if (!submenuForm.label.trim()) return;

    if (editingSubmenu) {
      updateSubItem(downloadNavItem.id, editingSubmenu.id, submenuForm);
    } else {
      addSubItem(downloadNavItem.id, submenuForm);
    }
    setSubmenuModalOpen(false);
  };

  // Form Handlers
  const openAddForm = () => {
    setEditingForm(null);
    setUploadedFile(null);
    setFormFields({
      title: '',
      category: 'ভর্তি',
      description: '',
      fileSize: '২০০ KB',
      fileType: 'DOCX',
      updatedDate: '১৫ সেপ্টেম্বর ২০২৬',
      active: true,
    });
    setFormModalOpen(true);
  };

  const openEditForm = (item: DownloadableForm) => {
    setEditingForm(item);
    if (item.fileUrl) {
      setUploadedFile({
        fileUrl: item.fileUrl,
        fileName: item.fileName || 'document.docx',
        fileSize: item.fileSize || '২০০ KB',
        fileType: item.fileType || 'DOCX',
      });
    } else {
      setUploadedFile(null);
    }
    setFormFields({
      title: item.title,
      category: item.category as any,
      description: item.description || '',
      fileSize: item.fileSize || '২০০ KB',
      fileType: item.fileType || 'DOCX',
      updatedDate: item.updatedDate || '১৫ সেপ্টেম্বর ২০২৬',
      active: item.active,
    });
    setFormModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFields.title.trim()) return;

    const submissionData = {
      ...formFields,
      fileUrl: uploadedFile ? uploadedFile.fileUrl : editingForm?.fileUrl,
      fileName: uploadedFile ? uploadedFile.fileName : editingForm?.fileName,
      fileSize: uploadedFile ? uploadedFile.fileSize : formFields.fileSize,
      fileType: uploadedFile ? uploadedFile.fileType : formFields.fileType,
      isCustomUploaded: Boolean(uploadedFile?.fileUrl || editingForm?.fileUrl),
    };

    if (editingForm) {
      updateDownloadableForm(editingForm.id, submissionData);
    } else {
      addDownloadableForm(submissionData);
    }
    setUploadedFile(null);
    setFormModalOpen(false);
  };

  // Admit Card Settings Save
  const handleSaveAdmitConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdmitCardConfig({
      ...admitForm,
      instructions: instructionsList,
    });
    alert('প্রবেশপত্র (Admit Card) কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!');
  };

  const openAddExam = () => {
    setEditingExam(null);
    const defaultStart = '২০ অক্টোবর ২০২৬';
    const defaultTime = 'সকাল ১০:০০ - দুপুর ০১:০০';
    setExamForm({
      examTerm: '',
      examYear: admitCardConfig?.examYear || '২০২৬',
      examStartDate: defaultStart,
      examTime: defaultTime,
      isActive: true,
      eligibleClasses: [...AVAILABLE_EXAM_CLASSES],
      description: '',
      subjectSchedules: generateDefaultSubjectSchedules(defaultStart, defaultTime),
    });
    setExamModalOpen(true);
  };

  const openEditExam = (exam: ActiveExam) => {
    setEditingExam(exam);
    const defaultStart = exam.examStartDate || '২০ অক্টোবর ২০২৬';
    const defaultTime = exam.examTime || 'সকাল ১০:০০ - দুপুর ০১:০০';
    const schedules =
      exam.subjectSchedules && exam.subjectSchedules.length > 0
        ? [...exam.subjectSchedules]
        : generateDefaultSubjectSchedules(defaultStart, defaultTime);

    setExamForm({
      examTerm: exam.examTerm,
      examYear: exam.examYear,
      examStartDate: exam.examStartDate,
      examTime: defaultTime,
      isActive: exam.isActive,
      eligibleClasses:
        exam.eligibleClasses && exam.eligibleClasses.length > 0
          ? [...exam.eligibleClasses]
          : [...AVAILABLE_EXAM_CLASSES],
      description: exam.description || '',
      subjectSchedules: schedules,
    });
    setExamModalOpen(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.examTerm.trim()) {
      alert('অনুগ্রহ করে কাস্টম পরীক্ষার নাম লিখুন বা সাজেশন থেকে নির্বাচন করুন');
      return;
    }

    if (!examForm.subjectSchedules || examForm.subjectSchedules.length === 0) {
      alert('পরীক্ষার রুটিনে কমপক্ষে একটি বিষয় থাকা বাধ্যতামূলক।');
      return;
    }

    // MANDATORY validation: Every subject must have a date and time
    for (let i = 0; i < examForm.subjectSchedules.length; i++) {
      const s = examForm.subjectSchedules[i];
      if (!s.subject.trim()) {
        alert(`বিষয় নম্বর ${i + 1}-এর নাম লেখা বাধ্যতামূলক।`);
        return;
      }
      if (!s.date.trim()) {
        alert(`"${s.subject}" বিষয়ের পরীক্ষার তারিখ নির্ধারণ করা বাধ্যতামূলক!`);
        return;
      }
      if (!s.time.trim()) {
        alert(`"${s.subject}" বিষয়ের পরীক্ষার সময় নির্ধারণ করা বাধ্যতামূলক!`);
        return;
      }
    }

    const chosenClasses =
      examForm.eligibleClasses && examForm.eligibleClasses.length > 0
        ? examForm.eligibleClasses
        : [...AVAILABLE_EXAM_CLASSES];

    if (editingExam) {
      updateActiveExam(editingExam.id, {
        examTerm: examForm.examTerm.trim(),
        examYear: examForm.examYear.trim(),
        examStartDate: examForm.examStartDate.trim(),
        examTime: examForm.examTime.trim(),
        isActive: examForm.isActive,
        eligibleClasses: chosenClasses,
        description: examForm.description.trim(),
        subjectSchedules: examForm.subjectSchedules,
      });
      alert(`"${examForm.examTerm}" পরীক্ষার তথ্য ও বিষয়ভিত্তিক রুটিন সফলভাবে আপডেট হয়েছে! ফ্রন্টএন্ডে তা হালনাগাদ হয়ে গেছে।`);
    } else {
      addActiveExam({
        examTerm: examForm.examTerm.trim(),
        examYear: examForm.examYear.trim(),
        examStartDate: examForm.examStartDate.trim(),
        examTime: examForm.examTime.trim(),
        isActive: examForm.isActive,
        eligibleClasses: chosenClasses,
        description: examForm.description.trim(),
        subjectSchedules: examForm.subjectSchedules,
        createdDate: new Date().toISOString().split('T')[0],
      });
      alert(`নতুন পরীক্ষা "${examForm.examTerm}" বিষয়ভিত্তিক রুটিনসহ সফলভাবে যুক্ত হয়েছে! এটি এখন সরাসরি ফ্রন্টএন্ড প্রবেশপত্র পোর্টালে দৃশ্যমান ও সক্রিয়।`);
    }
    setExamModalOpen(false);
    setEditingExam(null);
  };

  const addInstruction = () => {
    if (!instructionInput.trim()) return;
    setInstructionsList([...instructionsList, instructionInput.trim()]);
    setInstructionInput('');
  };

  const removeInstruction = (idx: number) => {
    setInstructionsList(instructionsList.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Download className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              ডাউনলোড মেনু ও সাবমেনু নিয়ন্ত্রণ
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            ওয়েবসাইটের হেডার নেভিগেশনের <strong>ডাউনলোড</strong> মেনু, এর অধীনে থাকা <strong>অ্যাডমিট কার্ড</strong>, <strong>গুরুত্বপূর্ণ ফরমসমূহ</strong> ও অন্যান্য সাবমেনু পরিচালনা করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setViewMode('frontend');
              setCurrentFrontendPage('admit-card');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition border border-emerald-200 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>প্রবেশপত্র ভিউ</span>
          </button>
          <button
            onClick={() => {
              setViewMode('frontend');
              setCurrentFrontendPage('important-forms');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition border border-emerald-200 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ফরমসমূহ ভিউ</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('submenus')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'submenus'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>ডাউনলোড সাবমেনুসমূহ ({subItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('forms')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'forms'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>গুরুত্বপূর্ণ ফরমসমূহ ({downloadableForms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('admit_card')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'admit_card'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>প্রবেশপত্র সেটিংস (Admit Card Config)</span>
        </button>
      </div>

      {/* Tab 1: Submenus Management */}
      {activeTab === 'submenus' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
            <div>
              <h3 className="font-bold text-emerald-950 text-sm">
                ডাউনলোড মেনুর ড্রপডাউন সাবমেনু
              </h3>
              <p className="text-xs text-emerald-800">
                ব্যবহারকারী যখন হেডারের "ডাউনলোড" বাটনে মাউস নিবেন বা ক্লিক করবেন, তখন এই সাবমেনুগুলো প্রদর্শিত হবে।
              </p>
            </div>
            <button
              onClick={openAddSubmenu}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন সাবমেনু যুক্ত করুন</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                  <th className="py-3 px-4 w-14 text-center">ক্রম</th>
                  <th className="py-3 px-4">সাবমেনুর নাম</th>
                  <th className="py-3 px-4">লিংক / ইউআরএল</th>
                  <th className="py-3 px-4">ব্যাজ / বিবরণ</th>
                  <th className="py-3 px-4 text-center">অবস্থা</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-4 text-center font-bold text-gray-500 font-mono">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        {item.url.includes('admit') ? (
                          <CreditCard className="w-3.5 h-3.5" />
                        ) : (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span>{item.label}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-emerald-800">
                      {item.url}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {item.badge && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full mr-2">
                          {item.badge}
                        </span>
                      )}
                      <span className="text-[11px] text-gray-500">{item.description}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => downloadNavItem && toggleSubItemVisible(downloadNavItem.id, item.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                          item.visible
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {item.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{item.visible ? 'সক্রিয়' : 'লুকানো'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          disabled={index === 0}
                          onClick={() => downloadNavItem && moveSubItem(downloadNavItem.id, item.id, 'up')}
                          className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                          title="উপরে নিন"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={index === subItems.length - 1}
                          onClick={() => downloadNavItem && moveSubItem(downloadNavItem.id, item.id, 'down')}
                          className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                          title="নিচে নিন"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditSubmenu(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="সম্পাদনা"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`আপনি কি "${item.label}" সাবমেনুটি মুছে ফেলতে চান?`)) {
                              downloadNavItem && deleteSubItem(downloadNavItem.id, item.id);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {subItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 space-y-2">
                      <p className="text-xs">বর্তমানে কোনো ডাউনলোড সাবমেনু যুক্ত নেই।</p>
                      <button
                        type="button"
                        onClick={() => {
                          if (downloadNavItem) {
                            addSubItem(downloadNavItem.id, {
                              label: 'অ্যাডমিট কার্ড',
                              url: '/admit-card',
                              badge: 'Admit Card',
                              description: 'পরীক্ষার প্রবেশপত্র ও সিট প্ল্যান ডাউনলোড',
                              iconName: 'CreditCard',
                              order: 0,
                              visible: true,
                            });
                            addSubItem(downloadNavItem.id, {
                              label: 'গুরুত্বপূর্ণ ফরমসমূহ',
                              url: '/important-forms',
                              badge: 'Forms',
                              description: 'ভর্তি ফরম, প্রশংসাপত্র, প্রত্যয়ন ও প্রাতিষ্ঠানিক ফরম',
                              iconName: 'FileText',
                              order: 1,
                              visible: true,
                            });
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ডিফল্ট সাবমেনুসমূহ (অ্যাডমিট কার্ড ও ফরমসমূহ) তৈরি করুন</span>
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Downloadable Forms Management */}
      {activeTab === 'forms' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
            <div>
              <h3 className="font-bold text-emerald-950 text-sm">
                গুরুত্বপূর্ণ প্রাতিষ্ঠানিক ফরমসমূহ
              </h3>
              <p className="text-xs text-emerald-800">
                ডিভাইস থেকে নতুন .docx / Word বা PDF ফরম আপলোড, ভিউ, এডিটেবল ফাইল ডাউনলোড ও সরাসরি প্রিন্ট করুন।
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="file"
                ref={fileInputRef}
                accept=".docx,.doc,.pdf"
                className="hidden"
                onChange={handleDeviceFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
                title="কম্পিউটার বা মোবাইল থেকে সরাসরি .docx / .doc ফাইল আপলোড করুন"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>+ .DOCX ফাইল আপলোড</span>
              </button>
              <button
                type="button"
                onClick={openAddForm}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ নতুন ফরম যোগ করুন</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">ফরমের নাম</th>
                  <th className="py-3 px-4">ক্যাটাগরি</th>
                  <th className="py-3 px-4">সাইজ ও ফরম্যাট</th>
                  <th className="py-3 px-4">আপডেট তারিখ</th>
                  <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {downloadableForms.map((item, index) => {
                  const isWord = item.fileType?.toUpperCase() === 'DOCX' || item.fileType?.toUpperCase() === 'DOC' || item.fileName?.endsWith('.docx');
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 px-4 text-center font-bold text-gray-400 font-mono">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{item.title}</div>
                        <div className="text-[11px] text-gray-500 line-clamp-1">{item.description}</div>
                        {item.fileName && (
                          <div className="text-[10px] text-blue-600 font-mono mt-0.5 flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            <span>{item.fileName}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isWord
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {isWord ? 'DOCX' : (item.fileType || 'PDF')}
                          </span>
                          <span className="font-mono text-[11px] text-gray-600">
                            ({item.fileSize || '২০০ KB'})
                          </span>
                          {item.fileUrl && (
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
                              ডিভাইস ফাইল
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-gray-500">
                        {item.updatedDate || '১৫ সেপ্টেম্বর ২০২৬'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleFormActive(item.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                            item.active
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {item.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{item.active ? 'প্রকাশিত' : 'বন্ধ'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Form Option */}
                          <button
                            type="button"
                            onClick={() => setViewingForm(item)}
                            className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            title="ফরম ভিউ / প্রিভিউ দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Print Option */}
                          <button
                            type="button"
                            onClick={() => printForm(item, siteSettings)}
                            className="p-1.5 text-purple-700 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition cursor-pointer"
                            title="সরাসরি প্রিন্ট করুন (A4 সাইজ)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Unicode PDF Download Option */}
                          <button
                            type="button"
                            disabled={generatingPdfId === item.id}
                            onClick={async () => {
                              try {
                                setGeneratingPdfId(item.id);
                                await downloadFormPdf(item, siteSettings);
                              } finally {
                                setGeneratingPdfId(null);
                              }
                            }}
                            className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                            title="ইউনিকোড বাংলা PDF ডাউনলোড করুন"
                          >
                            {generatingPdfId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                          </button>

                          {/* Editable .docx Download Option */}
                          <button
                            type="button"
                            onClick={() => downloadEditableForm(item, siteSettings)}
                            className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="এডিটেবল ওয়ার্ড (.docx) ফাইল ডাউনলোড করুন"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Edit Form Option */}
                          <button
                            type="button"
                            onClick={() => openEditForm(item)}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                            title="সম্পাদনা করুন"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Form Option */}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`আপনি কি "${item.title}" ফরমটি মুছে ফেলতে চান?`)) {
                                deleteDownloadableForm(item.id);
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Admit Card Settings & Exam Management */}
      {activeTab === 'admit_card' && (
        <div className="space-y-6">
          {/* Card 1: Exam Management & Active Exam Release Control */}
          <div className="bg-white rounded-2xl border border-emerald-200 p-6 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                  </span>
                  <h3 className="font-bold text-gray-900 text-base">
                    পরীক্ষা ব্যবস্থাপনা ও প্রবেশপত্র ডাউনলোড নিয়ন্ত্রণ (Exam Release Control)
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
                  আপনি ব্যাকএন্ডে যে পরীক্ষাটি <strong>সক্রিয় (Active)</strong> করে দিবেন, শিক্ষার্থীরা শুধুমাত্র সেই নির্দিষ্ট পরীক্ষার প্রবেশপত্র ডাউনলোড করতে পারবে। কোনো পরীক্ষা সক্রিয় না থাকলে অথবা তথ্য অমিল হলে শিক্ষার্থীদের <strong>&quot;এখন কোনো পরীক্ষা অনুষ্ঠিত হচ্ছে না&quot;</strong> সতর্কবার্তা পপআপ প্রদর্শিত হবে।
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('frontend');
                    setCurrentFrontendPage('admit-card');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-300 transition cursor-pointer shrink-0"
                  title="শিক্ষার্থীদের ফ্রন্টএন্ড প্রবেশপত্র পোর্টাল পেজ দেখুন"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>ফ্রন্টএন্ডে দেখুন</span>
                </button>
                <button
                  type="button"
                  onClick={openAddExam}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ নতুন কাস্টম পরীক্ষা যুক্ত করুন</span>
                </button>
              </div>
            </div>

            {/* Master Portal Switch */}
            {(() => {
              const activeCount = (admitCardConfig?.availableExams || []).filter((e) => e.isActive).length;
              return (
                <div
                  className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    admitCardConfig?.isActive !== false && activeCount > 0
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : 'bg-rose-50 border-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        admitCardConfig?.isActive !== false && activeCount > 0
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-gray-900">
                          প্রবেশপত্র বিতরণ মাস্টার সুইচ (Master Status):
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            admitCardConfig?.isActive !== false && activeCount > 0
                              ? 'bg-emerald-200 text-emerald-900'
                              : 'bg-rose-200 text-rose-900'
                          }`}
                        >
                          {admitCardConfig?.isActive !== false && activeCount > 0
                            ? `● সক্রিয় (${activeCount}টি পরীক্ষা উন্মুক্ত)`
                            : '✕ নিষ্ক্রিয় (OFFLINE)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        {admitCardConfig?.isActive !== false && activeCount > 0
                          ? `বর্তমানে ${activeCount}টি পরীক্ষা সক্রিয় রয়েছে। একসাথে একাধিক পরীক্ষা সক্রিয় রাখা যাবে এবং নির্ধারিত শ্রেণির শিক্ষার্থীরাই প্রবেশপত্র ডাউনলোড করতে পারবে।`
                          : 'প্রবেশপত্র ডাউনলোড বর্তমানে সম্পূর্ণ বন্ধ রয়েছে। প্রবেশপত্র পাতায় গেলে শিক্ষার্থীদের "এখন কোনো পরীক্ষা অনুষ্ঠিত হচ্ছে না" পপআপ দেখানো হবে।'}
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs shrink-0 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={admitCardConfig?.isActive !== false}
                      onChange={(e) => {
                        const activeState = e.target.checked;
                        updateAdmitCardConfig({ isActive: activeState });
                        setAdmitForm((prev) => ({ ...prev, isActive: activeState }));
                      }}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span>পোর্টাল চালু রাখুন</span>
                  </label>
                </div>
              );
            })()}

            {/* List of Added Exams in Backend */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <h4 className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-emerald-700" />
                  <span>নির্ধারিত পরীক্ষার তালিকা ও নিয়ন্ত্রণ (Available Exams):</span>
                </h4>
                <span className="text-[11px] text-emerald-800 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  ★ একাধিক পরীক্ষা একসাথে সক্রিয় রাখা যাবে ও শ্রেণি নির্ধারণ করা যাবে
                </span>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                      <th className="py-2.5 px-3 w-10 text-center">ক্রম</th>
                      <th className="py-2.5 px-3">পরীক্ষার নাম (Exam Term)</th>
                      <th className="py-2.5 px-3">প্রযোজ্য শ্রেণি (Eligible Classes)</th>
                      <th className="py-2.5 px-3">শিক্ষাবর্ষ ও সময়সূচি</th>
                      <th className="py-2.5 px-3 text-center">অবস্থা (Status)</th>
                      <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(admitCardConfig?.availableExams && admitCardConfig.availableExams.length > 0
                      ? admitCardConfig.availableExams
                      : [
                          {
                            id: 'default-exam-1',
                            examTerm: admitCardConfig?.examTerm || 'Pre-Test Examination',
                            examYear: admitCardConfig?.examYear || '২০২৬',
                            examStartDate: admitCardConfig?.examStartDate || '২০ অক্টোবর ২০২৬',
                            examTime: admitCardConfig?.examTime || 'সকাল ১০:০০ - দুপুর ০১:০০',
                            isActive: admitCardConfig?.isActive !== false,
                            eligibleClasses: ['৯ম শ্রেণি', '১০ম শ্রেণি'],
                            description: '১০ম শ্রেণি ও এসএসসি পরীক্ষার্থীদের জন্য প্রাক-নির্বাচনী পরীক্ষা',
                          },
                        ]
                    ).map((ex, idx) => {
                      const isCurrentlyActive = ex.isActive && admitCardConfig?.isActive !== false;
                      const classesList =
                        ex.eligibleClasses && ex.eligibleClasses.length > 0
                          ? ex.eligibleClasses
                          : AVAILABLE_EXAM_CLASSES;
                      const isAllClasses =
                        classesList.length >= AVAILABLE_EXAM_CLASSES.length ||
                        classesList.includes('all') ||
                        classesList.includes('সকল শ্রেণি');

                      return (
                        <tr
                          key={ex.id || idx}
                          className={`transition ${isCurrentlyActive ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'hover:bg-gray-50'}`}
                        >
                          <td className="py-3 px-3 text-center font-mono font-bold text-gray-500">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-900">{ex.examTerm}</span>
                              {isCurrentlyActive && (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                                  <Check className="w-3 h-3 text-emerald-700" />
                                  <span>সক্রিয়</span>
                                </span>
                              )}
                            </div>
                            {ex.description && (
                              <p className="text-[11px] text-gray-500 mt-0.5">{ex.description}</p>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {isAllClasses ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                সকল শ্রেণি (৬ষ্ঠ-১০ম)
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {classesList.map((cls, cIdx) => (
                                  <span
                                    key={cIdx}
                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200"
                                  >
                                    {cls}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-gray-900">{ex.examYear}</div>
                            <div className="text-[10.5px] text-gray-600 font-medium">{ex.examStartDate}</div>
                            {ex.examTime && (
                              <div className="text-[10px] text-emerald-800 font-semibold">{ex.examTime}</div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => toggleActiveExam(ex.id)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold transition cursor-pointer border ${
                                ex.isActive
                                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-300'
                              }`}
                              title={ex.isActive ? 'ক্লিক করে নিষ্ক্রিয় করুন' : 'ক্লিক করে সক্রিয় করুন'}
                            >
                              {ex.isActive ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                  <span>● সক্রিয়</span>
                                </>
                              ) : (
                                <span>○ নিষ্ক্রিয়</span>
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setViewingExam(ex)}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition border border-emerald-200 cursor-pointer"
                                title="পরীক্ষার বিবরণ ও রুটিন দেখুন"
                              >
                                <Eye className="w-3.5 h-3.5 text-emerald-700" />
                                <span>ভিউ</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditExam(ex)}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-bold transition border border-blue-200 cursor-pointer"
                                title="পরীক্ষার তথ্য ও শ্রেণি সম্পাদনা"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-blue-700" />
                                <span>এডিট</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`আপনি কি "${ex.examTerm}" পরীক্ষাটি মুছে ফেলতে চান?`)) {
                                    deleteActiveExam(ex.id);
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-bold transition border border-rose-200 cursor-pointer"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                                <span>ডিলিট</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => printExamSchedule(ex, siteSettings, students)}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg text-xs font-bold transition border border-purple-200 cursor-pointer"
                                title="পরীক্ষার নোটিশ ও রুটিন প্রিন্ট করুন"
                              >
                                <Printer className="w-3.5 h-3.5 text-purple-700" />
                                <span>প্রিন্ট</span>
                              </button>
                              <button
                                type="button"
                                disabled={generatingExamPdfId === ex.id}
                                onClick={async () => {
                                  try {
                                    setGeneratingExamPdfId(ex.id);
                                    await downloadExamSchedulePdf(ex, siteSettings, students);
                                  } finally {
                                    setGeneratingExamPdfId(null);
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold transition border border-teal-200 cursor-pointer disabled:opacity-50"
                                title="রুটিন ও নোটিশ PDF ডাউনলোড"
                              >
                                {generatingExamPdfId === ex.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-700" />
                                ) : (
                                  <Download className="w-3.5 h-3.5 text-teal-700" />
                                )}
                                <span>ডাউনলোড</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Card 2: Minimal Viewing-Friendly Admit Card & General Rules Config */}
          <form onSubmit={handleSaveAdmitConfig} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                  <Settings className="w-4 h-4 text-emerald-700" />
                  <span>প্রবেশপত্র সাধারণ সেটিংস ও বিশেষ নিয়মাবলী (General Config)</span>
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  শিক্ষাবর্ষ, মূল পরীক্ষার নাম এবং প্রবেশপত্রে মুদ্রিত পরীক্ষার্থীদের নিয়মাবলী নির্ধারণ করুন
                </p>
              </div>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer self-start sm:self-auto"
              >
                সংরক্ষণ করুন (Save)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Custom Academic Year */}
              <div className="space-y-1">
                <label className="block font-bold text-gray-700">
                  কাস্টম শিক্ষাবর্ষ (Custom Year) *
                </label>
                <input
                  type="text"
                  required
                  value={admitForm.examYear}
                  onChange={(e) => setAdmitForm({ ...admitForm, examYear: e.target.value })}
                  placeholder="যেমন: ২০২৬ বা ২০২৭"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-emerald-950 focus:border-emerald-600 focus:bg-white"
                />
                <span className="text-[10px] text-gray-500">
                  বছর পরিবর্তন করলে সমগ্র প্রবেশপত্র সিস্টেমে এই বছর প্রযোজ্য হবে।
                </span>
              </div>

              {/* Default Active Exam Term */}
              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-gray-700">
                    ডিফল্ট সক্রিয় পরীক্ষা (Default Exam Term) *
                  </label>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    সাজেশন থেকে নির্বাচন করুন বা কাস্টম লিখুন
                  </span>
                </div>
                <div className="flex gap-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setAdmitForm((prev) => ({ ...prev, examTerm: e.target.value }));
                      }
                    }}
                    defaultValue=""
                    className="w-1/2 px-3 py-2 bg-emerald-50/70 border border-emerald-300 rounded-xl font-bold text-emerald-950 text-xs focus:bg-white"
                  >
                    <option value="" disabled>-- পরীক্ষার তালিকা --</option>
                    {PRESET_EXAM_SUGGESTIONS.map((preset, pIdx) => (
                      <option key={pIdx} value={preset}>{preset}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: Pre-Test Examination অথবা বার্ষিক পরীক্ষা"
                    value={admitForm.examTerm}
                    onChange={(e) => setAdmitForm({ ...admitForm, examTerm: e.target.value })}
                    className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Exam Start Date */}
              <div className="space-y-1">
                <label className="block font-bold text-gray-700">ডিফল্ট শুরুর তারিখ</label>
                <input
                  type="text"
                  value={admitForm.examStartDate}
                  onChange={(e) => setAdmitForm({ ...admitForm, examStartDate: e.target.value })}
                  placeholder="যেমন: ২০ অক্টোবর ২০২৬"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              {/* Portal status toggle */}
              <div className="sm:col-span-2 flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200">
                  <input
                    type="checkbox"
                    checked={admitForm.isActive}
                    onChange={(e) => setAdmitForm({ ...admitForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs">প্রবেশপত্র পোর্টাল চালু রাখুন (অনলাইন ডাউনলোড সক্রিয়)</span>
                </label>
              </div>
            </div>

            {/* Candidate Instructions List */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <label className="block font-bold text-gray-800 text-xs">
                প্রবেশপত্রে মুদ্রিত পরীক্ষার্থীদের বিশেষ নির্দেশাবলী (Candidate Instructions):
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="নতুন নিয়ম বা নির্দেশ লিখুন..."
                  value={instructionInput}
                  onChange={(e) => setInstructionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addInstruction();
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={addInstruction}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  যুক্ত করুন
                </button>
              </div>

              <div className="space-y-1.5 pt-1">
                {instructionsList.map((inst, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-bold text-emerald-800 font-mono text-[11px]">{idx + 1}.</span>
                      <span>{inst}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeInstruction(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </form>

        {/* Class-wise Subject List Validation Card (Admin View) */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <ListChecks className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  শ্রেণি অনুযায়ী বিষয় তালিকা ও পাঠ্যসূচি যাচাইকরণ (NCTB Curriculum)
                </h3>
                <p className="text-xs text-gray-500">
                  অ্যাডমিট কার্ড জেনারেটরে প্রতিটি শ্রেণির জন্য নির্ধারিত সরকারি বিষয় তালিকা ও বিষয় কোড পরীক্ষা করুন।
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCurrentFrontendPage('admit-card');
                setViewMode('frontend');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>লাইভ অ্যাডমিট কার্ড পোর্টাল দেখুন</span>
            </button>
          </div>

          {/* Class & Group Selector for Admin Tester */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">যাচাইয়ের জন্য শ্রেণি নির্বাচন করুন</label>
              <select
                value={validationPreviewClass}
                onChange={(e) => setValidationPreviewClass(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
              >
                {CLASS_OPTIONS.map((cls, idx) => (
                  <option key={idx} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {isPreviewClass910 && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">বিভাগ (Group)</label>
                <select
                  value={validationPreviewGroup}
                  onChange={(e) => setValidationPreviewGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900"
                >
                  {GROUP_OPTIONS.map((grp, idx) => (
                    <option key={idx} value={grp}>{grp} বিভাগ</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col justify-end">
              <div className="bg-emerald-700 text-white text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-amber-300" />
                <span>যাচাইকৃত মোট বিষয়: {adminValidationDetails.totalSubjects}টি</span>
              </div>
            </div>
          </div>

          {/* Validation Status Summary */}
          <div className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-3.5">
            <span className="font-bold text-emerald-900 block mb-1">
              ✓ {adminValidationDetails.validationStatusText}
            </span>
            <span className="text-[11px] text-gray-500">
              {isPreviewClass910
                ? `${validationPreviewClass} (${validationPreviewGroup})-এ ৭টি আবশ্যিক বিষয়, ৪টি বিভাগীয় বিষয় ও ১টি ৪র্থ ঐচ্ছিক বিষয়সহ মোট ১২টি বিষয়ের রুটিন স্বয়ংক্রিয়ভাবে প্রবেশপত্রে প্রদর্শিত হবে।`
                : `${validationPreviewClass}-এ কোনো বিভাগ নেই; ১০টি সাধারণ আবশ্যিক বিষয় এবং ১টি ব্যবহারিক/ঐচ্ছিক বিষয়সহ মোট ১১টি বিষয় প্রযোজ্য।`}
            </span>
          </div>

          {/* Subject Routine & Code Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-800 font-bold border-b border-gray-200">
                  <th className="py-2 px-3 w-12 text-center">ক্র.নং</th>
                  <th className="py-2 px-3 w-24 text-center">বিষয় কোড</th>
                  <th className="py-2 px-4">বিষয়ের নাম</th>
                  <th className="py-2 px-4">শ্রেণিবিভাগ</th>
                  <th className="py-2 px-4 text-center">বৈধতা অবস্থা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {adminValidationDetails.validatedSubjectList.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="py-2 px-3 text-center font-mono font-bold text-gray-600">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-emerald-800">
                      {item.code}
                    </td>
                    <td className="py-2 px-4 font-bold text-gray-900">
                      {item.name}
                    </td>
                    <td className="py-2 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.type === 'compulsory'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : item.type === 'group_compulsory'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-purple-50 text-purple-800 border border-purple-200'
                      }`}>
                        {item.typeLabel}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-center">
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ অনুমোদিত
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

      {/* Submenu Modal */}
      {submenuModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm">
                {editingSubmenu ? 'সাবমেনু সম্পাদনা' : 'নতুন সাবমেনু যোগ'}
              </h3>
              <button
                onClick={() => setSubmenuModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmenuSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">সাবমেনুর নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: অ্যাডমিট কার্ড"
                  value={submenuForm.label}
                  onChange={(e) => setSubmenuForm({ ...submenuForm, label: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">লিংক / ইউআরএল *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: /admit-card অথবা /important-forms"
                  value={submenuForm.url}
                  onChange={(e) => setSubmenuForm({ ...submenuForm, url: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ব্যাজ টেক্সট (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="যেমন: Admit Card অথবা PDF"
                  value={submenuForm.badge}
                  onChange={(e) => setSubmenuForm({ ...submenuForm, badge: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">সংক্ষিপ্ত বিবরণ</label>
                <input
                  type="text"
                  placeholder="যেমন: পরীক্ষার প্রবেশপত্র ও সিট প্ল্যান ডাউনলোড"
                  value={submenuForm.description}
                  onChange={(e) => setSubmenuForm({ ...submenuForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubmenuModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                >
                  সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form Item Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm">
                {editingForm ? 'ফরম তথ্য সম্পাদনা' : 'নতুন ফরম যুক্ত করুন'}
              </h3>
              <button
                onClick={() => setFormModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">ফরমের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: শিক্ষার্থী ছুটির আবেদন ফরম"
                  value={formFields.title}
                  onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              {/* Device File Upload Area */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ডিভাইস থেকে ফাইল নির্বাচন (.docx / .doc / .pdf)
                </label>
                <div className="bg-slate-50 border-2 border-dashed border-emerald-300 rounded-xl p-3.5 text-center">
                  {uploadedFile ? (
                    <div className="bg-white border border-emerald-200 rounded-lg p-3 flex items-center justify-between gap-3 text-left">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200 shrink-0">
                          {uploadedFile.fileType === 'PDF' ? 'PDF' : 'DOCX'}
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-bold text-gray-900 text-xs truncate max-w-[200px]" title={uploadedFile.fileName}>
                            {uploadedFile.fileName}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>আপলোড সম্পন্ন ({uploadedFile.fileSize})</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFile(null);
                          if (modalFileInputRef.current) modalFileInputRef.current.value = '';
                        }}
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-bold px-2 py-1 rounded hover:bg-rose-50 cursor-pointer shrink-0"
                      >
                        রিমুভ
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-9 h-9 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-1.5">
                        <Upload className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-gray-800">
                        কম্পিউটার বা ফোন থেকে ফাইল নির্বাচন করুন
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        সাপোর্টেড ফরম্যাট: .docx, .doc, .pdf
                      </p>
                      <button
                        type="button"
                        onClick={() => modalFileInputRef.current?.click()}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>ফাইল বেছে নিন</span>
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={modalFileInputRef}
                    accept=".docx,.doc,.pdf"
                    className="hidden"
                    onChange={handleDeviceFileUpload}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ক্যাটাগরি</label>
                <select
                  value={formFields.category}
                  onChange={(e) => setFormFields({ ...formFields, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800"
                >
                  <option value="ভর্তি">ভর্তি</option>
                  <option value="ছুটি">ছুটি</option>
                  <option value="প্রশংসাপত্র ও টিসি">প্রশংসাপত্র ও টিসি</option>
                  <option value="অন্যান্য">অন্যান্য</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">সংক্ষিপ্ত বিবরণ</label>
                <textarea
                  rows={2}
                  placeholder="ফরমের প্রয়োজনীয় ব্যবহার ও নির্দেশ..."
                  value={formFields.description}
                  onChange={(e) => setFormFields({ ...formFields, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ফাইল সাইজ</label>
                  <input
                    type="text"
                    value={formFields.fileSize}
                    onChange={(e) => setFormFields({ ...formFields, fileSize: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ফরম্যাট</label>
                  <input
                    type="text"
                    value={formFields.fileType}
                    onChange={(e) => setFormFields({ ...formFields, fileType: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                >
                  সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exam Add/Edit Modal */}
      {examModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 space-y-4 shadow-xl border border-gray-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {editingExam ? 'পরীক্ষার তথ্য সম্পাদনা' : 'নতুন পরীক্ষা যুক্ত করুন (কাস্টম পরীক্ষা)'}
                  </h3>
                  <p className="text-[10.5px] text-gray-500">
                    এখানে যেকোনো কাস্টম পরীক্ষা যুক্ত করতে পারবেন — যা সরাসরি ফ্রন্টএন্ডে শিক্ষার্থী ও প্রবেশপত্র পেজে প্রদর্শিত হবে
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExamModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-gray-900 text-xs">
                    পরীক্ষার নাম (Exam Term) *
                  </label>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                    ✓ কাস্টম নাম অনুমোদিত
                  </span>
                </div>

                {/* Dropdown for picking from preset list */}
                <select
                  value={PRESET_EXAM_SUGGESTIONS.includes(examForm.examTerm) ? examForm.examTerm : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setExamForm({ ...examForm, examTerm: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 bg-emerald-50/70 border border-emerald-300 rounded-xl font-semibold text-emerald-950 text-xs focus:border-emerald-600 focus:bg-white"
                >
                  <option value="">-- পরীক্ষার তালিকা থেকে নির্বাচন করুন (অথবা নিচে কাস্টম নাম লিখুন) --</option>
                  {PRESET_EXAM_SUGGESTIONS.map((sugg, sIdx) => (
                    <option key={sIdx} value={sugg}>
                      {sugg}
                    </option>
                  ))}
                </select>

                {/* Free Custom Text Input Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-700">
                      কাস্টম পরীক্ষার নাম লিখুন বা সম্পাদন করুন:
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      ইচ্ছামতো যেকোনো নতুন নাম লিখতে পারবেন
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="যেমন: ১০ম শ্রেণির প্রাক-নির্বাচনী পরীক্ষা ২০২৬, বা বিশেষ মডেল টেস্ট ২০২৬"
                      value={examForm.examTerm}
                      onChange={(e) => setExamForm({ ...examForm, examTerm: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border-2 border-emerald-400 rounded-xl font-bold text-gray-900 text-xs focus:border-emerald-600 focus:bg-white focus:outline-hidden shadow-2xs"
                    />
                    {examForm.examTerm && (
                      <button
                        type="button"
                        onClick={() => setExamForm({ ...examForm, examTerm: '' })}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-[10px] font-bold bg-gray-200 hover:bg-gray-300 px-1.5 py-0.5 rounded cursor-pointer"
                        title="ফিল্ড খালি করে নতুন নাম লিখুন"
                      >
                        মুছুন
                      </button>
                    )}
                  </div>
                </div>

                {/* Preset Suggestion Chips */}
                <div className="space-y-1.5 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-emerald-950">
                      দ্রুত সাজেশনের তালিকা থেকে বেছে নিতে ক্লিক করুন (ঐচ্ছিক):
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">ক্লিক করলেই ফিল্ডে বসবে</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {PRESET_EXAM_SUGGESTIONS.map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setExamForm((prev) => ({ ...prev, examTerm: preset }))}
                        className={`text-[10.5px] font-semibold px-2 py-1 rounded-lg border transition cursor-pointer ${
                          examForm.examTerm === preset
                            ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs font-bold'
                            : 'bg-white hover:bg-emerald-100 text-emerald-950 border-emerald-200'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-[10.5px] text-emerald-800 flex items-center gap-1.5 font-medium pt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>আপনি যেকোনো কাস্টম নাম দিতে পারেন। এটি সেভ করলেই ফ্রন্টএন্ড প্রবেশপত্র পোর্টালে সরাসরি চলে আসবে।</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">কাস্টম শিক্ষাবর্ষ *</label>
                  <input
                    type="text"
                    required
                    value={examForm.examYear}
                    onChange={(e) => setExamForm({ ...examForm, examYear: e.target.value })}
                    placeholder="যেমন: ২০২৬ বা ২০২৭"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-emerald-950"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">পরীক্ষা শুরুর তারিখ *</label>
                  <input
                    type="text"
                    required
                    value={examForm.examStartDate}
                    onChange={(e) => setExamForm({ ...examForm, examStartDate: e.target.value })}
                    placeholder="যেমন: ২০ অক্টোবর ২০২৬"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">পরীক্ষার সময় (Exam Time) *</label>
                  <input
                    type="text"
                    required
                    value={examForm.examTime}
                    onChange={(e) => setExamForm({ ...examForm, examTime: e.target.value })}
                    placeholder="যেমন: সকাল ১০:০০ - দুপুর ০১:০০"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">সংক্ষিপ্ত বিবরণ / নোট (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={examForm.description}
                  onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                  placeholder="যেমন: ৬ষ্ঠ থেকে ১০ম শ্রেণির সকল শাখার জন্য"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              {/* Class Selection Field */}
              <div className="space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-gray-800 text-xs">
                    কোন কোন শ্রেণির জন্য পরীক্ষা অনুষ্ঠিত হবে? (Eligible Classes) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (examForm.eligibleClasses.length === AVAILABLE_EXAM_CLASSES.length) {
                        setExamForm((prev) => ({ ...prev, eligibleClasses: [] }));
                      } else {
                        setExamForm((prev) => ({ ...prev, eligibleClasses: [...AVAILABLE_EXAM_CLASSES] }));
                      }
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                  >
                    {examForm.eligibleClasses.length === AVAILABLE_EXAM_CLASSES.length
                      ? 'সবগুলো বাতিল'
                      : 'সকল শ্রেণি নির্বাচন'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {AVAILABLE_EXAM_CLASSES.map((cls) => {
                    const isChecked = examForm.eligibleClasses.includes(cls);
                    return (
                      <label
                        key={cls}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-950'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setExamForm((prev) => ({
                                ...prev,
                                eligibleClasses: [...prev.eligibleClasses, cls],
                              }));
                            } else {
                              setExamForm((prev) => ({
                                ...prev,
                                eligibleClasses: prev.eligibleClasses.filter((c) => c !== cls),
                              }));
                            }
                          }}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span>{cls}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[10.5px] text-gray-500">
                  {examForm.eligibleClasses.length === 0
                    ? '⚠️ কোনো শ্রেণি নির্বাচন না করলে স্বয়ংক্রিয়ভাবে সকল শ্রেণির জন্য গণ্য হবে।'
                    : `বর্তমানে ${examForm.eligibleClasses.length}টি শ্রেণি নির্বাচিত রয়েছে। শুধুমাত্র নির্বাচিত শ্রেণির শিক্ষার্থীরা এই পরীক্ষার প্রবেশপত্র ডাউনলোড করতে পারবে।`}
                </p>
              </div>

              {/* Subject Schedule Section - Mandatory for every subject */}
              <div className="space-y-3 p-3.5 bg-emerald-50/40 rounded-xl border-2 border-emerald-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-700" />
                      <h4 className="font-bold text-gray-900 text-xs sm:text-sm">
                        বিষয়ভিত্তিক পরীক্ষার তারিখ ও সময়সূচি (বাধ্যতামূলক) *
                      </h4>
                    </div>
                    <p className="text-[10.5px] text-gray-600 mt-0.5">
                      প্রবেশপত্রে প্রদর্শনের জন্য প্রতিটি বিষয়ের পরীক্ষার তারিখ এবং সময় অবশ্যই পূরণ করতে হবে।
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const regenerated = generateDefaultSubjectSchedules(
                          examForm.examStartDate,
                          examForm.examTime,
                          examForm.subjectSchedules.map((s) => ({ subject: s.subject, code: s.code }))
                        );
                        setExamForm((prev) => ({ ...prev, subjectSchedules: regenerated }));
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[11px] font-bold transition cursor-pointer"
                      title="পরীক্ষা শুরুর তারিখ অনুযায়ী প্রতিটি বিষয়ের জন্য ২ দিন ব্যবধানে স্বয়ংক্রিয় তারিখ তৈরি করুন"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>📅 অটো-ফিল তারিখ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setExamForm((prev) => ({
                          ...prev,
                          subjectSchedules: [
                            ...prev.subjectSchedules,
                            {
                              subject: '',
                              code: '',
                              date: examForm.examStartDate || '২০ অক্টোবর ২০২৬',
                              time: examForm.examTime || 'সকাল ১০:০০ - দুপুর ০১:০০',
                            },
                          ],
                        }));
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>বিষয় যোগ করুন</span>
                    </button>
                  </div>
                </div>

                {/* Table of Subjects */}
                <div className="overflow-x-auto border border-emerald-200 rounded-xl bg-white shadow-2xs max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs text-gray-700 border-collapse">
                    <thead className="bg-emerald-50/80 text-emerald-950 font-bold border-b border-emerald-200 sticky top-0 z-10">
                      <tr>
                        <th className="p-2.5 w-8 text-center">#</th>
                        <th className="p-2.5">বিষয় ও কোড *</th>
                        <th className="p-2.5">পরীক্ষার তারিখ (বাধ্যতামূলক) *</th>
                        <th className="p-2.5">পরীক্ষার সময় (বাধ্যতামূলক) *</th>
                        <th className="p-2.5 w-10 text-center">মুছুন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100">
                      {examForm.subjectSchedules.map((item, sIdx) => (
                        <tr key={sIdx} className="hover:bg-emerald-50/30 transition">
                          <td className="p-2 text-center font-bold text-gray-500 font-mono">
                            {sIdx + 1}
                          </td>
                          <td className="p-2">
                            <div className="space-y-1">
                              <input
                                type="text"
                                required
                                value={item.subject}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setExamForm((prev) => ({
                                    ...prev,
                                    subjectSchedules: prev.subjectSchedules.map((sch, i) =>
                                      i === sIdx ? { ...sch, subject: val } : sch
                                    ),
                                  }));
                                }}
                                placeholder="বিষয়ের নাম (যেমন: বাংলা ১ম পত্র)"
                                className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-900 focus:bg-white focus:border-emerald-600 outline-hidden"
                              />
                              <input
                                type="text"
                                value={item.code || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setExamForm((prev) => ({
                                    ...prev,
                                    subjectSchedules: prev.subjectSchedules.map((sch, i) =>
                                      i === sIdx ? { ...sch, code: val } : sch
                                    ),
                                  }));
                                }}
                                placeholder="কোড (ঐচ্ছিক, যেমন: ১০১)"
                                className="w-full px-2 py-1 bg-white border border-gray-100 rounded text-[10px] text-gray-500 font-mono outline-hidden"
                              />
                            </div>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              value={item.date}
                              onChange={(e) => {
                                const val = e.target.value;
                                setExamForm((prev) => ({
                                  ...prev,
                                  subjectSchedules: prev.subjectSchedules.map((sch, i) =>
                                    i === sIdx ? { ...sch, date: val } : sch
                                  ),
                                }));
                              }}
                              placeholder="যেমন: ২০ অক্টোবর ২০২৬"
                              className={`w-full px-2.5 py-1.5 rounded-lg font-medium text-xs border outline-hidden transition ${
                                !item.date.trim()
                                  ? 'border-red-400 bg-red-50/60 text-red-900'
                                  : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-600 text-gray-900'
                              }`}
                            />
                            {!item.date.trim() && (
                              <span className="text-[10px] text-red-600 font-semibold block mt-0.5">
                                * তারিখ আবশ্যক
                              </span>
                            )}
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              value={item.time}
                              onChange={(e) => {
                                const val = e.target.value;
                                setExamForm((prev) => ({
                                  ...prev,
                                  subjectSchedules: prev.subjectSchedules.map((sch, i) =>
                                    i === sIdx ? { ...sch, time: val } : sch
                                  ),
                                }));
                              }}
                              placeholder="যেমন: সকাল ১০:০০ - দুপুর ০১:০০"
                              className={`w-full px-2.5 py-1.5 rounded-lg font-medium text-xs border outline-hidden transition ${
                                !item.time.trim()
                                  ? 'border-red-400 bg-red-50/60 text-red-900'
                                  : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-600 text-gray-900'
                              }`}
                            />
                            {!item.time.trim() && (
                              <span className="text-[10px] text-red-600 font-semibold block mt-0.5">
                                * সময় আবশ্যক
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (examForm.subjectSchedules.length <= 1) {
                                  alert('কমপক্ষে একটি বিষয় রাখা আবশ্যক।');
                                  return;
                                }
                                setExamForm((prev) => ({
                                  ...prev,
                                  subjectSchedules: prev.subjectSchedules.filter((_, i) => i !== sIdx),
                                }));
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="বিষয়টি তালিকা থেকে বাদ দিন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-[11px] text-emerald-900 font-semibold bg-emerald-100/60 p-2 rounded-lg">
                  <span>মোট বিষয় সংখ্যা: {examForm.subjectSchedules.length} টি</span>
                  <span>সব বিষয়ের তারিখ ও সময় প্রবেশপত্রে নিখুঁতভাবে প্রদর্শিত হবে</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-950">
                  <input
                    type="checkbox"
                    checked={examForm.isActive}
                    onChange={(e) => setExamForm({ ...examForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>এই পরীক্ষাটিকে সক্রিয় রাখুন (একসাথে একাধিক পরীক্ষা সক্রিয় রাখা যাবে)</span>
                </label>
                <span className="text-[10.5px] text-emerald-700 block mt-1">
                  সক্রিয় থাকলে নির্বাচিত শ্রেণির শিক্ষার্থীরা এই পরীক্ষার নাম নির্বাচন করে প্রবেশপত্র ডাউনলোড করতে পারবে।
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setExamModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exam View Modal (পূর্ণাঙ্গ বিবরণ, রুটিন, প্রিন্ট ও ডাউনলোড) */}
      {viewingExam && (
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
                      {viewingExam.examTerm}
                    </h3>
                    <span
                      className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${
                        viewingExam.isActive
                          ? 'bg-emerald-400 text-emerald-950 font-bold'
                          : 'bg-rose-400 text-rose-950 font-bold'
                      }`}
                    >
                      {viewingExam.isActive ? '● সক্রিয় পরীক্ষা' : '✕ নিষ্ক্রিয়'}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    শিক্ষাবর্ষ: {viewingExam.examYear} • পরীক্ষা শুরুর তারিখ: {viewingExam.examStartDate}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingExam(null)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <span className="text-[11px] text-emerald-800 font-bold block">নির্ধারিত শ্রেণি:</span>
                  <div className="font-bold text-gray-900 text-xs mt-1">
                    {getEligibleClassesText(viewingExam)}
                  </div>
                </div>
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <span className="text-[11px] text-blue-800 font-bold block">মোট পরীক্ষার্থী:</span>
                  <div className="font-bold text-gray-900 text-xs mt-1">
                    {getEnrolledStudentCount(viewingExam, students)} জন শিক্ষার্থী তালিকাভুক্ত
                  </div>
                </div>
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                  <span className="text-[11px] text-purple-800 font-bold block">প্রবেশপত্র বিতরণ অবস্থা:</span>
                  <div className="font-bold text-gray-900 text-xs mt-1 flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        viewingExam.isActive ? 'bg-emerald-600 animate-pulse' : 'bg-gray-400'
                      }`}
                    ></span>
                    <span>{viewingExam.isActive ? 'অনলাইনে উন্মুক্ত' : 'বর্তমানে বন্ধ'}</span>
                  </div>
                </div>
              </div>

              {viewingExam.description && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
                  <span className="font-bold text-gray-900 block mb-0.5">পরীক্ষার বিবরণ / নোট:</span>
                  <p>{viewingExam.description}</p>
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
                      {getExamRoutineSchedule(viewingExam).map((item) => (
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
                  onClick={() => printExamSchedule(viewingExam, siteSettings, students)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>প্রিন্ট করুন</span>
                </button>
                <button
                  type="button"
                  disabled={generatingExamPdfId === viewingExam.id}
                  onClick={async () => {
                    try {
                      setGeneratingExamPdfId(viewingExam.id);
                      await downloadExamSchedulePdf(viewingExam, siteSettings, students);
                    } finally {
                      setGeneratingExamPdfId(null);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {generatingExamPdfId === viewingExam.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>PDF ডাউনলোড</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const ex = viewingExam;
                    setViewingExam(null);
                    openEditExam(ex);
                  }}
                  className="inline-flex items-center gap-1 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold transition border border-blue-200 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-700" />
                  <span>সম্পাদনা করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingExam(null)}
                  className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold border border-gray-200 transition cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Viewer & Print/Download Modal */}
      {viewingForm && (() => {
        const vKind = getFormKind(viewingForm.title, viewingForm.category);
        const vTheme = getFormTheme(vKind);
        const isGeneratingThisAdmin = generatingPdfId === viewingForm.id;

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
              {/* Modal Header */}
              <div
                className="p-4 sm:p-5 text-white flex items-center justify-between gap-3 border-b"
                style={{ backgroundColor: vTheme.primaryColor }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 flex-wrap">
                      <span>{viewingForm.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                        {vTheme.label || viewingForm.category}
                      </span>
                    </h3>
                    <p className="text-[11px] text-white/80 mt-0.5">
                      অফিসিয়াল প্রাতিষ্ঠানিক ফরম প্রিভিউ • ফরম্যাট: {viewingForm.fileType || 'DOCX'} • সাইজ: {viewingForm.fileSize || '২০০ KB'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => printForm(viewingForm, siteSettings)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-purple-900 hover:bg-gray-100 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                    title="সরাসরি A4 প্রিন্ট করুন"
                  >
                    <Printer className="w-3.5 h-3.5 text-purple-700" />
                    <span className="hidden sm:inline">প্রিন্ট করুন</span>
                  </button>
                  <button
                    type="button"
                    disabled={isGeneratingThisAdmin}
                    onClick={async () => {
                      try {
                        setGeneratingPdfId(viewingForm.id);
                        await downloadFormPdf(viewingForm, siteSettings);
                      } finally {
                        setGeneratingPdfId(null);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
                    title="ইউনিকোড বাংলা PDF ডাউনলোড করুন"
                  >
                    {isGeneratingThisAdmin ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">
                      {isGeneratingThisAdmin ? 'তৈরি...' : 'PDF ডাউনলোড'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadEditableForm(viewingForm, siteSettings)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                    title="ওয়ার্ড (.docx) এডিটেবল ফাইল ডাউনলোড"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">.DOCX</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingForm(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body / Paper Preview */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex flex-col items-center">
                {/* Uploaded File Banner if present */}
                {viewingForm.fileUrl && (
                  <div className="w-full max-w-[794px] mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        DOCX
                      </div>
                      <div>
                        <div className="font-bold text-blue-950 flex items-center gap-1.5">
                          <span>সংযুক্ত ডিভাইস ফাইল: {viewingForm.fileName || 'uploaded_document.docx'}</span>
                          <span className="text-[10px] bg-blue-200/70 text-blue-900 px-2 py-0.2 rounded-full font-semibold">
                            {viewingForm.fileSize || '২০০ KB'}
                          </span>
                        </div>
                        <p className="text-[11px] text-blue-700 mt-0.5">
                          এই ফরমটিতে ব্যবহারকারীর ডিভাইস থেকে আপলোডকৃত আসল ফাইল সংরক্ষিত রয়েছে।
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadEditableForm(viewingForm, siteSettings)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
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
                    __html: buildFormHtml(viewingForm, siteSettings),
                  }}
                />
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-white border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ইউনিকোড বাংলা ফন্ট সাপোর্টেড • প্রিন্ট ও ওয়ার্ড (.docx) ফরম্যাটে প্রস্তুত</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => printForm(viewingForm, siteSettings)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>প্রিন্ট করুন (A4)</span>
                  </button>
                  <button
                    type="button"
                    disabled={isGeneratingThisAdmin}
                    onClick={async () => {
                      try {
                        setGeneratingPdfId(viewingForm.id);
                        await downloadFormPdf(viewingForm, siteSettings);
                      } finally {
                        setGeneratingPdfId(null);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    {isGeneratingThisAdmin ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    <span>{isGeneratingThisAdmin ? 'পিডিএফ তৈরি হচ্ছে...' : 'PDF ডাউনলোড (Unicode)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadEditableForm(viewingForm, siteSettings)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>ওয়ার্ড (.docx) ডাউনলোড</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingForm(null)}
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
    </div>
  );
};
