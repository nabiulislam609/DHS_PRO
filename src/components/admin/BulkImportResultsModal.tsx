import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Info,
  Check,
  Trash2,
  BookOpen,
  Search,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { ExamResult, SubjectMark, Student } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { getStudentResultImage } from '../../utils/studentPhoto';
import { AVAILABLE_EXAM_TERMS } from './ManageExamResults';

interface BulkImportResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportResults?: (results: (Omit<ExamResult, 'id'> & { id?: string })[]) => Promise<number> | any;
}

interface ParsedResultRow {
  rawIndex: number;
  studentId: string;
  studentName: string;
  studentImage?: string;
  roll: string;
  studentClass: string;
  section: string;
  examTerm: string;
  totalMarks: number;
  gpa: number;
  grade: string;
  status: 'PUBLISHED' | 'DRAFT';
  subjects: SubjectMark[];
  isValid: boolean;
  validationError?: string;
}

// Clean and format student roll as pure string (prevent Excel number coercion / float / leading-zero stripping bugs)
export const cleanRoll = (val: any): string => {
  if (val === undefined || val === null) return '';
  let str = String(val).trim();
  // Normalize Bengali digits to English digits
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  str = str.replace(/[০-৯]/g, (d) => String(bn.indexOf(d)));
  // If Excel parsed as float like "1.0" or "01.0", strip the decimal part
  if (/^\d+\.0+$/.test(str)) {
    str = str.split('.')[0];
  }
  // Trim spaces and surrounding quotes if any
  str = str.replace(/^["']+|["']+$/g, '').trim();
  return str;
};

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

// Grade and GP calculation standard (BISE Rajshahi / National Curriculum)
export const calculateSubjectGrade = (marks: number): { gp: number; grade: string } => {
  if (marks >= 80) return { gp: 5.0, grade: 'A+' };
  if (marks >= 70) return { gp: 4.0, grade: 'A' };
  if (marks >= 60) return { gp: 3.5, grade: 'A-' };
  if (marks >= 50) return { gp: 3.0, grade: 'B' };
  if (marks >= 40) return { gp: 2.0, grade: 'C' };
  if (marks >= 33) return { gp: 1.0, grade: 'D' };
  return { gp: 0.0, grade: 'F' };
};

// Detect non-subject / metadata columns so they are never added as subjects
export const isNonSubjectColumn = (headerKey: string): boolean => {
  if (!headerKey || typeof headerKey !== 'string') return false;
  const raw = headerKey.trim();
  const lower = raw.toLowerCase();
  const clean = lower.replace(/[^a-z0-9\u0980-\u09FF]/gi, '');

  // 1. ROLL NUMBER: Any header containing 'roll' or 'রোল'
  if (
    lower.includes('roll') ||
    clean.includes('roll') ||
    lower.includes('রোল') ||
    clean.includes('রোল')
  ) {
    return true;
  }

  // 2. STUDENT / NAME
  if (
    lower.includes('name') ||
    clean.includes('name') ||
    lower.includes('student') ||
    clean.includes('student') ||
    lower.includes('নাম') ||
    clean.includes('নাম') ||
    lower.includes('শিক্ষার্থী') ||
    clean.includes('শিক্ষার্থী')
  ) {
    return true;
  }

  // 3. ID / CODE
  if (
    clean === 'id' ||
    clean.includes('studentid') ||
    clean.includes('studentcode') ||
    clean.includes('আইডি') ||
    clean.includes('কোড') ||
    clean.endsWith('id') ||
    lower.includes(' id') ||
    lower.includes('id ')
  ) {
    return true;
  }

  // 4. CLASS, SECTION, GROUP, SHIFT
  if (
    clean.includes('class') ||
    clean.includes('শ্রেণি') ||
    clean.includes('শ্রেণী') ||
    clean.includes('ক্লাস') ||
    clean.includes('section') ||
    clean.includes('শাখা') ||
    clean.includes('group') ||
    clean.includes('বিভাগ') ||
    clean.includes('shift') ||
    clean.includes('শিফট')
  ) {
    return true;
  }

  // 5. EXAM, TERM, SESSION, YEAR
  if (
    clean.includes('exam') ||
    clean.includes('term') ||
    clean.includes('পরীক্ষা') ||
    clean.includes('টার্ম') ||
    clean.includes('year') ||
    clean.includes('বছর') ||
    clean.includes('session') ||
    clean.includes('সেশন')
  ) {
    return true;
  }

  // 6. STATUS, GPA, GRADE, TOTAL, POSITION, REMARKS, CONTACT
  if (
    clean.includes('status') ||
    clean.includes('স্ট্যাটাস') ||
    clean.includes('অবস্থা') ||
    clean.includes('gpa') ||
    clean.includes('জিপিএ') ||
    clean.includes('gradepoint') ||
    clean.includes('grade') ||
    clean.includes('গ্রেড') ||
    clean.includes('point') ||
    clean.includes('পয়েন্ট') ||
    clean.includes('total') ||
    clean.includes('মোট') ||
    clean.includes('result') ||
    clean.includes('ফলাফল') ||
    clean.includes('position') ||
    clean.includes('merit') ||
    clean.includes('rank') ||
    clean.includes('মেধা') ||
    clean.includes('photo') ||
    clean.includes('image') ||
    clean.includes('ছবি') ||
    clean.includes('phone') ||
    clean.includes('mobile') ||
    clean.includes('ফোন') ||
    clean.includes('মোবাইল') ||
    clean.includes('remark') ||
    clean.includes('মন্তব্য')
  ) {
    return true;
  }

  return false;
};

export const calculateOverallGPA = (subjects: SubjectMark[]): { gpa: number; grade: string; totalMarks: number } => {
  if (!subjects || subjects.length === 0) {
    return { gpa: 0, grade: 'F', totalMarks: 0 };
  }

  const validSubjects = subjects.filter((s) => s && s.subject && !isNonSubjectColumn(s.subject));
  if (validSubjects.length === 0) {
    return { gpa: 0, grade: 'F', totalMarks: 0 };
  }

  const totalMarks = validSubjects.reduce((sum, s) => sum + (Number(s.marks) || 0), 0);
  const hasFail = validSubjects.some((s) => Number(s.marks) < 33 || s.grade === 'F' || s.gradePoint === 0);

  if (hasFail) {
    return { gpa: 0.0, grade: 'F', totalMarks };
  }

  const sumGp = validSubjects.reduce((sum, s) => sum + (Number(s.gradePoint) || 0), 0);
  const rawAvg = sumGp / validSubjects.length;
  const roundedGpa = Math.min(5.0, Math.round(rawAvg * 100) / 100);

  let grade = 'F';
  if (roundedGpa === 5.0) grade = 'A+';
  else if (roundedGpa >= 4.0) grade = 'A';
  else if (roundedGpa >= 3.5) grade = 'A-';
  else if (roundedGpa >= 3.0) grade = 'B';
  else if (roundedGpa >= 2.0) grade = 'C';
  else if (roundedGpa >= 1.0) grade = 'D';

  return { gpa: roundedGpa, grade, totalMarks };
};

// Known subject name patterns for auto-detection in Excel columns
const KNOWN_SUBJECT_PATTERNS: { regex: RegExp; standardizedName: string }[] = [
  { regex: /বাংলা\s*(১ম|১ম\s*পত্র|1st)/i, standardizedName: 'বাংলা ১ম পত্র' },
  { regex: /বাংলা\s*(২য়|২য়|২য়\s*পত্র|2nd)/i, standardizedName: 'বাংলা ২য় পত্র' },
  { regex: /^(বাংলা|bangla)$/i, standardizedName: 'বাংলা' },
  { regex: /ইংরেজি\s*(১ম|১ম\s*পত্র|1st)|english\s*(1st|paper\s*1)/i, standardizedName: 'ইংরেজি ১ম পত্র' },
  { regex: /ইংরেজি\s*(২য়|২য়|২য়\s*পত্র|2nd)|english\s*(2nd|paper\s*2)/i, standardizedName: 'ইংরেজি ২য় পত্র' },
  { regex: /^(ইংরেজি|english)$/i, standardizedName: 'ইংরেজি' },
  { regex: /(সাধারণ\s*গণিত|general\s*math)/i, standardizedName: 'সাধারণ গণিত' },
  { regex: /^(গণিত|math|mathematics)$/i, standardizedName: 'গণিত' },
  { regex: /(উচ্চতর\s*গণিত|higher\s*math)/i, standardizedName: 'উচ্চতর গণিত' },
  { regex: /(পদার্থ|পদার্থবিজ্ঞান|physics)/i, standardizedName: 'পদার্থবিজ্ঞান' },
  { regex: /(রসায়ন|রসায়ন|chemistry)/i, standardizedName: 'রসায়ন' },
  { regex: /(জীববিজ্ঞান|biology)/i, standardizedName: 'জীববিজ্ঞান' },
  { regex: /(সাধারণ\s*বিজ্ঞান|general\s*science)/i, standardizedName: 'সাধারণ বিজ্ঞান' },
  { regex: /^(বিজ্ঞান|science)$/i, standardizedName: 'বিজ্ঞান' },
  { regex: /(বাংলাদেশ\s*ও\s*বিশ্বপরিচয়|বাংলাদেশ\s*ও\s*বিশ্বপরিচয়|bgs|bangladesh\s*studies)/i, standardizedName: 'বাংলাদেশ ও বিশ্বপরিচয়' },
  { regex: /(ধর্ম|ইসলাম|নৈতিক|religion|islamic\s*studies)/i, standardizedName: 'ধর্ম ও নৈতিক শিক্ষা' },
  { regex: /(তথ্য\s*ও\s*যোগাযোগ\s*প্রযুক্তি|তথ্যপ্রযুক্তি|ict)/i, standardizedName: 'তথ্য ও যোগাযোগ প্রযুক্তি' },
  { regex: /(কৃষি|কৃষিশিক্ষা|agriculture)/i, standardizedName: 'কৃষিশিক্ষা' },
  { regex: /(গার্হস্থ্য|গার্হস্থ্য\s*বিজ্ঞান|home\s*science)/i, standardizedName: 'গার্হস্থ্য বিজ্ঞান' },
  { regex: /(হিসাববিজ্ঞান|accounting)/i, standardizedName: 'হিসাববিজ্ঞান' },
  { regex: /(ব্যবসায়\s*উদ্যোগ|ব্যবসায়\s*উদ্যোগ|business\s*studies|entrepreneurship)/i, standardizedName: 'ব্যবসায় উদ্যোগ' },
  { regex: /(ফিন্যান্স|finance)/i, standardizedName: 'ফিন্যান্স ও ব্যাংকিং' },
  { regex: /(অর্থনীতি|economics)/i, standardizedName: 'অর্থনীতি' },
  { regex: /(পৌরনীতি|civics)/i, standardizedName: 'পৌরনীতি ও নাগরিকতা' },
  { regex: /(ইতিহাস|history|বিশ্বসভ্যতা)/i, standardizedName: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা' },
  { regex: /(ভূগোল|geography)/i, standardizedName: 'ভূগোল ও পরিবেশ' },
  { regex: /(চারু\s*ও\s*কারুকলা|arts|crafts)/i, standardizedName: 'চারু ও কারুকলা' },
  { regex: /(শারীরিক\s*শিক্ষা|physical\s*education)/i, standardizedName: 'শারীরিক শিক্ষা ও স্বাস্থ্য' },
  { regex: /(কর্ম\s*ও\s*জীবনমুখী|work\s*life)/i, standardizedName: 'কর্ম ও জীবনমুখী শিক্ষা' },
];

export type TemplateCategory = 'class68' | 'science' | 'humanities' | 'commerce';

interface TemplateConfig {
  id: TemplateCategory;
  title: string;
  badge: string;
  color: string;
  description: string;
  excelFilename: string;
  csvFilename: string;
  subjectList: string[];
  data: Record<string, any>[];
}

export const TEMPLATE_CONFIGS: Record<TemplateCategory, TemplateConfig> = {
  class68: {
    id: 'class68',
    title: '৬ষ্ঠ - ৮ম শ্রেণি (সাধারণ পাঠ্যক্রম)',
    badge: 'Class 6 - 8 General',
    color: 'emerald',
    description: '৬ষ্ঠ, ৭ম ও ৮ম শ্রেণির পাঠ্যক্রম অনুযায়ী ৮টি সাধারণ বিষয়ের নমুনা ফলাফল শিট',
    excelFilename: 'Dadra_High_School_Results_Template_Class_6_to_8.xlsx',
    csvFilename: 'Dadra_High_School_Results_Template_Class_6_to_8.csv',
    subjectList: [
      'বাংলা',
      'ইংরেজি',
      'গণিত',
      'বিজ্ঞান',
      'বাংলাদেশ ও বিশ্বপরিচয়',
      'ধর্ম ও নৈতিক শিক্ষা',
      'তথ্য ও যোগাযোগ প্রযুক্তি',
      'চারু ও কারুকলা',
    ],
    data: [
      {
        'Student ID': 'DHS-2026-601',
        'Student Name (শিক্ষার্থীর নাম)': 'মোঃ রাফসান জামিল',
        'Class (শ্রেণি)': '৬ষ্ঠ শ্রেণি',
        'Roll (রোল)': '01',
        'Section (শাখা)': 'A',
        'Exam Term (পরীক্ষার নাম)': 'Annual Examination / বার্ষিক পরীক্ষা (2026)',
        'বাংলা': 82,
        'ইংরেজি': 78,
        'গণিত': 88,
        'বিজ্ঞান': 85,
        'বাংলাদেশ ও বিশ্বপরিচয়': 80,
        'ধর্ম ও নৈতিক শিক্ষা': 90,
        'তথ্য ও যোগাযোগ প্রযুক্তি': 45,
        'চারু ও কারুকলা': 46,
        'Status': 'PUBLISHED',
      },
      {
        'Student ID': 'DHS-2026-701',
        'Student Name (শিক্ষার্থীর নাম)': 'সুমাইয়া আক্তার',
        'Class (শ্রেণি)': '৭ম শ্রেণি',
        'Roll (রোল)': '02',
        'Section (শাখা)': 'A',
        'Exam Term (পরীক্ষার নাম)': 'Annual Examination / বার্ষিক পরীক্ষা (2026)',
        'বাংলা': 85,
        'ইংরেজি': 82,
        'গণিত': 92,
        'বিজ্ঞান': 88,
        'বাংলাদেশ ও বিশ্বপরিচয়': 84,
        'ধর্ম ও নৈতিক শিক্ষা': 92,
        'তথ্য ও যোগাযোগ প্রযুক্তি': 48,
        'চারু ও কারুকলা': 47,
        'Status': 'PUBLISHED',
      },
      {
        'Student ID': 'DHS-2026-801',
        'Student Name (শিক্ষার্থীর নাম)': 'ফারহান হোসেন',
        'Class (শ্রেণি)': '৮ম শ্রেণি',
        'Roll (রোল)': '03',
        'Section (শাখা)': 'B',
        'Exam Term (পরীক্ষার নাম)': 'Annual Examination / বার্ষিক পরীক্ষা (2026)',
        'বাংলা': 75,
        'ইংরেজি': 70,
        'গণিত': 80,
        'বিজ্ঞান': 76,
        'বাংলাদেশ ও বিশ্বপরিচয়': 78,
        'ধর্ম ও নৈতিক শিক্ষা': 85,
        'তথ্য ও যোগাযোগ প্রযুক্তি': 42,
        'চারু ও কারুকলা': 44,
        'Status': 'PUBLISHED',
      },
    ],
  },
  science: {
    id: 'science',
    title: '৯ম - ১০ম শ্রেণি: বিজ্ঞান বিভাগ',
    badge: 'Class 9 - 10 Science',
    color: 'teal',
    description: 'পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান, উচ্চতর গণিত সহ বিজ্ঞান বিভাগের পূর্ণাঙ্গ ১২টি বিষয়ের নমুনা শিট',
    excelFilename: 'Dadra_High_School_Results_Template_Class_9_10_Science.xlsx',
    csvFilename: 'Dadra_High_School_Results_Template_Class_9_10_Science.csv',
    subjectList: [
      'বাংলা ১ম পত্র',
      'বাংলা ২য় পত্র',
      'ইংরেজি ১ম পত্র',
      'ইংরেজি ২য় পত্র',
      'সাধারণ গণিত',
      'পদার্থবিজ্ঞান',
      'রসায়ন',
      'জীববিজ্ঞান',
      'উচ্চতর গণিত',
      'বাংলাদেশ ও বিশ্বপরিচয়',
      'ধর্ম ও নৈতিক শিক্ষা',
      'তথ্য ও যোগাযোগ প্রযুক্তি',
    ],
    data: [
      {
        'Student ID': 'DHS-2026-1001',
        'Student Name (শিক্ষার্থীর নাম)': 'মোঃ তানভীর আহমেদ',
        'Class (শ্রেণি)': '১০ম শ্রেণি (বিজ্ঞান)',
        'Roll (রোল)': '01',
        'Section (শাখা)': 'A',
        'Exam Term (পরীক্ষার নাম)': 'Annual Examination / বার্ষিক পরীক্ষা (2026)',
        'বাংলা ১ম পত্র': 85,
        'বাংলা ২য় পত্র': 82,
        'ইংরেজি ১ম পত্র': 88,
        'ইংরেজি ২য় পত্র': 90,
        'সাধারণ গণিত': 95,
        'পদার্থবিজ্ঞান': 92,
        'রসায়ন': 90,
        'জীববিজ্ঞান': 88,
        'উচ্চতর গণিত': 94,
        'বাংলাদেশ ও বিশ্বপরিচয়': 86,
        'ধর্ম ও নৈতিক শিক্ষা': 92,
        'তথ্য ও যোগাযোগ প্রযুক্তি': 46,
        'Status': 'PUBLISHED',
      },
      {
        'Student ID': 'DHS-2026-1002',
        'Student Name (শিক্ষার্থীর নাম)': 'সুমাইয়া জান্নাত',
        'Class (শ্রেণি)': '১০ম শ্রেণি (বিজ্ঞান)',
        'Roll (রোল)': '02',
        'Section (শাখা)': 'A',
        'Exam Term (পরীক্ষার নাম)': 'Annual Examination / বার্ষিক পরীক্ষা (2026)',
        'বাংলা ১ম পত্র': 78,
        'বাংলা ২য় পত্র': 80,
        'ইংরেজি ১ম পত্র': 85,
        'ইংরেজি ২য় পত্র': 82,
        'সাধারণ গণিত': 88,
        'পদার্থবিজ্ঞান': 84,
        'রসায়ন': 86,
        'জীববিজ্ঞান': 80,
        'উচ্চতর গণিত': 85,
        'বাংলাদেশ ও বিশ্বপরিচয়': 82,
        'ধর্ম ও নৈতিক শিক্ষা': 90,
        'তথ্য ও যোগাযোগ প্রযুক্তি': 48,
        'Status': 'PUBLISHED',
      },
      {
        'Student ID': 'DHS-2026-901',
        'Student Name (শিক্ষার্থীর নাম)': 'তৌহিদুল ইসলাম',
        'Class (শ্রেণি)': '৯ম শ্রেণি (বিজ্ঞান)',
        'Roll (রোল)': '03',
        'Section (শাখা)': 'A',
        'Exam Term (পরীক্ষার নাম)': 'Annual Examination / বার্ষিক পরীক্ষা (2026)',
        'বাংলা ১ম পত্র': 80,
        'বাংলা ২য় পত্র': 78,
        'ইংরেজি ১ম পত্র': 82,
        'ইংরেজি ২য় পত্র': 80,
        'সাধারণ গণিত': 90,
        'পদার্থবিজ্ঞান': 86,
        'রসায়ন': 82,
        'জীববিজ্ঞান': 84,
        'উচ্চতর গণিত': 88,
        'বাংলাদেশ ও বিশ্বপরিচয়': 80,
        'ধর্ম ও নৈতিক শিক্ষা': 88,
        'তথ্য ও যোগাযোগ প্রযুক্তি': 45,
        'Status': 'PUBLISHED',
      },
    ],
  },
  humanities: {
    id: 'humanities',
    title: '৯ম - ১০ম শ্রেণি: মানবিক বিভাগ',
    badge: 'Class 9 - 10 Humanities',
    color: 'amber',
    description: 'ইতিহাস, ভূগোল ও পরিবেশ, পৌরনীতি ও নাগরিকতা, অর্থনীতি, সাধারণ বিজ্ঞান সহ মানবিক বিভাগের নমুনা শিট',
    excelFilename: 'Dadra_High_School_Results_Template_Class_9_10_Humanities_Arts.xlsx',
    csvFilename: 'Dadra_High_School_Results_Template_Class_9_10_Humanities_Arts.csv',
    subjectList: [
      'বাংলা ১ম পত্র',
      'বাংলা ২য় পত্র',
      'ইংরেজি ১ম পত্র',
      'ইংরেজি ২য় পত্র',
      'সাধারণ গণিত',
      'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা',
      'ভূগোল ও পরিবেশ',
      'পৌরনীতি ও নাগরিকতা',
      'অর্থনীতি',
      'সাধারণ বিজ্ঞান',
      'ধর্ম ও নৈতিক শিক্ষা',
      'তথ্য ও যোগাযোগ প্রযুক্তি',
    ],
    data: [
      {
        'Student ID': 'DHS-2026-1051',
        'Student Name (শিক্ষার্থীর নাম)': 'মোছাঃ ফারজানা আক্তার',
        'Class (শ্রেণি)': '১০ম শ্রেণি (মানবিক)',
        'Roll (রোল)': '01',
        'Section (শাখা)': 'B',
        'Exam Term (পরীক্ষার নাম)': 'Annual Examination / বার্ষিক পরীক্ষা (2026)',
        'বাংলা ১ম পত্র': 82,
        'বাংলা ২য় পত্র': 80,
        'ইংরেজি ১ম পত্র': 76,
        'ইংরেজি ২য় পত্র': 74,
        'সাধারণ গণিত': 78,
        'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা': 86,
        'ভূগোল ও পরিবেশ': 84,
        'পৌরনীতি ও নাগরিকতা': 88,
        'অর্থনীতি': 82,
        'সাধারণ বিজ্ঞান': 80,
        'ধর্ম ও নৈতিক শিক্ষা': 90,
        'তথ্য ও যোগাযোগ প্রযুক্তি': 45,
        'Status': 'PUBLISHED',
      },
      {
        'Student ID': 'DHS-2026-1052',
        'Student Name (শিক্ষার্থীর নাম)': 'মেহেদী হাসান',
        'Class (শ্রেণি)': '১০ম শ্রেণি (মানবিক)',
        'Roll (রোল)': '02',
        'Section (শাখা)': 'B',
        'Exam Term (পরীক্ষার নাম)': 'Annual Examination / বার্ষিক পরীক্ষা (2026)',
        'বাংলা ১ম পত্র': 76,
        'বাংলা ২য় পত্র': 75,
        'ইংরেজি ১ম পত্র': 70,
        'ইংরেজি ২য় পত্র': 68,
        'সাধারণ গণিত': 72,
        'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা': 80,
        'ভূগোল ও পরিবেশ': 78,
        'পৌরনীতি ও নাগরিকতা': 82,
        'অর্থনীতি': 76,
        'সাধারণ বিজ্ঞান': 75,
        'ধর্ম ও নৈতিক শিক্ষা': 85,
        'তথ্য ও যোগাযোগ প্রযুক্তি': 42,
        'Status': 'PUBLISHED',
      },
      {
        'Student ID': 'DHS-2026-951',
        'Student Name (শিক্ষার্থীর নাম)': 'নাজমুল হক',
        'Class (শ্রেণি)': '৯ম শ্রেণি (মানবিক)',
        'Roll (রোল)': '03',
        'Section (শাখা)': 'B',
        'Exam Term (পরীক্ষার নাম)': 'Annual Examination / বার্ষিক পরীক্ষা (2026)',
        'বাংলা ১ম পত্র': 80,
        'বাংলা ২য় পত্র': 78,
        'ইংরেজি ১ম পত্র': 74,
        'ইংরেজি ২য় পত্র': 72,
        'সাধারণ গণিত': 75,
        'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা': 82,
        'ভূগোল ও পরিবেশ': 80,
        'পৌরনীতি ও নাগরিকতা': 85,
        'অর্থনীতি': 78,
        'সাধারণ বিজ্ঞান': 78,
        'ধর্ম ও নৈতিক শিক্ষা': 88,
        'তথ্য ও যোগাযোগ প্রযুক্তি': 44,
        'Status': 'PUBLISHED',
      },
    ],
  },
  commerce: {
    id: 'commerce',
    title: '৯ম - ১০ম শ্রেণি: ব্যবসায় শিক্ষা বিভাগ',
    badge: 'Class 9 - 10 Commerce',
    color: 'blue',
    description: 'হিসাববিজ্ঞান, ব্যবসায় উদ্যোগ, ফিন্যান্স ও ব্যাংকিং, সাধারণ বিজ্ঞান সহ বাণিজ্য বিভাগের পূর্ণাঙ্গ নমুনা শিট',
    excelFilename: 'Dadra_High_School_Results_Template_Class_9_10_Business_Commerce.xlsx',
    csvFilename: 'Dadra_High_School_Results_Template_Class_9_10_Business_Commerce.csv',
    subjectList: [
      'বাংলা ১ম পত্র',
      'বাংলা ২য় পত্র',
      'ইংরেজি ১ম পত্র',
      'ইংরেজি ২য় পত্র',
      'সাধারণ গণিত',
      'হিসাববিজ্ঞান',
      'ব্যবসায় উদ্যোগ',
      'ফিন্যান্স ও ব্যাংকিং',
      'সাধারণ বিজ্ঞান',
      'বাংলাদেশ ও বিশ্বপরিচয়',
      'ধর্ম ও নৈতিক শিক্ষা',
      'তথ্য ও যোগাযোগ প্রযুক্তি',
    ],
    data: [
      {
        'Student ID': 'DHS-2026-1081',
        'Student Name (শিক্ষার্থীর নাম)': 'আব্দুল্লাহ আল নোমান',
        'Class (শ্রেণি)': '১০ম শ্রেণি (ব্যবসায় শিক্ষা)',
        'Roll (রোল)': '01',
        'Section (শাখা)': 'C',
        'Exam Term (পরীক্ষার নাম)': 'Annual Examination / বার্ষিক পরীক্ষা (2026)',
        'বাংলা ১ম পত্র': 80,
        'বাংলা ২য় পত্র': 78,
        'ইংরেজি ১ম পত্র': 75,
        'ইংরেজি ২য় পত্র': 72,
        'সাধারণ গণিত': 84,
        'হিসাববিজ্ঞান': 92,
        'ব্যবসায় উদ্যোগ': 88,
        'ফিন্যান্স ও ব্যাংকিং': 86,
        'সাধারণ বিজ্ঞান': 82,
        'বাংলাদেশ ও বিশ্বপরিচয়': 80,
        'ধর্ম ও নৈতিক শিক্ষা': 88,
        'তথ্য ও যোগাযোগ প্রযুক্তি': 46,
        'Status': 'PUBLISHED',
      },
      {
        'Student ID': 'DHS-2026-1082',
        'Student Name (শিক্ষার্থীর নাম)': 'সাদিয়া আফরিন',
        'Class (শ্রেণি)': '১০ম শ্রেণি (ব্যবসায় শিক্ষা)',
        'Roll (রোল)': '02',
        'Section (শাখা)': 'C',
        'Exam Term (পরীক্ষার নাম)': 'Annual Examination / বার্ষিক পরীক্ষা (2026)',
        'বাংলা ১ম পত্র': 82,
        'বাংলা ২য় পত্র': 80,
        'ইংরেজি ১ম পত্র': 78,
        'ইংরেজি ২য় পত্র': 76,
        'সাধারণ গণিত': 80,
        'হিসাববিজ্ঞান': 88,
        'ব্যবসায় উদ্যোগ': 85,
        'ফিন্যান্স ও ব্যাংকিং': 82,
        'সাধারণ বিজ্ঞান': 80,
        'বাংলাদেশ ও বিশ্বপরিচয়': 82,
        'ধর্ম ও নৈতিক শিক্ষা': 90,
        'তথ্য ও যোগাযোগ প্রযুক্তি': 47,
        'Status': 'PUBLISHED',
      },
      {
        'Student ID': 'DHS-2026-981',
        'Student Name (শিক্ষার্থীর নাম)': 'সাকিব আল হাসান',
        'Class (শ্রেণি)': '৯ম শ্রেণি (ব্যবসায় শিক্ষা)',
        'Roll (রোল)': '03',
        'Section (শাখা)': 'C',
        'Exam Term (পরীক্ষার নাম)': 'Annual Examination / বার্ষিক পরীক্ষা (2026)',
        'বাংলা ১ম পত্র': 75,
        'বাংলা ২য় পত্র': 72,
        'ইংরেজি ১ম পত্র': 70,
        'ইংরেজি ২য় পত্র': 68,
        'সাধারণ গণিত': 78,
        'হিসাববিজ্ঞান': 85,
        'ব্যবসায় উদ্যোগ': 82,
        'ফিন্যান্স ও ব্যাংকিং': 80,
        'সাধারণ বিজ্ঞান': 78,
        'বাংলাদেশ ও বিশ্বপরিচয়': 76,
        'ধর্ম ও নৈতিক শিক্ষা': 85,
        'তথ্য ও যোগাযোগ প্রযুক্তি': 44,
        'Status': 'PUBLISHED',
      },
    ],
  },
};

export const BulkImportResultsModal: React.FC<BulkImportResultsModalProps> = ({
  isOpen,
  onClose,
  onImportResults,
}) => {
  const { students } = useSchool();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [selectedTemplateTab, setSelectedTemplateTab] = useState<TemplateCategory>('science');
  const [pasteContent, setPasteContent] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedResultRow[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [defaultExamTerm, setDefaultExamTerm] = useState<string>(AVAILABLE_EXAM_TERMS[0] || 'Annual Examination / বার্ষিক পরীক্ষা (2026)');
  const [defaultStatus, setDefaultStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');
  const [viewingDetailRow, setViewingDetailRow] = useState<ParsedResultRow | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Flexible column finder
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
      setErrorMessage('ফাইলে কোনো ফলাফল পাওয়া যায়নি। অনুগ্রহ করে সঠিক ফরম্যাটের ফাইল ব্যবহার করুন।');
      setParsedRows([]);
      setSelectedIndices([]);
      return;
    }

    const processed: ParsedResultRow[] = [];

    rawRows.forEach((r, idx) => {
      // Ignore completely empty rows
      const hasAnyValue = Object.values(r).some((v) => v !== undefined && v !== null && String(v).trim() !== '');
      if (!hasAnyValue) return;

      // Extract roll cleanly as string (prevents numeric conversion / float / counting errors)
      const roll = cleanRoll(getVal(r, ['রোল', 'রোল নম্বর', 'roll', 'roll_no', 'roll_number', 'class_roll']));
      let name = getVal(r, ['শিক্ষার্থীর নাম', 'নাম', 'student_name', 'name', 'student']);
      let studentId = getVal(r, ['শিক্ষার্থী আইডি', 'আইডি', 'student_id', 'id', 'student_code']);
      let studentClass = getVal(r, ['শ্রেণি', 'শ্রেণী', 'ক্লাস', 'class', 'student_class', 'grade_level']);
      let section = getVal(r, ['শাখা', 'সেকশন', 'section', 'sec']) || 'A';
      let examTerm = getVal(r, ['পরীক্ষা', 'পরীক্ষার নাম', 'টার্ম', 'exam', 'exam_term', 'term']) || defaultExamTerm;
      const statusRaw = getVal(r, ['স্ট্যাটাস', 'অবস্থা', 'status'])?.toUpperCase();
      const status: 'PUBLISHED' | 'DRAFT' = statusRaw === 'DRAFT' || statusRaw === 'খসড়া' ? 'DRAFT' : 'PUBLISHED';

      // Match with existing student in database by Roll and Class (comparing string and numeric equality)
      const matchedStudent = students.find((s) => {
        const sRollClean = cleanRoll(s.roll);
        const inputRollClean = cleanRoll(roll);
        if (!inputRollClean) return false;

        const isRollMatch =
          sRollClean === inputRollClean ||
          (!isNaN(parseInt(sRollClean, 10)) &&
            !isNaN(parseInt(inputRollClean, 10)) &&
            parseInt(sRollClean, 10) === parseInt(inputRollClean, 10));

        if (isRollMatch) {
          if (!studentClass) return true;
          const sClassNorm = normalizeNum(s.class || s.studentClass || '');
          const rowClassNorm = normalizeNum(studentClass);
          return sClassNorm.includes(rowClassNorm) || rowClassNorm.includes(sClassNorm);
        }
        return false;
      });

      if (matchedStudent) {
        if (!name) name = matchedStudent.name;
        if (!studentId) studentId = matchedStudent.id;
        if (!studentClass) studentClass = matchedStudent.class || matchedStudent.studentClass || '১০ম শ্রেণি';
        if (!section && matchedStudent.section) section = matchedStudent.section;
      }

      if (!studentClass) {
        studentClass = '১০ম শ্রেণি (বিজ্ঞান)';
      }

      if (!studentId && roll) {
        studentId = `DHS-2026-${roll}`;
      }

      // Extract subject marks
      const detectedSubjects: SubjectMark[] = [];
      const rowKeys = Object.keys(r);

      // Check each column to see if it represents a subject
      rowKeys.forEach((key) => {
        // Strictly skip any metadata column (Roll, Name, Class, Section, ID, Exam, Status, GPA, etc.)
        if (isNonSubjectColumn(key)) {
          return;
        }

        const rawVal = r[key];
        if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') return;
        const markVal = Number(normalizeNum(rawVal));

        if (!isNaN(markVal) && markVal >= 0 && markVal <= 100) {
          // Find standard subject name
          let standardName = key.trim();
          for (const pattern of KNOWN_SUBJECT_PATTERNS) {
            if (pattern.regex.test(key)) {
              standardName = pattern.standardizedName;
              break;
            }
          }

          // Double check standardName is not a metadata column or roll variant
          if (isNonSubjectColumn(standardName)) {
            return;
          }

          const { gp, grade } = calculateSubjectGrade(markVal);
          detectedSubjects.push({
            subject: standardName,
            marks: markVal,
            gradePoint: gp,
            grade,
          });
        }
      });

      // Compute or read GPA and Total Marks
      let calculatedTotal = 0;
      let calculatedGpa = 0;
      let calculatedGrade = 'F';

      if (detectedSubjects.length > 0) {
        const computed = calculateOverallGPA(detectedSubjects);
        calculatedTotal = computed.totalMarks;
        calculatedGpa = computed.gpa;
        calculatedGrade = computed.grade;
      } else {
        // Read directly from Total Marks, GPA, Grade columns if provided
        const explicitTotal = Number(normalizeNum(getVal(r, ['মোট নম্বর', 'মোট', 'total_marks', 'total']))) || 0;
        const explicitGpa = Number(normalizeNum(getVal(r, ['জিপিএ', 'gpa', 'point']))) || 0;
        const explicitGrade = getVal(r, ['গ্রেড', 'grade', 'overall_grade']) || 'A+';

        calculatedTotal = explicitTotal;
        calculatedGpa = explicitGpa;
        calculatedGrade = explicitGrade;
      }

      // Check validity
      const isValid = Boolean(name && roll);
      const validationError = !name
        ? 'শিক্ষার্থীর নাম পাওয়া যায়নি'
        : !roll
        ? 'রোল নম্বর নেই'
        : undefined;

      const studentImage =
        matchedStudent?.image ||
        getStudentResultImage({ studentName: name, roll, studentId }, students) ||
        undefined;

      processed.push({
        rawIndex: idx,
        studentId: studentId || `DHS-2026-${roll || idx + 1}`,
        studentName: name || 'অজ্ঞাত শিক্ষার্থী',
        studentImage,
        roll: roll || `${idx + 1}`,
        studentClass,
        section,
        examTerm,
        totalMarks: calculatedTotal,
        gpa: calculatedGpa,
        grade: calculatedGrade,
        status,
        subjects: detectedSubjects,
        isValid,
        validationError,
      });
    });

    if (processed.length === 0) {
      setErrorMessage('কোনো বৈধ শিক্ষার্থীর পরীক্ষার তথ্য পাওয়া যায়নি। ফাইলের কলামগুলো যাচাই করুন।');
      return;
    }

    setParsedRows(processed);
    // Auto-select all valid rows
    setSelectedIndices(
      processed.map((r, i) => (r.isValid ? i : -1)).filter((i) => i !== -1)
    );
  };

  // 1. Handle File Upload (raw: false preserves formatted text, preventing roll numbers from losing leading zeros or becoming floats)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', raw: false, cellText: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
        processRawRows(rawJson);
      } catch (err: any) {
        console.error('File parse error:', err);
        setErrorMessage('ফাইলটি পড়া সম্ভব হয়নি। দয়া করে সঠিক Excel (.xlsx, .xls) অথবা CSV ফাইল আপলোড করুন।');
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      setErrorMessage('ফাইল রিড করতে সমস্যা হয়েছে।');
      setIsLoading(false);
    };

    reader.readAsBinaryString(file);
  };

  // 2. Handle Paste Content
  const handlePasteProcess = () => {
    if (!pasteContent.trim()) {
      setErrorMessage('অনুগ্রহ করে এক্সেল বা গুগল শিট থেকে কপি করা ডাটা পেস্ট করুন।');
      return;
    }

    setIsLoading(true);
    try {
      const workbook = XLSX.read(pasteContent, { type: 'string', raw: false });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
      processRawRows(rawJson);
    } catch (err: any) {
      console.error('Paste parse error:', err);
      setErrorMessage('পেস্ট করা ডাটা পার্স করা সম্ভব হয়নি। অনুগ্রহ করে টেবিলের কলাম সহ কপি করে পেস্ট করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  // Download specific template as XLSX
  const handleDownloadExcelTemplate = (templateKey: TemplateCategory) => {
    try {
      const config = TEMPLATE_CONFIGS[templateKey];
      const ws = XLSX.utils.json_to_sheet(config.data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Results_Template');
      XLSX.writeFile(wb, config.excelFilename);
    } catch (err) {
      console.error('Download excel template error:', err);
    }
  };

  // Download specific template as CSV
  const handleDownloadCsvTemplate = (templateKey: TemplateCategory) => {
    try {
      const config = TEMPLATE_CONFIGS[templateKey];
      const ws = XLSX.utils.json_to_sheet(config.data);
      const csvOutput = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = config.csvFilename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download csv template error:', err);
    }
  };

  // Toggle selection
  const toggleSelectRow = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIndices.length === parsedRows.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(parsedRows.map((_, i) => i));
    }
  };

  // Delete row
  const handleDeleteRow = (index: number) => {
    setParsedRows((prev) => prev.filter((_, i) => i !== index));
    setSelectedIndices((prev) =>
      prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i))
    );
  };

  // Batch update Exam Term for selected rows
  const handleApplyExamTermToAll = (newTerm: string) => {
    setParsedRows((prev) =>
      prev.map((r, i) => (selectedIndices.includes(i) ? { ...r, examTerm: newTerm } : r))
    );
  };

  // Batch update Status for selected rows
  const handleApplyStatusToAll = (newStatus: 'PUBLISHED' | 'DRAFT') => {
    setParsedRows((prev) =>
      prev.map((r, i) => (selectedIndices.includes(i) ? { ...r, status: newStatus } : r))
    );
  };

  // Submit and save to database
  const handleConfirmImport = async () => {
    const selectedRows = parsedRows.filter((_, idx) => selectedIndices.includes(idx));
    if (selectedRows.length === 0) {
      setErrorMessage('কমপক্ষে একটি ফলাফল রেকর্ড নির্বাচন করুন।');
      return;
    }

    const invalidSelected = selectedRows.filter((r) => !r.isValid);
    if (invalidSelected.length > 0) {
      setErrorMessage(`নির্বাচিত রেকর্ডের মধ্যে ${invalidSelected.length}টি অসম্পূর্ণ তথ্য (নাম বা রোল অনুপস্থিত) রয়েছে। সেগুলো সংশোধন বা আনচেক করুন।`);
      return;
    }

    setIsLoading(true);

    try {
      if (onImportResults) {
        const payload: (Omit<ExamResult, 'id'> & { id?: string })[] = selectedRows.map((r) => ({
          id: r.studentId,
          studentId: cleanStr(r.studentId) || `DHS-2026-${cleanRoll(r.roll)}`,
          studentName: cleanStr(r.studentName),
          studentImage: r.studentImage || undefined,
          roll: cleanRoll(r.roll), // Stored as pure string, preserving exact formatting
          studentClass: cleanStr(r.studentClass),
          section: cleanStr(r.section) || 'A',
          examTerm: cleanStr(r.examTerm) || defaultExamTerm,
          totalMarks: Number(r.totalMarks) || 0,
          gpa: Number(r.gpa) || 0,
          grade: cleanStr(r.grade) || 'F',
          status: r.status,
          subjects: r.subjects || [],
          publishedDate: new Date().toISOString().split('T')[0],
        }));

        await onImportResults(payload);
      }

      setSuccessToast(`${selectedRows.length} জন শিক্ষার্থীর পরীক্ষার ফলাফল সফলভাবে সংরক্ষিত হয়েছে!`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Import error:', err);
      setErrorMessage(err?.message || 'ফলাফল আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered rows for table view (plain calculation, no hook dependency)
  const filteredRows = searchFilter.trim()
    ? parsedRows.filter((r) => {
        const q = searchFilter.toLowerCase().trim();
        return (
          r.studentName.toLowerCase().includes(q) ||
          r.roll.toLowerCase().includes(q) ||
          r.studentClass.toLowerCase().includes(q) ||
          r.studentId.toLowerCase().includes(q) ||
          r.examTerm.toLowerCase().includes(q)
        );
      })
    : parsedRows;

  if (!isOpen) return null;

  const currentTemplate = TEMPLATE_CONFIGS[selectedTemplateTab];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs border border-white/20">
              <FileSpreadsheet className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  বাল্ক পরীক্ষার ফলাফল আপলোড (Bulk Import Results)
                </h2>
                <span className="bg-emerald-500/30 text-emerald-100 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-400/30">
                  Excel / CSV
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                এক্সেলে তৈরি করা শত শত শিক্ষার্থীর বিষয়ভিত্তিক নম্বর ও রেজাল্ট নিমেষেই ওয়েবসাইটে আপলোড করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg text-emerald-100 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {successToast && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center gap-2.5 text-emerald-800 text-sm font-semibold animate-pulse">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Top Instructions & 4 Category-Specific Template Downloads */}
          <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-blue-50/50 border-2 border-emerald-300/80 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-emerald-200 pb-3">
              <div>
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm sm:text-base">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>শ্রেণি ও বিভাগ অনুযায়ী নমুনা টেমপ্লেট ডাউনলোড করুন</span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                  ৬ষ্ঠ-৮ম শ্রেণি এবং ৯ম-১০ম শ্রেণির বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা বিভাগের জন্য আলাদা ৪টি নমুনা ফাইল তৈরি করা আছে।
                </p>
              </div>

              <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-300 self-start md:self-auto shrink-0">
                ✓ রোল নম্বর টেক্সট স্ট্রিং আকারে সংরক্ষিত হবে
              </div>
            </div>

            {/* 4 Category Switcher Tabs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {(
                [
                  { key: 'class68', label: '৬ষ্ঠ - ৮ম শ্রেণি', sub: 'সাধারণ পাঠ্যক্রম (৮ বিষয়)' },
                  { key: 'science', label: '৯ম - ১০ম শ্রেণি', sub: 'বিজ্ঞান বিভাগ (১২ বিষয়)' },
                  { key: 'humanities', label: '৯ম - ১০ম শ্রেণি', sub: 'মানবিক বিভাগ (১২ বিষয়)' },
                  { key: 'commerce', label: '৯ম - ১০ম শ্রেণি', sub: 'ব্যবসায় শিক্ষা (১২ বিষয়)' },
                ] as const
              ).map((tab) => {
                const isSelected = selectedTemplateTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSelectedTemplateTab(tab.key)}
                    className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs font-bold'
                        : 'bg-white hover:bg-emerald-50 text-gray-800 border-emerald-200/80'
                    }`}
                  >
                    <span className="text-xs font-bold block">{tab.label}</span>
                    <span
                      className={`text-[10px] block mt-0.5 ${
                        isSelected ? 'text-emerald-100' : 'text-gray-500'
                      }`}
                    >
                      {tab.sub}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Template Details Card & Download Buttons */}
            <div className="bg-white rounded-xl p-4 border border-emerald-200/90 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 text-xs sm:text-sm">
                      {currentTemplate.title}
                    </h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                      {currentTemplate.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {currentTemplate.description}
                  </p>
                </div>

                {/* Direct Action Buttons for this template */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownloadExcelTemplate(selectedTemplateTab)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
                    title={`ডাউনলোড করুন ${currentTemplate.excelFilename}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>নমুনা Excel (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadCsvTemplate(selectedTemplateTab)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
                    title={`ডাউনলোড করুন ${currentTemplate.csvFilename}`}
                  >
                    <Download className="w-3.5 h-3.5 text-gray-500" />
                    <span>নমুনা CSV (.csv)</span>
                  </button>
                </div>
              </div>

              {/* Subject Badges in this template */}
              <div className="pt-2 border-t border-gray-100 space-y-1.5">
                <span className="text-[10.5px] font-bold text-gray-600 block">
                  টেমপ্লেটে অন্তর্ভুক্ত বিষয়সমূহ ({currentTemplate.subjectList.length} টি):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentTemplate.subjectList.map((sub, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-block px-2 py-0.5 bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 rounded-md text-[10.5px] font-medium border border-gray-200"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Input Method Switcher */}
          <div className="space-y-4">
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
                  activeTab === 'upload'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>ফাইল আপলোড (Excel / CSV File)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
                  activeTab === 'paste'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Copy className="w-4 h-4" />
                <span>সরাসরি পেস্ট (Copy & Paste Data)</span>
              </button>
            </div>

            {/* Tab 1: File Upload */}
            {activeTab === 'upload' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-xl p-8 text-center cursor-pointer transition group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition duration-200">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-gray-800">
                  কম্পিউটার থেকে ফলাফল ফাইল ড্র্যাগ করুন অথবা ক্লিক করে ব্রাউজ করুন
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  সমর্থিত ফরম্যাট: .xlsx, .xls, .csv (রোল নম্বর স্ট্রিং আকারে অক্ষুণ্ণ থাকবে, যেমন: 01, 02)
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-semibold border border-emerald-200">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>ফাইল নির্বাচন করুন</span>
                </div>
              </div>
            )}

            {/* Tab 2: Copy Paste */}
            {activeTab === 'paste' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-600">
                  এক্সেল বা গুগল শিট থেকে হেডার কলাম সহ টেবিলের সব সেল সিলেক্ট করে কপি (Ctrl+C) করুন এবং নিচের বক্সে পেস্ট (Ctrl+V) করে প্রসেস বাটনে ক্লিক করুন:
                </p>
                <textarea
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder={`Student ID\tStudent Name\tClass\tRoll\tSection\tবাংলা ১ম পত্র\tবাংলা ২য় পত্র\tইংরেজি ১ম পত্র\tইংরেজি ২য় পত্র\tসাধারণ গণিত
DHS-101\tতানভীর আহমেদ\t১০ম শ্রেণি (বিজ্ঞান)\t01\tA\t85\t82\t88\t90\t95
DHS-102\tসুমাইয়া জান্নাত\t১০ম শ্রেণি (বিজ্ঞান)\t02\tA\t78\t80\t85\t82\t88`}
                  rows={6}
                  className="w-full p-3 font-mono text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-gray-50"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handlePasteProcess}
                    disabled={isLoading || !pasteContent.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>ডাটা প্রসেস ও যাচাই করুন</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Parsed Rows Preview Table Section */}
          {parsedRows.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-gray-900">
                    ফলাফল যাচাই ও প্রিভিউ ({parsedRows.length} টি রেকর্ড পাওয়া গেছে, {selectedIndices.length} টি নির্বাচিত)
                  </h3>
                </div>

                {/* Search in preview */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="রোল, নাম বা ক্লাসে খুঁজুন..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Batch Action Toolbar */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIndices.length === parsedRows.length && parsedRows.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>সবগুলো নির্বাচন ({selectedIndices.length}/{parsedRows.length})</span>
                  </label>

                  <div className="h-4 w-px bg-gray-300 hidden sm:block" />

                  {/* Batch Exam Term Assignment */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500">নির্বাচিত সবার পরীক্ষা:</span>
                    <select
                      value={defaultExamTerm}
                      onChange={(e) => {
                        setDefaultExamTerm(e.target.value);
                        handleApplyExamTermToAll(e.target.value);
                      }}
                      className="text-xs border border-gray-300 rounded-md bg-white px-2 py-1 outline-hidden font-medium text-gray-800"
                    >
                      {AVAILABLE_EXAM_TERMS.map((term) => (
                        <option key={term} value={term}>
                          {term}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Batch Status Assignment */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500">অবস্থা:</span>
                    <select
                      value={defaultStatus}
                      onChange={(e) => {
                        const next = e.target.value as 'PUBLISHED' | 'DRAFT';
                        setDefaultStatus(next);
                        handleApplyStatusToAll(next);
                      }}
                      className="text-xs border border-gray-300 rounded-md bg-white px-2 py-1 outline-hidden font-medium text-gray-800"
                    >
                      <option value="PUBLISHED">PUBLISHED (প্রকাশিত)</option>
                      <option value="DRAFT">DRAFT (খসড়া)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setParsedRows([]);
                    setSelectedIndices([]);
                  }}
                  className="text-xs text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                >
                  তালিকা পরিষ্কার করুন
                </button>
              </div>

              {/* Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs text-gray-600 border-collapse">
                    <thead className="bg-gray-100/90 text-gray-700 font-bold sticky top-0 border-b border-gray-200 z-10 backdrop-blur-xs">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIndices.length === parsedRows.length && parsedRows.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </th>
                        <th className="p-3">রোল</th>
                        <th className="p-3">শিক্ষার্থীর নাম ও আইডি</th>
                        <th className="p-3">শ্রেণি ও শাখা</th>
                        <th className="p-3">পরীক্ষার নাম</th>
                        <th className="p-3 text-center">বিষয়সমূহ</th>
                        <th className="p-3 text-center">মোট নম্বর</th>
                        <th className="p-3 text-center">GPA ও গ্রেড</th>
                        <th className="p-3 text-center">স্ট্যাটাস</th>
                        <th className="p-3 text-right">মুছুন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {filteredRows.map((row, idx) => {
                        const originalIndex = parsedRows.indexOf(row);
                        const isSelected = selectedIndices.includes(originalIndex);

                        return (
                          <tr
                            key={idx}
                            className={`hover:bg-emerald-50/40 transition ${
                              !row.isValid ? 'bg-red-50/40' : isSelected ? 'bg-emerald-50/20' : ''
                            }`}
                          >
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectRow(originalIndex)}
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                              />
                            </td>
                            <td className="p-3 font-bold text-gray-900">
                              <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-gray-800 font-mono">
                                #{row.roll}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {row.studentImage ? (
                                  <img
                                    src={row.studentImage}
                                    alt={row.studentName}
                                    className="w-7 h-7 rounded-full object-cover border border-emerald-300 shrink-0"
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                                    {row.studentName.charAt(0) || 'S'}
                                  </div>
                                )}
                                <div>
                                  <div className="font-semibold text-gray-900">{row.studentName}</div>
                                  <div className="text-[10px] text-gray-400 font-mono">{row.studentId}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="text-gray-900 font-medium">{row.studentClass}</div>
                              <div className="text-[10px] text-gray-500">শাখা: {row.section}</div>
                            </td>
                            <td className="p-3 max-w-[160px] truncate" title={row.examTerm}>
                              <span className="text-gray-700">{row.examTerm}</span>
                            </td>
                            <td className="p-3 text-center">
                              {row.subjects && row.subjects.length > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => setViewingDetailRow(row)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-md font-semibold text-[11px] border border-teal-200 cursor-pointer"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  <span>{row.subjects.length} টি বিষয়</span>
                                </button>
                              ) : (
                                <span className="text-gray-400 text-[11px]">কোনো বিষয় নেই</span>
                              )}
                            </td>
                            <td className="p-3 text-center font-bold text-gray-900 font-mono">
                              {row.totalMarks}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                  row.grade === 'A+'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : row.grade === 'A'
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : row.grade === 'A-'
                                    ? 'bg-teal-100 text-teal-800 border border-teal-200'
                                    : row.grade === 'B' || row.grade === 'C' || row.grade === 'D'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-red-100 text-red-800 border border-red-200'
                                }`}
                              >
                                <span>{row.grade}</span>
                                <span className="text-[9px] opacity-75 font-mono">({row.gpa.toFixed(2)})</span>
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  row.status === 'PUBLISHED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(originalIndex)}
                                className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded transition cursor-pointer"
                                title="রেকর্ডটি বাদ দিন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              নির্বাচিত ফলাফলগুলো স্বয়ংক্রিয়ভাবে পাবলিক রেজাল্ট সার্চ পেজ ও এডমিন প্যানেলে লাইভ হয়ে যাবে।
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={isLoading || selectedIndices.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>ফলাফল আপলোড সম্পন্ন করুন ({selectedIndices.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Individual Subject Mark Details Popover Modal */}
        {viewingDetailRow && (
          <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-5 space-y-4 border border-gray-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{viewingDetailRow.studentName}</h4>
                    <p className="text-xs text-gray-500">
                      রোল: {viewingDetailRow.roll} | শ্রেণি: {viewingDetailRow.studentClass}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingDetailRow(null)}
                  className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                <div className="grid grid-cols-12 text-xs font-bold text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <div className="col-span-6">বিষয়</div>
                  <div className="col-span-2 text-center">নম্বর</div>
                  <div className="col-span-2 text-center">GP</div>
                  <div className="col-span-2 text-center">গ্রেড</div>
                </div>

                {viewingDetailRow.subjects
                  .filter((s) => !isNonSubjectColumn(s.subject))
                  .map((s, sIdx) => (
                  <div
                    key={sIdx}
                    className="grid grid-cols-12 text-xs p-2 rounded-lg border border-gray-100 hover:bg-gray-50/50 items-center"
                  >
                    <div className="col-span-6 font-medium text-gray-800">{s.subject}</div>
                    <div className="col-span-2 text-center font-bold text-gray-900 font-mono">{s.marks}</div>
                    <div className="col-span-2 text-center text-gray-600 font-mono">{s.gradePoint.toFixed(1)}</div>
                    <div className="col-span-2 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded font-bold text-[10px] ${
                          s.grade === 'A+'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.grade === 'A' || s.grade === 'A-'
                            ? 'bg-green-100 text-green-800'
                            : s.grade === 'F'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {s.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-50 rounded-lg p-3 flex items-center justify-between text-xs font-bold text-emerald-950 border border-emerald-200">
                <span>মোট প্রাপ্ত নম্বর: {viewingDetailRow.totalMarks}</span>
                <span>
                  সর্বমোট GPA: {viewingDetailRow.gpa.toFixed(2)} ({viewingDetailRow.grade})
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setViewingDetailRow(null)}
                  className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
