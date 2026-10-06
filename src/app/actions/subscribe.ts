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

  try {
    await klaviyo("events", {
      data: {
        type: "event",
        attributes: {
          metric: { data: { type: "metric", attributes: { name: source } } },
          properties,
          profile: { data: { type: "profile", attributes: { email, properties } } },
        },
      },
    });

    await klaviyo("subscriptions", {
      data: {
        type: "subscription",
        attributes: {
          custom_source: source,
          profile: { data: { type: "profile", attributes: { email, properties } } },
        },
        relationships: { list: { data: { type: "list", id: listFor(source) } } },
      },
    });
  } catch {
    // Captured addresses are worth more than a perfect error path.
  }

  return { status: "ok" };
}
