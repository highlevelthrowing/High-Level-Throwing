// Run: npx tsx scripts/path-repair-check.mts
//
// Guards src/lib/repair-path.ts. The cases that matter are the last two: a
// valid %C2%AE must survive untouched, and an unrepairable path must return
// null so the caller 404s rather than redirecting somewhere invented.
import assert from "node:assert";
import { repairPath, pathDecodes } from "../src/lib/repair-path.ts";

const cases: [string, string | null, string][] = [
  ["/products/high-level-pitching%AE-youth", "/products/high-level-pitching%C2%AE-youth",
   "the production 500 is repaired to the properly encoded ®, not stripped"],
  ["/products/high-level-pitching%AE-bundle", "/products/high-level-pitching%C2%AE-bundle",
   "CRITICAL: stripping would land on the $655 team bundle, a different product"],
  ["/products/high-level-pitching-youth", null,
   "a clean path is left alone (null = no action)"],
  ["/blogs/news/high-level-throwing%C2%AE-x-supercollider-how-data-ai-are-shaping-sport", null,
   "a VALID %C2%AE decodes, so it is never touched"],
  ["/products/a%AEb%C2%AEc", "/products/a%C2%AEb%C2%AEc",
   "repairs the broken byte and leaves the valid ® in the same path alone"],
  ["/products/%FF%FE", "/products/", "a byte that cannot be reconstructed is dropped"],
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
