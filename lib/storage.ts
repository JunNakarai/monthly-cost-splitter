import type { AppSettings, MonthlyRecord } from "@/types";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import {
  normalizeRecords,
  normalizeSettings,
  safeJsonParse,
} from "@/lib/schema";

export const RECORDS_STORAGE_KEY = "monthly-cost-splitter-records";
export const SETTINGS_STORAGE_KEY = "monthly-cost-splitter-settings";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadRecords(): MonthlyRecord[] {
  if (!isBrowser()) {
    return [];
  }
  const parsed = safeJsonParse(window.localStorage.getItem(RECORDS_STORAGE_KEY));
  return normalizeRecords(parsed);
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
  return normalizeSettings(parsed);
}

export function saveSettings(settings: AppSettings): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
