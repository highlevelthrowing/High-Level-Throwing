/**
 * Buttons addressed by the label above them, rather than by the URL they
 * currently carry.
 *
 * Lebanon needed this and handle-to-handle swapping could not do it. Its rows
 * are shifted by one, so the correct rewrite is a rotation — session 2's link
 * becomes session 1's, session 3's becomes session 2's, and so on. Sequential
 * string replacement applies those in order and re-replaces values it just
 * wrote, landing everything on the same product.
 *
 * Matching the label instead makes each row independent. The key is a
 * substring of the label as it renders; the value is the handle of the product
 * whose TITLE matches that label — not the handle that looks like it matches.
 * Lebanon's handles are numbered differently from their titles (the product
 * titled "Session 3" has a handle saying session-1), so the handles cannot be
 * trusted to identify a session.
 *
 * A row whose label matches nothing is left alone; a button with no label
 * above it is blanked.
 */
export const PAGE_BUTTON_BY_LABEL: Record<string, [string, string][]> = {
  // Every one of these pages shifted its buttons by one row, the same defect
  // as Lebanon, Tracy and Beaufort — they were all built from one template and
  // all inherited it. Each key is a substring of the label as it renders; each
  // value is the handle of the product whose TITLE matches that label.
  //
  // Verified by comparing against product titles, not handles. Handles here
  // are unreliable: Lebanon's product titled "Session 3" has a handle saying
  // session-1, Fresno's December products carry fresno-* handles under Clovis
  // titles, and Crystal Lake's coach row sold a Houston pass.
  // Littleton was copied from a Denver page: its four session buttons sold
  // Denver sessions and its coach row sold Livermore, CA's pass. It has its
  // own products now, created for the December 12th date.
  "high-level-throwing-clinic-littleton-co-2026": [
    ["Session 1:", "hlt-clinic-littleton-co-session-1-saturday-december-12th-9am-11am-155"],
    ["Session 2:", "hlt-clinic-littleton-co-session-2-saturday-december-12th-1130am-130pm-155"],
    ["Session 3:", "hlt-clinic-littleton-co-session-3-saturday-december-12th-2pm-4pm-155"],
    ["Session 4:", "hlt-clinic-littleton-co-session-4-saturday-december-12th-430pm-630pm-155"],
    ["Coach Access", "hlt-clinic-littleton-co-coach-access-100"],
  ],
  "high-level-throwing-clinic-crystal-lake-il-2026": [
    ["Coach Session", "hlt-clinic-crystal-lake-il-coach-session-1-saturday-november-21st-8am-9am-125"],
    ["Player Session 1", "hlt-clinic-crystal-lake-il-session-1-friday-november-20th-6pm-8pm-160-ages-13-softball"],
    ["Player Session 2", "hlt-clinic-crystal-lake-il-player-session-2-saturday-november-21st-930am-1130am-160-ages-9-12-softball"],
    ["Player Session 3", "hlt-clinic-crystal-lake-il-player-session-3-saturday-november-21st-12pm-2pm-160-ages-9-12-softball"],
    ["Player Session 4", "hlt-clinic-crystal-lake-il-player-session-4-saturday-november-21st-230pm-430pm-160-ages-13-softball"],
    ["Player Session 5", "hlt-clinic-crystal-lake-il-player-session-5-saturday-november-21st-5pm-7pm-160-ages-13-softball"],
    ["Player Session 6", "hlt-clinic-crystal-lake-il-player-session-6-sunday-november-22nd-9am-11am-160-ages-9-12-baseball"],
    ["Player Session 7", "hlt-clinic-crystal-lake-il-player-session-7-sunday-november-22nd-1130am-130pm-160-ages-13-baseball"],
  ],
  "high-level-throwing-clinic-houston-tx-november-2026": [
    ["Session 1:", "hlt-clinic-katy-tx-session-1-saturday-august-22nd-9am-11am-160-premier-aces-12"],
    ["Session 2:", "hlt-clinic-katy-tx-session-2-saturday-august-22nd-1130am-130pm-160-tbd"],
    ["Session 3:", "hlt-clinic-katy-tx-session-3-saturday-august-22nd-2pm-4pm-160-illusions-fastpitch-14"],
    ["Session 4:", "hlt-clinic-katy-tx-session-4-saturday-august-22nd-5pm-7pm-160-tbd"],
    ["Coach Access", "hlt-clinic-katy-tx-coach-access-100"],
  ],
  "high-level-throwing-clinic-poland-oh-february-2027": [
    ["Session 1:", "hlt-clinic-warren-oh-session-1-friday-february-7th-6p-8pm-155-ages-13"],
    ["Session 2:", "hlt-clinic-warren-oh-session-2-saturday-february-8th-9am-11am-155-ages-13"],
    ["Session 3:", "hlt-clinic-warren-oh-session-3-saturday-february-8th-1130am-130pm-155-ages-9-12"],
    ["Session 4:", "hlt-clinic-warren-oh-session-4-saturday-february-8th-2pm-4pm-155-ages-13"],
    ["Session 5:", "hlt-clinic-warren-oh-session-5-sunday-february-9th-9am-11am-155-ages-9-12-baseball"],
    ["Coach Access", "hlt-clinic-warren-oh-coach-access-100"],
  ],
  "high-level-throwing-clinic-fresno-ca-december-2026": [
    ["Session 1:", "hlt-clinic-fresno-ca-session-1-sunday-dec-19th-9am-11am-160-ages-9-12"],
    ["Session 2:", "hlt-clinic-fresno-ca-session-2-saturday-dec-19th-1130am-130pm-160-ages-13"],
    ["Session 3:", "hlt-clinic-fresno-ca-session-3-saturday-dec-19th-2pm-4pm-160-ages-9-12"],
    ["Session 4:", "hlt-clinic-fresno-ca-session-4-saturday-dec-19th-5pm-7pm-160-ages-13"],
    ["Coach Access", "hlt-clinic-fresno-ca-2026-coach-access-125"],
  ],
  "high-level-throwing-clinic-fort-lauderdale-fl-2026": [
    ["Athlete Registration", "hlt-clinic-fort-lauderdale-fl-wednesday-december-16th-7pm-9pm-160-ages-12-softball"],
    ["Coach Access", "hlt-clinic-fort-lauderdale-fl-coach-access-125"],
  ],
  "high-level-throwing-clinic-lebanon-in-2026": [
    ["Session 1:", "hlt-clinic-lebanon-in-session-1-saturday-november-22nd-9am-11am-155-ages-9u-10u-11u"],
    ["Session 2:", "hlt-clinic-lebanon-in-session-2-saturday-november-22nd-1130am-130pm-155-ages-12-18-foundations-course"],
    ["Session 3:", "hlt-clinic-indianapolis-lebanon-in-session-1-saturday-november-7th-9am-11am-160-ages-9-12-softball"],
    ["Session 4:", "hlt-clinic-indianapolis-lebanon-in-session-1-saturday-november-7th-1130am-130pm-160-ages-9-12-softball"],
    ["Session 5:", "hlt-clinic-indianapolis-lebanon-in-session-3-saturday-november-7th-2pm-4pm-160-ages-13-softball"],
    ["Session 6:", "hlt-clinic-indianapolis-lebanon-in-session-4-saturday-november-7th-5pm-7pm-160-ages-13-softball"],
    ["Session 7:", "hlt-clinic-indianapolis-lebanon-in-session-5-sunday-november-8th-9am-11am-160-ages-9-12-softball"],
    ["Session 8:", "hlt-clinic-indianapolis-lebanon-in-session-6-sunday-november-8th-1130am-1130pm-160-ages-13-softball"],
    ["Session 9:", "hlt-clinic-indianapolis-lebanon-in-session-8-sunday-november-8th-2pm-4pm-160-ages-13-softball"],
    ["Coach Access", "hlt-clinic-springfield-va-2026-coach-access-125"],
  ],
};


