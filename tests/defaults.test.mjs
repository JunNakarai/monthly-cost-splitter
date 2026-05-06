import assert from "node:assert/strict";
import test from "node:test";
import jiti from "./helpers/ts.mjs";

const {
  currentMonthValue,
  nextMonthValue,
  previousMonthValue,
} = jiti("@/lib/defaults");

test("month helpers format and move between months", () => {
  assert.equal(currentMonthValue(new Date(2026, 0, 5)), "2026-01");
  assert.equal(nextMonthValue("2026-12"), "2027-01");
  assert.equal(previousMonthValue("2026-01"), "2025-12");
});

test("invalid month helpers fall back to the current month format", () => {
  assert.match(nextMonthValue("bad-input"), /^\d{4}-\d{2}$/);
  assert.match(previousMonthValue("bad-input"), /^\d{4}-\d{2}$/);
});
