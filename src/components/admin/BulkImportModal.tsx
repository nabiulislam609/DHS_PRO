import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  X,
  Upload,
  Link as LinkIcon,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Copy,
  Info,
  Check,
  ExternalLink,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Teacher, Staff, Student } from '../../types';
import { isClassWithGroups, getSubjectsForClassAndGroup } from '../../data/curriculumSubjects';
import { compressImageFile } from '../../utils/imageUpload';

export type BulkImportType = 'teachers' | 'staff' | 'students';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: BulkImportType;
  onImportTeachers?: (teachers: Omit<Teacher, 'id'>[]) => any;
  onImportStaff?: (staff: Omit<Staff, 'id'>[]) => any;
  onImportStudents?: (students: (Omit<Student, 'id'> & { id?: string })[]) => any;
}

// Convert Bengali digits to English
const normalizeNum = (val: any): string => {
  if (val === undefined || val === null) return '';
  const str = String(val).trim();
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[০-৯]/g, (d) => String(bn.indexOf(d)));
};

// Clean string
const cleanStr = (val: any): string => {
  if (val === undefined || val === null) return '';
  return String(val).trim();
};

// Format or convert Google Drive / Web image URL
const formatImageUrl = (urlStr: any): string => {
  if (!urlStr || typeof urlStr !== 'string') return '';
  const trimmed = urlStr.trim();
  if (!trimmed) return '';

  // Google Drive Image link conversion:
  const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9-_]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return trimmed;
};

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  type,
  onImportTeachers,
  onImportStaff,
  onImportStudents,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'drive' | 'paste'>('file');
  const [dragActive, setDragActive] = useState(false);
  const [driveUrl, setDriveUrl] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  // Parsed records state
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const batchPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const [photoMatchMessage, setPhotoMatchMessage] = useState<string | null>(null);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);

  if (!isOpen) return null;

  const typeConfig = {
    teachers: {
      title: 'শিক্ষক বাল্ক আপলোড (Bulk Import Teachers)',
      label: 'শিক্ষক',
      countLabel: 'জন শিক্ষক',
      sampleFilename: 'Teachers_Bulk_Template.xlsx',
      columns: [
        { key: 'name', label: 'শিক্ষকের নাম', required: true },
        { key: 'designation', label: 'পদবী', required: true },
        { key: 'subject', label: 'বিষয়', required: false },
        { key: 'phone', label: 'মোবাইল নম্বর', required: false },
        { key: 'email', label: 'ইমেইল', required: false },
        { key: 'initial', label: 'ইনিশিয়াল', required: false },
        { key: 'image', label: 'ছবি (Photo / Drive Link)', required: false },
      ],
      sampleData: [
        {
          'নাম (Name)': 'মাওলানা মোঃ রফিকুল ইসলাম',
          'পদবী (Designation)': 'প্রধান শিক্ষক',
          'বিষয় (Subject)': 'ইসলাম ও নৈতিক শিক্ষা',
          'মোবাইল (Phone)': '01712345678',
          'ইমেইল (Email)': 'headmaster@dadrahs.edu.bd',
          'ইনিশিয়াল (Initial)': 'এমআরআই',
          'ছবি / ফটো লিঙ্ক (Photo URL)': 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
        },
        {
          'নাম (Name)': 'আয়েশা সিদ্দিকা',
          'পদবী (Designation)': 'সহকারী প্রধান শিক্ষক',
          'বিষয় (Subject)': 'ইংরেজি',
          'মোবাইল (Phone)': '01798765432',
          'ইমেইল (Email)': 'ayesha@dadrahs.edu.bd',
          'ইনিশিয়াল (Initial)': 'এএস',
          'ছবি / ফটো লিঙ্ক (Photo URL)': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
        },
        {
          'নাম (Name)': 'মোঃ আনিসুর রহমান',
          'পদবী (Designation)': 'সিনিয়র শিক্ষক',
          'বিষয় (Subject)': 'সাধারণ গণিত',
          'মোবাইল (Phone)': '01811223344',
          'ইমেইল (Email)': 'anis@dadrahs.edu.bd',
          'ইনিশিয়াল (Initial)': 'এমএআর',
          'ছবি / ফটো লিঙ্ক (Photo URL)': '',
        },
      ],
    },
    staff: {
      title: 'কর্মকর্তা ও কর্মচারী বাল্ক আপলোড (Bulk Import Staff)',
      label: 'কর্মকর্তা/কর্মচারী',
      countLabel: 'জন কর্মী',
      sampleFilename: 'Staff_Bulk_Template.xlsx',
      columns: [
        { key: 'name', label: 'নাম', required: true },
        { key: 'designation', label: 'পদবী', required: true },
        { key: 'department', label: 'বিভাগ / দপ্তর', required: false },
        { key: 'phone', label: 'মোবাইল নম্বর', required: false },
        { key: 'email', label: 'ইমেইল', required: false },
        { key: 'role', label: 'দায়িত্ব / ভূমিকা', required: false },
        { key: 'image', label: 'ছবি (Photo / Drive Link)', required: false },
      ],
      sampleData: [
        {
          'নাম (Name)': 'মোঃ শফিকুল আলম',
          'পদবী (Designation)': 'অফিস সহকারী কাম কম্পিউটার অপারেটর',
          'বিভাগ (Department)': 'প্রশাসন ও তথ্যপ্রযুক্তি',
          'মোবাইল (Phone)': '01711223300',
          'ইমেইল (Email)': 'shafiq@dadrahs.edu.bd',
          'দায়িত্ব (Role)': 'নথি সংরক্ষণ ও ডিজিটাল সেবা',
          'ছবি / ফটো লিঙ্ক (Photo URL)': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        },
        {
          'নাম (Name)': 'মোঃ আব্দুল কাদের',
          'পদবী (Designation)': 'হিসাব সহকারী',
          'বিভাগ (Department)': 'হিসাব শাখা',
          'মোবাইল (Phone)': '01822334455',
          'ইমেইল (Email)': 'kader@dadrahs.edu.bd',
          'দায়িত্ব (Role)': 'ফি ও লেনদেন হিসাব',
          'ছবি / ফটো লিঙ্ক (Photo URL)': '',
        },
        {
          'নাম (Name)': 'মোঃ রতন মিয়া',
          'পদবী (Designation)': 'এমএলএসএস / পিয়ন',
          'বিভাগ (Department)': 'সাধারণ সেবা',
          'মোবাইল (Phone)': '01933445566',
          'ইমেইল (Email)': '',
          'দায়িত্ব (Role)': 'অফিস ও ক্যাম্পাস ব্যবস্থাপনা',
          'ছবি / ফটো লিঙ্ক (Photo URL)': '',
        },
      ],
    },
    students: {
      title: 'শিক্ষার্থী বাল্ক আপলোড (Bulk Import Students)',
      label: 'শিক্ষার্থী',
      countLabel: 'জন শিক্ষার্থী',
      sampleFilename: 'Students_Bulk_Template.xlsx',
      columns: [
        { key: 'roll', label: 'শ্রেণির রোল', required: true },
        { key: 'name', label: 'শিক্ষার্থীর নাম', required: true },
        { key: 'studentClass', label: 'শ্রেণি', required: true },
        { key: 'section', label: 'শাখা', required: false },
        { key: 'guardianName', label: 'অভিভাবকের নাম', required: false },
        { key: 'phone', label: 'মোবাইল নম্বর', required: false },
        { key: 'group', label: 'বিভাগ (গ্রুপ)', required: false },
        { key: 'gender', label: 'লিঙ্গ', required: false },
        { key: 'image', label: 'ছবি (Photo / Drive Link)', required: false },
      ],
      sampleData: [
        {
          'রোল (Roll)': '১',
          'নাম (Name)': 'তানভীর আহমেদ',
          'শ্রেণি (Class)': '৬ষ্ঠ শ্রেণি',
          'শাখা (Section)': 'ক',
          'অভিভাবকের নাম (Guardian)': 'মোঃ কামাল হোসেন',
          'মোবাইল (Phone)': '01711223344',
          'বিভাগ (Group)': 'সাধারণ',
          'লিঙ্গ (Gender)': 'ছাত্র',
          'ছবি / ফটো লিঙ্ক (Photo URL)': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        },
        {
          'রোল (Roll)': '২',
          'নাম (Name)': 'ফাতিমা আক্তার',
          'শ্রেণি (Class)': '৬ষ্ঠ শ্রেণি',
          'শাখা (Section)': 'ক',
          'অভিভাবকের নাম (Guardian)': 'আহমেদ উল্লাহ',
          'মোবাইল (Phone)': '01811223355',
          'বিভাগ (Group)': 'সাধারণ',
          'লিঙ্গ (Gender)': 'ছাত্রী',
          'ছবি / ফটো লিঙ্ক (Photo URL)': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
        },
        {
          'রোল (Roll)': '১',
          'নাম (Name)': 'মোঃ নাফিস ইকবাল',
          'শ্রেণি (Class)': '৯ম শ্রেণি',
          'শাখা (Section)': 'বিজ্ঞান-ক',
          'অভিভাবকের নাম (Guardian)': 'মোঃ ইকবাল হোসেন',
          'মোবাইল (Phone)': '01911223366',
          'বিভাগ (Group)': 'বিজ্ঞান',
          'লিঙ্গ (Gender)': 'ছাত্র',
          'ছবি / ফটো লিঙ্ক (Photo URL)': '',
        },
      ],
    },
  }[type];

  // Helper: Find value from multiple possible header alias keys
  const getVal = (row: Record<string, any>, aliases: string[]): string => {
    const rowKeys = Object.keys(row);
    for (const alias of aliases) {
      const lowerAlias = alias.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]/g, '');
      for (const k of rowKeys) {
        const lowerK = k.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]/g, '');
        if (lowerK === lowerAlias || lowerK.includes(lowerAlias) || lowerAlias.includes(lowerK)) {
          const val = row[k];
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            return String(val).trim();
          }
        }
      }
    }
    return '';
  };

  // Convert raw row array into typed entity
  const processRawRows = (rawRows: Record<string, any>[]) => {
    setErrorMessage(null);
    if (!rawRows || rawRows.length === 0) {
      setErrorMessage('ফাইলে কোনো তথ্য পাওয়া যায়নি। অনুগ্রহ করে সঠিক ফরম্যাটের ফাইল ব্যবহার করুন।');
      setParsedRows([]);
      setSelectedIndices([]);
      return;
    }

    const processed: any[] = [];

    rawRows.forEach((r, idx) => {
      // Ignore completely empty rows
      const hasAnyValue = Object.values(r).some((v) => v !== undefined && v !== null && String(v).trim() !== '');
      if (!hasAnyValue) return;

      if (type === 'teachers') {
        const name = getVal(r, ['নাম', 'শিক্ষকের নাম', 'শিক্ষক', 'name', 'teacher_name', 'full_name']);
        const designation = getVal(r, ['পদবী', 'পদবি', 'designation', 'position', 'title', 'role']) || 'সহকারী শিক্ষক';
        const subject = getVal(r, ['বিষয়', 'বিষয়', 'subject', 'sub', 'department']) || 'সাধারণ বিষয়';
        const phone = getVal(r, ['মোবাইল', 'ফোন', 'ফোন নম্বর', 'মোবাইল নম্বর', 'phone', 'mobile', 'contact', 'cell']);
        const email = getVal(r, ['ইমেইল', 'ই-মেইল', 'email', 'mail']);
        const image = formatImageUrl(getVal(r, ['ছবি', 'ছবির লিঙ্ক', 'ছবির লিংক', 'ফটো', 'image', 'photo', 'img', 'picture', 'avatar', 'image_url', 'photo_url', 'drive_image']));
        let initial = getVal(r, ['ইনিশিয়াল', 'সংক্ষিপ্ত নাম', 'initial', 'short_name']);

        if (!initial && name) {
          const words = name.split(/\s+/).filter(Boolean);
          initial = words.map((w) => w.charAt(0)).join('').toUpperCase();
        }

        if (name) {
          processed.push({
            name,
            designation,
            subject,
            phone: phone || 'প্রযোজ্য নয়',
            email: email || '',
            initial: initial || 'টিসি',
            image: image || undefined,
            rawIndex: idx,
            isValid: true,
          });
        }
      } else if (type === 'staff') {
        const name = getVal(r, ['নাম', 'কর্মচারীর নাম', 'কর্মকর্তার নাম', 'কর্মী', 'name', 'staff_name', 'full_name']);
        const designation = getVal(r, ['পদবী', 'পদবি', 'designation', 'position', 'role', 'title']) || 'সহকারী';
        const department = getVal(r, ['বিভাগ', 'শাখা', 'দপ্তর', 'department', 'dept']) || 'সাধারণ প্রশাসন';
        const phone = getVal(r, ['মোবাইল', 'ফোন', 'ফোন নম্বর', 'phone', 'mobile', 'contact']);
        const email = getVal(r, ['ইমেইল', 'email', 'mail']);
        const role = getVal(r, ['দায়িত্ব', 'ভূমিকা', 'পদমর্যাদা', 'role', 'duty']) || designation;
        const image = formatImageUrl(getVal(r, ['ছবি', 'ছবির লিঙ্ক', 'ছবির লিংক', 'ফটো', 'image', 'photo', 'img', 'picture', 'avatar', 'image_url', 'photo_url', 'drive_image']));
        let initial = getVal(r, ['ইনিশিয়াল', 'initial']);

        if (!initial && name) {
          const words = name.split(/\s+/).filter(Boolean);
          initial = words.map((w) => w.charAt(0)).join('').toUpperCase();
        }

        if (name) {
          processed.push({
            name,
            designation,
            department,
            phone: phone || 'প্রযোজ্য নয়',
            email: email || '',
            role,
            initial: initial || 'এসটি',
            image: image || undefined,
            rawIndex: idx,
            isValid: true,
          });
        }
      } else if (type === 'students') {
        const rollRaw = getVal(r, ['রোল', 'রোল নম্বর', 'ক্লাস রোল', 'roll', 'class_roll', 'roll_no']);
        const roll = normalizeNum(rollRaw) || String(idx + 1);
        const name = getVal(r, ['নাম', 'শিক্ষার্থীর নাম', 'ছাত্র/ছাত্রীর নাম', 'name', 'student_name', 'full_name']);
        const studentClass = getVal(r, ['শ্রেণি', 'শ্রেণী', 'class', 'student_class', 'grade', 'studentClass']) || '৬ষ্ঠ শ্রেণি';
        const section = getVal(r, ['শাখা', 'সেকশন', 'section', 'sec']) || 'ক';
        const guardianName = getVal(r, ['অভিভাবক', 'অভিভাবকের নাম', 'পিতার নাম', 'guardian', 'father_name', 'guardian_name']) || 'পিতা/মাতা';
        const phone = getVal(r, ['মোবাইল', 'ফোন', 'অভিভাবকের ফোন', 'phone', 'mobile', 'guardian_phone']);
        const group = getVal(r, ['বিভাগ', 'গ্রুপ', 'group']) || 'সাধারণ';
        const gender = (getVal(r, ['লিঙ্গ', 'gender', 'sex']).includes('ী') || getVal(r, ['লিঙ্গ', 'gender']).toLowerCase().includes('female')) ? 'ছাত্রী' : 'ছাত্র';
        const image = formatImageUrl(getVal(r, ['ছবি', 'ছবির লিঙ্ক', 'ছবির লিংক', 'ফটো', 'image', 'photo', 'img', 'picture', 'avatar', 'image_url', 'photo_url', 'drive_image']));

        if (name) {
          processed.push({
            roll,
            name,
            studentClass,
            section,
            guardianName,
            phone: phone || 'প্রযোজ্য নয়',
            group,
            gender,
            image: image || undefined,
            rawIndex: idx,
            isValid: true,
          });
        }
      }
    });

    if (processed.length === 0) {
      setErrorMessage(
        'ফাইলে কোনো বৈধ রেকর্ড খুঁজে পাওয়া যায়নি। কলামের হেডারগুলো (যেমন: "নাম", "পদবী" বা "রোল") সঠিক কিনা যাচাই করুন অথবা নমুনা টেমপ্লেট ডাউনলোড করে দেখুন।'
      );
      setParsedRows([]);
      setSelectedIndices([]);
    } else {
      setParsedRows(processed);
      setSelectedIndices(processed.map((_, i) => i));
      setErrorMessage(null);
    }
  };

  // 1. Handle File Upload
  const handleFileProcess = (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessCount(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        processRawRows(rawJson);
      } catch (err: any) {
        console.error('File parsing error:', err);
        setErrorMessage('ফাইলটি পড়া সম্ভব হয়নি। অনুগ্রহ করে একটি সঠিক .xlsx বা .csv ফাইল ব্যবহার করুন।');
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setIsLoading(false);
      setErrorMessage('ফাইল লোড করার সময় ত্রুটি ঘটেছে।');
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // 2. Handle Google Drive / Sheets Link
  const handleGoogleDriveFetch = async () => {
    if (!driveUrl.trim()) {
      setErrorMessage('অনুগ্রহ করে একটি গুগল শিট অথবা গুগল ড্রাইভের লিঙ্ক দিন।');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const url = driveUrl.trim();
      const fetchUrls: string[] = [];

      // Pattern A: Google Spreadsheet
      const sheetMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (sheetMatch && sheetMatch[1]) {
        const sheetId = sheetMatch[1];
        const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
        const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
        // 1. Google Visualization CSV API (CORS friendly for public sheets)
        fetchUrls.push(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${gidParam}`);
        // 2. Google Sheets Direct CSV export
        fetchUrls.push(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`);
      } else {
        // Pattern B: Google Drive File
        const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/) || url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
        if (driveMatch && driveMatch[1]) {
          const fileId = driveMatch[1];
          fetchUrls.push(`https://drive.google.com/uc?export=download&id=${fileId}`);
          fetchUrls.push(`https://docs.google.com/uc?id=${fileId}&export=download`);
        } else {
          fetchUrls.push(url);
        }
      }

      let success = false;
      let isPrivate = false;

      for (const targetUrl of fetchUrls) {
        try {
          const response = await fetch(targetUrl);
          if (!response.ok) {
            continue;
          }

          const arrayBuffer = await response.arrayBuffer();
          if (!arrayBuffer || arrayBuffer.byteLength === 0) continue;

          // Check if response is Google HTML login / error page
          const sample = new TextDecoder('utf-8').decode(new Uint8Array(arrayBuffer.slice(0, 150))).trim().toLowerCase();
          if (sample.includes('<!doctype html') || sample.includes('<html') || sample.includes('accounts.google.com')) {
            isPrivate = true;
            continue;
          }

          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          processRawRows(rawJson);
          success = true;
          break;
        } catch (fetchErr) {
          console.warn('Endpoint attempt failed:', targetUrl, fetchErr);
        }
      }

      if (!success) {
        if (isPrivate) {
          setErrorMessage(
            'গুগল শিটটি প্রাইভেট (Private) রয়েছে। দয়া করে শিটের Share অপশন থেকে "Anyone with the link can view" করুন অথবা শিটের টেবিলটি কপি করে "সরাসরি পেস্ট" ট্যাবে দিন।'
          );
        } else {
          setErrorMessage(
            'গুগল শিট / ড্রাইভ থেকে ডাটা সরাসরি লোড করা যায়নি (ব্রাউজার সিকিউরিটি বা প্রাইভেসি)। সহজ সমাধান: গুগল শিটের ডাটা কপি করে (Ctrl+C) পাশের "সরাসরি পেস্ট" ট্যাবে দিন অথবা ফাইলটি ডাউনলোড করে "ফাইল আপলোড" ট্যাবে আপলোড করুন।'
          );
        }
      }
    } catch (err: any) {
      console.warn('Google Drive fetch failed:', err);
      setErrorMessage(
        'লিঙ্কটি থেকে ডাটা পড়া সম্ভব হয়নি। শিট থেকে কপি করে "সরাসরি পেস্ট" ট্যাবে দিন।'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Paste Content
  const handlePasteProcess = () => {
    if (!pasteContent.trim()) {
      setErrorMessage('অনুগ্রহ করে এক্সেল বা গুগল শিট থেকে কপি করা ডাটা পেস্ট করুন।');
      return;
    }

    setIsLoading(true);
    try {
      const workbook = XLSX.read(pasteContent, { type: 'string' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      processRawRows(rawJson);
    } catch (err: any) {
      console.error('Paste parse error:', err);
      setErrorMessage('পেস্ট করা ডাটা পার্স করা সম্ভব হয়নি। অনুগ্রহ করে টেবিলের কলাম সহ পেস্ট করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  // Download Sample Template
  const handleDownloadSampleTemplate = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(typeConfig.sampleData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template');
      XLSX.writeFile(wb, typeConfig.sampleFilename);
    } catch (err) {
      console.error('Download template error:', err);
    }
  };

  // Submit and save to database
  const handleConfirmImport = async () => {
    const selectedRows = parsedRows.filter((_, idx) => selectedIndices.includes(idx));
    if (selectedRows.length === 0) {
      setErrorMessage('কমপক্ষে একটি রেকর্ড নির্বাচন করুন।');
      return;
    }

    setIsLoading(true);

    try {
      if (type === 'teachers' && onImportTeachers) {
        const payload: Omit<Teacher, 'id'>[] = selectedRows.map((r) => ({
          name: cleanStr(r.name),
          designation: cleanStr(r.designation),
          subject: cleanStr(r.subject),
          phone: cleanStr(r.phone),
          email: cleanStr(r.email),
          initial: cleanStr(r.initial),
          image: r.image || undefined,
        }));
        await onImportTeachers(payload);
      } else if (type === 'staff' && onImportStaff) {
        const payload: Omit<Staff, 'id'>[] = selectedRows.map((r) => ({
          name: cleanStr(r.name),
          designation: cleanStr(r.designation),
          department: cleanStr(r.department),
          phone: cleanStr(r.phone),
          email: cleanStr(r.email),
          role: cleanStr(r.role),
          initial: cleanStr(r.initial),
          image: r.image || undefined,
        }));
        await onImportStaff(payload);
      } else if (type === 'students' && onImportStudents) {
        const payload: (Omit<Student, 'id'> & { id?: string })[] = selectedRows.map((r) => {
          const sClass = cleanStr(r.studentClass) || '১০ম শ্রেণি';
          const sGroup = cleanStr(r.group) || (isClassWithGroups(sClass) ? 'বিজ্ঞান' : 'সাধারণ');
          const defaultSubjects = getSubjectsForClassAndGroup(sClass, sGroup);
          const sPhone = cleanStr(r.phone) || 'প্রযোজ্য নয়';
          return {
            roll: cleanStr(r.roll),
            name: cleanStr(r.name),
            studentClass: sClass,
            class: sClass,
            section: cleanStr(r.section) || 'ক',
            guardianName: cleanStr(r.guardianName) || 'পিতা/মাতা',
            phone: sPhone,
            guardianPhone: sPhone,
            group: sGroup,
            gender: r.gender === 'ছাত্রী' ? 'ছাত্রী' : 'ছাত্র',
            subjects: defaultSubjects,
            image: r.image || undefined,
          };
        });
        await onImportStudents(payload);
      }

      setSuccessCount(selectedRows.length);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Import confirmation error:', err);
      setErrorMessage(err?.message || 'ডাটাবেজে যুক্ত করার সময় ত্রুটি ঘটেছে।');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Batch Photos Upload matching rows by roll/name/index
  const handleBatchPhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPhotos(true);
    setPhotoMatchMessage(null);

    try {
      const fileList = Array.from(files);
      const updatedRows = [...parsedRows];
      let matchedCount = 0;

      for (const file of fileList) {
        if (!file.type.startsWith('image/')) continue;
        const compressedBase64 = await compressImageFile(file, 400, 400, 0.85);

        // Filename without extension (e.g., '1.jpg' -> '1', 'রাহিম.png' -> 'রাহিম')
        const rawFileName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const cleanName = rawFileName.trim().toLowerCase();
        const normNameNum = normalizeNum(cleanName);

        // Find match in updatedRows
        let matchedIndex = -1;

        if (type === 'students') {
          // Priority 1: Match by roll number
          matchedIndex = updatedRows.findIndex(
            (r) =>
              normalizeNum(r.roll) === normNameNum ||
              cleanStr(r.roll).toLowerCase() === cleanName ||
              cleanStr(r.roll).toLowerCase() === normNameNum
          );

          // Priority 2: Match by student name
          if (matchedIndex === -1) {
            matchedIndex = updatedRows.findIndex((r) => {
              const rName = cleanStr(r.name).toLowerCase();
              return rName === cleanName || rName.includes(cleanName) || cleanName.includes(rName);
            });
          }

          // Priority 3: Match by row sequence / serial number (e.g., file '1.jpg' -> row 0)
          if (matchedIndex === -1 && /^\d+$/.test(normNameNum)) {
            const idxNum = parseInt(normNameNum, 10) - 1;
            if (idxNum >= 0 && idxNum < updatedRows.length && !updatedRows[idxNum].image) {
              matchedIndex = idxNum;
            }
          }
        } else {
          // Teachers / Staff: Match by name or serial
          matchedIndex = updatedRows.findIndex((r) => {
            const rName = cleanStr(r.name).toLowerCase();
            return rName === cleanName || rName.includes(cleanName) || cleanName.includes(rName);
          });

          if (matchedIndex === -1 && /^\d+$/.test(normNameNum)) {
            const idxNum = parseInt(normNameNum, 10) - 1;
            if (idxNum >= 0 && idxNum < updatedRows.length && !updatedRows[idxNum].image) {
              matchedIndex = idxNum;
            }
          }
        }

        if (matchedIndex !== -1) {
          updatedRows[matchedIndex] = {
            ...updatedRows[matchedIndex],
            image: compressedBase64,
          };
          matchedCount++;
        }
      }

      setParsedRows(updatedRows);
      if (matchedCount > 0) {
        setPhotoMatchMessage(
          `✓ মোট ${files.length}টি ছবির মধ্যে ${matchedCount} জনের সাথে ছবি সফলভাবে যুক্ত হয়েছে!`
        );
      } else {
        setPhotoMatchMessage(
          `⚠ নির্বাচিত ছবির ফাইলের নামের সাথে কোনো রোল বা নাম মেলেনি। ফাইলের নাম রোল নম্বর (যেমন: 1.jpg, 2.jpg) বা নামের সাথে মিল রেখে চেষ্টা করুন।`
        );
      }
    } catch (err: any) {
      console.error('Batch photo error:', err);
      setErrorMessage('ছবিগুলো প্রসেস করার সময় ত্রুটি ঘটেছে।');
    } finally {
      setIsProcessingPhotos(false);
      e.target.value = '';
    }
  };

  const handleSinglePhotoUpload = async (file: File, rowIdx: number) => {
    try {
      const compressedBase64 = await compressImageFile(file, 400, 400, 0.85);
      setParsedRows((prev) => {
        const next = [...prev];
        next[rowIdx] = {
          ...next[rowIdx],
          image: compressedBase64,
        };
        return next;
      });
    } catch (err: any) {
      console.error('Single photo upload error:', err);
    }
  };

  const handleRemovePhoto = (rowIdx: number) => {
    setParsedRows((prev) => {
      const next = [...prev];
      next[rowIdx] = {
        ...next[rowIdx],
        image: undefined,
      };
      return next;
    });
  };

  // Toggle selection
  const toggleSelectAll = () => {
    if (selectedIndices.length === parsedRows.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(parsedRows.map((_, i) => i));
    }
  };

  const toggleSelectRow = (idx: number) => {
    setSelectedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-xs">
              <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                {typeConfig.title}
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                এক্সেল (.xlsx), সিএসভি (.csv) ফাইল অথবা গুগল ড্রাইভ / শিট লিঙ্ক দিয়ে একসাথে যুক্ত করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSampleTemplate}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/20 transition cursor-pointer"
              title="নমুনা এক্সেল ফাইল ডাউনলোড করুন"
            >
              <Download className="w-3.5 h-3.5" />
              <span>নমুনা ফাইল</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Success Banner */}
          {successCount !== null && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl p-4 flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">সফলভাবে বাল্ক আপলোড সম্পন্ন হয়েছে!</h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  মোট <strong>{successCount}</strong> {typeConfig.countLabel} সফলভাবে ডাটাবেজে যুক্ত করা হয়েছে।
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl p-4 flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <span className="font-bold block text-xs sm:text-sm">সমস্যা দেখা দিয়েছে:</span>
                <p className="text-xs text-rose-800 leading-relaxed">{errorMessage}</p>
                {activeTab === 'drive' && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('paste');
                        setErrorMessage(null);
                      }}
                      className="px-3 py-1 bg-white border border-rose-300 text-rose-900 rounded-lg text-[11px] font-semibold hover:bg-rose-100 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5 text-rose-600" />
                      <span>সরাসরি পেস্ট ট্যাবে যান</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('file');
                        setErrorMessage(null);
                      }}
                      className="px-3 py-1 bg-white border border-rose-300 text-rose-900 rounded-lg text-[11px] font-semibold hover:bg-rose-100 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-rose-600" />
                      <span>ফাইল আপলোড ট্যাবে যান</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Import Method Tabs */}
          {parsedRows.length === 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('file');
                    setErrorMessage(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    activeTab === 'file'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>ফাইল আপলোড (.xlsx / .csv)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('drive');
                    setErrorMessage(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    activeTab === 'drive'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>গুগল ড্রাইভ / গুগল শিট লিঙ্ক</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('paste');
                    setErrorMessage(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    activeTab === 'paste'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  <span>সরাসরি পেস্ট (Copy-Paste)</span>
                </button>
              </div>

              {/* Tab 1: File Upload */}
              {activeTab === 'file' && (
                <div className="space-y-4">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition cursor-pointer ${
                      dragActive
                        ? 'border-emerald-600 bg-emerald-50/70 scale-[0.99]'
                        : 'border-gray-300 hover:border-emerald-500 bg-gray-50/50 hover:bg-emerald-50/30'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileProcess(e.target.files[0]);
                        }
                      }}
                    />
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-inner">
                      <FileSpreadsheet className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                      এক্সেল (.xlsx, .xls) বা সিএসভি (.csv) ফাইল এখানে ড্রপ করুন অথবা ক্লিক করে নির্বাচন করুন
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                      ফাইলে প্রথম সারিতে কলামের নাম (যেমন: {typeConfig.columns.map((c) => c.label).join(', ')}) থাকতে হবে।
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 text-xs font-semibold shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>কম্পিউটার বা ডিভাইস থেকে ফাইল বাছুন</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs">
                    <div className="flex items-start gap-2.5 text-emerald-950 font-medium">
                      <Camera className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-emerald-900 block">ছবিসহ বাল্ক আপলোড টিপস:</span>
                        <p className="text-[11.5px] text-emerald-800 leading-relaxed">
                          এক্সেলে <strong>&quot;ছবি (Photo URL)&quot;</strong> কলামে ছবির লিঙ্ক দিতে পারেন। অথবা ফাইল আপলোডের পরই <strong>&quot;Batch Photo Upload&quot;</strong> দিয়ে কম্পিউটার থেকে সব ছবি একবারে সিলেক্ট করলেই রোল/নাম অনুযায়ী স্বয়ংক্রিয়ভাবে ছবি বসে যাবে।
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadSampleTemplate}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>নমুনা এক্সেল ডাউনলোড</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Google Drive / Sheets Link */}
              {activeTab === 'drive' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-800">
                        গুগল শিট বা ড্রাইভের শেয়ার লিঙ্ক পেস্ট করুন:
                      </label>
                      <p className="text-[11px] text-gray-500">
                        উদাহরণ: <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 font-mono text-[10.5px]">https://docs.google.com/spreadsheets/d/1BxiMVs.../edit</code>
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                        <input
                          type="url"
                          placeholder="গুগল শিট বা ড্রাইভ লিঙ্ক এখানে পেস্ট করুন..."
                          value={driveUrl}
                          onChange={(e) => setDriveUrl(e.target.value)}
                          className="w-full pl-9.5 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-white border border-gray-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleGoogleDriveFetch}
                        disabled={isLoading || !driveUrl.trim()}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>ডাটা লোড হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4" />
                            <span>শিট থেকে ডাটা আনুন</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11.5px] text-amber-900 space-y-1">
                      <span className="font-bold block flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>গুরুত্বপূর্ণ নির্দেশনা:</span>
                      </span>
                      <p className="text-amber-800 leading-relaxed">
                        গুগল শিট থেকে তথ্য সরাসরি আনার জন্য শিটটি শেয়ার অপশন থেকে <strong>&quot;Anyone with the link can view&quot;</strong> হিসেবে পাবলিক রাখুন। শিটের কলামে গুগল ড্রাইভ ছবির লিঙ্ক বা অনলাইন ফটোর লিঙ্ক থাকলে তা স্বয়ংক্রিয়ভাবে ছবিতে রূপান্তর হবে।
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Paste Content */}
              {activeTab === 'paste' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-800">
                      এক্সেল বা গুগল শিট থেকে কপি করা রো গুলো সরাসরি পেস্ট করুন:
                    </label>
                    <textarea
                      rows={6}
                      placeholder={`নাম\tপদবী\tবিষয়\tমোবাইল\nমোঃ করিম\tসহকারী শিক্ষক\tবাংলা\t01700000000`}
                      value={pasteContent}
                      onChange={(e) => setPasteContent(e.target.value)}
                      className="w-full p-3.5 rounded-xl text-xs font-mono bg-gray-50 border border-gray-300 focus:outline-hidden focus:border-emerald-600 focus:bg-white resize-y"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handlePasteProcess}
                      disabled={isLoading || !pasteContent.trim()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>পার্স করা হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          <span>পেস্ট করা ডাটা পার্স করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Parsed Rows Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                    {parsedRows.length}
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">
                      মোট {parsedRows.length} {typeConfig.countLabel} পাওয়া গেছে
                    </h4>
                    <p className="text-[11px] text-emerald-800">
                      বর্তমানে {selectedIndices.length} জন নির্বাচিত রয়েছে। নিচে রিভিউ করে নিশ্চিত করুন।
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-100 transition cursor-pointer"
                  >
                    {selectedIndices.length === parsedRows.length ? 'সব আনচেক করুন' : 'সব সিলেক্ট করুন'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setParsedRows([]);
                      setSelectedIndices([]);
                      setErrorMessage(null);
                      setPhotoMatchMessage(null);
                    }}
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold hover:bg-rose-100 transition cursor-pointer"
                  >
                    মুছে নতুন ফাইল দিন
                  </button>
                </div>
              </div>

              {/* Batch Photo Upload Tool Bar */}
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 border border-teal-200">
                    <Camera className="w-5 h-5 text-teal-700" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <span>একসাথে ছবি আপলোড করতে চান? (Batch Photo Match)</span>
                      <span className="bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                        নতুন ফিচার
                      </span>
                    </h5>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      কম্পিউটার থেকে সব ছবি একবারে সিলেক্ট করুন (ফাইলের নাম রোল যেমন <code className="bg-white px-1 py-0.5 rounded border border-gray-200 font-mono text-[10px]">1.jpg</code>, <code className="bg-white px-1 py-0.5 rounded border border-gray-200 font-mono text-[10px]">2.png</code> বা নাম রাখলে স্বয়ংক্রিয়ভাবে বসে যাবে)।
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  <input
                    ref={batchPhotoInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleBatchPhotosUpload}
                  />
                  <button
                    type="button"
                    onClick={() => batchPhotoInputRef.current?.click()}
                    disabled={isProcessingPhotos}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingPhotos ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>ছবি ম্যাচ হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>কম্পিউটার থেকে ছবি বাছুন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Photo Match Feedback Badge */}
              {photoMatchMessage && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl px-4 py-2 text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{photoMatchMessage}</span>
                </div>
              )}

              {/* Data Table */}
              <div className="rounded-2xl border border-gray-200 shadow-xs overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs text-gray-800">
                  <thead className="bg-gray-100 text-gray-700 font-bold text-[11px] sticky top-0 z-10 border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-12">
                        <input
                          type="checkbox"
                          checked={selectedIndices.length === parsedRows.length && parsedRows.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-3 w-12 text-center">ক্র.</th>
                      <th className="py-2.5 px-2 w-14 text-center">ছবি</th>
                      {type === 'teachers' && (
                        <>
                          <th className="py-2.5 px-3">শিক্ষকের নাম</th>
                          <th className="py-2.5 px-3">পদবী</th>
                          <th className="py-2.5 px-3">বিষয়</th>
                          <th className="py-2.5 px-3">মোবাইল</th>
                          <th className="py-2.5 px-3">ইমেইল</th>
                        </>
                      )}
                      {type === 'staff' && (
                        <>
                          <th className="py-2.5 px-3">কর্মচারীর নাম</th>
                          <th className="py-2.5 px-3">পদবী</th>
                          <th className="py-2.5 px-3">বিভাগ</th>
                          <th className="py-2.5 px-3">মোবাইল</th>
                          <th className="py-2.5 px-3">দায়িত্ব</th>
                        </>
                      )}
                      {type === 'students' && (
                        <>
                          <th className="py-2.5 px-3 text-center w-20">রোল</th>
                          <th className="py-2.5 px-3">শিক্ষার্থীর নাম</th>
                          <th className="py-2.5 px-3">শ্রেণি</th>
                          <th className="py-2.5 px-3">শাখা</th>
                          <th className="py-2.5 px-3">অভিভাবক</th>
                          <th className="py-2.5 px-3">মোবাইল</th>
                          <th className="py-2.5 px-3">বিভাগ</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {parsedRows.map((row, idx) => {
                      const isSelected = selectedIndices.includes(idx);
                      return (
                        <tr
                          key={idx}
                          className={`transition ${
                            isSelected ? 'bg-white hover:bg-emerald-50/30' : 'bg-gray-50/50 opacity-60'
                          }`}
                        >
                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectRow(idx)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-gray-500 text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {row.image ? (
                              <div className="relative group inline-block">
                                <img
                                  src={row.image}
                                  alt={row.name}
                                  className="w-8 h-8 rounded-full object-cover border border-emerald-400 shadow-2xs mx-auto"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(idx)}
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-xs text-[10px] cursor-pointer"
                                  title="ছবি বাদ দিন"
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <label
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-teal-50 border border-dashed border-gray-300 hover:border-teal-500 flex items-center justify-center cursor-pointer mx-auto transition text-gray-400 hover:text-teal-700 group"
                                title="ছবি যোগ করুন"
                              >
                                <Camera className="w-3.5 h-3.5 group-hover:scale-110 transition" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleSinglePhotoUpload(e.target.files[0], idx);
                                    }
                                  }}
                                />
                              </label>
                            )}
                          </td>
                          {type === 'teachers' && (
                            <>
                              <td className="py-2 px-3 font-bold text-gray-950">{row.name}</td>
                              <td className="py-2 px-3 text-gray-700">{row.designation}</td>
                              <td className="py-2 px-3 text-emerald-800 font-medium">{row.subject}</td>
                              <td className="py-2 px-3 font-mono text-gray-600">{row.phone}</td>
                              <td className="py-2 px-3 text-gray-500">{row.email || '—'}</td>
                            </>
                          )}
                          {type === 'staff' && (
                            <>
                              <td className="py-2 px-3 font-bold text-gray-950">{row.name}</td>
                              <td className="py-2 px-3 text-gray-700">{row.designation}</td>
                              <td className="py-2 px-3 text-emerald-800 font-medium">{row.department}</td>
                              <td className="py-2 px-3 font-mono text-gray-600">{row.phone}</td>
                              <td className="py-2 px-3 text-gray-500">{row.role || '—'}</td>
                            </>
                          )}
                          {type === 'students' && (
                            <>
                              <td className="py-2 px-3 text-center font-mono font-bold text-emerald-950">
                                {row.roll}
                              </td>
                              <td className="py-2 px-3 font-bold text-gray-950">{row.name}</td>
                              <td className="py-2 px-3 text-emerald-800 font-semibold">{row.studentClass}</td>
                              <td className="py-2 px-3 text-gray-700">{row.section}</td>
                              <td className="py-2 px-3 text-gray-600">{row.guardianName}</td>
                              <td className="py-2 px-3 font-mono text-gray-600">{row.phone}</td>
                              <td className="py-2 px-3 text-gray-700">{row.group || 'সাধারণ'}</td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>সমর্থিত ফরম্যাট: .xlsx, .xls, .csv, Google Drive/Sheet</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold transition cursor-pointer"
            >
              বাতিল
            </button>

            {parsedRows.length > 0 && (
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isLoading || selectedIndices.length === 0}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>সংরক্ষণ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>ডাটাবেজে যুক্ত করুন ({selectedIndices.length} জন)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
