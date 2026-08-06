import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getCollectionProducts } from "@/lib/shopify/products";
import { formatPrice } from "@/lib/format";
import ShopifySetupNotice from "@/components/ShopifySetupNotice";

export const metadata: Metadata = {
  title: "Books",
};

export default async function BooksPage() {
  if (!isShopifyConfigured()) {
    return <ShopifySetupNotice />;
  }

  const books = await getCollectionProducts("training-book");

  return (
    <section>
      <div className="section-head">
        <div className="section-tag">Training Books</div>
        <h2>Learn the System</h2>
        <p>The High Level Throwing method, written down — synced live from our Shopify store.</p>
      </div>

      {books.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--muted)" }}>No books found yet — add products to the &quot;training-book&quot; collection in Shopify Admin.</p>
      ) : (
        <div className="product-grid">
          {books.map((book) => (
            <Link href={`/products/${book.handle}`} className="product-card" key={book.id}>
              <div className="thumb">
                {book.featuredImage && (
                  <Image
                    src={book.featuredImage.url}
                    alt={book.featuredImage.altText ?? book.title}
                    width={400}
                    height={400}
                    unoptimized
                  />
                )}
              </div>
              <div className="body">
                <h3>{book.title}</h3>
                <div className="price">
                  {formatPrice(book.priceRange.minVariantPrice.amount, book.priceRange.minVariantPrice.currencyCode)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
