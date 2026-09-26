import { NextResponse, type NextRequest } from "next/server";
import { applyDiscountCode } from "@/lib/shopify/cart";
import { SITE_URL } from "@/lib/site";

/**
 * Shopify's own /discount/<code> links land on the myshopify domain, which
 * would drop a visitor onto the old theme mid-journey. This applies the code to
 * their cart here instead and keeps them on this site.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code: raw } = await params;
  const code = decodeURIComponent(raw).trim();

  if (code) await applyDiscountCode(code);

  // Shopify supports ?redirect=/path on its discount links, so honour the same
  // parameter. Only same-site paths, so the link cannot bounce people offsite.
  const requested = request.nextUrl.searchParams.get("redirect") ?? "/";
  const path = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/";

  const destination = new URL(path, SITE_URL);
  if (code) destination.searchParams.set("discount", code);

  return NextResponse.redirect(destination, { status: 302 });
}
