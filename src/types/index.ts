export interface Teacher {
  id: string;
  name: string;
  designation: string;
  subject: string;
  email: string;
  phone: string;
  initial: string;
  image?: string;
  order?: number;
}

export interface Staff {
  id: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  email?: string;
  initial?: string;
  image?: string;
  role?: string;
}

export interface Student {
  id: string;
  roll: string;
  name: string;
  studentClass: string;
  section: string;
  guardianName: string;
  phone: string;
  class?: string;
  group?: string;
  subjects?: string[];
  guardianPhone?: string;
  image?: string;
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  gender?: 'ছাত্র' | 'ছাত্রী';
  previousSchool?: string;
  presentAddress?: string;
}

export interface Notice {
  id: string;
  code?: string;
  title: string;
  category: 'জরুরি' | 'সাধারণ' | 'পরীক্ষা' | 'ক্রীড়া' | 'অনুষ্ঠান' | 'ভর্তি' | 'গুরুত্বপূর্ণ';
  date: string; // e.g. "22 Sep 2026"
  pinned: boolean;
  content: string;
  downloadUrl?: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'pdf';
  attachmentName?: string;
  attachmentSize?: string;
}

export interface LeadershipMessage {
  id: string;
  name: string;
  role: string;
  credentials: string;
  message: string;
  initial: string;
  image?: string;
  type: 'principal' | 'president';
}

export interface AcademicProgram {
  id: string;
  title: string;
  level: string; // e.g. "শ্রেণি: ৬ষ্ঠ-৮ম"
  description: string;
  subjects: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime?: string;
  summary: string;
  content: string;
  imageUrl?: string;
  images?: string[];
  featured?: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category?: string;
  imageUrl?: string;
  images?: string[];
}

export interface AchievementItem {
  id: string;
  category: string;
  year: string;
  title: string;
  subtitle: string;
  authorOrTeam?: string;
  iconType: 'academic' | 'olympiad' | 'sports' | 'scholarship' | 'tech' | string;
  imageUrl?: string;
  images?: string[];
}

export interface GalleryAlbum {
  id: string;
  category: 'campus' | 'classroom' | 'sports' | 'cultural' | 'science' | string;
  title: string;
  itemCountText: string;
  imageUrl: string;
  images?: string[];
}

export interface AdmissionApplication {
  id: string;
  applicantName: string;
  image?: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  gender: 'ছাত্র' | 'ছাত্রী';
  applyingClass: string;
  section?: string;
  group?: string;
  additionalSubject?: string;
  subjects?: string[];
  previousSchool: string;
  gpaOrGrade: string;
  phone: string;
  email?: string;
  presentAddress: string;
  appliedDate: string;
  status: 'অপেক্ষমাণ' | 'অনুমোদিত' | 'বাতিল';
  roll?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  badgeText: string;
  buttonText: string;
  buttonLink?: string;
  active: boolean;
}

export interface NavigationSubItem {
  id: string;
  label: string;
  url: string;
  order: number;
  visible: boolean;
  description?: string;
  badge?: string;
  iconName?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  iconName?: string;
  order: number;
  visible: boolean;
  subItems?: NavigationSubItem[];
}

export interface DownloadableForm {
  id: string;
  title: string;
  category: 'ভর্তি' | 'ছুটি' | 'প্রশংসাপত্র ও টিসি' | 'অন্যান্য' | string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: 'PDF' | 'DOCX' | 'DOC' | 'JPG' | string;
  updatedDate?: string;
  downloadCount?: number;
  active: boolean;
}

export interface AdmitCardConfig {
  examTerm: string;
  examYear: string;
  session: string;
  instructions: string[];
  principalSignatureUrl?: string;
  schoolSealUrl?: string;
  isActive: boolean;
  examStartDate?: string;
}

export interface CustomStatItem {
  id: string;
  label: string;
  value: string;
  description?: string;
  icon?: string;
}

export interface SiteSettings {
  schoolNameBangla: string;
  schoolNameEnglish: string;
  shortName?: string;
  tagline?: string;
  logoUrl?: string;
  faviconUrl?: string;
  motto: string;
  establishedYear: string;
  phone1: string;
  phone2: string;
  emergencyPhone?: string;
  email: string;
  address: string;
  officeHours: string;
  googleMapEmbedUrl?: string;
  facebook?: string;
  youtube?: string;
  instagram?: string;
  linkedin?: string;
  whatsapp?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  copyrightText?: string;
  aboutIntro?: string;
  mission?: string;
  vision?: string;
  objectives?: string;
  history?: string;
  whyUs?: string;
  facilities?: string;
  totalStudents: string;
  totalTeachers: string;
  passRate: string;
  gpa5Count: string;
  totalClassrooms: string;
  totalAwards: string;
  customStats?: CustomStatItem[];

  // Header & Top Bar Settings
  showTopBar?: boolean;
  topBarPhone?: string;
  topBarEmail?: string;
  topBarOfficeHours?: string;
  topBarFacebookText?: string;
  topBarFacebookUrl?: string;
  topBarYoutubeText?: string;
  topBarYoutubeUrl?: string;
  topBarInstagramText?: string;
  topBarInstagramUrl?: string;
  topBarAdminText?: string;
  topBarHeight?: 'compact' | 'normal' | 'spacious' | 'custom';
  topBarPaddingY?: number; // in pixels (e.g. 2 to 24)
  navbarHeight?: 'compact' | 'normal' | 'spacious' | 'custom';
  navbarPaddingY?: number; // in pixels (e.g. 6 to 24)

  // Notice Ticker Settings
  showNoticeTicker?: boolean;
  noticeTickerSpeed?: number; // in seconds (e.g. 15 to 120, default 60)
  noticeTickerLabel?: string;
  noticeTickerHeight?: 'compact' | 'normal' | 'spacious' | 'custom';
  noticeTickerPaddingY?: number; // in pixels (e.g. 2 to 24, default 8)
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  type: 'notice' | 'admission' | 'message' | 'teacher' | 'event' | 'setting';
}

export interface SubjectMark {
  subject: string;
  marks: number;
  gradePoint: number;
  grade: string;
}

export interface ExamResult {
  id: string;
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
  publishedDate?: string;
}

export interface PerformanceTrendItem {
  id: string;
  year: string;
  passRate: number;
  aPlus: number;
  gpa: number;
}

export interface SectionVisibility {
  ticker: boolean;
  hero: boolean;
  quick_actions: boolean;
  notices: boolean;
  leadership: boolean;
  about: boolean;
  programs: boolean;
  stats: boolean;
  results_trend: boolean;
  news: boolean;
  events: boolean;
  achievements: boolean;
  gallery: boolean;
  contact: boolean;
}
