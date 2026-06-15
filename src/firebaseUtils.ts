import { db, auth } from "./firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc,
  orderBy
} from "firebase/firestore";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
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
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Robust read helpers with permissions mapping
export async function fetchUserAnalyses(userId: string) {
  const path = "analyses";
  try {
    const q = query(
      collection(db, path),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    const list: any[] = [];
    snap.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    // Sort client-side by createdAt descending (keeps operations stable without needing index build on empty db)
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function saveAnalysis(userId: string, analysisData: any) {
  const path = `analyses/${analysisData.id}`;
  try {
    await setDoc(doc(db, "analyses", analysisData.id), {
      ...analysisData,
      userId
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function deleteAnalysisDoc(analysisId: string) {
  const path = `analyses/${analysisId}`;
  try {
    await deleteDoc(doc(db, "analyses", analysisId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function fetchUserInterviews(userId: string) {
  const path = "interviews";
  try {
    const q = query(
      collection(db, path),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    const list: any[] = [];
    snap.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function saveInterviewSession(userId: string, interviewData: any) {
  const path = `interviews/${interviewData.id}`;
  try {
    await setDoc(doc(db, "interviews", interviewData.id), {
      ...interviewData,
      userId
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function deleteInterviewSession(interviewId: string) {
  const path = `interviews/${interviewId}`;
  try {
    await deleteDoc(doc(db, "interviews", interviewId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
