"use server";

const KLAVIYO_COMPANY_ID = "QP3GE9";

/**
 * The list each signup joins. A profile that is not a subscriber cannot be
 * sent marketing email — Klaviyo records a Skipped Send instead — so the
 * subscription is what makes the welcome flow actually deliver. List IDs are
 * not secrets; the override exists so the lists can be changed without a
 * deploy.
 */
/**
 * Website Signups is single opt-in, so the welcome email lands immediately.
 * The older lists (HLT Newletter, HLT Clinics, Full List) are double opt-in
 * and hold subscribers who joined under that promise, so they are left alone —
 * signup_source and requested_location on the profile are what separate the
 * footer from the clinic waitlist, not a second list.
 */
const LISTS: Record<string, string> = {};
const DEFAULT_LIST = "TJMGe7"; // Website Signups

function listFor(source: string): string {
  return process.env.KLAVIYO_LIST_ID || LISTS[source] || DEFAULT_LIST;
}

export type SubscribeState = { status: "idle" | "ok" | "error"; message?: string };

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function clean(value: FormDataEntryValue | null, max = 200): string {
  return String(value ?? "").trim().slice(0, max);
}

async function klaviyo(path: string, body: unknown) {
  return fetch(`https://a.klaviyo.com/client/${path}/?company_id=${KLAVIYO_COMPANY_ID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", revision: "2024-10-15" },
    body: JSON.stringify(body),
  });
}

/**
 * Klaviyo answers 2xx on success and a JSON:API error document otherwise.
 * Awaiting the fetch without reading the status treats both the same, so a
 * rejected signup is indistinguishable from an accepted one: the visitor is
 * told "You're in." and the address is gone, with nothing written anywhere.
 * That is precisely the shape of failure that hid the Shopify checkout consent
 * leak for months — a path that always reports success while doing nothing.
 *
 * So log loudly, but still show the visitor success: asking someone to retype
 * their address does not get it back, and the log line carries everything
 * needed to replay the signup by hand.
 */
async function send(path: string, body: unknown, email: string): Promise<boolean> {
  try {
    const res = await klaviyo(path, body);
    if (res.ok) return true;
    const detail = await res.text().catch(() => "");
    console.error(
      `klaviyo-capture: ${path} rejected ${res.status} for ${email} — ${detail.slice(0, 300)}`
    );
    return false;
  } catch (err) {
    console.error(`klaviyo-capture: ${path} threw for ${email} —`, err);
    return false;
  }
}

/**
 * Records the signup as an event so a flow can trigger off it, and — when a
 * list is configured — subscribes the profile to that list. Both calls are
 * best-effort: a Klaviyo outage shows the visitor a success state rather than
 * asking them to type their address again.
 */
export async function subscribe(
  _prev: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  // Bots fill every field they find; a real person leaves this one empty.
  if (clean(formData.get("company"))) return { status: "ok" };

  const email = clean(formData.get("email"));
  if (!EMAIL.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const source = clean(formData.get("source"), 60) || "Site signup";
  const location = clean(formData.get("location"), 120);
  const role = clean(formData.get("role"), 60);

  const properties: Record<string, string> = { signup_source: source };
  if (location) properties.requested_location = location;
  if (role) properties.role = role;

  const list = listFor(source);

  await send(
    "events",
    {
      data: {
        type: "event",
        attributes: {
          metric: { data: { type: "metric", attributes: { name: source } } },
          properties,
          profile: { data: { type: "profile", attributes: { email, properties } } },
        },
      },
    },
    email
  );

  const subscribed = await send(
    "subscriptions",
    {
      data: {
        type: "subscription",
        attributes: {
          custom_source: source,
          profile: { data: { type: "profile", attributes: { email, properties } } },
        },
        relationships: { list: { data: { type: "list", id: list } } },
      },
    },
    email
  );

  // The event alone leaves a profile that no campaign can reach, so this is the
  // line that means an address was actually lost. One distinct prefix so it can
  // be alerted on, and every field needed to re-add the person by hand.
  if (!subscribed) {
    console.error(`klaviyo-capture: SIGNUP NOT SUBSCRIBED email=${email} source=${source} list=${list}`);
  }

  return { status: "ok" };
}
