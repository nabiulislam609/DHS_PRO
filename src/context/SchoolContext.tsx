import React, { createContext, useContext, useState, useEffect } from 'react';
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
} from '../data/initialData';

export type ViewMode = 'frontend' | 'backend';
export type AdminTab =
  | 'dashboard'
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
  | 'downloads';

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

  // Data states
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;

  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  staff: Staff[];
  addStaff: (staffMember: Omit<Staff, 'id'>) => void;
  updateStaff: (id: string, staffMember: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;

  students: Student[];
  deletedStudents: Student[];
  addStudent: (student: Omit<Student, 'id'> & { id?: string }) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string, roll?: string) => void;
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
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('frontend');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);

  const [currentFrontendPage, setCurrentFrontendPageState] = useState<FrontendPage>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.search.includes('page=results') || window.location.hash === '#results-page') {
        return 'results';
      }
      if (window.location.search.includes('page=notices') || window.location.hash === '#notices-page') {
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
      } else {
        window.history.pushState({}, '', window.location.pathname || '/');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.search.includes('page=results') || window.location.hash === '#results-page') {
        setCurrentFrontendPageState('results');
      } else if (window.location.search.includes('page=notices') || window.location.hash === '#notices-page') {
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
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Load from localStorage or fallback to initial
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('dhs_site_settings');
    return saved ? JSON.parse(saved) : initialSiteSettings;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('dhs_teachers');
    return saved ? JSON.parse(saved) : initialTeachers;
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('dhs_staff');
    return saved ? JSON.parse(saved) : initialStaff;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('dhs_students');
    if (saved) {
      try {
        const parsed: Student[] = JSON.parse(saved);
        const normalized = parsed.map((s) => {
          const updated = { ...s };
          if (!updated.image) {
            const initMatch = initialStudents.find(
              (init) =>
                init.id === updated.id ||
                init.roll === updated.roll ||
                init.name.toLowerCase() === updated.name.toLowerCase()
            );
            if (initMatch && initMatch.image) {
              updated.image = initMatch.image;
            }
          }
          return updated;
        });
        const existingIds = new Set(normalized.map((s) => s.id));
        const missing = initialStudents.filter((s) => !existingIds.has(s.id));
        return [...normalized, ...missing];
      } catch {
        return initialStudents;
      }
    }
    return initialStudents;
  });

  const [deletedStudents, setDeletedStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('dhs_deleted_students');
    return saved ? JSON.parse(saved) : [];
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem('dhs_notices');
    return saved ? JSON.parse(saved) : initialNotices;
  });

  const [leadership, setLeadership] = useState<LeadershipMessage[]>(() => {
    const saved = localStorage.getItem('dhs_leadership');
    return saved ? JSON.parse(saved) : initialLeadership;
  });

  const [academicPrograms, setAcademicPrograms] = useState<AcademicProgram[]>(() => {
    const saved = localStorage.getItem('dhs_programs');
    return saved ? JSON.parse(saved) : initialAcademicPrograms;
  });

  const [news, setNews] = useState<NewsItem[]>(() => {
    const saved = localStorage.getItem('dhs_news');
    return saved ? JSON.parse(saved) : initialNews;
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('dhs_events');
    return saved ? JSON.parse(saved) : initialEvents;
  });

  const [achievements, setAchievements] = useState<AchievementItem[]>(() => {
    const saved = localStorage.getItem('dhs_achievements');
    return saved ? JSON.parse(saved) : initialAchievements;
  });

  const [galleryAlbums, setGalleryAlbums] = useState<GalleryAlbum[]>(() => {
    const saved = localStorage.getItem('dhs_gallery');
    return saved ? JSON.parse(saved) : initialGalleryAlbums;
  });

  const [admissions, setAdmissions] = useState<AdmissionApplication[]>(() => {
    const saved = localStorage.getItem('dhs_admissions');
    return saved ? JSON.parse(saved) : initialAdmissions;
  });

  const [messages, setMessages] = useState<ContactMessage[]>(() => {
    const saved = localStorage.getItem('dhs_messages');
    return saved ? JSON.parse(saved) : initialMessages;
  });

  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('dhs_activities');
    if (saved) {
      try {
        const parsed: ActivityLog[] = JSON.parse(saved);
        const seenIds = new Set<string>();
        return parsed.map((act, idx) => {
          let uniqueId = act.id || `act-${Date.now()}-${idx}`;
          if (seenIds.has(uniqueId)) {
            uniqueId = `${uniqueId}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
          }
          seenIds.add(uniqueId);
          return { ...act, id: uniqueId };
        });
      } catch (e) {
        console.error('Failed to parse activities from localStorage', e);
      }
    }
    return initialActivities;
  });

  const [examResults, setExamResults] = useState<ExamResult[]>(() => {
    const saved = localStorage.getItem('dhs_exam_results');
    if (saved) {
      try {
        const parsed: ExamResult[] = JSON.parse(saved);
        const normalized = parsed.map((r) => {
          const updated = { ...r };
          if (updated.studentClass === 'Class 10 (১০ম শ্রেণি - বিজ্ঞান)') {
            updated.studentClass = '১০ম শ্রেণি (বিজ্ঞান বিভাগ)';
          }
          if (!updated.studentImage) {
            const initMatch = initialExamResults.find((init) => init.id === updated.id);
            if (initMatch && initMatch.studentImage) {
              updated.studentImage = initMatch.studentImage;
            }
          }
          return updated;
        });
        const existingIds = new Set(normalized.map((r) => r.id));
        const missing = initialExamResults.filter((r) => !existingIds.has(r.id));
        return [...normalized, ...missing];
      } catch {
        return initialExamResults;
      }
    }
    return initialExamResults;
  });

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => {
    const saved = localStorage.getItem('dhs_hero_slides');
    return saved ? JSON.parse(saved) : initialHeroSlides;
  });

  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrendItem[]>(() => {
    const saved = localStorage.getItem('dhs_performance_trends');
    return saved ? JSON.parse(saved) : initialPerformanceTrends;
  });

  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>(() => {
    const saved = localStorage.getItem('dhs_section_visibility');
    return saved ? { ...initialSectionVisibility, ...JSON.parse(saved) } : initialSectionVisibility;
  });

  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(() => {
    const saved = localStorage.getItem('dhs_navigation_items');
    if (saved) {
      try {
        const parsed: NavigationItem[] = JSON.parse(saved);
        // Exclude standalone শিক্ষক and কর্মকর্তা ও কর্মচারী since they belong inside the 'পরিচিতি' submenu
        let filtered = parsed.filter(
          (item) =>
            item.url !== '#teachers' &&
            item.url !== '#staff' &&
            item.label !== 'শিক্ষক' &&
            !item.label.includes('কর্মচারী')
        );

        // Ensure ফলাফল is placed right after নোটিশ
        const resultsIdx = filtered.findIndex((item) => item.label === 'ফলাফল' || item.url === '/results' || item.url === '#results');
        let resultsItem: NavigationItem;
        if (resultsIdx !== -1) {
          resultsItem = filtered[resultsIdx];
          filtered.splice(resultsIdx, 1);
        } else {
          resultsItem = {
            id: 'nav-results',
            label: 'ফলাফল',
            url: '/results',
            iconName: '—',
            order: 3,
            visible: true,
          };
        }

        const noticeIdx = filtered.findIndex((item) => item.label === 'নোটিশ' || item.url === '#notices');
        if (noticeIdx !== -1) {
          filtered.splice(noticeIdx + 1, 0, resultsItem);
        } else {
          filtered.push(resultsItem);
        }

        // Ensure ডাউনলোড (Downloads) menu is present with its submenus (Admit Card, Important Forms)
        const defaultDownloadItem: NavigationItem = {
          id: 'nav-downloads',
          label: 'ডাউনলোড',
          url: '#downloads',
          iconName: 'Download',
          order: 4,
          visible: true,
          subItems: [
            {
              id: 'sub-admit',
              label: 'অ্যাডমিট কার্ড',
              url: '/admit-card',
              order: 0,
              visible: true,
              description: 'পরীক্ষার প্রবেশপত্র ও সিট প্ল্যান ডাউনলোড',
              badge: 'Admit Card',
              iconName: 'CreditCard',
            },
            {
              id: 'sub-forms',
              label: 'গুরুত্বপূর্ণ ফরমসমূহ',
              url: '/important-forms',
              order: 1,
              visible: true,
              description: 'ভর্তি ফরম, প্রশংসাপত্র, প্রত্যয়ন ও প্রাতিষ্ঠানিক ফরম',
              badge: 'Forms',
              iconName: 'FileText',
            },
          ],
        };

        const downloadIdx = filtered.findIndex(
          (item) => item.id === 'nav-downloads' || item.label === 'ডাউনলোড' || item.url === '#downloads'
        );
        if (downloadIdx === -1) {
          const resPos = filtered.findIndex((item) => item.label === 'ফলাফল' || item.url === '/results');
          if (resPos !== -1) {
            filtered.splice(resPos + 1, 0, defaultDownloadItem);
          } else {
            filtered.push(defaultDownloadItem);
          }
        } else {
          // If existing downloads item has no subItems, backfill default subItems
          if (!filtered[downloadIdx].subItems || filtered[downloadIdx].subItems.length === 0) {
            filtered[downloadIdx] = {
              ...filtered[downloadIdx],
              subItems: defaultDownloadItem.subItems,
            };
          }
        }

        return filtered.map((item, idx) => ({ ...item, order: idx }));
      } catch (e) {
        return initialNavigationItems;
      }
    }
    return initialNavigationItems;
  });

  // Downloadable Forms State
  const [downloadableForms, setDownloadableForms] = useState<DownloadableForm[]>(() => {
    const saved = localStorage.getItem('dhs_downloadable_forms');
    return saved ? JSON.parse(saved) : initialDownloadableForms;
  });

  // Admit Card Config State
  const [admitCardConfig, setAdmitCardConfig] = useState<AdmitCardConfig>(() => {
    const saved = localStorage.getItem('dhs_admit_card_config');
    return saved ? JSON.parse(saved) : initialAdmitCardConfig;
  });

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('dhs_downloadable_forms', JSON.stringify(downloadableForms));
  }, [downloadableForms]);

  useEffect(() => {
    localStorage.setItem('dhs_admit_card_config', JSON.stringify(admitCardConfig));
  }, [admitCardConfig]);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('dhs_hero_slides', JSON.stringify(heroSlides));
  }, [heroSlides]);

  useEffect(() => {
    localStorage.setItem('dhs_performance_trends', JSON.stringify(performanceTrends));
  }, [performanceTrends]);

  useEffect(() => {
    localStorage.setItem('dhs_section_visibility', JSON.stringify(sectionVisibility));
  }, [sectionVisibility]);

  useEffect(() => {
    localStorage.setItem('dhs_navigation_items', JSON.stringify(navigationItems));
  }, [navigationItems]);

  useEffect(() => {
    localStorage.setItem('dhs_exam_results', JSON.stringify(examResults));
  }, [examResults]);

  useEffect(() => {
    localStorage.setItem('dhs_site_settings', JSON.stringify(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    localStorage.setItem('dhs_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('dhs_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('dhs_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('dhs_deleted_students', JSON.stringify(deletedStudents));
  }, [deletedStudents]);

  useEffect(() => {
    localStorage.setItem('dhs_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('dhs_leadership', JSON.stringify(leadership));
  }, [leadership]);

  useEffect(() => {
    localStorage.setItem('dhs_programs', JSON.stringify(academicPrograms));
  }, [academicPrograms]);

  useEffect(() => {
    localStorage.setItem('dhs_news', JSON.stringify(news));
  }, [news]);

  useEffect(() => {
    localStorage.setItem('dhs_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('dhs_achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('dhs_gallery', JSON.stringify(galleryAlbums));
  }, [galleryAlbums]);

  useEffect(() => {
    localStorage.setItem('dhs_admissions', JSON.stringify(admissions));
  }, [admissions]);

  useEffect(() => {
    localStorage.setItem('dhs_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('dhs_activities', JSON.stringify(activities));
  }, [activities]);

  const generateUniqueId = (prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  };

  const logActivity = (action: string, type: ActivityLog['type']) => {
    const newAct: ActivityLog = {
      id: generateUniqueId('act'),
      action,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      type,
    };
    setActivities((prev) => [newAct, ...prev.slice(0, 49)]);
  };

  const clearActivities = () => {
    setActivities([]);
  };

  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    setSiteSettings((prev) => ({ ...prev, ...settings }));
    logActivity('ওয়েবসাইটের সাধারণ সেটিংস আপডেট করা হয়েছে', 'setting');
  };

  // Teachers CRUD
  const addTeacher = (item: Omit<Teacher, 'id'>) => {
    const id = generateUniqueId('t');
    const newT: Teacher = { id, ...item };
    setTeachers((prev) => [...prev, newT]);
    logActivity(`নতুন শিক্ষক "${newT.name}" যোগ করা হয়েছে`, 'teacher');
  };

  const updateTeacher = (id: string, item: Partial<Teacher>) => {
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...item } : t)));
    logActivity(`শিক্ষকের তথ্য আপডেট করা হয়েছে`, 'teacher');
  };

  const deleteTeacher = (id: string) => {
    const target = teachers.find((t) => t.id === id);
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    logActivity(`শিক্ষক "${target?.name || ''}" মুছে ফেলা হয়েছে`, 'teacher');
  };

  // Staff CRUD
  const addStaff = (item: Omit<Staff, 'id'>) => {
    const id = generateUniqueId('s');
    const newS: Staff = { id, ...item };
    setStaff((prev) => [...prev, newS]);
    logActivity(`নতুন কর্মচারী "${newS.name}" যোগ করা হয়েছে`, 'setting');
  };

  const updateStaff = (id: string, item: Partial<Staff>) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...item } : s)));
    logActivity(`কর্মচারীর তথ্য আপডেট করা হয়েছে`, 'setting');
  };

  const deleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    logActivity(`কর্মচারী মুছে ফেলা হয়েছে`, 'setting');
  };

  // Students CRUD
  const addStudent = (item: Omit<Student, 'id'> & { id?: string }) => {
    const id = (item.id && item.id.trim()) ? item.id.trim() : generateUniqueId('stu');
    const newStu: Student = { ...item, id };
    setStudents((prev) => [...prev, newStu]);
    logActivity(`শিক্ষার্থী "${newStu.name}" (আইডি: ${id}, রোল: ${newStu.roll}) তালিকাভুক্ত করা হয়েছে`, 'setting');
  };

  const updateStudent = (id: string, item: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...item } : s)));
    logActivity(`শিক্ষার্থীর তথ্য আপডেট করা হয়েছে`, 'setting');
  };

  const deleteStudent = (id: string, roll?: string) => {
    setStudents((prev) => {
      let target = prev.find((s) => s.id === id);
      if (!target && roll) {
        target = prev.find((s) => s.roll === roll);
      }
      if (target) {
        setDeletedStudents((del) => [target!, ...del.filter((d) => d.id !== target!.id)]);
      }
      let filtered = prev.filter((s) => s.id && s.id === id ? false : s.id !== id);
      // Fallback: If nothing was removed (e.g. mismatched/missing ID) and roll is provided, match by roll
      if (filtered.length === prev.length && roll) {
        filtered = prev.filter((s) => s.roll !== roll);
      }
      return filtered;
    });
    logActivity(`শিক্ষার্থীর তথ্য মুছে ফেলা হয়েছে (রিসাইকেল বিনে সংরক্ষিত)`, 'setting');
  };

  const deleteMultipleStudents = (ids: string[]) => {
    const idSet = new Set(ids);
    setStudents((prev) => {
      const toDelete = prev.filter((s) => idSet.has(s.id));
      if (toDelete.length > 0) {
        setDeletedStudents((del) => [...toDelete, ...del.filter((d) => !idSet.has(d.id))]);
      }
      return prev.filter((s) => !idSet.has(s.id));
    });
    logActivity(`${ids.length} জন শিক্ষার্থীর তথ্য মুছে ফেলা হয়েছে (রিসাইকেল বিনে সংরক্ষিত)`, 'setting');
  };

  const restoreStudent = (id: string) => {
    const target = deletedStudents.find((s) => s.id === id);
    if (!target) return;
    setDeletedStudents((prev) => prev.filter((s) => s.id !== id));
    setStudents((prev) => {
      if (prev.some((s) => s.id === target.id)) return prev;
      return [...prev, target];
    });
    logActivity(`মুছে ফেলা শিক্ষার্থী "${target.name}" সফলভাবে পুনরুদ্ধার করা হয়েছে`, 'setting');
  };

  const permanentlyDeleteStudent = (id: string) => {
    setDeletedStudents((prev) => prev.filter((s) => s.id !== id));
    logActivity('শিক্ষার্থীর তথ্য স্থায়ীভাবে সম্পূর্ণ মুছে ফেলা হয়েছে', 'setting');
  };

  const emptyDeletedStudents = () => {
    setDeletedStudents([]);
    logActivity('রিসাইকেল বিনের সকল শিক্ষার্থী স্থায়ীভাবে মুছে ফেলা হয়েছে', 'setting');
  };

  const removeDuplicateStudents = (): number => {
    let removed = 0;
    setStudents((prev) => {
      const seen = new Set<string>();
      const result: Student[] = [];
      for (const s of prev) {
        // Unique key based on name + class + phone
        const key = `${s.name.trim().toLowerCase()}__${(s.class || s.studentClass || '').trim()}__${(s.phone || s.guardianPhone || '').replace(/\D/g, '')}`;
        if (seen.has(key)) {
          removed++;
        } else {
          seen.add(key);
          result.push(s);
        }
      }
      return result;
    });
    if (removed > 0) {
      logActivity(`${removed}টি ডুপ্লিকেট শিক্ষার্থী মুছে ফেলা হয়েছে`, 'setting');
    }
    return removed;
  };

  // Notices CRUD
  const addNotice = (item: Omit<Notice, 'id'>) => {
    const id = generateUniqueId('not');
    const newN: Notice = { id, ...item };
    setNotices((prev) => [newN, ...prev]);
    logActivity(`নতুন নোটিশ "${newN.title}" প্রকাশ করা হয়েছে`, 'notice');
  };

  const updateNotice = (id: string, item: Partial<Notice>) => {
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, ...item } : n)));
    logActivity(`নোটিশ আপডেট করা হয়েছে`, 'notice');
  };

  const deleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    logActivity(`একটি নোটিশ মুছে ফেলা হয়েছে`, 'notice');
  };

  const deleteMultipleNotices = (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const idSet = new Set(ids);
    setNotices((prev) => prev.filter((n) => !idSet.has(n.id)));
    logActivity(`${ids.length}টি নোটিশ মুছে ফেলা হয়েছে`, 'notice');
  };

  const togglePinNotice = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  // Leadership
  const updateLeadership = (id: string, updated: Partial<LeadershipMessage>) => {
    setLeadership((prev) => prev.map((l) => (l.id === id ? { ...l, ...updated } : l)));
    logActivity('নেতৃত্বের বার্তা হালনাগাদ করা হয়েছে', 'setting');
  };

  // Hero Slides
  const addHeroSlide = (slide: Omit<HeroSlide, 'id'>) => {
    const id = generateUniqueId('slide');
    setHeroSlides((prev) => [...prev, { id, ...slide }]);
    logActivity(`নতুন হিরো স্লাইড "${slide.title}" যোগ করা হয়েছে`, 'setting');
  };

  const updateHeroSlide = (id: string, slide: Partial<HeroSlide>) => {
    setHeroSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...slide } : s)));
    logActivity('হিরো স্লাইড আপডেট করা হয়েছে', 'setting');
  };

  const deleteHeroSlide = (id: string) => {
    setHeroSlides((prev) => prev.filter((s) => s.id !== id));
    logActivity('হিরো স্লাইড মুছে ফেলা হয়েছে', 'setting');
  };

  const toggleHeroSlideActive = (id: string) => {
    setHeroSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  // Navigation Items
  const addNavigationItem = (item: Omit<NavigationItem, 'id'>) => {
    const id = generateUniqueId('nav');
    setNavigationItems((prev) => [...prev, { id, ...item }]);
    logActivity(`নতুন মেনু আইটেম "${item.label}" যুক্ত করা হয়েছে`, 'setting');
  };

  const updateNavigationItem = (id: string, item: Partial<NavigationItem>) => {
    setNavigationItems((prev) => prev.map((n) => (n.id === id ? { ...n, ...item } : n)));
    logActivity('নেভিগেশন মেনু আইটেম আপডেট করা হয়েছে', 'setting');
  };

  const deleteNavigationItem = (id: string) => {
    setNavigationItems((prev) => prev.filter((n) => n.id !== id));
    logActivity('নেভিগেশন মেনু আইটেম মুছে ফেলা হয়েছে', 'setting');
  };

  const toggleNavigationItemVisible = (id: string) => {
    setNavigationItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, visible: !n.visible } : n))
    );
  };

  const moveNavigationItem = (id: string, direction: 'up' | 'down') => {
    setNavigationItems((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((item) => item.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === sorted.length - 1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = sorted[index];
      sorted[index] = sorted[targetIndex];
      sorted[targetIndex] = temp;

      return sorted.map((item, idx) => ({ ...item, order: idx }));
    });
    logActivity('নেভিগেশন মেনুর ক্রম পরিবর্তন করা হয়েছে', 'setting');
  };

  const reorderNavigationItems = (items: NavigationItem[]) => {
    const updated = items.map((item, idx) => ({ ...item, order: idx }));
    setNavigationItems(updated);
    logActivity('নেভিগেশন মেনুর সামগ্রিক বিন্যাস আপডেট করা হয়েছে', 'setting');
  };

  const resetNavigationItems = () => {
    setNavigationItems(initialNavigationItems);
    logActivity('নেভিগেশন মেনু ডিফল্ট বিন্যাসে রিসেট করা হয়েছে', 'setting');
  };

  // Submenu Management Functions
  const addSubItem = (parentId: string, subItem: Omit<NavigationSubItem, 'id'>) => {
    const id = generateUniqueId('sub');
    setNavigationItems((prev) =>
      prev.map((item) => {
        if (item.id === parentId) {
          const subItems = item.subItems ? [...item.subItems] : [];
          return {
            ...item,
            subItems: [...subItems, { id, ...subItem }],
          };
        }
        return item;
      })
    );
    logActivity(`সাবমেনু "${subItem.label}" যোগ করা হয়েছে`, 'setting');
  };

  const updateSubItem = (parentId: string, subItemId: string, updated: Partial<NavigationSubItem>) => {
    setNavigationItems((prev) =>
      prev.map((item) => {
        if (item.id === parentId && item.subItems) {
          return {
            ...item,
            subItems: item.subItems.map((sub) => (sub.id === subItemId ? { ...sub, ...updated } : sub)),
          };
        }
        return item;
      })
    );
    logActivity('সাবমেনু আপডেট করা হয়েছে', 'setting');
  };

  const deleteSubItem = (parentId: string, subItemId: string) => {
    setNavigationItems((prev) =>
      prev.map((item) => {
        if (item.id === parentId && item.subItems) {
          return {
            ...item,
            subItems: item.subItems.filter((sub) => sub.id !== subItemId),
          };
        }
        return item;
      })
    );
    logActivity('সাবমেনু মুছে ফেলা হয়েছে', 'setting');
  };

  const moveSubItem = (parentId: string, subItemId: string, direction: 'up' | 'down') => {
    setNavigationItems((prev) =>
      prev.map((item) => {
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
      })
    );
  };

  const toggleSubItemVisible = (parentId: string, subItemId: string) => {
    setNavigationItems((prev) =>
      prev.map((item) => {
        if (item.id === parentId && item.subItems) {
          return {
            ...item,
            subItems: item.subItems.map((sub) =>
              sub.id === subItemId ? { ...sub, visible: !sub.visible } : sub
            ),
          };
        }
        return item;
      })
    );
  };

  // Downloadable Forms Methods
  const addDownloadableForm = (form: Omit<DownloadableForm, 'id'>) => {
    const id = generateUniqueId('form');
    setDownloadableForms((prev) => [{ id, ...form }, ...prev]);
    logActivity(`নতুন ফরম "${form.title}" যুক্ত করা হয়েছে`, 'notice');
  };

  const updateDownloadableForm = (id: string, updated: Partial<DownloadableForm>) => {
    setDownloadableForms((prev) => prev.map((f) => (f.id === id ? { ...f, ...updated } : f)));
    logActivity('ফরম তথ্য আপডেট করা হয়েছে', 'notice');
  };

  const deleteDownloadableForm = (id: string) => {
    setDownloadableForms((prev) => prev.filter((f) => f.id !== id));
    logActivity('ফরম মুছে ফেলা হয়েছে', 'notice');
  };

  const toggleFormActive = (id: string) => {
    setDownloadableForms((prev) =>
      prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f))
    );
  };

  const updateAdmitCardConfig = (config: Partial<AdmitCardConfig>) => {
    setAdmitCardConfig((prev) => ({ ...prev, ...config }));
    logActivity('প্রবেশপত্র (Admit Card) কনফিগারেশন আপডেট করা হয়েছে', 'setting');
  };

  // Academic Programs
  const addProgram = (item: Omit<AcademicProgram, 'id'>) => {
    const id = generateUniqueId('prog');
    setAcademicPrograms((prev) => [...prev, { id, ...item }]);
    logActivity(`নতুন একাডেমিক প্রোগ্রাম "${item.title}" যুক্ত করা হয়েছে`, 'setting');
  };

  const updateProgram = (id: string, item: Partial<AcademicProgram>) => {
    setAcademicPrograms((prev) => prev.map((p) => (p.id === id ? { ...p, ...item } : p)));
    logActivity(`একাডেমিক প্রোগ্রাম আপডেট করা হয়েছে`, 'setting');
  };

  const deleteProgram = (id: string) => {
    setAcademicPrograms((prev) => prev.filter((p) => p.id !== id));
    logActivity(`একাডেমিক প্রোগ্রাম মুছে ফেলা হয়েছে`, 'setting');
  };

  // News CRUD
  const addNews = (item: Omit<NewsItem, 'id'>) => {
    const id = generateUniqueId('news');
    setNews((prev) => [{ id, ...item }, ...prev]);
    logActivity(`নতুন সংবাদ "${item.title}" প্রকাশিত হয়েছে`, 'notice');
  };

  const updateNews = (id: string, item: Partial<NewsItem>) => {
    setNews((prev) => prev.map((n) => (n.id === id ? { ...n, ...item } : n)));
    logActivity(`সংবাদ আপডেট করা হয়েছে`, 'notice');
  };

  const deleteNews = (id: string) => {
    setNews((prev) => prev.filter((n) => n.id !== id));
    logActivity(`সংবাদ মুছে ফেলা হয়েছে`, 'notice');
  };

  // Events CRUD
  const addEvent = (item: Omit<EventItem, 'id'>) => {
    const id = generateUniqueId('evt');
    setEvents((prev) => [...prev, { id, ...item }]);
    logActivity(`নতুন ইভেন্ট "${item.title}" ক্যালেন্ডারে যুক্ত হয়েছে`, 'event');
  };

  const updateEvent = (id: string, item: Partial<EventItem>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...item } : e)));
    logActivity(`ইভেন্টের বিবরণ আপডেট করা হয়েছে`, 'event');
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    logActivity(`ইভেন্ট বাতিল/মুছে ফেলা হয়েছে`, 'event');
  };

  // Achievements CRUD
  const addAchievement = (item: Omit<AchievementItem, 'id'>) => {
    const id = generateUniqueId('ach');
    setAchievements((prev) => [...prev, { id, ...item }]);
    logActivity(`নতুন অর্জন "${item.title}" সংরক্ষিত হয়েছে`, 'setting');
  };

  const updateAchievement = (id: string, item: Partial<AchievementItem>) => {
    setAchievements((prev) => prev.map((a) => (a.id === id ? { ...a, ...item } : a)));
    logActivity(`অর্জনের তথ্য আপডেট করা হয়েছে`, 'setting');
  };

  const deleteAchievement = (id: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
    logActivity(`অর্জন তালিকা থেকে মুছে ফেলা হয়েছে`, 'setting');
  };

  // Gallery
  const addGalleryAlbum = (item: Omit<GalleryAlbum, 'id'>) => {
    const id = generateUniqueId('gal');
    setGalleryAlbums((prev) => [...prev, { id, ...item }]);
    logActivity(`নতুন গ্যালারি অ্যালবাম "${item.title}" যোগ করা হয়েছে`, 'setting');
  };

  const updateGalleryAlbum = (id: string, item: Partial<GalleryAlbum>) => {
    setGalleryAlbums((prev) => prev.map((g) => (g.id === id ? { ...g, ...item } : g)));
    logActivity(`গ্যালারি অ্যালবাম আপডেট করা হয়েছে`, 'setting');
  };

  const deleteGalleryAlbum = (id: string) => {
    setGalleryAlbums((prev) => prev.filter((g) => g.id !== id));
    logActivity(`গ্যালারি অ্যালবাম মুছে ফেলা হয়েছে`, 'setting');
  };

  const addImageToAlbum = (albumId: string, imageUrl: string) => {
    setGalleryAlbums((prev) =>
      prev.map((alb) => {
        if (alb.id === albumId) {
          const current = alb.images || (alb.imageUrl ? [alb.imageUrl] : []);
          const updatedImgs = [...current, imageUrl];
          return {
            ...alb,
            images: updatedImgs,
            itemCountText: `${updatedImgs.length} টি ছবি`,
          };
        }
        return alb;
      })
    );
    logActivity(`অ্যালবামে নতুন ছবি যোগ করা হয়েছে`, 'setting');
  };

  const addImagesToAlbum = (albumId: string, imageUrls: string[]) => {
    if (!imageUrls || imageUrls.length === 0) return;
    setGalleryAlbums((prev) =>
      prev.map((alb) => {
        if (alb.id === albumId) {
          const current = alb.images || (alb.imageUrl ? [alb.imageUrl] : []);
          const updatedImgs = [...current, ...imageUrls];
          return {
            ...alb,
            images: updatedImgs,
            itemCountText: `${updatedImgs.length} টি ছবি`,
          };
        }
        return alb;
      })
    );
    logActivity(`অ্যালবামে ${imageUrls.length}টি নতুন ছবি যোগ করা হয়েছে`, 'setting');
  };

  const removeImageFromAlbum = (albumId: string, index: number) => {
    setGalleryAlbums((prev) =>
      prev.map((alb) => {
        if (alb.id === albumId) {
          const current = alb.images ? [...alb.images] : (alb.imageUrl ? [alb.imageUrl] : []);
          if (index >= 0 && index < current.length) {
            const removedUrl = current[index];
            current.splice(index, 1);
            const newCover = alb.imageUrl === removedUrl ? (current[0] || '') : alb.imageUrl;
            return {
              ...alb,
              imageUrl: newCover,
              images: current,
              itemCountText: `${current.length} টি ছবি`,
            };
          }
        }
        return alb;
      })
    );
    logActivity(`অ্যালবাম থেকে ছবি মুছে ফেলা হয়েছে`, 'setting');
  };

  const setAlbumCoverImage = (albumId: string, imageUrl: string) => {
    setGalleryAlbums((prev) =>
      prev.map((alb) => {
        if (alb.id === albumId) {
          const current = alb.images ? [...alb.images] : (alb.imageUrl ? [alb.imageUrl] : []);
          if (!current.includes(imageUrl)) {
            current.unshift(imageUrl);
          }
          return {
            ...alb,
            imageUrl,
            images: current,
            itemCountText: `${current.length} টি ছবি`,
          };
        }
        return alb;
      })
    );
    logActivity(`অ্যালবামের কভার ছবি পরিবর্তন করা হয়েছে`, 'setting');
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
    setAdmissions((prev) => [newApp, ...prev]);
    logActivity(`নতুন ভর্তি আবেদন জমা হয়েছে: "${newApp.applicantName}" (${newApp.applyingClass})`, 'admission');
    return newApp;
  };

  const updateAdmissionStatus = (id: string, status: AdmissionApplication['status']) => {
    setAdmissions((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    logActivity(`ভর্তি আবেদনের স্ট্যাটাস পরিবর্তন: ${status}`, 'admission');
  };

  const deleteAdmission = (id: string) => {
    setAdmissions((prev) => prev.filter((a) => a.id !== id));
    logActivity(`ভর্তি আবেদন তালিকা থেকে সরানো হয়েছে`, 'admission');
  };

  // Exam Results
  const addExamResult = (result: Omit<ExamResult, 'id'>) => {
    const newResult: ExamResult = {
      ...result,
      id: generateUniqueId('res'),
    };
    setExamResults((prev) => [newResult, ...prev]);
    logActivity(`নতুন পরীক্ষার ফলাফল যুক্ত করা হয়েছে: ${newResult.studentName}`, 'setting');
  };

  const updateExamResult = (id: string, updated: Partial<ExamResult>) => {
    setExamResults((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
    );
    logActivity(`পরীক্ষার ফলাফল আপডেট করা হয়েছে`, 'setting');
  };

  const deleteExamResult = (id: string) => {
    setExamResults((prev) => prev.filter((r) => r.id !== id));
    logActivity(`পরীক্ষার ফলাফল মুছে ফেলা হয়েছে`, 'setting');
  };

  // Messages
  const submitContactMessage = (msg: Omit<ContactMessage, 'id' | 'date' | 'read'>) => {
    const id = generateUniqueId('msg');
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newMsg: ContactMessage = {
      id,
      ...msg,
      date: dateStr,
      read: false,
    };
    setMessages((prev) => [newMsg, ...prev]);
    logActivity(`ওয়েবসাইট থেকে বার্তা পেয়েছেন: ${newMsg.name}`, 'message');
  };

  const markMessageRead = (id: string, read: boolean) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read } : m)));
  };

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    logActivity(`বার্তা মুছে ফেলা হয়েছে`, 'message');
  };

  // Performance Trends Methods
  const addPerformanceTrend = (trend: Omit<PerformanceTrendItem, 'id'>) => {
    const newItem: PerformanceTrendItem = {
      ...trend,
      id: generateUniqueId('trend'),
    };
    setPerformanceTrends((prev) =>
      [...prev, newItem].sort((a, b) => a.year.localeCompare(b.year))
    );
    logActivity(`নতুন পারফরম্যান্স চার্ট ডাটা যোগ করা হয়েছে (${trend.year})`, 'setting');
  };

  const updatePerformanceTrend = (id: string, updated: Partial<PerformanceTrendItem>) => {
    setPerformanceTrends((prev) =>
      prev
        .map((t) => (t.id === id ? { ...t, ...updated } : t))
        .sort((a, b) => a.year.localeCompare(b.year))
    );
    logActivity(`পারফরম্যান্স চার্ট ডাটা আপডেট করা হয়েছে`, 'setting');
  };

  const deletePerformanceTrend = (id: string) => {
    setPerformanceTrends((prev) => prev.filter((t) => t.id !== id));
    logActivity(`পারফরম্যান্স চার্ট ডাটা মুছে ফেলা হয়েছে`, 'setting');
  };

  const resetPerformanceTrends = () => {
    setPerformanceTrends(initialPerformanceTrends);
    localStorage.setItem(
      'dhs_performance_trends',
      JSON.stringify(initialPerformanceTrends)
    );
    logActivity(`পারফরম্যান্স চার্ট ডাটা ডিফল্ট অবস্থায় রিসেট করা হয়েছে`, 'setting');
  };

  // Section Visibility Methods
  const toggleSectionVisibility = (sectionKey: keyof SectionVisibility) => {
    setSectionVisibility((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
    logActivity(`হোমপেজ সেকশন শো/হাইড পরিবর্তিত হয়েছে (${sectionKey})`, 'setting');
  };

  const updateSectionVisibility = (updates: Partial<SectionVisibility>) => {
    setSectionVisibility((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const resetSectionVisibility = () => {
    setSectionVisibility(initialSectionVisibility);
    localStorage.setItem(
      'dhs_section_visibility',
      JSON.stringify(initialSectionVisibility)
    );
    logActivity(`হোমপেজ সেকশনসমূহ ডিফল্ট অবস্থায় রিসেট করা হয়েছে`, 'setting');
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
        updateTeacher,
        deleteTeacher,
        staff,
        addStaff,
        updateStaff,
        deleteStaff,
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
