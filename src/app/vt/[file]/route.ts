import { NextResponse } from "next/server";

/**
 * Serves the velocity widget's two static assets from this origin.
 *
 * Loaded straight from highlevelthrowingleaderboard.com they cost 1,272ms on a
 * cold visit, against ~190ms when fetched on their own with the connection
 * already warm. The gap is a second origin: a fresh DNS + TCP + TLS handshake
 * that cannot start until the HTML names the file, and which competes with
 * this app's own bundles. Served from here they ride the connection the page
 * already has, multiplexed over HTTP/2, and sit in Vercel's edge cache.
 *
 * The bytes are passed through untouched so the SRI hashes on the page still
 * validate -- the integrity check runs on the decoded body, so the edge is
 * free to re-compress.
 */

const UPSTREAM = "https://highlevelthrowingleaderboard.com/embed";

/** Only the widget's own files; this must never become an open proxy. */
const ALLOWED: Record<string, string> = {
  "velocity-widget.js": "application/javascript; charset=UTF-8",
  "velocity-widget.css": "text/css; charset=UTF-8",
};

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const contentType = ALLOWED[file];
  if (!contentType) return new NextResponse("Not found", { status: 404 });

  const upstream = await fetch(`${UPSTREAM}/${file}`, {
    // Upstream says max-age=3600; match it at the edge rather than inventing a
    // longer life, so a widget update reaches visitors as quickly as it would
    // have without this route.
    next: { revalidate: 3600 },
  }).catch(() => null);

  if (!upstream || !upstream.ok) {
    return new NextResponse("Upstream unavailable", { status: 502 });
  }

  return new NextResponse(await upstream.arrayBuffer(), {
    headers: {
      "Content-Type": contentType,
      // stale-while-revalidate so an expiring entry is still served instantly
      // while the edge refreshes it behind the request.
      "Cache-Control": "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
