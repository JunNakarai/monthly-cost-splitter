export type MonthlyRecord = {
  id: string;
  month: string;
  electricity: number | null;
  gas: number | null;
  internet: number | null;
  water: number | null;
  eneFarm: number | null;
  fixedAssetAnnual: number | null;
  utilityShare: number;
  waterShare: number;
  waterSplitMonths: number;
  eneFarmShare: number;
  eneFarmSplitMonths: number;
  fixedAssetShare: number;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type AppSettings = {
  defaultEneFarm: number;
  defaultFixedAssetAnnual: number;
  defaultUtilityShare: number;
  defaultWaterShare: number;
  defaultWaterSplitMonths: number;
  defaultEneFarmShare: number;
  defaultEneFarmSplitMonths: number;
  defaultFixedAssetShare: number;
};

export type CalculationResult = {
  utilitySubtotal: number;
  utilityShareAmount: number;
  waterMonthlyBase: number;
  waterShareAmount: number;
  eneFarmMonthlyBase: number;
  eneFarmShareAmount: number;
  fixedAssetMonthlyBase: number;
  fixedAssetShareAmount: number;
  total: number;
};

export type RecordInput = Omit<MonthlyRecord, "id" | "createdAt" | "updatedAt">;
