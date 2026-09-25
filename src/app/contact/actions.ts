"use server";

const KLAVIYO_COMPANY_ID = "QP3GE9";

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

  // The email itself is sent from the browser — FormSubmit rejects calls that
  // do not carry a real Origin.
  return { status: "sent" };
}
