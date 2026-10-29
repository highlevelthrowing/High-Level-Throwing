import { fetchWithRetry } from "@/lib/retry";

const EMBED_TARGETS: Record<string, string> = {
  leaderboard: "https://high-level-throwing.myshopify.com/pages/leaderboard",
  "velocity-tracker": "https://high-level-throwing.myshopify.com/pages/velocity-tracker",
  search: "https://high-level-throwing.myshopify.com/search",
  "terms-of-service": "https://high-level-throwing.myshopify.com/pages/terms-of-service",
  shipping: "https://high-level-throwing.myshopify.com/pages/shipping",
  "privacy-policy": "https://high-level-throwing.myshopify.com/pages/privacy-policy",
  "refund-policy": "https://high-level-throwing.myshopify.com/pages/refund-policy",
};

const SHOPIFY_STORE = "https://high-level-throwing.myshopify.com";

// Pages that are designed rather than inherited — they carry their own colours
// and are left exactly as the theme renders them.
const STYLED_BY_THEME = new Set(["leaderboard"]);

/** Per-page text corrections applied to the proxied HTML. See usage below. */
/**
 * Clinic pages are built by copying a previous clinic's page, which leaves the
 * old clinic's product links behind. Rewrite them to this clinic's own product
 * rather than ship a link that sells the wrong session.
 */
const PAGE_LINK_FIXES: Record<string, [string, string][]> = {
  // Tracy's 2026 page was copied from the January clinic, so every session
  // button still sells a January product that no longer exists — all five 404.
  // The live products kept their older handles, so the dates in the targets
  // below are the handles' own, not this clinic's.
  // Tracy's theme template pairs every label with the NEXT session's product.
  // Its programs_item blocks are shifted by one: the first block has no title
  // but carries session 1's link, so "Session 1" sits above session 2's button,
  // and "Session 5" sits above the Coach Access pass. Someone registering for
  // Session 1 was buying Session 2; someone picking Session 5 was buying a $125
  // coach pass.
  //
  // The earlier mapping here rewrote January handles to December ones faithfully
  // — which fixed five 404s but kept the offset, so the wrong-product bug was
  // live on this site too.
  //
  // Each January handle is therefore mapped to the product its LABEL promises,
  // not to its own number. Read the table as "the button under this label now
  // buys this":
  //
  //   (no label)  -> Coach Access      first block, title is empty in the theme
  //   Session 1   -> session 1         was session 2
  //   Session 2   -> session 2         was session 3
  //   Session 3   -> session 3         was session 4
  //   Session 4   -> session 4         was session 5
  //   Session 5   -> session 5         was Coach Access
  //
  // This is a patch over a broken template. The real fix is reordering the
  // blocks in the theme editor; once that is done every entry here becomes a
  // no-op and the whole block can be deleted.
  "high-level-throwing-clinic-tracy-ca-december-2026": [
    [
      "hlt-clinic-tracy-ca-session-2-saturday-january-25th-1130am-130pm-155-ages-8-12",
      "hlt-clinic-tracy-ca-session-1-saturday-december-6th-9am-11am-155-ages-8-12",
    ],
    [
      "hlt-clinic-tracy-ca-session-3-saturday-january-25th-2pm-4pm-155-ages-13",
      "hlt-clinic-tracy-ca-session-2-saturday-december-6th-1130am-130pm-155-ages-8-12",
    ],
    [
      "hlt-clinic-tracy-ca-session-4-sunday-january-26th-9am-11am-155-ages-8-12",
      "hlt-clinic-tracy-ca-session-3-saturday-december-6th-2pm-4pm-155-ages-13",
    ],
    [
      "hlt-clinic-tracy-ca-session-5-sunday-january-26th-1130am-130pm-155-ages-13",
      "hlt-clinic-tracy-ca-session-4-sunday-december-7th-9am-11am-155-ages-8-12",
    ],
    [
      "hlt-clinic-tracy-dc-coach-access-100",
      "hlt-clinic-tracy-ca-session-5-sunday-december-7th-1130am-130pm-155-ages-13",
    ],
    // The unlabelled first block: point it at the Coach Access pass, which the
    // theme otherwise leaves with a label and no button at all.
    [
      "hlt-clinic-tracy-ca-session-1-saturday-january-25th-9am-11am-155-ages-8-12",
      "hlt-clinic-tracy-dc-coach-access-100",
    ],
  ],
  // Beaufort was copied from the Lebanon, IN page and every button still sells
  // a Lebanon or Livermore product — a visitor registering for a December
  // clinic in South Carolina was buying a November one in Indiana. Each label
  // is mapped to the Beaufort product it names.
  "high-level-throwing-clinic-beaufort-sc-december-2026": [
    [
      "hlt-clinic-lebanon-in-session-2-saturday-november-22nd-1130am-130pm-155-ages-12-18-foundations-course",
      "hlt-clinic-beaufort-sc-session-1-tuesday-december-29th-830am-1030am-160",
    ],
    [
      "hlt-clinic-indianapolis-lebanon-in-session-1-saturday-november-7th-9am-11am-160-ages-9-12-softball",
      "hlt-clinic-beaufort-sc-session-2-tuesday-december-29th-11am-1pm-160",
    ],
    [
      "hlt-clinic-indianapolis-lebanon-in-session-1-saturday-november-7th-1130am-130pm-160-ages-9-12-softball",
      "hlt-clinic-beaufort-sc-session-3-tuesday-december-29th-2pm-4pm-160",
    ],
    [
      "hlt-clinic-indianapolis-lebanon-in-session-3-saturday-november-7th-2pm-4pm-160-ages-13-softball",
      "hlt-clinic-beaufort-sc-session-4-tuesday-december-29th-430pm-630pm-160",
    ],
    [
      "hlt-clinic-livermore-ca-coach-access",
      "hlt-clinic-beaufort-sc-coach-access-125",
    ],
  ],
  "high-level-throwing-clinic-fort-lauderdale-fl-2026": [
    [
      "hlt-clinic-uxbridge-ma-2024-coach-access-100",
      "hlt-clinic-fort-lauderdale-fl-coach-access-125",
    ],
    // The flyer on the live theme predates the South Florida Select Softball
    // partnership. The theme itself is read-only to us, so the updated artwork
    // is swapped in here until the section setting is changed in the editor.
    [
      "//high-level-throwing.myshopify.com/cdn/shop/files/Screen_Shot_2026-10-05_at_11.41.03_AM.png?v=1791230675",
      "https://www.highlevelthrowing.com/images/clinic-fort-lauderdale-2026.jpg",
    ],
  ],
};

