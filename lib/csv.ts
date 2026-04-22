import { calculateRecord } from "@/lib/calculations";
import type { MonthlyRecord } from "@/types";

const CSV_COLUMNS = [
  "month",
  "electricity",
  "gas",
  "internet",
  "water",
  "eneFarm",
  "fixedAssetAnnual",
  "utilityShare",
  "waterShare",
  "waterSplitMonths",
  "eneFarmShare",
  "eneFarmSplitMonths",
  "fixedAssetShare",
  "utilityShareAmount",
  "waterShareAmount",
  "eneFarmShareAmount",
  "fixedAssetShareAmount",
  "total",
];

function escapeCsvCell(value: string | number | null): string {
  if (value === null) {
    return "";
  }
  const stringValue = String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

function roundedResult(value: number): number {
  return Number.isFinite(value) ? Math.round(value) : 0;
}

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const nextChar = csv[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      currentCell += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      currentRow.push(currentCell);
      if (currentRow.some((cell) => cell !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
      continue;
    }
    currentCell += char;
  }

  currentRow.push(currentCell);
  if (currentRow.some((cell) => cell !== "")) {
    rows.push(currentRow);
  }
  return rows;
}

function parseNullableNumber(value: string | undefined): number | null {
  if (!value || value.trim() === "") {
    return null;
  }
  const normalized = value.replace(/,/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseNumber(value: string | undefined, fallback: number): number {
  return parseNullableNumber(value) ?? fallback;
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function recordsFromCsv(csv: string): MonthlyRecord[] {
  const rows = parseCsvRows(csv.replace(/^\uFEFF/, ""));
  if (rows.length < 2) {
    return [];
  }
  const headers = rows[0];
  const indexByHeader = new Map(headers.map((header, index) => [header, index]));
  const now = new Date().toISOString();

  return rows
    .slice(1)
    .map((row) => {
      const get = (key: string) => row[indexByHeader.get(key) ?? -1];
      const month = get("month");
      if (!month) {
        return null;
      }
      return {
        id: createId(),
        month,
        electricity: parseNullableNumber(get("electricity")),
        gas: parseNullableNumber(get("gas")),
        internet: parseNullableNumber(get("internet")),
        water: parseNullableNumber(get("water")),
        eneFarm: parseNullableNumber(get("eneFarm")),
        fixedAssetAnnual: parseNullableNumber(get("fixedAssetAnnual")),
        utilityShare: parseNumber(get("utilityShare"), 0.5),
        waterShare: parseNumber(get("waterShare"), 0.5),
        waterSplitMonths: parseNumber(get("waterSplitMonths"), 2),
        eneFarmShare: parseNumber(get("eneFarmShare"), 0.5),
        eneFarmSplitMonths: parseNumber(get("eneFarmSplitMonths"), 2),
        fixedAssetShare: parseNumber(get("fixedAssetShare"), 1 / 3),
        note: "",
        createdAt: now,
        updatedAt: now,
      } satisfies MonthlyRecord;
    })
    .filter((record): record is MonthlyRecord => record !== null);
}

export function recordsToCsv(records: MonthlyRecord[]): string {
  const rows = records.map((record) => {
    const calculation = calculateRecord(record);
    return [
      record.month,
      record.electricity,
      record.gas,
      record.internet,
      record.water,
      record.eneFarm,
      record.fixedAssetAnnual,
      record.utilityShare,
      record.waterShare,
      record.waterSplitMonths,
      record.eneFarmShare,
      record.eneFarmSplitMonths,
      record.fixedAssetShare,
      roundedResult(calculation.utilityShareAmount),
      roundedResult(calculation.waterShareAmount),
      roundedResult(calculation.eneFarmShareAmount),
      roundedResult(calculation.fixedAssetShareAmount),
      roundedResult(calculation.total),
    ].map(escapeCsvCell);
  });

  return [CSV_COLUMNS, ...rows].map((row) => row.join(",")).join("\n");
}

export function downloadCsv(records: MonthlyRecord[]): void {
  const csv = recordsToCsv(records);
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "monthly-cost-splitter.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
