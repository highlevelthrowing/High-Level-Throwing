import { NextRequest, NextResponse } from "next/server";

const SHOPIFY_STORE = "https://high-level-throwing.myshopify.com";

/**
 * Shopify app-proxy paths, chiefly the digital download links under
 * /a/downloads/... that go out in every purchase email.
 *
 * Proxied rather than redirected so a link that says highlevelthrowing.com in a
 * customer's inbox stays on that domain: a hop to the myshopify host reads as
 * phishing, and some mail filters rewrite or flag it.
 *
 * The landing page is the shop theme, which carries the Klaviyo onsite script
 * and fires the 15% OFF pop-up over the Download button. Someone who has
 * already paid for the file should not have to dismiss a discount offer to
 * reach it, so the script comes out on the way through.
 *
 * Everything that is not HTML — above all the 302 the download button answers
 * with, pointing at the signed S3 file — is passed back untouched.
 */
async function proxy(request: NextRequest, path: string[]) {
  const search = request.nextUrl.search;
  const target = `${SHOPIFY_STORE}/a/${path.map(encodeURIComponent).join("/")}${search}`;

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers: {
        // Shopify varies the theme on these, and the download app reads the
        // range header when a client resumes a transfer.
        accept: request.headers.get("accept") ?? "*/*",
        "accept-language": request.headers.get("accept-language") ?? "en-US,en;q=0.9",
        "user-agent": request.headers.get("user-agent") ?? "Mozilla/5.0",
        ...(request.headers.get("range") ? { range: request.headers.get("range") as string } : {}),
      },
      // The download button answers with a redirect to the signed file. Follow
      // it here and we would stream the whole PDF through this function; hand
      // it back and the browser goes straight to S3.
      redirect: "manual",
    });
  } catch {
    return new NextResponse("Download service unavailable.", { status: 502 });
  }

  const headers = new Headers();
  for (const key of ["content-type", "location", "content-disposition", "content-range", "accept-ranges"]) {
    const value = upstream.headers.get(key);
    if (value) headers.set(key, value);
  }
  headers.set("cache-control", "no-store, must-revalidate");

  const type = upstream.headers.get("content-type") ?? "";
  if (!type.includes("text/html")) {
    return new NextResponse(upstream.body, { status: upstream.status, headers });
  }

  let html = await upstream.text();
  html = html.replace(/<script[^>]*static\.klaviyo\.com[^>]*>\s*<\/script>/gi, "");
  return new NextResponse(html, { status: upstream.status, headers });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function HEAD(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxy(request, path);
}
