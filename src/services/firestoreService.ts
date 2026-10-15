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

// --- Generic Document Helpers ---
export async function saveDocument<T extends { id: string }>(collectionName: string, item: T) {
  try {
    const docRef = doc(db, collectionName, item.id);
    await setDoc(docRef, item, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${item.id}`);
  }
}

export async function deleteDocument(collectionName: string, id: string) {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
}

export async function saveConfigDoc<T>(docKey: string, data: T) {
  try {
    const docRef = doc(db, COLLECTIONS.CONFIG, docKey);
    await setDoc(docRef, { data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.CONFIG}/${docKey}`);
  }
}

// Batch write helper for bulk imports
export async function batchSaveDocuments<T extends { id: string }>(
  collectionName: string,
  items: T[],
  chunkSize = 250
) {
  try {
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const item of chunk) {
        const ref = doc(db, collectionName, item.id);
        batch.set(ref, item, { merge: true });
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/batch`);
  }
}

// Initial Seed helper (if Firestore collection has 0 documents)
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
    const snap = await getDocs(collection(db, COLLECTIONS.CONFIG));
    const exists = snap.docs.some((d) => d.id === docKey);
    if (!exists) {
      await saveConfigDoc(docKey, defaultData);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTIONS.CONFIG}/${docKey}`);
  }
}

// Realtime Listeners
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
