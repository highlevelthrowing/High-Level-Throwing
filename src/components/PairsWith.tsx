import Image from "next/image";
import Link from "next/link";
import { getProductByHandle } from "@/lib/shopify/products";
import { formatPrice } from "@/lib/format";
import QuickAddButton from "@/components/QuickAddButton";

/**
 * The books and warm-ups are where most orders come in — and they are the
 * cheapest things in the shop, so an order that stops there is worth $30. The
 * drills in them are written around the Lightning Balls and Bands, so the
 * equipment is a genuine completion of the purchase rather than an unrelated
 * upsell. Shown on the digital products only; equipment pages already carry
 * their own price.
 */
const PLYO = "lightning-ball-plyo-set";
const BANDS = "hlt-lightning-bands";

/** Which products get the block, and what to offer alongside them. */
function offersFor(handle: string, productType: string, tags: string[]): string[] {
  const isDigital =
    productType === "Books" ||
    productType === "Programs" ||
    tags.some((t) => /training book/i.test(t));

  if (!isDigital) return [];
  // Equipment first: it is the higher-value add and the one the drills need.
  return [PLYO, BANDS];
}

export default async function PairsWith({
  handle,
  productType,
  tags,
}: {
  handle: string;
  productType: string;
  tags: string[];
}) {
  const wanted = offersFor(handle, productType, tags).filter((h) => h !== handle);
  if (wanted.length === 0) return null;

  const products = (await Promise.all(wanted.map((h) => getProductByHandle(h)))).filter(
    (p): p is NonNullable<typeof p> => p !== null && p.variants.length > 0
  );
  if (products.length === 0) return null;

  return (
    <section className="pairs-with" aria-labelledby="pairs-with-heading">
      <h2 id="pairs-with-heading">Add our Flagship Training Tools!</h2>
      <p className="pairs-with-sub">
        The drills in this book are built around our Lightning Ball Plyos and Bands. Add them and
        start the progressions the day your download arrives.
      </p>

      <div className="pairs-with-grid">
        {products.map((p) => (
          <div className="pairs-with-card" key={p.id}>
            <Link href={`/products/${p.handle}`} className="pairs-with-media">
              {p.featuredImage && (
                <Image
                  src={p.featuredImage.url}
                  alt={p.featuredImage.altText ?? p.title}
                  width={320}
                  height={320}
                  unoptimized
                />
              )}
            </Link>
            <div className="pairs-with-body">
              <Link href={`/products/${p.handle}`}>
                <h3>{p.title}</h3>
              </Link>
              <div className="pairs-with-price">
                {formatPrice(
                  p.priceRange.minVariantPrice.amount,
                  p.priceRange.minVariantPrice.currencyCode
                )}
              </div>
              <QuickAddButton
                variantId={p.variants[0].id}
                availableForSale={p.variants[0].availableForSale}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