/** Every product a clinic page sells, in the order its buttons appear. */
export function productsForClinicPage(pageHandle: string): string[] {
  const rules = PAGE_BUTTON_BY_LABEL[pageHandle];
  return rules ? rules.map(([, handle]) => handle) : [];
}

type AvailabilityResponse = Record<string, { availableForSale: boolean } | null>;

/**
 * True when a clinic has nothing left to sell.
 *
 * Asked for so the schedule can say so plainly rather than sending someone to
 * a page of greyed-out buttons. A clinic counts as sold out only when every
 * one of its products is unavailable — a single remaining coach pass means it
 * is still open, which is why this looks at all of them rather than the
 * sessions alone.
 *
 * Unknown pages and any failure return false: a clinic wrongly marked sold out
 * turns people away, while one wrongly left open merely shows a full session,
 * which the product page already handles.
 */
export async function isClinicSoldOut(pageHandle: string): Promise<boolean> {
  const handles = productsForClinicPage(pageHandle);
  if (!handles.length) return false;

  const query = `{${handles
    .map((h, i) => `p${i}: product(handle: ${JSON.stringify(h)}) { availableForSale }`)
    .join(" ")}}`;

  try {
    const { shopifyFetch } = await import("./shopify/client");
    const data = await shopifyFetch<AvailabilityResponse>({ query, revalidate: 300 });
    const found = Object.values(data).filter((p): p is { availableForSale: boolean } => !!p);
    if (!found.length) return false;
    return found.every((p) => !p.availableForSale);
  } catch {
    return false;
  }
}
