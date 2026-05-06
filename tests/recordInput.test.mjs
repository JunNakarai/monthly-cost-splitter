import assert from "node:assert/strict";
import test from "node:test";
import jiti from "./helpers/ts.mjs";

const {
  isWaterInputMonth,
  normalizeWaterInput,
  recordToInput,
} = jiti("@/lib/recordInput");

test("water input is enabled only on even months", () => {
  assert.equal(isWaterInputMonth("2026-04"), true);
  assert.equal(isWaterInputMonth("2026-05"), false);
});

test("normalizeWaterInput clears water on odd months", () => {
  const input = {
    month: "2026-05",
    electricity: null,
    gas: null,
    internet: null,
    water: 8000,
    eneFarm: null,
    fixedAssetAnnual: null,
    utilityShare: 0.5,
    waterShare: 0.5,
    waterSplitMonths: 2,
    eneFarmShare: 0.5,
    eneFarmSplitMonths: 2,
    fixedAssetShare: 1 / 3,
    note: "",
  };

  assert.equal(normalizeWaterInput(input).water, null);
});

test("recordToInput combines old electricity and gas fields for editing", () => {
  const input = recordToInput({
    id: "record-1",
    month: "2026-04",
    electricity: 7000,
    gas: 5000,
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
    note: "stored note",
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
  });

  assert.equal(input.electricity, 12000);
  assert.equal(input.gas, null);
  assert.equal(input.note, "");
});