const PAGE_TEXT_FIXES: Record<string, [string, string][]> = {
  "high-level-throwing-clinic-tracy-ca-december-2026": [
    ["December 5th & 76h 2026", "December 5th & 6th 2026"],
  ],
  // The page says Wednesday in its intro and in the session list, and Monday
  // on the registration row. 16 December 2026 is a Wednesday, and the product
  // title says Wednesday, so the registration row is the odd one out.
  // The clinic moved to 12 December 2026, which the Tockify calendar already
  // says. The page was still advertising the January date in its heading and
  // on all four session rows; one replacement covers every occurrence.
  "high-level-throwing-clinic-littleton-co-2026": [
    ["Saturday, January 24th", "Saturday, December 12th"],
    // Priced to match the other 2026/27 clinics rather than the older $155
    // the copied page carried.
    ["$155", "$160"],
    ["$100", "$125"],
    // The heading said only the year. Matching "Littleton, CO 2026" exactly
    // leaves the venue's "Littleton, CO 80122" postcode alone.
    ["Littleton, CO 2026", "Littleton, CO December 12th 2026"],
  ],
  "high-level-throwing-clinic-fort-lauderdale-fl-2026": [
    ["Athlete Registration: Monday, December 16th", "Athlete Registration: Wednesday, December 16th"],
  ],
  "high-level-throwing-clinic-poland-oh-february-2027": [
    ["Poland, Ohio 2026", "Poland, Ohio 2027"],
    ["Poland , OH 2026", "Poland, OH 2027"],
    ["Poland, OH 2026", "Poland, OH 2027"],
    ["Poland , OH", "Poland, OH"],
  ],
};

const SEGMENT = /^[a-z0-9®–—_.-]+$/i;

// A single segment not in EMBED_TARGETS is a Shopify page handle, so clinic
// pages (and any page added later) embed without being listed here. Multiple
// segments are a path on the store — blog articles arrive as blogs/news/<slug>.
function resolveTarget(segments: string[]): string | null {
  if (segments.length === 0) return null;

  if (segments.length === 1) {
    const page = segments[0];
    if (EMBED_TARGETS[page]) return EMBED_TARGETS[page];
    if (SEGMENT.test(page)) return `${SHOPIFY_STORE}/pages/${page}`;
    return null;
  }

  if (segments[0] !== "blogs" || !segments.every((s) => SEGMENT.test(s))) return null;
  return `${SHOPIFY_STORE}/${segments.map(encodeURIComponent).join("/")}`;
}


