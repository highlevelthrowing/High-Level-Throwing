import type { Product } from "@/lib/shopify/types";

const SITE = "https://www.highlevelthrowing.com";

/**
 * Product markup for a listing page, so a search result can carry price and
 * availability rather than just a title.
 *
 * An ItemList of Products rather than one Product: this page is a list, and
 * claiming otherwise is the kind of thing Google penalises. Price comes from
 * the same Shopify data the cards render, so the two cannot disagree.
 *
 * Renders JSON-LD, which browsers parse as data and never execute — it cannot
 * interfere with the analytics and pixels on the page.
 */
export default function ProductListJsonLd({
  products,
  name,
  path,
}: {
  products: Product[];
  name: string;
  path: string;
}) {
  if (!products.length) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: `${SITE}${path}`,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => {
      const amount = p.priceRange?.minVariantPrice?.amount;
      const currency = p.priceRange?.minVariantPrice?.currencyCode ?? "USD";
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: p.title,
          url: `${SITE}/products/${p.handle}`,
          ...(p.featuredImage?.url ? { image: [p.featuredImage.url] } : {}),
          brand: { "@type": "Brand", name: "High Level Throwing®" },
          ...(amount
            ? {
                offers: {
                  "@type": "Offer",
                  price: Number(amount).toFixed(2),
                  priceCurrency: currency,
                  url: `${SITE}/products/${p.handle}`,
                  // Availability lives on the variants, not the product: a
                  // listing is buyable while any one variant still is.
                  availability: (p.variants ?? []).some((v) => v.availableForSale)
                    ? "https://schema.org/InStock"
                    : "https://schema.org/SoldOut",
                },
              }
            : {}),
        },
      };
    }),
  };

  return (
    <script
      type="application/ld+json"
      // Built from this site's own Shopify data; no visitor input reaches it.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
