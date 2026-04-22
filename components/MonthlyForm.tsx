"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateRecord,
  divisorFromShare,
} from "@/lib/calculations";
import {
  createEmptyRecordInput,
  nextMonthValue,
  previousMonthValue,
} from "@/lib/defaults";
import {
  formatCurrency,
  formatNumberInput,
  parseNumberInput,
} from "@/lib/format";
import type { AppSettings, MonthlyRecord, RecordInput } from "@/types";

type MonthlyFormProps = {
  settings: AppSettings;
  selectedMonth: string;
  record: MonthlyRecord | null;
  onMonthChange: (month: string) => void;
  onInputChange: (input: RecordInput) => void;
};

const amountFields = [
  { key: "electricity", label: "電気・ガス代" },
  { key: "internet", label: "ネット代" },
  { key: "water", label: "水道代" },
  { key: "eneFarm", label: "エネファーム代" },
  { key: "fixedAssetAnnual", label: "固定資産税年額" },
] as const;

const shareFields = [
  { key: "utilityShare", label: "電気・ガス・ネットの負担割合" },
  { key: "waterShare", label: "水道の負担割合" },
  { key: "eneFarmShare", label: "エネファームの負担割合" },
  { key: "fixedAssetShare", label: "固定資産税の負担割合" },
] as const;

function isWaterInputMonth(month: string): boolean {
  const monthNumber = Number(month.split("-")[1]);
  return Number.isInteger(monthNumber) && monthNumber % 2 === 0;
}

function waterNormalizedInput(input: RecordInput): RecordInput {
  return isWaterInputMonth(input.month) ? input : { ...input, water: null };
}

function toRecordInput(record: MonthlyRecord): RecordInput {
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

function createInputForMonth(
  month: string,
  settings: AppSettings,
  record: MonthlyRecord | null,
): RecordInput {
  if (record) {
    return toRecordInput(record);
  }
  return waterNormalizedInput({
    ...createEmptyRecordInput(settings),
    month,
  });
}

function isSettingsManagedField(key: keyof RecordInput): boolean {
  return key === "eneFarm" || key === "fixedAssetAnnual";
}

function validateInput(input: RecordInput): string[] {
  const errors: string[] = [];
  amountFields.forEach(({ key, label }) => {
    const value = input[key];
    if (value !== null && value < 0) {
      errors.push(`${label}は0以上で入力してください。`);
    }
  });
  shareFields.forEach(({ key, label }) => {
    const value = input[key];
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      errors.push(`${label}は0以上1以下で入力してください。`);
    }
  });
  return errors;
}

function displayMonth(month: string): string {
  const [year, monthNumber] = month.split("-");
  return `${year}年${monthNumber}月`;
}

