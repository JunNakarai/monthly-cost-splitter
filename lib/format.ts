export function formatCurrency(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${safeValue.toLocaleString("ja-JP", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} 円`;
}

export function formatNumberInput(value: number | null): string {
  return value === null || !Number.isFinite(value) ? "" : String(value);
}

export function formatPercent(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${(safeValue * 100).toLocaleString("ja-JP", {
    maximumFractionDigits: 2,
  })}%`;
}

export function parseNumberInput(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseRequiredNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
