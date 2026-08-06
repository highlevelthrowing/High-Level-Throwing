import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getProducts } from "@/lib/shopify/products";
import { formatPrice } from "@/lib/format";
import ShopifySetupNotice from "@/components/ShopifySetupNotice";

export const metadata: Metadata = {
  title: "Shop",
};

export default async function ShopPage() {
  if (!isShopifyConfigured()) {
    return <ShopifySetupNotice />;
  }

  const products = await getProducts();

  return (
    <section>
      <div className="section-head">
        <div className="section-tag">Gear &amp; Training Tools</div>
        <h2>Shop High Level Throwing</h2>
        <p>Lightning Ball Plyo Sets, digital training guides, and more — synced live from our Shopify store.</p>
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
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
