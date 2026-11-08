import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { UserSession, getDefaultSubmittedDocuments } from './utils/loanCalculator';
import { syncUserProfileAcrossClouds } from './utils/cloudIntegrations';

// Initialize Firebase SDK using provisioned configuration
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
const customGoogleClientId =
  typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)
    : undefined;
googleProvider.setCustomParameters({
  prompt: 'select_account',
  ...(customGoogleClientId ? { client_id: customGoogleClientId } : {}),
});

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
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

// Validate connection to Firestore on startup
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testFirestoreConnection();

/**
 * Fetches a user's persisted profile from Firestore `/users/{uid}` if available.
 */
export async function fetchUserProfileFromFirestore(uid: string): Promise<UserSession | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: data.uid || uid,
        memberId: data.memberId || `MBE-G${uid.slice(0, 4).toUpperCase()}`,
        name: data.name || 'M Bee Client',
        mobile: data.mobile || '',
        email: data.email || '',
        photoURL: data.photoURL || '',
        city: data.city || 'Mahilpur, Punjab',
        occupation: data.occupation || 'Citizen / Family',
        authProvider: data.authProvider === 'mobile' ? 'mobile' : 'google',
        signedInAt: data.signedInAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        workHistory: Array.isArray(data.workHistory) ? data.workHistory : [],
        submittedDocuments:
          Array.isArray(data.submittedDocuments) && data.submittedDocuments.length > 0
            ? data.submittedDocuments
            : getDefaultSubmittedDocuments(),
      };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
  return null;
}

/**
 * Persists a user's profile, clicked service history, and submitted documents to Firestore `/users/{uid}`.
 */
export async function saveUserProfileToFirestore(profile: UserSession): Promise<void> {
  const uid = profile.uid || auth.currentUser?.uid;
  if (!uid) return;

  const path = `users/${uid}`;
  const payload = {
    uid,
    memberId: (profile.memberId || `MBE-G${uid.slice(0, 4).toUpperCase()}`).slice(0, 40),
    name: (profile.name || 'M Bee Client').slice(0, 120),
    mobile: (profile.mobile || '').slice(0, 25),
    email: (profile.email || '').slice(0, 160),
    photoURL: (profile.photoURL || '').slice(0, 1000),
    city: (profile.city || 'Mahilpur, Punjab').slice(0, 120),
    occupation: (profile.occupation || 'Citizen / Family').slice(0, 80),
    authProvider: profile.authProvider || 'google',
    signedInAt: (profile.signedInAt || '').slice(0, 60),
    updatedAt: new Date().toISOString(),
    workHistory: (profile.workHistory || []).slice(0, 20),
    submittedDocuments: (profile.submittedDocuments || getDefaultSubmittedDocuments()).slice(0, 25),
  };

  try {
    await setDoc(doc(db, 'users', uid), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }

  // Also sync profile & submitted document statuses with Frontend & Backend Supabase
  void syncUserProfileAcrossClouds({ ...profile, uid });
}

export { signInWithPopup, firebaseSignOut, onAuthStateChanged };
export type { FirebaseUser };
