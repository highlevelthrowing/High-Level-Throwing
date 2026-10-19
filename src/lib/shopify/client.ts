const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

export class ShopifyNotConfiguredError extends Error {
  constructor() {
    super(
      "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local."
    );
    this.name = "ShopifyNotConfiguredError";
  }
}

export function isShopifyConfigured(): boolean {
  return Boolean(
    process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  );
}

/**
 * quantityAvailable needs the token's unauthenticated_read_product_inventory
 * scope. It is granted, but rather than depend on that staying true, a query
 * refused for want of it is retried once without the field. No per-server
 * memory of the outcome: that made servers disagree about whether to ask, so
 * the same page showed a count on one request and not the next.
 */
const INVENTORY_FIELD = /^\s*quantityAvailable\s*$/m;

function withoutInventory(query: string): string {
  return query.replace(INVENTORY_FIELD, "");
}

function isInventoryScopeError(errors: { message: string }[]): boolean {
  return errors.some(
    (e) =>
      e.message.includes("quantityAvailable") &&
      e.message.includes("unauthenticated_read_product_inventory")
  );
}

/**
 * Shopify is reachable from Vercel most of the time, not all of it. Production
 * logged 204 `TypeError: fetch failed` across 131 visitors in a week —
 * `connect ETIMEDOUT`, `write ETIMEDOUT`, and sockets dropped before the TLS
 * handshake finished. Every one of those rendered an error page, because this
 * module asked once and let the throw travel up into the render.
 *
 * Two things are wrong with asking once. The obvious one is that a transient
 * blip becomes a lost visitor. The quieter one is that nothing sets a deadline,
 * so a stalled connect waits on the kernel (errno -110, past two minutes) while
 * the visitor watches a spinner.
 */
const MAX_ATTEMPTS = 3;
const TIMEOUT_MS = 8_000;

function backoffMs(attempt: number): number {
  // 250ms, 600ms, plus jitter so simultaneous renders do not retry in lockstep
  // and arrive at Shopify as one spike.
  return 250 * Math.pow(2.4, attempt - 1) + Math.random() * 150;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Thrown for an HTTP answer worth asking about again (429, 5xx, non-JSON body). */
class RetryableResponseError extends Error {}

/**
 * True only for failures that happened while establishing the connection, which
 * means the request never reached Shopify. That distinction is what makes a
 * retry safe for a mutation: re-sending cartLinesAdd after Shopify already
 * processed it would add the line twice.
 */
function isConnectionFailure(error: unknown): boolean {
  const codes = new Set([
    "ECONNRESET",
    "ETIMEDOUT",
    "ENOTFOUND",
    "EAI_AGAIN",
    "ECONNREFUSED",
    "UND_ERR_CONNECT_TIMEOUT",
    "UND_ERR_SOCKET",
  ]);
  for (let e: unknown = error, depth = 0; e && depth < 4; depth++) {
    const code = (e as { code?: string }).code;
    if (code && codes.has(code)) return true;
    e = (e as { cause?: unknown }).cause;
  }
  return false;
}

function isTimeoutAbort(error: unknown): boolean {
  return (error as { name?: string })?.name === "TimeoutError";
}

export async function shopifyFetch<T>({
  query,
  variables,
  cache = "force-cache",
  revalidate,
}: {
  query: string;
  variables?: Record<string, unknown>;
  cache?: RequestCache;
  revalidate?: number;
}): Promise<T> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!domain || !token) {
    throw new ShopifyNotConfiguredError();
  }

  const headers = {
    "Content-Type": "application/json",
    // Headless-channel private tokens (shpat_*) authenticate with a different
    // header than public storefront tokens.
    ...(token.startsWith("shpat_")
      ? { "Shopify-Storefront-Private-Token": token }
      : { "X-Shopify-Storefront-Access-Token": token }),
  };

  const isMutation = /^\s*mutation\b/m.test(query);

  async function send(body: string) {
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const res = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
          method: "POST",
          headers,
          body,
          cache: revalidate === undefined ? cache : undefined,
          next: revalidate === undefined ? undefined : { revalidate },
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });

        if (res.status === 429 || res.status >= 500) {
          throw new RetryableResponseError(`Shopify responded ${res.status}`);
        }

        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch {
          // Shopify sometimes answers with an HTML error page instead of JSON;
          // production logged that as `Unexpected token '<', "<!DOCTYPE "`.
          throw new RetryableResponseError(
            `Shopify returned a non-JSON body (${res.status})`
          );
        }
      } catch (error) {
        lastError = error;

        // A request that never left is always safe to repeat. Everything else
        // — a timeout mid-flight, a 5xx — may already have been applied, so it
        // is repeated for reads only.
        const safeToRepeat =
          isConnectionFailure(error) ||
          (!isMutation && (isTimeoutAbort(error) || error instanceof RetryableResponseError));

        if (!safeToRepeat || attempt === MAX_ATTEMPTS) throw error;
        await sleep(backoffMs(attempt));
      }
    }

    throw lastError;
  }

  const asksForInventory = INVENTORY_FIELD.test(query);

  let json = await send(JSON.stringify({ query, variables }));

  if (json.errors && asksForInventory && isInventoryScopeError(json.errors)) {
    json = await send(JSON.stringify({ query: withoutInventory(query), variables }));
  }

  if (json.errors) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join("\n"));
  }

  return json.data as T;
}
