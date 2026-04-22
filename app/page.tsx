"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MonthlyForm } from "@/components/MonthlyForm";
import { MonthlyChart } from "@/components/MonthlyChart";
import { MonthlyList } from "@/components/MonthlyList";
import { SettingsPanel } from "@/components/SettingsPanel";
import { SyncPanel } from "@/components/SyncPanel";
import { currentMonthValue, nextMonthValue } from "@/lib/defaults";
import { recordsFromCsv } from "@/lib/csv";
import { saveCloudData, subscribeCloudData } from "@/lib/cloudStorage";
import {
  isFirebaseConfigured,
  signInWithGoogle,
  signOutFromGoogle,
  subscribeAuthState,
  type FirebaseUser,
} from "@/lib/firebase";
import {
  loadRecords,
  loadSettings,
  saveRecords,
  saveSettings,
} from "@/lib/storage";
import type { AppSettings, MonthlyRecord, RecordInput } from "@/types";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function sortRecords(records: MonthlyRecord[]): MonthlyRecord[] {
  return [...records].sort((a, b) => b.month.localeCompare(a.month));
}

function combineElectricityAndGas(record: MonthlyRecord): MonthlyRecord {
  const electricityGasTotal = (record.electricity ?? 0) + (record.gas ?? 0);
  return {
    ...record,
    electricity: electricityGasTotal > 0 ? electricityGasTotal : null,
    gas: null,
  };
}

