/**
 * Official NCTB Curriculum Subjects definition
 * Specific to Class 6-8 (General) and Class 9-10 (Science, Humanities, Commerce)
 */

export const CLASS_OPTIONS = [
  '৬ষ্ঠ শ্রেণি',
  '৭ম শ্রেণি',
  '৮ম শ্রেণি',
  '৯ম শ্রেণি',
  '১০ম শ্রেণি',
] as const;

export const GROUP_OPTIONS = [
  'বিজ্ঞান',
  'মানবিক',
  'ব্যবসায় শিক্ষা',
] as const;

export type ClassType = typeof CLASS_OPTIONS[number] | string;
export type GroupType = typeof GROUP_OPTIONS[number] | string;

// ৯ ও ১০ম শ্রেণির বিজ্ঞান বিভাগ (Science)
export const SCIENCE_SUBJECTS_CLASS_9_10: string[] = [
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
  'উচ্চতর গণিত',
];

// বিজ্ঞান বিভাগের ঐচ্ছিক/৪র্থ বিষয়সমূহ
export const SCIENCE_ELECTIVE_CHOICES: string[] = [
  'উচ্চতর গণিত',
  'কৃষিশিক্ষা',
  'গার্হস্থ্য বিজ্ঞান',
];

// ৯ ও ১০ম শ্রেণির মানবিক বিভাগ (Humanities / Arts)
export const HUMANITIES_SUBJECTS_CLASS_9_10: string[] = [
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
  'অর্থনীতি',
];

// মানবিক বিভাগের ঐচ্ছিক/৪র্থ বিষয়সমূহ
export const HUMANITIES_ELECTIVE_CHOICES: string[] = [
  'অর্থনীতি',
  'কৃষিশিক্ষা',
  'গার্হস্থ্য বিজ্ঞান',
];

// ৯ ও ১০ম শ্রেণির ব্যবসায় শিক্ষা বিভাগ (Commerce)
export const COMMERCE_SUBJECTS_CLASS_9_10: string[] = [
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
  'অর্থনীতি',
];

// ব্যবসায় শিক্ষা বিভাগের ঐচ্ছিক/৪র্থ বিষয়সমূহ
export const COMMERCE_ELECTIVE_CHOICES: string[] = [
  'অর্থনীতি',
  'কৃষিশিক্ষা',
  'গার্হস্থ্য বিজ্ঞান',
];

// ৬ষ্ঠ, ৭ম ও ৮ম শ্রেণির সাধারণ বিষয়সমূহ (ডিফল্ট ১১টি)
export const GENERAL_SUBJECTS_CLASS_6_8: string[] = [
  'বাংলা',
  'ইংরেজি',
  'গণিত',
  'বিজ্ঞান',
  'বাংলাদেশ ও বিশ্বপরিচয়',
  'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
  'ধর্ম ও নৈতিক শিক্ষা',
  'শারীরিক শিক্ষা ও স্বাস্থ্য',
  'চারু ও কারুকলা',
  'কর্ম ও জীবনমুখী শিক্ষা',
  'কৃষিশিক্ষা',
];

// ৬ষ্ঠ, ৭ম ও ৮ম শ্রেণির ঐচ্ছিক পছন্দসমূহ
export const GENERAL_ELECTIVE_CHOICES_CLASS_6_8: string[] = [
  'কৃষিশিক্ষা',
  'গার্হস্থ্য বিজ্ঞান',
];

// শিক্ষার্থী যুক্ত করার সময় সহজে যোগ করার মতো সমস্ত বিষয়ের তালিকা
export const ALL_CURRICULUM_SUBJECT_OPTIONS: string[] = [
  'উচ্চতর গণিত',
  'কৃষিশিক্ষা',
  'গার্হস্থ্য বিজ্ঞান',
  'অর্থনীতি',
  'পদার্থবিজ্ঞান (Physics)',
  'রসায়ন (Chemistry)',
  'জীববিজ্ঞান (Biology)',
  'হিসাববিজ্ঞান (Accounting)',
  'ব্যবসায় উদ্যোগ',
  'ফিন্যান্স ও ব্যাংকিং',
  'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা',
  'ভূগোল ও পরিবেশ',
  'পৌরনীতি ও নাগরিকতা',
  'সাধারণ বিজ্ঞান',
  'বাংলা ১ম পত্র',
  'বাংলা ২য় পত্র',
  'ইংরেজি ১ম পত্র',
  'ইংরেজি ২য় পত্র',
  'সাধারণ গণিত',
  'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
  'বাংলাদেশ ও বিশ্বপরিচয়',
  'ধর্ম ও নৈতিক শিক্ষা',
  'চারু ও কারুকলা (Arts & Crafts)',
  'শারীরিক শিক্ষা ও স্বাস্থ্য',
  'কর্ম ও জীবনমুখী শিক্ষা',
];

/**
 * Checks if a class has distinct academic groups (বিভাগ) e.g. Class 9 and 10
 */
export const isClassWithGroups = (className: string): boolean => {
  if (!className) return false;
  return (
    className.includes('৯ম') ||
    className.includes('১০ম') ||
    className.includes('Class 9') ||
    className.includes('Class 10') ||
    className.includes('9') ||
    className.includes('10')
  );
};

/**
 * Returns available elective options for this class and group
 */
export const getElectivesForClassAndGroup = (
  className: string,
  groupName?: string
): string[] => {
  if (isClassWithGroups(className)) {
    const grp = (groupName || '').toLowerCase();
    if (grp.includes('মানবিক') || grp.includes('arts') || grp.includes('humanities')) {
      return [...HUMANITIES_ELECTIVE_CHOICES];
    }
    if (grp.includes('ব্যবসায়') || grp.includes('বাণিজ্য') || grp.includes('commerce') || grp.includes('business')) {
      return [...COMMERCE_ELECTIVE_CHOICES];
    }
    return [...SCIENCE_ELECTIVE_CHOICES];
  }
  return [...GENERAL_ELECTIVE_CHOICES_CLASS_6_8];
};

/**
 * Returns the exact curriculum subject list based on Class and Group
 */
export const getSubjectsForClassAndGroup = (
  className: string,
  groupName?: string
): string[] => {
  if (!className) return [...GENERAL_SUBJECTS_CLASS_6_8];

  // Class 9 or 10
  if (isClassWithGroups(className)) {
    const grp = (groupName || '').toLowerCase();
    if (grp.includes('মানবিক') || grp.includes('arts') || grp.includes('humanities')) {
      return [...HUMANITIES_SUBJECTS_CLASS_9_10];
    }
    if (grp.includes('ব্যবসায়') || grp.includes('বাণিজ্য') || grp.includes('commerce') || grp.includes('business')) {
      return [...COMMERCE_SUBJECTS_CLASS_9_10];
    }
    // Default to Science
    return [...SCIENCE_SUBJECTS_CLASS_9_10];
  }

  // Class 6, 7, 8 (or general)
  return [...GENERAL_SUBJECTS_CLASS_6_8];
};
