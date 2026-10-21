import { NextResponse, type NextRequest } from "next/server";
import { repairPath } from "@/lib/repair-path";

/**
 * Next decodes dynamic route params before any handler runs, so a path
 * carrying a percent-escape that is not valid UTF-8 throws inside routing and
 * the visitor is served a 500. Production hit this on
 * `/products/high-level-pitching%AE-youth` — ® is `%C2%AE`, and something
 * upstream drops the lead byte, leaving a `%AE` that cannot be decoded at all.
 * `redirects()` in next.config cannot help: it matches the decoded path, which
 * is the step that throws.
 *
 * Proxy sees the pathname before that decode, which is the only place early
 * enough to intervene. (This is Next 16's replacement for the deprecated
 * `middleware` file convention — same position in the request, new name.)
 *
 * This runs on every request, so it does nothing at all unless the path fails
 * to decode, and the whole body is guarded: if anything in here throws, the
 * request continues untouched rather than taking the site down.
 */
export function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const repaired = repairPath(pathname);

    if (repaired) {
      const url = request.nextUrl.clone();
      url.pathname = repaired;
      // Permanent: these addresses are wrong rather than moved, but they are
      // being crawled, and a 308 stops the bad spelling being re-requested.
      return NextResponse.redirect(url, 308);
    }

    // Undecodable and unrepairable. A 400 is the honest answer for a malformed
    // address, and it keeps the route from throwing a 500 further down.
    if (repaired === null && !pathDecodesSafely(pathname)) {
      return new NextResponse("Bad request URL.", { status: 400 });
    }
  } catch {
    // Never let this layer be the reason a request fails.
  }

  return NextResponse.next();
}

function pathDecodesSafely(pathname: string): boolean {
  try {
    decodeURIComponent(pathname);
    return true;
  } catch {
    return false;
  }
}

export const config = {
  // Everything except Next's own static output and files served from /public,
  // which never carry a dynamic param to decode.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt|xml|webmanifest)$).*)"],
};
