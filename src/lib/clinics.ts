// The clinic schedule lives in Tockify. Its embed widget is a cross-origin
// iframe whose registration buttons open new windows, which we can't change
// from here — so we read the same calendar from Tockify's public ICS feed and
// render it natively instead.

const FEED_URL = "https://tockify.com/api/feeds/ics/travelclinics";

export type Clinic = {
  id: string;
  title: string;
  start: string; // ISO date (no time) or ISO datetime
  /**
   * First day of the clinic as a plain YYYY-MM-DD in the calendar's own
   * timezone. `start` keeps the raw instant for schema.org; this is what the
   * page shows, because a 7pm Eastern clinic is exported as midnight UTC the
   * next day and would otherwise read as the wrong date.
   */
  date: string;
  /** Last day of the clinic, inclusive. Same as date for single-day clinics. */
  end: string;
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

/**
 * Stop-gaps for clinics whose Tockify entry has not caught up with reality.
 * Keyed by `YYYY-MM-DD|Title` as the schedule renders them. Delete an entry
 * once the calendar says the right thing on its own.
 */
const OVERRIDES: Record<
  string,
  { blurb?: string; image?: string; registerHref?: string; registerLabel?: string }
> = {
  // Registration is open and the calendar now carries the button, but its
  // preview text still reads "Registration opens soon!" beside it, and its
  // artwork is the placeholder rather than the clinic's own flyer.
  "2026-12-16|Fort Lauderdale, FL": {
    blurb: "Wednesday, December 16th @ 7PM–9PM at Cardinal Gibbons High School. Ages 12+, 18 players max.",
    image:
      "https://cdn.shopify.com/s/files/1/0771/2948/2547/files/Screen_Shot_2026-10-05_at_11.41.03_AM.png?v=1791230675",
  },
};

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

/** The timezone the calendar is kept in; every event time is relative to it. */
function calendarTimeZone(raw: string): string {
  return field(raw.split("BEGIN:VEVENT")[0], "X-WR-TIMEZONE")?.value.trim() || "America/New_York";
}

/** The plain calendar date an instant falls on in the given timezone. */
function calendarDate(iso: string, timeZone: string): string {
  if (!iso.includes("T")) return iso.slice(0, 10);
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso.slice(0, 10);
  // en-CA formats as YYYY-MM-DD, which is what we want to compare and store.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsed);
}

function parseDate(block: string, name: "DTSTART" | "DTEND"): { start: string; allDay: boolean } | null {
  const raw = field(block, name);
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
    // Five minutes, not thirty: the calendar is edited in Tockify and the change
    // is expected on the site straight away, so a long window reads as broken.
    const res = await fetch(FEED_URL, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    raw = unfold(await res.text());
  } catch {
    return [];
  }

  const timeZone = calendarTimeZone(raw);
  const blocks = raw.match(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/g) ?? [];
  const clinics: Clinic[] = [];

  for (const block of blocks) {
    const when = parseDate(block, "DTSTART");
    const summary = field(block, "SUMMARY");
    if (!when || !summary) continue;

    const date = calendarDate(when.start, timeZone);

    // ICS end dates are exclusive for all-day events, so step back a day to get
    // the last day the clinic actually runs.
    const rawEnd = parseDate(block, "DTEND");
    let end = date;
    if (rawEnd) {
      const endDay = new Date(`${calendarDate(rawEnd.start, timeZone)}T00:00:00`);
      if (when.allDay) endDay.setDate(endDay.getDate() - 1);
      const iso = `${endDay.getFullYear()}-${String(endDay.getMonth() + 1).padStart(2, "0")}-${String(
        endDay.getDate()
      ).padStart(2, "0")}`;
      if (iso > date) end = iso;
    }

    const image = field(block, "X-TKF-FEATURED-IMAGE")?.value.trim() || null;
    const blurb = unescapeText(
      field(block, "X-TKF-CUSTOM-PREVIEW")?.value ?? field(block, "DESCRIPTION")?.value ?? ""
    );

    const title = unescapeText(summary.value).replace(/^High Level Throwing\s*[-–]\s*/i, "");
    const override = OVERRIDES[`${date}|${title}`];

    clinics.push({
      id: field(block, "UID")?.value.trim() || `${when.start}-${summary.value}`,
      title,
      start: when.start,
      date,
      end,
      allDay: when.allDay,
      blurb: override?.blurb ?? blurb,
      image: override?.image ?? image,
      ...resolveRegistration(block),
      ...(override?.registerHref
        ? { registerHref: override.registerHref, registerLabel: override.registerLabel ?? "Register", external: false }
        : {}),
    });
  }

  // Drop anything that has already happened, then show the soonest first.
  // Compared as plain calendar dates so a clinic stays listed on its own day.
  const today = calendarDate(new Date().toISOString(), timeZone);
  return clinics.filter((c) => c.end >= today).sort((a, b) => a.date.localeCompare(b.date));
}

// All-day feed dates carry no timezone, so parse them as plain calendar dates
// to avoid the day shifting backwards for viewers behind UTC.
function asLocalDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatClinicDate(clinic: Clinic): string {
  const start = asLocalDate(clinic.date);
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };

  if (clinic.end === clinic.date) {
    return start.toLocaleDateString("en-US", { ...opts, year: "numeric" });
  }

  // Multi-day clinics read as a range, the way the calendar shows them:
  // "Fri, Nov 6 – Sun, Nov 8, 2026", dropping the repeated month within one.
  const end = asLocalDate(clinic.end);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const endLabel = sameMonth
    ? `${end.toLocaleDateString("en-US", { weekday: "short" })} ${end.getDate()}`
    : end.toLocaleDateString("en-US", opts);
  return `${start.toLocaleDateString("en-US", opts)} – ${endLabel}, ${end.getFullYear()}`;
}
