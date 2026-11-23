/**
 * Ask Shopify's CDN for an image at the size it will actually be displayed.
 *
 * Product images come back from the Storefront API at their upload resolution,
 * and the cards render them with `unoptimized`, so a 1.3MB screenshot was being
 * downloaded in full to fill a 400px box. The home page alone pulled 5.9MB of
 * images that way, over 4MB of it four product thumbnails.
 *
 * Shopify resizes on its own CDN for free with a `width` parameter, which is
 * what the Trusted By logos already do. Non-Shopify URLs are returned
 * untouched, and an existing width is left alone so a deliberate choice wins.
 */
export function cdnImage(url: string, width: number): string {
  if (!url) return url;
  if (!/(^https?:)?\/\/cdn\.shopify\.com\//.test(url) && !url.includes(".myshopify.com/")) return url;
  if (/[?&]width=/.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}width=${width}`;
}
