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
  const targetUrl = resolveTarget((path ?? []).map((s) => decodeURIComponent(s)));

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

  html = html.replace(/<\/head>/i, `${EMBED_THEME}</head>`);
  html = html.replace(/<\/body>/i, `${EMBED_RUNTIME}</body>`);

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

  function tick() { fixLinks(); reportHeight(); }

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

// Injected last in <head> so it wins over the Shopify theme's own stylesheet.
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
    --hlt-muted:rgba(255,255,255,0.72);
    --hlt-lime:#c6ff2e;
    --hlt-navy:#000000;
  }

  html, body { background:var(--hlt-bg) !important; color:var(--hlt-text) !important; }

  /* Dawn paints most surfaces through these custom properties. */
  body, .color-background-1, .color-background-2,
  .color-inverse, .color-accent-1, .color-accent-2, .color-scheme-1,
  .shopify-section, .page-width, main, .rte, .section {
    --color-background:0,0,0;
    --color-foreground:255,255,255;
    --color-base-background-1:0,0,0;
    --color-base-background-2:17,17,17;
    --color-base-text:255,255,255;
    --color-base-solid-button-labels:0,0,0;
    --color-base-accent-1:198,255,46;
    --color-base-accent-2:198,255,46;
    background-color:transparent !important;
    color:var(--hlt-text) !important;
  }

  h1,h2,h3,h4,h5,h6 { color:var(--hlt-text) !important; }
  p, li, span, td, th, dd, dt, label, .rte, .rte * { color:var(--hlt-muted) !important; }
  strong, b { color:var(--hlt-text) !important; }
  a { color:var(--hlt-lime) !important; }

  /* Cards, wells and anything the theme gave a light panel to. */
  .card, .card__content, .card__inner, .card-wrapper, .collapsible-content,
  .quick-add, .price, .grid__item > .card, .media, .content-container,
  .accordion, .accordion__content, blockquote, table, tr, td, th {
    background-color:transparent !important;
    color:var(--hlt-text) !important;
    border-color:var(--hlt-border) !important;
  }

  hr, .hr, table, td, th { border-color:var(--hlt-border) !important; }

  /* Buttons keep the site's lime call-to-action. */
  .button, button.button, a.button, .shopify-payment-button__button,
  input[type="submit"] {
    background:var(--hlt-lime) !important;
    color:var(--hlt-navy) !important;
    border-color:var(--hlt-lime) !important;
  }
  .button--secondary, .button--tertiary {
    background:transparent !important;
    color:var(--hlt-text) !important;
    border:1px solid var(--hlt-border) !important;
  }

  input, textarea, select {
    background:var(--hlt-surface) !important;
    color:var(--hlt-text) !important;
    border-color:var(--hlt-border) !important;
  }

  /* Photos and artwork are left alone — only flat white boxes get repainted. */
  img, video, svg, iframe, .media img { background-color:transparent !important; }
</style>
`;
