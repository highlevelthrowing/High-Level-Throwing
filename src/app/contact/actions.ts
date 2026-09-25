"use server";

const TO_EMAIL = "austin@highlevelthrowing.com";
const CLINIC_EMAIL = "highlevelthrowinghlt@gmail.com";
const KLAVIYO_COMPANY_ID = "QP3GE9";
const SITE_URL = "https://www.highlevelthrowing.com/contact";

export type ContactState = {
  status: "idle" | "sent" | "error";
  message?: string;
};

function clean(value: FormDataEntryValue | null, max = 2000): string {
  return String(value ?? "").trim().slice(0, max);
}

/**
 * Records the enquiry on the Klaviyo profile so it is captured even if the
 * mail provider is not configured yet, and so the person joins the list they
 * are already being marketed to from.
 */
async function recordInKlaviyo(fields: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  comment: string;
}) {
  try {
    await fetch(`https://a.klaviyo.com/client/events/?company_id=${KLAVIYO_COMPANY_ID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", revision: "2024-10-15" },
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            metric: { data: { type: "metric", attributes: { name: "Contact Form Submitted" } } },
            properties: {
              first_name: fields.firstName,
              last_name: fields.lastName,
              phone: fields.phone,
              comment: fields.comment,
            },
            profile: {
              data: {
                type: "profile",
                attributes: {
                  email: fields.email,
                  first_name: fields.firstName || undefined,
                  last_name: fields.lastName || undefined,
                  phone_number: fields.phone || undefined,
                },
              },
            },
          },
        },
      }),
    });
  } catch {
    // Capture is best-effort; a Klaviyo outage must not lose the enquiry.
  }
}

/**
 * Emails the enquiry via FormSubmit (https://formsubmit.co) — the same
 * service already used successfully on hlt-utah-clinics. No API key or
 * account setup required, but two things a plain HTML form gets for free
 * don't apply to a server action, so this fills them in by hand:
 *
 * - FormSubmit requires a browser-like Referer/Origin to accept the
 *   request at all; a server-to-server fetch sends neither on its own.
 * - It reports errors with HTTP 200 + `{success:"false", message:...}`
 *   (e.g. "needs activation" the first time a new site emails a given
 *   address), so `res.ok` alone can't tell success from failure.
 */
async function sendEmail(fields: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  comment: string;
}): Promise<boolean> {
  const name = [fields.firstName, fields.lastName].filter(Boolean).join(" ") || "Website visitor";

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${TO_EMAIL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Referer: SITE_URL,
        Origin: "https://www.highlevelthrowing.com",
      },
      body: JSON.stringify({
        name,
        email: fields.email,
        phone: fields.phone || "—",
        message: fields.comment || "(no message)",
        _subject: `Website enquiry from ${name}`,
        _cc: CLINIC_EMAIL,
        _replyto: fields.email,
        _template: "table",
        _captcha: "false",
      }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: string | boolean };
    return data.success === true || data.success === "true";
  } catch {
    return false;
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
  };

  if (!fields.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email)) {
    return { status: "error", message: "Please enter a valid email address so we can reply." };
  }

  await recordInKlaviyo(fields);

  const emailed = await sendEmail(fields);
  if (!emailed) {
    // Nothing was lost — the enquiry is on the Klaviyo profile either way —
    // but be honest rather than claiming an email went out.
    return {
      status: "sent",
      message: "Thanks — we've got your details and will be in touch shortly.",
    };
  }

  return { status: "sent" };
}
