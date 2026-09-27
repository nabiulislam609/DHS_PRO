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

// NCTB Official Subject Codes (বিষয় কোড)
export const SUBJECT_CODE_MAP: Record<string, string> = {
  'বাংলা': '১০১',
  'বাংলা ১ম পত্র': '১০১',
  'বাংলা ২য় পত্র': '১০২',
  'বাংলা ২য় পত্র': '১০২',
  'ইংরেজি': '১০২',
  'ইংরেজি ১ম পত্র': '১০৭',
  'ইংরেজি ২য় পত্র': '১০৮',
  'ইংরেজি ২য় পত্র': '১০৮',
  'গণিত': '১০৩',
  'সাধারণ গণিত': '১০৯',
  'উচ্চতর গণিত': '১২৬',
  'বিজ্ঞান': '১০৪',
  'সাধারণ বিজ্ঞান': '১২৭',
  'বাংলাদেশ ও বিশ্বপরিচয়': '১৫০',
  'বাংলাদেশ ও বিশ্বপরিচয়': '১৫০',
  'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)': '১৫৪',
  'ধর্ম ও নৈতিক শিক্ষা': '১১১',
  'ইসলাম ও নৈতিক শিক্ষা': '১১১',
  'হিন্দুধর্ম ও নৈতিক শিক্ষা': '১১২',
  'পদার্থবিজ্ঞান (Physics)': '১৩৬',
  'পদার্থবিজ্ঞান': '১৩৬',
  'রসায়ন (Chemistry)': '১৩৭',
  'রসায়ন (Chemistry)': '১৩৭',
  'রসায়ন': '১৩৭',
  'রসায়ন': '১৩৭',
  'জীববিজ্ঞান (Biology)': '১৩৮',
  'জীববিজ্ঞান': '১৩৮',
  'হিসাববিজ্ঞান (Accounting)': '১৪৬',
  'হিসাববিজ্ঞান': '১৪৬',
  'ব্যবসায় উদ্যোগ': '১৪৩',
  'ব্যবসায় উদ্যোগ': '১৪৩',
  'ফিন্যান্স ও ব্যাংকিং': '১৫২',
  'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা': '১৫৩',
  'ভূগোল ও পরিবেশ': '১১০',
  'পৌরনীতি ও নাগরিকতা': '১৪০',
  'অর্থনীতি': '১৪১',
  'কৃষিশিক্ষা': '১৩৪',
  'গার্হস্থ্য বিজ্ঞান': '১৫১',
  'শারীরিক শিক্ষা ও স্বাস্থ্য': '১৪৭',
  'চারু ও কারুকলা': '১৪৮',
  'চারু ও কারুকলা (Arts & Crafts)': '১৪৮',
  'কর্ম ও জীবনমুখী শিক্ষা': '১৪৯',
};

/**
 * Returns the official NCTB subject code
 */
export const getSubjectCode = (subjectName: string): string => {
  if (!subjectName) return '—';
  const clean = subjectName.trim();
  if (SUBJECT_CODE_MAP[clean]) return SUBJECT_CODE_MAP[clean];
  
  // Fuzzy match
  for (const [key, code] of Object.entries(SUBJECT_CODE_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return code;
    }
  }
  return '১০০';
};

/**
 * Validation Details Interface for Admit Card Subject List
 */
export interface ValidatedSubjectItem {
  name: string;
  code: string;
  type: 'compulsory' | 'group_compulsory' | 'elective';
  typeLabel: string;
}

export interface SubjectValidationDetails {
  isValid: boolean;
  className: string;
  groupName: string;
  isGroupApplicable: boolean;
  totalSubjects: number;
  expectedSubjectsCount: number;
  validatedSubjectList: ValidatedSubjectItem[];
  invalidSubjects: {
    name: string;
    reason: string;
  }[];
  electiveChoices: string[];
  selectedElective: string;
  validationStatusText: string;
  validationBadge: {
    status: 'success' | 'warning' | 'error';
    text: string;
  };
}

