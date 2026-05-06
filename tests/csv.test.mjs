import assert from "node:assert/strict";
import test from "node:test";
import jiti from "./helpers/ts.mjs";

const {
  recordsFromCsv,
  recordsToCsv,
} = jiti("@/lib/csv");

test("recordsFromCsv parses exported monthly records", () => {
  const records = recordsFromCsv([
    "month,electricity,gas,internet,water,eneFarm,fixedAssetAnnual,utilityShare,waterShare,waterSplitMonths,eneFarmShare,eneFarmSplitMonths,fixedAssetShare",
    "2026-04,12000,,5000,8000,3000,120000,0.5,0.5,2,0.5,2,0.3333333333333333",
  ].join("\n"));

  assert.equal(records.length, 1);
  assert.equal(records[0].month, "2026-04");
  assert.equal(records[0].electricity, 12000);
  assert.equal(records[0].gas, null);
  assert.equal(records[0].fixedAssetShare, 1 / 3);
});

test("recordsToCsv includes rounded calculation columns", () => {
  const csv = recordsToCsv([
    {
      id: "record-1",
      month: "2026-04",
      electricity: 12000,
      gas: null,
      internet: 5000,
      water: 8000,
      eneFarm: 3000,
      fixedAssetAnnual: 120000,
      utilityShare: 0.5,
      waterShare: 0.5,
      waterSplitMonths: 2,
      eneFarmShare: 0.5,
      eneFarmSplitMonths: 2,
      fixedAssetShare: 1 / 3,
      note: "",
      createdAt: "2026-04-01T00:00:00.000Z",
      updatedAt: "2026-04-01T00:00:00.000Z",
    },
  ]);

  assert.match(csv, /utilityShareAmount,waterShareAmount/);
  assert.match(csv, /8500,4000,1500,3333,17333/);
});
