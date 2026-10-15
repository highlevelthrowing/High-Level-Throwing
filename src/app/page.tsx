import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TrustedByLogos from "@/components/TrustedByLogos";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_DESCRIPTION } from "@/lib/site";
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
    image: "https://cdn.shopify.com/s/files/1/0771/2948/2547/files/ScreenShot2024-04-08at6.59.25PM_0fb03d93-5a06-4290-804e-76f291b0037c.png?v=1713496613&width=900",
    imageAlt: "Softball player seen side-on mid-throw, the angle an assessment is filmed from",
    imagePosition: "50% 18%",
    accent: "pink" as const,
  },
  {
    tag: "CLINICS & WORKSHOPS",
    title: "Bring High Level Throwing® On-Site",
    body: "Foundational and Advanced in-person clinics delivered directly to your Rec League, Travel Organization, or Training Facility.",
    cta: "Schedule a Clinic",
    href: "/clinics",
    icon: "https://cdn.shopify.com/s/files/1/0771/2948/2547/files/bbal2.png?v=1695024500",
    image: "/images/clinic-top-performers-camp.jpg",
    imageAlt: "Austin Wasserman demonstrating a throw to a group of athletes at a Top Performers camp",
    accent: "lime" as const,
  },
  {
    tag: "EQUIPMENT",
    title: "Shop Lightning Ball Plyos",
    body: "A Lightning Ball Plyo Set paired with a digital training guide, so every athlete has the tool and the instructions to train correctly, year-round.",
    cta: "Shop Equipment",
    href: "/shop",
    icon: "https://cdn.shopify.com/s/files/1/0771/2948/2547/files/butx1.png?v=1693164677",
    image: "/images/equipment-fau-team-plyos.jpg",
    imageAlt: "The FAU Softball roster holding up their Lightning Ball plyos with Austin Wasserman",
    accent: "sky" as const,
  },
];

// The three offerings a program can plug in, laid out as tiers so a coach can
// compare them side by side. Clinic pricing is quoted per program, so it stays
// off the card the way it does on the clinics page.
type TierIconKind = "chart" | "calendar" | "ball";

/** Same 24-unit box, 2px round stroke and accent colour as the icon on the
 *  offering cards above, so the two rows read as one family. */
function TierIcon({ kind, accent }: { kind: TierIconKind; accent: string }) {
  const paths: Record<TierIconKind, React.ReactNode> = {
    chart: (
      <>
        <path d="M3 3v16a2 2 0 0 0 2 2h16" />
        <polyline points="7 15 11 10 15 13 20 7" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </>
    ),
    ball: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M13 6.8 9.3 12.6h2.6L11 17.2l3.7-5.8h-2.6z" />
      </>
    ),
  };
  return (
    <svg
      className="tier-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ color: `var(--${accent})` }}
    >
      {paths[kind]}
    </svg>
  );
}

const INTEGRATION = [
  {
    name: "Video Assessments",
    icon: "chart" as const,
    cta: "Start an Assessment",
    href: "/video-assessment",
    forLabel: "Built for",
    forWho: "Individual athletes ages 9+, teams and full rosters",
    accent: "pink" as const,
    features: [
      "Individual HLT Report on every athlete",
      "High Level Throwing® Score",
      "Full mechanics breakdown in 24–48 hours",
      "12-Week Digital Throwing Program",
      "Throwing drills & progressions",
      "Weekly arm care & patterning work",
      "NTangible Clutch Factor Assessment included",
      "Team pricing available",
    ],
  },
  {
    name: "Clinics",
    icon: "calendar" as const,
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
    icon: "ball" as const,
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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "High Level Throwing®",
          url: SITE_URL,
          logo: `${SITE_URL}/icon.png`,
          description: SITE_DESCRIPTION,
          email: "austin@highlevelthrowing.com",
          sameAs: [
            "https://www.facebook.com/HighLevelThrowing",
            "https://www.instagram.com/highlevelthrowinghlt",
            "https://twitter.com/Wass_Strength",
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "High Level Throwing®",
          url: SITE_URL,
        }}
      />
      <section className="hero section-photo section-photo--banner">
        <div className="eyebrow">For Baseball & Softball Athletes, Coaches, Teams, Organizations and Facilities</div>
        <h1 className="hero-title-oneline">
          Welcome to High Level Throwing<em style={{ color: "#fff" }}>®</em>
        </h1>
        <p>Everything you need to build the complete Throwing Athlete.</p>
      </section>

      <section id="services">
        <div className="section-head">
          <div className="section-tag">What We Offer</div>
          <h2>Baseball & Softball Development</h2>
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
                  <Image
                    src={service.icon}
                    alt={`${service.title} icon`}
                    width={40}
                    height={40}
                    className="pillar-icon"
                    unoptimized
                  />
                )
              )}
              <div className={`pillar-num${service.accent === "pink" ? " num-pink" : service.accent === "sky" ? " num-blue" : ""}`}>
                {service.tag}
              </div>
              <h3>{service.title}</h3>
              <p>{service.body}</p>
              {service.image && (
                <div className="pillar-media">
                  <Image
                    src={service.image}
                    alt={service.imageAlt}
                    fill
                    sizes="(max-width: 900px) 100vw, 380px"
                    style={service.imagePosition ? { objectPosition: service.imagePosition } : undefined}
                  />
                </div>
              )}
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
          <h2>Want Full Team, Organization or Facility Integration of High Level Throwing®?</h2>
          <p>Three pieces you can add to your program — choose one, or build all three into your annual fees.</p>
        </div>

        <div className="tier-grid">
          {INTEGRATION.map((box) => (
            <div className={`tier-card tier-card--${box.accent}`} key={box.name}>
              <TierIcon kind={box.icon} accent={box.accent} />
              <h3 className="tier-name">{box.name}</h3>

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
