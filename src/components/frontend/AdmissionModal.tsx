import React, { useState, useRef, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  X,
  CheckCircle,
  GraduationCap,
  Camera,
  Upload,
  Image as ImageIcon,
  User,
  Phone,
  Calendar,
  Building,
  Award,
  MapPin,
  Printer,
  FileDown,
  Loader2,
  Download,
  Copy,
  Check,
  BookOpen,
  AlertCircle,
  Sparkles,
  School,
  Users,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { compressImageFile } from '../../utils/imageUpload';
import { getStudentPhoto } from '../../utils/studentPhoto';
import {
  isClassWithGroups,
  GENERAL_SUBJECTS_CLASS_6_8,
} from '../../data/curriculumSubjects';
import { AdmissionApplication } from '../../types';

export const AdmissionModal: React.FC = () => {
  const { isAdmissionModalOpen, setIsAdmissionModalOpen, submitAdmission, siteSettings } = useSchool();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    applicantName: '',
    image: '' as string | undefined,
    applyingClass: '৬ষ্ঠ শ্রেণি',
    group: 'বিজ্ঞান',
    section: '', // Optional - user can specify or leave blank
    additionalSubject: 'উচ্চতর গণিত', // 4th subject for Class 9/10
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    gender: 'ছাত্র' as 'ছাত্র' | 'ছাত্রী',
    phone: '',
    email: '',
    previousSchool: '',
    gpaOrGrade: '',
    presentAddress: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submittedApp, setSubmittedApp] = useState<AdmissionApplication | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const isClass910 = isClassWithGroups(formData.applyingClass);

  // Available 4th / Elective subject choices for Class 9 & 10
  const availableElectives = useMemo(() => {
    if (!isClass910) return [];
    if (formData.group === 'মানবিক') {
      return ['অর্থনীতি', 'কৃষিশিক্ষা', 'গার্হস্থ্য বিজ্ঞান'];
    }
    if (formData.group === 'ব্যবসায় শিক্ষা' || formData.group === 'ব্যবসায় শিক্ষা') {
      return ['অর্থনীতি', 'কৃষিশিক্ষা', 'গার্হস্থ্য বিজ্ঞান'];
    }
    // Science
    return ['উচ্চতর গণিত', 'কৃষিশিক্ষা', 'গার্হস্থ্য বিজ্ঞান'];
  }, [isClass910, formData.group]);

  // Core/Compulsory subjects based on class & group
  const coreSubjects = useMemo(() => {
    if (!isClass910) {
      return GENERAL_SUBJECTS_CLASS_6_8;
    }
    if (formData.group === 'মানবিক') {
      return [
        'বাংলা ১ম পত্র',
        'বাংলা ২য় পত্র',
        'ইংরেজি ১ম পত্র',
        'ইংরেজি ২য় পত্র',
        'সাধারণ গণিত',
        'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
        'সাধারণ বিজ্ঞান',
        'ধর্ম ও নৈতিক শিক্ষা',
        'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা',
        'ভূগোল ও পরিবেশ',
        'পৌরনীতি ও নাগরিকতা',
      ];
    }
    if (formData.group === 'ব্যবসায় শিক্ষা' || formData.group === 'ব্যবসায় শিক্ষা') {
      return [
        'বাংলা ১ম পত্র',
        'বাংলা ২য় পত্র',
        'ইংরেজি ১ম পত্র',
        'ইংরেজি ২য় পত্র',
        'সাধারণ গণিত',
        'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
        'সাধারণ বিজ্ঞান',
        'ধর্ম ও নৈতিক শিক্ষা',
        'হিসাববিজ্ঞান (Accounting)',
        'ব্যবসায় উদ্যোগ',
        'ফিন্যান্স ও ব্যাংকিং',
      ];
    }
    // Science
    return [
      'বাংলা ১ম পত্র',
      'বাংলা ২য় পত্র',
      'ইংরেজি ১ম পত্র',
      'ইংরেজি ২য় পত্র',
      'সাধারণ গণিত',
      'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
      'বাংলাদেশ ও বিশ্বপরিচয়',
      'ধর্ম ও নৈতিক শিক্ষা',
      'পদার্থবিজ্ঞান (Physics)',
      'রসায়ন (Chemistry)',
      'জীববিজ্ঞান (Biology)',
    ];
  }, [isClass910, formData.group]);

  // Full subject list including core + chosen 4th subject
  const allEnrolledSubjects = useMemo(() => {
    if (!isClass910) return coreSubjects;
    return [...coreSubjects, `${formData.additionalSubject} (৪র্থ বিষয়)`];
  }, [coreSubjects, isClass910, formData.additionalSubject]);

  if (!isAdmissionModalOpen) return null;

  // Handle Class change
  const handleClassChange = (newClass: string) => {
    const isNewClass910 = isClassWithGroups(newClass);
    const newGroup = isNewClass910 ? (formData.group || 'বিজ্ঞান') : 'সাধারণ';
    let newElective = formData.additionalSubject;
    if (isNewClass910) {
      if (newGroup === 'বিজ্ঞান') newElective = 'উচ্চতর গণিত';
      else newElective = 'অর্থনীতি';
    }
    setFormData((prev) => ({
      ...prev,
      applyingClass: newClass,
      group: newGroup,
      additionalSubject: newElective,
    }));
  };

  // Handle Group change
  const handleGroupChange = (newGroup: string) => {
    let newElective = 'উচ্চতর গণিত';
    if (newGroup === 'মানবিক' || newGroup.includes('ব্যবসায়')) {
      newElective = 'অর্থনীতি';
    }
    setFormData((prev) => ({
      ...prev,
      group: newGroup,
      additionalSubject: newElective,
    }));
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadError(null);
      const dataUrl = await compressImageFile(file, 400, 400, 0.85);
      setFormData((prev) => ({ ...prev, image: dataUrl }));
    } catch (err: any) {
      setUploadError(err.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে');
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: undefined }));
  };

  // Submit Application with Strict Mandatory Validation for the marked fields
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};

    // Mandatory Checks (As specifically marked in user screenshot)
    if (!formData.applicantName.trim()) {
      errors.applicantName = 'শিক্ষার্থীর পূর্ণ নাম দেওয়া বাধ্যতামূলক!';
    }
    if (!formData.fatherName.trim()) {
      errors.fatherName = 'পিতার নাম দেওয়া বাধ্যতামূলক!';
    }
    if (!formData.motherName.trim()) {
      errors.motherName = 'মাতার নাম দেওয়া বাধ্যতামূলক!';
    }
    // Marked in screenshot:
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'জন্ম তারিখ দেওয়া বাধ্যতামূলক!';
    }
    if (!formData.gender) {
      errors.gender = 'লিঙ্গ নির্বাচন করা বাধ্যতামূলক!';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'যোগাযোগের মোবাইল নম্বর দেওয়া বাধ্যতামূলক!';
    } else if (formData.phone.replace(/\D/g, '').length < 8) {
      errors.phone = 'সঠিক মোবাইল নম্বর দিন (কমপক্ষে ৮ ডিজিট)!';
    }
    // Marked in screenshot:
    if (!formData.previousSchool.trim()) {
      errors.previousSchool = 'পূর্ববর্তী শিক্ষাপ্রতিষ্ঠানের নাম দেওয়া বাধ্যতামূলক!';
    }
    // Marked in screenshot:
    if (!formData.gpaOrGrade.trim()) {
      errors.gpaOrGrade = 'পূর্বের জিপিএ বা গ্রেড দেওয়া বাধ্যতামূলক!';
    }
    // Marked in screenshot:
    if (!formData.presentAddress.trim()) {
      errors.presentAddress = 'বর্তমান ঠিকানা দেওয়া বাধ্যতামূলক!';
    }

    // Notice: Section is intentionally NOT mandatory!
    // ("শাখা অপশান যেন issa moto dite pare nah dileo jeno problem nah hoi")

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Scroll to the first error
      const firstErrorKey = Object.keys(errors)[0];
      const el = document.getElementById(`field-${firstErrorKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setFormErrors({});

    const finalImage =
      formData.image ||
      getStudentPhoto({
        name: formData.applicantName.trim(),
        studentClass: formData.applyingClass,
      });

    const newApplication = submitAdmission({
      applicantName: formData.applicantName.trim(),
      image: finalImage,
      applyingClass: formData.applyingClass,
      group: isClass910 ? formData.group : 'সাধারণ',
      section: formData.section ? formData.section.trim() : undefined,
      additionalSubject: isClass910 ? formData.additionalSubject : undefined,
      subjects: allEnrolledSubjects,
      fatherName: formData.fatherName.trim(),
      motherName: formData.motherName.trim(),
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      previousSchool: formData.previousSchool.trim(),
      gpaOrGrade: formData.gpaOrGrade.trim(),
      presentAddress: formData.presentAddress.trim(),
    });

    setSubmittedApp(newApplication);
  };

  const handleClose = () => {
    setSubmittedApp(null);
    setIsAdmissionModalOpen(false);
    setUploadError(null);
    setFormErrors({});
    setFormData({
      applicantName: '',
      image: undefined,
      applyingClass: '৬ষ্ঠ শ্রেণি',
      group: 'বিজ্ঞান',
      section: '',
      additionalSubject: 'উচ্চতর গণিত',
      fatherName: '',
      motherName: '',
      dateOfBirth: '',
      gender: 'ছাত্র',
      phone: '',
      email: '',
      previousSchool: '',
      gpaOrGrade: '',
      presentAddress: '',
    });
  };

  // Direct Print of the Application Preview Slip
  const handlePrintSlip = () => {
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

  // PDF Download of the Slip using html2canvas & jsPDF
  const handleDownloadSlipPdf = async () => {
    if (!submittedApp) return;
    setIsExportingPdf(true);
    setTimeout(async () => {
      try {
        const element = document.getElementById('printable-admission-slip');
        if (!element) {
          handleDownloadSlipHtml();
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

        pdf.save(`${submittedApp.applicantName}_ভর্তি_আবেদন_স্লিপ_${submittedApp.id}.pdf`);
      } catch (err) {
        console.error('PDF export error:', err);
        handleDownloadSlipHtml();
      } finally {
        setIsExportingPdf(false);
      }
    }, 200);
  };

  // Offline HTML Download
  const handleDownloadSlipHtml = () => {
    if (!submittedApp) return;
    const app = submittedApp;
    const schoolName = siteSettings?.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়';
    const address = siteSettings?.address || 'দাদরা, জয়পুরহাট';
    const phone = siteSettings?.phone1 || '+৮৮০১৭১২-৩৪৫৬৭৮';
    const subList = app.subjects && app.subjects.length > 0 ? app.subjects : allEnrolledSubjects;

    const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8"/>
  <title>${app.applicantName} - ভর্তি আবেদন স্লিপ</title>
  <style>
    body { font-family: 'SolaimanLipi', Arial, sans-serif; margin: 20px; color: #1e293b; line-height: 1.4; }
    .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 14px; }
    .school-name { font-size: 24px; font-weight: bold; color: #064e3b; margin: 0; }
    .sub-title { font-size: 13px; color: #475569; margin: 4px 0 0; }
    .badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 13px; margin-top: 8px; }
    .meta-bar { display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; background: #f8fafc; padding: 6px 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 14px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
    .info-table th, .info-table td { border: 1px solid #cbd5e1; padding: 7px 10px; font-size: 12px; }
    .info-table th { background: #f1f5f9; text-align: left; width: 22%; color: #334155; }
    .subjects { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
    .sub-chip { background: #f8fafc; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 6px; font-size: 11px; }
    .signatures { margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px; }
    .sign-box { border-top: 1px dashed #94a3b8; width: 170px; text-align: center; padding-top: 6px; }
    @media print { body { margin: 10mm; } }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="school-name">${schoolName}</h1>
    <p class="sub-title">${address} • ফোন: ${phone}</p>
    <div class="badge">ভর্তি আবেদন ফরম ও অফিসিয়াল পরিচিতিপত্র</div>
  </div>
  <div class="meta-bar">
    <span>আবেদন ট্র্যাকিং নম্বর: <b>${app.id}</b></span>
    <span>তারিখ: ${app.appliedDate}</span>
    <span>স্ট্যাটাস: ${app.status}</span>
  </div>
  <table class="info-table">
    <tr><th>শিক্ষার্থীর নাম</th><td><b>${app.applicantName}</b></td><th>আবেদনের শ্রেণি ও শাখা</th><td><b>${app.applyingClass}</b> ${app.section ? `(শাখা: ${app.section})` : '(উন্মুক্ত)'}</td></tr>
    <tr><th>বিভাগ (Group)</th><td>${app.group || 'সাধারণ'}</td><th>লিঙ্গ ও জন্ম তারিখ</th><td>${app.gender} • ${app.dateOfBirth}</td></tr>
    <tr><th>পিতার নাম</th><td>${app.fatherName}</td><th>মাতার নাম</th><td>${app.motherName}</td></tr>
    <tr><th>মোবাইল নম্বর</th><td><b>${app.phone}</b></td><th>ইমেইল</th><td>${app.email || '—'}</td></tr>
    <tr><th>পূর্ববর্তী বিদ্যালয়</th><td>${app.previousSchool}</td><th>পূর্বের জিপিএ/গ্রেড</th><td><b>${app.gpaOrGrade}</b></td></tr>
    <tr><th>বর্তমান ঠিকানা</th><td colspan="3">${app.presentAddress}</td></tr>
  </table>
  <div style="margin-bottom: 16px;">
    <h4 style="margin: 0 0 6px; font-size: 12px;">নির্ধারিত পাঠ্য বিষয়সমূহ (${subList.length} টি):</h4>
    <div class="subjects">
      ${subList.map((s) => `<span class="sub-chip">${s}</span>`).join('')}
    </div>
  </div>
  <div class="signatures">
    <div class="sign-box">আবেদনকারীর স্বাক্ষর</div>
    <div class="sign-box">অভিভাবকের স্বাক্ষর</div>
    <div class="sign-box">প্রধান শিক্ষকের অনুমোদন ও সিল</div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${app.applicantName}_ভর্তি_আবেদন_স্লিপ_${app.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyId = () => {
    if (!submittedApp) return;
    navigator.clipboard.writeText(submittedApp.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative border border-gray-100 max-h-[94vh] overflow-y-auto space-y-4 text-xs text-gray-800">
        {/* Close Button Top Right */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition cursor-pointer z-20"
          title="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedApp ? (
          /* =========================================================
             PREVIEW & PRINT/DOWNLOAD RECEIPT SLIP AFTER SUBMISSION
             ========================================================= */
          <div className="space-y-4">
            {/* Top Success Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-900">
                    ভর্তি আবেদন সফলভাবে জমা হয়েছে!
                  </h3>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    আপনার আবেদনের অফিশিয়াল পরিচিতি স্লিপটি নিচে প্রিভিউ করা হয়েছে। এটি প্রিন্ট বা PDF ডাউনলোড করে সংরক্ষণ করুন।
                  </p>
                </div>
              </div>

              {/* Quick Copy Tracking ID */}
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 font-mono font-bold rounded-xl border border-emerald-300 text-xs transition cursor-pointer shrink-0 self-start sm:self-auto shadow-2xs"
                title="আবেদন আইডি কপি করুন"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-emerald-700" />}
                <span>{copiedId ? 'কপি হয়েছে' : `আইডি: ${submittedApp.id}`}</span>
              </button>
            </div>

            {/* Action Bar (Print, PDF, Offline HTML, Close) */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-gray-100 no-print">
              <div className="flex flex-wrap items-center gap-2">
                {/* Print Button */}
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  disabled={isPrinting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#15803d] hover:bg-[#166534] text-white rounded-xl font-bold transition cursor-pointer shadow-xs disabled:opacity-60"
                  title="প্রিন্টার দিয়ে প্রিন্ট করুন"
                >
                  {isPrinting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                  <span>{isPrinting ? 'প্রিন্ট হচ্ছে...' : 'আবেদন প্রিন্ট করুন'}</span>
                </button>

                {/* PDF Download Button */}
                <button
                  type="button"
                  onClick={handleDownloadSlipPdf}
                  disabled={isExportingPdf}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition cursor-pointer shadow-xs disabled:opacity-60"
                  title="সরাসরি PDF ফাইল হিসেবে ডাউনলোড করুন"
                >
                  {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                  <span>{isExportingPdf ? 'PDF তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
                </button>

                {/* Offline File Download */}
                <button
                  type="button"
                  onClick={handleDownloadSlipHtml}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition cursor-pointer"
                  title="অফলাইন ফাইল ডাউনলোড"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>অফলাইন ফাইল</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition cursor-pointer"
              >
                সম্পন্ন / বন্ধ করুন
              </button>
            </div>

            {/* Official Printable Admission Slip Card */}
            <div
              id="printable-admission-slip"
              className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-200 shadow-2xs space-y-4 text-gray-900"
            >
              {/* Official School Header */}
              <div className="text-center border-b-2 border-emerald-700 pb-3 mb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-emerald-900">
                  {siteSettings?.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়'}
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  {siteSettings?.address || 'দাদরা, জয়পুরহাট'} • ফোন: {siteSettings?.phone1 || '+৮৮০১৭১২-৩৪৫৬৭৮'}
                </p>
                <div className="inline-block mt-2 px-3.5 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-full text-xs font-bold shadow-2xs">
                  অনলাইন ভর্তি আবেদন ফরম ও অফিশিয়াল পরিচিতিপত্র (Admission Slip)
                </div>
              </div>

              {/* Meta Tracking Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-medium">
                <div>
                  <span className="text-gray-500 font-sans">আবেদন ট্র্যাকিং নম্বর:</span>{' '}
                  <b className="text-emerald-900 bg-white px-2 py-0.5 rounded border border-gray-200">{submittedApp.id}</b>
                </div>
                <div>
                  <span className="text-gray-500 font-sans">তারিখ:</span>{' '}
                  <span className="text-gray-800 font-semibold">{submittedApp.appliedDate}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-sans">স্ট্যাটাস:</span>{' '}
                  <span className="bg-amber-100 text-amber-900 font-sans font-bold px-2 py-0.5 rounded text-[11px] border border-amber-200">
                    অপেক্ষমাণ (Pending)
                  </span>
                </div>
              </div>

              {/* Student Photo & Personal Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* Photo & Core Badge */}
                <div className="md:col-span-1 flex flex-col items-center justify-center p-3 bg-gray-50/70 rounded-xl border border-gray-200 text-center space-y-2">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-emerald-600 bg-white shadow-xs flex items-center justify-center">
                    {submittedApp.image ? (
                      <img
                        src={submittedApp.image}
                        alt={submittedApp.applicantName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-emerald-800 text-3xl">
                        {submittedApp.applicantName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{submittedApp.applicantName}</h4>
                    <p className="text-emerald-800 font-bold text-xs mt-0.5">
                      {submittedApp.applyingClass} {submittedApp.section ? `(শাখা: ${submittedApp.section})` : ''}
                    </p>
                    <p className="text-[11px] text-gray-500">বিভাগ: {submittedApp.group || 'সাধারণ'}</p>
                  </div>
                </div>

                {/* Details Table */}
                <div className="md:col-span-2 space-y-2 bg-gray-50/50 p-3.5 rounded-xl border border-gray-200 text-xs">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <span className="text-gray-500 block text-[11px]">পিতার নাম:</span>
                      <span className="font-bold text-gray-900">{submittedApp.fatherName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">মাতার নাম:</span>
                      <span className="font-bold text-gray-900">{submittedApp.motherName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">জন্ম তারিখ:</span>
                      <span className="font-semibold text-gray-800">{submittedApp.dateOfBirth}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">লিঙ্গ:</span>
                      <span className="font-semibold text-gray-800">{submittedApp.gender}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">যোগাযোগের মোবাইল:</span>
                      <span className="font-mono font-bold text-emerald-900">{submittedApp.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">ইমেইল:</span>
                      <span className="font-mono text-gray-700">{submittedApp.email || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">পূর্ববর্তী শিক্ষাপ্রতিষ্ঠান:</span>
                      <span className="font-semibold text-gray-800">{submittedApp.previousSchool}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">পূর্বের জিপিএ বা গ্রেড:</span>
                      <span className="font-bold text-emerald-900">{submittedApp.gpaOrGrade}</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-gray-200">
                      <span className="text-gray-500 block text-[11px]">বর্তমান স্থায়ী ঠিকানা:</span>
                      <span className="font-medium text-gray-800">{submittedApp.presentAddress}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrolled Subjects List Section */}
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                    <span>পাঠ্য বিষয়সমূহ ({allEnrolledSubjects.length} টি নির্ধারিত বিষয়):</span>
                  </h4>
                  {submittedApp.additionalSubject && (
                    <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[11px] border border-amber-300">
                      ★ ৪র্থ বিষয়: {submittedApp.additionalSubject}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {allEnrolledSubjects.map((sub, idx) => {
                    const isElective = sub.includes('৪র্থ বিষয়');
                    return (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1 ${
                          isElective
                            ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                            : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        }`}
                      >
                        {isElective ? <Sparkles className="w-3 h-3 text-amber-600" /> : <Check className="w-3 h-3 text-emerald-600" />}
                        <span>{sub}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Official Signatures Row */}
              <div className="mt-10 pt-6 flex items-center justify-between text-xs text-gray-600 border-t border-dashed border-gray-300">
                <div className="text-center">
                  <div className="w-28 border-t border-gray-400 pt-1 font-semibold text-gray-700">
                    শিক্ষার্থীর স্বাক্ষর
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-32 border-t border-gray-400 pt-1 font-semibold text-gray-700">
                    অভিভাবকের স্বাক্ষর
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-36 border-t border-gray-400 pt-1 font-semibold text-gray-700">
                    প্রধান শিক্ষকের অনুমোদন ও সিল
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 no-print">
              <button
                type="button"
                onClick={handlePrintSlip}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadSlipPdf}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-xs"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>PDF ডাউনলোড</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================
             ADMISSION APPLICATION FORM
             ========================================================= */
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 pr-10">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200 shadow-2xs">
                <GraduationCap className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  অনলাইন ভর্তি আবেদন ফর্ম
                </h3>
                <p className="text-xs text-gray-500">
                  {siteSettings?.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়'} – শিক্ষাবর্ষে ভর্তির আবেদন
                </p>
              </div>
            </div>

            {/* General Validation Notice if errors exist */}
            {Object.keys(formErrors).length > 0 && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>অনুগ্রহ করে লাল চিহ্নিত সকল বাধ্যতামূলক তথ্য সঠিকভাবে পূরণ করুন।</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Photo Upload Section */}
              <div className="bg-gray-50/90 p-3.5 rounded-2xl border border-gray-200">
                <label className="block font-bold text-gray-700 mb-2 flex items-center gap-1.5 text-xs">
                  <Camera className="w-3.5 h-3.5 text-emerald-700" />
                  <span>শিক্ষার্থীর ছবি (ডিভাইস থেকে যুক্ত করুন)</span>
                </label>

                <div className="flex items-center gap-4">
                  {/* Photo Preview Circle */}
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 overflow-hidden bg-white flex items-center justify-center shrink-0 relative shadow-2xs group">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="Student Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-400 p-1">
                        <ImageIcon className="w-6 h-6 mx-auto mb-0.5 text-gray-300" />
                        <span className="text-[9px] block font-medium">ছবি নেই</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{formData.image ? 'ছবি পরিবর্তন করুন' : 'ডিভাইস থেকে আপলোড'}</span>
                      </button>
                      {formData.image && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded hover:bg-rose-50 transition cursor-pointer"
                        >
                          ছবি মুছুন
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">
                      JPG, PNG বা WebP ফরম্যাট (স্বয়ংক্রিয়ভাবে অপ্টিমাইজ হবে)
                    </p>
                    {uploadError && <p className="text-rose-600 text-[11px]">{uploadError}</p>}
                  </div>
                </div>
              </div>

              {/* Student Name & Applying Class */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div id="field-applicantName">
                  <label className="block font-bold text-gray-700 mb-1">
                    শিক্ষার্থীর পূর্ণ নাম <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: তানভীর হাসান"
                    value={formData.applicantName}
                    onChange={(e) => {
                      setFormData({ ...formData, applicantName: e.target.value });
                      if (formErrors.applicantName) {
                        setFormErrors((prev) => ({ ...prev, applicantName: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-hidden font-medium bg-gray-50/60 ${
                      formErrors.applicantName
                        ? 'border-rose-400 bg-rose-50/30'
                        : 'border-gray-200 focus:border-emerald-600'
                    }`}
                  />
                  {formErrors.applicantName && (
                    <p className="text-rose-600 text-[11px] mt-1 font-semibold">{formErrors.applicantName}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    আবেদনের শ্রেণি <span className="text-rose-600 font-bold">*</span>{' '}
                    <span className="text-emerald-700 font-semibold text-[11px]">(সিলেক্ট করুন)</span>
                  </label>
                  <select
                    value={formData.applyingClass}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-600 bg-gray-50/60 font-semibold text-gray-800"
                  >
                    <option value="৬ষ্ঠ শ্রেণি">৬ষ্ঠ শ্রেণি</option>
                    <option value="৭ম শ্রেণি">৭ম শ্রেণি</option>
                    <option value="৮ম শ্রেণি">৮ম শ্রেণি</option>
                    <option value="৯ম শ্রেণি">৯ম শ্রেণি</option>
                    <option value="১০ম শ্রেণি">১০ম শ্রেণি</option>
                  </select>
                </div>
              </div>

              {/* Group & Section (Section is OPTIONAL: 'শাখা অপশান যেন issa moto dite pare nah dileo jeno problem nah hoi') */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    বিভাগ (Group) {isClass910 ? <span className="text-rose-600 font-bold">*</span> : <span className="text-gray-400 font-normal text-[11px]">(৬ষ্ঠ-৮ম এর জন্য ফিক্সড)</span>}
                  </label>
                  {isClass910 ? (
                    <select
                      value={formData.group}
                      onChange={(e) => handleGroupChange(e.target.value)}
                      className="w-full px-3 py-2 border border-emerald-300 rounded-xl focus:outline-hidden focus:border-emerald-600 bg-emerald-50/60 font-bold text-emerald-950"
                    >
                      <option value="বিজ্ঞান">বিজ্ঞান বিভাগ</option>
                      <option value="মানবিক">মানবিক বিভাগ</option>
                      <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা বিভাগ</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      value="সাধারণ (সকলের জন্য নির্ধারিত)"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 font-medium"
                    />
                  )}
                </div>

                {/* Section (Optional: 'ইচ্ছামতো দিতে পারে, না দিলেও সমস্যা নেই') */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1 flex items-center justify-between">
                    <span>শাখা (পছন্দক্রম)</span>
                    <span className="text-gray-400 font-normal text-[11px]">ঐচ্ছিক (না দিলেও সমস্যা নেই)</span>
                  </label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-600 bg-gray-50/60 font-semibold text-gray-800"
                  >
                    <option value="">কোনো শাখা নির্দিষ্ট নয় / উন্মুক্ত (ঐচ্ছিক)</option>
                    <option value="A">ক শাখা (Section A)</option>
                    <option value="B">খ শাখা (Section B)</option>
                    <option value="C">গ শাখা (Section C)</option>
                  </select>
                </div>
              </div>

              {/* 4th / Elective Subject Selector for Class 9/10 */}
              {isClass910 && (
                <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200/80">
                  <label className="block font-bold text-amber-950 mb-1 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>৪র্থ বিষয় / অতিরিক্ত বিষয় (Additional Subject) নির্বাচন করুন</span>
                    <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <p className="text-[11px] text-amber-800 mb-2">
                    {formData.group} বিভাগের জন্য আপনার পছন্দের অতিরিক্ত পাঠ্য বিষয় নির্বাচন করুন:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {availableElectives.map((elective) => (
                      <label
                        key={elective}
                        className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition ${
                          formData.additionalSubject === elective
                            ? 'bg-amber-100 border-amber-400 font-bold text-amber-950 shadow-2xs'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="additionalSubject"
                          checked={formData.additionalSubject === elective}
                          onChange={() => setFormData({ ...formData, additionalSubject: elective })}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-xs">{elective}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Subject List Display Card (NCTB Curriculum Subjects) */}
              <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>
                      {isClass910
                        ? `${formData.group} বিভাগের নির্ধারিত পাঠ্য বিষয়সমূহ (মোট ${allEnrolledSubjects.length} টি বিষয়)`
                        : `৬ষ্ঠ-৮ম শ্রেণির নির্ধারিত পাঠ্য বিষয়সমূহ (মোট ${coreSubjects.length} টি বিষয় ফিক্সড)`}
                    </span>
                  </h4>
                  <span className="text-[10px] text-emerald-800 font-semibold bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    এনসিটিবি কারিকুলাম
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {allEnrolledSubjects.map((subject, idx) => {
                    const isAdditional = subject.includes('৪র্থ বিষয়');
                    return (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1 ${
                          isAdditional
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-2xs'
                            : 'bg-white text-emerald-900 border-emerald-200'
                        }`}
                      >
                        {isAdditional ? (
                          <Sparkles className="w-3 h-3 text-amber-600" />
                        ) : (
                          <Check className="w-3 h-3 text-emerald-600" />
                        )}
                        <span>{subject}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Father Name & Mother Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div id="field-fatherName">
                  <label className="block font-bold text-gray-700 mb-1">
                    পিতার নাম <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="পিতার নাম লিখুন"
                    value={formData.fatherName}
                    onChange={(e) => {
                      setFormData({ ...formData, fatherName: e.target.value });
                      if (formErrors.fatherName) {
                        setFormErrors((prev) => ({ ...prev, fatherName: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-hidden bg-gray-50/60 ${
                      formErrors.fatherName
                        ? 'border-rose-400 bg-rose-50/30'
                        : 'border-gray-200 focus:border-emerald-600'
                    }`}
                  />
                  {formErrors.fatherName && (
                    <p className="text-rose-600 text-[11px] mt-1 font-semibold">{formErrors.fatherName}</p>
                  )}
                </div>

                <div id="field-motherName">
                  <label className="block font-bold text-gray-700 mb-1">
                    মাতার নাম <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="মাতার নাম লিখুন"
                    value={formData.motherName}
                    onChange={(e) => {
                      setFormData({ ...formData, motherName: e.target.value });
                      if (formErrors.motherName) {
                        setFormErrors((prev) => ({ ...prev, motherName: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-hidden bg-gray-50/60 ${
                      formErrors.motherName
                        ? 'border-rose-400 bg-rose-50/30'
                        : 'border-gray-200 focus:border-emerald-600'
                    }`}
                  />
                  {formErrors.motherName && (
                    <p className="text-rose-600 text-[11px] mt-1 font-semibold">{formErrors.motherName}</p>
                  )}
                </div>
              </div>

              {/* Date of Birth, Gender & Contact Phone (Marked in screenshot) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Date of Birth - Mandatory */}
                <div id="field-dateOfBirth">
                  <label className="block font-bold text-gray-700 mb-1">
                    জন্ম তারিখ <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => {
                      setFormData({ ...formData, dateOfBirth: e.target.value });
                      if (formErrors.dateOfBirth) {
                        setFormErrors((prev) => ({ ...prev, dateOfBirth: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-hidden bg-gray-50/60 ${
                      formErrors.dateOfBirth
                        ? 'border-rose-400 bg-rose-50/30'
                        : 'border-gray-200 focus:border-emerald-600'
                    }`}
                  />
                  {formErrors.dateOfBirth && (
                    <p className="text-rose-600 text-[11px] mt-1 font-semibold">{formErrors.dateOfBirth}</p>
                  )}
                </div>

                {/* Gender - Mandatory */}
                <div id="field-gender">
                  <label className="block font-bold text-gray-700 mb-1">
                    লিঙ্গ <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => {
                      setFormData({ ...formData, gender: e.target.value as any });
                      if (formErrors.gender) {
                        setFormErrors((prev) => ({ ...prev, gender: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-hidden font-semibold text-gray-800 bg-gray-50/60 ${
                      formErrors.gender
                        ? 'border-rose-400 bg-rose-50/30'
                        : 'border-gray-200 focus:border-emerald-600'
                    }`}
                  >
                    <option value="ছাত্র">ছাত্র</option>
                    <option value="ছাত্রী">ছাত্রী</option>
                  </select>
                  {formErrors.gender && (
                    <p className="text-rose-600 text-[11px] mt-1 font-semibold">{formErrors.gender}</p>
                  )}
                </div>

                {/* Contact Phone - Mandatory */}
                <div id="field-phone">
                  <label className="block font-bold text-gray-700 mb-1">
                    যোগাযোগের ফোন <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+8801700000000"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (formErrors.phone) {
                        setFormErrors((prev) => ({ ...prev, phone: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-hidden font-mono font-medium bg-gray-50/60 ${
                      formErrors.phone
                        ? 'border-rose-400 bg-rose-50/30'
                        : 'border-gray-200 focus:border-emerald-600'
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-rose-600 text-[11px] mt-1 font-semibold">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              {/* Previous School & GPA (Marked in screenshot - Mandatory) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div id="field-previousSchool">
                  <label className="block font-bold text-gray-700 mb-1">
                    পূর্ববর্তী শিক্ষাপ্রতিষ্ঠানের নাম <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="পূর্বে কোন স্কুলে পড়তেন লিখুন"
                    value={formData.previousSchool}
                    onChange={(e) => {
                      setFormData({ ...formData, previousSchool: e.target.value });
                      if (formErrors.previousSchool) {
                        setFormErrors((prev) => ({ ...prev, previousSchool: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-hidden bg-gray-50/60 ${
                      formErrors.previousSchool
                        ? 'border-rose-400 bg-rose-50/30'
                        : 'border-gray-200 focus:border-emerald-600'
                    }`}
                  />
                  {formErrors.previousSchool && (
                    <p className="text-rose-600 text-[11px] mt-1 font-semibold">{formErrors.previousSchool}</p>
                  )}
                </div>

                <div id="field-gpaOrGrade">
                  <label className="block font-bold text-gray-700 mb-1">
                    পূর্বের জিপিএ বা গ্রেড <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: ৫.০০ বা A+"
                    value={formData.gpaOrGrade}
                    onChange={(e) => {
                      setFormData({ ...formData, gpaOrGrade: e.target.value });
                      if (formErrors.gpaOrGrade) {
                        setFormErrors((prev) => ({ ...prev, gpaOrGrade: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-hidden font-mono bg-gray-50/60 ${
                      formErrors.gpaOrGrade
                        ? 'border-rose-400 bg-rose-50/30'
                        : 'border-gray-200 focus:border-emerald-600'
                    }`}
                  />
                  {formErrors.gpaOrGrade && (
                    <p className="text-rose-600 text-[11px] mt-1 font-semibold">{formErrors.gpaOrGrade}</p>
                  )}
                </div>
              </div>

              {/* Present Address (Marked in screenshot - Mandatory) */}
              <div id="field-presentAddress">
                <label className="block font-bold text-gray-700 mb-1">
                  বর্তমান ঠিকানা <span className="text-rose-600 font-bold">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="গ্রাম/রোড, ডাকঘর, উপজেলা, জেলা লিখুন"
                  value={formData.presentAddress}
                  onChange={(e) => {
                    setFormData({ ...formData, presentAddress: e.target.value });
                    if (formErrors.presentAddress) {
                      setFormErrors((prev) => ({ ...prev, presentAddress: '' }));
                    }
                  }}
                  className={`w-full px-3.5 py-2 border rounded-xl focus:outline-hidden bg-gray-50/60 resize-none ${
                    formErrors.presentAddress
                      ? 'border-rose-400 bg-rose-50/30'
                      : 'border-gray-200 focus:border-emerald-600'
                  }`}
                />
                {formErrors.presentAddress && (
                  <p className="text-rose-600 text-[11px] mt-1 font-semibold">{formErrors.presentAddress}</p>
                )}
              </div>

              {/* Optional Email */}
              <div>
                <label className="block font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span>ইমেইল ঠিকানা</span>
                  <span className="text-gray-400 font-normal text-[11px]">ঐচ্ছিক</span>
                </label>
                <input
                  type="email"
                  placeholder="example@gmail.com (ঐচ্ছিক)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-600 bg-gray-50/60 font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition cursor-pointer text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#15803d] hover:bg-[#166534] active:bg-[#14532d] text-white font-bold rounded-xl shadow-xs transition cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <span>আবেদন জমা দিন</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
