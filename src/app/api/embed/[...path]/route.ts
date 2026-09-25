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

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const segments = (path ?? []).map((s) => decodeURIComponent(s));
  const page = segments.join("/");
  const targetUrl = resolveTarget(segments);

  if (!targetUrl) {
    return new Response("Unknown embed target.", { status: 404 });
  }

  const res = await fetch(targetUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; HLTStorefrontEmbed/1.0)" },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return new Response("Unable to load this page right now.", { status: 502 });
  }

  let html = await res.text();
  html = html.replace(/<head(\s[^>]*)?>/i, (match) => `${match}\n<base href="${targetUrl}">`);

  // Strip the theme's own announcement bar / header and footer sections so the
  // embed only shows the page's actual content — the storefront already renders
  // its own header/footer around the iframe, and stacking both broke scrolling.
  html = html.replace(/<div[^>]*id="shopify-section-[^"]*announcement-bar"[\s\S]*?(?=<main[^>]*id="MainContent")/i, "");
  html = html.replace(/<div[^>]*id="shopify-section-[^"]*__footer"[\s\S]*?(?=<\/body>)/i, "");

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
