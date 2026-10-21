// Run: npx tsx scripts/path-repair-check.mts
//
// Guards src/lib/repair-path.ts. The cases that matter are the last two: a
// valid %C2%AE must survive untouched, and an unrepairable path must return
// null so the caller 404s rather than redirecting somewhere invented.
import assert from "node:assert";
import { repairPath, pathDecodes } from "../src/lib/repair-path.ts";

const cases: [string, string | null, string][] = [
  ["/products/high-level-pitching%AE-youth", "/products/high-level-pitching-youth",
   "the real production 500 repairs to the renamed handle"],
  ["/products/high-level-pitching%AE-softball", "/products/high-level-pitching-softball",
   "second production 500 repairs too"],
  ["/products/high-level-pitching-youth", null,
   "a clean path is left alone (null = no action)"],
  ["/blogs/news/high-level-throwing%C2%AE-x-supercollider-how-data-ai-are-shaping-sport", null,
   "a VALID %C2%AE decodes, so it is never touched"],
  ["/products/a%AEb%C2%AEc", "/products/ab%C2%AEc",
   "drops only the broken run, keeps the valid ® in the same path"],
  ["/products/%AE", "/products/", "escape-only segment repairs to a bare path"],
];

for (const [input, expected, why] of cases) {
  const got = repairPath(input);
  const ok = got === expected;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${why}\n       ${input}\n       -> ${got}`);
  assert.strictEqual(got, expected, why);
}

assert.strictEqual(pathDecodes("/products/high-level-pitching%AE-youth"), false);
assert.strictEqual(pathDecodes("/products/high-level-pitching-youth"), true);
console.log("\n  all path-repair assertions passed");