export function MonthlyForm({
  settings,
  selectedMonth,
  record,
  onMonthChange,
  onInputChange,
}: MonthlyFormProps) {
  const [input, setInput] = useState<RecordInput>(() =>
    createInputForMonth(selectedMonth, settings, record),
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    setInput(createInputForMonth(selectedMonth, settings, record));
    setErrors([]);
  }, [selectedMonth, settings, record]);

  const waterEnabled = isWaterInputMonth(input.month);
  const waterApplies = waterEnabled || input.water !== null;
  const calculationInput = useMemo(() => input, [input]);
  const calculation = useMemo(
    () => calculateRecord(calculationInput),
    [calculationInput],
  );
  const calculationText = useMemo(
    () =>
      buildCalculationText({
        month: selectedMonth,
        input,
        waterApplies,
        calculation,
      }),
    [selectedMonth, input, waterApplies, calculation],
  );

  function updateField<K extends keyof RecordInput>(
    key: K,
    value: RecordInput[K],
  ) {
    const next = waterNormalizedInput({ ...input, [key]: value });
    const validationErrors = validateInput(next);
    setInput(next);
    setErrors(validationErrors);
    if (validationErrors.length === 0) {
      onInputChange(next);
    }
  }

  async function handleCopyText() {
    try {
      await navigator.clipboard.writeText(calculationText);
      setCopyMessage("コピーしました");
    } catch {
      setCopyMessage("コピーに失敗しました");
    }
    window.setTimeout(() => setCopyMessage(""), 1800);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">月次入力</h2>
          <p className="mt-1 text-sm text-slate-600">
            入力内容はこの月のレコードへ自動保存されます。
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <button
            type="button"
            onClick={() => onMonthChange(previousMonthValue(selectedMonth))}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-lg font-bold text-slate-700 hover:bg-slate-100"
            aria-label="前の月"
          >
            ‹
          </button>
          <div className="text-center">
            <p className="text-xs font-semibold text-slate-500">表示中の月</p>
            <p className="text-xl font-bold text-slate-950">
              {displayMonth(selectedMonth)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onMonthChange(nextMonthValue(selectedMonth))}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-lg font-bold text-slate-700 hover:bg-slate-100"
            aria-label="次の月"
          >
            ›
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {amountFields.map(({ key, label }) => {
            const disabled =
              (key === "water" && !waterEnabled) ||
              isSettingsManagedField(key);
            const suffix =
              key === "water" && !waterEnabled
                ? "（偶数月のみ）"
                : isSettingsManagedField(key)
                  ? "（設定）"
                  : "";
            return (
              <label
                key={key}
                className={`block ${disabled ? "opacity-55" : ""}`}
              >
                <span className="text-sm font-medium text-slate-700">
                  {label}
                  {suffix}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={formatNumberInput(input[key])}
                  disabled={disabled}
                  onChange={(event) =>
                    updateField(key, parseNumberInput(event.target.value))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                />
              </label>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">Plain text</p>
            <div className="flex items-center gap-3">
              {copyMessage && (
                <span className="text-xs font-medium text-slate-500">
                  {copyMessage}
                </span>
              )}
              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                <span
                  aria-hidden="true"
                  className="relative h-3.5 w-3.5 before:absolute before:left-0 before:top-1 before:h-2.5 before:w-2.5 before:rounded-[2px] before:border before:border-slate-500 after:absolute after:left-1 after:top-0 after:h-2.5 after:w-2.5 after:rounded-[2px] after:border after:border-slate-500 after:bg-slate-50"
                />
                コピーする
              </button>
            </div>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap px-4 py-4 font-mono text-sm leading-7 text-slate-950">
            {calculationText}
          </pre>
        </div>

        {errors.length > 0 && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function buildCalculationText({
  month,
  input,
  waterApplies,
  calculation,
}: {
  month: string;
  input: RecordInput;
  waterApplies: boolean;
  calculation: ReturnType<typeof calculateRecord>;
}): string {
  const waterFormula = waterApplies
    ? `${formatCurrency(calculation.waterMonthlyBase)} / ${divisorFromShare(input.waterShare)}`
    : "奇数月のため入力なし";
  const utilityDivisor = divisorFromShare(input.utilityShare);
  const eneFarmDivisor = divisorFromShare(input.eneFarmShare);
  const fixedAssetDivisor = divisorFromShare(input.fixedAssetShare);

  return [
    `# ${displayMonth(month)}`,
    "",
    `- 電気・ガス・ネット: (${formatCurrency(input.electricity ?? 0)} + ${formatCurrency(input.internet ?? 0)}) / ${utilityDivisor} = ${formatCurrency(calculation.utilityShareAmount)}`,
    `- 水道: ${waterFormula} = ${formatCurrency(calculation.waterShareAmount)}`,
    `- エネファーム: ${formatCurrency(calculation.eneFarmMonthlyBase)} / ${eneFarmDivisor} = ${formatCurrency(calculation.eneFarmShareAmount)}`,
    `- 固定資産税: ${formatCurrency(input.fixedAssetAnnual ?? 0)} / 12か月 / ${fixedAssetDivisor} = ${formatCurrency(calculation.fixedAssetShareAmount)}`,
    "",
    `- 合計: ${formatCurrency(calculation.utilityShareAmount)} + ${formatCurrency(calculation.waterShareAmount)} + ${formatCurrency(calculation.eneFarmShareAmount)} + ${formatCurrency(calculation.fixedAssetShareAmount)} = ${formatCurrency(calculation.total)}`,
  ].join("\n");
}
