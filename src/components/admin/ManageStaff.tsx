import React, { useState, useRef, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Upload,
  Camera,
  Image as ImageIcon,
  CheckCircle,
  Briefcase,
  Users,
  Printer,
  FileDown,
  Download,
  Search,
  Filter,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Staff } from '../../types';
import { compressImageFile } from '../../utils/imageUpload';

export const ManageStaff: React.FC = () => {
  const { staff, addStaff, updateStaff, deleteStaff, siteSettings } = useSchool();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('ALL');
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Derive unique designations and departments
  const designationOptions = useMemo(() => {
    const set = new Set<string>();
    staff.forEach((s) => {
      const d = s.designation || s.role;
      if (d?.trim()) set.add(d.trim());
    });
    return Array.from(set);
  }, [staff]);

  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    staff.forEach((s) => {
      if (s.department?.trim()) set.add(s.department.trim());
    });
    return Array.from(set);
  }, [staff]);

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const sDesig = s.designation || s.role || '';
      if (q) {
        const matchName = s.name.toLowerCase().includes(q);
        const matchDesig = sDesig.toLowerCase().includes(q);
        const matchDept = s.department?.toLowerCase().includes(q);
        const matchPhone = s.phone?.toLowerCase().includes(q);
        const matchEmail = s.email?.toLowerCase().includes(q);
        if (!matchName && !matchDesig && !matchDept && !matchPhone && !matchEmail) {
          return false;
        }
      }

      if (filterDesignation !== 'ALL' && sDesig !== filterDesignation) {
        return false;
      }

      if (filterDepartment !== 'ALL' && s.department !== filterDepartment) {
        return false;
      }

      return true;
    });
  }, [staff, searchQuery, filterDesignation, filterDepartment]);

  const resetFilters = () => {
    setSearchQuery('');
    setFilterDesignation('ALL');
    setFilterDepartment('ALL');
  };

  const isFilterActive =
    searchQuery.trim() !== '' ||
    filterDesignation !== 'ALL' ||
    filterDepartment !== 'ALL';

  // Dedicated iframe / direct print executor
  const executePrint = () => {
    const sheetElement = document.getElementById('printable-staff-sheet');
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
  <title>${siteSettings?.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়'} - কর্মচারী তালিকা</title>
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
    const sheetElement = document.getElementById('printable-staff-sheet');
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

      const fileName = `staff_list_${Date.now()}.pdf`;
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

    const rowsHtml = filteredStaff
      .map((s, idx) => {
        return `
        <tr>
          <td style="text-align:center; padding: 6px 8px; border: 1px solid #cbd5e1;">${idx + 1}</td>
          <td style="text-align:center; padding: 6px 8px; border: 1px solid #cbd5e1;">
            ${
              s.image
                ? `<img src="${s.image}" alt="" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; display: inline-block;" />`
                : `<div style="width:32px;height:32px;border-radius:50%;background:#ecfdf5;color:#065f46;display:inline-flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;">${
                    s.initial || s.name.charAt(0)
                  }</div>`
            }
          </td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold;">${s.name}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #047857; font-weight: bold;">${s.designation || s.role}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${s.department || 'প্রশাসন'}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace;">${s.phone || '—'}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${s.email || '—'}</td>
        </tr>`;
      })
      .join('');

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${schoolName} - কর্মচারী তালিকা</title>
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
    <div class="badge">কর্মচারী তথ্য বিবরণী ও তালিকা</div>
  </div>
  <div class="meta-bar">
    <div>
      <span>পদবী: <b>${filterDesignation === 'ALL' ? 'সকল পদবী' : filterDesignation}</b></span>
      <span style="margin: 0 6px;">•</span>
      <span>শাখা/বিভাগ: <b>${filterDepartment === 'ALL' ? 'সকল শাখা/বিভাগ' : filterDepartment}</b></span>
    </div>
    <div>তারিখ: <b>${dateStr}</b> • প্রদর্শিত কর্মচারী: <b>${filteredStaff.length} জন</b></div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 35px; text-align: center;">ক্র.</th>
        <th style="width: 45px; text-align: center;">ছবি</th>
        <th>কর্মচারীর নাম</th>
        <th>পদবী</th>
        <th>শাখা / বিভাগ</th>
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
    <div class="sign-col">প্রশাসনিক কর্মকর্তা</div>
    <div class="sign-col">প্রধান শিক্ষকের স্বাক্ষর ও সিল</div>
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `staff_roster_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Add form state
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('');
  const [newStaffDept, setNewStaffDept] = useState('প্রশাসন');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffImage, setNewStaffImage] = useState<string | undefined>(undefined);
  const [addUploadError, setAddUploadError] = useState<string | null>(null);
  const addFileInputRef = useRef<HTMLInputElement | null>(null);

  // Edit modal state
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    designation: '',
    department: '',
    phone: '',
    email: '',
    image: undefined as string | undefined,
  });
  const [editUploadError, setEditUploadError] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  // Success alert
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Image upload for Add form
  const handleAddImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setAddUploadError(null);
      const dataUrl = await compressImageFile(file, 400, 400, 0.85);
      setNewStaffImage(dataUrl);
    } catch (err: any) {
      setAddUploadError(err.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে');
    } finally {
      e.target.value = '';
    }
  };

  // Image upload for Edit form
  const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setEditUploadError(null);
      const dataUrl = await compressImageFile(file, 400, 400, 0.85);
      setEditForm((prev) => ({ ...prev, image: dataUrl }));
    } catch (err: any) {
      setEditUploadError(err.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে');
    } finally {
      e.target.value = '';
    }
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffRole.trim()) return;

    addStaff({
      name: newStaffName.trim(),
      designation: newStaffRole.trim(),
      department: newStaffDept.trim() || 'প্রশাসন',
      phone: newStaffPhone.trim() || '+8801700000000',
      email: newStaffEmail.trim() || 'staff@dadrahs.edu.bd',
      initial: newStaffName.trim().charAt(0),
      image: newStaffImage,
    });

    setNewStaffName('');
    setNewStaffRole('');
    setNewStaffDept('প্রশাসন');
    setNewStaffPhone('');
    setNewStaffEmail('');
    setNewStaffImage(undefined);
    setAddUploadError(null);
    showNotification('নতুন কর্মচারী সফলভাবে যুক্ত করা হয়েছে');
  };

  const openEditModal = (s: Staff) => {
    setEditingStaff(s);
    setEditUploadError(null);
    setEditForm({
      name: s.name,
      designation: s.designation || s.role || '',
      department: s.department || 'প্রশাসন',
      phone: s.phone || '',
      email: s.email || '',
      image: s.image,
    });
  };

  const handleUpdateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff || !editForm.name.trim()) return;

    updateStaff(editingStaff.id, {
      name: editForm.name.trim(),
      designation: editForm.designation.trim(),
      department: editForm.department.trim(),
      phone: editForm.phone.trim(),
      email: editForm.email.trim(),
      initial: editForm.name.trim().charAt(0),
      image: editForm.image,
    });

    setEditingStaff(null);
    showNotification('কর্মচারীর তথ্য সফলভাবে আপডেট করা হয়েছে');
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">কর্মচারী ব্যবস্থাপনা</h1>
          <p className="text-xs text-gray-500">বিদ্যালয়ের অফিস, ল্যাব ও নিরাপত্তা সহকর্মীদের তালিকা</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            title="কর্মচারী তালিকা প্রিন্ট ও পিডিএফ প্রিভিউ"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-700" />
            <span>প্রিন্ট / পিডিএফ</span>
          </button>
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>মোট কর্মচারী: {staff.length} জন</span>
          </span>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-xs animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Add Staff form with Device Photo Upload */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-700" />
            <span>নতুন কর্মচারী যুক্ত করুন</span>
          </h3>
        </div>

        <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
          {/* Photo upload from device box */}
          <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-200">
            <label className="block font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-700" />
              <span>কর্মচারীর ছবি (ডিভাইস থেকে যুক্ত করুন)</span>
            </label>

            <div className="flex items-center gap-4">
              {/* Photo Preview Circle */}
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 overflow-hidden bg-white flex items-center justify-center shrink-0 relative shadow-2xs">
                {newStaffImage ? (
                  <img src={newStaffImage} alt="Staff Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400 p-1">
                    <ImageIcon className="w-5 h-5 mx-auto mb-0.5 text-gray-300" />
                    <span className="text-[8px] block">ছবি নেই</span>
                  </div>
                )}
              </div>

              {/* Upload actions */}
              <div className="space-y-1.5 flex-1">
                <input
                  type="file"
                  ref={addFileInputRef}
                  accept="image/*"
                  onChange={handleAddImageChange}
                  className="hidden"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{newStaffImage ? 'ছবি পরিবর্তন করুন' : 'ডিভাইস থেকে ছবি আপলোড'}</span>
                  </button>

                  {newStaffImage && (
                    <button
                      type="button"
                      onClick={() => setNewStaffImage(undefined)}
                      className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold transition cursor-pointer border border-rose-200"
                    >
                      ছবি মুছুন
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-500">JPG, PNG বা WebP ফরম্যাট (স্বয়ংক্রিয় রিসাইজ ও অপ্টিমাইজ হবে)</p>
                {addUploadError && (
                  <p className="text-[11px] text-rose-600 font-medium">{addUploadError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-gray-600 mb-1">কর্মচারীর নাম *</label>
              <input
                type="text"
                required
                placeholder="যেমন: মোঃ রমিজ উদ্দিন"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-hidden focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-600 mb-1">পদবী *</label>
              <input
                type="text"
                required
                placeholder="যেমন: প্রধান সহকারী"
                value={newStaffRole}
                onChange={(e) => setNewStaffRole(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-hidden focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-600 mb-1">শাখা / বিভাগ</label>
              <input
                type="text"
                placeholder="যেমন: প্রশাসন / হিসাব / ল্যাব"
                value={newStaffDept}
                onChange={(e) => setNewStaffDept(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-hidden focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-600 mb-1">মোবাইল নম্বর</label>
              <input
                type="text"
                placeholder="+88017..."
                value={newStaffPhone}
                onChange={(e) => setNewStaffPhone(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-hidden focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="bg-[#15803d] hover:bg-[#166534] text-white px-5 py-2 rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>যোগ করুন</span>
            </button>
          </div>
        </form>
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
              placeholder="কর্মচারীর নাম, পদবী, শাখা/বিভাগ বা মোবাইল নম্বর দিয়ে খুঁজুন..."
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
              title="তালিকাবদ্ধ কর্মচারীদের তালিকা প্রিন্ট করুন"
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

          {/* Department Dropdown */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-hidden focus:border-emerald-600 font-medium cursor-pointer"
          >
            <option value="ALL">সকল শাখা / বিভাগ</option>
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
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
            প্রদর্শিত কর্মচারী: <span className="font-bold text-emerald-800">{filteredStaff.length} জন</span> (মোট: {staff.length} জন)
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/80 text-gray-700 uppercase font-bold text-[11px] border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4">ছবি</th>
                <th className="py-3.5 px-4">নাম</th>
                <th className="py-3.5 px-4">পদবী</th>
                <th className="py-3.5 px-4">শাখা / বিভাগ</th>
                <th className="py-3.5 px-4">মোবাইল নম্বর</th>
                <th className="py-3.5 px-4 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    কোনো কর্মচারী পাওয়া যায়নি। অন্য কোনো ফিল্টার ব্যবহার করে চেষ্টা করুন।
                  </td>
                </tr>
              ) : (
                filteredStaff.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-800 text-xs shrink-0 shadow-2xs">
                        {s.image ? (
                          <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{s.initial || s.name.charAt(0)}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">{s.name}</td>
                    <td className="py-3 px-4 text-emerald-800 font-semibold">{s.designation || s.role}</td>
                    <td className="py-3 px-4">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px]">
                        {s.department || 'প্রশাসন'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-500">{s.phone}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 rounded-md hover:bg-gray-100 text-emerald-700 transition cursor-pointer"
                          title="সম্পাদনা করুন"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`আপনি কি "${s.name}" কে তালিকা থেকে মুছে ফেলতে চান?`)) {
                              deleteStaff(s.id);
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

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingStaff(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4">
              কর্মচারীর তথ্য ও ছবি সম্পাদনা
            </h3>

            <form onSubmit={handleUpdateStaff} className="space-y-4 text-xs">
              {/* Device Photo Upload in Modal */}
              <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-200">
                <label className="block font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-700" />
                  <span>কর্মচারীর ছবি (ডিভাইস থেকে যুক্ত বা পরিবর্তন করুন)</span>
                </label>

                <div className="flex items-center gap-4">
                  {/* Photo Preview Circle */}
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 overflow-hidden bg-white flex items-center justify-center shrink-0 relative shadow-2xs">
                    {editForm.image ? (
                      <img src={editForm.image} alt="Staff Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-400 p-1">
                        <ImageIcon className="w-6 h-6 mx-auto mb-0.5 text-gray-300" />
                        <span className="text-[9px] block">ছবি নেই</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Actions */}
                  <div className="space-y-1.5 flex-1">
                    <input
                      type="file"
                      ref={editFileInputRef}
                      accept="image/*"
                      onChange={handleEditImageChange}
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{editForm.image ? 'ছবি পরিবর্তন করুন' : 'ডিভাইস থেকে ছবি আপলোড'}</span>
                      </button>

                      {editForm.image && (
                        <button
                          type="button"
                          onClick={() => setEditForm((prev) => ({ ...prev, image: undefined }))}
                          className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold transition cursor-pointer border border-rose-200"
                        >
                          ছবি মুছুন
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500">JPG, PNG বা WebP ফরম্যাট (স্বয়ংক্রিয় রিসাইজ ও অপ্টিমাইজ হবে)</p>
                    {editUploadError && (
                      <p className="text-[11px] text-rose-600 font-medium">{editUploadError}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">কর্মচারীর নাম *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">পদবী *</label>
                  <input
                    type="text"
                    required
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">শাখা / বিভাগ</label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ইমেইল</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
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
                  <span>কর্মচারী তালিকা প্রিন্ট ও পিডিএফ প্রিভিউ</span>
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
                id="printable-staff-sheet"
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
                    কর্মচারী তথ্য বিবরণী ও পূর্ণাঙ্গ তালিকা
                  </div>
                </div>

                {/* Filter Meta Bar */}
                <div className="flex items-center justify-between text-[11px] bg-gray-50 border border-gray-200 p-2.5 rounded-lg mb-4 font-medium">
                  <div>
                    <span>পদবী: <b>{filterDesignation === 'ALL' ? 'সকল পদবী' : filterDesignation}</b></span>
                    <span className="mx-1.5">•</span>
                    <span>শাখা/বিভাগ: <b>{filterDepartment === 'ALL' ? 'সকল শাখা/বিভাগ' : filterDepartment}</b></span>
                  </div>
                  <div className="text-gray-600">
                    তারিখ: <b>{new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'numeric', day: 'numeric' })}</b> • মোট: <b className="text-emerald-800">{filteredStaff.length} জন</b>
                  </div>
                </div>

                {/* Official Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-gray-200 text-xs">
                    <thead>
                      <tr className="bg-emerald-800 text-white text-[11px]">
                        <th className="border border-emerald-900 p-2 text-center w-8 font-bold">ক্র.</th>
                        <th className="border border-emerald-900 p-2 text-center w-12 font-bold">ছবি</th>
                        <th className="border border-emerald-900 p-2 font-bold">কর্মচারীর নাম</th>
                        <th className="border border-emerald-900 p-2 font-bold">পদবী</th>
                        <th className="border border-emerald-900 p-2 font-bold">শাখা / বিভাগ</th>
                        <th className="border border-emerald-900 p-2 font-bold">মোবাইল নম্বর</th>
                        <th className="border border-emerald-900 p-2 font-bold">ইমেইল</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredStaff.map((s, idx) => (
                        <tr key={s.id} className="odd:bg-white even:bg-gray-50/70">
                          <td className="border border-gray-200 p-2 text-center font-medium">{idx + 1}</td>
                          <td className="border border-gray-200 p-2 text-center">
                            {s.image ? (
                              <img
                                src={s.image}
                                alt={s.name}
                                className="w-7 h-7 rounded-full object-cover inline-block border border-gray-300"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] mx-auto">
                                {s.initial || s.name.charAt(0)}
                              </div>
                            )}
                          </td>
                          <td className="border border-gray-200 p-2 font-bold text-gray-900">{s.name}</td>
                          <td className="border border-gray-200 p-2 text-emerald-800 font-semibold">{s.designation || s.role}</td>
                          <td className="border border-gray-200 p-2 text-gray-700">{s.department || 'প্রশাসন'}</td>
                          <td className="border border-gray-200 p-2 font-mono text-gray-600">{s.phone || '—'}</td>
                          <td className="border border-gray-200 p-2 text-gray-600">{s.email || '—'}</td>
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
                    <div className="w-36 border-t border-gray-400 pt-1 font-semibold text-gray-700">প্রশাসনিক কর্মকর্তা</div>
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
