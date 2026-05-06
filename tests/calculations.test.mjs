import assert from "node:assert/strict";
import test from "node:test";
import jiti from "./helpers/ts.mjs";

const {
  calculateRecord,
  divisorFromShare,
} = jiti("@/lib/calculations");

test("divisorFromShare converts shares to practical divisors", () => {
  assert.equal(divisorFromShare(0.5), 2);
  assert.equal(divisorFromShare(1 / 3), 3);
  assert.equal(divisorFromShare(0), 0);
  assert.equal(divisorFromShare(Number.NaN), 0);
});

test("calculateRecord totals utility, water, ene farm, and fixed asset shares", () => {
  const result = calculateRecord({
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
  });

  assert.equal(result.utilitySubtotal, 17000);
  assert.equal(result.utilityShareAmount, 8500);
  assert.equal(result.waterShareAmount, 4000);
  assert.equal(result.eneFarmShareAmount, 1500);
  assert.equal(result.fixedAssetShareAmount, 10000 / 3);
  assert.equal(result.total, 17333.333333333332);
});
