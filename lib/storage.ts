import type { AppSettings, MonthlyRecord } from "@/types";
import { DEFAULT_SETTINGS } from "@/lib/defaults";

export const RECORDS_STORAGE_KEY = "monthly-cost-splitter-records";
export const SETTINGS_STORAGE_KEY = "monthly-cost-splitter-settings";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeJsonParse(value: string | null): unknown {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

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

export function loadRecords(): MonthlyRecord[] {
  if (!isBrowser()) {
    return [];
  }
  const parsed = safeJsonParse(window.localStorage.getItem(RECORDS_STORAGE_KEY));
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed.filter(isMonthlyRecord);
}

export function saveRecords(records: MonthlyRecord[]): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
}

export function loadSettings(): AppSettings {
  if (!isBrowser()) {
    return DEFAULT_SETTINGS;
  }
  const parsed = safeJsonParse(window.localStorage.getItem(SETTINGS_STORAGE_KEY));
  if (!parsed || typeof parsed !== "object") {
    return DEFAULT_SETTINGS;
  }
  const value = parsed as Partial<AppSettings>;
  return {
    defaultEneFarm:
      typeof value.defaultEneFarm === "number"
        ? value.defaultEneFarm
        : DEFAULT_SETTINGS.defaultEneFarm,
    defaultFixedAssetAnnual:
      typeof value.defaultFixedAssetAnnual === "number"
        ? value.defaultFixedAssetAnnual
        : DEFAULT_SETTINGS.defaultFixedAssetAnnual,
    defaultUtilityShare:
      typeof value.defaultUtilityShare === "number"
        ? value.defaultUtilityShare
        : DEFAULT_SETTINGS.defaultUtilityShare,
    defaultWaterShare:
      typeof value.defaultWaterShare === "number"
        ? value.defaultWaterShare
        : DEFAULT_SETTINGS.defaultWaterShare,
    defaultWaterSplitMonths:
      typeof value.defaultWaterSplitMonths === "number"
        ? value.defaultWaterSplitMonths
        : DEFAULT_SETTINGS.defaultWaterSplitMonths,
    defaultEneFarmShare:
      typeof value.defaultEneFarmShare === "number"
        ? value.defaultEneFarmShare
        : DEFAULT_SETTINGS.defaultEneFarmShare,
    defaultEneFarmSplitMonths:
      typeof value.defaultEneFarmSplitMonths === "number"
        ? value.defaultEneFarmSplitMonths
        : DEFAULT_SETTINGS.defaultEneFarmSplitMonths,
    defaultFixedAssetShare:
      typeof value.defaultFixedAssetShare === "number"
        ? value.defaultFixedAssetShare
        : DEFAULT_SETTINGS.defaultFixedAssetShare,
  };
}

export function saveSettings(settings: AppSettings): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
