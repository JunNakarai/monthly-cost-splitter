import type { CalculationResult, MonthlyRecord, RecordInput } from "@/types";

type CalculableRecord = MonthlyRecord | RecordInput;

function safeAmount(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : 0;
}

function safeShare(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(Math.max(value, 0), 1)
    : 0;
}

export function divisorFromShare(
  value: number | null | undefined,
): number {
  const share = safeShare(value);
  if (share <= 0) {
    return 0;
  }
  return Math.max(1, Math.round(1 / share));
}

export function calculateRecord(record: CalculableRecord): CalculationResult {
  const utilitySubtotal =
    safeAmount(record.electricity) +
    safeAmount(record.gas) +
    safeAmount(record.internet);
  const utilityDivisor = divisorFromShare(record.utilityShare);
  const utilityShareAmount =
    utilityDivisor > 0 ? utilitySubtotal / utilityDivisor : 0;

  const waterMonthlyBase = safeAmount(record.water);
  const waterDivisor = divisorFromShare(record.waterShare);
  const waterShareAmount =
    waterDivisor > 0 ? waterMonthlyBase / waterDivisor : 0;

  const eneFarmMonthlyBase = safeAmount(record.eneFarm);
  const eneFarmDivisor = divisorFromShare(record.eneFarmShare);
  const eneFarmShareAmount =
    eneFarmDivisor > 0 ? eneFarmMonthlyBase / eneFarmDivisor : 0;

  const fixedAssetMonthlyBase = safeAmount(record.fixedAssetAnnual) / 12;
  const fixedAssetDivisor = divisorFromShare(record.fixedAssetShare);
  const fixedAssetShareAmount =
    fixedAssetDivisor > 0 ? fixedAssetMonthlyBase / fixedAssetDivisor : 0;

  return {
    utilitySubtotal,
    utilityShareAmount,
    waterMonthlyBase,
    waterShareAmount,
    eneFarmMonthlyBase,
    eneFarmShareAmount,
    fixedAssetMonthlyBase,
    fixedAssetShareAmount,
    total:
      utilityShareAmount +
      waterShareAmount +
      eneFarmShareAmount +
      fixedAssetShareAmount,
  };
}
