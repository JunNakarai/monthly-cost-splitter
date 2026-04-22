import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export type FirebaseUser = User;

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

function getFirebaseServices() {
  if (!isFirebaseConfigured()) {
    return null;
  }
  const app =
    getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  return {
    auth: getAuth(app),
    db: getFirestore(app),
  };
}

export function subscribeAuthState(
  onChange: (user: FirebaseUser | null) => void,
) {
  const services = getFirebaseServices();
  if (!services) {
    onChange(null);
    return () => undefined;
  }
  return onAuthStateChanged(services.auth, onChange);
}

export async function signInWithGoogle(): Promise<void> {
  const services = getFirebaseServices();
  if (!services) {
    throw new Error("Firebase is not configured.");
  }

  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(services.auth, provider);
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error
        ? String(error.code)
        : "";
    if (
      code === "auth/popup-blocked" ||
      code === "auth/operation-not-supported-in-this-environment"
    ) {
      await signInWithRedirect(services.auth, provider);
      return;
    }
    throw error;
  }
}

export async function signOutFromGoogle(): Promise<void> {
  const services = getFirebaseServices();
  if (!services) {
    return;
  }
  await signOut(services.auth);
}

export function getFirestoreDb() {
  return getFirebaseServices()?.db ?? null;
}
