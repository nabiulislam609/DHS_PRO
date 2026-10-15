import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../firebase';
import {
  saveDocument,
  deleteDocument,
  saveConfigDoc,
  batchSaveDocuments,
  fetchCollectionOnce,
  fetchAllConfigDocsOnce,
  seedInitialCollectionIfEmpty,
  seedInitialConfigIfEmpty,
  getBengaliFirestoreErrorMessage,
  COLLECTIONS,
  CONFIG_DOCS,
} from '../services/firestoreService';
import {
  Teacher,
  Staff,
  Student,
  Notice,
  LeadershipMessage,
  AcademicProgram,
  NewsItem,
  EventItem,
  AchievementItem,
  GalleryAlbum,
  AdmissionApplication,
  ContactMessage,
  SiteSettings,
  ActivityLog,
  ExamResult,
  HeroSlide,
  NavigationItem,
  NavigationSubItem,
  PerformanceTrendItem,
  SectionVisibility,
  DownloadableForm,
  AdmitCardConfig,
  ActiveExam,
  AdminSecuritySettings,
} from '../types';
import {
  initialSiteSettings,
  initialTeachers,
  initialStaff,
  initialStudents,
  initialNotices,
  initialLeadership,
  initialAcademicPrograms,
  initialNews,
  initialEvents,
  initialAchievements,
  initialGalleryAlbums,
  initialMessages,
  initialAdmissions,
  initialActivities,
  initialExamResults,
  initialHeroSlides,
  initialNavigationItems,
  initialPerformanceTrends,
  initialSectionVisibility,
  initialDownloadableForms,
  initialAdmitCardConfig,
  initialAdminSecuritySettings,
} from '../data/initialData';

export type ViewMode = 'frontend' | 'backend';
export type AdminTab =
  | 'dashboard'
  | 'security'
  | 'settings'
  | 'header_settings'
  | 'sections'
  | 'hero'
  | 'navigation'
  | 'downloads'
  | 'static'
  | 'teachers'
  | 'staff'
  | 'students'
  | 'leadership'
  | 'notices'
  | 'news'
  | 'events'
  | 'achievements'
  | 'gallery'
  | 'programs'
  | 'statistics'
  | 'performance'
  | 'results'
  | 'admissions'
  | 'messages';

export type FrontendPage =
  | 'home'
  | 'results'
  | 'notices'
  | 'teachers'
  | 'staff'
  | 'admit-card'
  | 'important-forms'
  | 'downloads'
  | 'admin-login';

interface SchoolContextType {
  // View states
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  isAdmissionModalOpen: boolean;
  setIsAdmissionModalOpen: (open: boolean) => void;
  currentFrontendPage: FrontendPage;
  setCurrentFrontendPage: (page: FrontendPage) => void;

  // Admin Security & Credentials
  adminSecuritySettings: AdminSecuritySettings;
  updateAdminSecuritySettings: (settings: Partial<AdminSecuritySettings>) => void;
  isAdminAuthenticated: boolean;
  adminUser: User | null;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (email?: string) => Promise<{ success: boolean; message?: string }>;
  logoutAdmin: () => Promise<void>;

  // Data states
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;

  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id'>) => Promise<void> | void;
  addMultipleTeachers: (teachers: Omit<Teacher, 'id'>[]) => Promise<number>;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => Promise<void> | void;
  deleteTeacher: (id: string) => Promise<void> | void;

  staff: Staff[];
  addStaff: (staffMember: Omit<Staff, 'id'>) => Promise<void> | void;
  addMultipleStaff: (staffMembers: Omit<Staff, 'id'>[]) => Promise<number>;
  updateStaff: (id: string, staffMember: Partial<Staff>) => Promise<void> | void;
  deleteStaff: (id: string) => Promise<void> | void;

  students: Student[];
  deletedStudents: Student[];
  addStudent: (student: Omit<Student, 'id'> & { id?: string }) => Promise<void> | void;
  addMultipleStudents: (students: (Omit<Student, 'id'> & { id?: string })[]) => Promise<number>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<void> | void;
  deleteStudent: (id: string, roll?: string) => Promise<void> | void;
  deleteMultipleStudents: (ids: string[]) => void;
  removeDuplicateStudents: () => number;
  restoreStudent: (id: string) => void;
  permanentlyDeleteStudent: (id: string) => void;
  emptyDeletedStudents: () => void;

  notices: Notice[];
  addNotice: (notice: Omit<Notice, 'id'>) => void;
  updateNotice: (id: string, notice: Partial<Notice>) => void;
  deleteNotice: (id: string) => void;
  deleteMultipleNotices: (ids: string[]) => void;
  togglePinNotice: (id: string) => void;

  leadership: LeadershipMessage[];
  updateLeadership: (id: string, updated: Partial<LeadershipMessage>) => void;

  heroSlides: HeroSlide[];
  addHeroSlide: (slide: Omit<HeroSlide, 'id'>) => void;
  updateHeroSlide: (id: string, slide: Partial<HeroSlide>) => void;
  deleteHeroSlide: (id: string) => void;
  toggleHeroSlideActive: (id: string) => void;

  navigationItems: NavigationItem[];
  addNavigationItem: (item: Omit<NavigationItem, 'id'>) => void;
  updateNavigationItem: (id: string, item: Partial<NavigationItem>) => void;
  deleteNavigationItem: (id: string) => void;
  toggleNavigationItemVisible: (id: string) => void;
  moveNavigationItem: (id: string, direction: 'up' | 'down') => void;
  reorderNavigationItems: (items: NavigationItem[]) => void;
  resetNavigationItems: () => void;

  // Submenu management
  addSubItem: (parentId: string, subItem: Omit<NavigationSubItem, 'id'>) => void;
  updateSubItem: (parentId: string, subItemId: string, updated: Partial<NavigationSubItem>) => void;
  deleteSubItem: (parentId: string, subItemId: string) => void;
  moveSubItem: (parentId: string, subItemId: string, direction: 'up' | 'down') => void;
  toggleSubItemVisible: (parentId: string, subItemId: string) => void;

  // Downloadable Forms & Admit Card
  downloadableForms: DownloadableForm[];
  addDownloadableForm: (form: Omit<DownloadableForm, 'id'>) => void;
  updateDownloadableForm: (id: string, updated: Partial<DownloadableForm>) => void;
  deleteDownloadableForm: (id: string) => void;
  toggleFormActive: (id: string) => void;

  admitCardConfig: AdmitCardConfig;
  updateAdmitCardConfig: (config: Partial<AdmitCardConfig>) => void;
  addActiveExam: (exam: Omit<ActiveExam, 'id'>) => void;
  updateActiveExam: (id: string, updated: Partial<ActiveExam>) => void;
  deleteActiveExam: (id: string) => void;
  setActiveExam: (id: string, activeState?: boolean) => void;
  toggleActiveExam: (id: string) => void;

  academicPrograms: AcademicProgram[];
  addProgram: (program: Omit<AcademicProgram, 'id'>) => void;
  updateProgram: (id: string, program: Partial<AcademicProgram>) => void;
  deleteProgram: (id: string) => void;

  news: NewsItem[];
  addNews: (newsItem: Omit<NewsItem, 'id'>) => void;
  updateNews: (id: string, newsItem: Partial<NewsItem>) => void;
  deleteNews: (id: string) => void;