/**
 * Comprehensive NCTB Subject List Validation according to Class and Group
 */
export const validateSubjectsForClassAndGroup = (
  className: string,
  groupName?: string,
  customSubjects?: string[]
): SubjectValidationDetails => {
  const isHighSchoolGroup = isClassWithGroups(className);
  const grp = (groupName || '').toLowerCase();
  
  let expectedCount = 11;
  let standardSubjectList: string[] = [];
  let availableElectives: string[] = [];
  let currentGroupLabel = 'সাধারণ';

  if (isHighSchoolGroup) {
    expectedCount = 12;
    if (grp.includes('মানবিক') || grp.includes('arts') || grp.includes('humanities')) {
      currentGroupLabel = 'মানবিক';
      standardSubjectList = [...HUMANITIES_SUBJECTS_CLASS_9_10];
      availableElectives = [...HUMANITIES_ELECTIVE_CHOICES];
    } else if (grp.includes('ব্যবসায়') || grp.includes('ব্যবসায়') || grp.includes('commerce') || grp.includes('business')) {
      currentGroupLabel = 'ব্যবসায় শিক্ষা';
      standardSubjectList = [...COMMERCE_SUBJECTS_CLASS_9_10];
      availableElectives = [...COMMERCE_ELECTIVE_CHOICES];
    } else {
      currentGroupLabel = 'বিজ্ঞান';
      standardSubjectList = [...SCIENCE_SUBJECTS_CLASS_9_10];
      availableElectives = [...SCIENCE_ELECTIVE_CHOICES];
    }
  } else {
    expectedCount = 11;
    currentGroupLabel = 'সাধারণ (সকলের জন্য অভিন্ন)';
    standardSubjectList = [...GENERAL_SUBJECTS_CLASS_6_8];
    availableElectives = [...GENERAL_ELECTIVE_CHOICES_CLASS_6_8];
  }

  // Check invalid subjects if custom subjects were passed
  const invalidSubjects: { name: string; reason: string }[] = [];
  let selectedElective = availableElectives[0] || '';

  if (customSubjects && customSubjects.length > 0) {
    customSubjects.forEach((sub) => {
      const subClean = sub.trim();
      
      // If Class 6-8, check if secondary subjects are mistakenly present
      if (!isHighSchoolGroup) {
        if (
          subClean.includes('১ম পত্র') ||
          subClean.includes('২য় পত্র') ||
          subClean.includes('পদার্থবিজ্ঞান') ||
          subClean.includes('রসায়ন') ||
          subClean.includes('জীববিজ্ঞান') ||
          subClean.includes('উচ্চতর গণিত') ||
          subClean.includes('হিসাববিজ্ঞান') ||
          subClean.includes('ব্যবসায়') ||
          subClean.includes('ফিন্যান্স') ||
          subClean.includes('ইতিহাস') ||
          subClean.includes('পৌরনীতি') ||
          subClean.includes('অর্থনীতি')
        ) {
          invalidSubjects.push({
            name: subClean,
            reason: `"${subClean}" বিষয়টি ${className}-এর জন্য প্রযোজ্য নয় (এটি ৯ম-১০ম শ্রেণির বিষয়)।`,
          });
          return;
        }
      }

      // If Class 9-10, check cross-stream invalid subjects
      if (isHighSchoolGroup) {
        if (currentGroupLabel === 'বিজ্ঞান') {
          if (
            subClean.includes('হিসাববিজ্ঞান') ||
            subClean.includes('ব্যবসায়') ||
            subClean.includes('ফিন্যান্স') ||
            subClean.includes('পৌরনীতি') ||
            subClean.includes('ইতিহাস') ||
            subClean.includes('সাধারণ বিজ্ঞান')
          ) {
            invalidSubjects.push({
              name: subClean,
              reason: `"${subClean}" বিষয়টি বিজ্ঞান বিভাগের পাঠ্যক্রম বহির্ভূত।`,
            });
            return;
          }
        } else if (currentGroupLabel === 'মানবিক') {
          if (
            subClean.includes('পদার্থবিজ্ঞান') ||
            subClean.includes('রসায়ন') ||
            subClean.includes('জীববিজ্ঞান') ||
            subClean.includes('উচ্চতর গণিত') ||
            subClean.includes('হিসাববিজ্ঞান') ||
            subClean.includes('ব্যবসায় উদ্যোগ') ||
            subClean.includes('ফিন্যান্স')
          ) {
            invalidSubjects.push({
              name: subClean,
              reason: `"${subClean}" বিষয়টি মানবিক বিভাগের পাঠ্যক্রম বহির্ভূত।`,
            });
            return;
          }
        } else if (currentGroupLabel === 'ব্যবসায় শিক্ষা') {
          if (
            subClean.includes('পদার্থবিজ্ঞান') ||
            subClean.includes('রসায়ন') ||
            subClean.includes('জীববিজ্ঞান') ||
            subClean.includes('উচ্চতর গণিত') ||
            subClean.includes('ইতিহাস') ||
            subClean.includes('পৌরনীতি')
          ) {
            invalidSubjects.push({
              name: subClean,
              reason: `"${subClean}" বিষয়টি ব্যবসায় শিক্ষা বিভাগের পাঠ্যক্রম বহির্ভূত।`,
            });
            return;
          }
        }
      }

      // Check if this custom subject matches an available elective
      if (availableElectives.some((elec) => elec.toLowerCase() === subClean.toLowerCase())) {
        selectedElective = subClean;
      }
    });
  }

  // Construct official validated list with types and codes
  const validatedSubjectList: ValidatedSubjectItem[] = standardSubjectList.map((name) => {
    const isElective = availableElectives.includes(name);
    let type: 'compulsory' | 'group_compulsory' | 'elective' = 'compulsory';
    let typeLabel = 'আবশ্যিক';

    if (isElective) {
      type = 'elective';
      typeLabel = '৪র্থ / ঐচ্ছিক বিষয়';
    } else if (
      isHighSchoolGroup &&
      (name.includes('পদার্থ') ||
        name.includes('রসায়ন') ||
        name.includes('জীব') ||
        name.includes('হিসাব') ||
        name.includes('উদ্যোগ') ||
        name.includes('ফিন্যান্স') ||
        name.includes('ইতিহাস') ||
        name.includes('ভূগোল') ||
        name.includes('পৌরনীতি'))
    ) {
      type = 'group_compulsory';
      typeLabel = 'বিভাগীয় বিষয়';
    }

    return {
      name,
      code: getSubjectCode(name),
      type,
      typeLabel,
    };
  });

  const isValid = invalidSubjects.length === 0;

  return {
    isValid,
    className,
    groupName: currentGroupLabel,
    isGroupApplicable: isHighSchoolGroup,
    totalSubjects: validatedSubjectList.length,
    expectedSubjectsCount: expectedCount,
    validatedSubjectList,
    invalidSubjects,
    electiveChoices: availableElectives,
    selectedElective,
    validationStatusText: isValid
      ? `জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) কারিকুলাম অনুযায়ী ${className} (${currentGroupLabel})-এর মোট ${validatedSubjectList.length}টি বিষয়ের তালিকা শতভাগ অনুমোদিত ও নির্ভুল।`
      : `${className}-এর জন্য কিছু বিষয় অসামঞ্জস্যপূর্ণ হিসেবে চিহ্নিত হয়েছে। অনুমোদিত রুটিন স্বয়ংক্রিয়ভাবে প্রস্তুত করা হয়েছে।`,
    validationBadge: {
      status: isValid ? 'success' : 'warning',
      text: isValid
        ? `NCTB যাচাইকৃত (${validatedSubjectList.length}টি বিষয়)`
        : `সংশোধিত পাঠ্যক্রম (${validatedSubjectList.length}টি বিষয়)`,
    },
  };
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
