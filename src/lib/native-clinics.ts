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
  /**
   * Overrides the clinic's sport for this session. Beaufort runs one baseball
   * session and three softball ones, and the label a buyer reads has to say
   * which — it is the only thing distinguishing them at the same venue.
   */
  sport?: string;
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
  /** Last day, for clinics running more than one. Omitted for a single day. */
  endIsoDate?: string;
  venue: { name?: string; street?: string; cityLine: string };
  /**
   * The host facility's artwork, shown beside the venue block — the slot the
   * theme calls `Mimg1U`. Each clinic carries its host's own logo.
   */
  venueLogo: { src: string; alt: string; width: number; height: number };
  /** Omitted when the clinic's sport is not stated on the page. */
  sport?: string;
  sessions: ClinicSession[];
  /** Overrides the shared FORMAT list where a clinic words it differently. */
  format?: string[];
  /** Host facility credited in the intro, e.g. "The Hangar Training Facility". */
  partner?: string;
  /** Replaces the default apparel sentence when a clinic words it differently. */
  attireNote?: string;
  /** Who runs it, when not Austin — Tracy is led by Sarah O'Brien. */
  instructorLine?: string;
  coach: { label: string; price: string; product: string };
};

export const NATIVE_CLINICS: NativeClinic[] = [
  {
    handle: "high-level-throwing-clinic-tracy-ca-december-2026",
    city: "Tracy, CA", dayAndDate: "December 5th & 6th", year: "2026", isoDate: "2026-12-05", endIsoDate: "2026-12-06",
    venue: { name: "All American Sports Academy", street: "280 East Larch Road #117", cityLine: "Tracy, CA 95304" },
    venueLogo: { src: "https://cdn.shopify.com/s/files/1/0771/2948/2547/files/Screen_Shot_2023-11-20_at_8.32.05_PM.png?v=1700530336", alt: "All American Sports Academy", width: 1000, height: 1000 },
    instructorLine: "This clinic will be run by Lead HLT Instructor, Sarah O\u2019Brien with sessions focusing on the Foundations of High Level Throwing\u00ae & Advanced Concepts for Softball Athletes!",
    attireNote: "*We limit each session to 12 players! Athletes should wear softball training apparel or uniform. Bring your glove! Each athlete will receive a FREE High Level Throwing\u00ae Getting Started Training Guide sent via email after the session has been completed!",
    sport: "", sessions: [
      { name: "Session 1", day: "Saturday, December 5th", time: "9AM-11AM", ages: "Ages 8-12", price: "$160", product: "hlt-clinic-tracy-ca-session-1-saturday-december-6th-9am-11am-155-ages-8-12" },
      { name: "Session 2", day: "Saturday, December 5th", time: "1130AM-130PM", ages: "Ages 13-18", price: "$160", product: "hlt-clinic-tracy-ca-session-2-saturday-december-6th-1130am-130pm-155-ages-8-12" },
      { name: "Session 3", day: "Saturday, December 5th", time: "230PM-430PM", ages: "Ages 13-18", price: "$160", product: "hlt-clinic-tracy-ca-session-3-saturday-december-6th-2pm-4pm-155-ages-13" },
      { name: "Session 4", day: "Sunday, December 6th", time: "9AM-11AM", ages: "Ages 8-12", price: "$160", product: "hlt-clinic-tracy-ca-session-4-sunday-december-7th-9am-11am-155-ages-8-12" },
      { name: "Session 5", day: "Sunday, December 6th", time: "1130AM-130PM", ages: "Ages 13-18", price: "$160", product: "hlt-clinic-tracy-ca-session-5-sunday-december-7th-1130am-130pm-155-ages-13" },
    ],
    coach: { label: "Coach Access: Choose Any Session to Attend!", price: "$125", product: "hlt-clinic-tracy-dc-coach-access-100" },
  },
  {
    handle: "high-level-throwing-clinic-houston-tx-november-2026",
    city: "Houston, TX", dayAndDate: "Saturday, November 28th", year: "2026", isoDate: "2026-11-28",
    venue: { name: "Elite Training Facility", street: "2012 Center St", cityLine: "Houston, TX 77007" },
    venueLogo: { src: "https://cdn.shopify.com/s/files/1/0771/2948/2547/files/IMG_4870.png?v=1791162334", alt: "Elite Training Facility", width: 1000, height: 1000 },
    partner: "the Elite Training Facility",
    attireNote: "*We limit each session to 18 players! Athletes should wear softball training apparel or uniform. Bring your glove! Each athlete will receive a FREE High Level Throwing\u00ae Getting Started Training Guide sent via email and are eligible to join the velocity leaderboard!",
    instructorLine:
      "This clinic will be run by Owner/Founder, Austin Wasserman with sessions focusing on the Foundations of High Level Throwing\u00ae for Softball Athletes!",
    sport: "SOFTBALL", sessions: [
      { name: "Session 1", time: "9AM-11AM", ages: "Ages 9-12", price: "$160", product: "hlt-clinic-katy-tx-session-1-saturday-august-22nd-9am-11am-160-premier-aces-12" },
      { name: "Session 2", time: "1130AM-130PM", ages: "Ages 9-12", price: "$160", product: "hlt-clinic-katy-tx-session-2-saturday-august-22nd-1130am-130pm-160-tbd" },
      { name: "Session 3", time: "2PM-4PM", ages: "Ages 13+", price: "$160", product: "hlt-clinic-katy-tx-session-3-saturday-august-22nd-2pm-4pm-160-illusions-fastpitch-14" },
      { name: "Session 4", time: "5PM-7PM", ages: "Ages 13+", price: "$160", product: "hlt-clinic-katy-tx-session-4-saturday-august-22nd-5pm-7pm-160-tbd" },
    ],
    coach: { label: "Coach Access - Choose Any Session to Attend!", price: "$125", product: "hlt-clinic-katy-tx-coach-access-100" },
  },
  {
    handle: "high-level-throwing-clinic-littleton-co-2026",
    city: "Denver, CO", dayAndDate: "Saturday, December 12th", year: "2026", isoDate: "2026-12-12",
    // Venue is moving; the new address is not confirmed yet, so the page says
    // so rather than sending anyone to the old one.
    venue: { name: "Indoor Facility", cityLine: "New Address Coming Soon..." },
    venueLogo: { src: "/images/clinic-denver-2026.jpg", alt: "High Level Throwing Clinic - Denver, CO", width: 1600, height: 1600 },
    sport: "SOFTBALL", sessions: [
      { name: "Session 1", time: "9AM-11AM", ages: "Ages 9-12", price: "$160", product: "hlt-clinic-littleton-co-session-1-saturday-december-12th-9am-11am-155" },
      { name: "Session 2", time: "1130AM-130PM", ages: "Ages 13+", price: "$160", product: "hlt-clinic-littleton-co-session-2-saturday-december-12th-1130am-130pm-155" },
      { name: "Session 3", time: "2PM-4PM", ages: "Ages 13+", price: "$160", product: "hlt-clinic-littleton-co-session-3-saturday-december-12th-2pm-4pm-155" },
      { name: "Session 4", time: "430PM-630PM", ages: "Ages 13+", price: "$160", sport: "CATCHER SPECIFIC SESSION - SOFTBALL", product: "hlt-clinic-littleton-co-session-4-saturday-december-12th-430pm-630pm-155" },
    ],
    coach: { label: "Coach Access - Choose Any Session to Attend!", price: "$125", product: "hlt-clinic-littleton-co-coach-access-100" },
  },
  {
    handle: "high-level-throwing-clinic-poland-oh-february-2027",
    city: "Poland, OH", dayAndDate: "February 5th & 6th", year: "2027", isoDate: "2027-02-05", endIsoDate: "2027-02-06",
    venue: { name: "Sluggers of Ohio, INC (Indoor Facility)", street: "9862 South Ave.", cityLine: "Youngstown, OH 44514" },
    venueLogo: { src: "https://cdn.shopify.com/s/files/1/0771/2948/2547/files/unnamed_8b2bfe56-b4ff-4404-ac01-dd95fb790d26.png?v=1733849671", alt: "Youngstown Phoenix", width: 1000, height: 1000 },
    partner: "the YOUNGSTOWN PHOENIX",
    attireNote:
      "*We limit each session to 18 players! Athletes should wear training apparel or uniform. Bring your glove! Each athlete will receive a FREE High Level Throwing\u00ae Getting Started Training Guide sent via email!",
    instructorLine:
      "This clinic will be run by owner/creator, Austin Wasserman with sessions focusing on the Foundations of High Level Throwing\u00ae for Softball Athletes!",
    sport: "SOFTBALL", sessions: [
      { name: "Session 1", day: "Friday, February 5th", time: "7PM-9PM", ages: "Ages 12-18", price: "$160", product: "hlt-clinic-warren-oh-session-1-friday-february-7th-6p-8pm-155-ages-13" },
      { name: "Session 2", day: "Saturday, February 6th", time: "8AM-10AM", ages: "Ages 12-18", price: "$160", product: "hlt-clinic-warren-oh-session-2-saturday-february-8th-9am-11am-155-ages-13" },
      { name: "Session 3", day: "Saturday, February 6th", time: "1030AM-1230PM", ages: "Ages 8-12", price: "$160", product: "hlt-clinic-warren-oh-session-3-saturday-february-8th-1130am-130pm-155-ages-9-12" },
      { name: "Session 4", day: "Saturday, February 6th", time: "1PM-3PM", ages: "Ages 12-18", price: "$160", product: "hlt-clinic-warren-oh-session-4-saturday-february-8th-2pm-4pm-155-ages-13" },
      { name: "Session 5", day: "Saturday, February 6th", time: "4PM-6PM", ages: "Ages 8-12", price: "$160", product: "hlt-clinic-warren-oh-session-5-sunday-february-9th-9am-11am-155-ages-9-12-baseball" },
    ],
    coach: { label: "Coach Access - Choose Any Session to Attend!", price: "$125", product: "hlt-clinic-warren-oh-coach-access-100" },
  },
  {
    handle: "high-level-throwing-clinic-fort-lauderdale-fl-2026",
    city: "Fort Lauderdale, FL", dayAndDate: "Wednesday, December 16th", year: "2026", isoDate: "2026-12-16",
    venue: { name: "Cardinal Gibbons High School Gym", street: "2900 NE 47th St,", cityLine: "Fort Lauderdale, FL 33308" },
    venueLogo: { src: "https://cdn.shopify.com/s/files/1/0771/2948/2547/files/Screen_Shot_2026-10-05_at_11.41.03_AM.png?v=1791230675", alt: "Cardinal Gibbons High School", width: 1000, height: 1000 },
    partner: "Cardinal Gibbons High School",
    attireNote: "*We limit the session to 18 players! Athletes should wear softball training apparel or uniform. Each athlete will receive a FREE High Level Throwing\u00ae Getting Started Training Guide sent via email!",
    format: [
      "Introduction + Discussion",
      "Dynamic Warm Up + Prep Drills",
      "Arm Care, Med Ball + HLT Patterns",
      "Drills & Progressions",
      "Overhand Throwing Velocity Testing - Join the Leaderboard",
    ],
    instructorLine:
      "This clinic will be run by Founder, Austin Wasserman with sessions focusing on the Foundations & Advanced Concepts of High Level Throwing\u00ae for Softball Athletes!",
    sport: "", sessions: [
      { name: "Athlete Registration", time: "7PM-9PM", ages: "Ages 12+", price: "$160", product: "hlt-clinic-fort-lauderdale-fl-wednesday-december-16th-7pm-9pm-160-ages-12-softball" },
    ],
    coach: { label: "Coach Access: On-Floor access to ask questions, learn, assist and get video!", price: "$125", product: "hlt-clinic-fort-lauderdale-fl-coach-access-125" },
  },
  {
    handle: "high-level-throwing-clinic-crystal-lake-il-2026",
    city: "Crystal Lake, IL", dayAndDate: "November 20th-22nd", year: "2026", isoDate: "2026-11-20", endIsoDate: "2026-11-22",
    venue: { name: "Indoor Training Facility", street: "6704 Pingree road", cityLine: "Crystal Lake, IL 60014" },
    venueLogo: { src: "https://cdn.shopify.com/s/files/1/0771/2948/2547/files/unnamed_2d434508-d0fa-421d-9e39-41bb37f4589a.png?v=1787756280", alt: "Crystal Lake clinic host", width: 1000, height: 1000 },
    attireNote:
      "*We limit each session to 18 players! Athletes should wear training apparel or uniform. Each athlete will receive a FREE High Level Throwing\u00ae Getting Started Training Guide sent via email!",
    instructorLine: "This clinic will be run by owner/creator, Austin Wasserman with sessions focusing on the Foundations & Advanced Concepts of High Level Throwing\u00ae for Baseball & Softball Athletes!",
    sport: "", sessions: [
      { name: "Player Session 1", day: "Friday, November 20th", time: "6PM-8PM", ages: "Ages 13+ Softball", price: "$160", product: "hlt-clinic-crystal-lake-il-session-1-friday-november-20th-6pm-8pm-160-ages-13-softball" },
      { name: "Coach Session", day: "Saturday, November 21st", time: "8AM-9AM", price: "$125", note: "COACHES ONLY", product: "hlt-clinic-crystal-lake-il-coach-session-1-saturday-november-21st-8am-9am-125" },
      { name: "Player Session 2", day: "Saturday, November 21st", time: "930AM-1130AM", ages: "Ages 9-12 Softball", price: "$160", product: "hlt-clinic-crystal-lake-il-player-session-2-saturday-november-21st-930am-1130am-160-ages-9-12-softball" },
      { name: "Player Session 3", day: "Saturday, November 21st", time: "12PM-2PM", ages: "Ages 9-12 Softball", price: "$160", product: "hlt-clinic-crystal-lake-il-player-session-3-saturday-november-21st-12pm-2pm-160-ages-9-12-softball" },
      { name: "Player Session 4", day: "Saturday, November 21st", time: "230PM-430PM", ages: "Ages 13+ Softball", price: "$160", product: "hlt-clinic-crystal-lake-il-player-session-4-saturday-november-21st-230pm-430pm-160-ages-13-softball" },
      { name: "Player Session 5", day: "Saturday, November 21st", time: "5PM-7PM", ages: "Ages 13+ Softball", price: "$160", product: "hlt-clinic-crystal-lake-il-player-session-5-saturday-november-21st-5pm-7pm-160-ages-13-softball" },
      { name: "Player Session 6", day: "Sunday, November 22nd", time: "9AM-11AM", ages: "Ages 9-12 Softball", price: "$160", product: "hlt-clinic-crystal-lake-il-player-session-6-sunday-november-22nd-9am-11am-160-ages-9-12-baseball" },
      { name: "Player Session 7", day: "Sunday, November 22nd", time: "1130AM-130PM", ages: "Ages 9-12 Softball", price: "$160", product: "hlt-clinic-crystal-lake-il-player-session-7-sunday-november-22nd-1130am-130pm-160-ages-13-baseball" },
    ],
    coach: { label: "Coach Session", price: "$125", product: "hlt-clinic-crystal-lake-il-coach-session-1-saturday-november-21st-8am-9am-125" },
  },
  {
    handle: "high-level-throwing-clinic-beaufort-sc-december-2026",
    city: "Beaufort, SC",
    dayAndDate: "Tuesday, December 29th",
    year: "2026",
    isoDate: "2026-12-29",
    venue: {
      name: "The Hangar - Indoor Training Facility",
      street: "711 Bowling Lane",
      cityLine: "Beaufort, SC 29902",
    },
    venueLogo: {
      src: "https://cdn.shopify.com/s/files/1/0771/2948/2547/files/unnamed-2.png?v=1792980197",
      alt: "The Hangar - Beaufort, SC",
      width: 1536,
      height: 1024,
    },
    partner: "The Hangar Training Facility",
    attireNote:
      "*We limit each session to 18 players! Athletes should arrive 10-15 minutes before the session. Please wear baseball and softball attire. Turfs/Training Shoes & your GLOVE. Each athlete will receive a FREE High Level Throwing® Getting Started Training Guide sent via email!",
    // This page lists "Arm Care + HLT Patterns" without the med ball.
    format: [
      "Introduction + Discussion",
      "Dynamic Warm Up + Prep Drills",
      "Arm Care + HLT Patterns",
      "Drills & Progressions",
      "Overhand Throwing Velocity Testing",
    ],
    sport: "SOFTBALL",
    sessions: [
      {
        name: "Session 1",
        time: "830AM-1030AM",
        ages: "Ages 9-12",
        price: "$160",
        sport: "BASEBALL",
        product: "hlt-clinic-beaufort-sc-session-1-tuesday-december-29th-830am-1030am-160",
      },
      {
        name: "Session 2",
        time: "11AM-1PM",
        ages: "Ages 9-12",
        price: "$160",
        product: "hlt-clinic-beaufort-sc-session-2-tuesday-december-29th-11am-1pm-160",
      },
      {
        name: "Session 3",
        time: "2PM-4PM",
        ages: "Ages 13-18",
        price: "$160",
        product: "hlt-clinic-beaufort-sc-session-3-tuesday-december-29th-2pm-4pm-160",
      },
      {
        name: "Session 4",
        time: "430PM-630PM",
        ages: "Ages 13-18",
        price: "$160",
        product: "hlt-clinic-beaufort-sc-session-4-tuesday-december-29th-430pm-630pm-160",
      },
    ],
    coach: {
      label: "Coach Access - Choose Any Session to Attend!",
      price: "$125",
      product: "hlt-clinic-beaufort-sc-coach-access-125",
    },
  },
  {
    handle: "high-level-throwing-clinic-newtown-pa-november-2026",
    city: "Newtown, PA",
    dayAndDate: "Sunday, November 15th",
    year: "2026",
    isoDate: "2026-11-15",
    venue: { name: "NAC Sports", street: "207 Penns Trail", cityLine: "Newtown, PA 18940" },
    venueLogo: {
      src: "/logos/clinic-newtown-rock-flyer.jpg",
      alt: "High Level Throwing Clinic - Newtown Rock",
      width: 1024,
      height: 1024,
    },
    sessions: [
      {
        name: "Session 1",
        time: "130PM-330PM",
        ages: "Ages 12-18",
        price: "$160",
        note: "Open Session",
        product: "hlt-clinic-newtown-pa-session-1-sunday-november-15th-130pm-330pm-160",
      },
    ],
    coach: {
      label: "Coach Access - Choose Any Session to Attend!",
      price: "$125",
      product: "hlt-clinic-newtown-pa-coach-access-125",
    },
  },
  {
    handle: "high-level-throwing-clinic-warminster-pa-january-2027",
    city: "Warminster, PA",
    dayAndDate: "January 22nd-24th",
    year: "2027",
    isoDate: "2027-01-22",
    endIsoDate: "2027-01-24",
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
    instructorLine:
      "This clinic will be run by Owner/Founder, Austin Wasserman with sessions focusing on the Foundations & Advanced Concepts of High Level Throwing® for Baseball & Softball Athletes!",
    sport: "SOFTBALL",
    sessions: [
      {
        name: "Session 1",
        time: "9AM-11AM",
        ages: "Ages 9-12",
        price: "$160",
        sport: "BASEBALL & SOFTBALL",
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
