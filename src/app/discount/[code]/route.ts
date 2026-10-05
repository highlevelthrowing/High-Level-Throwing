import { NextResponse, type NextRequest } from "next/server";
import { applyDiscountCode, createCheckoutWithDiscount } from "@/lib/shopify/cart";
import { getProductByHandle } from "@/lib/shopify/products";
import { SITE_URL } from "@/lib/site";

/**
 * Shopify's own /discount/<code> links land on the myshopify domain, which
 * would drop a visitor onto the old theme mid-journey. This applies the code to
 * their cart here instead and keeps them on this site.
 *
 * With ?add=<product-handle> it also puts that product in the cart and sends
 * them straight to checkout. The free clinic guides were four clicks away —
 * link, product page, cart, checkout — which is three too many for something
 * that costs nothing.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code: raw } = await params;
  const code = decodeURIComponent(raw).trim();
  const add = request.nextUrl.searchParams.get("add")?.trim();

  if (add) {
    const product = await getProductByHandle(add).catch(() => null);
    const variant = product?.variants?.[0];

    if (variant) {
      const checkoutUrl = await createCheckoutWithDiscount(variant.id, code).catch(() => null);
      if (checkoutUrl) return NextResponse.redirect(checkoutUrl, { status: 302 });
    }

    // Could not resolve the product or build a checkout — fall through to the
    // product page with the code applied rather than showing an error.
    if (code) await applyDiscountCode(code);
    const fallback = new URL(`/products/${encodeURIComponent(add)}`, SITE_URL);
    if (code) fallback.searchParams.set("discount", code);
    return NextResponse.redirect(fallback, { status: 302 });
  }

  if (code) await applyDiscountCode(code);

  // Shopify supports ?redirect=/path on its discount links, so honour the same
  // parameter. Only same-site paths, so the link cannot bounce people offsite.
  const requested = request.nextUrl.searchParams.get("redirect") ?? "/";
  const path = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/";

  const destination = new URL(path, SITE_URL);
  if (code) destination.searchParams.set("discount", code);

  return NextResponse.redirect(destination, { status: 302 });
}