export default function Home() {
  const [records, setRecords] = useState<MonthlyRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue());
  const [cloudUser, setCloudUser] = useState<FirebaseUser | null>(null);
  const [syncStatus, setSyncStatus] = useState("ローカル保存のみ");
  const isCloudConfigured = isFirebaseConfigured();
  const recordsRef = useRef<MonthlyRecord[]>([]);
  const settingsRef = useRef<AppSettings | null>(null);

  useEffect(() => {
    setSettings(loadSettings());
    setRecords(sortRecords(loadRecords()));
  }, []);

  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const isSettingsReady = Boolean(settings);

  useEffect(() => {
    if (!isCloudConfigured) {
      setSyncStatus("Firebase設定を追加するとサーバー保存できます。");
      return;
    }

    return subscribeAuthState((user) => {
      setCloudUser(user);
      setSyncStatus(user ? "Firestoreに接続中..." : "Google未ログイン");
    });
  }, [isCloudConfigured]);

  useEffect(() => {
    if (!isCloudConfigured || !cloudUser || !settingsRef.current) {
      return;
    }

    const currentSettings = settingsRef.current;
    setSyncStatus("Firestoreから読み込み中...");
    return subscribeCloudData(
      cloudUser.uid,
      (cloudData) => {
        if (!cloudData) {
          saveCloudData(
            cloudUser.uid,
            recordsRef.current,
            currentSettings,
          )
            .then(() => setSyncStatus("Firestoreに初期データを保存しました。"))
            .catch(() => setSyncStatus("Firestore保存に失敗しました。"));
          return;
        }

        const sortedCloudRecords = sortRecords(cloudData.records);
        setRecords(sortedCloudRecords);
        saveRecords(sortedCloudRecords);
        setSettings(cloudData.settings);
        saveSettings(cloudData.settings);
        setSyncStatus("Firestore同期済み");
      },
      () => setSyncStatus("Firestoreの読み込みに失敗しました。"),
    );
  }, [cloudUser, isCloudConfigured, isSettingsReady]);

  const selectedRecord = useMemo(
    () => records.find((record) => record.month === selectedMonth) ?? null,
    [records, selectedMonth],
  );

  function persistCloud(
    nextRecords: MonthlyRecord[],
    nextSettings = settingsRef.current,
  ) {
    if (!isCloudConfigured || !cloudUser || !nextSettings) {
      return;
    }

    setSyncStatus("Firestoreへ保存中...");
    saveCloudData(cloudUser.uid, nextRecords, nextSettings)
      .then(() => setSyncStatus("Firestore同期済み"))
      .catch(() => setSyncStatus("Firestore保存に失敗しました。"));
  }

  function persistRecords(
    nextRecords: MonthlyRecord[],
    nextSettings = settingsRef.current,
  ) {
    const sorted = sortRecords(nextRecords);
    setRecords(sorted);
    saveRecords(sorted);
    persistCloud(sorted, nextSettings);
  }

  function normalizeInputWithSettings(input: RecordInput): RecordInput | null {
    if (!settings) {
      return null;
    }
    return {
      ...input,
      water: input.water,
      eneFarm: settings.defaultEneFarm || null,
      fixedAssetAnnual: settings.defaultFixedAssetAnnual || null,
      utilityShare: settings.defaultUtilityShare,
      waterShare: settings.defaultWaterShare,
      waterSplitMonths: settings.defaultWaterSplitMonths,
      eneFarmShare: settings.defaultEneFarmShare,
      eneFarmSplitMonths: settings.defaultEneFarmSplitMonths,
      fixedAssetShare: settings.defaultFixedAssetShare,
    };
  }

  function handleInputChange(input: RecordInput) {
    const inputWithSettings = normalizeInputWithSettings(input);
    if (!inputWithSettings) {
      return;
    }

    const now = new Date().toISOString();
    const existing = records.find((record) => record.month === input.month);
    if (existing) {
      persistRecords(
        records.map((record) =>
          record.id === existing.id
            ? { ...record, ...inputWithSettings, updatedAt: now }
            : record,
        ),
      );
      return;
    }

    persistRecords([
      ...records,
      {
        ...inputWithSettings,
        id: createId(),
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }

  function handleDelete(id: string) {
    if (!window.confirm("このレコードを削除しますか？")) {
      return;
    }
    persistRecords(records.filter((record) => record.id !== id));
    const deletedRecord = records.find((record) => record.id === id);
    if (deletedRecord?.month === selectedMonth) {
      setSelectedMonth(currentMonthValue());
    }
  }

  function handleDuplicate(record: MonthlyRecord) {
    const now = new Date().toISOString();
    const source = combineElectricityAndGas(record);
    const duplicated: MonthlyRecord = {
      ...source,
      id: createId(),
      month: nextMonthValue(source.month),
      eneFarm: settings?.defaultEneFarm || null,
      fixedAssetAnnual: settings?.defaultFixedAssetAnnual || null,
      createdAt: now,
      updatedAt: now,
    };
    persistRecords([...records, duplicated]);
    setSelectedMonth(duplicated.month);
  }

  function handleSettingsSave(nextSettings: AppSettings) {
    setSettings(nextSettings);
    saveSettings(nextSettings);
    const selected = records.find((record) => record.month === selectedMonth);
    if (!selected) {
      persistCloud(records, nextSettings);
      return;
    }
    const updated: MonthlyRecord = {
      ...selected,
      eneFarm: nextSettings.defaultEneFarm || null,
      fixedAssetAnnual: nextSettings.defaultFixedAssetAnnual || null,
      utilityShare: nextSettings.defaultUtilityShare,
      waterShare: nextSettings.defaultWaterShare,
      waterSplitMonths: nextSettings.defaultWaterSplitMonths,
      eneFarmShare: nextSettings.defaultEneFarmShare,
      eneFarmSplitMonths: nextSettings.defaultEneFarmSplitMonths,
      fixedAssetShare: nextSettings.defaultFixedAssetShare,
      updatedAt: new Date().toISOString(),
    };
    persistRecords(
      records.map((record) => (record.id === selected.id ? updated : record)),
      nextSettings,
    );
  }

  function handleImportRecords(importedRecords: MonthlyRecord[]) {
    if (importedRecords.length === 0) {
      window.alert("読み込めるレコードがありませんでした。");
      return;
    }

    const importedMonths = new Set(
      importedRecords.map((record) => record.month),
    );
    const sortedImportedRecords = sortRecords(importedRecords);
    const newestImportedRecord = sortedImportedRecords[0];
    const importedSettings: AppSettings = {
      defaultEneFarm: newestImportedRecord.eneFarm ?? 0,
      defaultFixedAssetAnnual: newestImportedRecord.fixedAssetAnnual ?? 0,
      defaultUtilityShare: newestImportedRecord.utilityShare,
      defaultWaterShare: newestImportedRecord.waterShare,
      defaultWaterSplitMonths: newestImportedRecord.waterSplitMonths,
      defaultEneFarmShare: newestImportedRecord.eneFarmShare,
      defaultEneFarmSplitMonths: newestImportedRecord.eneFarmSplitMonths,
      defaultFixedAssetShare: newestImportedRecord.fixedAssetShare,
    };

    setSettings(importedSettings);
    saveSettings(importedSettings);
    persistRecords([
      ...records.filter((record) => !importedMonths.has(record.month)),
      ...importedRecords,
    ], importedSettings);
    setSelectedMonth(newestImportedRecord.month);
  }

  async function handleImportCsv(file: File) {
    const csv = await file.text();
    handleImportRecords(recordsFromCsv(csv));
  }

  if (!settings) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-sm text-slate-600">読み込み中...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:py-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-slate-500">
          localStorage / Firestore
        </p>
        <h1 className="text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl">
          月別折半費用計算
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          電気・ガス・ネット、水道、エネファーム、固定資産税の月別負担額を計算します。
        </p>
      </header>

      <SyncPanel
        isConfigured={isCloudConfigured}
        user={cloudUser}
        status={syncStatus}
        onSignIn={() => {
          signInWithGoogle().catch(() =>
            setSyncStatus("Googleログインに失敗しました。"),
          );
        }}
        onSignOut={() => {
          signOutFromGoogle().catch(() =>
            setSyncStatus("ログアウトに失敗しました。"),
          );
        }}
      />

      <MonthlyChart
        records={records}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
      />

      <MonthlyForm
        settings={settings}
        selectedMonth={selectedMonth}
        record={selectedRecord}
        onMonthChange={setSelectedMonth}
        onInputChange={handleInputChange}
      />

      <SettingsPanel settings={settings} onSave={handleSettingsSave} />

      <MonthlyList
        records={records}
        selectedMonth={selectedMonth}
        onImportCsv={handleImportCsv}
        onEdit={(record) => setSelectedMonth(record.month)}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
      />
    </main>
  );
}
