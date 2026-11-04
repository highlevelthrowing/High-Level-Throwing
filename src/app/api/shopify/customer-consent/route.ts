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

/**
 * The fallback proof, for webhooks registered through the Admin API.
 *
 * HMAC is the better mechanism and stays the preferred one, but it is only
 * usable for webhooks created in the admin UI, where Shopify shows you the
 * signing secret. Webhooks created through the Admin API are signed with the
 * *calling app's* client secret, which the registering app cannot read back —
 * so a signature check would reject every delivery, Shopify would retry and
 * then disable the webhook, and the whole path would look wired while silently
 * doing nothing.
 *
 * So those carry a high-entropy token in the callback URL instead. This is
 * weaker, and worth being precise about why: the URL *is* the credential, so
 * anyone who obtains it can subscribe arbitrary addresses to the newsletter.
 * It is accepted here because the token never appears in git or client code,
 * the blast radius is a list subscription rather than data disclosure, and the
 * alternative is continuing to drop the consent of roughly a third of paying
 * customers.
 *
 * To upgrade: register the webhooks in the admin UI, set SHOPIFY_WEBHOOK_SECRET
 * to the secret shown there, and remove SHOPIFY_WEBHOOK_TOKEN. HMAC is tried
 * first, so that swap needs no code change.
 */
