import {
  createEmptyRecordInput,
} from "@/lib/defaults";
import type { AppSettings, MonthlyRecord, RecordInput } from "@/types";

export function isWaterInputMonth(month: string): boolean {
  const monthNumber = Number(month.split("-")[1]);
  return Number.isInteger(monthNumber) && monthNumber % 2 === 0;
}

export function normalizeWaterInput(input: RecordInput): RecordInput {
  return isWaterInputMonth(input.month) ? input : { ...input, water: null };
}

export function recordToInput(record: MonthlyRecord): RecordInput {
  const electricityGasTotal = (record.electricity ?? 0) + (record.gas ?? 0);
  return {
    month: record.month,
    electricity: electricityGasTotal > 0 ? electricityGasTotal : null,
    gas: null,
    internet: record.internet,
    water: record.water,
    eneFarm: record.eneFarm,
    fixedAssetAnnual: record.fixedAssetAnnual,
    utilityShare: record.utilityShare,
    waterShare: record.waterShare,
    waterSplitMonths: record.waterSplitMonths,
    eneFarmShare: record.eneFarmShare,
    eneFarmSplitMonths: record.eneFarmSplitMonths,
    fixedAssetShare: record.fixedAssetShare,
    note: "",
  };
}

export function createInputForMonth(
  month: string,
  settings: AppSettings,
  record: MonthlyRecord | null,
): RecordInput {
  if (record) {
    return recordToInput(record);
  }
  return normalizeWaterInput({
    ...createEmptyRecordInput(settings),
    month,
  });
}
