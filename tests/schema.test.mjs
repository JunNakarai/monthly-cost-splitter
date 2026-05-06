import assert from "node:assert/strict";
import test from "node:test";
import jiti from "./helpers/ts.mjs";

const {
  normalizeRecords,
  normalizeSettings,
  safeJsonParse,
} = jiti("@/lib/schema");

test("safeJsonParse returns null for invalid or empty JSON", () => {
  assert.equal(safeJsonParse(""), null);
  assert.equal(safeJsonParse("{bad"), null);
  assert.deepEqual(safeJsonParse('{"ok":true}'), { ok: true });
});

test("normalizeRecords keeps only complete monthly records", () => {
  const valid = {
    id: "record-1",
    month: "2026-04",
    electricity: 12000,
    gas: null,
    internet: 5000,
    water: null,
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
  };

  assert.deepEqual(normalizeRecords([valid, { ...valid, id: 10 }]), [valid]);
});

test("normalizeSettings fills missing values from defaults", () => {
  const settings = normalizeSettings({
    defaultEneFarm: 3000,
    defaultUtilityShare: 0.4,
  });

  assert.equal(settings.defaultEneFarm, 3000);
  assert.equal(settings.defaultUtilityShare, 0.4);
  assert.equal(settings.defaultWaterSplitMonths, 2);
});
