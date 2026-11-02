"use server";

const KLAVIYO_COMPANY_ID = "QP3GE9";

export type ContactState = {
  status: "idle" | "sent" | "error";
  message?: string;
};

function clean(value: FormDataEntryValue | null, max = 2000): string {
  return String(value ?? "").trim().slice(0, max);
}

/** Website Signups — single opt-in, so a ticked box subscribes immediately. */
const KLAVIYO_LIST = "TJMGe7";

/**
 * Klaviyo answers 2xx on success and a JSON:API error document otherwise, so
 * awaiting the fetch without reading the status treats a rejection exactly like
 * an acceptance — the enquiry looks captured and is not. Log loudly instead,
 * carrying enough to re-enter the person by hand, but never fail the visitor's
 * submission over it: the enquiry still reaches Austin by email.
 */
async function postToKlaviyo(path: string, body: unknown, email: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://a.klaviyo.com/client/${path}/?company_id=${KLAVIYO_COMPANY_ID}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", revision: "2024-10-15" },
        body: JSON.stringify(body),
      }
    );
    if (res.ok) return true;
    const detail = await res.text().catch(() => "");
    console.error(
      `klaviyo-contact: ${path} rejected ${res.status} for ${email} — ${detail.slice(0, 300)}`
    );
    return false;
  } catch (err) {
    console.error(`klaviyo-contact: ${path} threw for ${email} —`, err);
    return false;
  }
}

/**
 * Records the enquiry on the Klaviyo profile so it is captured even if the mail
 * provider is not configured yet.
 *
 * Subscribing is deliberately separate and deliberately opt-in. Writing in with
 * a question is not consent to marketing, so the profile is created either way
 * but the list is joined only when the visitor ticks the box — which is also
 * what keeps the consent record defensible for the UK customers on this list.
 */
async function recordInKlaviyo(fields: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  comment: string;
  optIn: boolean;
}) {
  const profile = {
    data: {
      type: "profile",
      attributes: {
        email: fields.email,
        first_name: fields.firstName || undefined,
        last_name: fields.lastName || undefined,
        phone_number: fields.phone || undefined,
      },
    },
  };

  await postToKlaviyo(
    "events",
    {
      data: {
        type: "event",
        attributes: {
          metric: { data: { type: "metric", attributes: { name: "Contact Form Submitted" } } },
          properties: {
            first_name: fields.firstName,
            last_name: fields.lastName,
            phone: fields.phone,
            comment: fields.comment,
            email_opt_in: fields.optIn,
          },
          profile,
        },
      },
    },
    fields.email
  );

  if (!fields.optIn) return;

  const subscribed = await postToKlaviyo(
    "subscriptions",
    {
      data: {
        type: "subscription",
        attributes: { custom_source: "Contact form opt-in", profile },
      },
      relationships: { list: { data: { type: "list", id: KLAVIYO_LIST } } },
    },
    fields.email
  );

  if (!subscribed) {
    console.error(
      `klaviyo-contact: OPT-IN NOT SUBSCRIBED email=${fields.email} list=${KLAVIYO_LIST}`
    );
  }
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  // Bots fill every field they find; a real person leaves this one empty.
  if (clean(formData.get("company"))) return { status: "sent" };

  const fields = {
    email: clean(formData.get("email"), 200),
    firstName: clean(formData.get("firstName"), 100),
    lastName: clean(formData.get("lastName"), 100),
    phone: clean(formData.get("phone"), 50),
    comment: clean(formData.get("comment")),
    // An unchecked box sends nothing at all, so presence is the consent.
    optIn: formData.get("emailOptIn") != null,
  };

  if (!fields.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email)) {
    return { status: "error", message: "Please enter a valid email address so we can reply." };
  }

  await recordInKlaviyo(fields);

  // The email itself is sent from the browser — FormSubmit rejects calls that
  // do not carry a real Origin.
  return { status: "sent" };
}