function tokenValid(request: Request, expected: string): boolean {
  const supplied = new URL(request.url).searchParams.get("token");
  if (!supplied) return false;
  const a = Buffer.from(supplied, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Shopify is mid-migration on how a customer's email is represented, so the
 * webhook payload can arrive in either of two shapes and both have to be read.
 *
 * The older one puts `email` at the top level with consent in
 * `email_marketing_consent`. The newer one nests everything under
 * `default_email_address` — the same move the Admin GraphQL API made when it
 * deprecated `Customer.email` in favour of `defaultEmailAddress.emailAddress`,
 * which now hard-rejects queries using the old field.
 *
 * Reading only the old shape is what broke this route between 2026-11-02 and
 * 2026-11-03: every delivery found no email, answered `skipped: no-consent`
 * with a 200, and Shopify recorded a success. Six customers who ticked the box
 * at checkout never reached Klaviyo, and nothing anywhere said so.
 */
type ShopifyCustomer = {
  email?: string | null;
  email_marketing_consent?: {
    state?: string | null;
    consent_updated_at?: string | null;
    opt_in_level?: string | null;
  } | null;
  default_email_address?: {
    email_address?: string | null;
    marketing_state?: string | null;
    marketing_updated_at?: string | null;
    marketing_opt_in_level?: string | null;
  } | null;
  /** The consent-topic payload names the address this way, with no `email`. */
  email_address?: string | null;
};

/**
 * Email and consent, from whichever shape this delivery used.
 *
 * Three exist, because `customers/create` and `customers/update` **no longer
 * carry marketing consent at all**. Confirmed from a real delivery on
 * 2026-11-04, whose payload held only:
 *
 *   id, created_at, updated_at, first_name, last_name, state, note,
 *   verified_email, multipass_identifier, tax_exempt, email, phone,
 *   currency, addresses, tax_exemptions, admin_graphql_api_id
 *
 * No `email_marketing_consent`, no `default_email_address`. Consent moved to
 * its own topic, `customers/email_marketing_consent/update`, which is the one
 * this route actually needs subscribing.
 *
 * ⚠️ That payload's top-level `state` is the customer's ACCOUNT state
 * (enabled/disabled), **not** marketing consent. Reading it as consent would
 * subscribe every enabled customer regardless of what they chose. It is
 * deliberately never read here.
 */
function readConsent(c: ShopifyCustomer): {
  email: string;
  state: string | null;
  consentedAt: string | null;
} {
  const nested = c.default_email_address ?? null;
  const email = (c.email ?? c.email_address ?? nested?.email_address ?? "").trim();
  const state = c.email_marketing_consent?.state ?? nested?.marketing_state ?? null;
  const consentedAt =
    c.email_marketing_consent?.consent_updated_at ?? nested?.marketing_updated_at ?? null;
  return { email, state: state ? state.toLowerCase() : null, consentedAt };
}

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
  const token = process.env.SHOPIFY_WEBHOOK_TOKEN;
  const apiKey = process.env.KLAVIYO_PRIVATE_KEY;

  // Misconfiguration is a 500, not a silent 200. A webhook that always says OK
  // while doing nothing is how the original leak stayed invisible for months.
  if ((!secret && !token) || !apiKey) {
    console.error(
      "customer-consent: need KLAVIYO_PRIVATE_KEY plus one of SHOPIFY_WEBHOOK_SECRET / SHOPIFY_WEBHOOK_TOKEN"
    );
    return new Response("not configured", { status: 500 });
  }

  // The signature is over the exact bytes Shopify sent, so read the body as
  // text and parse afterwards — request.json() would discard the original.
  const raw = await request.text();

  // HMAC first: when both are configured the stronger proof decides, and a
  // genuine signature means the URL token is not needed at all.
  const proof =
    secret != null && signatureValid(raw, request.headers.get("x-shopify-hmac-sha256"), secret)
      ? "hmac"
      : token != null && tokenValid(request, token)
        ? "token"
        : null;

  if (!proof) {
    return new Response("unauthorized", { status: 401 });
  }

  let customer: ShopifyCustomer;
  try {
    customer = JSON.parse(raw) as ShopifyCustomer;
  } catch {
    return new Response("bad payload", { status: 400 });
  }

  const { email, state, consentedAt: shopifyConsentedAt } = readConsent(customer);

  // No email in EITHER shape means Shopify has changed the payload again. That
  // is the silent-failure case, so log the top-level keys: without them the
  // next migration looks identical to a quiet day with no opt-ins.
  if (!email) {
    console.error(
      `customer-consent: NO EMAIL IN PAYLOAD via=${proof} keys=${Object.keys(customer).join(",")}`
    );
    return Response.json({ ok: true, skipped: "no-email" });
  }

  // Only act on an actual opt-in. "unsubscribed" is a decision we never
  // overturn, and "not_subscribed" is simply someone who left the box alone.
  // Both return 200 so Shopify does not retry a webhook we deliberately ignored.
  if (state !== "subscribed") {
    // Logged as well as returned: Shopify's own "send test notification" uses a
    // sample customer that is not opted in, so this is the line that proves a
    // newly wired webhook is actually reaching us.
    //
    // `state=none` is different from a genuine "not_subscribed": it means the
    // consent is somewhere this route is not looking, which is indistinguishable
    // from a real opt-out unless the payload's own shape is recorded. Every real
    // delivery on 2026-11-04 logged state=none while customers were SUBSCRIBED
    // in Shopify, so dump the keys to find where consent actually lives. Keys
    // only — never values, which carry personal data.
    if (state == null) {
      const nestedKeys = customer.default_email_address
        ? Object.keys(customer.default_email_address).join(",")
        : "(absent)";
      console.error(
        `customer-consent: STATE MISSING for ${email} via=${proof} ` +
          `top=[${Object.keys(customer).join(",")}] ` +
          `default_email_address=[${nestedKeys}]`
      );
    }
    console.log(`customer-consent: skipped ${email} state=${state ?? "none"} via=${proof}`);
    return Response.json({ ok: true, skipped: state ?? "no-consent" });
  }

  // Carry Shopify's own timestamp so the consent record says when they really
  // opted in, not when this route happened to run.
  /**
   * Klaviyo rejects a historical import whose consented_at is not safely in the
   * past — "Historical email subscription does not have a valid consented_at
   * timestamp" — and the consent-topic payload does not always carry one. The
   * old fallback of `new Date()` produced exactly that rejection on every
   * delivery on 2026-11-04, because "now" is not historical.
   *
   * So fall back to a minute ago, and treat an unparseable or future timestamp
   * from Shopify the same way. A minute's imprecision on a consent record is
   * immaterial; losing the subscriber over a 400 is not.
   */
  const parsed = shopifyConsentedAt ? Date.parse(shopifyConsentedAt) : NaN;
  const aMinuteAgo = Date.now() - 60_000;
  const consentedAt = new Date(
    Number.isNaN(parsed) || parsed > aMinuteAgo ? aMinuteAgo : parsed
  ).toISOString();

  const res = await subscribeInKlaviyo(email, consentedAt, apiKey);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("customer-consent: klaviyo rejected", res.status, body.slice(0, 300));

    /**
     * Only ask Shopify to retry when retrying could actually work.
     *
     * A 5xx or a 429 is a blip — retrying is exactly right, and a Klaviyo
     * outage should never cost a subscriber. Any other 4xx is a verdict on the
     * request itself, so the same payload will be refused forever; answering
     * non-200 just buys an infinite retry loop against a permanent rejection.
     *
     * The common one is benign: "backdated consent date is after current
     * subscription date", which means the profile is already subscribed from a
     * later timestamp. Nothing is lost — the person is subscribed — so take the
     * 200 and move on.
     */
    const worthRetrying = res.status >= 500 || res.status === 429;
    if (worthRetrying) {
      return new Response("klaviyo error", { status: 502 });
    }
    return Response.json({ ok: true, klaviyo_rejected: res.status });
  }

  // Log the successes too, not only the failures. Logging only errors makes a
  // working webhook indistinguishable from one that was never wired up — there
  // is no way to tell "no deliveries" from "no problems", which is the same
  // blind spot that let the original consent leak run for months. `via` records
  // which proof of origin was accepted, so retiring the URL token is a question
  // of reading the logs rather than guessing.
  console.log(
    `customer-consent: subscribed ${email} consented_at=${consentedAt} via=${proof}`
  );

  return Response.json({ ok: true, email, consentedAt });
}
