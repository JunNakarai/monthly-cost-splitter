import type { AppSettings, RecordInput } from "@/types";

export const DEFAULT_SETTINGS: AppSettings = {
  defaultEneFarm: 0,
  defaultFixedAssetAnnual: 0,
  defaultUtilityShare: 0.5,
  defaultWaterShare: 0.5,
  defaultWaterSplitMonths: 2,
  defaultEneFarmShare: 0.5,
  defaultEneFarmSplitMonths: 2,
  defaultFixedAssetShare: 1 / 3,
};

export function currentMonthValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function nextMonthValue(month: string): string {
  const [year, monthIndex] = month.split("-").map(Number);
  if (!year || !monthIndex) {
    return currentMonthValue();
  }
  const date = new Date(year, monthIndex, 1);
  return currentMonthValue(date);
}

export function previousMonthValue(month: string): string {
  const [year, monthIndex] = month.split("-").map(Number);
  if (!year || !monthIndex) {
    return currentMonthValue();
  }
  const date = new Date(year, monthIndex - 2, 1);
  return currentMonthValue(date);
}

export function createEmptyRecordInput(
  settings: AppSettings = DEFAULT_SETTINGS,
): RecordInput {
  return {
    month: currentMonthValue(),
    electricity: null,
    gas: null,
    internet: null,
    water: null,
    eneFarm: settings.defaultEneFarm || null,
    fixedAssetAnnual: settings.defaultFixedAssetAnnual || null,
    utilityShare: settings.defaultUtilityShare,
    waterShare: settings.defaultWaterShare,
    waterSplitMonths: settings.defaultWaterSplitMonths,
    eneFarmShare: settings.defaultEneFarmShare,
    eneFarmSplitMonths: settings.defaultEneFarmSplitMonths,
    fixedAssetShare: settings.defaultFixedAssetShare,
    note: "",
  };
}
