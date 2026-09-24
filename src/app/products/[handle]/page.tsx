import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getProductByHandle } from "@/lib/shopify/products";
import { formatPrice } from "@/lib/format";
import ShopifySetupNotice from "@/components/ShopifySetupNotice";
import AddToCart from "@/components/AddToCart";
import ProductGallery from "@/components/ProductGallery";
import TrackProductView from "@/components/TrackProductView";

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

  const galleryMedia =
    product.media.length > 0
      ? product.media
      : (product.images.length > 0 ? product.images : [product.featuredImage])
          .filter((image): image is NonNullable<typeof image> => image !== null)
          .map((image) => ({ type: "IMAGE" as const, image }));

  // Books and programs are delivered as files by Shopify's digital downloads
  // app the moment an order is paid, so say so before checkout rather than
  // leaving buyers wondering what ships.
  const isDigital =
    product.productType === "Books" ||
    product.productType === "Programs" ||
    product.tags.includes("Training Books");

  return (
    <section>
      <TrackProductView
        title={product.title}
        handle={product.handle}
        price={Number(product.priceRange.minVariantPrice.amount)}
        currency={product.priceRange.minVariantPrice.currencyCode}
        image={product.featuredImage?.url ?? null}
      />
      <div className="pdp">
        <ProductGallery media={galleryMedia} title={product.title} />
        <div>
          <h1 className="pdp-title">{product.title}</h1>
          <div className="pdp-price">
            {formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}
          </div>
          {isDigital && (
            <div className="pdp-digital">
              <strong>Instant digital download</strong>
              <span>
                Your download link is emailed the moment your order goes through — nothing ships. Check your spam
                folder if it hasn&apos;t arrived in a few minutes.
              </span>
            </div>
          )}
          {product.descriptionHtml && (
            <div className="pdp-desc" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
          )}
          <AddToCart
            variants={product.variants}
            product={{
              title: product.title,
              handle: product.handle,
              image: product.featuredImage?.url ?? null,
            }}
            collectsAthleteDetails={
              product.productType === "Session" || product.tags.includes("Sessions")
            }
          />
        </div>
      </div>
    </section>
  );
}
