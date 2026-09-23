const EMBED_TARGETS: Record<string, string> = {
  leaderboard: "https://high-level-throwing.myshopify.com/pages/leaderboard",
  "velocity-tracker": "https://high-level-throwing.myshopify.com/pages/velocity-tracker",
  "video-assessment": "https://high-level-throwing.myshopify.com/pages/high-level-throwing-video-breakdown-12-week-throwing-program",
  search: "https://high-level-throwing.myshopify.com/search",
  "terms-of-service": "https://high-level-throwing.myshopify.com/pages/terms-of-service",
  shipping: "https://high-level-throwing.myshopify.com/pages/shipping",
  "privacy-policy": "https://high-level-throwing.myshopify.com/pages/privacy-policy",
  "refund-policy": "https://high-level-throwing.myshopify.com/pages/refund-policy",
};

export async function GET(_request: Request, { params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const targetUrl = EMBED_TARGETS[page];

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

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
