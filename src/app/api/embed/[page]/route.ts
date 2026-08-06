const EMBED_TARGETS: Record<string, string> = {
  leaderboard: "https://highlevelthrowing.com/pages/leaderboard",
  "velocity-tracker": "https://highlevelthrowing.com/pages/velocity-tracker",
  "video-assessment": "https://highlevelthrowing.com/pages/high-level-throwing-video-breakdown-12-week-throwing-program",
  search: "https://highlevelthrowing.com/search",
  "terms-of-service": "https://highlevelthrowing.com/pages/terms-of-service",
  shipping: "https://highlevelthrowing.com/pages/shipping",
  "privacy-policy": "https://highlevelthrowing.com/pages/privacy-policy",
  "refund-policy": "https://highlevelthrowing.com/pages/refund-policy",
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

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