/**
 * Shopify's own analytics travel with the proxied markup, and they post to
 * high-level-throwing.myshopify.com/api/collect. Served from this domain that
 * is cross-origin, so every beacon is refused by CORS, the promise rejects
 * unhandled, and the bundle retries — on a registration page left open for a
 * minute the loop is enough to make scrolling stutter and then stall, with the
 * Register buttons unreachable underneath.
 *
 * Only the analytics go. The theme scripts, cart sync, dynamic checkout and the
 * product-options app are what make the page work and are left alone.
 */
function stripShopifyAnalytics(html: string): string {
  const drop: RegExp[] = [
    // Web Pixels Manager, which carries trekkie with it
    /<script\b[^>]*>(?:(?!<\/script>)[\s\S])*?wpmLoader(?:(?!<\/script>)[\s\S])*?<\/script>/gi,
    // the trekkie loader itself
    /<script\b[^>]*class=["']analytics["'][^>]*>[\s\S]*?<\/script>/gi,
    // perf-kit, the one that actually names api/collect
    /<script\b[^>]*shopify-perf-kit[^>]*>\s*<\/script>/gi,
    /<script\b[^>]*src=["'][^"']*shopify-perf-kit[^"']*["'][^>]*\/?>/gi,
  ];
  return drop.reduce((acc, re) => acc.replace(re, ""), html);
}

/**
 * Registering for a clinic is the opt-in for HLT's email list, so the pages
 * that take the registration have to say so — that disclosure is what makes the
 * consent defensible, and it is the only notice a registrant ever sees.
 *
 * Injected rather than written into the theme because there are 600+ clinic
 * pages and a published theme cannot be written to from here. It carries its own
 * background override: EMBED_THEME strips background-color from everything that
 * is not media or a control, so a plain panel would come out invisible.
 */
const CONSENT_NOTICE = /* html */ `
<style id="hlt-consent-style">
  :root:root #hlt-consent-notice{
    background:var(--hlt-surface,#111) !important;
    border:1px solid var(--hlt-border,#2a2a2a) !important;
    border-left:3px solid var(--hlt-lime,#c6ff2e) !important;
    border-radius:10px !important;
    margin:28px auto 8px !important;
    padding:16px 18px !important;
    max-width:760px !important;
    font-size:14px !important;
    line-height:1.55 !important;
  }
  :root:root #hlt-consent-notice p{
    color:var(--hlt-muted,rgba(255,255,255,0.78)) !important;
    margin:0 !important;
  }
  :root:root #hlt-consent-notice strong{ color:var(--hlt-text,#fff) !important; }

  /* Nothing overlays the register buttons on a registration page. */
  :root:root [id^="evm-product-sp"],
  :root:root .evm-product-sp-block{ display:none !important; }

  /* Registration rows.

     The theme puts 24px above each button and nothing below, so every button
     sat flush against the NEXT session's heading and read as belonging to it.
     On a page where each button charges $160 for one specific time slot, that
     ambiguity is worth removing: the button now hugs the label it belongs to
     and is separated from the one after. The button's own appearance is set
     by the canonical rule further down, not here. */
  :root:root .maindivU .maintxt_1{
    margin-top:8px !important;
    margin-bottom:28px !important;
  }
  :root:root .maindivU .maintxt_1:empty{ display:none !important; }
</style>
<div id="hlt-consent-notice">
  <p><strong>Heads up:</strong> by registering you&rsquo;ll receive your clinic
  details plus throwing guides, drills and occasional updates from High Level
  Throwing. Unsubscribe anytime &mdash; there&rsquo;s a one-click link in every
  email.</p>
</div>
`;


/**
 * Tracy's session list has one button too many at the top and one too few at
 * the bottom.
 *
 * Its theme section renders a label block (`maintxt_0`) followed by a button
 * block (`maintxt_1`) for each row. The rows are shifted: the first pair has
 * an empty label with a live button, and the last pair has the Coach Access
 * label with an empty button. A visitor saw a stray "I WANT THIS" floating
 * above Session 1, and coaches had a price with nothing to click.
 *
 * The button is moved from the first block into the last, which lands it
 * directly under the Coach Access label and leaves the empty pair rendering
 * nothing. The session buttons in between are untouched — those are already
 * paired correctly by PAGE_LINK_FIXES.
 *
 * Remove this once the blocks are reordered in the theme editor.
 */
/**
 * Pages whose session list opens with a button that has no label.
 *
 * Both were copied from an earlier clinic and gained a block at the top, so
 * the first row is an empty label with a live button. Tracy also lost the
 * button from its last row (Coach Access had a price and nothing to click);
 * Beaufort kept its one. Handled together:
 *
 *   - if the last row has a label but no link, the orphan's link is moved
 *     there, which is what Coach Access needs;
 *   - otherwise the orphan is simply blanked.
 *
 * Opt-in by page on purpose. The rule "blank the first button" would delete a
 * real button on a correctly built page, so it only runs where the defect has
 * actually been seen.
 *
 * Remove a page from this set once its blocks are fixed in the theme editor.
 */
const STRANDED_FIRST_BUTTON = new Set([
  "high-level-throwing-clinic-tracy-ca-december-2026",
  "high-level-throwing-clinic-beaufort-sc-december-2026",
  "high-level-throwing-clinic-lebanon-in-2026",
  "high-level-throwing-clinic-crystal-lake-il-2026",
  "high-level-throwing-clinic-fort-lauderdale-fl-2026",
  "high-level-throwing-clinic-houston-tx-november-2026",
  "high-level-throwing-clinic-poland-oh-february-2027",
  "high-level-throwing-clinic-fresno-ca-december-2026",
  "high-level-throwing-clinic-littleton-co-2026",
]);

function fixStrandedClinicButton(html: string): string {
  const BLOCK = /<div\s+class="maintxt_1">([\s\S]*?)<\/div>/g;
  const blocks = [...html.matchAll(BLOCK)];
  if (blocks.length < 2) return html;

  const first = blocks[0];
  const last = blocks[blocks.length - 1];

  // An unset button renders as <a href="" ...></a>, so test the href rather
  // than the tag — the anchor is always present either way.
  const firstHref = first[1].match(/href="([^"]+)"/);
  if (!firstHref) return html;
  const lastHasHref = /href="[^"]+"/.test(last[1]);

  let out = html;

  // A block can carry a link and no label: the theme stores the button's URL
  // and its text separately, so clearing the text leaves <a href="...">
  // </a> — a real link that renders at zero height and is invisible. Beaufort's
  // Coach Access row was exactly this once its href was corrected. Give any
  // such anchor the same wording as its neighbours.
  out = out.replace(
    /(<div class="maintxt_1">\s*<a\b[^>]*href="[^"]+?"[^>]*>)(\s*)(<\/a>)/g,
    (_m, open: string, _gap: string, close: string) => `${open}I WANT THIS${close}`
  );

  if (!lastHasHref) {
    const blocks2 = [...out.matchAll(/<div\s+class="maintxt_1">([\s\S]*?)<\/div>/g)];
    const last2 = blocks2[blocks2.length - 1];
    const filled = last2[0]
      .replace(/href="[^"]*"/, `href="${firstHref[1]}"`)
      .replace(/>\s*<\/a>/, ">I WANT THIS</a>");
    out = out.slice(0, last2.index!) + filled + out.slice(last2.index! + last2[0].length);
  }

  // Indices from the original string are stale after the rewrites above.
  const firstNow = out.match(/<div\s+class="maintxt_1">[\s\S]*?<\/div>/);
  if (!firstNow) return out;
  return (
    out.slice(0, firstNow.index!) +
    '<div class="maintxt_1"></div>' +
    out.slice(firstNow.index! + firstNow[0].length)
  );
}


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
const PAGE_BUTTON_BY_LABEL: Record<string, [string, string][]> = {
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
    ["Session 4:", "hlt-clinic-littleton-co-session-4-saturday-december-12th-5pm-7pm-155"],
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

const STORE_ORIGIN = "https://highlevelthrowing.com";
const BUTTON_UTM = "?utm_source=copyToPasteBoard&utm_medium=product-links&utm_content=web";

function retargetButtonsByLabel(html: string, rules: [string, string][]): string {
  // Walk label/button pairs in document order. maintxt_0 can contain nested
  // markup, so the label block is found by its opening tag and read up to the
  // button block that follows it.
  // The theme emits <div  class="maintxt_0"> with two spaces and
  // <div class="maintxt_1"> with one, so the whitespace has to be loose. A
  // single-space pattern here matched nothing at all and the rewrite silently
  // did nothing.
  const PAIR = /<div\s+class="maintxt_0">([\s\S]*?)<div\s+class="maintxt_1">([\s\S]*?)<\/div>/g;
  return html.replace(PAIR, (whole, label: string, button: string) => {
    const text = label.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    const rule = rules.find(([needle]) => text.includes(needle));
    if (!rule) return whole;
    const href = `${STORE_ORIGIN}/products/${rule[1]}${BUTTON_UTM}`;
    const fixed = /href="[^"]*"/.test(button)
      ? button.replace(/href="[^"]*"/, `href="${href}"`)
      : button;
    const labelled = /<a\b[^>]*>\s*<\/a>/.test(fixed)
      ? fixed.replace(/(<a\b[^>]*>)\s*(<\/a>)/, "$1I WANT THIS$2")
      : fixed;
    return whole.replace(button, labelled);
  });
}

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const segments = (path ?? []).map((s) => decodeURIComponent(s));
  const page = segments.join("/");
  const targetUrl = resolveTarget(segments);

  if (!targetUrl) {
    return new Response("Unknown embed target.", { status: 404 });
  }

  // Same host, same failure: a pooled socket Shopify already closed. Every
  // clinic registration page is rendered through here, so a single dead socket
  // would otherwise turn into "Unable to load this page right now."
  const res = await fetchWithRetry(targetUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; HLTStorefrontEmbed/1.0)" },
    next: { revalidate: 300 },
  } as RequestInit);

  if (!res.ok) {
    return new Response("Unable to load this page right now.", { status: 502 });
  }

  let html = stripShopifyAnalytics(await res.text());
  html = html.replace(/<head(\s[^>]*)?>/i, (match) => `${match}\n<base href="${targetUrl}">`);

  // Corrections the theme still carries. Writes to a published theme are
  // refused by Shopify, so a wrong year on a live registration page can only be
  // fixed here until someone edits it in the theme editor. Each entry is scoped
  // to one page and is a no-op once the source is corrected, so leaving a stale
  // entry behind costs nothing.
  const corrections = PAGE_TEXT_FIXES[page];
  if (corrections) {
    for (const [wrong, right] of corrections) html = html.split(wrong).join(right);
  }

  const byLabel = PAGE_BUTTON_BY_LABEL[page];
  if (byLabel) html = retargetButtonsByLabel(html, byLabel);

  if (STRANDED_FIRST_BUTTON.has(page)) {
    html = fixStrandedClinicButton(html);
  }

  const linkFixes = PAGE_LINK_FIXES[page];
  if (linkFixes) {
    for (const [wrong, right] of linkFixes) html = html.split(wrong).join(right);
  }

  // Clinic pages are the registration point, so they carry the email-consent
  // notice. Matched on the handle: every clinic page handle names the clinic.
  if (/clinic/i.test(page)) {
    html = html.replace(/<\/main>/i, `${CONSENT_NOTICE}</main>`);

    // A social-proof app ("Amanda in Kentwood just purchased...") renders a
    // 400x140 position:fixed panel at z-index 9999999 in the lower left. The
    // six I WANT THIS buttons sit at x~34 and scroll through that fixed band,
    // so the panel covers a register button on the way past. It stays on the
    // product pages where it belongs; on the page that takes the registration
    // nothing is allowed to sit on top of the buy control.
    //
    // It is not a <script src> — the theme lists it in a `var urls = [...]`
    // array that a loader walks and injects, so the URL has to come out of the
    // array. Splitting on commas is safe: the entries are quoted URLs.
    html = html.replace(
      /(var\s+urls\s*=\s*\[)([^\]]*)(\])/g,
      (_match, open: string, body: string, close: string) => {
        const kept = body
          .split(",")
          .map((entry) => entry.trim())
          .filter((entry) => entry && !/salespush/i.test(entry));
        return `${open}${kept.join(",")}${close}`;
      }
    );
  }

  // Strip the theme's own announcement bar / header and footer sections so the
  // embed only shows the page's actual content — the storefront already renders
  // its own header/footer around the iframe, and stacking both broke scrolling.
  html = html.replace(/<div[^>]*id="shopify-section-[^"]*announcement-bar"[\s\S]*?(?=<main[^>]*id="MainContent")/i, "");
  html = html.replace(/<div[^>]*id="shopify-section-[^"]*__footer"[\s\S]*?(?=<\/body>)/i, "");

  // The theme carries its own Klaviyo onsite script, which fires the 15% OFF
  // signup pop-up from inside the iframe. Suppressing Klaviyo on the parent
  // page does nothing about that, so the script is removed here: someone part
  // way through registering for a clinic should not be interrupted.
  html = html.replace(
    /<script[^>]*static\.klaviyo\.com[^>]*>\s*<\/script>/gi,
    ""
  );
  html = html.replace(/<script[^>]*\bklaviyo\b[^>]*\/>/gi, "");

  // The theme goes in last, after the section <style> blocks Shopify emits in
  // the body — those are more specific and carry !important, so a stylesheet in
  // <head> loses to them.
  // The leaderboard is a custom-built page with its own palette — badges, stat
  // cards, club colours. Repainting it flattened all of that, so it keeps the
  // theme's own styling and only gets the functional runtime.
  const keepsOwnStyling = STYLED_BY_THEME.has(page);
  const theme = keepsOwnStyling ? "" : EMBED_THEME;
  const guardOff = keepsOwnStyling
    ? '<script>window.__hltSkipContrast = true;</script>'
    : "";

  const extras = page === "leaderboard" ? LEADERBOARD_TRIM : "";
  html = html.replace(/<\/body>/i, `${guardOff}${theme}${EMBED_RUNTIME}${extras}</body>`);

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

