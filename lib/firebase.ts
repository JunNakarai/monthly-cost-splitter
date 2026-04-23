const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export type FirebaseUser = {
  uid: string;
  email: string | null;
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

async function getFirebaseApp() {
  if (!isFirebaseConfigured()) {
    return null;
  }

  const { initializeApp, getApps } = await import("firebase/app");
  return getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
}

export async function getAuthService() {
  const app = await getFirebaseApp();
  if (!app) {
    return null;
  }

  const { getAuth } = await import("firebase/auth");
  return getAuth(app);
}

export async function getFirestoreDb() {
  const app = await getFirebaseApp();
  if (!app) {
    return null;
  }

  const { getFirestore } = await import("firebase/firestore");
  return getFirestore(app);
}

export function subscribeAuthState(
  onChange: (user: FirebaseUser | null) => void,
) {
  if (!isFirebaseConfigured()) {
    onChange(null);
    return () => undefined;
  }

  let unsubscribe = () => {};
  let cancelled = false;

  getAuthService()
    .then(async (auth) => {
      if (!auth || cancelled) {
        onChange(null);
        return;
      }
      const { onAuthStateChanged } = await import("firebase/auth");
      if (cancelled) {
        return;
      }
      unsubscribe = onAuthStateChanged(auth, onChange);
    })
    .catch(() => onChange(null));

  return () => {
    cancelled = true;
    unsubscribe();
  };
}

export async function signInWithGoogle(): Promise<void> {
  const auth = await getAuthService();
  if (!auth) {
    throw new Error("Firebase is not configured.");
  }

  const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } =
    await import("firebase/auth");
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error
        ? String(error.code)
        : "";
    if (
      code === "auth/popup-blocked" ||
      code === "auth/operation-not-supported-in-this-environment"
    ) {
      await signInWithRedirect(auth, provider);
      return;
    }
    throw error;
  }
}

export async function signOutFromGoogle(): Promise<void> {
  const auth = await getAuthService();
  if (!auth) {
    return;
  }

  const { signOut } = await import("firebase/auth");
  await signOut(auth);
}
