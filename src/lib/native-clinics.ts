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
  /** "Ages 9-12". */
  ages: string;
  price: string;
  /** The product this button buys. Must be the product whose TITLE matches. */
  product: string;
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
  venue: { name: string; street: string; cityLine: string };
  sport: string;
  sessions: ClinicSession[];
  coach: { label: string; price: string; product: string };
};

export const NATIVE_CLINICS: NativeClinic[] = [
  {
    handle: "high-level-throwing-clinic-new-albany-in-february-2027",
    city: "New Albany, IN",
    dayAndDate: "Sunday, February 14th",
    year: "2027",
    isoDate: "2027-02-14",
    venue: {
      name: "New Albany Training Facility",
      street: "2043 Silver St.",
      cityLine: "New Albany, IN 47150",
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
  return [...clinic.sessions.map((s) => s.product), clinic.coach.product];
}
