"use client";

import { FormEvent, useState } from "react";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { parseRequiredNumber } from "@/lib/format";
import type { AppSettings } from "@/types";

type SettingsPanelProps = {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
};

const settingsFields = [
  {
    key: "defaultEneFarm",
    label: "デフォルト エネファーム代",
    min: 0,
    max: undefined,
    step: 1,
  },
  {
    key: "defaultFixedAssetAnnual",
    label: "デフォルト固定資産税年額",
    min: 0,
    max: undefined,
    step: 1,
  },
  {
    key: "defaultUtilityShare",
    label: "デフォルト 電気・ガス・ネット負担割合",
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    key: "defaultWaterShare",
    label: "デフォルト 水道負担割合",
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    key: "defaultEneFarmShare",
    label: "デフォルト エネファーム負担割合",
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    key: "defaultFixedAssetShare",
    label: "デフォルト 固定資産税負担割合",
    min: 0,
    max: 1,
    step: 0.01,
  },
] as const;

export function SettingsPanel({ settings, onSave }: SettingsPanelProps) {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [message, setMessage] = useState("");

  function updateField<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized: AppSettings = {
      defaultEneFarm: Math.max(0, draft.defaultEneFarm),
      defaultFixedAssetAnnual: Math.max(0, draft.defaultFixedAssetAnnual),
      defaultUtilityShare: clampShare(draft.defaultUtilityShare),
      defaultWaterShare: clampShare(draft.defaultWaterShare),
      defaultWaterSplitMonths: Math.max(
        1,
        Math.floor(draft.defaultWaterSplitMonths),
      ),
      defaultEneFarmShare: clampShare(draft.defaultEneFarmShare),
      defaultEneFarmSplitMonths: Math.max(
        1,
        Math.floor(draft.defaultEneFarmSplitMonths),
      ),
      defaultFixedAssetShare: clampShare(draft.defaultFixedAssetShare),
    };
    setDraft(normalized);
    onSave(normalized);
    setMessage("設定を保存しました。");
  }

  function handleReset() {
    setDraft(DEFAULT_SETTINGS);
    onSave(DEFAULT_SETTINGS);
    setMessage("初期設定に戻しました。");
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-950">負担条件の設定</h2>
        <p className="mt-1 text-sm text-slate-600">
          エネファーム代、固定資産税年額、負担割合を保存します。新規作成時にこの値を使います。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {settingsFields.map(({ key, label, min, max, step }) => (
            <label key={key} className="block">
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <input
                type="number"
                inputMode="decimal"
                min={min}
                max={max}
                step={step}
                value={draft[key]}
                onChange={(event) =>
                  updateField(key, parseRequiredNumber(event.target.value))
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-700"
              />
            </label>
          ))}
        </div>

        {message && <p className="text-sm text-slate-600">{message}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            設定を保存
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            初期値に戻す
          </button>
        </div>
      </form>
    </section>
  );
}

function clampShare(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(Math.max(value, 0), 1);
}