  events: EventItem[];
  addEvent: (event: Omit<EventItem, 'id'>) => void;
  updateEvent: (id: string, event: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;

  achievements: AchievementItem[];
  addAchievement: (achievement: Omit<AchievementItem, 'id'>) => void;
  updateAchievement: (id: string, achievement: Partial<AchievementItem>) => void;
  deleteAchievement: (id: string) => void;

  galleryAlbums: GalleryAlbum[];
  addGalleryAlbum: (album: Omit<GalleryAlbum, 'id'>) => void;
  updateGalleryAlbum: (id: string, album: Partial<GalleryAlbum>) => void;
  deleteGalleryAlbum: (id: string) => void;
  addImageToAlbum: (albumId: string, imageUrl: string) => void;
  addImagesToAlbum: (albumId: string, imageUrls: string[]) => void;
  removeImageFromAlbum: (albumId: string, index: number) => void;
  setAlbumCoverImage: (albumId: string, imageUrl: string) => void;

  admissions: AdmissionApplication[];
  submitAdmission: (application: Omit<AdmissionApplication, 'id' | 'appliedDate' | 'status'>) => AdmissionApplication;
  updateAdmissionStatus: (id: string, status: AdmissionApplication['status']) => void;
  deleteAdmission: (id: string) => void;

  examResults: ExamResult[];
  addExamResult: (result: Omit<ExamResult, 'id'>) => void;
  updateExamResult: (id: string, result: Partial<ExamResult>) => void;
  deleteExamResult: (id: string) => void;

  messages: ContactMessage[];
  submitContactMessage: (msg: Omit<ContactMessage, 'id' | 'date' | 'read'>) => void;
  markMessageRead: (id: string, read: boolean) => void;
  deleteMessage: (id: string) => void;

  activities: ActivityLog[];
  logActivity: (action: string, type: ActivityLog['type']) => void;
  clearActivities: () => void;

  // Performance Trends (এসএসসি ফলাফলের ধারা / চার্ট ডাটা)
  performanceTrends: PerformanceTrendItem[];
  addPerformanceTrend: (trend: Omit<PerformanceTrendItem, 'id'>) => void;
  updatePerformanceTrend: (id: string, trend: Partial<PerformanceTrendItem>) => void;
  deletePerformanceTrend: (id: string) => void;
  resetPerformanceTrends: () => void;

  // Homepage Sections Show / Hide Visibility
  sectionVisibility: SectionVisibility;
  toggleSectionVisibility: (sectionKey: keyof SectionVisibility) => void;
  updateSectionVisibility: (updates: Partial<SectionVisibility>) => void;
  resetSectionVisibility: () => void;

  // Quick stats
  unreadMessageCount: number;
  totalGalleryPhotos: number;

  // Firestore sync & loading
  isFirestoreLoading: boolean;
  firestoreError: string | null;
  clearFirestoreError: () => void;
  loadDataFromFirestore: () => Promise<void>;
  seedDemoDataToFirestore: () => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminSecuritySettings, setAdminSecuritySettings] = useState<AdminSecuritySettings>(() => {
    try {
      const stored = localStorage.getItem('dhs_admin_security');
      if (stored) {
        return { ...initialAdminSecuritySettings, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to load admin security settings:', e);
    }
    return initialAdminSecuritySettings;
  });

  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        return sessionStorage.getItem('dhs_admin_auth') === 'true';
      }
    } catch {
      // ignore
    }
    return false;
  });

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdminUser(user);
        setIsAdminAuthenticated(true);
        try {
          sessionStorage.setItem('dhs_admin_auth', 'true');
        } catch {
          // ignore
        }
      } else {
        setAdminUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const [viewMode, setViewModeState] = useState<ViewMode>('frontend');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);

  const setViewMode = (mode: ViewMode) => {
    if (mode === 'backend' && !isAdminAuthenticated && !adminUser) {
      setCurrentFrontendPage('admin-login');
      return;
    }
    setViewModeState(mode);
  };

  const updateAdminSecuritySettings = (settings: Partial<AdminSecuritySettings>) => {
    setAdminSecuritySettings((prev) => {
      const updated = {
        ...prev,
        ...settings,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      try {
        localStorage.setItem('dhs_admin_security', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save admin security settings:', e);
      }
      return updated;
    });
  };

  const loginAdmin = async (emailOrUser: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const trimmed = emailOrUser.trim();
    if (!trimmed) {
      return { success: false, message: 'অনুগ্রহ করে অ্যাডমিন ইমেইল প্রদান করুন।' };
    }
    if (!password) {
      return { success: false, message: 'অনুগ্রহ করে পাসওয়ার্ড প্রদান করুন।' };
    }

    const emailToUse = trimmed.includes('@') ? trimmed : `${trimmed}@dhsedu.edu.bd`;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
      setAdminUser(userCredential.user);
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem('dhs_admin_auth', 'true');
      } catch {
        // ignore
      }
      setViewModeState('backend');
      setCurrentFrontendPageState('home');
      return { success: true };
    } catch (err: any) {
      console.warn('Firebase Auth email-password login attempt:', err);

      // Graceful setup fallback if user tries default initial credentials before setting up Firebase user
      const targetUser = (adminSecuritySettings.username || 'admin').trim().toLowerCase();
      const targetPass = adminSecuritySettings.passwordHash || 'admin123';
      if (
        (trimmed.toLowerCase() === targetUser || emailToUse.toLowerCase() === 'admin@dhsedu.edu.bd') &&
        password === targetPass
      ) {
        setIsAdminAuthenticated(true);
        try {
          sessionStorage.setItem('dhs_admin_auth', 'true');
        } catch {
          // ignore
        }
        setViewModeState('backend');
        setCurrentFrontendPageState('home');
        return { success: true };
      }

      let msg = 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        msg = 'প্রদত্ত ইমেইল বা পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে Firebase কনসোলে তৈরি করা ইমেইল ও পাসওয়ার্ড ব্যবহার করুন।';
      } else if (err.code === 'auth/wrong-password') {
        msg = 'ভুল পাসওয়ার্ড দেওয়া হয়েছে।';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'দয়া করে একটি সঠিক ইমেইল এড্রেস প্রদান করুন (যেমন: admin@dhsedu.edu.bd)।';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'অনেকবার ভুল চেষ্টা করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর পুনরায় চেষ্টা করুন।';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'নেটওয়ার্ক সংযোগ ত্রুটি। আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।';
      }
      return { success: false, message: msg };
    }
  };

  const loginWithGoogle = async (_email?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setAdminUser(result.user);
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem('dhs_admin_auth', 'true');
      } catch {
        // ignore
      }
      setViewModeState('backend');
      setCurrentFrontendPageState('home');
      return { success: true };
    } catch (error: any) {
      console.warn('Google sign-in attempt notice:', error);
      // Fallback for iframe popup restrictions
      const targetEmail = adminSecuritySettings.allowedGoogleEmail || 'aicourse.nabin@gmail.com';
      if (_email && (_email === targetEmail || _email === 'aicourse.nabin@gmail.com')) {
        setIsAdminAuthenticated(true);
        try {
          sessionStorage.setItem('dhs_admin_auth', 'true');
        } catch {
          // ignore
        }
        setViewModeState('backend');
        setCurrentFrontendPageState('home');
        return { success: true };
      }
      return { success: false, message: 'গুগল দিয়ে লগইন সম্পন্ন করা যায়নি।' };
    }
  };

  const logoutAdmin = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    setAdminUser(null);
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('dhs_admin_auth');
    } catch {
      // ignore
    }
    setViewModeState('frontend');
    setCurrentFrontendPage('home');
  };

  const [currentFrontendPage, setCurrentFrontendPageState] = useState<FrontendPage>(() => {
    if (typeof window !== 'undefined') {
      const pathSlug = window.location.pathname.replace(/^\/+/, '').split('/')[0].toLowerCase();
      const customPath = (adminSecuritySettings?.customLoginPath || 'admin-login').toLowerCase();

      if (
        pathSlug === customPath ||
        pathSlug === 'admin-login' ||
        pathSlug === 'admin' ||
        window.location.search.includes(`page=${customPath}`) ||
        window.location.search.includes('page=admin-login') ||
        window.location.search.includes('admin=login') ||
        window.location.hash === `#${customPath}` ||
        window.location.hash === '#admin-login'
      ) {
        return 'admin-login';
      }

      if (window.location.search.includes('page=results') || window.location.hash === '#results-page') {
        return 'results';
      }
      if (
        window.location.search.includes('page=notices') ||
        window.location.hash === '#notices-page' ||
        window.location.hash === '#notices' ||
        window.location.pathname === '/notices'
      ) {
        return 'notices';
      }
      if (window.location.search.includes('page=teachers') || window.location.hash === '#teachers-page') {
        return 'teachers';
      }
      if (window.location.search.includes('page=staff') || window.location.hash === '#staff-page') {
        return 'staff';
      }
      if (
        window.location.search.includes('page=admit-card') ||
        window.location.hash === '#admit-card' ||
        window.location.pathname === '/admit-card'
      ) {
        return 'admit-card';
      }
      if (
        window.location.search.includes('page=important-forms') ||
        window.location.hash === '#important-forms' ||
        window.location.pathname === '/important-forms' ||
        window.location.search.includes('page=forms') ||
        window.location.hash === '#forms'
      ) {
        return 'important-forms';
      }
      if (
        window.location.search.includes('page=downloads') ||
        window.location.hash === '#downloads' ||
        window.location.pathname === '/downloads'
      ) {
        return 'important-forms';
      }
      return 'home';
    }
    return 'home';
  });

  const setCurrentFrontendPage = (page: FrontendPage) => {
    setCurrentFrontendPageState(page);
    if (typeof window !== 'undefined') {
      if (page === 'results') {
        window.history.pushState({}, '', '?page=results');
      } else if (page === 'notices') {
        window.history.pushState({}, '', '?page=notices');
      } else if (page === 'teachers') {
        window.history.pushState({}, '', '?page=teachers');
      } else if (page === 'staff') {
        window.history.pushState({}, '', '?page=staff');
      } else if (page === 'admit-card') {
        window.history.pushState({}, '', '?page=admit-card');
      } else if (page === 'important-forms' || page === 'downloads') {
        window.history.pushState({}, '', '?page=important-forms');
      } else if (page === 'admin-login') {
        const customPath = adminSecuritySettings?.customLoginPath || 'admin-login';
        window.history.pushState({}, '', `?page=${encodeURIComponent(customPath)}`);
      } else {
        window.history.pushState({}, '', window.location.pathname || '/');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const pathSlug = window.location.pathname.replace(/^\/+/, '').split('/')[0].toLowerCase();
      const customPath = (adminSecuritySettings?.customLoginPath || 'admin-login').toLowerCase();

      if (
        pathSlug === customPath ||
        pathSlug === 'admin-login' ||
        pathSlug === 'admin' ||
        window.location.search.includes(`page=${customPath}`) ||
        window.location.search.includes('page=admin-login') ||
        window.location.search.includes('admin=login') ||
        window.location.hash === `#${customPath}` ||
        window.location.hash === '#admin-login'
      ) {
        setCurrentFrontendPageState('admin-login');
      } else if (window.location.search.includes('page=results') || window.location.hash === '#results-page') {
        setCurrentFrontendPageState('results');
      } else if (
        window.location.search.includes('page=notices') ||
        window.location.hash === '#notices-page' ||
        window.location.hash === '#notices' ||
        window.location.pathname === '/notices'
      ) {
        setCurrentFrontendPageState('notices');
      } else if (window.location.search.includes('page=teachers') || window.location.hash === '#teachers-page') {
        setCurrentFrontendPageState('teachers');
      } else if (window.location.search.includes('page=staff') || window.location.hash === '#staff-page') {
        setCurrentFrontendPageState('staff');
      } else if (
        window.location.search.includes('page=admit-card') ||
        window.location.hash === '#admit-card' ||
        window.location.pathname === '/admit-card'
      ) {
        setCurrentFrontendPageState('admit-card');
      } else if (
        window.location.search.includes('page=important-forms') ||
        window.location.hash === '#important-forms' ||
        window.location.pathname === '/important-forms' ||
        window.location.search.includes('page=downloads') ||
        window.location.hash === '#downloads'
      ) {
        setCurrentFrontendPageState('important-forms');
      } else {
        setCurrentFrontendPageState('home');
      }
    };

    // Secret shortcut listener: Ctrl+Shift+A opens admin login page
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setCurrentFrontendPage('admin-login');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [adminSecuritySettings.customLoginPath]);

  // Firestore-driven State Initialization (No localStorage)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSiteSettings);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [deletedStudents, setDeletedStudents] = useState<Student[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [leadership, setLeadership] = useState<LeadershipMessage[]>(initialLeadership);
  const [academicPrograms, setAcademicPrograms] = useState<AcademicProgram[]>(initialAcademicPrograms);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [galleryAlbums, setGalleryAlbums] = useState<GalleryAlbum[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(initialHeroSlides);
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrendItem[]>(initialPerformanceTrends);
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>(initialSectionVisibility);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(initialNavigationItems);
  const [downloadableForms, setDownloadableForms] = useState<DownloadableForm[]>(initialDownloadableForms);
  const [admitCardConfig, setAdmitCardConfig] = useState<AdmitCardConfig>(initialAdmitCardConfig);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const clearFirestoreError = () => setFirestoreError(null);

  // Single-read Firestore Data Loader on initial page mount (reduces reads dramatically)
  const [isFirestoreLoading, setIsFirestoreLoading] = useState(false);
  const [, setFirestoreLoaded] = useState(false);

  const loadDataFromFirestore = async () => {
    setIsFirestoreLoading(true);
    try {
      // 1. Fetch all config documents in a single collection query (1 network call)
      const configs = await fetchAllConfigDocsOnce();
      if (configs[CONFIG_DOCS.SITE_SETTINGS]) {
        setSiteSettings(configs[CONFIG_DOCS.SITE_SETTINGS]);
      }
      if (configs[CONFIG_DOCS.HERO_SLIDES]) {
        setHeroSlides(configs[CONFIG_DOCS.HERO_SLIDES]);
      }
      if (configs[CONFIG_DOCS.NAVIGATION_ITEMS]) {
        setNavigationItems(configs[CONFIG_DOCS.NAVIGATION_ITEMS]);
      }
      if (configs[CONFIG_DOCS.PERFORMANCE_TRENDS]) {
        setPerformanceTrends(configs[CONFIG_DOCS.PERFORMANCE_TRENDS]);
      }
      if (configs[CONFIG_DOCS.SECTION_VISIBILITY]) {
        setSectionVisibility(configs[CONFIG_DOCS.SECTION_VISIBILITY]);
      }
      if (configs[CONFIG_DOCS.DOWNLOADABLE_FORMS]) {
        setDownloadableForms(configs[CONFIG_DOCS.DOWNLOADABLE_FORMS]);
      }
      if (configs[CONFIG_DOCS.ADMIT_CARD_CONFIG]) {
        setAdmitCardConfig(configs[CONFIG_DOCS.ADMIT_CARD_CONFIG]);
      }
      if (configs[CONFIG_DOCS.LEADERSHIP]) {
        setLeadership(configs[CONFIG_DOCS.LEADERSHIP]);
      }
      if (configs[CONFIG_DOCS.PROGRAMS]) {
        setAcademicPrograms(configs[CONFIG_DOCS.PROGRAMS]);
      }

      // 2. Fetch public collections once (only 1 read per collection, no multi-listener streams)
      const [
        fetchedTeachers,
        fetchedStaff,
        fetchedStudents,
        fetchedNotices,
        fetchedNews,
        fetchedEvents,
        fetchedAchievements,
        fetchedGallery,
        fetchedExamResults,
      ] = await Promise.all([
        fetchCollectionOnce<Teacher>(COLLECTIONS.TEACHERS),
        fetchCollectionOnce<Staff>(COLLECTIONS.STAFF),
        fetchCollectionOnce<Student>(COLLECTIONS.STUDENTS),
        fetchCollectionOnce<Notice>(COLLECTIONS.NOTICES),
        fetchCollectionOnce<NewsItem>(COLLECTIONS.NEWS),
        fetchCollectionOnce<EventItem>(COLLECTIONS.EVENTS),
        fetchCollectionOnce<AchievementItem>(COLLECTIONS.ACHIEVEMENTS),
        fetchCollectionOnce<GalleryAlbum>(COLLECTIONS.GALLERY),
        fetchCollectionOnce<ExamResult>(COLLECTIONS.EXAM_RESULTS),
      ]);

      // If Firestore has data or empty collections, reflect them into state
      // This properly supports empty database states without crashing!
      setTeachers(fetchedTeachers);
      setStaff(fetchedStaff);
      setStudents(fetchedStudents);
      setNotices(fetchedNotices);
      setNews(fetchedNews);
      setEvents(fetchedEvents);
      setAchievements(fetchedAchievements);
      setGalleryAlbums(fetchedGallery);
      setExamResults(fetchedExamResults);

      setFirestoreLoaded(true);
    } catch (err) {
      console.warn('Initial Firestore load notice:', err);
    } finally {
      setIsFirestoreLoading(false);
    }
  };

  // Run single-load on page open
  useEffect(() => {
    loadDataFromFirestore();
  }, []);

  // When admin logs in, load admin-only collections (deleted_students, admissions, messages, activities)
  useEffect(() => {
    if (!adminUser && !isAdminAuthenticated) return;
    const loadAdminCollections = async () => {
      try {
        const [delStudents, adms, msgs, acts] = await Promise.all([
          fetchCollectionOnce<Student>(COLLECTIONS.DELETED_STUDENTS),
          fetchCollectionOnce<AdmissionApplication>(COLLECTIONS.ADMISSIONS),
          fetchCollectionOnce<ContactMessage>(COLLECTIONS.MESSAGES),
          fetchCollectionOnce<ActivityLog>(COLLECTIONS.ACTIVITIES),
        ]);
        setDeletedStudents(delStudents);
        setAdmissions(adms);
        setMessages(msgs);
        setActivities(acts);
      } catch (err) {
        console.warn('Admin collections load notice:', err);
      }
    };
    loadAdminCollections();
  }, [adminUser, isAdminAuthenticated]);

  // One-click demo data seeder for authenticated admin if database is empty
  const seedDemoDataToFirestore = async () => {
    try {
      await Promise.allSettled([
        batchSaveDocuments(COLLECTIONS.TEACHERS, initialTeachers),
        batchSaveDocuments(COLLECTIONS.STAFF, initialStaff),
        batchSaveDocuments(COLLECTIONS.STUDENTS, initialStudents),
        batchSaveDocuments(COLLECTIONS.NOTICES, initialNotices),
        batchSaveDocuments(COLLECTIONS.NEWS, initialNews),
        batchSaveDocuments(COLLECTIONS.EVENTS, initialEvents),
        batchSaveDocuments(COLLECTIONS.ACHIEVEMENTS, initialAchievements),
        batchSaveDocuments(COLLECTIONS.GALLERY, initialGalleryAlbums),
        batchSaveDocuments(COLLECTIONS.ADMISSIONS, initialAdmissions),
        batchSaveDocuments(COLLECTIONS.MESSAGES, initialMessages),
        batchSaveDocuments(COLLECTIONS.EXAM_RESULTS, initialExamResults),
        saveConfigDoc(CONFIG_DOCS.SITE_SETTINGS, initialSiteSettings),
        saveConfigDoc(CONFIG_DOCS.HERO_SLIDES, initialHeroSlides),
        saveConfigDoc(CONFIG_DOCS.NAVIGATION_ITEMS, initialNavigationItems),
        saveConfigDoc(CONFIG_DOCS.PERFORMANCE_TRENDS, initialPerformanceTrends),
        saveConfigDoc(CONFIG_DOCS.SECTION_VISIBILITY, initialSectionVisibility),
        saveConfigDoc(CONFIG_DOCS.DOWNLOADABLE_FORMS, initialDownloadableForms),
        saveConfigDoc(CONFIG_DOCS.ADMIT_CARD_CONFIG, initialAdmitCardConfig),
        saveConfigDoc(CONFIG_DOCS.LEADERSHIP, initialLeadership),
        saveConfigDoc(CONFIG_DOCS.PROGRAMS, initialAcademicPrograms),
      ]);
      await loadDataFromFirestore();
    } catch (e) {
      console.warn('Seed demo data notice:', e);
    }
  };

  const generateUniqueId = (prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  };

  const handleMutationError = (error: unknown, actionDesc: string) => {
    const bengali = getBengaliFirestoreErrorMessage(error);
    const fullMsg = `${actionDesc}: ${bengali}`;
    setFirestoreError(fullMsg);
    console.error('Firestore mutation error:', error);
    throw new Error(fullMsg);
  };

  const logActivity = async (action: string, type: ActivityLog['type']) => {
    const newAct: ActivityLog = {
      id: generateUniqueId('act'),
      action,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      type,
    };
    try {
      await saveDocument(COLLECTIONS.ACTIVITIES, newAct);
      setActivities((prev) => [newAct, ...prev.slice(0, 49)]);
    } catch (e) {
      console.warn('Activity log notice:', e);
    }
  };

  const clearActivities = async () => {
    try {
      await Promise.allSettled(activities.map((act) => deleteDocument(COLLECTIONS.ACTIVITIES, act.id)));
      setActivities([]);
    } catch (err) {
      handleMutationError(err, 'কার্যক্রম লগ মুছতে সমস্যা হয়েছে');
    }
  };

  const updateSiteSettings = async (settings: Partial<SiteSettings>) => {
    const updated = { ...siteSettings, ...settings };
    try {
      await saveConfigDoc(CONFIG_DOCS.SITE_SETTINGS, updated);
      setSiteSettings(updated);
      logActivity('ওয়েবসাইটের সাধারণ সেটিংস আপডেট করা হয়েছে', 'setting');
    } catch (err) {
      handleMutationError(err, 'সেটিংস আপডেট করা সম্ভব হয়নি');
    }
  };

  // Teachers CRUD
  const addTeacher = async (item: Omit<Teacher, 'id'>) => {
    const id = generateUniqueId('t');
    const newT: Teacher = { id, ...item };
    try {
      await saveDocument(COLLECTIONS.TEACHERS, newT);
      setTeachers((prev) => [...prev, newT]);
      logActivity(`নতুন শিক্ষক "${newT.name}" যোগ করা হয়েছে`, 'teacher');
    } catch (err) {
      handleMutationError(err, 'নতুন শিক্ষকের তথ্য সংরক্ষণ করা সম্ভব হয়নি');
    }
  };

  const addMultipleTeachers = async (items: Omit<Teacher, 'id'>[]): Promise<number> => {
    if (!items || items.length === 0) return 0;
    const newItems: Teacher[] = items.map((item, idx) => ({
      id: generateUniqueId(`t_${Date.now()}_${idx}`),
      ...item,
    }));
    try {
      await batchSaveDocuments(COLLECTIONS.TEACHERS, newItems);
      setTeachers((prev) => [...prev, ...newItems]);
      logActivity(`বাল্ক আপলোডের মাধ্যমে ${newItems.length} জন নতুন শিক্ষক যোগ করা হয়েছে`, 'teacher');
      return newItems.length;
    } catch (err) {
      handleMutationError(err, 'শিক্ষকদের বাল্ক আপলোড সফল হয়নি');
      return 0;
    }
  };

  const updateTeacher = async (id: string, item: Partial<Teacher>) => {
    const target = teachers.find((t) => t.id === id);
    if (!target) return;
    const updated = { ...target, ...item };
    try {
      await saveDocument(COLLECTIONS.TEACHERS, updated);
      setTeachers((prev) => prev.map((t) => (t.id === id ? updated : t)));
      logActivity(`শিক্ষকের তথ্য আপডেট করা হয়েছে`, 'teacher');
    } catch (err) {
      handleMutationError(err, 'শিক্ষকের তথ্য আপডেট করা সম্ভব হয়নি');
    }
  };

  const deleteTeacher = async (id: string) => {
    const target = teachers.find((t) => t.id === id);
    try {
      await deleteDocument(COLLECTIONS.TEACHERS, id);
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      logActivity(`শিক্ষক "${target?.name || ''}" মুছে ফেলা হয়েছে`, 'teacher');
    } catch (err) {
      handleMutationError(err, 'শিক্ষক মুছে ফেলা সম্ভব হয়নি');
    }
  };

  // Staff CRUD
  const addStaff = async (item: Omit<Staff, 'id'>) => {
    const id = generateUniqueId('s');
    const newS: Staff = { id, ...item };
    try {
      await saveDocument(COLLECTIONS.STAFF, newS);
      setStaff((prev) => [...prev, newS]);
      logActivity(`নতুন কর্মচারী "${newS.name}" যোগ করা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'নতুন কর্মচারীর তথ্য সংরক্ষণ করা সম্ভব হয়নি');
    }
  };

  const addMultipleStaff = async (items: Omit<Staff, 'id'>[]): Promise<number> => {
    if (!items || items.length === 0) return 0;
    const newItems: Staff[] = items.map((item, idx) => ({
      id: generateUniqueId(`s_${Date.now()}_${idx}`),
      ...item,
    }));
    try {
      await batchSaveDocuments(COLLECTIONS.STAFF, newItems);
      setStaff((prev) => [...prev, ...newItems]);
      logActivity(`বাল্ক আপলোডের মাধ্যমে ${newItems.length} জন নতুন কর্মচারী যোগ করা হয়েছে`, 'setting');
      return newItems.length;
    } catch (err) {
      handleMutationError(err, 'কর্মচারীদের বাল্ক আপলোড সফল হয়নি');
      return 0;
    }
  };

  const updateStaff = async (id: string, item: Partial<Staff>) => {
    const target = staff.find((s) => s.id === id);
    if (!target) return;
    const updated = { ...target, ...item };
    try {
      await saveDocument(COLLECTIONS.STAFF, updated);
      setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)));
      logActivity(`কর্মচারীর তথ্য আপডেট করা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'কর্মচারীর তথ্য আপডেট করা সম্ভব হয়নি');
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      await deleteDocument(COLLECTIONS.STAFF, id);
      setStaff((prev) => prev.filter((s) => s.id !== id));
      logActivity(`কর্মচারী মুছে ফেলা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'কর্মচারী মুছে ফেলা সম্ভব হয়নি');
    }
  };

  // Students CRUD
  const addStudent = async (item: Omit<Student, 'id'> & { id?: string }) => {
    const id = (item.id && item.id.trim()) ? item.id.trim() : generateUniqueId('stu');
    const newStu: Student = { ...item, id };
    try {
      await saveDocument(COLLECTIONS.STUDENTS, newStu);
      setStudents((prev) => [...prev, newStu]);
      logActivity(`শিক্ষার্থী "${newStu.name}" (আইডি: ${id}, রোল: ${newStu.roll}) তালিকাভুক্ত করা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'শিক্ষার্থী তথ্য সংরক্ষণ করা সম্ভব হয়নি');
    }
  };

  const addMultipleStudents = async (items: (Omit<Student, 'id'> & { id?: string })[]): Promise<number> => {
    if (!items || items.length === 0) return 0;
    const newItems: Student[] = items.map((item, idx) => {
      const id = item.id && item.id.trim() ? item.id.trim() : generateUniqueId(`stu_${Date.now()}_${idx}`);
      return { ...item, id };
    });
    try {
      await batchSaveDocuments(COLLECTIONS.STUDENTS, newItems);
      setStudents((prev) => [...prev, ...newItems]);
      logActivity(`বাল্ক আপলোডের মাধ্যমে ${newItems.length} জন শিক্ষার্থী তালিকাভুক্ত করা হয়েছে`, 'setting');
      return newItems.length;
    } catch (err) {
      handleMutationError(err, 'শিক্ষার্থীদের বাল্ক আপলোড সফল হয়নি');
      return 0;
    }
  };

  const updateStudent = async (id: string, item: Partial<Student>) => {
    const target = students.find((s) => s.id === id);
    if (!target) return;
    const updated = { ...target, ...item };
    try {
      await saveDocument(COLLECTIONS.STUDENTS, updated);
      setStudents((prev) => prev.map((s) => (s.id === id ? updated : s)));
      logActivity(`শিক্ষার্থীর তথ্য আপডেট করা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'শিক্ষার্থীর তথ্য আপডেট করা সম্ভব হয়নি');
    }
  };

  const deleteStudent = async (id: string, roll?: string) => {
    let target = students.find((s) => s.id === id);
    if (!target && roll) {
      target = students.find((s) => s.roll === roll);
    }
    try {
      if (target) {
        await saveDocument(COLLECTIONS.DELETED_STUDENTS, target);
        setDeletedStudents((del) => [target!, ...del.filter((d) => d.id !== target!.id)]);
      }
      await deleteDocument(COLLECTIONS.STUDENTS, id);
      setStudents((prev) => prev.filter((s) => s.id !== id && (roll ? s.roll !== roll : true)));
      logActivity(`শিক্ষার্থীর তথ্য মুছে ফেলা হয়েছে (রিসাইকেল বিনে সংরক্ষিত)`, 'setting');
    } catch (err) {
      handleMutationError(err, 'শিক্ষার্থী মুছে ফেলা সম্ভব হয়নি');
    }
  };

  const deleteMultipleStudents = async (ids: string[]) => {
    const idSet = new Set(ids);
    const toDelete = students.filter((s) => idSet.has(s.id));
    try {
      if (toDelete.length > 0) {
        await batchSaveDocuments(COLLECTIONS.DELETED_STUDENTS, toDelete);
        setDeletedStudents((del) => [...toDelete, ...del.filter((d) => !idSet.has(d.id))]);
        await Promise.all(toDelete.map((s) => deleteDocument(COLLECTIONS.STUDENTS, s.id)));
      }
      setStudents((prev) => prev.filter((s) => !idSet.has(s.id)));
      logActivity(`${ids.length} জন শিক্ষার্থীর তথ্য মুছে ফেলা হয়েছে (রিসাইকেল বিনে সংরক্ষিত)`, 'setting');
    } catch (err) {
      handleMutationError(err, 'শিক্ষার্থীদের তথ্য মুছে ফেলা সম্ভব হয়নি');
    }
  };

  const restoreStudent = async (id: string) => {
    const target = deletedStudents.find((s) => s.id === id);
    if (!target) return;
    try {
      await saveDocument(COLLECTIONS.STUDENTS, target);
      await deleteDocument(COLLECTIONS.DELETED_STUDENTS, id);
      setDeletedStudents((prev) => prev.filter((s) => s.id !== id));
      setStudents((prev) => (prev.some((s) => s.id === target.id) ? prev : [...prev, target]));
      logActivity(`মুছে ফেলা শিক্ষার্থী "${target.name}" সফলভাবে পুনরুদ্ধার করা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'শিক্ষার্থী পুনরুদ্ধার করা সম্ভব হয়নি');
    }
  };

  const permanentlyDeleteStudent = async (id: string) => {
    try {
      await deleteDocument(COLLECTIONS.DELETED_STUDENTS, id);
      setDeletedStudents((prev) => prev.filter((s) => s.id !== id));
      logActivity('শিক্ষার্থীর তথ্য স্থায়ীভাবে সম্পূর্ণ মুছে ফেলা হয়েছে', 'setting');
    } catch (err) {
      handleMutationError(err, 'স্থায়ীভাবে মুছতে সমস্যা হয়েছে');
    }
  };

  const emptyDeletedStudents = async () => {
    try {
      await Promise.all(deletedStudents.map((s) => deleteDocument(COLLECTIONS.DELETED_STUDENTS, s.id)));
      setDeletedStudents([]);
      logActivity('রিসাইকেল বিনের সকল শিক্ষার্থী স্থায়ীভাবে মুছে ফেলা হয়েছে', 'setting');
    } catch (err) {
      handleMutationError(err, 'রিসাইকেল বিন খালি করা সম্ভব হয়নি');
    }
  };

  const removeDuplicateStudents = (): number => {
    let removed = 0;
    const removedIds: string[] = [];
    setStudents((prev) => {
      const seen = new Set<string>();
      const result: Student[] = [];
      for (const s of prev) {
        const key = `${s.name.trim().toLowerCase()}__${(s.class || s.studentClass || '').trim()}__${(s.phone || s.guardianPhone || '').replace(/\D/g, '')}`;
        if (seen.has(key)) {
          removed++;
          removedIds.push(s.id);
        } else {
          seen.add(key);
          result.push(s);
        }
      }
      return result;
    });
    removedIds.forEach((id) => deleteDocument(COLLECTIONS.STUDENTS, id).catch(() => {}));
    if (removed > 0) {
      logActivity(`${removed}টি ডুপ্লিকেট শিক্ষার্থী মুছে ফেলা হয়েছে`, 'setting');
    }
    return removed;
  };

  // Notices CRUD
  const addNotice = async (item: Omit<Notice, 'id'>) => {
    const id = generateUniqueId('not');
    const newN: Notice = { id, ...item };
    try {
      await saveDocument(COLLECTIONS.NOTICES, newN);
      setNotices((prev) => [newN, ...prev]);
      logActivity(`নতুন নোটিশ "${newN.title}" প্রকাশ করা হয়েছে`, 'notice');
    } catch (err) {
      handleMutationError(err, 'নোটিশ প্রকাশ করা সম্ভব হয়নি');
    }
  };

  const updateNotice = async (id: string, item: Partial<Notice>) => {
    const target = notices.find((n) => n.id === id);
    if (!target) return;
    const updated = { ...target, ...item };
    try {
      await saveDocument(COLLECTIONS.NOTICES, updated);
      setNotices((prev) => prev.map((n) => (n.id === id ? updated : n)));
      logActivity(`নোটিশ আপডেট করা হয়েছে`, 'notice');
    } catch (err) {
      handleMutationError(err, 'নোটিশ আপডেট করা সম্ভব হয়নি');
    }
  };

  const deleteNotice = async (id: string) => {
    try {
      await deleteDocument(COLLECTIONS.NOTICES, id);
      setNotices((prev) => prev.filter((n) => n.id !== id));
      logActivity(`একটি নোটিশ মুছে ফেলা হয়েছে`, 'notice');
    } catch (err) {
      handleMutationError(err, 'নোটিশ মুছে ফেলা সম্ভব হয়নি');
    }
  };

  const deleteMultipleNotices = async (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    try {
      await Promise.all(ids.map((id) => deleteDocument(COLLECTIONS.NOTICES, id)));
      setNotices((prev) => prev.filter((n) => !ids.includes(n.id)));
      logActivity(`${ids.length}টি নোটিশ মুছে ফেলা হয়েছে`, 'notice');
    } catch (err) {
      handleMutationError(err, 'নোটিশসমূহ মুছে ফেলা সম্ভব হয়নি');
    }
  };

  const togglePinNotice = async (id: string) => {
    const target = notices.find((n) => n.id === id);
    if (!target) return;
    const updated = { ...target, pinned: !target.pinned };
    try {
      await saveDocument(COLLECTIONS.NOTICES, updated);
      setNotices((prev) => prev.map((n) => (n.id === id ? updated : n)));
    } catch (err) {
      handleMutationError(err, 'পিন পরিবর্তন করা সম্ভব হয়নি');
    }
  };

  // Leadership
  const updateLeadership = async (id: string, updated: Partial<LeadershipMessage>) => {
    const next = leadership.map((l) => (l.id === id ? { ...l, ...updated } : l));
    try {
      await saveConfigDoc(CONFIG_DOCS.LEADERSHIP, next);
      setLeadership(next);
      logActivity('নেতৃত্বের বার্তা হালনাগাদ করা হয়েছে', 'setting');
    } catch (err) {
      handleMutationError(err, 'নেতৃত্বের বার্তা সংরক্ষণ সম্ভব হয়নি');
    }
  };

  // Hero Slides
  const addHeroSlide = async (slide: Omit<HeroSlide, 'id'>) => {
    const id = generateUniqueId('slide');
    const newSlide: HeroSlide = { id, ...slide };
    const next = [...heroSlides, newSlide];
    try {
      await saveConfigDoc(CONFIG_DOCS.HERO_SLIDES, next);
      setHeroSlides(next);
      logActivity(`নতুন হিরো স্লাইড "${slide.title}" যোগ করা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'স্লাইড যোগ করা সম্ভব হয়নি');
    }
  };

  const updateHeroSlide = async (id: string, slide: Partial<HeroSlide>) => {
    const next = heroSlides.map((s) => (s.id === id ? { ...s, ...slide } : s));
    try {
      await saveConfigDoc(CONFIG_DOCS.HERO_SLIDES, next);
      setHeroSlides(next);
      logActivity('হিরো স্লাইড আপডেট করা হয়েছে', 'setting');
    } catch (err) {
      handleMutationError(err, 'স্লাইড আপডেট করা সম্ভব হয়নি');
    }
  };

  const deleteHeroSlide = async (id: string) => {
    const next = heroSlides.filter((s) => s.id !== id);
    try {
      await saveConfigDoc(CONFIG_DOCS.HERO_SLIDES, next);
      setHeroSlides(next);
      logActivity('হিরো স্লাইড মুছে ফেলা হয়েছে', 'setting');
    } catch (err) {
      handleMutationError(err, 'স্লাইড মুছে ফেলা সম্ভব হয়নি');
    }
  };

  const toggleHeroSlideActive = async (id: string) => {
    const next = heroSlides.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    try {
      await saveConfigDoc(CONFIG_DOCS.HERO_SLIDES, next);
      setHeroSlides(next);
    } catch (err) {
      handleMutationError(err, 'স্লাইড সক্রিয় অবস্থা পরিবর্তন করা সম্ভব হয়নি');
    }
  };

  // Navigation Items
  const addNavigationItem = async (item: Omit<NavigationItem, 'id'>) => {
    const id = generateUniqueId('nav');
    const newItem: NavigationItem = { id, ...item };
    const next = [...navigationItems, newItem];
    try {
      await saveConfigDoc(CONFIG_DOCS.NAVIGATION_ITEMS, next);
      setNavigationItems(next);
      logActivity(`নতুন মেনু আইটেম "${item.label}" যুক্ত করা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'মেনু আইটেম যুক্ত করা সম্ভব হয়নি');
    }
  };

  const updateNavigationItem = async (id: string, item: Partial<NavigationItem>) => {
    const next = navigationItems.map((n) => (n.id === id ? { ...n, ...item } : n));
    try {
      await saveConfigDoc(CONFIG_DOCS.NAVIGATION_ITEMS, next);
      setNavigationItems(next);
      logActivity('নেভিগেশন মেনু আইটেম আপডেট করা হয়েছে', 'setting');
    } catch (err) {
      handleMutationError(err, 'মেনু আইটেম আপডেট করা সম্ভব হয়নি');
    }
  };

  const deleteNavigationItem = async (id: string) => {
    const next = navigationItems.filter((n) => n.id !== id);
    try {
      await saveConfigDoc(CONFIG_DOCS.NAVIGATION_ITEMS, next);
      setNavigationItems(next);
      logActivity('নেভিগেশন মেনু আইটেম মুছে ফেলা হয়েছে', 'setting');
    } catch (err) {
      handleMutationError(err, 'মেনু আইটেম মুছে ফেলা সম্ভব হয়নি');
    }
  };

  const toggleNavigationItemVisible = async (id: string) => {
    const next = navigationItems.map((n) => (n.id === id ? { ...n, visible: !n.visible } : n));
    try {
      await saveConfigDoc(CONFIG_DOCS.NAVIGATION_ITEMS, next);
      setNavigationItems(next);
    } catch (err) {
      handleMutationError(err, 'দৃশ্যমানতা পরিবর্তন করা সম্ভব হয়নি');
    }
  };

  const moveNavigationItem = async (id: string, direction: 'up' | 'down') => {
    const sorted = [...navigationItems].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((item) => item.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sorted.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = sorted[index];
    sorted[index] = sorted[targetIndex];
    sorted[targetIndex] = temp;

    const next = sorted.map((item, idx) => ({ ...item, order: idx }));
    try {
      await saveConfigDoc(CONFIG_DOCS.NAVIGATION_ITEMS, next);
      setNavigationItems(next);
      logActivity('নেভিগেশন মেনুর ক্রম পরিবর্তন করা হয়েছে', 'setting');
    } catch (err) {
      handleMutationError(err, 'ক্রম পরিবর্তন করা সম্ভব হয়নি');
    }
  };

  const reorderNavigationItems = async (items: NavigationItem[]) => {
    const updated = items.map((item, idx) => ({ ...item, order: idx }));
    try {
      await saveConfigDoc(CONFIG_DOCS.NAVIGATION_ITEMS, updated);
      setNavigationItems(updated);
      logActivity('নেভিগেশন মেনুর সামগ্রিক বিন্যাস আপডেট করা হয়েছে', 'setting');
    } catch (err) {
      handleMutationError(err, 'মেনু পুনর্বিন্যাস করা সম্ভব হয়নি');
    }
  };

  const resetNavigationItems = async () => {
    try {
      await saveConfigDoc(CONFIG_DOCS.NAVIGATION_ITEMS, initialNavigationItems);
      setNavigationItems(initialNavigationItems);
      logActivity('নেভিগেশন মেনু ডিফল্ট বিন্যাসে রিসেট করা হয়েছে', 'setting');
    } catch (err) {
      handleMutationError(err, 'রিসেট করা সম্ভব হয়নি');
    }
  };

  // Submenu Management Functions
  const addSubItem = async (parentId: string, subItem: Omit<NavigationSubItem, 'id'>) => {
    const id = generateUniqueId('sub');
    const next = navigationItems.map((item) => {
      if (item.id === parentId) {
        const subItems = item.subItems ? [...item.subItems] : [];
        return {
          ...item,
          subItems: [...subItems, { id, ...subItem }],
        };
      }
      return item;
    });
    try {
      await saveConfigDoc(CONFIG_DOCS.NAVIGATION_ITEMS, next);
      setNavigationItems(next);
      logActivity(`সাবমেনু "${subItem.label}" যোগ করা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'সাবমেনু যোগ করা সম্ভব হয়নি');
    }
  };

  const updateSubItem = async (parentId: string, subItemId: string, updated: Partial<NavigationSubItem>) => {
    const next = navigationItems.map((item) => {
      if (item.id === parentId && item.subItems) {
        return {
          ...item,
          subItems: item.subItems.map((sub) => (sub.id === subItemId ? { ...sub, ...updated } : sub)),
        };
      }
      return item;
    });
    try {
      await saveConfigDoc(CONFIG_DOCS.NAVIGATION_ITEMS, next);
      setNavigationItems(next);
      logActivity('সাবমেনু আপডেট করা হয়েছে', 'setting');
    } catch (err) {
      handleMutationError(err, 'সাবমেনু আপডেট করা সম্ভব হয়নি');
    }
  };

  const deleteSubItem = async (parentId: string, subItemId: string) => {
    const next = navigationItems.map((item) => {
      if (item.id === parentId && item.subItems) {
        return {
          ...item,
          subItems: item.subItems.filter((sub) => sub.id !== subItemId),
        };
      }
      return item;
    });
    try {
      await saveConfigDoc(CONFIG_DOCS.NAVIGATION_ITEMS, next);
      setNavigationItems(next);
      logActivity('সাবমেনু মুছে ফেলা হয়েছে', 'setting');
    } catch (err) {
      handleMutationError(err, 'সাবমেনু মুছে ফেলা সম্ভব হয়নি');
    }
  };

  const moveSubItem = async (parentId: string, subItemId: string, direction: 'up' | 'down') => {
    const next = navigationItems.map((item) => {
      if (item.id === parentId && item.subItems) {
        const sorted = [...item.subItems].sort((a, b) => a.order - b.order);
        const index = sorted.findIndex((sub) => sub.id === subItemId);
        if (index === -1) return item;
        if (direction === 'up' && index === 0) return item;
        if (direction === 'down' && index === sorted.length - 1) return item;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const temp = sorted[index];
        sorted[index] = sorted[targetIndex];
        sorted[targetIndex] = temp;

        return {
          ...item,
          subItems: sorted.map((s, idx) => ({ ...s, order: idx })),
        };
      }
      return item;
    });
    try {
      await saveConfigDoc(CONFIG_DOCS.NAVIGATION_ITEMS, next);
      setNavigationItems(next);
    } catch (err) {
      handleMutationError(err, 'সাবমেনু সরানো সম্ভব হয়নি');
    }
  };

  const toggleSubItemVisible = async (parentId: string, subItemId: string) => {
    const next = navigationItems.map((item) => {
      if (item.id === parentId && item.subItems) {
        return {
          ...item,
          subItems: item.subItems.map((sub) =>
            sub.id === subItemId ? { ...sub, visible: !sub.visible } : sub
          ),
        };
      }
      return item;
    });
    try {
      await saveConfigDoc(CONFIG_DOCS.NAVIGATION_ITEMS, next);
      setNavigationItems(next);
    } catch (err) {
      handleMutationError(err, 'সাবমেনু দৃশ্যমানতা পরিবর্তন করা সম্ভব হয়নি');
    }
  };

  // Downloadable Forms Methods
  const addDownloadableForm = async (form: Omit<DownloadableForm, 'id'>) => {
    const id = generateUniqueId('form');
    const newForm: DownloadableForm = { id, ...form };
    const next = [newForm, ...downloadableForms];
    try {
      await saveConfigDoc(CONFIG_DOCS.DOWNLOADABLE_FORMS, next);
      setDownloadableForms(next);
      logActivity(`নতুন ফরম "${form.title}" যুক্ত করা হয়েছে`, 'notice');
    } catch (err) {
      handleMutationError(err, 'নতুন ফরম সংরক্ষণ সম্ভব হয়নি');
    }
  };

  const updateDownloadableForm = async (id: string, updated: Partial<DownloadableForm>) => {
    const next = downloadableForms.map((f) => (f.id === id ? { ...f, ...updated } : f));
    try {
      await saveConfigDoc(CONFIG_DOCS.DOWNLOADABLE_FORMS, next);
      setDownloadableForms(next);
      logActivity('ফরম তথ্য আপডেট করা হয়েছে', 'notice');
    } catch (err) {
      handleMutationError(err, 'ফরম আপডেট করা সম্ভব হয়নি');
    }
  };

  const deleteDownloadableForm = async (id: string) => {
    const next = downloadableForms.filter((f) => f.id !== id);
    try {
      await saveConfigDoc(CONFIG_DOCS.DOWNLOADABLE_FORMS, next);
      setDownloadableForms(next);
      logActivity('ফরম মুছে ফেলা হয়েছে', 'notice');
    } catch (err) {
      handleMutationError(err, 'ফরম মুছে ফেলা সম্ভব হয়নি');
    }
  };

  const toggleFormActive = async (id: string) => {
    const next = downloadableForms.map((f) => (f.id === id ? { ...f, active: !f.active } : f));
    try {
      await saveConfigDoc(CONFIG_DOCS.DOWNLOADABLE_FORMS, next);
      setDownloadableForms(next);
    } catch (err) {
      handleMutationError(err, 'ফরম অবস্থা পরিবর্তন করা সম্ভব হয়নি');
    }
  };

  const updateAdmitCardConfig = async (config: Partial<AdmitCardConfig>) => {
    const next = { ...admitCardConfig, ...config };
    try {
      await saveConfigDoc(CONFIG_DOCS.ADMIT_CARD_CONFIG, next);
      setAdmitCardConfig(next);
      logActivity('প্রবেশপত্র (Admit Card) কনফিগারেশন আপডেট করা হয়েছে', 'setting');
    } catch (err) {
      handleMutationError(err, 'প্রবেশপত্র কনফিগারেশন আপডেট করা সম্ভব হয়নি');
    }
  };

  const addActiveExam = async (exam: Omit<ActiveExam, 'id'>) => {
    const id = generateUniqueId('exam');
    const newExam: ActiveExam = { id, ...exam };
    const available = admitCardConfig.availableExams ? [...admitCardConfig.availableExams] : [];
    const next = {
      ...admitCardConfig,
      examTerm: newExam.isActive ? newExam.examTerm : admitCardConfig.examTerm,
      examYear: newExam.isActive ? newExam.examYear : admitCardConfig.examYear,
      examStartDate: newExam.isActive ? newExam.examStartDate : admitCardConfig.examStartDate,
      activeExamId: newExam.isActive ? id : admitCardConfig.activeExamId,
      availableExams: [newExam, ...available],
    };
    try {
      await saveConfigDoc(CONFIG_DOCS.ADMIT_CARD_CONFIG, next);
      setAdmitCardConfig(next);
      logActivity(`নতুন পরীক্ষা "${exam.examTerm}" প্রবেশপত্র মডিউলে যুক্ত করা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'পরীক্ষা যুক্ত করা সম্ভব হয়নি');
    }
  };

  const updateActiveExam = async (id: string, updated: Partial<ActiveExam>) => {
    const available = admitCardConfig.availableExams ? [...admitCardConfig.availableExams] : [];
    const updatedAvailable = available.map((ex) => (ex.id === id ? { ...ex, ...updated } : ex));
    const activeOne = updatedAvailable.find((ex) => ex.isActive) || updatedAvailable.find((ex) => ex.id === id);
    const next = {
      ...admitCardConfig,
      examTerm: activeOne && activeOne.isActive ? activeOne.examTerm : admitCardConfig.examTerm,
      examYear: activeOne && activeOne.isActive ? activeOne.examYear : admitCardConfig.examYear,
      examStartDate: activeOne && activeOne.isActive ? activeOne.examStartDate : admitCardConfig.examStartDate,
      activeExamId: activeOne && activeOne.isActive ? activeOne.id : admitCardConfig.activeExamId,
      availableExams: updatedAvailable,
    };
    try {
      await saveConfigDoc(CONFIG_DOCS.ADMIT_CARD_CONFIG, next);
      setAdmitCardConfig(next);
      logActivity('পরীক্ষার তথ্য আপডেট করা হয়েছে', 'setting');
    } catch (err) {
      handleMutationError(err, 'পরীক্ষার তথ্য আপডেট করা সম্ভব হয়নি');
    }
  };

  const deleteActiveExam = async (id: string) => {
    const available = (admitCardConfig.availableExams || []).filter((ex) => ex.id !== id);
    const isCurrentActive = admitCardConfig.activeExamId === id;
    const nextActive = isCurrentActive && available.length > 0 ? available[0] : null;
    const next = {
      ...admitCardConfig,
      examTerm: nextActive ? nextActive.examTerm : (available.length === 0 ? '' : admitCardConfig.examTerm),
      examYear: nextActive ? nextActive.examYear : admitCardConfig.examYear,
      examStartDate: nextActive ? nextActive.examStartDate : admitCardConfig.examStartDate,
      activeExamId: nextActive ? nextActive.id : (isCurrentActive ? undefined : admitCardConfig.activeExamId),
      isActive: available.some((e) => e.isActive) ? admitCardConfig.isActive : (available.length > 0 ? admitCardConfig.isActive : false),
      availableExams: available,
    };
    try {
      await saveConfigDoc(CONFIG_DOCS.ADMIT_CARD_CONFIG, next);
      setAdmitCardConfig(next);
      logActivity('পরীক্ষা মুছে ফেলা হয়েছে', 'setting');
    } catch (err) {
      handleMutationError(err, 'পরীক্ষা মুছে ফেলা সম্ভব হয়নি');
    }
  };

  const setActiveExam = async (id: string, activeState?: boolean) => {
    const available = (admitCardConfig.availableExams || []).map((ex) => {
      if (ex.id === id) {
        return {
          ...ex,
          isActive: activeState !== undefined ? activeState : true,
        };
      }
      return ex;
    });
    const chosen = available.find((ex) => ex.id === id);
    if (!chosen) return;
    const next = {
      ...admitCardConfig,
      examTerm: chosen.examTerm,
      examYear: chosen.examYear,
      examStartDate: chosen.examStartDate,
      activeExamId: chosen.id,
      availableExams: available,
    };
    try {
      await saveConfigDoc(CONFIG_DOCS.ADMIT_CARD_CONFIG, next);
      setAdmitCardConfig(next);
      logActivity('পরীক্ষার সক্রিয় অবস্থা পরিবর্তন করা হয়েছে', 'setting');
    } catch (err) {
      handleMutationError(err, 'সক্রিয় অবস্থা পরিবর্তন করা সম্ভব হয়নি');
    }
  };

  const toggleActiveExam = async (id: string) => {
    const available = (admitCardConfig.availableExams || []).map((ex) => {
      if (ex.id === id) {
        return {
          ...ex,
          isActive: !ex.isActive,
        };
      }
      return ex;
    });
    const next = {
      ...admitCardConfig,
      availableExams: available,
    };
    try {
      await saveConfigDoc(CONFIG_DOCS.ADMIT_CARD_CONFIG, next);
      setAdmitCardConfig(next);
      logActivity('পরীক্ষার অবস্থা টগল করা হয়েছে', 'setting');
    } catch (err) {
      handleMutationError(err, 'অবস্থা টগল করা সম্ভব হয়নি');
    }
  };

  // Academic Programs
  const addProgram = async (item: Omit<AcademicProgram, 'id'>) => {
    const id = generateUniqueId('prog');
    const newProg: AcademicProgram = { id, ...item };
    const next = [...academicPrograms, newProg];
    try {
      await saveConfigDoc(CONFIG_DOCS.PROGRAMS, next);
      setAcademicPrograms(next);
      logActivity(`নতুন একাডেমিক প্রোগ্রাম "${item.title}" যুক্ত করা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'প্রোগ্রাম যুক্ত করা সম্ভব হয়নি');
    }
  };

  const updateProgram = async (id: string, item: Partial<AcademicProgram>) => {
    const next = academicPrograms.map((p) => (p.id === id ? { ...p, ...item } : p));
    try {
      await saveConfigDoc(CONFIG_DOCS.PROGRAMS, next);
      setAcademicPrograms(next);
      logActivity(`একাডেমিক প্রোগ্রাম আপডেট করা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'প্রোগ্রাম আপডেট করা সম্ভব হয়নি');
    }
  };

  const deleteProgram = async (id: string) => {
    const next = academicPrograms.filter((p) => p.id !== id);
    try {
      await saveConfigDoc(CONFIG_DOCS.PROGRAMS, next);
      setAcademicPrograms(next);
      logActivity(`একাডেমিক প্রোগ্রাম মুছে ফেলা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'প্রোগ্রাম মুছে ফেলা সম্ভব হয়নি');
    }
  };

  // News CRUD
  const addNews = async (item: Omit<NewsItem, 'id'>) => {
    const id = generateUniqueId('news');
    const newN: NewsItem = { id, ...item };
    try {
      await saveDocument(COLLECTIONS.NEWS, newN);
      setNews((prev) => [newN, ...prev]);
      logActivity(`নতুন সংবাদ "${item.title}" প্রকাশিত হয়েছে`, 'notice');
    } catch (err) {
      handleMutationError(err, 'সংবাদ প্রকাশ করা সম্ভব হয়নি');
    }
  };

  const updateNews = async (id: string, item: Partial<NewsItem>) => {
    const target = news.find((n) => n.id === id);
    if (!target) return;
    const updated = { ...target, ...item };
    try {
      await saveDocument(COLLECTIONS.NEWS, updated);
      setNews((prev) => prev.map((n) => (n.id === id ? updated : n)));
      logActivity(`সংবাদ আপডেট করা হয়েছে`, 'notice');
    } catch (err) {
      handleMutationError(err, 'সংবাদ আপডেট করা সম্ভব হয়নি');
    }
  };

  const deleteNews = async (id: string) => {
    try {
      await deleteDocument(COLLECTIONS.NEWS, id);
      setNews((prev) => prev.filter((n) => n.id !== id));
      logActivity(`সংবাদ মুছে ফেলা হয়েছে`, 'notice');
    } catch (err) {
      handleMutationError(err, 'সংবাদ মুছে ফেলা সম্ভব হয়নি');
    }
  };

  // Events CRUD
  const addEvent = async (item: Omit<EventItem, 'id'>) => {
    const id = generateUniqueId('evt');
    const newE: EventItem = { id, ...item };
    try {
      await saveDocument(COLLECTIONS.EVENTS, newE);
      setEvents((prev) => [...prev, newE]);
      logActivity(`নতুন ইভেন্ট "${item.title}" ক্যালেন্ডারে যুক্ত হয়েছে`, 'event');
    } catch (err) {
      handleMutationError(err, 'ইভেন্ট যোগ করা সম্ভব হয়নি');
    }
  };

  const updateEvent = async (id: string, item: Partial<EventItem>) => {
    const target = events.find((e) => e.id === id);
    if (!target) return;
    const updated = { ...target, ...item };
    try {
      await saveDocument(COLLECTIONS.EVENTS, updated);
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
      logActivity(`ইভেন্টের বিবরণ আপডেট করা হয়েছে`, 'event');
    } catch (err) {
      handleMutationError(err, 'ইভেন্ট আপডেট করা সম্ভব হয়নি');
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await deleteDocument(COLLECTIONS.EVENTS, id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      logActivity(`ইভেন্ট বাতিল/মুছে ফেলা হয়েছে`, 'event');
    } catch (err) {
      handleMutationError(err, 'ইভেন্ট মুছে ফেলা সম্ভব হয়নি');
    }
  };

  // Achievements CRUD
  const addAchievement = async (item: Omit<AchievementItem, 'id'>) => {
    const id = generateUniqueId('ach');
    const newA: AchievementItem = { id, ...item };
    try {
      await saveDocument(COLLECTIONS.ACHIEVEMENTS, newA);
      setAchievements((prev) => [...prev, newA]);
      logActivity(`নতুন অর্জন "${item.title}" সংরক্ষিত হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'অর্জন সংরক্ষণ সম্ভব হয়নি');
    }
  };

  const updateAchievement = async (id: string, item: Partial<AchievementItem>) => {
    const target = achievements.find((a) => a.id === id);
    if (!target) return;
    const updated = { ...target, ...item };
    try {
      await saveDocument(COLLECTIONS.ACHIEVEMENTS, updated);
      setAchievements((prev) => prev.map((a) => (a.id === id ? updated : a)));
      logActivity(`অর্জনের তথ্য আপডেট করা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'অর্জনের তথ্য আপডেট সম্ভব হয়নি');
    }
  };

  const deleteAchievement = async (id: string) => {
    try {
      await deleteDocument(COLLECTIONS.ACHIEVEMENTS, id);
      setAchievements((prev) => prev.filter((a) => a.id !== id));
      logActivity(`অর্জন তালিকা থেকে মুছে ফেলা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'অর্জন মুছে ফেলা সম্ভব হয়নি');
    }
  };

  // Gallery
  const addGalleryAlbum = async (item: Omit<GalleryAlbum, 'id'>) => {
    const id = generateUniqueId('gal');
    const newG: GalleryAlbum = { id, ...item };
    try {
      await saveDocument(COLLECTIONS.GALLERY, newG);
      setGalleryAlbums((prev) => [...prev, newG]);
      logActivity(`নতুন গ্যালারি অ্যালবাম "${item.title}" যোগ করা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'অ্যালবাম যোগ করা সম্ভব হয়নি');
    }
  };

  const updateGalleryAlbum = async (id: string, item: Partial<GalleryAlbum>) => {
    const target = galleryAlbums.find((g) => g.id === id);
    if (!target) return;
    const updated = { ...target, ...item };
    try {
      await saveDocument(COLLECTIONS.GALLERY, updated);
      setGalleryAlbums((prev) => prev.map((g) => (g.id === id ? updated : g)));
      logActivity(`গ্যালারি অ্যালবাম আপডেট করা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'অ্যালবাম আপডেট করা সম্ভব হয়নি');
    }
  };

  const deleteGalleryAlbum = async (id: string) => {
    try {
      await deleteDocument(COLLECTIONS.GALLERY, id);
      setGalleryAlbums((prev) => prev.filter((g) => g.id !== id));
      logActivity(`গ্যালারি অ্যালবাম মুছে ফেলা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'অ্যালবাম মুছে ফেলা সম্ভব হয়নি');
    }
  };

  const addImageToAlbum = async (albumId: string, imageUrl: string) => {
    const target = galleryAlbums.find((alb) => alb.id === albumId);
    if (!target) return;
    const current = target.images || (target.imageUrl ? [target.imageUrl] : []);
    const updatedImgs = [...current, imageUrl];
    const updatedAlb = {
      ...target,
      images: updatedImgs,
      itemCountText: `${updatedImgs.length} টি ছবি`,
    };
    try {
      await saveDocument(COLLECTIONS.GALLERY, updatedAlb);
      setGalleryAlbums((prev) => prev.map((alb) => (alb.id === albumId ? updatedAlb : alb)));
      logActivity(`অ্যালবামে নতুন ছবি যোগ করা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'ছবি যোগ করা সম্ভব হয়নি');
    }
  };

  const addImagesToAlbum = async (albumId: string, imageUrls: string[]) => {
    if (!imageUrls || imageUrls.length === 0) return;
    const target = galleryAlbums.find((alb) => alb.id === albumId);
    if (!target) return;
    const current = target.images || (target.imageUrl ? [target.imageUrl] : []);
    const updatedImgs = [...current, ...imageUrls];
    const updatedAlb = {
      ...target,
      images: updatedImgs,
      itemCountText: `${updatedImgs.length} টি ছবি`,
    };
    try {
      await saveDocument(COLLECTIONS.GALLERY, updatedAlb);
      setGalleryAlbums((prev) => prev.map((alb) => (alb.id === albumId ? updatedAlb : alb)));
      logActivity(`অ্যালবামে ${imageUrls.length}টি নতুন ছবি যোগ করা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'ছবিসমূহ যোগ করা সম্ভব হয়নি');
    }
  };

  const removeImageFromAlbum = async (albumId: string, index: number) => {
    const target = galleryAlbums.find((alb) => alb.id === albumId);
    if (!target) return;
    const current = target.images ? [...target.images] : (target.imageUrl ? [target.imageUrl] : []);
    if (index < 0 || index >= current.length) return;
    const removedUrl = current[index];
    current.splice(index, 1);
    const newCover = target.imageUrl === removedUrl ? (current[0] || '') : target.imageUrl;
    const updatedAlb = {
      ...target,
      imageUrl: newCover,
      images: current,
      itemCountText: `${current.length} টি ছবি`,
    };
    try {
      await saveDocument(COLLECTIONS.GALLERY, updatedAlb);
      setGalleryAlbums((prev) => prev.map((alb) => (alb.id === albumId ? updatedAlb : alb)));
      logActivity(`অ্যালবাম থেকে ছবি মুছে ফেলা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'ছবি মুছে ফেলা সম্ভব হয়নি');
    }
  };

  const setAlbumCoverImage = async (albumId: string, imageUrl: string) => {
    const target = galleryAlbums.find((alb) => alb.id === albumId);
    if (!target) return;
    const current = target.images ? [...target.images] : (target.imageUrl ? [target.imageUrl] : []);
    if (!current.includes(imageUrl)) {
      current.unshift(imageUrl);
    }
    const updatedAlb = {
      ...target,
      imageUrl,
      images: current,
      itemCountText: `${current.length} টি ছবি`,
    };
    try {
      await saveDocument(COLLECTIONS.GALLERY, updatedAlb);
      setGalleryAlbums((prev) => prev.map((alb) => (alb.id === albumId ? updatedAlb : alb)));
      logActivity(`অ্যালবামের কভার ছবি পরিবর্তন করা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'কভার ছবি পরিবর্তন করা সম্ভব হয়নি');
    }
  };

  // Admissions
  const submitAdmission = (application: Omit<AdmissionApplication, 'id' | 'appliedDate' | 'status'>): AdmissionApplication => {
    const id = generateUniqueId('adm');
    const dateStr = new Date().toISOString().split('T')[0];
    const newApp: AdmissionApplication = {
      id,
      ...application,
      appliedDate: dateStr,
      status: 'অপেক্ষমাণ',
    };
    saveDocument(COLLECTIONS.ADMISSIONS, newApp)
      .then(() => {
        setAdmissions((prev) => [newApp, ...prev]);
        logActivity(`নতুন ভর্তি আবেদন জমা হয়েছে: "${newApp.applicantName}" (${newApp.applyingClass})`, 'admission');
      })
      .catch((err) => {
        handleMutationError(err, 'ভর্তি আবেদন জমা দিতে সমস্যা হয়েছে');
      });
    return newApp;
  };

  const updateAdmissionStatus = async (id: string, status: AdmissionApplication['status']) => {
    const target = admissions.find((a) => a.id === id);
    if (!target) return;
    const updated = { ...target, status };
    try {
      await saveDocument(COLLECTIONS.ADMISSIONS, updated);
      setAdmissions((prev) => prev.map((a) => (a.id === id ? updated : a)));
      logActivity(`ভর্তি আবেদনের স্ট্যাটাস পরিবর্তন: ${status}`, 'admission');
    } catch (err) {
      handleMutationError(err, 'স্ট্যাটাস আপডেট করা সম্ভব হয়নি');
    }
  };

  const deleteAdmission = async (id: string) => {
    try {
      await deleteDocument(COLLECTIONS.ADMISSIONS, id);
      setAdmissions((prev) => prev.filter((a) => a.id !== id));
      logActivity(`ভর্তি আবেদন তালিকা থেকে সরানো হয়েছে`, 'admission');
    } catch (err) {
      handleMutationError(err, 'ভর্তি আবেদন মুছতে সমস্যা হয়েছে');
    }
  };

  // Exam Results
  const addExamResult = async (result: Omit<ExamResult, 'id'>) => {
    const newResult: ExamResult = {
      ...result,
      id: generateUniqueId('res'),
    };
    try {
      await saveDocument(COLLECTIONS.EXAM_RESULTS, newResult);
      setExamResults((prev) => [newResult, ...prev]);
      logActivity(`নতুন পরীক্ষার ফলাফল যুক্ত করা হয়েছে: ${newResult.studentName}`, 'setting');
    } catch (err) {
      handleMutationError(err, 'পরীক্ষার ফলাফল সংরক্ষণ করা সম্ভব হয়নি');
    }
  };

  const updateExamResult = async (id: string, updated: Partial<ExamResult>) => {
    const target = examResults.find((r) => r.id === id);
    if (!target) return;
    const updatedRes = { ...target, ...updated };
    try {
      await saveDocument(COLLECTIONS.EXAM_RESULTS, updatedRes);
      setExamResults((prev) => prev.map((r) => (r.id === id ? updatedRes : r)));
      logActivity(`পরীক্ষার ফলাফল আপডেট করা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'ফলাফল আপডেট করা সম্ভব হয়নি');
    }
  };

  const deleteExamResult = async (id: string) => {
    try {
      await deleteDocument(COLLECTIONS.EXAM_RESULTS, id);
      setExamResults((prev) => prev.filter((r) => r.id !== id));
      logActivity(`পরীক্ষার ফলাফল মুছে ফেলা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'ফলাফল মুছতে সমস্যা হয়েছে');
    }
  };

  // Messages
  const submitContactMessage = async (msg: Omit<ContactMessage, 'id' | 'date' | 'read'>) => {
    const id = generateUniqueId('msg');
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newMsg: ContactMessage = {
      id,
      ...msg,
      date: dateStr,
      read: false,
    };
    try {
      await saveDocument(COLLECTIONS.MESSAGES, newMsg);
      setMessages((prev) => [newMsg, ...prev]);
      logActivity(`ওয়েবসাইট থেকে বার্তা পেয়েছেন: ${newMsg.name}`, 'message');
    } catch (err) {
      handleMutationError(err, 'বার্তা পাঠাতে সমস্যা হয়েছে');
    }
  };

  const markMessageRead = async (id: string, read: boolean) => {
    const target = messages.find((m) => m.id === id);
    if (!target) return;
    const updated = { ...target, read };
    try {
      await saveDocument(COLLECTIONS.MESSAGES, updated);
      setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch (err) {
      handleMutationError(err, 'বার্তা স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি');
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      await deleteDocument(COLLECTIONS.MESSAGES, id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      logActivity(`বার্তা মুছে ফেলা হয়েছে`, 'message');
    } catch (err) {
      handleMutationError(err, 'বার্তা মুছতে সমস্যা হয়েছে');
    }
  };

  // Performance Trends Methods
  const addPerformanceTrend = async (trend: Omit<PerformanceTrendItem, 'id'>) => {
    const newItem: PerformanceTrendItem = {
      ...trend,
      id: generateUniqueId('trend'),
    };
    const next = [...performanceTrends, newItem].sort((a, b) => a.year.localeCompare(b.year));
    try {
      await saveConfigDoc(CONFIG_DOCS.PERFORMANCE_TRENDS, next);
      setPerformanceTrends(next);
      logActivity(`নতুন পারফরম্যান্স চার্ট ডাটা যোগ করা হয়েছে (${trend.year})`, 'setting');
    } catch (err) {
      handleMutationError(err, 'চার্ট ডাটা যোগ করা সম্ভব হয়নি');
    }
  };

  const updatePerformanceTrend = async (id: string, updated: Partial<PerformanceTrendItem>) => {
    const next = performanceTrends
      .map((t) => (t.id === id ? { ...t, ...updated } : t))
      .sort((a, b) => a.year.localeCompare(b.year));
    try {
      await saveConfigDoc(CONFIG_DOCS.PERFORMANCE_TRENDS, next);
      setPerformanceTrends(next);
      logActivity(`পারফরম্যান্স চার্ট ডাটা আপডেট করা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'চার্ট ডাটা আপডেট করা সম্ভব হয়নি');
    }
  };

  const deletePerformanceTrend = async (id: string) => {
    const next = performanceTrends.filter((t) => t.id !== id);
    try {
      await saveConfigDoc(CONFIG_DOCS.PERFORMANCE_TRENDS, next);
      setPerformanceTrends(next);
      logActivity(`পারফরম্যান্স চার্ট ডাটা মুছে ফেলা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'চার্ট ডাটা মুছে ফেলা সম্ভব হয়নি');
    }
  };

  const resetPerformanceTrends = async () => {
    try {
      await saveConfigDoc(CONFIG_DOCS.PERFORMANCE_TRENDS, initialPerformanceTrends);
      setPerformanceTrends(initialPerformanceTrends);
      logActivity(`পারফরম্যান্স চার্ট ডাটা ডিফল্ট অবস্থায় রিসেট করা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'চার্ট ডাটা রিসেট করা সম্ভব হয়নি');
    }
  };

  // Section Visibility Methods
  const toggleSectionVisibility = async (sectionKey: keyof SectionVisibility) => {
    const next = {
      ...sectionVisibility,
      [sectionKey]: !sectionVisibility[sectionKey],
    };
    try {
      await saveConfigDoc(CONFIG_DOCS.SECTION_VISIBILITY, next);
      setSectionVisibility(next);
      logActivity(`হোমপেজ সেকশন শো/হাইড পরিবর্তিত হয়েছে (${sectionKey})`, 'setting');
    } catch (err) {
      handleMutationError(err, 'সেকশন দৃশ্যমানতা পরিবর্তন করা সম্ভব হয়নি');
    }
  };

  const updateSectionVisibility = async (updates: Partial<SectionVisibility>) => {
    const next = {
      ...sectionVisibility,
      ...updates,
    };
    try {
      await saveConfigDoc(CONFIG_DOCS.SECTION_VISIBILITY, next);
      setSectionVisibility(next);
    } catch (err) {
      handleMutationError(err, 'সেকশন আপডেট করা সম্ভব হয়নি');
    }
  };

  const resetSectionVisibility = async () => {
    try {
      await saveConfigDoc(CONFIG_DOCS.SECTION_VISIBILITY, initialSectionVisibility);
      setSectionVisibility(initialSectionVisibility);
      logActivity(`হোমপেজ সেকশনসমূহ ডিফল্ট অবস্থায় রিসেট করা হয়েছে`, 'setting');
    } catch (err) {
      handleMutationError(err, 'সেকশন রিসেট করা সম্ভব হয়নি');
    }
  };

  const unreadMessageCount = messages.filter((m) => !m.read).length;
  const totalGalleryPhotos = galleryAlbums.reduce(
    (acc, alb) => acc + (alb.images ? alb.images.length : 1),
    0
  );

  return (
    <SchoolContext.Provider
      value={{
        viewMode,
        setViewMode,
        adminTab,
        setAdminTab,
        isAdmissionModalOpen,
        setIsAdmissionModalOpen,
        currentFrontendPage,
        setCurrentFrontendPage,
        siteSettings,
        updateSiteSettings,
        teachers,
        addTeacher,
        addMultipleTeachers,
        updateTeacher,
        deleteTeacher,
        staff,
        addStaff,
        addMultipleStaff,
        updateStaff,
        deleteStaff,
        students,
        deletedStudents,
        addStudent,
        addMultipleStudents,
        updateStudent,
        deleteStudent,
        deleteMultipleStudents,
        removeDuplicateStudents,
        restoreStudent,
        permanentlyDeleteStudent,
        emptyDeletedStudents,
        notices,
        addNotice,
        updateNotice,
        deleteNotice,
        deleteMultipleNotices,
        togglePinNotice,
        leadership,
        updateLeadership,
        heroSlides,
        addHeroSlide,
        updateHeroSlide,
        deleteHeroSlide,
        toggleHeroSlideActive,
        navigationItems,
        addNavigationItem,
        updateNavigationItem,
        deleteNavigationItem,
        toggleNavigationItemVisible,
        moveNavigationItem,
        reorderNavigationItems,
        resetNavigationItems,
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
        academicPrograms,
        addProgram,
        updateProgram,
        deleteProgram,
        news,
        addNews,
        updateNews,
        deleteNews,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        achievements,
        addAchievement,
        updateAchievement,
        deleteAchievement,
        galleryAlbums,
        addGalleryAlbum,
        updateGalleryAlbum,
        deleteGalleryAlbum,
        addImageToAlbum,
        addImagesToAlbum,
        removeImageFromAlbum,
        setAlbumCoverImage,
        admissions,
        submitAdmission,
        updateAdmissionStatus,
        deleteAdmission,
        examResults,
        addExamResult,
        updateExamResult,
        deleteExamResult,
        messages,
        submitContactMessage,
        markMessageRead,
        deleteMessage,
        activities,
        logActivity,
        clearActivities,
        performanceTrends,
        addPerformanceTrend,
        updatePerformanceTrend,
        deletePerformanceTrend,
        resetPerformanceTrends,
        sectionVisibility,
        toggleSectionVisibility,
        updateSectionVisibility,
        resetSectionVisibility,
        unreadMessageCount,
        totalGalleryPhotos,
        adminSecuritySettings,
        updateAdminSecuritySettings,
        adminUser,
        isAdminAuthenticated,
        loginAdmin,
        loginWithGoogle,
        logoutAdmin,
        isFirestoreLoading,
        firestoreError,
        clearFirestoreError,
        loadDataFromFirestore,
        seedDemoDataToFirestore,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
