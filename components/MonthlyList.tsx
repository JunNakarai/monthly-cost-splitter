"use client";

import {
  calculateRecord,
  divisorFromShare,
} from "@/lib/calculations";
import { downloadCsv } from "@/lib/csv";
import { formatCurrency } from "@/lib/format";
import type { MonthlyRecord } from "@/types";

type MonthlyListProps = {
  records: MonthlyRecord[];
  selectedMonth: string;
  onImportCsv: (file: File) => void;
  onEdit: (record: MonthlyRecord) => void;
  onDelete: (id: string) => void;
  onDuplicate: (record: MonthlyRecord) => void;
};

export function MonthlyList({
  records,
  selectedMonth,
  onImportCsv,
  onEdit,
  onDelete,
  onDuplicate,
}: MonthlyListProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">月別履歴</h2>
          <p className="mt-1 text-sm text-slate-600">
            合計を一覧で見て、下で各月の式を確認できます。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            CSVインポート
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  onImportCsv(file);
                }
                event.target.value = "";
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => downloadCsv(records)}
            disabled={records.length === 0}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            CSVエクスポート
          </button>
        </div>
      </div>

      {records.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          まだレコードがありません。
        </p>
      ) : (
        <div className="space-y-5">
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-[760px] w-full border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-3 py-2">月</th>
                  <th className="px-3 py-2 text-right">合計</th>
                  <th className="px-3 py-2 text-right">電気・ガス・ネット</th>
                  <th className="px-3 py-2 text-right">水道</th>
                  <th className="px-3 py-2 text-right">エネファーム</th>
                  <th className="px-3 py-2 text-right">固定資産税</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {records.map((record) => {
                  const calculation = calculateRecord(record);
                  const isSelected = selectedMonth === record.month;
                  return (
                    <tr
                      key={record.id}
                      className={isSelected ? "bg-slate-100" : "bg-white"}
                    >
                      <td className="whitespace-nowrap px-3 py-2 font-semibold text-slate-950">
                        {record.month}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right font-bold text-slate-950">
                        {formatCurrency(calculation.total)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right text-slate-700">
                        {formatCurrency(calculation.utilityShareAmount)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right text-slate-700">
                        {formatCurrency(calculation.waterShareAmount)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right text-slate-700">
                        {formatCurrency(calculation.eneFarmShareAmount)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right text-slate-700">
                        {formatCurrency(calculation.fixedAssetShareAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            {records.map((record) => {
              const calculation = calculateRecord(record);
              const isSelected = selectedMonth === record.month;
              const utilityBase = (record.electricity ?? 0) + (record.gas ?? 0);
              const utilityDivisor = divisorFromShare(record.utilityShare);
              const waterDivisor = divisorFromShare(record.waterShare);
              const eneFarmDivisor = divisorFromShare(record.eneFarmShare);
              const fixedAssetDivisor = divisorFromShare(record.fixedAssetShare);
              return (
                <article
                  key={record.id}
                  className={`rounded-lg border p-4 ${
                    isSelected
                      ? "border-slate-950 bg-slate-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-950">
                          {record.month}
                        </h3>
                        {isSelected && (
                          <span className="rounded-md bg-slate-950 px-2 py-1 text-xs font-semibold text-white">
                            表示中
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {formatCurrency(calculation.total)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(record)}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        表示
                      </button>
                      <button
                        type="button"
                        onClick={() => onDuplicate(record)}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        複製
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(record.id)}
                        className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                      >
                        削除
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
                    <FormulaLine
                      label="電気・ガス・ネット"
                      formula={`(${formatCurrency(utilityBase)} + ${formatCurrency(record.internet ?? 0)}) / ${utilityDivisor}`}
                      amount={calculation.utilityShareAmount}
                    />
                    <FormulaLine
                      label="水道"
                      formula={`${formatCurrency(calculation.waterMonthlyBase)} / ${waterDivisor}`}
                      amount={calculation.waterShareAmount}
                    />
                    <FormulaLine
                      label="エネファーム"
                      formula={`${formatCurrency(calculation.eneFarmMonthlyBase)} / ${eneFarmDivisor}`}
                      amount={calculation.eneFarmShareAmount}
                    />
                    <FormulaLine
                      label="固定資産税"
                      formula={`${formatCurrency(record.fixedAssetAnnual ?? 0)} / 12か月 / ${fixedAssetDivisor}`}
                      amount={calculation.fixedAssetShareAmount}
                    />
                    <FormulaLine
                      label="合計"
                      formula={`${formatCurrency(calculation.utilityShareAmount)} + ${formatCurrency(calculation.waterShareAmount)} + ${formatCurrency(calculation.eneFarmShareAmount)} + ${formatCurrency(calculation.fixedAssetShareAmount)}`}
                      amount={calculation.total}
                      strong
                    />
                  </div>

                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function FormulaLine({
  label,
  formula,
  amount,
  strong = false,
}: {
  label: string;
  formula: string;
  amount: number;
  strong?: boolean;
}) {
  return (
    <div className="grid gap-1 py-2 text-sm sm:grid-cols-[8.5rem_1fr_8.5rem] sm:items-center">
      <p className={strong ? "font-bold text-slate-950" : "font-semibold text-slate-800"}>
        {label}
      </p>
      <p className="break-words text-slate-600">{formula}</p>
      <p
        className={
          strong
            ? "font-bold text-slate-950 sm:text-right"
            : "font-semibold text-slate-950 sm:text-right"
        }
      >
        {formatCurrency(amount)}
      </p>
    </div>
  );
}
