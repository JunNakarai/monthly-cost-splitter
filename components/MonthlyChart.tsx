"use client";

import { calculateRecord } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";
import type { MonthlyRecord } from "@/types";

type MonthlyChartProps = {
  records: MonthlyRecord[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
};

const segmentMeta = [
  {
    key: "utilityShareAmount",
    label: "電気・ガス・ネット",
    color: "bg-blue-600",
  },
  { key: "waterShareAmount", label: "水道", color: "bg-teal-600" },
  { key: "eneFarmShareAmount", label: "エネファーム", color: "bg-amber-500" },
  { key: "fixedAssetShareAmount", label: "固定資産税", color: "bg-rose-500" },
] as const;

export function MonthlyChart({
  records,
  selectedMonth,
  onSelectMonth,
}: MonthlyChartProps) {
  const chartRows = [...records]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((record) => ({
      record,
      calculation: calculateRecord(record),
    }));
  const maxTotal = Math.max(
    1,
    ...chartRows.map(({ calculation }) => calculation.total),
  );
  const selectedRow =
    chartRows.find(({ record }) => record.month === selectedMonth) ??
    chartRows.at(-1) ??
    null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">月別グラフ</h2>
          <p className="mt-1 text-sm text-slate-600">
            月ごとの合計と費目別の内訳を確認できます。
          </p>
        </div>
        {selectedRow && (
          <div className="text-left sm:text-right">
            <p className="text-sm font-semibold text-slate-500">
              {selectedRow.record.month}
            </p>
            <p className="text-2xl font-bold text-slate-950">
              {formatCurrency(selectedRow.calculation.total)}
            </p>
          </div>
        )}
      </div>

      {chartRows.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          グラフに表示するレコードがありません。
        </p>
      ) : (
        <div className="space-y-5">
          <div className="overflow-x-auto">
            <div className="flex min-w-[42rem] items-end gap-4 border-b border-slate-200 pb-3">
              {chartRows.map(({ record, calculation }) => {
                const isSelected = record.month === selectedMonth;
                const totalHeight = Math.max(
                  10,
                  Math.round((calculation.total / maxTotal) * 180),
                );
                return (
                  <button
                    key={record.id}
                    type="button"
                    onClick={() => onSelectMonth(record.month)}
                    className="group flex w-20 flex-col items-center gap-2 text-center"
                    aria-label={`${record.month}を表示`}
                  >
                    <span className="text-xs font-semibold text-slate-600">
                      {formatCurrency(calculation.total)}
                    </span>
                    <span
                      className={`flex w-12 flex-col-reverse overflow-hidden rounded-md border bg-slate-100 ${
                        isSelected
                          ? "border-slate-950 ring-2 ring-slate-300"
                          : "border-slate-200 group-hover:border-slate-400"
                      }`}
                      style={{ height: `${totalHeight}px` }}
                    >
                      {segmentMeta.map(({ key, color }) => {
                        const amount = calculation[key];
                        if (amount <= 0 || calculation.total <= 0) {
                          return null;
                        }
                        return (
                          <span
                            key={key}
                            className={color}
                            style={{
                              height: `${Math.max(4, (amount / calculation.total) * totalHeight)}px`,
                            }}
                          />
                        );
                      })}
                    </span>
                    <span
                      className={
                        isSelected
                          ? "text-sm font-bold text-slate-950"
                          : "text-sm font-medium text-slate-500"
                      }
                    >
                      {record.month.slice(5)}月
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {segmentMeta.map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-sm ${color}`} />
                <span className="text-sm text-slate-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
