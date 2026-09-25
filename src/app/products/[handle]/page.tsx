import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getProductByHandle } from "@/lib/shopify/products";
import { formatPrice } from "@/lib/format";
import { SITE_URL, metaDescription } from "@/lib/site";
import ShopifySetupNotice from "@/components/ShopifySetupNotice";
import AddToCart from "@/components/AddToCart";
import ProductGallery from "@/components/ProductGallery";
import TrackProductView from "@/components/TrackProductView";
import JsonLd from "@/components/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  if (!isShopifyConfigured()) return { title: "Shop" };
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return { title: "Product" };

  const description = metaDescription(product.description || product.descriptionHtml);
  const image = product.featuredImage?.url;
  const url = `${SITE_URL}/products/${encodeURIComponent(product.handle)}`;

  return {
    title: product.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: product.title,
      description,
      images: image ? [{ url: image, alt: product.featuredImage?.altText ?? product.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: image ? [image] : undefined,
    },
  };
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

  const inStock = product.variants.some((v) => v.availableForSale);
  const productUrl = `${SITE_URL}/products/${encodeURIComponent(product.handle)}`;

  return (
    <section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: metaDescription(product.description || product.descriptionHtml),
          image: (product.images.length > 0
            ? product.images
            : [product.featuredImage].filter(Boolean)
          ).map((img) => img!.url),
          brand: { "@type": "Brand", name: "High Level Throwing®" },
          url: productUrl,
          offers: {
            "@type": "Offer",
            url: productUrl,
            price: product.priceRange.minVariantPrice.amount,
            priceCurrency: product.priceRange.minVariantPrice.currencyCode,
            availability: inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: "High Level Throwing®" },
          },
        }}
      />
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
            // Spot counts and the 18-per-session cap are clinic language; they
            // make no sense on a book or a set of plyo balls.
            isClinicSession={/^hlt-clinic/i.test(product.handle)}
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
