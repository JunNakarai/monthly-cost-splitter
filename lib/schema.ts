import { DEFAULT_SETTINGS } from "@/lib/defaults";
import type { AppSettings, MonthlyRecord } from "@/types";

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function safeJsonParse(value: string | null): unknown {
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

export function isMonthlyRecord(value: unknown): value is MonthlyRecord {
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

export function normalizeRecords(value: unknown): MonthlyRecord[] {
  return Array.isArray(value) ? value.filter(isMonthlyRecord) : [];
}

export function normalizeSettings(value: unknown): AppSettings {
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
