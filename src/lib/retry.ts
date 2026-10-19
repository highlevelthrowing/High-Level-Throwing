/**
 * Shopify closes idle connections; Vercel freezes the function holding them.
 * When the function thaws, undici hands back a pooled socket it still believes
 * is open, writes the request, and reads nothing — production logs show that as
 * `UND_ERR_SOCKET: other side closed` with `bytesWritten: 1965, bytesRead: 0`.
 * The socket was dead before the request was written, so nothing reached
 * Shopify and asking again on a fresh connection is both safe and sufficient.
 *
 * Shared by the Storefront API client and the page proxy, which talk to the
 * same host and fail the same way. Keeping the classification in one place is
 * the point: the rule about what may be repeated is safety-critical.
 */
export const MAX_ATTEMPTS = 3;
export const TIMEOUT_MS = 8_000;

export function backoffMs(attempt: number): number {
  // Jittered so concurrent renders do not retry in lockstep and arrive at
  // Shopify as a single spike — a page can have three calls in flight at once.
  return 250 * Math.pow(2.4, attempt - 1) + Math.random() * 150;
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** An HTTP answer worth asking about again: 429, 5xx, or a body that is not JSON. */
export class RetryableResponseError extends Error {}

/**
 * True only for failures raised while establishing or writing to the
 * connection, which means the request never reached Shopify. That distinction
 * is what makes a retry safe for a mutation: re-sending cartLinesAdd after
 * Shopify already processed it would add the line twice.
 */
export function isConnectionFailure(error: unknown): boolean {
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

export function isTimeoutAbort(error: unknown): boolean {
  return (error as { name?: string })?.name === "TimeoutError";
}

/**
 * For plain GETs, where there is no mutation to double-apply, so every
 * transient failure is worth repeating.
 */
export async function fetchWithRetry(url: string, init: RequestInit = {}): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (res.status === 429 || res.status >= 500) {
        throw new RetryableResponseError(`Upstream responded ${res.status}`);
      }
      return res;
    } catch (error) {
      lastError = error;
      const worthRepeating =
        isConnectionFailure(error) ||
        isTimeoutAbort(error) ||
        error instanceof RetryableResponseError;
      if (!worthRepeating || attempt === MAX_ATTEMPTS) throw error;
      await sleep(backoffMs(attempt));
    }
  }

  throw lastError;
}