// Injected into every proxied page. The <base href> above points at the Shopify
// store so the theme's own CSS, JS and images still resolve, but that also makes
// every relative link in the page resolve back to the store — which would send
// visitors off this site mid-journey. This rewrites those links to their
// equivalent path here, drops target="_blank" so nothing opens a new window, and
// reports the document height so the iframe can size itself to its content
// instead of scrolling inside a fixed-height box.
const EMBED_RUNTIME = /* html */ `
<script>
(function () {
  // The store's own domain, this site's domain, and whatever host is framing
  // us (so local and preview deployments behave the same as production).
  var OWN_HOSTS = ["high-level-throwing.myshopify.com", "highlevelthrowing.com"];
  var IN_SITE = /^\\/(products|pages|collections|blogs|cart|search)(\\/|$|\\?)/;

  function bare(host) { return String(host || "").replace(/^www\\./, ""); }

  function fixLinks() {
    var links = document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (a.target === "_blank") a.removeAttribute("target");

      // The page builder leaves a labelless copy of the session button behind.
      // It was invisible until these anchors gained a background, so tag it and
      // let the stylesheet hide it rather than show an empty lime pill.
      var inline = a.getAttribute("style") || "";
      var blank = inline.indexOf("2cbc13") !== -1 && !a.textContent.replace(/\s+/g, "");
      // fixLinks runs again on every DOM change, so only add the class once.
      if (blank && a.className.indexOf("hlt-blank") === -1) {
        a.className = a.className ? a.className + " hlt-blank" : "hlt-blank";
      }

      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#") continue;
      var url;
      try { url = new URL(a.href); } catch (e) { continue; }
      var host = bare(url.hostname);
      var isOurs = OWN_HOSTS.indexOf(host) !== -1 || host === parentHost;
      if (isOurs && IN_SITE.test(url.pathname)) {
        // Break out of the iframe so the storefront renders it with its own
        // header, footer and cart rather than nesting a page inside a page.
        a.setAttribute("href", inSiteUrl(url));
        a.setAttribute("target", "_top");
      }
    }
  }

  // The <base href> above points at the Shopify store so the theme's assets
  // resolve, which also means a relative URL — in an href, or assigned to
  // location — resolves against the STORE, not this site. Every in-site link
  // therefore has to be written as an absolute URL on the parent's origin.
  var parentOrigin = "";
  try { parentOrigin = top.location.origin; } catch (e) {}
  if (!parentOrigin) {
    try { parentOrigin = new URL(document.referrer).origin; } catch (e) {}
  }

  var parentHost = bare(parentOrigin ? parentOrigin.replace(/^https?:\\/\\//, "") : "");

  function inSiteUrl(url) { return parentOrigin + url.pathname + url.search; }

  var lastHeight = 0;
  function reportHeight() {
    var h = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );
    if (Math.abs(h - lastHeight) < 24) return;
    lastHeight = h;
    parent.postMessage({ hltEmbedHeight: h }, "*");
  }

  // Last-resort contrast guard. Section styles can carry !important with higher
  // specificity than anything a stylesheet here declares, which is how a clinic
  // page ended up with its dates in near-black on black. Anything still too dark
  // to read against a dark ground gets an inline colour, which nothing outranks.
  function effectiveBg(el) {
    var node = el;
    while (node && node.nodeType === 1) {
      var bg = getComputedStyle(node).backgroundColor;
      var m = String(bg).match(/[\d.]+/g);
      if (m && (m.length < 4 || Number(m[3]) > 0.5)) {
        return 0.2126 * Number(m[0]) + 0.7152 * Number(m[1]) + 0.0722 * Number(m[2]);
      }
      node = node.parentElement;
    }
    return 0; // nothing opaque found — the page ground is black
  }

  function luminance(color) {
    var m = String(color).match(/[\d.]+/g);
    if (!m) return null;
    if (m.length > 3 && Number(m[3]) === 0) return null;
    return 0.2126 * Number(m[0]) + 0.7152 * Number(m[1]) + 0.0722 * Number(m[2]);
  }

  function fixContrast() {
    if (window.__hltSkipContrast) return;
    var all = document.body.getElementsByTagName("*");
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.dataset && el.dataset.hltContrast) continue;

      var hasText = false;
      for (var c = 0; c < el.childNodes.length; c++) {
        var n = el.childNodes[c];
        if (n.nodeType === 3 && n.textContent.trim().length > 1) { hasText = true; break; }
      }
      if (!hasText) continue;

      var L = luminance(getComputedStyle(el).color);
      if (L === null || L >= 90) continue;
      // Dark text on a light panel is correct — only fix it over a dark ground.
      if (effectiveBg(el) > 110) continue;

      el.style.setProperty("color", "#ffffff", "important");
      if (el.dataset) el.dataset.hltContrast = "1";
    }
  }

  function tick() { fixLinks(); fixContrast(); reportHeight(); }

  // fixLinks only runs on load and on DOM changes, so a click that lands before
  // it has swept (or on markup it has not seen) could still escape to the
  // Shopify store's own theme. Catch it at click time instead — this is the
  // guarantee that a clinic's buy button always ends up on this site's product
  // page, and therefore in this site's cart and checkout.
  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    var a = event.target && event.target.closest ? event.target.closest("a") : null;
    if (!a || !a.href) return;

    // In-page anchors ("Skip to content") resolve to the store through <base>,
    // but they belong to this document — leave them to the browser.
    var raw = a.getAttribute("href");
    if (!raw || raw.charAt(0) === "#") return;

    var url;
    try { url = new URL(a.href); } catch (e) { return; }

    var host = bare(url.hostname);
    var isOurs = OWN_HOSTS.indexOf(host) !== -1 || host === parentHost;
    if (!isOurs || !IN_SITE.test(url.pathname)) return;

    event.preventDefault();
    top.location.href = inSiteUrl(url);
  }, true);

  // The page can finish loading before the storefront attaches its listener, so
  // the first height would be announced to nobody. The parent pings until it
  // has an answer; each ping clears the de-dupe and re-reports.
  window.addEventListener("message", function (event) {
    if (event.data && event.data.hltEmbedPing) {
      lastHeight = 0;
      reportHeight();
    }
  });

  document.documentElement.style.overflowX = "hidden";
  tick();
  if (document.readyState !== "complete") window.addEventListener("load", tick);
  window.addEventListener("resize", reportHeight);
  if (window.ResizeObserver) new ResizeObserver(tick).observe(document.body);
  if (window.MutationObserver) {
    new MutationObserver(tick).observe(document.body, { childList: true, subtree: true });
  }
  // Images and theme sections settle after load; re-measure for a few seconds.
  var n = 0;
  var timer = setInterval(function () { tick(); if (++n > 20) clearInterval(timer); }, 400);
})();
</script>
`;

