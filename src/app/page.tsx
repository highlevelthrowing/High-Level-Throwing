import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TrustedByLogos from "@/components/TrustedByLogos";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getProductByHandle } from "@/lib/shopify/products";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/shopify/types";

const FEATURED_BUNDLE_HANDLES = [
  "lightning-ball-plyo-set-team-bundle-6-sets",
  "lightning-ball-plyo-set-team-bundle-12-sets",
  "hlt-softball-bundle",
  "highlevel-throwing-bundle",
];

export const metadata: Metadata = {
  title: "High Level Throwing®",
};

const SERVICES = [
  {
    tag: "ATHLETE VIDEO ASSESSMENTS",
    title: "Get Your HLT Score",
    body: "Submit a throwing video and get a High Level Throwing® Score, a Throwing Report, and a full mechanics breakdown. Build it into your program so coaches and athletes can monitor and track programming, gains, and arm health.",
    cta: "Start Video Assessment",
    href: "/video-assessment",
    icon: "trending-up" as const,
    accent: "pink" as const,
  },
  {
    tag: "CLINICS & WORKSHOPS",
    title: "Bring High Level Throwing® On-Site",
    body: "Foundational and Advanced in-person clinics delivered directly to your Rec League, Travel Organization, or Training Facility.",
    cta: "Schedule a Clinic",
    href: "/clinics",
    icon: "https://cdn.shopify.com/s/files/1/0771/2948/2547/files/bbal2.png?v=1695024500",
    accent: "lime" as const,
  },
  {
    tag: "EQUIPMENT",
    title: "Shop Lightning Ball Plyos",
    body: "A Lightning Ball Plyo Set paired with a digital training guide, so every athlete has the tool and the instructions to train correctly, year-round.",
    cta: "Shop Equipment",
    href: "/shop",
    icon: "https://cdn.shopify.com/s/files/1/0771/2948/2547/files/butx1.png?v=1693164677",
    accent: "sky" as const,
  },
];

// The three offerings a program can plug in, laid out as tiers so a coach can
// compare them side by side. Clinic pricing is quoted per program, so it stays
// off the card the way it does on the clinics page.
const INTEGRATION = [
  {
    name: "Video Assessments",
    price: <>From <span className="price-blur">$150</span></>,
    priceNote: <><span className="price-blur">$75</span> for each additional assessment</>,
    cta: "Start an Assessment",
    href: "/video-assessment",
    forLabel: "Built for",
    forWho: "Individual athletes ages 7+, teams and full rosters",
    accent: "pink" as const,
    features: [
      "Individual HLT Report on every athlete",
      "High Level Throwing® Score",
      "Full mechanics breakdown in 24–48 hours",
      "12-Week Digital Throwing Program",
      "Throwing drills & progressions",
      "Weekly arm care & patterning work",
      "Team pricing available",
    ],
  },
  {
    name: "Clinics",
    price: <>Individual &amp; Team Rates</>,
    priceNote: <><span className="price-blur">20%</span> revenue share back to the host</>,
    cta: "Book a Clinic",
    href: "/clinics",
    forLabel: "Built for",
    forWho: "Rec leagues, travel organizations, facilities and colleges",
    accent: "lime" as const,
    features: [
      "Foundational sessions — arm care & fundamentals",
      "Advanced sessions — mechanics & position work",
      "Delivered on-site at your facility",
      "Baseball and softball, all ages",
      "Athletes 13+ eligible for the HLT Leaderboard",
      "NTangible Clutch Factor Assessment included",
      "Digital training guide emailed to every athlete",
    ],
  },
  {
    name: "Lightning Ball Plyos",
    price: <>From <span className="price-blur">$75</span></>,
    priceNote: <>Sets, bands and full bundles</>,
    cta: "Shop Equipment",
    href: "/shop",
    forLabel: "Built for",
    forWho: "Athletes and coaches training year-round",
    accent: "sky" as const,
    features: [
      "Lightning Ball Plyo Set, baseball or softball",
      "Digital training guide with every set",
      "HLT Lightning Bands in four colors",
      "Player/Coach bundles that pair balls and bands",
      "Drills and progressions mapped to the books",
      "Ships anywhere in the US",
    ],
  },
];

export default async function Home() {
  const shopifyReady = isShopifyConfigured();
  const bundles = shopifyReady
    ? (
        await Promise.all(FEATURED_BUNDLE_HANDLES.map((handle) => getProductByHandle(handle).catch(() => null)))
      ).filter((product): product is Product => product !== null)
    : [];

  return (
    <div className="home">
      <div className="home-bg" aria-hidden="true" />
      <div className="home-bg-veil" aria-hidden="true" />

      <section className="hero">
        <div className="eyebrow">For Baseball & Softball Athletes, Coaches, Teams, Organizations and Facilities</div>
        <h1 className="hero-title-oneline">
          Welcome to High Level Throwing<em style={{ color: "#fff" }}>®</em>
        </h1>
        <p>Everything you need to build the complete Baseball &amp; Softball Throwing Athlete.</p>
      </section>

      <section id="services">
        <div className="section-head">
          <div className="section-tag">What We Offer</div>
          <h2>Baseball & Softball Development</h2>
          <p>Pick a starting point — every offering is built to plug into your team, roster, or training routine.</p>
        </div>
        <div className="grid grid-3">
          {SERVICES.map((service) => (
            <div className={`pillar-card pillar-card--${service.accent}`} key={service.title}>
              {service.icon === "trending-up" ? (
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="pillar-icon"
                  style={{ color: `var(--${service.accent})` }}
                >
                  <polyline points="3 17 9 11 13 15 21 7" />
                  <polyline points="14 7 21 7 21 14" />
                </svg>
              ) : (
                service.icon && (
                  <Image src={service.icon} alt="" width={40} height={40} className="pillar-icon" unoptimized />
                )
              )}
              <div className={`pillar-num${service.accent === "pink" ? " num-pink" : service.accent === "sky" ? " num-blue" : ""}`}>
                {service.tag}
              </div>
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
          <p>Baseball &amp; Softball Bundles with video drills and tutorials.</p>
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

      <section id="integration" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="section-head">
          <div className="section-tag">Full Integration</div>
          <h2>Want Full Integration of High Level Throwing®?</h2>
          <p>Three pieces you can add to your program — choose one, or build all three into your annual fees.</p>
        </div>

        <div className="tier-grid">
          {INTEGRATION.map((box) => (
            <div className={`tier-card tier-card--${box.accent}`} key={box.name}>
              <h3 className="tier-name">{box.name}</h3>
              <div className="tier-price">{box.price}</div>
              <div className="tier-price-note">{box.priceNote}</div>

              <Link className="btn btn-primary tier-cta" href={box.href}>
                {box.cta}
              </Link>

              <div className="tier-meta">
                <span className="tier-meta-label">{box.forLabel}</span>
                <strong>{box.forWho}</strong>
              </div>

              <ul className="tier-features">
                {box.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link className="btn btn-outline" href="/contact">
            Schedule A Call
          </Link>
        </div>
      </section>

      <TrustedByLogos />
    </div>
  );
}
