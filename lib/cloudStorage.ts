import { getFirestoreDb } from "@/lib/firebase";
import { normalizeRecords, normalizeSettings } from "@/lib/schema";
import type { AppSettings, MonthlyRecord } from "@/types";

type CloudData = {
  records: MonthlyRecord[];
  settings: AppSettings;
};

type CloudError = Error;
type Unsubscribe = () => void;

const CLOUD_DOC_ID = "monthly-cost-splitter";

function normalizeCloudData(value: Record<string, unknown>): CloudData {
  return {
    records: normalizeRecords(value.records),
    settings: normalizeSettings(value.settings),
  };
}

async function userDataRef(userId: string) {
  const db = await getFirestoreDb();
  if (!db) {
    return null;
  }

  const { doc } = await import("firebase/firestore");
  return doc(db, "users", userId, "data", CLOUD_DOC_ID);
}

export function subscribeCloudData(
  userId: string,
  onData: (data: CloudData | null) => void,
  onError: (error: CloudError) => void,
): Unsubscribe {
  let unsubscribe = () => {};
  let cancelled = false;

  userDataRef(userId)
    .then(async (ref) => {
      if (!ref || cancelled) {
        onData(null);
        return;
      }
      const { onSnapshot } = await import("firebase/firestore");
      if (cancelled) {
        return;
      }
      unsubscribe = onSnapshot(
        ref,
        (snapshot) => {
          if (!snapshot.exists()) {
            onData(null);
            return;
          }
          onData(normalizeCloudData(snapshot.data()));
        },
        onError,
      );
    })
    .catch(onError);

  return () => {
    cancelled = true;
    unsubscribe();
  };
}

export async function saveCloudData(
  userId: string,
  records: MonthlyRecord[],
  settings: AppSettings,
): Promise<void> {
  const ref = await userDataRef(userId);
  if (!ref) {
    return;
  }

  const { setDoc } = await import("firebase/firestore");
  await setDoc(
    ref,
    {
      version: 1,
      records,
      settings,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}
