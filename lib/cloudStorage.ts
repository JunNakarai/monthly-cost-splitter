import {
  doc,
  onSnapshot,
  setDoc,
  type FirestoreError,
  type Unsubscribe,
} from "firebase/firestore";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { getFirestoreDb } from "@/lib/firebase";
import type { AppSettings, MonthlyRecord } from "@/types";

type CloudData = {
  records: MonthlyRecord[];
  settings: AppSettings;
};

const CLOUD_DOC_ID = "monthly-cost-splitter";

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function isMonthlyRecord(value: unknown): value is MonthlyRecord {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Partial<MonthlyRecord>;
  return (
    typeof record.id === "string" &&
    typeof record.month === "string" &&
    isNullableNumber(record.electricity) &&
    isNullableNumber(record.gas) &&
    isNullableNumber(record.internet) &&
    isNullableNumber(record.water) &&
    isNullableNumber(record.eneFarm) &&
    isNullableNumber(record.fixedAssetAnnual) &&
    typeof record.utilityShare === "number" &&
    typeof record.waterShare === "number" &&
    typeof record.waterSplitMonths === "number" &&
    typeof record.eneFarmShare === "number" &&
    typeof record.eneFarmSplitMonths === "number" &&
    typeof record.fixedAssetShare === "number" &&
    typeof record.note === "string" &&
    typeof record.createdAt === "string" &&
    typeof record.updatedAt === "string"
  );
}

function normalizeSettings(value: unknown): AppSettings {
  if (!value || typeof value !== "object") {
    return DEFAULT_SETTINGS;
  }
  const settings = value as Partial<AppSettings>;
  return {
    defaultEneFarm:
      typeof settings.defaultEneFarm === "number"
        ? settings.defaultEneFarm
        : DEFAULT_SETTINGS.defaultEneFarm,
    defaultFixedAssetAnnual:
      typeof settings.defaultFixedAssetAnnual === "number"
        ? settings.defaultFixedAssetAnnual
        : DEFAULT_SETTINGS.defaultFixedAssetAnnual,
    defaultUtilityShare:
      typeof settings.defaultUtilityShare === "number"
        ? settings.defaultUtilityShare
        : DEFAULT_SETTINGS.defaultUtilityShare,
    defaultWaterShare:
      typeof settings.defaultWaterShare === "number"
        ? settings.defaultWaterShare
        : DEFAULT_SETTINGS.defaultWaterShare,
    defaultWaterSplitMonths:
      typeof settings.defaultWaterSplitMonths === "number"
        ? settings.defaultWaterSplitMonths
        : DEFAULT_SETTINGS.defaultWaterSplitMonths,
    defaultEneFarmShare:
      typeof settings.defaultEneFarmShare === "number"
        ? settings.defaultEneFarmShare
        : DEFAULT_SETTINGS.defaultEneFarmShare,
    defaultEneFarmSplitMonths:
      typeof settings.defaultEneFarmSplitMonths === "number"
        ? settings.defaultEneFarmSplitMonths
        : DEFAULT_SETTINGS.defaultEneFarmSplitMonths,
    defaultFixedAssetShare:
      typeof settings.defaultFixedAssetShare === "number"
        ? settings.defaultFixedAssetShare
        : DEFAULT_SETTINGS.defaultFixedAssetShare,
  };
}

function normalizeCloudData(value: Record<string, unknown>): CloudData {
  const records = Array.isArray(value.records)
    ? value.records.filter(isMonthlyRecord)
    : [];
  return {
    records,
    settings: normalizeSettings(value.settings),
  };
}

function userDataRef(userId: string) {
  const db = getFirestoreDb();
  if (!db) {
    return null;
  }
  return doc(db, "users", userId, "data", CLOUD_DOC_ID);
}

export function subscribeCloudData(
  userId: string,
  onData: (data: CloudData | null) => void,
  onError: (error: FirestoreError) => void,
): Unsubscribe {
  const ref = userDataRef(userId);
  if (!ref) {
    onData(null);
    return () => undefined;
  }

  return onSnapshot(
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
}

export async function saveCloudData(
  userId: string,
  records: MonthlyRecord[],
  settings: AppSettings,
): Promise<void> {
  const ref = userDataRef(userId);
  if (!ref) {
    return;
  }

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
