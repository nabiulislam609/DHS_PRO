import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Users,
  Award,
  Upload,
  Image as ImageIcon,
  Camera,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  PlusCircle,
  Sparkles,
  User,
  AlertCircle,
  AlertTriangle,
  Check,
  Printer,
  FileDown,
  Search,
  Filter,
  RotateCcw,
  Download,
  Loader2,
  Eye,
  Phone,
  MapPin,
  Calendar,
  School,
  Shield,
  UserPlus,
  ArchiveRestore,
  Inbox,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Student } from '../../types';
import { compressImageFile } from '../../utils/imageUpload';
import { getStudentPhoto } from '../../utils/studentPhoto';
import {
  CLASS_OPTIONS,
  GROUP_OPTIONS,
  isClassWithGroups,
  getSubjectsForClassAndGroup,
  getElectivesForClassAndGroup,
  ALL_CURRICULUM_SUBJECT_OPTIONS,
} from '../../data/curriculumSubjects';

export const ManageStudents: React.FC = () => {
  const {
    students,
    deletedStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    deleteMultipleStudents,
    removeDuplicateStudents,
    restoreStudent,
    permanentlyDeleteStudent,
    emptyDeletedStudents,
    siteSettings,
    examResults,
  } = useSchool();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStu, setEditingStu] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showDeletedStudentsModal, setShowDeletedStudentsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active');
  const [deletedSearchQuery, setDeletedSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'warning' | 'info';
    text: string;
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showSubjectsList, setShowSubjectsList] = useState(true);
  const [showAdmissionDetails, setShowAdmissionDetails] = useState(false);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [selectedPresetToAdd, setSelectedPresetToAdd] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [filterSection, setFilterSection] = useState('ALL');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Single Student Print & PDF State
  const [printingStudent, setPrintingStudent] = useState<Student | null>(null);
  const [isExportingStudentPdf, setIsExportingStudentPdf] = useState(false);
  const [isPrintingSingle, setIsPrintingSingle] = useState(false);

  const showToast = (type: 'success' | 'warning' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Detect duplicate students
  const duplicateStudents = useMemo(() => {
    const seen = new Map<string, Student[]>();
    for (const s of students) {
      const key = `${s.name.trim().toLowerCase()}__${(s.class || s.studentClass || '').trim()}__${(s.phone || s.guardianPhone || '').replace(/\D/g, '')}`;
      if (!seen.has(key)) {
        seen.set(key, []);
      }
      seen.get(key)!.push(s);
    }
    const dupes: Student[] = [];
    seen.forEach((group) => {
      if (group.length > 1) {
        dupes.push(...group.slice(1));
      }
    });
    return dupes;
  }, [students]);

  // Filtered Deleted Students
  const filteredDeletedStudents = useMemo(() => {
    if (!deletedSearchQuery.trim()) return deletedStudents;
    const q = deletedSearchQuery.toLowerCase().trim();
    return deletedStudents.filter((s) => {
      const matchName = s.name.toLowerCase().includes(q);
      const matchRoll = s.roll.toLowerCase().includes(q);
      const matchPhone = (s.guardianPhone || s.phone || '').includes(q);
      const matchClass = (s.class || s.studentClass || '').toLowerCase().includes(q);
      return matchName || matchRoll || matchPhone || matchClass;
    });
  }, [deletedStudents, deletedSearchQuery]);

  const handleConfirmSingleDelete = () => {
    if (!studentToDelete) return;
    deleteStudent(studentToDelete.id, studentToDelete.roll);
    setSelectedIds((prev) => prev.filter((id) => id !== studentToDelete.id));
    showToast(
      'success',
      `✓ "${studentToDelete.name}" (রোল: ${studentToDelete.roll})-কে মুছে রিসাইকেল বিনে রাখা হয়েছে। 'মুছে ফেলা শিক্ষার্থী' তালিকা থেকে যেকোনো সময় পুনরায় যুক্ত করা যাবে।`
    );
    setStudentToDelete(null);
  };

  const handleRestoreStudent = (s: Student) => {
    restoreStudent(s.id);
    showToast(
      'success',
      `✓ "${s.name}" (শ্রেণি: ${s.class || s.studentClass}, রোল: ${s.roll})-কে সফলভাবে শিক্ষার্থী তালিকায় পুনরায় যুক্ত করা হয়েছে।`
    );
  };

  const handleRestoreAllDeleted = () => {
    if (deletedStudents.length === 0) return;
    const count = deletedStudents.length;
    deletedStudents.forEach((s) => restoreStudent(s.id));
    showToast('success', `✓ সকল (${count} জন) শিক্ষার্থীকে পুনরায় সফলভাবে যুক্ত করা হয়েছে।`);
  };

  const handleEmptyTrash = () => {
    if (
      confirm(
        'আপনি কি নিশ্চিত যে রিসাইকেল বিনের সকল শিক্ষার্থীর তথ্য স্থায়ীভাবে সম্পূর্ণ মুছে ফেলতে চান? এটি আর কোনোভাবেই পুনরুদ্ধার করা যাবে না।'
      )
    ) {
      emptyDeletedStudents();
      showToast('info', 'সকল মুছে ফেলা শিক্ষার্থীর তথ্য স্থায়ীভাবে সম্পূর্ণ মুছে ফেলা হয়েছে।');
    }
  };

  const handlePermanentDelete = (s: Student) => {
    if (
      confirm(
        `আপনি কি নিশ্চিত যে "${s.name}" (রোল: ${s.roll}) এর তথ্য স্থায়ীভাবে মুছে ফেলতে চান? এটি আর কোনোভাবেই পুনরুদ্ধার করা যাবে না।`
      )
    ) {
      permanentlyDeleteStudent(s.id);
      showToast('info', `"${s.name}" এর তথ্য স্থায়ীভাবে মুছে ফেলা হয়েছে।`);
    }
  };

  const handleConfirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    deleteMultipleStudents(selectedIds);
    showToast('success', `✓ মোট ${selectedIds.length} জন শিক্ষার্থীর তথ্য মুছে ফেলা হয়েছে।`);
    setSelectedIds([]);
    setShowBulkDeleteModal(false);
  };

  const handleCleanDuplicates = () => {
    const removed = removeDuplicateStudents();
    showToast('success', `✓ মোট ${removed}টি ডুপ্লিকেট শিক্ষার্থী মুছে ফেলা হয়েছে।`);
  };

  // Distinct Sections
  const availableSections = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.section && s.section.trim()) {
        set.add(s.section.trim());
      }
    });
    if (set.size === 0) {
      ['A', 'B', 'C'].forEach((sec) => set.add(sec));
    }
    return Array.from(set).sort();
  }, [students]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const sClass = s.class || s.studentClass || '';
      const sGroup = s.group || 'সাধারণ';
      const sSection = s.section || '';

      // Class filter
      if (filterClass !== 'ALL' && sClass !== filterClass) {
        return false;
      }
      // Group filter
      if (filterGroup !== 'ALL' && sGroup !== filterGroup) {
        return false;
      }
      // Section filter
      if (filterSection !== 'ALL' && sSection !== filterSection) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchRoll = s.roll.toLowerCase().includes(q);
        const matchPhone = (s.guardianPhone || s.phone || '').includes(q);
        const matchGuardian = (s.guardianName || s.fatherName || '').toLowerCase().includes(q);
        if (!matchName && !matchRoll && !matchPhone && !matchGuardian) {
          return false;
        }
      }

      return true;
    });
  }, [students, filterClass, filterGroup, filterSection, searchQuery]);

  const resetFilters = () => {
    setSearchQuery('');
    setFilterClass('ALL');
    setFilterGroup('ALL');
    setFilterSection('ALL');
  };

  const isFilterActive =
    searchQuery.trim() !== '' ||
    filterClass !== 'ALL' ||
    filterGroup !== 'ALL' ||
    filterSection !== 'ALL';

  // Trigger Print modal
  const handleTriggerPrint = () => {
    setShowPrintModal(true);
  };

  // Dedicated iframe / direct print executor
  const executePrint = () => {
    const sheetElement = document.getElementById('printable-student-sheet');
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
  <title>${siteSettings?.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়'} - শিক্ষার্থী তালিকা</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hind Siliguri", sans-serif; margin: 0; padding: 12px; color: #1e293b; background: #fff; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
    th { background-color: #065f46 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; border: 1px solid #044e3a; padding: 6px 8px; text-align: left; }
    td { border: 1px solid #cbd5e1; padding: 5px 7px; font-size: 11px; }
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
    const sheetElement = document.getElementById('printable-student-sheet');
    if (!sheetElement) {
      handleDownloadHtmlRoster();
      return;
    }

    setIsExportingPdf(true);
    showToast('info', 'পিডিএফ তৈরি হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...');

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

      const fileName = `student_list_${filterClass !== 'ALL' ? filterClass : 'all'}_${Date.now()}.pdf`;
      pdf.save(fileName);
      showToast('success', '✓ PDF ফাইল সফলভাবে ডাউনলোড হয়েছে!');
    } catch (error) {
      console.error('PDF error:', error);
      showToast('warning', 'সরাসরি PDF তৈরিতে সমস্যা হয়েছে। অফলাইন ফাইল ডাউনলোড করা হচ্ছে...');
      handleDownloadHtmlRoster();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Download Offline Printable HTML/PDF File
  const handleDownloadHtmlRoster = () => {
    const schoolName = siteSettings?.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়';
    const address = siteSettings?.address || 'দাদরা, বগুড়া';
    const dateStr = new Date().toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const rowsHtml = filteredStudents
      .map((s, idx) => {
        const sClass = s.class || s.studentClass;
        const displayGroup = s.group || 'সাধারণ';
        const subjCount = s.subjects?.length || 10;
        const photo = s.image || getStudentPhoto(s);
        return `
        <tr>
          <td style="text-align:center; padding: 6px 8px; border: 1px solid #cbd5e1;">${idx + 1}</td>
          <td style="text-align:center; padding: 6px 8px; border: 1px solid #cbd5e1;">
            <img src="${photo}" alt="" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; display: inline-block;" />
          </td>
          <td style="text-align:center; padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-family: monospace;">${s.roll}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold;">${s.name}</td>
          <td style="text-align:center; padding: 6px 8px; border: 1px solid #cbd5e1;">${sClass} (${s.section || 'A'})</td>
          <td style="text-align:center; padding: 6px 8px; border: 1px solid #cbd5e1;">${displayGroup}</td>
          <td style="text-align:center; padding: 6px 8px; border: 1px solid #cbd5e1;">${subjCount} টি বিষয়</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace;">${s.guardianPhone || s.phone || '-'}</td>
        </tr>
      `;
      })
      .join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>${schoolName} - শিক্ষার্থী তালিকা</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hind Siliguri", sans-serif; padding: 24px; color: #1e293b; background: #fff; }
    .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 16px; }
    .school-name { font-size: 22px; font-weight: bold; color: #065f46; margin: 0; }
    .subtitle { font-size: 13px; color: #475569; margin: 4px 0 0 0; }
    .report-title { font-size: 16px; font-weight: bold; margin: 10px 0 4px 0; color: #0f172a; }
    .meta-bar { font-size: 12px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 6px; display: flex; justify-content: space-between; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; }
    th { background: #065f46; color: white; padding: 8px; border: 1px solid #044e3a; text-align: left; }
    th.center { text-align: center; }
    tr:nth-child(even) { background: #f8fafc; }
    .footer { margin-top: 50px; display: flex; justify-content: space-between; padding-top: 30px; font-size: 12px; }
    .sign-box { text-align: center; border-top: 1px dashed #94a3b8; width: 160px; padding-top: 4px; }
    @media print {
      body { padding: 0; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="school-name">${schoolName}</h1>
    <p class="subtitle">${address}</p>
    <div class="report-title">শিক্ষার্থী তালিকা ও তথ্য বিবরণী</div>
  </div>

  <div class="meta-bar">
    <span><b>শ্রেণি:</b> ${filterClass === 'ALL' ? 'সকল শ্রেণি' : filterClass} | <b>বিভাগ:</b> ${filterGroup === 'ALL' ? 'সকল বিভাগ' : filterGroup} | <b>শাখা:</b> ${filterSection === 'ALL' ? 'সকল শাখা' : filterSection}</span>
    <span><b>তারিখ:</b> ${dateStr} | <b>মোট শিক্ষার্থী:</b> ${filteredStudents.length} জন</span>
  </div>

  <table>
    <thead>
      <tr>
        <th class="center" style="width: 35px;">ক্র.</th>
        <th class="center" style="width: 45px;">ছবি</th>
        <th class="center" style="width: 55px;">রোল</th>
        <th>শিক্ষার্থীর নাম</th>
        <th class="center">শ্রেণি ও শাখা</th>
        <th class="center">বিভাগ</th>
        <th class="center">নির্ধারিত বিষয়</th>
        <th>অভিভাবকের ফোন</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="footer">
    <div class="sign-box">শ্রেণি শিক্ষকের স্বাক্ষর</div>
    <div class="sign-box">হিসাবরক্ষক</div>
    <div class="sign-box">প্রধান শিক্ষকের স্বাক্ষর ও সিল</div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `student_list_${filterClass !== 'ALL' ? filterClass : 'all'}_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('success', '✓ শিক্ষার্থীর তালিকা ফাইল সফলভাবে ডাউনলোড হয়েছে।');
  };

  const [form, setForm] = useState({
    name: '',
    roll: '',
    class: '১০ম শ্রেণি',
    section: 'A',
    group: 'বিজ্ঞান',
    guardianPhone: '',
    image: '' as string | undefined,
    subjects: [] as string[],
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    gender: 'ছাত্র' as 'ছাত্র' | 'ছাত্রী',
    previousSchool: '',
    presentAddress: '',
  });

  // Keep subjects in sync with class and group selection
  const isClass910 = isClassWithGroups(form.class);
  const currentElectives = getElectivesForClassAndGroup(form.class, form.group);

  const handleClassChange = (selectedClass: string) => {
    const hasGroups = isClassWithGroups(selectedClass);
    const newGroup = hasGroups
      ? form.group && form.group !== 'সাধারণ'
        ? form.group
        : 'বিজ্ঞান'
      : 'সাধারণ';
    const newSubjects = getSubjectsForClassAndGroup(selectedClass, newGroup);

    setForm((prev) => ({
      ...prev,
      class: selectedClass,
      group: newGroup,
      subjects: newSubjects,
    }));
  };

  const handleGroupChange = (selectedGroup: string) => {
    const newSubjects = getSubjectsForClassAndGroup(form.class, selectedGroup);
    setForm((prev) => ({
      ...prev,
      group: selectedGroup,
      subjects: newSubjects,
    }));
  };

  // Add subject to student
  const handleAddSubject = (subjectName: string) => {
    const cleanName = subjectName.trim();
    if (!cleanName) return;

    if (form.subjects.includes(cleanName)) {
      alert(`"${cleanName}" বিষয়টি ইতিমধ্যে তালিকায় অন্তর্ভুক্ত রয়েছে।`);
      return;
    }

    setForm((prev) => ({
      ...prev,
      subjects: [...prev.subjects, cleanName],
    }));
    setCustomSubjectInput('');
    setSelectedPresetToAdd('');
  };

  // Remove subject from student
  const handleRemoveSubject = (indexToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Quick switch or toggle elective subject
  const handleSelectElective = (electiveName: string) => {
    // If student already has this elective, do nothing or prompt
    if (form.subjects.includes(electiveName)) {
      return;
    }

    // Check if student has another elective from currentElectives pool
    const otherElectiveIndex = form.subjects.findIndex((sub) =>
      currentElectives.includes(sub)
    );

    if (otherElectiveIndex >= 0) {
      // Replace existing elective
      const nextSubjects = [...form.subjects];
      nextSubjects[otherElectiveIndex] = electiveName;
      setForm((prev) => ({ ...prev, subjects: nextSubjects }));
    } else {
      // Append elective
      setForm((prev) => ({ ...prev, subjects: [...prev.subjects, electiveName] }));
    }
  };

  // Reset subjects to default curriculum
  const handleResetSubjects = () => {
    const defaultSubs = getSubjectsForClassAndGroup(form.class, form.group);
    setForm((prev) => ({ ...prev, subjects: defaultSubs }));
  };

  const openAddModal = () => {
    setEditingStu(null);
    setUploadError(null);
    setShowSubjectsList(true);
    setCustomSubjectInput('');
    setSelectedPresetToAdd('');
    const initialClass = '১০ম শ্রেণি';
    const initialGroup = 'বিজ্ঞান';
    const initialSubjects = getSubjectsForClassAndGroup(initialClass, initialGroup);

    setForm({
      name: '',
      roll: `${students.length + 1}`,
      class: initialClass,
      section: 'A',
      group: initialGroup,
      guardianPhone: '+8801700000000',
      image: undefined,
      subjects: initialSubjects,
      fatherName: '',
      motherName: '',
      dateOfBirth: '',
      gender: 'ছাত্র',
      previousSchool: '',
      presentAddress: '',
    });
    setShowAdmissionDetails(false);
    setModalOpen(true);
  };

  const openEditModal = (s: Student) => {
    setEditingStu(s);
    setUploadError(null);
    setShowSubjectsList(true);
    setCustomSubjectInput('');
    setSelectedPresetToAdd('');
    const sClass = s.class || s.studentClass || '১০ম শ্রেণি';
    const hasGroups = isClassWithGroups(sClass);
    const sGroup = hasGroups ? s.group || 'বিজ্ঞান' : 'সাধারণ';
    const sSubjects =
      s.subjects && s.subjects.length > 0
        ? s.subjects
        : getSubjectsForClassAndGroup(sClass, sGroup);

    setForm({
      name: s.name,
      roll: s.roll,
      class: sClass,
      section: s.section,
      group: sGroup,
      guardianPhone: s.guardianPhone || s.phone || '',
      image: s.image,
      subjects: sSubjects,
      fatherName: s.fatherName || s.guardianName || '',
      motherName: s.motherName || '',
      dateOfBirth: s.dateOfBirth || '',
      gender: s.gender || 'ছাত্র',
      previousSchool: s.previousSchool || '',
      presentAddress: s.presentAddress || '',
    });
    setShowAdmissionDetails(Boolean(s.fatherName || s.motherName || s.dateOfBirth || s.presentAddress));
    setModalOpen(true);
  };

  const openSingleStudentPrint = (stu: Student) => {
    setPrintingStudent(stu);
  };

  const executeSingleStudentPrint = (targetStudent?: Student | null) => {
    const stu = targetStudent || printingStudent || viewingStudent;
    if (stu) {
      setPrintingStudent(stu);
    }
    setIsPrintingSingle(true);

    setTimeout(() => {
      try {
        window.print();
      } catch (err) {
        console.error('Print error:', err);
      } finally {
        setIsPrintingSingle(false);
      }
    }, 120);
  };

  const handleDownloadSingleStudentPdf = async (targetStudent?: Student | null) => {
    const stu = targetStudent || printingStudent || viewingStudent;
    if (!stu) return;

    if (!printingStudent || printingStudent.id !== stu.id) {
      setPrintingStudent(stu);
    }

    setIsExportingStudentPdf(true);

    setTimeout(async () => {
      try {
        const element = document.getElementById('printable-single-student-card');
        if (!element) {
          handleDownloadSingleStudentHtml(stu);
          return;
        }

        const canvas = await html2canvas(element, {
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

        const cleanName = stu.name.replace(/\s+/g, '_');
        pdf.save(`${cleanName}_তথ্যবিবরণী_${stu.roll}.pdf`);
      } catch (err) {
        console.error('Single student PDF generation error:', err);
        handleDownloadSingleStudentHtml(stu);
      } finally {
        setIsExportingStudentPdf(false);
      }
    }, 200);
  };

  const handleDownloadSingleStudentHtml = (stu: Student) => {
    const sClass = stu.class || stu.studentClass;
    const displayGroup = stu.group || 'সাধারণ';
    const studentPhoto = stu.image || getStudentPhoto(stu);
    const subjectList =
      stu.subjects && stu.subjects.length > 0
        ? stu.subjects
        : getSubjectsForClassAndGroup(sClass, displayGroup);

    const schoolName = siteSettings?.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়';
    const address = siteSettings?.address || 'দাদরা, বগুড়া';
    const phone = siteSettings?.phone1 || '+৮৮০১৭১২-৩৪৫৬৭৮';

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${stu.name} - শিক্ষার্থী পরিচিতিপত্র</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hind Siliguri", sans-serif; margin: 0; padding: 20px; color: #1e293b; background: #fff; }
    .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 10px; margin-bottom: 16px; }
    .school-name { font-size: 22px; font-weight: bold; color: #065f46; margin: 0; }
    .school-meta { font-size: 11px; color: #64748b; margin: 4px 0 0; }
    .badge { display: inline-block; padding: 3px 12px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; font-size: 11px; font-weight: bold; color: #065f46; margin-top: 6px; }
    .profile-hero { display: flex; align-items: center; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; }
    .photo { width: 75px; height: 75px; border-radius: 50%; object-fit: cover; border: 2px solid #059669; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px; }
    th { background: #f1f5f9; padding: 6px 10px; border: 1px solid #cbd5e1; text-align: left; width: 25%; color: #334155; }
    td { padding: 6px 10px; border: 1px solid #cbd5e1; }
    .sub-chip { display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 3px 8px; border-radius: 4px; font-size: 10px; color: #065f46; margin: 2px; }
    .signatures { margin-top: 45px; display: flex; justify-content: space-between; font-size: 11px; }
    .sign-box { text-align: center; border-top: 1px dashed #64748b; width: 140px; padding-top: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="school-name">${schoolName}</h1>
    <p class="school-meta">${address} • ফোন: ${phone}</p>
    <div class="badge">শিক্ষার্থী পরিচিতিপত্র ও তথ্য বিবরণী</div>
  </div>
  <div class="profile-hero">
    <img src="${studentPhoto}" class="photo" alt="" />
    <div>
      <h2 style="margin: 0; font-size: 18px; color: #0f172a;">${stu.name}</h2>
      <p style="margin: 3px 0 0; font-size: 12px; color: #059669; font-weight: bold;">
        শ্রেণি: ${sClass} • শাখা: ${stu.section} • রোল: ${stu.roll} • বিভাগ: ${displayGroup}
      </p>
    </div>
  </div>
  <table>
    <tr><th>শিক্ষার্থীর নাম</th><td><b>${stu.name}</b></td><th>রোল নম্বর</th><td><b>${stu.roll}</b></td></tr>
    <tr><th>শ্রেণি ও শাখা</th><td>${sClass} (${stu.section})</td><th>বিভাগ (Group)</th><td>${displayGroup}</td></tr>
    <tr><th>লিঙ্গ / জেন্ডার</th><td>${stu.gender || 'ছাত্র'}</td><th>জন্ম তারিখ</th><td>${stu.dateOfBirth || '—'}</td></tr>
    <tr><th>পিতার নাম</th><td>${stu.fatherName || stu.guardianName || '—'}</td><th>মাতার নাম</th><td>${stu.motherName || '—'}</td></tr>
    <tr><th>অভিভাবক ও মোবাইল</th><td>${stu.guardianName || '—'} (${stu.guardianPhone || stu.phone || '—'})</td><th>পূর্ববর্তী বিদ্যালয়</th><td>${stu.previousSchool || '—'}</td></tr>
    <tr><th>বর্তমান ঠিকানা</th><td colspan="3">${stu.presentAddress || 'দাদরা, বগুড়া'}</td></tr>
  </table>
  <div style="margin-bottom: 16px;">
    <h4 style="font-size: 11px; margin: 0 0 6px; color: #334155;">নির্ধারিত বিষয়সমূহ (${subjectList.length} টি):</h4>
    <div>
      ${subjectList.map(s => `<span class="sub-chip">${s}</span>`).join('')}
    </div>
  </div>
  <div class="signatures">
    <div class="sign-box">অভিভাবকের স্বাক্ষর</div>
    <div class="sign-box">শ্রেণি শিক্ষকের স্বাক্ষর</div>
    <div class="sign-box">প্রধান শিক্ষকের স্বাক্ষর ও সিল</div>
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${stu.name}_তথ্যবিবরণী_${stu.roll}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadError(null);
      const dataUrl = await compressImageFile(file, 400, 400, 0.85);
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

    const assignedSubjects =
      form.subjects && form.subjects.length > 0
        ? form.subjects
        : getSubjectsForClassAndGroup(form.class, form.group);

    const finalImage =
      form.image ||
      getStudentPhoto({
        name: form.name.trim(),
        roll: form.roll.trim(),
        studentClass: form.class,
      });

    const studentPayload: Omit<Student, 'id'> = {
      name: form.name.trim(),
      roll: form.roll.trim(),
      studentClass: form.class,
      section: form.section,
      guardianName: form.fatherName.trim() || 'অভিভাবক',
      phone: form.guardianPhone || '+8801700000000',
      class: form.class,
      group: isClass910 ? form.group : 'সাধারণ',
      subjects: assignedSubjects,
      guardianPhone: form.guardianPhone,
      image: finalImage,
      fatherName: form.fatherName.trim() || undefined,
      motherName: form.motherName.trim() || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
      gender: form.gender,
      previousSchool: form.previousSchool.trim() || undefined,
      presentAddress: form.presentAddress.trim() || undefined,
    };

    if (editingStu) {
      updateStudent(editingStu.id, studentPayload);
    } else {
      addStudent(studentPayload);
    }
    setModalOpen(false);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-2xl flex items-center justify-between text-xs font-medium border shadow-xs transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : toastMessage.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : 'bg-blue-50 text-blue-900 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-md hover:bg-black/5 text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">শিক্ষার্থী ব্যবস্থাপনা</h1>
          <p className="text-xs text-gray-500">
            বিদ্যালয়ের রেজিস্টার্ড শিক্ষার্থীদের ডাটাবেস ও বিষয় বিন্যাস (মোট: {students.length} জন)
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {duplicateStudents.length > 0 && (
            <button
              type="button"
              onClick={handleCleanDuplicates}
              className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{duplicateStudents.length}টি ডুপ্লিকেট পরিষ্কার করুন</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleTriggerPrint}
            className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
            title="তালিকা প্রিন্ট করুন"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>প্রিন্ট করুন</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
            title="পিডিএফ বা রিপোর্ট ডাউনলোড"
          >
            <FileDown className="w-4 h-4 text-blue-700" />
            <span>পিডিএফ ডাউনলোড</span>
          </button>

          {deletedStudents.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setShowDeletedStudentsModal(true);
                setActiveTab('deleted');
              }}
              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-3.5 py-2 rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
              title="মুছে ফেলা শিক্ষার্থী তালিকা দেখুন ও পুনরায় যুক্ত করুন"
            >
              <ArchiveRestore className="w-3.5 h-3.5 text-rose-600" />
              <span>মুছে ফেলা শিক্ষার্থী ({deletedStudents.length})</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন শিক্ষার্থী যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {/* Active vs Deleted Students View Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'active'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>সক্রিয় শিক্ষার্থী তালিকা ({students.length} জন)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('deleted')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'deleted'
                ? 'bg-rose-700 text-white shadow-xs'
                : deletedStudents.length > 0
                ? 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ArchiveRestore className="w-4 h-4 text-rose-600" />
            <span>মুছে ফেলা শিক্ষার্থী তালিকা ({deletedStudents.length} জন)</span>
            {deletedStudents.length > 0 && (
              <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                পুনরুদ্ধার
              </span>
            )}
          </button>
        </div>

        {activeTab === 'deleted' && deletedStudents.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestoreAllDeleted}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>সব শিক্ষার্থী একসাথে পুনরুদ্ধার করুন</span>
            </button>
            <button
              type="button"
              onClick={handleEmptyTrash}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ট্র্যাশ খালি করুন</span>
            </button>
          </div>
        )}
      </div>

      {activeTab === 'deleted' ? (
        /* Deleted Students List & Restore View */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <p className="font-bold">ভুল করে কোনো শিক্ষার্থী মুছে গেলে চিন্তার কারণ নেই!</p>
                <p className="text-[11px] text-amber-800">
                  নিচের তালিকা থেকে যেকোনো শিক্ষার্থীর পাশে <b>"পুনরায় যুক্ত করুন"</b> বাটনে চাপ দিলে তিনি সাথে সাথে মূল সক্রিয় শিক্ষার্থী তালিকায় রোল ও তথ্যসহ ফিরে যাবেন।
                </p>
              </div>
            </div>
            {deletedStudents.length > 0 && (
              <span className="text-xs font-mono font-bold bg-white text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200 shrink-0">
                মুছে ফেলা শিক্ষার্থী: {deletedStudents.length} জন
              </span>
            )}
          </div>

          {/* Search in deleted */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="মুছে ফেলা শিক্ষার্থীর নাম, রোল বা ফোন নম্বর দিয়ে খুঁজুন..."
              value={deletedSearchQuery}
              onChange={(e) => setDeletedSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-rose-600 focus:bg-white"
            />
            {deletedSearchQuery && (
              <button
                type="button"
                onClick={() => setDeletedSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {filteredDeletedStudents.length === 0 ? (
            <div className="text-center py-16 text-gray-400 space-y-2">
              <Inbox className="w-12 h-12 mx-auto text-gray-300" />
              <p className="font-medium text-gray-600 text-sm">
                {deletedStudents.length === 0
                  ? 'রিসাইকেল বিনে কোনো মুছে ফেলা শিক্ষার্থী নেই।'
                  : 'অনুসন্ধানের সাথে মিলে এমন কোনো মুছে ফেলা শিক্ষার্থী পাওয়া যায়নি।'}
              </p>
              <p className="text-xs text-gray-400">
                সকল শিক্ষার্থী নিয়মিত সক্রিয় তালিকায় নিরাপদে রয়েছে।
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider text-[11px] border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">ছবি</th>
                    <th className="py-3 px-4">শিক্ষার্থীর নাম ও আইডি</th>
                    <th className="py-3 px-4">শ্রেণি ও রোল</th>
                    <th className="py-3 px-4">বিভাগ ও শাখা</th>
                    <th className="py-3 px-4">অভিভাবক ও যোগাযোগ</th>
                    <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDeletedStudents.map((s) => {
                    const studentPhoto = s.image || getStudentPhoto(s);
                    const sClass = s.class || s.studentClass || '১০ম শ্রেণি';
                    return (
                      <tr key={s.id} className="hover:bg-gray-50/70 transition">
                        <td className="py-3 px-4 text-center">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-rose-50 border border-rose-200 flex items-center justify-center font-bold text-rose-800 text-xs shrink-0 mx-auto">
                            {studentPhoto ? (
                              <img src={studentPhoto} alt={s.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{s.name.charAt(0)}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                          <p className="text-[11px] text-gray-400 font-mono">আইডি: {s.id}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                            রোল: {s.roll}
                          </span>
                          <span className="block text-gray-600 text-[11px] mt-0.5">{sClass}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-700">শাখা: {s.section || 'A'}</span>
                          <span className="block text-[11px] text-gray-500">বিভাগ: {s.group || 'সাধারণ'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-800">{s.guardianName || s.fatherName || 'অভিভাবক'}</p>
                          <p className="text-gray-500 font-mono text-[11px]">{s.guardianPhone || s.phone || '—'}</p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Restore Button */}
                            <button
                              type="button"
                              onClick={() => handleRestoreStudent(s)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
                              title="শিক্ষার্থীকে আবার সক্রিয় তালিকায় যুক্ত করুন"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>পুনরায় যুক্ত করুন</span>
                            </button>

                            {/* Edit & Restore */}
                            <button
                              type="button"
                              onClick={() => {
                                handleRestoreStudent(s);
                                openEditModal(s);
                              }}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-emerald-700 transition cursor-pointer"
                              title="তথ্য সম্পাদনা করে তালিকায় যুক্ত করুন"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Permanent Delete */}
                            <button
                              type="button"
                              onClick={() => handlePermanentDelete(s)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition cursor-pointer"
                              title="স্থায়ীভাবে মুছে ফেলুন"
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
          )}
        </div>
      ) : (
        <>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="নাম, রোল, অভিভাবক বা ফোন নম্বর..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-600 focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-hidden focus:border-emerald-600 focus:bg-white cursor-pointer"
            >
              <option value="ALL">সকল শ্রেণি</option>
              {CLASS_OPTIONS.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Group Filter */}
          <div>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-hidden focus:border-emerald-600 focus:bg-white cursor-pointer"
            >
              <option value="ALL">সকল বিভাগ (Group)</option>
              <option value="বিজ্ঞান">বিজ্ঞান</option>
              <option value="মানবিক">মানবিক</option>
              <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা</option>
              <option value="সাধারণ">সাধারণ</option>
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-hidden focus:border-emerald-600 focus:bg-white cursor-pointer"
            >
              <option value="ALL">সকল শাখা</option>
              {availableSections.map((sec) => (
                <option key={sec} value={sec}>
                  শাখা: {sec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary and Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">
              প্রদর্শিত শিক্ষার্থী:{' '}
              <b className="text-emerald-800 font-bold">{filteredStudents.length} জন</b>{' '}
              (মোট: {students.length} জন)
            </span>
            {isFilterActive && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-800 font-semibold bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-md transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>ফিল্টার রিসেট</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTriggerPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-xs transition cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-700" />
              <span>প্রিন্ট ভিউ</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadHtmlRoster}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg font-bold text-xs transition cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-700" />
              <span>রিপোর্ট ডাউনলোড</span>
            </button>
          </div>
        </div>
      </div>

      {/* Duplicate Alert Banner */}
      {duplicateStudents.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-amber-950">
                তালিকায় {duplicateStudents.length}টি পুনরাবৃত্তি/ডুপ্লিকেট শিক্ষার্থী রয়েছে!
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                একই শিক্ষার্থী (যেমন: {duplicateStudents[0]?.name}) একাধিকবার ভিন্ন ভিন্ন রোল নম্বরে তালিকায় যুক্ত রয়েছে।
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCleanDuplicates}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition self-start sm:self-auto shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>এক ক্লিকে ডুপ্লিকেটগুলো মুছে ফেলুন</span>
          </button>
        </div>
      )}

      {/* Bulk Action Floating Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl flex items-center justify-between gap-2 text-xs shadow-2xs">
          <span className="font-bold text-rose-900">
            {selectedIds.length} জন শিক্ষার্থী নির্বাচিত হয়েছে
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-xs text-gray-600 hover:bg-white rounded-lg transition cursor-pointer font-medium"
            >
              নির্বাচন বাতিল
            </button>
            <button
              type="button"
              onClick={() => setShowBulkDeleteModal(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>নির্বাচিত {selectedIds.length} জন মুছুন</span>
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/80 text-gray-700 font-bold uppercase tracking-wider text-[11px] border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredStudents.length > 0 && selectedIds.length === filteredStudents.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(filteredStudents.map((s) => s.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    title="সকল শিক্ষার্থী নির্বাচন করুন"
                  />
                </th>
                <th className="py-3.5 px-4">ছবি</th>
                <th className="py-3.5 px-4">রোল</th>
                <th className="py-3.5 px-4">শিক্ষার্থীর নাম</th>
                <th className="py-3.5 px-4">শ্রেণি ও শাখা</th>
                <th className="py-3.5 px-4">বিভাগ (Group)</th>
                <th className="py-3.5 px-4">নির্ধারিত বিষয়</th>
                <th className="py-3.5 px-4">অভিভাবক ফোন</th>
                <th className="py-3.5 px-4 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      কোনো শিক্ষার্থী পাওয়া যায়নি
                    </p>
                    <p className="text-xs text-gray-400 mb-3">
                      আপনার নির্বাচিত ফিল্টার বা সার্চ শব্দের সাথে কোনো তথ্য মেলেনি।
                    </p>
                    {isFilterActive && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        ফিল্টার রিসেট করুন
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const sClass = s.class || s.studentClass;
                  const hasGrp = isClassWithGroups(sClass);
                  const displayGroup = hasGrp ? s.group || 'বিজ্ঞান' : 'সাধারণ';
                  const subjectList =
                    s.subjects && s.subjects.length > 0
                      ? s.subjects
                      : getSubjectsForClassAndGroup(sClass, displayGroup);

                  const studentPhoto = s.image || getStudentPhoto(s);
                  const isSelected = selectedIds.includes(s.id);

                  return (
                    <tr
                      key={s.id}
                      className={`transition ${isSelected ? 'bg-rose-50/40' : 'hover:bg-gray-50/60'}`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds((prev) => [...prev, s.id]);
                            } else {
                              setSelectedIds((prev) => prev.filter((id) => id !== s.id));
                            }
                          }}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-800 text-xs shrink-0 shadow-2xs">
                          {studentPhoto ? (
                            <img src={studentPhoto} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{s.name.charAt(0)}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">{s.roll}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">{s.name}</td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-medium">
                          {sClass} ({s.section})
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            displayGroup === 'বিজ্ঞান'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : displayGroup === 'মানবিক'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : displayGroup === 'ব্যবসায় শিক্ষা'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          {displayGroup}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 bg-emerald-50/70 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                          <BookOpen className="w-3 h-3 text-emerald-600" />
                          <span>{subjectList.length} টি বিষয়</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500">{s.guardianPhone || s.phone}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingStudent(s)}
                            className="p-1.5 rounded-md hover:bg-blue-50 text-blue-700 transition cursor-pointer"
                            title="শিক্ষার্থীর বিস্তারিত তথ্য দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openSingleStudentPrint(s)}
                            className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-700 transition cursor-pointer"
                            title="শিক্ষার্থীর তথ্য বিবরণী প্রিন্ট ও পিডিএফ"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(s)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-emerald-700 transition cursor-pointer"
                            title="সম্পাদনা করুন"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentToDelete(s)}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                            title="শিক্ষার্থী মুছুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}

      {/* In-App Single Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6 text-rose-600" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-gray-900">শিক্ষার্থী মুছে ফেলবেন?</h3>
              <p className="text-xs text-gray-500">
                মুছে ফেললে এটি <b>'মুছে ফেলা শিক্ষার্থী'</b> তালিকায় সংরক্ষিত থাকবে এবং আপনি যেকোনো সময় সেখান থেকে পুনরায় শিক্ষার্থী তালিকায় ফিরিয়ে আনতে পারবেন।
              </p>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-left mt-2 space-y-1">
                <p className="font-bold text-gray-900 text-sm">{studentToDelete.name}</p>
                <p className="text-gray-600 text-[11px]">
                  শ্রেণি:{' '}
                  <span className="font-semibold text-gray-800">
                    {studentToDelete.class || studentToDelete.studentClass}
                  </span>{' '}
                  {studentToDelete.section ? `(${studentToDelete.section})` : ''} • রোল:{' '}
                  <b className="font-mono text-emerald-800">{studentToDelete.roll}</b>
                </p>
                {(studentToDelete.guardianPhone || studentToDelete.phone) && (
                  <p className="text-gray-500 text-[11px] font-mono">
                    মোবাইল: {studentToDelete.guardianPhone || studentToDelete.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="flex-1 py-2 px-3 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                className="flex-1 py-2 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer shadow-xs transition"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6 text-rose-600" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-gray-900">
                {selectedIds.length} জন শিক্ষার্থী মুছবেন?
              </h3>
              <p className="text-xs text-gray-500">
                নির্বাচিত সকল শিক্ষার্থীর তথ্য তালিকা থেকে স্থায়ীভাবে মুছে ফেলা হবে।
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                className="flex-1 py-2 px-3 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                className="flex-1 py-2 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer shadow-xs transition"
              >
                হ্যাঁ, সকল মুছুন
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingStu ? 'শিক্ষার্থীর তথ্য সম্পাদনা' : 'নতুন শিক্ষার্থী যুক্ত করুন'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Device Photo Upload Area */}
              <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-200">
                <label className="block font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-700" />
                  <span>শিক্ষার্থীর ছবি (ডিভাইস থেকে যুক্ত করুন)</span>
                </label>

                <div className="flex items-center gap-4">
                  {/* Photo Preview */}
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 overflow-hidden bg-white flex items-center justify-center shrink-0 relative shadow-2xs group">
                    {form.image ? (
                      <img src={form.image} alt="Student Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-400 p-1">
                        <ImageIcon className="w-6 h-6 mx-auto mb-0.5 text-gray-300" />
                        <span className="text-[9px] block">ছবি নেই</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 flex-1">
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{form.image ? 'ছবি পরিবর্তন করুন' : 'ডিভাইস থেকে আপলোড'}</span>
                      </button>

                      {form.image && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold transition cursor-pointer border border-rose-200"
                        >
                          ছবি মুছুন
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500">
                      JPG, PNG বা WebP ফরম্যাট (স্বয়ংক্রিয়ভাবে অপ্টিমাইজ হবে)
                    </p>
                    {uploadError && (
                      <p className="text-[11px] text-rose-600 font-medium">{uploadError}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">শিক্ষার্থীর নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: তানভীর হাসান"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">রোল নম্বর *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ১০১"
                    value={form.roll}
                    onChange={(e) => setForm({ ...form, roll: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    শ্রেণি * <span className="text-emerald-700 font-normal">(সিলেক্ট করুন)</span>
                  </label>
                  <select
                    value={form.class}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-semibold text-gray-800"
                  >
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">শাখা</label>
                  <input
                    type="text"
                    placeholder="যেমন: A বা ক"
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    বিভাগ {isClass910 ? '*' : '(৬ষ্ঠ-৮ম এর জন্য সাধারণ)'}
                  </label>
                  {isClass910 ? (
                    <select
                      value={form.group}
                      onChange={(e) => handleGroupChange(e.target.value)}
                      className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-semibold text-emerald-900"
                    >
                      {GROUP_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g} বিভাগ
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      value="সাধারণ পাঠ্যক্রম"
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed font-medium"
                    />
                  )}
                </div>
              </div>

              {/* Automatic Subjects Preview and Management Section */}
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>
                      {form.class} {isClass910 ? `(${form.group} বিভাগ)` : ''} এর নির্ধারিত বিষয়সমূহ:
                    </span>
                    <span className="bg-emerald-700 text-white text-[11px] px-2 py-0.5 rounded-full font-mono font-bold">
                      {form.subjects.length} টি বিষয়
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetSubjects}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold transition cursor-pointer shadow-2xs"
                      title="সিলেবাস অনুযায়ী বিষয়গুলো রিসেট করুন"
                    >
                      <RefreshCw className="w-3 h-3 text-emerald-600" />
                      <span>রিসেট</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowSubjectsList(!showSubjectsList)}
                      className="text-emerald-700 hover:text-emerald-900 text-[11px] font-bold inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{showSubjectsList ? 'লুকান' : 'তালিকা দেখুন'}</span>
                      {showSubjectsList ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Elective / 4th subject selector */}
                {currentElectives.length > 0 && (
                  <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200">
                    <span className="block text-[11px] font-bold text-emerald-950 mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ঐচ্ছিক বিষয় দ্রুত নির্বাচন (ক্লিক করে অদলবদল করুন):</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentElectives.map((ele) => {
                        const isSelected = form.subjects.includes(ele);
                        return (
                          <button
                            key={ele}
                            type="button"
                            onClick={() => handleSelectElective(ele)}
                            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                            }`}
                          >
                            {isSelected ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            )}
                            <span>{ele}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Add subject toolbar */}
                <div className="flex flex-col sm:flex-row gap-2 items-center bg-white/70 p-2 rounded-xl border border-emerald-200">
                  <select
                    value={selectedPresetToAdd}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedPresetToAdd(val);
                      if (val && val !== '__custom__') {
                        handleAddSubject(val);
                      }
                    }}
                    className="w-full sm:w-1/2 px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-gray-800"
                  >
                    <option value="">-- নতুন বিষয় নির্বাচন করে যোগ করুন --</option>
                    {ALL_CURRICULUM_SUBJECT_OPTIONS.filter((s) => !form.subjects.includes(s)).map((sub) => (
                      <option key={sub} value={sub}>
                        ➕ {sub}
                      </option>
                    ))}
                    <option value="__custom__">✍️ কাস্টম বিষয় (নিজে লিখুন)...</option>
                  </select>

                  {selectedPresetToAdd === '__custom__' && (
                    <div className="flex items-center gap-1.5 w-full sm:w-1/2">
                      <input
                        type="text"
                        placeholder="যেমন: গার্হস্থ্য বিজ্ঞান..."
                        value={customSubjectInput}
                        onChange={(e) => setCustomSubjectInput(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSubject(customSubjectInput)}
                        disabled={!customSubjectInput.trim()}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold shrink-0 transition cursor-pointer"
                      >
                        যোগ করুন
                      </button>
                    </div>
                  )}
                </div>

                {/* Interactive Subject List with Remove Capability */}
                {showSubjectsList && (
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {form.subjects.map((sub, idx) => {
                      const isEle = currentElectives.includes(sub);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-white border border-emerald-100 text-gray-800 text-xs hover:border-emerald-300 transition group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-mono flex items-center justify-center shrink-0 font-bold border border-emerald-200">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-gray-800">{sub}</span>
                            {isEle && (
                              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded font-medium">
                                ঐচ্ছিক বিষয়
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveSubject(idx)}
                            className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                            title={`"${sub}" বিষয়টি বাদ দিন`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Collapsible Admission & Guardian Info Section */}
              <div className="bg-gray-50/80 rounded-xl border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdmissionDetails(!showAdmissionDetails)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-gray-700 hover:bg-gray-100/60 transition cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    <span>ভর্তি ও অভিভাবক সংক্রান্ত বিস্তারিত তথ্য (ঐচ্ছিক)</span>
                  </span>
                  {showAdmissionDetails ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {showAdmissionDetails && (
                  <div className="p-3.5 pt-0 space-y-3 border-t border-gray-200/60 mt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-gray-600 mb-1 text-[11px]">পিতার নাম</label>
                        <input
                          type="text"
                          placeholder="পিতার নাম"
                          value={form.fatherName}
                          onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-gray-600 mb-1 text-[11px]">মাতার নাম</label>
                        <input
                          type="text"
                          placeholder="মাতার নাম"
                          value={form.motherName}
                          onChange={(e) => setForm({ ...form, motherName: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-gray-600 mb-1 text-[11px]">জন্ম তারিখ</label>
                        <input
                          type="date"
                          value={form.dateOfBirth}
                          onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-gray-600 mb-1 text-[11px]">লিঙ্গ</label>
                        <select
                          value={form.gender}
                          onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
                          className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                        >
                          <option value="ছাত্র">ছাত্র</option>
                          <option value="ছাত্রী">ছাত্রী</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-600 mb-1 text-[11px]">পূর্ববর্তী শিক্ষাপ্রতিষ্ঠান</label>
                      <input
                        type="text"
                        placeholder="পূর্বে কোন স্কুলে পড়তেন"
                        value={form.previousSchool}
                        onChange={(e) => setForm({ ...form, previousSchool: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-600 mb-1 text-[11px]">বর্তমান ঠিকানা</label>
                      <textarea
                        rows={2}
                        placeholder="গ্রাম/রোড, ডাকঘর, উপজেলা, জেলা"
                        value={form.presentAddress}
                        onChange={(e) => setForm({ ...form, presentAddress: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">অভিভাবকের মোবাইল নম্বর</label>
                <input
                  type="tel"
                  placeholder="+88017..."
                  value={form.guardianPhone}
                  onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                {editingStu ? (
                  <button
                    type="button"
                    onClick={() => {
                      setStudentToDelete(editingStu);
                      setModalOpen(false);
                    }}
                    className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>এই শিক্ষার্থী মুছুন</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-2">
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
                  <span>শিক্ষার্থী তালিকা প্রিন্ট ও পিডিএফ প্রিভিউ</span>
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
                id="printable-student-sheet"
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
                    শিক্ষার্থী তথ্য বিবরণী ও হাজিরা তালিকা
                  </div>
                </div>

                {/* Filter Meta Bar */}
                <div className="flex items-center justify-between text-[11px] bg-gray-50 border border-gray-200 p-2.5 rounded-lg mb-4 font-medium">
                  <div>
                    <span>শ্রেণি: <b>{filterClass === 'ALL' ? 'সকল শ্রেণি' : filterClass}</b></span>
                    <span className="mx-1.5">•</span>
                    <span>বিভাগ: <b>{filterGroup === 'ALL' ? 'সকল বিভাগ' : filterGroup}</b></span>
                    <span className="mx-1.5">•</span>
                    <span> শাখা: <b>{filterSection === 'ALL' ? 'সকল শাখা' : filterSection}</b></span>
                  </div>
                  <div>
                    <span>তারিখ: <b>{new Date().toLocaleDateString('bn-BD')}</b></span>
                    <span className="mx-1.5">•</span>
                    <span>মোট শিক্ষার্থী: <b className="text-emerald-800">{filteredStudents.length} জন</b></span>
                  </div>
                </div>

                {/* Printable Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-emerald-800 text-white font-bold text-[11px]">
                        <th className="py-2 px-2 border border-emerald-900 text-center w-8">ক্র.</th>
                        <th className="py-2 px-2 border border-emerald-900 text-center w-10">ছবি</th>
                        <th className="py-2 px-2.5 border border-emerald-900 text-center w-12 font-mono">রোল</th>
                        <th className="py-2 px-3 border border-emerald-900">শিক্ষার্থীর নাম</th>
                        <th className="py-2 px-2.5 border border-emerald-900 text-center">শ্রেণি ও শাখা</th>
                        <th className="py-2 px-2.5 border border-emerald-900 text-center">বিভাগ</th>
                        <th className="py-2 px-2.5 border border-emerald-900 text-center">বিষয়</th>
                        <th className="py-2 px-3 border border-emerald-900 font-mono">অভিভাবকের ফোন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s, idx) => {
                        const sClass = s.class || s.studentClass;
                        const displayGroup = s.group || 'সাধারণ';
                        const subjCount = s.subjects?.length || 10;
                        const studentPhoto = s.image || getStudentPhoto(s);

                        return (
                          <tr key={s.id} className={idx % 2 === 1 ? 'bg-gray-50/70' : 'bg-white'}>
                            <td className="py-2 px-2 border border-gray-200 text-center font-mono">{idx + 1}</td>
                            <td className="py-1 px-1.5 border border-gray-200 text-center">
                              <div className="w-7 h-7 rounded-full overflow-hidden mx-auto bg-gray-100 border border-gray-200">
                                <img src={studentPhoto} alt="" className="w-full h-full object-cover" />
                              </div>
                            </td>
                            <td className="py-2 px-2.5 border border-gray-200 text-center font-bold font-mono text-emerald-900">
                              {s.roll}
                            </td>
                            <td className="py-2 px-3 border border-gray-200 font-bold text-gray-900">
                              {s.name}
                            </td>
                            <td className="py-2 px-2.5 border border-gray-200 text-center">
                              {sClass} ({s.section || 'A'})
                            </td>
                            <td className="py-2 px-2.5 border border-gray-200 text-center">
                              {displayGroup}
                            </td>
                            <td className="py-2 px-2.5 border border-gray-200 text-center">
                              {subjCount} টি বিষয়
                            </td>
                            <td className="py-2 px-3 border border-gray-200 font-mono text-gray-600">
                              {s.guardianPhone || s.phone || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Signatures Area */}
                <div className="mt-12 pt-8 flex items-center justify-between text-xs text-gray-600 border-t border-gray-100">
                  <div className="text-center border-t border-dashed border-gray-400 pt-1 w-32">
                    শ্রেণি শিক্ষকের স্বাক্ষর
                  </div>
                  <div className="text-center border-t border-dashed border-gray-400 pt-1 w-32">
                    হিসাবরক্ষক
                  </div>
                  <div className="text-center border-t border-dashed border-gray-400 pt-1 w-36">
                    প্রধান শিক্ষকের স্বাক্ষর ও সিল
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Full Info & Profile View Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative border border-gray-100 max-h-[92vh] overflow-y-auto space-y-6 text-xs text-gray-800">
            {/* Close Button placed at Absolute Top Right Corner */}
            <button
              type="button"
              onClick={() => setViewingStudent(null)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition cursor-pointer z-30 shadow-2xs"
              title="বন্ধ করুন (Close)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title & Actions Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 pr-10 sm:pr-12">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>শিক্ষার্থীর পূর্ণাঙ্গ তথ্য বিবরণী ও প্রোফাইল</span>
                </h3>
                <p className="text-[11px] text-gray-500">
                  সিস্টেম আইডি: <span className="font-mono font-semibold">{viewingStudent.id}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openSingleStudentPrint(viewingStudent)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold transition cursor-pointer shadow-2xs"
                  title="এই শিক্ষার্থীর তথ্য প্রিন্ট করুন"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-700" />
                  <span>প্রিন্ট করুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSingleStudentPdf(viewingStudent)}
                  disabled={isExportingStudentPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 rounded-xl font-bold transition cursor-pointer shadow-2xs disabled:opacity-60"
                  title="সরাসরি PDF ফাইল ডাউনলোড করুন"
                >
                  {isExportingStudentPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-700" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5 text-blue-700" />
                  )}
                  <span>PDF ডাউনলোড</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const stu = viewingStudent;
                    setViewingStudent(null);
                    openEditModal(stu);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 rounded-xl font-bold transition cursor-pointer shadow-2xs"
                  title="তথ্য পরিবর্তন করুন"
                >
                  <Edit2 className="w-3.5 h-3.5 text-gray-700" />
                  <span>এডিট করুন</span>
                </button>
              </div>
            </div>

            {/* Profile Hero Card */}
            {(() => {
              const sClass = viewingStudent.class || viewingStudent.studentClass;
              const displayGroup = viewingStudent.group || 'সাধারণ';
              const studentPhoto = viewingStudent.image || getStudentPhoto(viewingStudent);
              const subjectList =
                viewingStudent.subjects && viewingStudent.subjects.length > 0
                  ? viewingStudent.subjects
                  : getSubjectsForClassAndGroup(sClass, displayGroup);

              const studentResults = examResults.filter(
                (r) => r.studentId === viewingStudent.id || r.roll === viewingStudent.roll
              );

              return (
                <div className="space-y-6">
                  {/* Hero Banner */}
                  <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-emerald-50/80 border border-emerald-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-white border-2 border-emerald-500 shadow-md shrink-0 flex items-center justify-center">
                      {studentPhoto ? (
                        <img src={studentPhoto} alt={viewingStudent.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl font-bold text-emerald-800">{viewingStudent.name.charAt(0)}</span>
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h2 className="text-xl font-bold text-gray-900">{viewingStudent.name}</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-2xs">
                          রোল: {viewingStudent.roll}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                        <span className="px-2.5 py-0.5 bg-white border border-emerald-200 text-emerald-800 rounded-lg font-semibold">
                          শ্রেণি: {sClass} ({viewingStudent.section})
                        </span>
                        <span className="px-2.5 py-0.5 bg-white border border-emerald-200 text-emerald-800 rounded-lg font-semibold">
                          বিভাগ: {displayGroup}
                        </span>
                        <span className="px-2.5 py-0.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium">
                          লিঙ্গ: {viewingStudent.gender || 'ছাত্র'}
                        </span>
                      </div>

                      <p className="text-gray-500 text-[11px] pt-0.5 flex items-center justify-center sm:justify-start gap-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>যোগাযোগ: <b className="font-mono text-gray-700">{viewingStudent.guardianPhone || viewingStudent.phone || 'দেওয়া নেই'}</b></span>
                      </p>
                    </div>
                  </div>

                  {/* Two Column Detailed Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Academic & Personal Info */}
                    <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200 space-y-3">
                      <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5 pb-2 border-b border-gray-200">
                        <School className="w-4 h-4 text-emerald-700" />
                        <span>শিক্ষার্থীর ব্যক্তিগত ও একাডেমিক তথ্য</span>
                      </h4>

                      <div className="space-y-2 text-xs divide-y divide-gray-100">
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-gray-500">শিক্ষার্থীর পূর্ণ নাম:</span>
                          <span className="font-bold text-gray-900">{viewingStudent.name}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-gray-500">রোল নম্বর:</span>
                          <span className="font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-gray-200">
                            {viewingStudent.roll}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-gray-500">শ্রেণি ও শাখা:</span>
                          <span className="font-semibold text-gray-800">{sClass} ({viewingStudent.section})</span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-gray-500">বিভাগ (Group):</span>
                          <span className="font-semibold text-emerald-800">{displayGroup}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-gray-500">জেন্ডার / লিঙ্গ:</span>
                          <span className="font-medium text-gray-800">{viewingStudent.gender || 'ছাত্র'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-gray-500">জন্ম তারিখ:</span>
                          <span className="font-medium text-gray-800">{viewingStudent.dateOfBirth || 'তথ্য দেওয়া নেই'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-gray-500">সিস্টেম স্টুডেন্ট আইডি:</span>
                          <span className="font-mono text-gray-500 text-[11px]">{viewingStudent.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Family & Contact Info */}
                    <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200 space-y-3">
                      <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5 pb-2 border-b border-gray-200">
                        <Users className="w-4 h-4 text-emerald-700" />
                        <span>অভিভাবক ও যোগাযোগের তথ্য</span>
                      </h4>

                      <div className="space-y-2 text-xs divide-y divide-gray-100">
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-gray-500">পিতার নাম:</span>
                          <span className="font-semibold text-gray-900">
                            {viewingStudent.fatherName || viewingStudent.guardianName || 'তথ্য দেওয়া নেই'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-gray-500">মাতার নাম:</span>
                          <span className="font-semibold text-gray-900">
                            {viewingStudent.motherName || 'তথ্য দেওয়া নেই'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-gray-500">স্থানীয় অভিভাবক:</span>
                          <span className="font-medium text-gray-800">
                            {viewingStudent.guardianName || viewingStudent.fatherName || 'তথ্য দেওয়া নেই'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-gray-500">অভিভাবক ফোন নম্বর:</span>
                          <span className="font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-gray-200">
                            {viewingStudent.guardianPhone || viewingStudent.phone || 'তথ্য দেওয়া নেই'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-gray-500">পূর্ববর্তী শিক্ষা প্রতিষ্ঠান:</span>
                          <span className="font-medium text-gray-800">
                            {viewingStudent.previousSchool || 'প্রযোজ্য নয়'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5 pt-1.5">
                          <span className="text-gray-500">বর্তমান ঠিকানা:</span>
                          <span className="font-medium text-gray-800 bg-white p-1.5 rounded border border-gray-200 text-[11px]">
                            {viewingStudent.presentAddress || 'দাদরা, জয়পুরহাট'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Subjects Card */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-emerald-700" />
                        <span>নির্ধারিত বিষয়সমূহ ({subjectList.length} টি)</span>
                      </h4>
                      <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                        কারিকুলাম ভিত্তিক বিষয় বিন্যাস
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {subjectList.map((subject, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                        >
                          <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-800 text-[10px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span>{subject}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exam Results & Performance Section */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-600" />
                        <span>পরীক্ষার ফলাফল ও একাডেমিক পারফরম্যান্স</span>
                      </h4>
                      <span className="text-[11px] text-gray-500">
                        {studentResults.length > 0 ? `${studentResults.length} টি পরীক্ষার ফলাফল পাওয়া গেছে` : 'কোনো ফলাফল নেই'}
                      </span>
                    </div>

                    {studentResults.length === 0 ? (
                      <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-400">
                        এই শিক্ষার্থীর জন্য এখনও কোনো পরীক্ষার ফলাফল ডাটাবেজে অন্তর্ভুক্ত করা হয়নি।
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {studentResults.map((res) => (
                          <div
                            key={res.id}
                            className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5"
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div>
                                <span className="font-bold text-gray-900 text-xs">{res.examTerm}</span>
                                <span className="text-[10px] text-gray-500 ml-2">
                                  মোট নম্বর: <b className="text-gray-800">{res.totalMarks}</b>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-xs">
                                  GPA: {res.gpa}
                                </span>
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-xs">
                                  গ্রেড: {res.grade}
                                </span>
                              </div>
                            </div>

                            {res.subjects && res.subjects.length > 0 && (
                              <div className="overflow-x-auto pt-1">
                                <table className="w-full text-left text-[11px] border-collapse">
                                  <thead>
                                    <tr className="bg-gray-200 text-gray-700">
                                      <th className="p-1.5 border border-gray-300">বিষয়</th>
                                      <th className="p-1.5 border border-gray-300 text-center">প্রাপ্ত নম্বর</th>
                                      <th className="p-1.5 border border-gray-300 text-center">গ্রেড পয়েন্ট</th>
                                      <th className="p-1.5 border border-gray-300 text-center">গ্রেড</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {res.subjects.map((sub, sIdx) => (
                                      <tr key={sIdx} className="bg-white odd:bg-gray-50/50">
                                        <td className="p-1.5 border border-gray-200 font-medium">{sub.subject}</td>
                                        <td className="p-1.5 border border-gray-200 text-center font-mono font-bold text-emerald-800">
                                          {sub.marks}
                                        </td>
                                        <td className="p-1.5 border border-gray-200 text-center font-mono">
                                          {sub.gradePoint}
                                        </td>
                                        <td className="p-1.5 border border-gray-200 text-center font-bold text-gray-800">
                                          {sub.grade}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer actions inside modal */}
                  <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setViewingStudent(null)}
                      className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                    >
                      বন্ধ করুন
                    </button>
                    <button
                      type="button"
                      onClick={() => openSingleStudentPrint(viewingStudent)}
                      className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl transition cursor-pointer border border-emerald-200 inline-flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>প্রোফাইল প্রিন্ট</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadSingleStudentPdf(viewingStudent)}
                      disabled={isExportingStudentPdf}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-xl transition cursor-pointer border border-blue-200 inline-flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {isExportingStudentPdf ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-700" />
                      ) : (
                        <FileDown className="w-3.5 h-3.5 text-blue-700" />
                      )}
                      <span>PDF ডাউনলোড</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const stu = viewingStudent;
                        setViewingStudent(null);
                        openEditModal(stu);
                      }}
                      className="px-5 py-2 bg-[#15803d] hover:bg-[#166534] text-white font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>তথ্য পরিবর্তন করুন</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Dedicated Single Student Official Profile Print & PDF Modal */}
      {printingStudent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl relative border border-gray-100 max-h-[95vh] flex flex-col">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setPrintingStudent(null)}
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
                  <span>শিক্ষার্থী তথ্য বিবরণী ও পরিচিতিপত্র প্রিন্ট</span>
                </h3>
                <p className="text-xs text-gray-500">
                  {printingStudent.name} (রোল: {printingStudent.roll}) এর অফিশিয়াল ডকুমেন্ট
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => executeSingleStudentPrint(printingStudent)}
                  disabled={isPrintingSingle}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#15803d] hover:bg-[#166534] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-60"
                  title="প্রিন্টার দিয়ে প্রিন্ট করুন"
                >
                  {isPrintingSingle ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Printer className="w-3.5 h-3.5" />
                  )}
                  <span>{isPrintingSingle ? 'প্রিন্ট হচ্ছে...' : 'এখনই প্রিন্ট করুন'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSingleStudentPdf(printingStudent)}
                  disabled={isExportingStudentPdf}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-60"
                  title="পিডিএফ ফাইল সরাসরি ডাউনলোড করুন"
                >
                  {isExportingStudentPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5" />
                  )}
                  <span>{isExportingStudentPdf ? 'PDF তৈরি হচ্ছে...' : 'PDF সেভ করুন'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSingleStudentHtml(printingStudent)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition cursor-pointer"
                  title="অফলাইন ফাইল ডাউনলোড"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>অফলাইন ফাইল</span>
                </button>
              </div>
            </div>

            {/* Document Content View */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-gray-50/50 rounded-2xl my-3 border border-gray-100">
              {(() => {
                const sClass = printingStudent.class || printingStudent.studentClass;
                const displayGroup = printingStudent.group || 'সাধারণ';
                const studentPhoto = printingStudent.image || getStudentPhoto(printingStudent);
                const subjectList =
                  printingStudent.subjects && printingStudent.subjects.length > 0
                    ? printingStudent.subjects
                    : getSubjectsForClassAndGroup(sClass, displayGroup);
                const studentResults = examResults.filter(
                  (r) => r.studentId === printingStudent.id || r.roll === printingStudent.roll
                );

                return (
                  <div
                    id="printable-single-student-card"
                    className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-gray-200 text-gray-900 mx-auto max-w-2xl text-xs"
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
                        শিক্ষার্থী পরিচিতিপত্র ও তথ্য বিবরণী
                      </div>
                    </div>

                    {/* Student Hero Row */}
                    <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-3.5 mb-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-600 bg-white shrink-0 flex items-center justify-center">
                        {studentPhoto ? (
                          <img src={studentPhoto} alt={printingStudent.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-bold text-emerald-800">{printingStudent.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-base font-bold text-gray-900">{printingStudent.name}</h3>
                        <p className="text-xs text-emerald-800 font-semibold">
                          শ্রেণি: {sClass} ({printingStudent.section}) • রোল: <b>{printingStudent.roll}</b> • বিভাগ: {displayGroup}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          লিঙ্গ: {printingStudent.gender || 'ছাত্র'} • সিস্টেম আইডি: {printingStudent.id}
                        </p>
                      </div>
                    </div>

                    {/* Detailed Info Table */}
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full border-collapse border border-gray-200 text-xs">
                        <tbody>
                          <tr className="border-b border-gray-200">
                            <th className="bg-gray-100 p-2 text-left w-1/4 font-semibold text-gray-700 border-r border-gray-200">
                              শিক্ষার্থীর নাম
                            </th>
                            <td className="p-2 font-bold text-gray-900 border-r border-gray-200">
                              {printingStudent.name}
                            </td>
                            <th className="bg-gray-100 p-2 text-left w-1/4 font-semibold text-gray-700 border-r border-gray-200">
                              রোল নম্বর
                            </th>
                            <td className="p-2 font-mono font-bold text-emerald-800">
                              {printingStudent.roll}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <th className="bg-gray-100 p-2 text-left font-semibold text-gray-700 border-r border-gray-200">
                              শ্রেণি ও শাখা
                            </th>
                            <td className="p-2 border-r border-gray-200">
                              {sClass} ({printingStudent.section})
                            </td>
                            <th className="bg-gray-100 p-2 text-left font-semibold text-gray-700 border-r border-gray-200">
                              বিভাগ (Group)
                            </th>
                            <td className="p-2 font-semibold text-emerald-800">
                              {displayGroup}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <th className="bg-gray-100 p-2 text-left font-semibold text-gray-700 border-r border-gray-200">
                              পিতার নাম
                            </th>
                            <td className="p-2 border-r border-gray-200">
                              {printingStudent.fatherName || printingStudent.guardianName || 'তথ্য নেই'}
                            </td>
                            <th className="bg-gray-100 p-2 text-left font-semibold text-gray-700 border-r border-gray-200">
                              মাতার নাম
                            </th>
                            <td className="p-2">
                              {printingStudent.motherName || 'তথ্য নেই'}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <th className="bg-gray-100 p-2 text-left font-semibold text-gray-700 border-r border-gray-200">
                              অভিভাবক ও যোগাযোগ
                            </th>
                            <td className="p-2 border-r border-gray-200 font-mono text-emerald-800">
                              {printingStudent.guardianPhone || printingStudent.phone || '—'}
                            </td>
                            <th className="bg-gray-100 p-2 text-left font-semibold text-gray-700 border-r border-gray-200">
                              জন্ম তারিখ
                            </th>
                            <td className="p-2">
                              {printingStudent.dateOfBirth || '—'}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <th className="bg-gray-100 p-2 text-left font-semibold text-gray-700 border-r border-gray-200">
                              পূর্ববর্তী বিদ্যালয়
                            </th>
                            <td className="p-2 border-r border-gray-200">
                              {printingStudent.previousSchool || 'প্রযোজ্য নয়'}
                            </td>
                            <th className="bg-gray-100 p-2 text-left font-semibold text-gray-700 border-r border-gray-200">
                              বর্তমান ঠিকানা
                            </th>
                            <td className="p-2">
                              {printingStudent.presentAddress || 'দাদরা, বগুড়া'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Enrolled Subjects Box */}
                    <div className="mb-4">
                      <h4 className="font-bold text-xs text-gray-800 mb-1.5 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                        <span>নির্ধারিত বিষয়সমূহ ({subjectList.length} টি):</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {subjectList.map((sub, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Results (if any) */}
                    {studentResults.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-bold text-xs text-gray-800 mb-1.5 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span>সাম্প্রতিক পরীক্ষার ফলাফল:</span>
                        </h4>
                        <table className="w-full border-collapse border border-gray-200 text-xs">
                          <thead>
                            <tr className="bg-gray-100 text-gray-700">
                              <th className="border border-gray-200 p-1.5 text-left">টার্ম</th>
                              <th className="border border-gray-200 p-1.5 text-center">মোট নম্বর</th>
                              <th className="border border-gray-200 p-1.5 text-center">GPA</th>
                              <th className="border border-gray-200 p-1.5 text-center">গ্রেড</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentResults.map((r) => (
                              <tr key={r.id}>
                                <td className="border border-gray-200 p-1.5 font-medium">{r.examTerm}</td>
                                <td className="border border-gray-200 p-1.5 text-center font-mono font-bold text-emerald-800">
                                  {r.totalMarks}
                                </td>
                                <td className="border border-gray-200 p-1.5 text-center font-mono font-bold text-emerald-800">
                                  {r.gpa}
                                </td>
                                <td className="border border-gray-200 p-1.5 text-center font-bold text-gray-800">
                                  {r.grade}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Official Signatures Row */}
                    <div className="mt-12 pt-6 flex items-center justify-between text-xs text-gray-600 border-t border-dashed border-gray-300">
                      <div className="text-center">
                        <div className="w-28 border-t border-gray-400 pt-1 font-semibold text-gray-700">
                          অভিভাবকের স্বাক্ষর
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="w-32 border-t border-gray-400 pt-1 font-semibold text-gray-700">
                          শ্রেণি শিক্ষকের স্বাক্ষর
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="w-40 border-t border-gray-400 pt-1 font-semibold text-gray-700">
                          প্রধান শিক্ষকের স্বাক্ষর ও সিল
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Deleted Students Recycle Bin Modal (মুছে ফেলা শিক্ষার্থী রিস্টোর মডাল) */}
      {showDeletedStudentsModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl relative border border-gray-100 space-y-4 text-xs text-gray-800 max-h-[92vh] overflow-y-auto">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowDeletedStudentsModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-800 flex items-center justify-center border border-rose-200 shrink-0">
                <ArchiveRestore className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  মুছে ফেলা শিক্ষার্থী তালিকা ও পুনরুদ্ধার (Recycle Bin)
                </h3>
                <p className="text-[11px] text-gray-500">
                  ভুল করে মুছে ফেলা শিক্ষার্থীকে এক ক্লিকে মূল সক্রিয় শিক্ষার্থী তালিকায় ফিরিয়ে আনুন
                </p>
              </div>
            </div>

            {/* Info Notice */}
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-3 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <p className="font-bold">ভুল করে কোনো শিক্ষার্থী মুছে গেলে চিন্তার কারণ নেই!</p>
                  <p className="text-[11px] text-emerald-800">
                    নিচের তালিকা থেকে যেকোনো শিক্ষার্থীর পাশে <b>"পুনরায় যুক্ত করুন"</b> বাটনে চাপ দিলে তিনি সাথে সাথে মূল সক্রিয় শিক্ষার্থী তালিকায় রোল ও তথ্যসহ ফিরে যাবেন।
                  </p>
                </div>
              </div>
              {deletedStudents.length > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleRestoreAllDeleted}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>সব শিক্ষার্থী রিস্টোর করুন</span>
                  </button>
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="মুছে ফেলা শিক্ষার্থীর নাম বা রোল দিয়ে খুঁজুন..."
                value={deletedSearchQuery}
                onChange={(e) => setDeletedSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-rose-600 focus:bg-white"
              />
              {deletedSearchQuery && (
                <button
                  type="button"
                  onClick={() => setDeletedSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {filteredDeletedStudents.length === 0 ? (
              <div className="text-center py-12 text-gray-400 space-y-2">
                <Inbox className="w-10 h-10 mx-auto text-gray-300" />
                <p className="font-medium text-gray-600">
                  {deletedStudents.length === 0
                    ? 'রিসাইকেল বিনে কোনো মুছে ফেলা শিক্ষার্থী নেই।'
                    : 'খুঁজে পাওয়া যায়নি।'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-100 max-h-[50vh] overflow-y-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider text-[11px] border-b border-gray-100 sticky top-0 bg-gray-50 z-10">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">ছবি</th>
                      <th className="py-3 px-4">নাম ও আইডি</th>
                      <th className="py-3 px-4">শ্রেণি ও রোল</th>
                      <th className="py-3 px-4">অভিভাবক ও ফোন</th>
                      <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredDeletedStudents.map((s) => {
                      const studentPhoto = s.image || getStudentPhoto(s);
                      const sClass = s.class || s.studentClass || '১০ম শ্রেণি';
                      return (
                        <tr key={s.id} className="hover:bg-gray-50/70 transition">
                          <td className="py-3 px-4 text-center">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-rose-50 border border-rose-200 flex items-center justify-center font-bold text-rose-800 text-xs shrink-0 mx-auto">
                              {studentPhoto ? (
                                <img src={studentPhoto} alt={s.name} className="w-full h-full object-cover" />
                              ) : (
                                <span>{s.name.charAt(0)}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                            <p className="text-[11px] text-gray-400 font-mono">আইডি: {s.id}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                              রোল: {s.roll}
                            </span>
                            <span className="block text-gray-600 text-[11px] mt-0.5">
                              {sClass} ({s.section || 'A'}) • {s.group || 'সাধারণ'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-800">{s.guardianName || s.fatherName || 'অভিভাবক'}</p>
                            <p className="text-gray-500 font-mono text-[11px]">{s.guardianPhone || s.phone || '—'}</p>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Restore Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  handleRestoreStudent(s);
                                  if (deletedStudents.length === 1) {
                                    setShowDeletedStudentsModal(false);
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
                                title="শিক্ষার্থীকে আবার মূল সক্রিয় তালিকায় যুক্ত করুন"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>পুনরায় যুক্ত করুন</span>
                              </button>

                              {/* Permanent Delete */}
                              <button
                                type="button"
                                onClick={() => handlePermanentDelete(s)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition cursor-pointer"
                                title="স্থায়ীভাবে মুছে ফেলুন"
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
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-[11px] text-gray-400">
                রিসাইকেল বিনে মোট শিক্ষার্থী: {deletedStudents.length} জন
              </span>
              <button
                type="button"
                onClick={() => setShowDeletedStudentsModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs cursor-pointer transition"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
