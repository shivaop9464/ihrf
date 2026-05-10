import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfigTemplate from '../../firebase-applet-config.json';

// Use environment variables if they exist, otherwise fallback to the JSON config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigTemplate.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigTemplate.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigTemplate.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigTemplate.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigTemplate.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigTemplate.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigTemplate.firestoreDatabaseId,
};

// Initialize Firebase
console.log("Initializing Firebase with project:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig as any);

// Initialize Firestore
// Use explicit database ID if provided and not (default)
const dbId = firebaseConfig.firestoreDatabaseId;
const isNamedDatabase = dbId && dbId !== '(default)' && dbId.trim() !== '';

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  ...(isNamedDatabase ? { databaseId: dbId } : {})
});

console.log("Firestore initialized for project:", firebaseConfig.projectId, "with database:", isNamedDatabase ? dbId : "(default)", "(Long polling enabled)");

// Initialize Auth safely
let authInstance;
try {
  authInstance = getAuth(app);
} catch (error) {
  console.warn("Firebase Auth could not be initialized:", error);
}

export const auth = authInstance;
export const googleProvider = new GoogleAuthProvider();

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
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test
async function testConnection() {
  try {
    console.log("Testing Firestore connection...");
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection test successful.");
  } catch (error: any) {
    console.error("Firestore connection failed details:", {
      code: error.code,
      message: error.message,
      name: error.name
    });
    // The specific message from the user's report
    if (error.message?.includes('the client is offline') || error.code === 'unavailable') {
      console.error("Firebase connection unreachable. This could be due to invalid project configuration (Project ID, API Key) or restricted network environment.");
      console.error("Current Project ID being used:", firebaseConfig.projectId);
    }
  }
}

testConnection();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Auth Error:", error);
    throw error;
  }
};

export const signInAdminAnonymously = async () => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error("Anonymous Auth Error:", error);
    throw error;
  }
};
