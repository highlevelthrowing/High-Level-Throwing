/**
 * Klaviyo onsite tracking.
 *
 * Shopify's own integration still gives Klaviyo "Started Checkout" and
 * "Placed Order", because checkout happens on Shopify. What it cannot see is
 * anything that happens on this storefront — this site adds to cart through
 * the Storefront API, which never touches the /cart/add.js endpoint Klaviyo's
 * Shopify integration listens to. These helpers report those events directly.
 */

type Learnq = { push: (args: unknown[]) => void };

function learnq(): Learnq | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { _learnq?: unknown[] };
  w._learnq = w._learnq || [];
  return w._learnq as unknown as Learnq;
}

/** Attach an email to the current browser's Klaviyo profile. */
export function identify(email: string, extra?: Record<string, unknown>) {
  const trimmed = email.trim();
  if (!trimmed) return;
  learnq()?.push(["identify", { $email: trimmed, ...extra }]);
}

export type TrackedItem = {
  title: string;
  handle: string;
  price: number;
  currency: string;
  quantity: number;
  image?: string | null;
  variantTitle?: string | null;
};

/**
 * Klaviyo's cart-abandonment flows trigger on "Added to Cart". It can only
 * email someone it can name, so pass the email through when a form on the page
 * has already collected one.
 */
export function trackAddedToCart(item: TrackedItem, email?: string) {
  const q = learnq();
  if (!q) return;

  if (email) identify(email);

  const url =
    typeof window !== "undefined" ? `${window.location.origin}/products/${item.handle}` : undefined;

  q.push([
    "track",
    "Added to Cart",
    {
      $value: item.price * item.quantity,
      AddedItemProductName: item.title,
      AddedItemProductID: item.handle,
      AddedItemSKU: item.variantTitle ?? item.title,
      AddedItemImageURL: item.image ?? undefined,
      AddedItemURL: url,
      AddedItemPrice: item.price,
      AddedItemQuantity: item.quantity,
      Currency: item.currency,
    },
  ]);
}

/** Browse-abandonment flows trigger on "Viewed Product". */
export function trackViewedProduct(item: Omit<TrackedItem, "quantity">) {
  const q = learnq();
  if (!q) return;

  const url =
    typeof window !== "undefined" ? `${window.location.origin}/products/${item.handle}` : undefined;

  const payload = {
    ProductName: item.title,
    ProductID: item.handle,
    ImageURL: item.image ?? undefined,
    URL: url,
    Price: item.price,
    Currency: item.currency,
  };

  q.push(["track", "Viewed Product", payload]);
  q.push(["trackViewedItem", { Title: item.title, ItemId: item.handle, ImageUrl: item.image ?? undefined, Url: url, Metadata: { Price: item.price } }]);
}
