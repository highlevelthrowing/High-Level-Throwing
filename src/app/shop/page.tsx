import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getProducts, SHOP_EQUIPMENT_QUERY } from "@/lib/shopify/products";
import { formatPrice } from "@/lib/format";
import ShopifySetupNotice from "@/components/ShopifySetupNotice";
import QuickAddButton from "@/components/QuickAddButton";

export const metadata: Metadata = {
  title: "Shop",
};

// Shopify returns these by best-seller, which buried the baseball plyo set at
// the bottom of the grid. These handles lead, in this order; everything else
// keeps Shopify's ordering behind them.
const PINNED_HANDLES = ["lightning-ball-plyo-set", "lightning-ball-plyo-set-baseball"];

export default async function ShopPage() {
  if (!isShopifyConfigured()) {
    return <ShopifySetupNotice />;
  }

  const fetched = await getProducts(24, SHOP_EQUIPMENT_QUERY);

  const pinned = PINNED_HANDLES.map((handle) =>
    fetched.find((product) => product.handle === handle)
  ).filter((product): product is NonNullable<typeof product> => Boolean(product));

  const products = [
    ...pinned,
    ...fetched.filter((product) => !PINNED_HANDLES.includes(product.handle)),
  ];

  return (
    <section>
      <div className="section-head">
        <div className="section-tag">Gear &amp; Training Tools</div>
        <h1>Shop High Level Throwing</h1>
        <p>Lightning Ball Plyo Sets, bundles, bands, and more.</p>
      </div>

      {products.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--muted)" }}>No products found yet — add products in Shopify Admin.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <Link href={`/products/${product.handle}`} className="product-card" key={product.id}>
              <div className="thumb">
                {product.featuredImage && (
                  <Image
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText ?? product.title}
                    width={400}
                    height={400}
                    unoptimized
                  />
                )}
              </div>
              <div className="body">
                <h3>{product.title}</h3>
                <div className="price">
                  {formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}
                </div>
                {product.variants[0] && (
                  <QuickAddButton
                    variantId={product.variants[0].id}
                    availableForSale={product.variants[0].availableForSale}
                  />
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
