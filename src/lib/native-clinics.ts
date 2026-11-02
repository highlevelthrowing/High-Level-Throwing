/**
 * Clinic registration pages rendered by this site rather than embedded.
 *
 * Every other clinic page is a Shopify theme template shown through an iframe.
 * That works, but each one was copied from the last, and all eight live pages
 * were found selling the wrong session because the copies kept the previous
 * clinic's product links. A page built from this data cannot drift that way:
 * each session carries its own product handle, and the same list drives the
 * page, the sold-out check and the button audit.
 *
 * It is also real HTML, so search engines can read it — the embedded pages are
 * an empty frame to a crawler.
 *
 * Add a clinic here when its Shopify page has no clinic theme template, which
 * is the case for any page whose templateSuffix is plain "page".
 */
export type ClinicSession = {
  /** "Session 1", as it reads on the page. */
  name: string;
  /** "9AM-11AM" — kept in the store's own style rather than normalised. */
  time: string;
  /**
   * The day this session runs, for clinics spanning more than one date.
   * Falls back to the clinic's own `dayAndDate` when every session shares a day.
   */
  day?: string;
  /** "Ages 9-12". Omitted when the clinic does not split by age. */
  ages?: string;
  /** Omitted for a session that is not sold. */
  price?: string;
  /**
   * The product this button buys. Must be the product whose TITLE matches.
   * Omitted for a closed session, which has nothing to sell.
   */
  product?: string;
  /**
   * A session that is listed but cannot be registered for — a private team
   * booking, say. It renders with a "Sold out" pill in place of the button, so
   * the schedule still reads correctly without offering a spot that isn't
   * available. Carries no product, so nothing can be bought by URL either.
   */
  closed?: boolean;
  /** Replaces the price on the label, e.g. "PRIVATE TEAM SESSION". */
  note?: string;
};

export type NativeClinic = {
  /** The Shopify page handle this renders for. */
  handle: string;
  city: string;
  /** "Sunday, February 14th" — how the page says it. */
  dayAndDate: string;
  year: string;
  /** Plain YYYY-MM-DD, for the schedule override key and structured data. */
  isoDate: string;
  venue: { name?: string; street: string; cityLine: string };
  /**
   * The host facility's artwork, shown beside the venue block — the slot the
   * theme calls `Mimg1U`. Each clinic carries its host's own logo.
   */
  venueLogo: { src: string; alt: string; width: number; height: number };
  sport: string;
  sessions: ClinicSession[];
  coach: { label: string; price: string; product: string };
};

export const NATIVE_CLINICS: NativeClinic[] = [
  {
    handle: "high-level-throwing-clinic-warminster-pa-january-2027",
    city: "Warminster, PA",
    dayAndDate: "January 22nd-24th",
    year: "2027",
    isoDate: "2027-01-22",
    venue: {
      name: "Fastpitch Fieldhouse",
      street: "1545 Campus Drive",
      cityLine: "Warminster, PA 18974",
    },
    venueLogo: {
      src: "/logos/clinic-warminster-fastpitch-fieldhouse.jpg",
      alt: "Fastpitch Fieldhouse",
      width: 2372,
      height: 1526,
    },
    sport: "SOFTBALL",
    sessions: [
      {
        name: "Session 1",
        day: "Friday, January 22nd",
        time: "4PM-6PM",
        ages: "Ages 12-18",
        price: "$160",
        product: "hlt-clinic-warminster-pa-session-1-friday-january-22nd-4pm-6pm-160",
      },
      {
        name: "Session 2",
        day: "Saturday, January 23rd",
        time: "9AM-11AM",
        note: "PRIVATE TEAM SESSION",
        closed: true,
      },
      {
        name: "Session 3",
        day: "Saturday, January 23rd",
        time: "1130AM-130PM",
        ages: "Ages 9-12",
        price: "$160",
        product: "hlt-clinic-warminster-pa-session-3-saturday-january-23rd-1130am-130pm-160",
      },
      {
        name: "Session 4",
        day: "Saturday, January 23rd",
        time: "2PM-4PM",
        ages: "Ages 13+",
        price: "$160",
        product: "hlt-clinic-warminster-pa-session-4-saturday-january-23rd-2pm-4pm-160",
      },
      {
        name: "Session 5",
        day: "Saturday, January 23rd",
        time: "5PM-7PM",
        ages: "Ages 13+",
        price: "$160",
        product: "hlt-clinic-warminster-pa-session-5-saturday-january-23rd-5pm-7pm-160",
      },
      {
        name: "Session 6",
        day: "Sunday, January 24th",
        time: "9AM-11AM",
        note: "PRIVATE TEAM SESSION",
        closed: true,
      },
      {
        name: "Session 7",
        day: "Sunday, January 24th",
        time: "1130AM-130PM",
        ages: "Ages 13+",
        price: "$160",
        product: "hlt-clinic-warminster-pa-session-7-sunday-january-24th-1130am-130pm-160",
      },
    ],
    coach: {
      label: "Coach Access - Choose Any Session to Attend!",
      price: "$125",
      product: "hlt-clinic-warminster-pa-coach-access-125",
    },
  },
  {
    handle: "high-level-throwing-clinic-new-albany-in-february-2027",
    city: "New Albany, IN",
    dayAndDate: "Sunday, February 14th",
    year: "2027",
    isoDate: "2027-02-14",
    venue: {
      street: "2043 Silver St.",
      cityLine: "New Albany, IN 47150",
    },
    venueLogo: {
      src: "/logos/clinic-new-albany-floyd-softball.png",
      alt: "Floyd Softball",
      width: 1600,
      height: 1381,
    },
    sport: "SOFTBALL",
    sessions: [
      {
        name: "Session 1",
        time: "9AM-11AM",
        ages: "Ages 9-12",
        price: "$160",
        product: "hlt-clinic-new-albany-in-session-1-sunday-february-14th-9am-11am-160",
      },
      {
        name: "Session 2",
        time: "1130AM-130PM",
        ages: "Ages 9-12",
        price: "$160",
        product: "hlt-clinic-new-albany-in-session-2-sunday-february-14th-1130am-130pm-160",
      },
      {
        name: "Session 3",
        time: "2PM-4PM",
        ages: "Ages 13+",
        price: "$160",
        product: "hlt-clinic-new-albany-in-session-3-sunday-february-14th-2pm-4pm-160",
      },
      {
        name: "Session 4",
        time: "430PM-630PM",
        ages: "Ages 13+",
        price: "$160",
        product: "hlt-clinic-new-albany-in-session-4-sunday-february-14th-430pm-630pm-160",
      },
    ],
    coach: {
      label: "Coach Access - Choose Any Session to Attend!",
      price: "$125",
      product: "hlt-clinic-new-albany-in-coach-access-125",
    },
  },
];

export function nativeClinic(handle: string): NativeClinic | undefined {
  const decoded = decodeURIComponent(handle);
  return NATIVE_CLINICS.find((c) => c.handle === decoded);
}

/** Every product a natively rendered clinic sells, sessions then coach pass. */
export function nativeClinicProducts(handle: string): string[] {
  const clinic = nativeClinic(handle);
  if (!clinic) return [];
  const sessions = clinic.sessions
    .map((s) => s.product)
    .filter((p): p is string => Boolean(p));
  return [...sessions, clinic.coach.product];
}
