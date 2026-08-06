import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TrustedByLogos from "@/components/TrustedByLogos";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getProducts } from "@/lib/shopify/products";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "High Level Throwing®",
};

const SERVICES = [
  {
    tag: "VIDEO ASSESSMENTS",
    title: "Get Your HLT Score",
    body: "Submit a throwing video and get a High Level Throwing® Score, a Throwing Report, and a full mechanics breakdown.",
    cta: "Start Video Assessment",
    href: "/video-assessment",
    icon: "https://cdn.shopify.com/s/files/1/0771/2948/2547/files/butx1.png?v=1693164677",
  },
  {
    tag: "CLINICS & WORKSHOPS",
    title: "Bring High Level Throwing® On-Site",
    body: "Foundational and Advanced in-person clinics delivered directly to your Rec League, Travel Organization, or Training Facility.",
    cta: "Schedule a Clinic",
    href: "/clinics",
    icon: "https://cdn.shopify.com/s/files/1/0771/2948/2547/files/bbal2.png?v=1695024500",
  },
  {
    tag: "EQUIPMENT",
    title: "Shop Lightning Ball Plyos",
    body: "A Lightning Ball Plyo Set paired with a digital training guide, so every athlete has the tool and the instructions to train correctly, year-round.",
    cta: "Shop Equipment",
    href: "/shop",
    icon: "trending-up" as const,
  },
];

export default async function Home() {
  const shopifyReady = isShopifyConfigured();
  const bundles = shopifyReady ? await getProducts(5).catch(() => []) : [];

  return (
    <>
      <section className="hero">
        <div className="eyebrow">For Baseball & Softball Athletes, Coaches, Teams and Organizations</div>
        <h1 className="hero-title-oneline">
          Welcome to High Level Throwing<em style={{ color: "#fff" }}>®</em>
        </h1>
        <p>
          Clinics &amp; Workshops · Video Assessments · Coach Education Course · College Consulting · Training
          Equipment — everything you need to build the complete Baseball &amp; Softball Defensive player.
        </p>
        <div className="hero-ctas">
          <Link className="btn btn-primary" href="/video-assessment">
            Athlete & Coach Training
          </Link>
        </div>
      </section>

      <section id="services">
        <div className="section-head">
          <div className="section-tag">What We Offer</div>
          <h2>Baseball & Softball Development</h2>
          <p>Pick a starting point — every offering is built to plug into your team, roster, or training routine.</p>
        </div>
        <div className="grid grid-3">
          {SERVICES.map((service) => (
            <div className="pillar-card" key={service.title}>
              {service.icon === "trending-up" ? (
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="pillar-icon"
                  style={{ color: "var(--lime)" }}
                >
                  <polyline points="3 17 9 11 13 15 21 7" />
                  <polyline points="14 7 21 7 21 14" />
                </svg>
              ) : (
                service.icon && (
                  <Image src={service.icon} alt="" width={40} height={40} className="pillar-icon" unoptimized />
                )
              )}
              <div className="pillar-num">{service.tag}</div>
              <h3>{service.title}</h3>
              <p>{service.body}</p>
              {service.href.startsWith("/") ? (
                <Link className="card-link" href={service.href}>
                  {service.cta} →
                </Link>
              ) : (
                <a className="card-link" href={service.href} target="_blank" rel="noopener">
                  {service.cta} →
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <section id="bundles">
        <div className="section-head">
          <div className="section-tag">Featured Bundles</div>
          <h2>Shop Training Equipment</h2>
          <p>Baseball and softball bundles, synced live from our Shopify store.</p>
        </div>

        {!shopifyReady && (
          <div className="calc-card" style={{ textAlign: "center", maxWidth: 560 }}>
            <p style={{ color: "var(--muted)" }}>
              Product bundles will appear here once this storefront is connected to Shopify. See the README for
              setup steps.
            </p>
          </div>
        )}

        {shopifyReady && bundles.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--muted)" }}>No products found yet — add products in Shopify Admin.</p>
        )}

        {shopifyReady && bundles.length > 0 && (
          <>
            <div className="product-grid">
              {bundles.map((product) => (
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
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <Link className="card-link" href="/shop">
                Visit Shop →
              </Link>
            </div>
          </>
        )}
      </section>

      <TrustedByLogos />

      <section className="cta-final" style={{ borderBottom: "1px solid var(--border)" }}>
        <h2>Want Full Integration of High Level Throwing®?</h2>
        <div className="hero-ctas">
          <Link className="btn btn-primary" href="/video-assessment">
            Athlete & Coach Training
          </Link>
        </div>
      </section>
    </>
  );
}
