import crypto from "node:crypto";

/**
 * Shopify → Klaviyo marketing consent, delivered by us instead of Klaviyo.
 *
 * Klaviyo's own Shopify integration is supposed to carry marketing consent
 * across when a customer ticks the box at checkout. It does so unreliably: on
 * 2026-10-22 a full cross-check found 3,778 of 20,707 subscribed Shopify
 * customers (18.2%) sitting in Klaviyo as NEVER_SUBSCRIBED, with method,
 * consent_timestamp and double_optin all null — no pending state, no
 * confirmation email, nothing. They had consented and were invisible to every
 * campaign. Re-measured on 2026-10-31 over customers created in the preceding
 * nine days, the rate was 30%.
 *
 * The failure is inside Klaviyo's integration and only Klaviyo can repair it.
 * This route makes that irrelevant: Shopify posts the customer here, and we
 * write the consent to Klaviyo ourselves. Nothing in the path can silently
 * drop it, and a failure is a logged non-200 rather than a profile that
 * quietly never arrives.
 *
 * Setup (both steps required, see the README note at the bottom of this file):
 *   1. SHOPIFY_WEBHOOK_SECRET in the environment.
 *   2. customers/create and customers/update webhooks pointed at this URL.
 */

const KLAVIYO_LIST = "S8XqhP"; // HLT Newsletter — the list every campaign targets
const KLAVIYO_REVISION = "2026-07-15";

/**
 * Shopify signs every webhook body with the app secret. Verify before trusting
 * the payload: this endpoint writes to Klaviyo, so an unsigned caller could
 * otherwise subscribe arbitrary addresses. timingSafeEqual rather than ===,
 * because comparing HMACs with a short-circuiting compare leaks their contents
 * one byte at a time.
 */
function signatureValid(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest();
  let received: Buffer;
  try {
    received = Buffer.from(header, "base64");
  } catch {
    return false;
  }
  if (received.length !== expected.length) return false;
  return crypto.timingSafeEqual(expected, received);
}

type ShopifyCustomer = {
  email?: string | null;
  email_marketing_consent?: {
    state?: string | null;
    consent_updated_at?: string | null;
    opt_in_level?: string | null;
  } | null;
};

/**
 * The consent already happened — at Shopify's checkout, at the timestamp
 * Shopify recorded. We are propagating an existing consent, not collecting a
 * new one, which is exactly what historical_import means to Klaviyo.
 *
 * It matters for two reasons. HLT Newsletter is a double opt-in list, so a
 * plain subscribe would send a confirmation email and leave anyone who did not
 * click it stranded in the same NEVER_SUBSCRIBED state this route exists to
 * prevent. And historical_import suppresses flow triggers, so restoring a
 * consent never fires a welcome series at someone who signed up months ago.
 *
 * Klaviyo quirks worth knowing: consented_at REQUIRES historical_import, and
 * historical_import is only valid at job level — inside a profile's marketing
 * object it is rejected as an invalid field.
 */
async function subscribeInKlaviyo(email: string, consentedAt: string, apiKey: string) {
  return fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs", {
    method: "POST",
    headers: {
      Authorization: `Klaviyo-API-Key ${apiKey}`,
      revision: KLAVIYO_REVISION,
      accept: "application/vnd.api+json",
      "content-type": "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        type: "profile-subscription-bulk-create-job",
        attributes: {
          custom_source: "Shopify checkout consent (storefront webhook)",
          historical_import: true,
          profiles: {
            data: [
              {
                type: "profile",
                attributes: {
                  email,
                  subscriptions: {
                    email: { marketing: { consent: "SUBSCRIBED", consented_at: consentedAt } },
                  },
                },
              },
            ],
          },
        },
        relationships: { list: { data: { type: "list", id: KLAVIYO_LIST } } },
      },
    }),
  });
}

export async function POST(request: Request) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  const apiKey = process.env.KLAVIYO_PRIVATE_KEY;

  // Misconfiguration is a 500, not a silent 200. A webhook that always says OK
  // while doing nothing is how the original leak stayed invisible for months.
  if (!secret || !apiKey) {
    console.error("customer-consent: missing SHOPIFY_WEBHOOK_SECRET or KLAVIYO_PRIVATE_KEY");
    return new Response("not configured", { status: 500 });
  }

  // The signature is over the exact bytes Shopify sent, so read the body as
  // text and parse afterwards — request.json() would discard the original.
  const raw = await request.text();

  if (!signatureValid(raw, request.headers.get("x-shopify-hmac-sha256"), secret)) {
    return new Response("bad signature", { status: 401 });
  }

  let customer: ShopifyCustomer;
  try {
    customer = JSON.parse(raw) as ShopifyCustomer;
  } catch {
    return new Response("bad payload", { status: 400 });
  }

  const email = customer.email?.trim();
  const consent = customer.email_marketing_consent;
  const state = consent?.state?.toLowerCase();

  // Only act on an actual opt-in. "unsubscribed" is a decision we never
  // overturn, and "not_subscribed" is simply someone who left the box alone.
  // Both return 200 so Shopify does not retry a webhook we deliberately ignored.
  if (!email || state !== "subscribed") {
    return Response.json({ ok: true, skipped: state ?? "no-consent" });
  }

  // Carry Shopify's own timestamp so the consent record says when they really
  // opted in, not when this route happened to run.
  const consentedAt = consent?.consent_updated_at ?? new Date().toISOString();

  const res = await subscribeInKlaviyo(email, consentedAt, apiKey);

  if (!res.ok) {
    // Non-200 tells Shopify to retry, which is what we want: a Klaviyo blip
    // should not cost a subscriber.
    const body = await res.text().catch(() => "");
    console.error("customer-consent: klaviyo rejected", res.status, body.slice(0, 300));
    return new Response("klaviyo error", { status: 502 });
  }

  return Response.json({ ok: true, email, consentedAt });
}