// Injected last in <body>, after the section styles Shopify emits there.
// The theme is a light Dawn build; these pages sit inside a dark site, so the
// surfaces are repainted and the type recoloured to match. Only colours are
// touched — the theme keeps its own layout, so any page picks this up without
// needing to be listed anywhere.
const EMBED_THEME = /* html */ `
<style id="hlt-embed-theme">
  :root{
    --hlt-bg:#000000;
    --hlt-surface:#111111;
    --hlt-border:#2a2a2a;
    --hlt-text:#ffffff;
    --hlt-muted:rgba(255,255,255,0.78);
    --hlt-lime:#c6ff2e;
    --hlt-navy:#000000;
  }

  /* Section styles in the body use selectors like .titlex2 p with !important,
     which out-rank plain element selectors. Repeating :root costs nothing
     visually and puts these ahead of them. */
  :root:root html, :root:root body { background:var(--hlt-bg) !important; color:var(--hlt-text) !important; }

  /* The theme paints white panels behind the copy. Strip every background so
     the page reads on this site's black, leaving real media and buttons alone. */
  :root:root body *:not(img):not(video):not(svg):not(canvas):not(iframe):not(.button):not(button):not(input):not(select):not(textarea) {
    background-color:transparent !important;
    background-image:none !important;
  }

  :root:root h1, :root:root h2, :root:root h3,
  :root:root h4, :root:root h5, :root:root h6,
  :root:root strong, :root:root b { color:var(--hlt-text) !important; }

  :root:root p, :root:root li, :root:root span, :root:root div,
  :root:root td, :root:root th, :root:root dd, :root:root dt, :root:root label,
  :root:root em, :root:root i, :root:root small, :root:root figcaption,
  :root:root blockquote, :root:root .rte, :root:root .rte * {
    color:var(--hlt-muted) !important;
  }

  :root:root a, :root:root a * { color:var(--hlt-lime) !important; }

  :root:root hr, :root:root table, :root:root td, :root:root th {
    border-color:var(--hlt-border) !important;
  }

  /* Calls to action keep the site's lime. */
  :root:root .button, :root:root button.button, :root:root a.button,
  :root:root .shopify-payment-button__button, :root:root input[type="submit"] {
    background:var(--hlt-lime) !important;
    color:var(--hlt-navy) !important;
    border-color:var(--hlt-lime) !important;
  }
  :root:root .button *, :root:root a.button * { color:var(--hlt-navy) !important; }
  :root:root .button--secondary, :root:root .button--tertiary {
    background:transparent !important;
    color:var(--hlt-text) !important;
    border:1px solid var(--hlt-border) !important;
  }

  /* The clinic session buttons come out of the page builder as anchors with an
     inline green-on-white style, which the background-stripping rule above
     flattens into plain underlined text. Repaint them as this site's lime pill.
     Three :root repetitions are needed: the stripper carries two plus a class
     from its :not(.button), so matching it takes one more. */
  :root:root:root .maintxt_1 a,
  :root:root:root a[style*="2cbc13"] {
    display:inline-block !important;
    background:var(--hlt-lime) !important;
    color:#000000 !important;
    border:none !important;
    border-radius:999px !important;
    padding:12px 28px !important;
    margin:6px 0 16px !important;
    /* A real tap target. These were 37px tall, under the 44px minimum, on a
       page whose only job is being tapped. */
    min-height:44px !important;
    display:inline-flex !important;
    align-items:center !important;
    justify-content:center !important;
    font-weight:800 !important;
    /* Was 0.95rem, which this theme renders at 9.5px because its root font is
       10px — barely legible. Fixed in px so it cannot be scaled away again. */
    font-size:13px !important;
    letter-spacing:0.5px !important;
    line-height:1.2 !important;
    text-decoration:none !important;
    white-space:nowrap !important;
  }
  :root:root:root .maintxt_1 a *,
  :root:root:root a[style*="2cbc13"] * { color:#000000 !important; }

  /* The builder leaves a labelless anchor on most of these pages - sometimes
     with no destination, sometimes pointing at a long-retired product. It was
     invisible while these anchors had no background, so giving them one would
     turn it into a blank lime blob. Hide it both ways: :empty covers the
     markup, and the runtime sweep below covers whitespace-only variants. */
  :root:root:root a[style*="2cbc13"][href=""],
  :root:root:root a[style*="2cbc13"]:empty,
  :root:root:root a[style*="2cbc13"].hlt-blank { display:none !important; }

  /* The theme packs copy edge to edge at a 1.25 line-height, which reads
     cramped next to the rest of this site. Loosen it without touching the
     theme's own layout structure. */
  :root:root body { padding-left:28px !important; padding-right:28px !important; }
  :root:root p, :root:root li, :root:root dd { line-height:1.65 !important; }
  :root:root p { margin-bottom:18px !important; }
  :root:root li { margin-bottom:8px !important; }
  :root:root h1, :root:root h2, :root:root h3, :root:root h4 {
    line-height:1.25 !important;
    margin-top:32px !important;
    margin-bottom:16px !important;
  }
  @media (max-width:640px){
    :root:root body { padding-left:18px !important; padding-right:18px !important; }
  }

  :root:root input, :root:root textarea, :root:root select {
    background:var(--hlt-surface) !important;
    color:var(--hlt-text) !important;
    border-color:var(--hlt-border) !important;
  }
</style>
`;

// The storefront's own /leaderboard page renders this title and intro above the
// frame, so the theme's matching section is a duplicate. Matched on its copy
// rather than its section id — that id carries a random suffix Shopify
// regenerates whenever the theme is edited.
const LEADERBOARD_TRIM = /* html */ `
<script>
(function () {
  function trim() {
    var sections = document.querySelectorAll(".shopify-section");
    for (var i = 0; i < sections.length; i++) {
      var text = sections[i].innerText || "";
      if (text.indexOf("Join the HLT Leaderboard and compete") !== -1 &&
          text.indexOf("TOTAL ATHLETES") === -1) {
        sections[i].remove();
        return true;
      }
    }
    return false;
  }
  if (!trim()) {
    var tries = 0;
    var t = setInterval(function () { if (trim() || ++tries > 20) clearInterval(t); }, 300);
  }
})();
</script>
`;
