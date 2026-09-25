import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Inbox,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  X,
  Phone,
  User,
  Calendar,
  MapPin,
  Building,
  Award,
  UserPlus,
  Sparkles,
  CheckCheck,
  Search,
  Filter,
  AlertCircle,
  RotateCcw,
  Printer,
  FileDown,
  Loader2,
  Download,
  BookOpen,
  GraduationCap,
  Mail,
  FileText,
  School,
  Users,
  UserCheck,
  Check,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AdmissionApplication } from '../../types';
import { getStudentPhoto } from '../../utils/studentPhoto';
import { getSubjectsForClassAndGroup } from '../../data/curriculumSubjects';

interface ApprovedStudentPopupData {
  studentName: string;
  studentId: string;
  roll: string;
  studentClass: string;
  section: string;
  group: string;
  fatherName?: string;
  motherName?: string;
  phone: string;
  image?: string;
  approvedAt: string;
  application: AdmissionApplication;
}

export const ManageAdmissions: React.FC = () => {
  const { admissions, updateAdmissionStatus, deleteAdmission, addStudent, students, siteSettings } = useSchool();
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<'all' | 'অপেক্ষমাণ' | 'অনুমোদিত' | 'বাতিল'>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mandatory Approval & Enrollment Modal State
  const [enrollingApp, setEnrollingApp] = useState<AdmissionApplication | null>(null);
  const [approvalStudentId, setApprovalStudentId] = useState<string>('');
  const [approvalRoll, setApprovalRoll] = useState<string>('');
  const [approvalClass, setApprovalClass] = useState<string>('');
  const [approvalSection, setApprovalSection] = useState<string>('A');
  const [approvalGroup, setApprovalGroup] = useState<string>('সাধারণ');
  const [approvalErrors, setApprovalErrors] = useState<{
    studentId?: string;
    roll?: string;
    general?: string;
  }>({});

  // Deleted Admissions Trash Bin Archive State
  const [trashAdmissions, setTrashAdmissions] = useState<AdmissionApplication[]>(() => {
    const saved = localStorage.getItem('dhs_trash_admissions');
    return saved ? JSON.parse(saved) : [];
  });
  const [showTrashModal, setShowTrashModal] = useState(false);

  // Approved Student Success Popup Modal state
  const [approvedPopupData, setApprovedPopupData] = useState<ApprovedStudentPopupData | null>(null);
  const [copiedStudentId, setCopiedStudentId] = useState(false);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'warning' | 'info';
    text: string;
  } | null>(null);

  const showToast = (type: 'success' | 'warning' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const getStatusBadge = (status: AdmissionApplication['status']) => {
    switch (status) {
      case 'অনুমোদিত':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'বাতিল':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  // Helper to check if a student matching this application is already enrolled in the students list
  const findEnrolledStudent = (app: AdmissionApplication) => {
    const cleanAppPhone = app.phone ? app.phone.replace(/\D/g, '') : '';
    const cleanAppName = app.applicantName.trim().toLowerCase();

    return students.find((s) => {
      const cleanStuPhone = (s.phone || s.guardianPhone || '').replace(/\D/g, '');
      const cleanStuName = s.name.trim().toLowerCase();

      // 1. Same phone and same class
      const phoneMatch =
        cleanAppPhone.length >= 8 &&
        cleanStuPhone.length >= 8 &&
        cleanAppPhone === cleanStuPhone &&
        (s.class === app.applyingClass || s.studentClass === app.applyingClass);

      // 2. Same student name and same class
      const nameAndClassMatch =
        cleanAppName === cleanStuName &&
        (s.class === app.applyingClass || s.studentClass === app.applyingClass);

      // 3. Same name and father name
      const fatherMatch =
        Boolean(app.fatherName) &&
        Boolean(s.fatherName || s.guardianName) &&
        (s.fatherName || s.guardianName)?.trim().toLowerCase() === app.fatherName.trim().toLowerCase() &&
        cleanAppName === cleanStuName;

      return phoneMatch || nameAndClassMatch || fatherMatch;
    });
  };

  // Open the Mandatory Approval Modal
  const openApprovalModal = (app: AdmissionApplication) => {
    const existing = findEnrolledStudent(app);
    if (existing) {
      if (app.status !== 'অনুমোদিত') {
        updateAdmissionStatus(app.id, 'অনুমোদিত');
      }
      showToast(
        'warning',
        `⚠️ "${app.applicantName}" ইতিপূর্বেই ${
          existing.class || existing.studentClass || app.applyingClass
        } এর শিক্ষার্থী তালিকায় (রোল নং ${existing.roll})-এ যুক্ত আছেন। ডুপ্লিকেট হিসেবে দ্বিতীয়বার যুক্ত করা যাবে না।`
      );
      return;
    }

    const targetClass = app.applyingClass || '৬ষ্ঠ শ্রেণি';
    const targetSection = app.section || 'A';
    const isClass910 =
      targetClass.includes('৯ম') ||
      targetClass.includes('১০ম') ||
      targetClass.includes('9') ||
      targetClass.includes('10');
    const targetGroup = isClass910 ? (app.group && app.group !== 'সাধারণ' ? app.group : 'বিজ্ঞান') : 'সাধারণ';

    // Calculate next suggested roll
    const studentsInClassSection = students.filter(
      (s) => (s.class === targetClass || s.studentClass === targetClass) && (s.section || 'A') === targetSection
    );
    const suggestedRoll = `${studentsInClassSection.length + 1}`;

    // Suggested ID format
    const yr = app.appliedDate ? app.appliedDate.split('-')[0] : new Date().getFullYear().toString();
    const suggestedId = `stu-${yr}-${app.id.replace('adm-', '')}`;

    setEnrollingApp(app);
    setApprovalStudentId(suggestedId);
    setApprovalRoll(suggestedRoll);
    setApprovalClass(targetClass);
    setApprovalSection(targetSection);
    setApprovalGroup(targetGroup);
    setApprovalErrors({});
  };

  // Submit and strictly validate mandatory Student ID and Roll before approving
  const handleConfirmApproval = () => {
    if (!enrollingApp) return;

    const errors: { studentId?: string; roll?: string; general?: string } = {};
    const cleanStudentId = approvalStudentId.trim();
    const cleanRoll = approvalRoll.trim();

    // MANDATORY REQUIREMENT 1: Student ID
    if (!cleanStudentId) {
      errors.studentId = 'শিক্ষার্থী আইডি (Student ID) দেওয়া বাধ্যতামূলক! আইডি ছাড়া অনুমোদন সম্পন্ন হবে না।';
    } else if (students.some((s) => s.id.toLowerCase() === cleanStudentId.toLowerCase())) {
      errors.studentId = `এই শিক্ষার্থী আইডি "${cleanStudentId}" ইতিমধ্যে অন্য এক শিক্ষার্থীর জন্য ব্যবহৃত হচ্ছে। ভিন্ন ইউনিক আইডি দিন।`;
    }

    // MANDATORY REQUIREMENT 2: Roll Number
    if (!cleanRoll) {
      errors.roll = 'রোল নম্বর দেওয়া বাধ্যতামূলক! রোল নম্বর ছাড়া অনুমোদন সম্পন্ন হবে না।';
    } else if (
      students.some(
        (s) =>
          (s.class === approvalClass || s.studentClass === approvalClass) &&
          (s.section || 'A') === approvalSection &&
          s.roll.trim() === cleanRoll
      )
    ) {
      errors.roll = `"${approvalClass}" এর "${approvalSection}" শাখায় রোল নং ${cleanRoll} ইতিমধ্যে ব্যবহৃত হচ্ছে! অনুগ্রহ করে ভিন্ন রোল নম্বর দিন।`;
    }

    if (errors.studentId || errors.roll) {
      setApprovalErrors(errors);
      return;
    }

    // Prevent duplicate student creation
    const existing = findEnrolledStudent(enrollingApp);
    if (existing) {
      errors.general = `"${enrollingApp.applicantName}" ইতিপূর্বেই শ্রেণি: ${existing.class || existing.studentClass}, রোল: ${existing.roll}-এ বিদ্যমান।`;
      setApprovalErrors(errors);
      return;
    }

    const studentPhoto =
      enrollingApp.image ||
      getStudentPhoto({
        name: enrollingApp.applicantName,
        studentClass: approvalClass,
      });

    // Calculate assigned subjects from curriculum & application
    const assignedSubjects =
      enrollingApp.subjects && enrollingApp.subjects.length > 0
        ? enrollingApp.subjects
        : getSubjectsForClassAndGroup(approvalClass, approvalGroup);

    // Add student with the MANDATORY provided Student ID and Roll
    addStudent({
      id: cleanStudentId,
      name: enrollingApp.applicantName,
      roll: cleanRoll,
      studentClass: approvalClass,
      class: approvalClass,
      section: approvalSection,
      group: approvalGroup,
      subjects: assignedSubjects,
      guardianName: enrollingApp.fatherName || 'অভিভাবক',
      phone: enrollingApp.phone,
      guardianPhone: enrollingApp.phone,
      image: studentPhoto,
      fatherName: enrollingApp.fatherName,
      motherName: enrollingApp.motherName,
      dateOfBirth: enrollingApp.dateOfBirth,
      gender: enrollingApp.gender,
      previousSchool: enrollingApp.previousSchool,
      presentAddress: enrollingApp.presentAddress,
    });

    // Mark admission as approved and store the assigned roll
    updateAdmissionStatus(enrollingApp.id, 'অনুমোদিত');

    // If this application was in trash, remove from trash
    setTrashAdmissions((prev) => {
      const updated = prev.filter((a) => a.id !== enrollingApp.id);
      localStorage.setItem('dhs_trash_admissions', JSON.stringify(updated));
      return updated;
    });

    const currentEnrollingApp = enrollingApp;
    const approvedData: ApprovedStudentPopupData = {
      studentName: currentEnrollingApp.applicantName,
      studentId: cleanStudentId,
      roll: cleanRoll,
      studentClass: approvalClass,
      section: approvalSection,
      group: approvalGroup,
      fatherName: currentEnrollingApp.fatherName,
      motherName: currentEnrollingApp.motherName,
      phone: currentEnrollingApp.phone,
      image: studentPhoto,
      approvedAt: new Date().toLocaleString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      application: {
        ...currentEnrollingApp,
        status: 'অনুমোদিত',
        roll: cleanRoll,
      },
    };

    setEnrollingApp(null);
    setApprovedPopupData(approvedData);
    setCopiedStudentId(false);

    showToast(
      'success',
      `✓ শিক্ষার্থী অনুমোদন করা হয়েছে: "${currentEnrollingApp.applicantName}" (শ্রেণি: ${approvalClass}, রোল: ${cleanRoll}, আইডি: ${cleanStudentId})`
    );

    const approvedAppId = currentEnrollingApp.id;
    if (selectedApp && selectedApp.id === approvedAppId) {
      setSelectedApp((prev) => (prev ? { ...prev, status: 'অনুমোদিত', roll: cleanRoll } : null));
    }
  };

  // Safe delete with Trash archive
  const handleDeleteAdmissionWithTrash = (app: AdmissionApplication) => {
    if (confirm(`আপনি কি "${app.applicantName}" এর আবেদনটি মুছে ফেলতে চান? (এটি রিসাইকেল বিনে সংরক্ষিত থাকবে এবং পরবর্তীতে ফিরিয়ে আনা যাবে)`)) {
      setTrashAdmissions((prev) => {
        const updated = [app, ...prev.filter((a) => a.id !== app.id)];
        localStorage.setItem('dhs_trash_admissions', JSON.stringify(updated));
        return updated;
      });
      deleteAdmission(app.id);
      if (selectedApp && selectedApp.id === app.id) {
        setSelectedApp(null);
      }
      showToast('info', `"${app.applicantName}" এর আবেদনটি মুছে ফেলা হয়েছে (মুছে ফেলা তালিকায় সংরক্ষিত)।`);
    }
  };

  // Restore admission from trash to active list
  const handleRestoreFromTrash = (app: AdmissionApplication) => {
    setTrashAdmissions((prev) => {
      const updated = prev.filter((a) => a.id !== app.id);
      localStorage.setItem('dhs_trash_admissions', JSON.stringify(updated));
      return updated;
    });
    // Add back to admissions
    submitAdmissionDirect(app);
    showToast('success', `✓ "${app.applicantName}" এর আবেদনটি সফলভাবে ফিরিয়ে আনা হয়েছে।`);
  };

  // Helper to re-insert admission into admissions list
  const submitAdmissionDirect = (app: AdmissionApplication) => {
    const currentAdmissions: AdmissionApplication[] = JSON.parse(
      localStorage.getItem('dhs_admissions') || '[]'
    );
    const updated = [app, ...currentAdmissions.filter((a) => a.id !== app.id)];
    localStorage.setItem('dhs_admissions', JSON.stringify(updated));
    // Also trigger status update to re-sync
    updateAdmissionStatus(app.id, app.status || 'অপেক্ষমাণ');
    window.location.reload();
  };

  // Permanently delete from trash
  const handlePermanentDeleteFromTrash = (appId: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই আবেদনটি স্থায়ীভাবে সম্পূর্ণ মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।')) {
      setTrashAdmissions((prev) => {
        const updated = prev.filter((a) => a.id !== appId);
        localStorage.setItem('dhs_trash_admissions', JSON.stringify(updated));
        return updated;
      });
      showToast('info', 'আবেদনটি স্থায়ীভাবে সম্পূর্ণ মুছে ফেলা হয়েছে।');
    }
  };

  const handlePrintAdmission = (targetApp?: AdmissionApplication | null) => {
    const app = targetApp || selectedApp;
    if (!app) return;
    if (!selectedApp || selectedApp.id !== app.id) {
      setSelectedApp(app);
    }
    setIsPrinting(true);
    setTimeout(() => {
      try {
        window.print();
      } catch (err) {
        console.error('Print error:', err);
      } finally {
        setIsPrinting(false);
      }
    }, 150);
  };

  const handleDownloadAdmissionPdf = async (targetApp?: AdmissionApplication | null) => {
    const app = targetApp || selectedApp;
    if (!app) return;
    if (!selectedApp || selectedApp.id !== app.id) {
      setSelectedApp(app);
    }

    setIsExportingPdf(true);
    setTimeout(async () => {
      try {
        const element = document.getElementById('printable-admission-card');
        if (!element) {
          handleDownloadAdmissionHtml(app);
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

        const cleanName = app.applicantName.replace(/\s+/g, '_');
        pdf.save(`${cleanName}_ভর্তি_আবেদন_${app.id}.pdf`);
      } catch (err) {
        console.error('PDF generation error:', err);
        handleDownloadAdmissionHtml(app);
      } finally {
        setIsExportingPdf(false);
      }
    }, 200);
  };

  const handleDownloadAdmissionHtml = (app: AdmissionApplication) => {
    const schoolName = siteSettings?.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়';
    const address = siteSettings?.address || 'দাদরা, জয়পুরহাট';
    const phone = siteSettings?.phone1 || '+৮৮০১৭১২-৩৪৫৬৭৮';
    const photo =
      app.image ||
      getStudentPhoto({
        name: app.applicantName,
        studentClass: app.applyingClass,
      });

    const enrolled = findEnrolledStudent(app);

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${app.applicantName} - ভর্তি আবেদন ফরম</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hind Siliguri", sans-serif; margin: 0; padding: 20px; color: #1e293b; background: #fff; }
    .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 10px; margin-bottom: 16px; }
    .school-name { font-size: 22px; font-weight: bold; color: #065f46; margin: 0; }
    .school-meta { font-size: 11px; color: #64748b; margin: 4px 0 0; }
    .badge { display: inline-block; padding: 3px 12px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; font-size: 11px; font-weight: bold; color: #065f46; margin-top: 6px; }
    .hero { display: flex; align-items: center; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; }
    .photo { width: 75px; height: 75px; border-radius: 12px; object-fit: cover; border: 2px solid #059669; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px; }
    th { background: #f1f5f9; padding: 6px 10px; border: 1px solid #cbd5e1; text-align: left; width: 25%; color: #334155; }
    td { padding: 6px 10px; border: 1px solid #cbd5e1; }
    .signatures { margin-top: 45px; display: flex; justify-content: space-between; font-size: 11px; }
    .sign-box { text-align: center; border-top: 1px dashed #64748b; width: 140px; padding-top: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="school-name">${schoolName}</h1>
    <p class="school-meta">${address} • ফোন: ${phone}</p>
    <div class="badge">ভর্তি আবেদন ফরম ও শিক্ষার্থী তথ্য বিবরণী</div>
  </div>
  <div class="hero">
    <img src="${photo}" class="photo" alt="" />
    <div>
      <h2 style="margin: 0; font-size: 18px; color: #0f172a;">${app.applicantName}</h2>
      <p style="margin: 3px 0 0; font-size: 12px; color: #059669; font-weight: bold;">
        শ্রেণি: ${app.applyingClass} • বিভাগ: ${app.group || 'সাধারণ'} • স্ট্যাটাস: ${app.status}
      </p>
      ${enrolled ? `<p style="margin: 3px 0 0; font-size: 11px; color: #047857; font-weight: bold;">তালিকায় যুক্ত রোল নং: ${enrolled.roll} (শাখা: ${enrolled.section})</p>` : ''}
    </div>
  </div>
  <table>
    <tr><th>আবেদনকারীর নাম</th><td><b>${app.applicantName}</b></td><th>আবেদন আইডি</th><td><b>${app.id}</b></td></tr>
    <tr><th>আবেদনের শ্রেণি</th><td>${app.applyingClass}</td><th>বিভাগ (Group)</th><td>${app.group || 'সাধারণ'}</td></tr>
    <tr><th>পছন্দক্রম শাখা</th><td>${app.section || 'প্রযোজ্য নয়'}</td><th>জেন্ডার / লিঙ্গ</th><td>${app.gender || 'ছাত্র'}</td></tr>
    <tr><th>জন্ম তারিখ</th><td>${app.dateOfBirth || 'তথ্য নেই'}</td><th>আবেদনের তারিখ</th><td>${app.appliedDate || '—'}</td></tr>
    <tr><th>পিতার নাম</th><td>${app.fatherName || '—'}</td><th>মাতার নাম</th><td>${app.motherName || '—'}</td></tr>
    <tr><th>মোবাইল নম্বর</th><td><b>${app.phone || '—'}</b></td><th>ইমেইল</th><td>${app.email || 'তথ্য নেই'}</td></tr>
    <tr><th>পূর্ববর্তী বিদ্যালয়</th><td>${app.previousSchool || '—'}</td><th>পূর্বের জিপিএ/গ্রেড</th><td>${app.gpaOrGrade || '—'}</td></tr>
    <tr><th>বর্তমান ঠিকানা</th><td colspan="3">${app.presentAddress || 'দাদরা, জয়পুরহাট'}</td></tr>
    <tr><th>আবেদনের বর্তমান অবস্থা</th><td colspan="3"><b>${app.status}</b> ${enrolled ? `(শিক্ষার্থী হিসেবে রোল: ${enrolled.roll}, শ্রেণি: ${enrolled.class || enrolled.studentClass} এ সক্রিয়)` : ''}</td></tr>
  </table>
  <div class="signatures">
    <div class="sign-box">অভিভাবকের স্বাক্ষর</div>
    <div class="sign-box">আবেদন যাচাইকারীর স্বাক্ষর</div>
    <div class="sign-box">প্রধান শিক্ষকের অনুমোদন ও সিল</div>
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${app.applicantName}_ভর্তি_আবেদন_${app.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Counts for tabs
  const pendingCount = useMemo(
    () => admissions.filter((a) => a.status === 'অপেক্ষমাণ').length,
    [admissions]
  );
  const approvedCount = useMemo(
    () => admissions.filter((a) => a.status === 'অনুমোদিত').length,
    [admissions]
  );
  const rejectedCount = useMemo(
    () => admissions.filter((a) => a.status === 'বাতিল').length,
    [admissions]
  );

  // Dynamically compute available years for filtering
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    const currentYear = new Date().getFullYear().toString();
    yearsSet.add(currentYear);
    yearsSet.add('2026');
    yearsSet.add('2025');
    yearsSet.add('2024');

    admissions.forEach((a) => {
      if (a.appliedDate) {
        const yr = a.appliedDate.split('-')[0];
        if (yr && yr.length === 4) {
          yearsSet.add(yr);
        }
      }
    });

    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [admissions]);

  // Filtered admissions list
  const filteredAdmissions = useMemo(() => {
    return admissions.filter((app) => {
      // Status filter
      if (statusFilter !== 'all' && app.status !== statusFilter) {
        return false;
      }

      // Class filter
      if (classFilter !== 'all' && app.applyingClass !== classFilter) {
        return false;
      }

      // Year filter
      if (yearFilter !== 'all') {
        const appYear = app.appliedDate ? app.appliedDate.split('-')[0] : '';
        if (appYear !== yearFilter) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = app.applicantName.toLowerCase().includes(q);
        const matchPhone = app.phone.toLowerCase().includes(q);
        const matchFather = app.fatherName.toLowerCase().includes(q);
        const matchMother = (app.motherName || '').toLowerCase().includes(q);
        const matchAddress = (app.presentAddress || '').toLowerCase().includes(q);
        const matchSchool = (app.previousSchool || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchFather && !matchMother && !matchAddress && !matchSchool) {
          return false;
        }
      }

      return true;
    });
  }, [admissions, statusFilter, classFilter, yearFilter, searchQuery]);

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
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ভর্তি আবেদন ব্যবস্থাপনা</h1>
          <p className="text-xs text-gray-500">
            ওয়েবসাইট থেকে অনলাইনে জমা হওয়া সকল ছাত্র-ছাত্রীর ছবি ও ভর্তি আবেদন তালিকা
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-100">
            মোট আবেদন: {admissions.length} টি
          </div>
          <div className="text-xs font-semibold bg-blue-50 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-100">
            তালিকাভুক্ত শিক্ষার্থী: {students.length} জন
          </div>
          {trashAdmissions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowTrashModal(true)}
              className="text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 px-3 py-1.5 rounded-lg border border-rose-200 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="মুছে ফেলা আবেদনসমূহ দেখুন ও রিস্টোর করুন"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>মুছে ফেলা আবেদন ({trashAdmissions.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filtering and Search Controls (যথা: অনুমোদিত, অপেক্ষমাণ, বাতিল / ডিলিটেড) */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3.5">
        {/* Row 1: Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* All */}
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'all'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>সকল আবেদন</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {admissions.length}
              </span>
            </button>

            {/* Pending (অপেক্ষমাণ) */}
            <button
              type="button"
              onClick={() => setStatusFilter('অপেক্ষমাণ')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'অপেক্ষমাণ'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>অপেক্ষমাণ (Pending)</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  statusFilter === 'অপেক্ষমাণ' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
                }`}
              >
                {pendingCount}
              </span>
            </button>

            {/* Approved (অনুমোদিত) */}
            <button
              type="button"
              onClick={() => setStatusFilter('অনুমোদিত')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'অনুমোদিত'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>অনুমোদিত (Approved)</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  statusFilter === 'অনুমোদিত' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900'
                }`}
              >
                {approvedCount}
              </span>
            </button>

            {/* Cancelled / Deleted (বাতিল / ডিলিটেড) */}
            <button
              type="button"
              onClick={() => setStatusFilter('বাতিল')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'বাতিল'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>বাতিল / ডিলিটেড (Cancelled)</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  statusFilter === 'বাতিল' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-900'
                }`}
              >
                {rejectedCount}
              </span>
            </button>
          </div>

          {(statusFilter !== 'all' || classFilter !== 'all' || yearFilter !== 'all' || searchQuery.trim()) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setClassFilter('all');
                setYearFilter('all');
                setSearchQuery('');
              }}
              className="text-[11px] font-bold text-gray-500 hover:text-emerald-700 flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ফিল্টার রিসেট</span>
            </button>
          )}
        </div>

        {/* Row 2: Search Input, Class Filter, and Year Filter Dropdowns */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="শিক্ষার্থীর নাম, মোবাইল নম্বর, পিতার নাম বা ঠিকানা দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Class Filter Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-gray-600 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-emerald-700" />
              <span>শ্রেণি:</span>
            </span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-hidden focus:border-emerald-600 w-full sm:w-auto"
            >
              <option value="all">সকল শ্রেণি</option>
              <option value="৬ষ্ঠ শ্রেণি">৬ষ্ঠ শ্রেণি</option>
              <option value="৭ম শ্রেণি">৭ম শ্রেণি</option>
              <option value="৮ম শ্রেণি">৮ম শ্রেণি</option>
              <option value="৯ম শ্রেণি">৯ম শ্রেণি</option>
              <option value="১০ম শ্রেণি">১০ম শ্রেণি</option>
            </select>
          </div>

          {/* Year Filter Dropdown (আবেদনের বছর) */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-gray-600 shrink-0 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>বছর:</span>
            </span>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-hidden focus:border-emerald-600 w-full sm:w-auto"
            >
              <option value="all">সকল বছর</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr} শিক্ষাবর্ষ
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {filteredAdmissions.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-xs space-y-2">
            <Inbox className="w-10 h-10 mx-auto text-gray-300" />
            <p className="font-medium text-gray-500">
              {admissions.length === 0
                ? 'এখনো কোনো নতুন ভর্তি আবেদন জমা হয়নি'
                : 'বর্তমান ফিল্টারের সাথে মিলে এমন কোনো আবেদন পাওয়া যায়নি'}
            </p>
            {(statusFilter !== 'all' || classFilter !== 'all' || searchQuery.trim()) && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setClassFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-emerald-700 hover:underline pt-1 inline-block cursor-pointer"
              >
                সব ফিল্টার মুছে ফেলুন
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50/80 text-gray-700 font-bold uppercase tracking-wider text-[11px] border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-4">শিক্ষার্থীর ছবি ও নাম</th>
                  <th className="py-3.5 px-4">শ্রেণি, শাখা ও বিভাগ</th>
                  <th className="py-3.5 px-4">অভিভাবকের নাম</th>
                  <th className="py-3.5 px-4">যোগাযোগ ফোন</th>
                  <th className="py-3.5 px-4">আবেদনের তারিখ</th>
                  <th className="py-3.5 px-4">স্ট্যাটাস ও তালিকা ভুক্তি</th>
                  <th className="py-3.5 px-4 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAdmissions.map((app) => {
                  const applicantPhoto =
                    app.image ||
                    getStudentPhoto({
                      name: app.applicantName,
                      studentClass: app.applyingClass,
                    });

                  // Check if student with same details is already enrolled in the students list
                  const enrolledStudent = findEnrolledStudent(app);
                  const isEnrolled = Boolean(enrolledStudent);

                  return (
                    <tr key={app.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-50 border border-emerald-200 shrink-0 shadow-2xs flex items-center justify-center">
                            {applicantPhoto ? (
                              <img
                                src={applicantPhoto}
                                alt={app.applicantName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-bold text-emerald-800 text-xs">
                                {app.applicantName.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block leading-tight">
                              {app.applicantName}
                            </span>
                            <span className="text-gray-400 text-[11px]">লিঙ্গ: {app.gender}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                            {app.applyingClass}
                          </span>
                          {app.section && (
                            <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono text-[10px]">
                              শাখা: {app.section}
                            </span>
                          )}
                          {app.group && app.group !== 'সাধারণ' && (
                            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold text-[10px] border border-blue-200">
                              {app.group}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-gray-800 font-medium">পিতা: {app.fatherName}</div>
                        <div className="text-gray-400 text-[11px]">মাতা: {app.motherName}</div>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium">{app.phone}</td>

                      <td className="py-3 px-4 text-gray-400">{app.appliedDate}</td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getStatusBadge(
                              app.status
                            )}`}
                          >
                            {app.status}
                          </span>

                          {/* Duplicate enrollment badge */}
                          {isEnrolled && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit">
                              <CheckCheck className="w-3 h-3 text-emerald-600" />
                              <span>তালিকায় যুক্ত (রোল: {enrolledStudent?.roll})</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <button
                            type="button"
                            onClick={() => setSelectedApp(app)}
                            className="p-1.5 rounded-md hover:bg-blue-50 text-blue-700 transition cursor-pointer"
                            title="শিক্ষার্থীর পূর্ণাঙ্গ তথ্য দেখুন ও প্রিন্ট করুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Quick Print & PDF */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedApp(app);
                              setTimeout(() => {
                                handlePrintAdmission(app);
                              }, 120);
                            }}
                            className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-700 transition cursor-pointer"
                            title="আবেদন ও পরিচিতিপত্র প্রিন্ট করুন"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Approve / Enroll button with mandatory ID & Roll */}
                          {isEnrolled ? (
                            <button
                              type="button"
                              onClick={() => {
                                alert(
                                  `"${app.applicantName}" ইতিপূর্বেই শিক্ষার্থী তালিকায় (${
                                    enrolledStudent?.class || enrolledStudent?.studentClass || app.applyingClass
                                  }, রোল নং: ${enrolledStudent?.roll}, আইডি: ${enrolledStudent?.id}) যুক্ত আছেন।\n\nএকই তথ্য দিয়ে দ্বিতীয়বার শিক্ষার্থী যোগ করা যাবে না।`
                                );
                              }}
                              className="p-1.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 transition cursor-pointer hover:bg-emerald-200"
                              title={`ইতিমধ্যে শিক্ষার্থী তালিকায় যুক্ত (রোল: ${enrolledStudent?.roll}) - ডুপ্লিকেট রোধ করা হয়েছে`}
                            >
                              <CheckCheck className="w-4 h-4 text-emerald-800" />
                            </button>
                          ) : app.status === 'বাতিল' ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openApprovalModal(app)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer shadow-2xs"
                                title="বাতিল তালিকা থেকে শিক্ষার্থী আইডি ও রোল দিয়ে শিক্ষার্থী তালিকায় যুক্ত করুন"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>শিক্ষার্থী যুক্ত করুন</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  updateAdmissionStatus(app.id, 'অপেক্ষমাণ');
                                  showToast('info', `"${app.applicantName}" এর আবেদনটি পুনরায় অপেক্ষমাণ তালিকায় ফিরিয়ে নেওয়া হয়েছে।`);
                                }}
                                className="p-1.5 rounded-md hover:bg-amber-50 text-amber-700 transition cursor-pointer"
                                title="আবেদন রিস্টোর করুন (Restore to Pending)"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openApprovalModal(app)}
                              className="p-1.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer border border-emerald-300 shadow-2xs"
                              title="অনুমোদন করুন ও বাধ্যতামূলক শিক্ষার্থী আইডি ও রোল নম্বর দিয়ে যোগ করুন"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Reject / Cancel */}
                          {app.status !== 'বাতিল' && (
                            <button
                              type="button"
                              onClick={() => {
                                updateAdmissionStatus(app.id, 'বাতিল');
                                showToast('info', `"${app.applicantName}" এর আবেদনটি বাতিল করা হয়েছে।`);
                              }}
                              className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                              title="আবেদন বাতিল করুন"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete to Trash */}
                          <button
                            type="button"
                            onClick={() => handleDeleteAdmissionWithTrash(app)}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition cursor-pointer"
                            title="মুছে ফেলুন (রিসাইকেল বিনে জমা থাকবে)"
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

      {/* Application Detail Modal with Student Photo, Full Info, Print & PDF */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative border border-gray-100 max-h-[94vh] overflow-y-auto space-y-5 text-xs text-gray-800">
            {/* Close Button Top Right */}
            <button
              type="button"
              onClick={() => setSelectedApp(null)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition cursor-pointer z-30 shadow-2xs"
              title="বন্ধ করুন (Close)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Top Header with Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 no-print pr-10 sm:pr-12">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>শিক্ষার্থীর ভর্তি আবেদন ও পূর্ণাঙ্গ তথ্য বিবরণী</span>
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                      selectedApp.status
                    )}`}
                  >
                    স্ট্যাটাস: {selectedApp.status}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">• আইডি: {selectedApp.id}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handlePrintAdmission(selectedApp)}
                  disabled={isPrinting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#15803d] hover:bg-[#166534] text-white rounded-xl font-bold transition cursor-pointer shadow-xs disabled:opacity-60"
                  title="প্রিন্টার দিয়ে প্রিন্ট করুন"
                >
                  {isPrinting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Printer className="w-3.5 h-3.5" />
                  )}
                  <span>{isPrinting ? 'প্রিন্ট হচ্ছে...' : 'প্রিন্ট করুন'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadAdmissionPdf(selectedApp)}
                  disabled={isExportingPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition cursor-pointer shadow-xs disabled:opacity-60"
                  title="সরাসরি PDF ফাইল ডাউনলোড করুন"
                >
                  {isExportingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5" />
                  )}
                  <span>{isExportingPdf ? 'PDF তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadAdmissionHtml(selectedApp)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition cursor-pointer"
                  title="অফলাইন ফাইল ডাউনলোড"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>অফলাইন ফাইল</span>
                </button>
              </div>
            </div>

            {/* Document Content View / Printable Card */}
            {(() => {
              const enrolled = findEnrolledStudent(selectedApp);
              const photo =
                selectedApp.image ||
                getStudentPhoto({
                  name: selectedApp.applicantName,
                  studentClass: selectedApp.applyingClass,
                });

              return (
                <div
                  id="printable-admission-card"
                  className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-5 text-gray-900"
                >
                  {/* Official School Header for Print & Display */}
                  <div className="text-center border-b-2 border-emerald-700 pb-3 mb-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-emerald-900">
                      {siteSettings?.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়'}
                    </h2>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {siteSettings?.address || 'দাদরা, জয়পুরহাট'} • ফোন: {siteSettings?.phone1 || '+৮৮০১৭১২-৩৪৫৬৭৮'}
                    </p>
                    <div className="inline-block mt-2 px-3 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-full text-xs font-bold">
                      ভর্তি আবেদন ফরম ও শিক্ষার্থী তথ্য বিবরণী
                    </div>
                  </div>

                  {/* Enrolled Status Notice */}
                  {enrolled && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center gap-2.5">
                      <CheckCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                      <div>
                        <p className="font-bold">শিক্ষার্থী ইতিমধ্যে সাধারণ ডাটাবেজে অন্তর্ভুক্ত আছেন!</p>
                        <p className="text-[11px] text-emerald-800">
                          শ্রেণি: <b>{enrolled.class || enrolled.studentClass}</b> • শাখা: <b>{enrolled.section}</b> • বিভাগ: <b>{enrolled.group || 'সাধারণ'}</b> • রোল নম্বর:{' '}
                          <b className="font-mono text-emerald-950 font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-300">
                            {enrolled.roll}
                          </b>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Student Hero Row */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-gray-50 border border-gray-200 rounded-2xl p-4">
                    <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 border-emerald-600 bg-white shadow-sm shrink-0 flex items-center justify-center">
                      {photo ? (
                        <img
                          src={photo}
                          alt={selectedApp.applicantName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-emerald-800">
                          {selectedApp.applicantName.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-center sm:text-left flex-1">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h3 className="text-lg font-bold text-gray-900">{selectedApp.applicantName}</h3>
                        {enrolled && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white">
                            রোল: {enrolled.roll}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                        <span className="px-2 py-0.5 bg-white border border-gray-200 text-emerald-900 rounded font-semibold text-[11px]">
                          শ্রেণি: {selectedApp.applyingClass}
                        </span>
                        {selectedApp.group && (
                          <span className="px-2 py-0.5 bg-white border border-gray-200 text-blue-800 rounded font-semibold text-[11px]">
                            বিভাগ: {selectedApp.group}
                          </span>
                        )}
                        {selectedApp.section && (
                          <span className="px-2 py-0.5 bg-white border border-gray-200 text-gray-700 rounded text-[11px]">
                            শাখা: {selectedApp.section}
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-white border border-gray-200 text-gray-700 rounded text-[11px]">
                          লিঙ্গ: {selectedApp.gender || 'ছাত্র'}
                        </span>
                      </div>

                      <p className="text-gray-500 text-[11px] pt-0.5 flex items-center justify-center sm:justify-start gap-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>যোগাযোগ: <b className="font-mono text-gray-800">{selectedApp.phone}</b></span>
                        <span className="text-gray-400 ml-2">• আবেদনের তারিখ: {selectedApp.appliedDate}</span>
                      </p>
                    </div>
                  </div>

                  {/* Two Column Detailed Information Tables */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Academic & Personal Info */}
                    <div className="bg-gray-50/60 p-3.5 rounded-xl border border-gray-200 space-y-2.5">
                      <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5 pb-2 border-b border-gray-200">
                        <School className="w-4 h-4 text-emerald-700" />
                        <span>শিক্ষার্থীর ব্যক্তিগত ও একাডেমিক তথ্য</span>
                      </h4>

                      <div className="space-y-1.5 text-xs divide-y divide-gray-100">
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-gray-500">শিক্ষার্থীর পূর্ণ নাম:</span>
                          <span className="font-bold text-gray-900">{selectedApp.applicantName}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-gray-500">আবেদনের শ্রেণি:</span>
                          <span className="font-bold text-emerald-800">{selectedApp.applyingClass}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-gray-500">বিভাগ (Group):</span>
                          <span className="font-semibold text-blue-800">{selectedApp.group || 'সাধারণ'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-gray-500">শাখা পছন্দক্রম:</span>
                          <span className="font-medium text-gray-800">{selectedApp.section || 'সাধারণ / প্রযোজ্য নয়'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-gray-500">জেন্ডার / লিঙ্গ:</span>
                          <span className="font-medium text-gray-800">{selectedApp.gender || 'ছাত্র'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-gray-500">জন্ম তারিখ:</span>
                          <span className="font-medium text-gray-800">{selectedApp.dateOfBirth || 'তথ্য দেওয়া নেই'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-gray-500">পূর্ববর্তী বিদ্যালয়:</span>
                          <span className="font-medium text-gray-800">{selectedApp.previousSchool || 'প্রযোজ্য নয়'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-gray-500">পূর্ববর্তী পরীক্ষার জিপিএ:</span>
                          <span className="font-mono font-bold text-emerald-800">{selectedApp.gpaOrGrade || 'তথ্য নেই'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Family & Contact Info */}
                    <div className="bg-gray-50/60 p-3.5 rounded-xl border border-gray-200 space-y-2.5">
                      <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5 pb-2 border-b border-gray-200">
                        <Users className="w-4 h-4 text-emerald-700" />
                        <span>অভিভাবক ও যোগাযোগের তথ্য</span>
                      </h4>

                      <div className="space-y-1.5 text-xs divide-y divide-gray-100">
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-gray-500">পিতার নাম:</span>
                          <span className="font-semibold text-gray-900">{selectedApp.fatherName}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-gray-500">মাতার নাম:</span>
                          <span className="font-semibold text-gray-900">{selectedApp.motherName}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-gray-500">যোগাযোগ মোবাইল:</span>
                          <span className="font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-gray-200">
                            {selectedApp.phone}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-gray-500">ইমেইল:</span>
                          <span className="font-mono text-gray-700">{selectedApp.email || 'তথ্য দেওয়া নেই'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-gray-500">আবেদনের তারিখ:</span>
                          <span className="font-medium text-gray-800">{selectedApp.appliedDate}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 pt-1.5">
                          <span className="text-gray-500">বর্তমান স্থায়ী ঠিকানা:</span>
                          <span className="font-medium text-gray-800 bg-white p-1.5 rounded border border-gray-200 text-[11px]">
                            {selectedApp.presentAddress || 'দাদরা, জয়পুরহাট'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enrolled Subjects (if student is already enrolled in the school) */}
                  {enrolled && enrolled.subjects && enrolled.subjects.length > 0 && (
                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
                      <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                        <span>কারিকুলাম ভিত্তিক নির্ধারিত বিষয়সমূহ ({enrolled.subjects.length} টি):</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {enrolled.subjects.map((sub, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Official Signatures Row for Print */}
                  <div className="mt-8 pt-4 flex items-center justify-between text-xs text-gray-600 border-t border-dashed border-gray-300">
                    <div className="text-center">
                      <div className="w-28 border-t border-gray-400 pt-1 font-semibold text-gray-700">
                        শিক্ষার্থীর স্বাক্ষর
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-28 border-t border-gray-400 pt-1 font-semibold text-gray-700">
                        অভিভাবকের স্বাক্ষর
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-32 border-t border-gray-400 pt-1 font-semibold text-gray-700">
                        আবেদন যাচাইকারীর স্বাক্ষর
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-36 border-t border-gray-400 pt-1 font-semibold text-gray-700">
                        প্রধান শিক্ষকের অনুমোদন ও সিল
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Modal Bottom Actions Bar (no-print) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100 no-print">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintAdmission(selectedApp)}
                  disabled={isPrinting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs cursor-pointer border border-emerald-200 transition disabled:opacity-60"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট করুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadAdmissionPdf(selectedApp)}
                  disabled={isExportingPdf}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-xl text-xs cursor-pointer border border-blue-200 transition disabled:opacity-60"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>PDF ডাউনলোড</span>
                </button>

                {(() => {
                  const enrolled = findEnrolledStudent(selectedApp);
                  if (enrolled) {
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          alert(
                            `"${selectedApp.applicantName}" ইতিপূর্বেই শিক্ষার্থী তালিকায় (রোল নং: ${enrolled.roll})-এ যুক্ত আছেন। ডুপ্লিকেট যুক্ত করা সম্ভব নয়।`
                          );
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-100 text-emerald-900 font-bold rounded-xl text-xs cursor-pointer border border-emerald-300"
                      >
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>শিক্ষার্থী তালিকায় যুক্ত (রোল: {enrolled.roll})</span>
                      </button>
                    );
                  }

                  return (
                    <button
                      onClick={() => openApprovalModal(selectedApp)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>অনুমোদন ও শিক্ষার্থী তালিকায় যুক্ত করুন</span>
                    </button>
                  );
                })()}

                <button
                  onClick={() => {
                    updateAdmissionStatus(selectedApp.id, 'বাতিল');
                    setSelectedApp({ ...selectedApp, status: 'বাতিল' });
                    showToast('info', `"${selectedApp.applicantName}" এর আবেদনটি বাতিল করা হয়েছে।`);
                  }}
                  className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs cursor-pointer transition"
                >
                  বাতিল করুন
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 text-xs text-gray-600 font-semibold hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Student ID & Roll Number Approval Modal */}
      {enrollingApp && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative border border-gray-100 space-y-4 text-xs text-gray-800">
            {/* Close */}
            <button
              type="button"
              onClick={() => {
                setEnrollingApp(null);
                setApprovalErrors({});
              }}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200 shrink-0">
                <UserCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  ভর্তি অনুমোদন ও শিক্ষার্থী আইডি-রোল নির্ধারণ
                </h3>
                <p className="text-[11px] text-gray-500">
                  অনুমোদনের জন্য শিক্ষার্থীর আইডি ও রোল নম্বর প্রদান করা বাধ্যতামূলক
                </p>
              </div>
            </div>

            {/* Student Preview Card */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-emerald-300 shrink-0 shadow-2xs flex items-center justify-center">
                {enrollingApp.image ? (
                  <img
                    src={enrollingApp.image}
                    alt={enrollingApp.applicantName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-emerald-800 text-sm">
                    {enrollingApp.applicantName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-gray-900 text-sm truncate">
                  {enrollingApp.applicantName}
                </h4>
                <div className="text-[11px] text-emerald-900 flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                  <span>শ্রেণি: <b>{enrollingApp.applyingClass}</b></span>
                  {enrollingApp.fatherName && <span>• পিতা: {enrollingApp.fatherName}</span>}
                  <span>• ফোন: {enrollingApp.phone}</span>
                </div>
              </div>
            </div>

            {/* Strict Notice */}
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-2.5 text-[11px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p>
                <b>বাধ্যতামূলক শর্ত:</b> শিক্ষার্থী আইডি এবং রোল নম্বর না দেওয়া পর্যন্ত অনুমোদন সম্পন্ন হবে না। আইডি ও রোল ইউনিক হতে হবে।
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 pt-1">
              {/* General Error */}
              {approvalErrors.general && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{approvalErrors.general}</span>
                </div>
              )}

              {/* Student ID (Mandatory) */}
              <div>
                <label className="block font-bold text-gray-800 mb-1 text-xs">
                  শিক্ষার্থী আইডি (Student ID) <span className="text-rose-600 font-bold">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={approvalStudentId}
                    onChange={(e) => {
                      setApprovalStudentId(e.target.value);
                      if (approvalErrors.studentId) {
                        setApprovalErrors((prev) => ({ ...prev, studentId: undefined }));
                      }
                    }}
                    placeholder="যেমন: stu-2026-101 বা DHS-2026-001"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold bg-white transition focus:outline-hidden ${
                      approvalErrors.studentId
                        ? 'border-rose-400 bg-rose-50/30 text-rose-950 focus:border-rose-600'
                        : 'border-gray-200 focus:border-emerald-600 text-gray-900'
                    }`}
                  />
                  {approvalStudentId.trim() && !approvalErrors.studentId && (
                    <CheckCircle className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                {approvalErrors.studentId ? (
                  <p className="text-rose-600 text-[11px] mt-1 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{approvalErrors.studentId}</span>
                  </p>
                ) : (
                  <p className="text-gray-400 text-[10px] mt-1">
                    অনন্য (Unique) শিক্ষার্থী আইডি দিন। আইডি ছাড়া শিক্ষার্থী অনুমোদন করা যাবে না।
                  </p>
                )}
              </div>

              {/* Roll Number (Mandatory) */}
              <div>
                <label className="block font-bold text-gray-800 mb-1 text-xs">
                  শ্রেণির রোল নম্বর (Roll Number) <span className="text-rose-600 font-bold">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={approvalRoll}
                    onChange={(e) => {
                      setApprovalRoll(e.target.value);
                      if (approvalErrors.roll) {
                        setApprovalErrors((prev) => ({ ...prev, roll: undefined }));
                      }
                    }}
                    placeholder="যেমন: 1, 2, 3..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold bg-white transition focus:outline-hidden ${
                      approvalErrors.roll
                        ? 'border-rose-400 bg-rose-50/30 text-rose-950 focus:border-rose-600'
                        : 'border-gray-200 focus:border-emerald-600 text-gray-900'
                    }`}
                  />
                  {approvalRoll.trim() && !approvalErrors.roll && (
                    <CheckCircle className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                {approvalErrors.roll ? (
                  <p className="text-rose-600 text-[11px] mt-1 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{approvalErrors.roll}</span>
                  </p>
                ) : (
                  <p className="text-gray-400 text-[10px] mt-1">
                    নির্ধারিত শ্রেণিতে এই রোলটি শিক্ষার্থী তালিকার প্রধান ক্রমিক হিসেবে ব্যবহৃত হবে।
                  </p>
                )}
              </div>

              {/* Academic Placement: Class, Section, Group */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1 text-[11px]">
                    শ্রেণি (Class):
                  </label>
                  <select
                    value={approvalClass}
                    onChange={(e) => setApprovalClass(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium text-gray-800 focus:outline-hidden focus:border-emerald-600"
                  >
                    <option value="৬ষ্ঠ শ্রেণি">৬ষ্ঠ শ্রেণি</option>
                    <option value="৭ম শ্রেণি">৭ম শ্রেণি</option>
                    <option value="৮ম শ্রেণি">৮ম শ্রেণি</option>
                    <option value="৯ম শ্রেণি">৯ম শ্রেণি</option>
                    <option value="১০ম শ্রেণি">১০ম শ্রেণি</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1 text-[11px]">
                    শাখা (Section):
                  </label>
                  <select
                    value={approvalSection}
                    onChange={(e) => setApprovalSection(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium text-gray-800 focus:outline-hidden focus:border-emerald-600"
                  >
                    <option value="A">শাখা A</option>
                    <option value="B">শাখা B</option>
                    <option value="C">শাখা C</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1 text-[11px]">
                    বিভাগ (Group):
                  </label>
                  <select
                    value={approvalGroup}
                    onChange={(e) => setApprovalGroup(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium text-gray-800 focus:outline-hidden focus:border-emerald-600"
                  >
                    <option value="সাধারণ">সাধারণ</option>
                    <option value="বিজ্ঞান">বিজ্ঞান</option>
                    <option value="মানবিক">মানবিক</option>
                    <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setEnrollingApp(null);
                  setApprovalErrors({});
                }}
                className="px-4 py-2.5 text-xs text-gray-600 font-semibold hover:bg-gray-100 rounded-xl cursor-pointer transition"
              >
                বাতিল করুন
              </button>

              <button
                type="button"
                onClick={handleConfirmApproval}
                disabled={!approvalStudentId.trim() || !approvalRoll.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                title={
                  !approvalStudentId.trim() || !approvalRoll.trim()
                    ? 'আইডি ও রোল নম্বর পূরণ করুন'
                    : 'অনুমোদন নিশ্চিত করুন'
                }
              >
                <Check className="w-4 h-4" />
                <span>অনুমোদন ও তালিকায় যুক্ত করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deleted Admissions Trash Bin Modal (মুছে ফেলা আবেদনসমূহ) */}
      {showTrashModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl relative border border-gray-100 space-y-4 text-xs text-gray-800 max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              type="button"
              onClick={() => setShowTrashModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-800 flex items-center justify-center border border-rose-200 shrink-0">
                <Trash2 className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  মুছে ফেলা ভর্তি আবেদনসমূহ (রিসাইকেল বিন)
                </h3>
                <p className="text-[11px] text-gray-500">
                  ভুল করে মুছে ফেলা আবেদন পুনরায় ফিরিয়ে আনা অথবা আইডি-রোল দিয়ে শিক্ষার্থী হিসেবে যুক্ত করুন
                </p>
              </div>
            </div>

            {trashAdmissions.length === 0 ? (
              <div className="text-center py-12 text-gray-400 space-y-2">
                <Inbox className="w-10 h-10 mx-auto text-gray-300" />
                <p className="text-gray-600 font-medium">মুছে ফেলা কোনো আবেদন সংরক্ষিত নেই।</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-gray-500 px-1">
                  <span>মোট সংরক্ষিত আবেদন: {trashAdmissions.length} টি</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('আপনি কি নিশ্চিত যে রিসাইকেল বিনের সকল আবেদন স্থায়ীভাবে মুছে ফেলতে চান?')) {
                        setTrashAdmissions([]);
                        localStorage.removeItem('dhs_trash_admissions');
                        showToast('info', 'রিসাইকেল বিনের সকল আবেদন স্থায়ীভাবে মুছে ফেলা হয়েছে।');
                      }
                    }}
                    className="text-rose-600 hover:underline font-bold cursor-pointer"
                  >
                    সকল মুছে ফেলা আবেদন পরিষ্কার করুন
                  </button>
                </div>

                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                  {trashAdmissions.map((app) => {
                    const applicantPhoto =
                      app.image ||
                      getStudentPhoto({
                        name: app.applicantName,
                        studentClass: app.applyingClass,
                      });

                    return (
                      <div
                        key={app.id}
                        className="p-3.5 bg-gray-50/40 hover:bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-50 border border-emerald-200 shrink-0 flex items-center justify-center">
                            {applicantPhoto ? (
                              <img
                                src={applicantPhoto}
                                alt={app.applicantName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-bold text-emerald-800 text-xs">
                                {app.applicantName.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-xs">{app.applicantName}</p>
                            <p className="text-[11px] text-gray-500">
                              শ্রেণি: <b>{app.applyingClass}</b> • পিতা: {app.fatherName} • ফোন: {app.phone}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              আবেদনের তারিখ: {app.appliedDate || '—'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          {/* Re-enroll as student with mandatory ID & Roll */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowTrashModal(false);
                              openApprovalModal(app);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] transition cursor-pointer shadow-2xs"
                            title="আইডি ও রোল প্রদান করে শিক্ষার্থী তালিকায় যুক্ত করুন"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>শিক্ষার্থী যুক্ত করুন</span>
                          </button>

                          {/* Restore to admissions list */}
                          <button
                            type="button"
                            onClick={() => handleRestoreFromTrash(app)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-semibold text-[11px] border border-blue-200 transition cursor-pointer"
                            title="আবেদন তালিকায় ফিরিয়ে নিন"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>রিস্টোর</span>
                          </button>

                          {/* Permanent delete */}
                          <button
                            type="button"
                            onClick={() => handlePermanentDeleteFromTrash(app.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="স্থায়ীভাবে মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Student Approval Confirmation Popup Modal (অনুমোদন করা হয়েছে পপআপ) */}
      {approvedPopupData && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-emerald-100 space-y-5 text-gray-800">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setApprovedPopupData(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Celebratory Icon & Header */}
            <div className="text-center pt-2 pb-1 space-y-2">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-linear-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-4 ring-emerald-100">
                  <CheckCircle2 className="w-9 h-9 sm:w-10 sm:h-10" />
                </div>
                <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-md">
                  <Sparkles className="w-4 h-4 fill-amber-300" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  অনুমোদন সফল হয়েছে
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  অনুমোদন করা হয়েছে!
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  শিক্ষার্থীর ভর্তি আবেদন সফলভাবে অনুমোদন করে শিক্ষার্থী ডাটাবেজে অন্তর্ভুক্ত করা হয়েছে।
                </p>
              </div>
            </div>

            {/* Approved Student Info Card */}
            <div className="bg-gradient-to-b from-emerald-50/60 to-white border border-emerald-200/90 rounded-2xl p-4 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border-2 border-emerald-300 shrink-0 shadow-xs flex items-center justify-center">
                  {approvedPopupData.image ? (
                    <img
                      src={approvedPopupData.image}
                      alt={approvedPopupData.studentName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-extrabold text-emerald-800 text-xl">
                      {approvedPopupData.studentName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-gray-900 text-base leading-tight truncate">
                    {approvedPopupData.studentName}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="bg-emerald-600 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-md shadow-2xs">
                      {approvedPopupData.studentClass}
                    </span>
                    {approvedPopupData.section && (
                      <span className="bg-white text-gray-700 font-mono text-[11px] px-2 py-0.5 rounded-md border border-gray-200 font-semibold">
                        শাখা: {approvedPopupData.section}
                      </span>
                    )}
                    {approvedPopupData.group && approvedPopupData.group !== 'সাধারণ' && (
                      <span className="bg-blue-50 text-blue-800 font-semibold text-[11px] px-2 py-0.5 rounded-md border border-blue-200">
                        {approvedPopupData.group}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Grid with copy-friendly ID and Roll */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-emerald-100">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100/80">
                  <span className="text-[10px] text-gray-400 font-medium block">শিক্ষার্থী আইডি (Student ID)</span>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className="font-mono font-bold text-emerald-950 text-xs truncate">
                      {approvedPopupData.studentId}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(approvedPopupData.studentId);
                        setCopiedStudentId(true);
                        setTimeout(() => setCopiedStudentId(false), 2000);
                      }}
                      className="p-1 hover:bg-emerald-50 text-emerald-700 rounded transition cursor-pointer"
                      title="আইডি কপি করুন"
                    >
                      {copiedStudentId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-100/80">
                  <span className="text-[10px] text-gray-400 font-medium block">রোল নম্বর (Roll No)</span>
                  <p className="font-black text-emerald-700 text-sm mt-0.5">
                    {approvedPopupData.roll}
                  </p>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-100/80">
                  <span className="text-[10px] text-gray-400 font-medium block">অভিভাবকের নাম</span>
                  <p className="font-semibold text-gray-800 text-xs mt-0.5 truncate">
                    {approvedPopupData.fatherName || approvedPopupData.motherName || '—'}
                  </p>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-100/80">
                  <span className="text-[10px] text-gray-400 font-medium block">যোগাযোগের ফোন নম্বর</span>
                  <p className="font-mono font-semibold text-gray-800 text-xs mt-0.5 truncate">
                    {approvedPopupData.phone}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-gray-400 flex items-center justify-between px-1 pt-1">
                <span>অনুমোদনের সময়:</span>
                <span className="font-medium text-gray-600">{approvedPopupData.approvedAt}</span>
              </div>
            </div>

            {/* Quick Actions in Popup */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handlePrintAdmission(approvedPopupData.application);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>ফরম প্রিন্ট করুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleDownloadAdmissionPdf(approvedPopupData.application);
                  }}
                  disabled={isExportingPdf}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition cursor-pointer border border-blue-200"
                >
                  {isExportingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4" />
                  )}
                  <span>পিডিএফ ডাউনলোড</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setApprovedPopupData(null)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition cursor-pointer text-center"
              >
                ঠিক আছে (সম্পন্ন)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
