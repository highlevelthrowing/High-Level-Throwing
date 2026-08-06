import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getProductByHandle } from "@/lib/shopify/products";
import { formatPrice } from "@/lib/format";
import ShopifySetupNotice from "@/components/ShopifySetupNotice";
import AddToCart from "@/components/AddToCart";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  if (!isShopifyConfigured()) return { title: "Shop" };
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  return { title: product?.title ?? "Product" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  if (!isShopifyConfigured()) {
    return <ShopifySetupNotice />;
  }

  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  return (
    <section>
      <div className="pdp">
        <div className="pdp-gallery">
          {product.featuredImage && (
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText ?? product.title}
              width={800}
              height={800}
              unoptimized
            />
          )}
        </div>
        <div>
          <h1 className="pdp-title">{product.title}</h1>
          <div className="pdp-price">
            {formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}
          </div>
          {product.description && <p className="pdp-desc">{product.description}</p>}
          <AddToCart variants={product.variants} />
        </div>
      </div>
    </section>
  );
}
