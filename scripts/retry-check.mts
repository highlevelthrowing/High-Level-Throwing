// Run: npx tsx scripts/retry-check.mts
//
// Guards the retry rules in src/lib/shopify/client.ts. The one that matters
// is case 3: a mutation must not be repeated after an ambiguous failure,
// because Shopify may already have applied it.
import assert from "node:assert";
process.env.SHOPIFY_STORE_DOMAIN = "example.myshopify.com";
process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "test-token";
const { shopifyFetch } = await import(
  "../src/lib/shopify/client.ts"
);

const ok = (data: unknown) =>
  new Response(JSON.stringify({ data }), { status: 200, headers: { "content-type": "application/json" } });
function connErr() {
  const e: any = new TypeError("fetch failed");
  e.cause = Object.assign(new Error("connect ETIMEDOUT 23.227.38.74:443"), { code: "ETIMEDOUT" });
  return e;
}

let calls = 0;
const run = async (name: string, impl: () => Promise<Response>, query: string) => {
  calls = 0;
  globalThis.fetch = (async () => { calls++; return impl(); }) as any;
  let threw: unknown = null;
  let out: unknown = null;
  try { out = await shopifyFetch({ query, cache: "no-store" }); } catch (e) { threw = e; }
  return { name, calls, out, threw };
};

// 1. query, connection fails twice then succeeds -> retried, recovered
let n = 0;
let r = await run("query recovers after 2 connection failures",
  async () => { if (++n <= 2) throw connErr(); return ok({ shop: "ok" }); },
  "query { shop { name } }");
console.log(`  ${r.name}: attempts=${r.calls} recovered=${!r.threw}`);
assert.equal(r.calls, 3); assert.equal(r.threw, null);

// 2. query, 503 every time -> retried to the limit then throws
r = await run("query retries 503 to the limit",
  async () => new Response("<!DOCTYPE html>", { status: 503 }),
  "query { shop { name } }");
console.log(`  ${r.name}: attempts=${r.calls} threw=${!!r.threw}`);
assert.equal(r.calls, 3); assert.ok(r.threw);

// 3. MUTATION + 503 -> must NOT retry (may already have been applied)
r = await run("mutation does NOT retry a 503",
  async () => new Response("boom", { status: 503 }),
  "mutation { cartLinesAdd { cart { id } } }");
console.log(`  ${r.name}: attempts=${r.calls} threw=${!!r.threw}`);
assert.equal(r.calls, 1); assert.ok(r.threw);

// 4. MUTATION + connection failure -> safe to retry, request never left
n = 0;
r = await run("mutation DOES retry a connection failure",
  async () => { if (++n <= 1) throw connErr(); return ok({ cartLinesAdd: { cart: { id: "1" } } }); },
  "mutation { cartLinesAdd { cart { id } } }");
console.log(`  ${r.name}: attempts=${r.calls} recovered=${!r.threw}`);
assert.equal(r.calls, 2); assert.equal(r.threw, null);

// 5. HTML body on a 200 (the "<!DOCTYPE" SyntaxError in production) -> retried
r = await run("query retries a non-JSON 200 body",
  async () => new Response("<!DOCTYPE html><html>502</html>", { status: 200 }),
  "query { shop { name } }");
console.log(`  ${r.name}: attempts=${r.calls} threw=${!!r.threw}`);
assert.equal(r.calls, 3); assert.ok(r.threw);

console.log("\n  all retry assertions passed");
