import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import {
  Teacher,
  Staff,
  Student,
  Notice,
  NewsItem,
  EventItem,
  AchievementItem,
  GalleryAlbum,
  AdmissionApplication,
  ContactMessage,
  ExamResult,
  ActivityLog,
  SiteSettings,
  HeroSlide,
  NavigationItem,
  PerformanceTrendItem,
  SectionVisibility,
  DownloadableForm,
  AdmitCardConfig,
  LeadershipMessage,
  AcademicProgram,
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
}

// Collection Names
export const COLLECTIONS = {
  TEACHERS: 'teachers',
  STAFF: 'staff',
  STUDENTS: 'students',
  DELETED_STUDENTS: 'deleted_students',
  NOTICES: 'notices',
  NEWS: 'news',
  EVENTS: 'events',
  ACHIEVEMENTS: 'achievements',
  GALLERY: 'gallery',
  ADMISSIONS: 'admissions',
  MESSAGES: 'messages',
  EXAM_RESULTS: 'exam_results',
  ACTIVITIES: 'activities',
  CONFIG: 'school_config',
} as const;

// Config Document Keys
export const CONFIG_DOCS = {
  SITE_SETTINGS: 'site_settings',
  HERO_SLIDES: 'hero_slides',
  NAVIGATION_ITEMS: 'navigation_items',
  PERFORMANCE_TRENDS: 'performance_trends',
  SECTION_VISIBILITY: 'section_visibility',
  DOWNLOADABLE_FORMS: 'downloadable_forms',
  ADMIT_CARD_CONFIG: 'admit_card_config',
  LEADERSHIP: 'leadership',
  PROGRAMS: 'programs',
} as const;

// Helper to recursively sanitize data for Firestore by removing or nulling undefined values
export function cleanForFirestore(data: any): any {
  if (data === undefined) {
    return null;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (data instanceof Date) {
    return data.toISOString();
  }
  if (Array.isArray(data)) {
    return data.map((item) => cleanForFirestore(item));
  }
  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (val !== undefined) {
      cleaned[key] = cleanForFirestore(val);
    }
  }
  return cleaned;
}

// Bengali error message translator for Firestore operations
export function getBengaliFirestoreErrorMessage(error: any): string {
  const code = error?.code || '';
  const message = error?.message || String(error);
  if (
    code === 'permission-denied' ||
    message.includes('permission-denied') ||
    message.includes('Missing or insufficient permissions')
  ) {
    return 'অনুমতি নেই: শুধুমাত্র অনুমোদিত অ্যাডমিন হিসেবে Firebase Authentication-এ লগইন থাকলেই Firestore-এ ডেটা সেভ করা যায়।';
  }
  if (
    code === 'unavailable' ||
    message.includes('unavailable') ||
    code === 'network-request-failed' ||
    message.includes('network')
  ) {
    return 'নেটওয়ার্ক সংযোগ ত্রুটি: Firestore সার্ভারে সংযোগ স্থাপন করা যায়নি। আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।';
  }
  if (code === 'resource-exhausted') {
    return 'Firestore কোটা অতিক্রম করেছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।';
  }
  if (code === 'invalid-argument' || message.includes('invalid data') || message.includes('undefined')) {
    return 'অপ্রত্যাশিত ডাটা ফরম্যাট: তথ্য সংরক্ষণ করা সম্ভব হয়নি।';
  }
  return 'Firestore-এ ডেটা সংরক্ষণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
}

// --- Generic Document Helpers ---
export async function saveDocument<T extends { id: string }>(collectionName: string, item: T): Promise<void> {
  try {
    const cleaned = cleanForFirestore(item);
    const docRef = doc(db, collectionName, item.id);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (error: any) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${item.id}`);
    throw error;
  }
}

export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error: any) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
    throw error;
  }
}

export async function saveConfigDoc<T>(docKey: string, data: T): Promise<void> {
  try {
    const cleaned = cleanForFirestore(data);
    const docRef = doc(db, COLLECTIONS.CONFIG, docKey);
    await setDoc(docRef, { data: cleaned, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error: any) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.CONFIG}/${docKey}`);
    throw error;
  }
}

// Batch write helper for bulk imports
export async function batchSaveDocuments<T extends { id: string }>(
  collectionName: string,
  items: T[],
  chunkSize = 250
): Promise<void> {
  try {
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const item of chunk) {
        const cleaned = cleanForFirestore(item);
        const ref = doc(db, collectionName, item.id);
        batch.set(ref, cleaned, { merge: true });
      }
      await batch.commit();
    }
  } catch (error: any) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/batch`);
    throw error;
  }
}

// Single-read fetch helper for collections (reduces reads to once per page open)
export async function fetchCollectionOnce<T>(collectionName: string): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    const items: T[] = [];
    snap.forEach((d) => {
      items.push({ ...d.data(), id: d.id } as unknown as T);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionName);
    return [];
  }
}

// Single-read fetch for all config documents in a single query
export async function fetchAllConfigDocsOnce(): Promise<Record<string, any>> {
  try {
    const colRef = collection(db, COLLECTIONS.CONFIG);
    const snap = await getDocs(colRef);
    const configs: Record<string, any> = {};
    snap.forEach((d) => {
      const data = d.data();
      if (data && data.data !== undefined) {
        configs[d.id] = data.data;
      }
    });
    return configs;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTIONS.CONFIG);
    return {};
  }
}

// Initial Seed helper (only called by authenticated admin or explicitly)
export async function seedInitialCollectionIfEmpty<T extends { id: string }>(
  collectionName: string,
  initialData: T[]
) {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    if (snap.empty && initialData.length > 0) {
      console.log(`Seeding initial data for ${collectionName}...`);
      await batchSaveDocuments(collectionName, initialData);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionName);
  }
}

export async function seedInitialConfigIfEmpty<T>(docKey: string, defaultData: T) {
  try {
    const docRef = doc(db, COLLECTIONS.CONFIG, docKey);
    await setDoc(docRef, { data: defaultData, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.CONFIG}/${docKey}`);
  }
}

// Realtime Listeners (optional fallback if needed)
export function listenCollection<T>(
  collectionName: string,
  onData: (items: T[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((d) => {
        items.push({ ...d.data(), id: d.id } as unknown as T);
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, collectionName);
      if (onError) onError(error);
    }
  );
}

export function listenConfigDoc<T>(
  docKey: string,
  onData: (data: T) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const docRef = doc(db, COLLECTIONS.CONFIG, docKey);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.data();
        if (val && val.data !== undefined) {
          onData(val.data as T);
        }
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${COLLECTIONS.CONFIG}/${docKey}`);
      if (onError) onError(error);
    }
  );
}
