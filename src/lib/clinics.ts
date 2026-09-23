// The clinic schedule lives in Tockify. Its embed widget is a cross-origin
// iframe whose registration buttons open new windows, which we can't change
// from here — so we read the same calendar from Tockify's public ICS feed and
// render it natively instead.

const FEED_URL = "https://tockify.com/api/feeds/ics/travelclinics";

export type Clinic = {
  id: string;
  title: string;
  start: string; // ISO date (no time) or ISO datetime
  allDay: boolean;
  blurb: string;
  image: string | null;
  /** Where the registration button should go, already resolved for this site. */
  registerHref: string | null;
  registerLabel: string;
  /** True when registerHref leaves this site. */
  external: boolean;
};

const OUR_HOSTS = new Set(["highlevelthrowing.com", "www.highlevelthrowing.com", "high-level-throwing.myshopify.com"]);

function unescapeText(value: string): string {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

/** ICS folds long lines by starting the continuation with a space or tab. */
function unfold(raw: string): string {
  return raw.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
}

function field(block: string, name: string): { params: string; value: string } | null {
  const match = block.match(new RegExp(`^${name}([^:\\n]*):(.*)$`, "m"));
  if (!match) return null;
  return { params: match[1] ?? "", value: match[2] ?? "" };
}

function parseStart(block: string): { start: string; allDay: boolean } | null {
  const raw = field(block, "DTSTART");
  if (!raw) return null;
  const value = raw.value.trim();
  const dateOnly = value.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (dateOnly) {
    return { start: `${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}`, allDay: true };
  }
  const withTime = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (withTime) {
    const [, y, m, d, hh, mm, ss, z] = withTime;
    return { start: `${y}-${m}-${d}T${hh}:${mm}:${ss}${z ? "Z" : ""}`, allDay: false };
  }
  return null;
}

function resolveRegistration(block: string): Pick<Clinic, "registerHref" | "registerLabel" | "external"> {
  const promo = field(block, "X-TKF-PROMOTION-BUTTON");
  const href = promo?.value.trim();
  if (!href) {
    return { registerHref: null, registerLabel: "", external: false };
  }

  const labelMatch = promo?.params.match(/label=([^;:]+)/);
  const label = labelMatch ? unescapeText(labelMatch[1]) : "Register";

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return { registerHref: null, registerLabel: "", external: false };
  }

  // Links back to our own site become in-site paths so they open in place.
  if (OUR_HOSTS.has(url.hostname)) {
    return { registerHref: url.pathname + url.search, registerLabel: label, external: false };
  }
  return { registerHref: url.toString(), registerLabel: label, external: true };
}

export async function getClinics(): Promise<Clinic[]> {
  let raw: string;
  try {
    const res = await fetch(FEED_URL, { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    raw = unfold(await res.text());
  } catch {
    return [];
  }

  const blocks = raw.match(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/g) ?? [];
  const clinics: Clinic[] = [];

  for (const block of blocks) {
    const when = parseStart(block);
    const summary = field(block, "SUMMARY");
    if (!when || !summary) continue;

    const image = field(block, "X-TKF-FEATURED-IMAGE")?.value.trim() || null;
    const blurb = unescapeText(
      field(block, "X-TKF-CUSTOM-PREVIEW")?.value ?? field(block, "DESCRIPTION")?.value ?? ""
    );

    clinics.push({
      id: field(block, "UID")?.value.trim() || `${when.start}-${summary.value}`,
      title: unescapeText(summary.value).replace(/^High Level Throwing\s*[-–]\s*/i, ""),
      start: when.start,
      allDay: when.allDay,
      blurb,
      image,
      ...resolveRegistration(block),
    });
  }

  // Drop anything that has already happened, then show the soonest first.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return clinics
    .filter((c) => new Date(c.start).getTime() >= today.getTime())
    .sort((a, b) => a.start.localeCompare(b.start));
}

export function formatClinicDate(clinic: Clinic): string {
  // All-day feed dates carry no timezone, so parse them as plain calendar dates
  // to avoid the day shifting backwards for viewers behind UTC.
  const [y, m, d] = clinic.start.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
