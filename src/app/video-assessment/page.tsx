import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Athlete Video Assessments",
};

const CDN = "https://cdn.shopify.com/s/files/1/0771/2948/2547/files";

// The Shopify page this replaced was built from theme sections, so its content
// is not available through the Storefront API — it only existed in the rendered
// theme HTML. Embedding that HTML meant iframing the store, which Shopify blocks
// with X-Frame-Options, so the content lives here natively instead.
const PRODUCT_HREF = "/products/high-level-throwing%C2%AE-video-assessment-throwing-program";

const INCLUDES = [
  "Athlete Individual HLT Report",
  "High Level Throwing® Score",
  "Throwing Drills & Progressions",
  "Weekly Arm Care & Patterning Exercises",
  "Strength & Movement Training",
  "12-Week Throwing Program",
  "Recovery Stretches & Soft Tissue Work",
];

const SPOTLIGHTS = [
  {
    title: "+15 MPH in 8 Months",
    image: `${CDN}/HLT_-_New_20232024-10_3fcb54df-a7be-448c-a092-11a994516e7d.png?v=1743604902&width=900`,
  },
  {
    title: "+9 MPH in 3 Months",
    image: `${CDN}/486776650_1162119352372290_2701151229715749540_n.jpg?v=1743605194&width=900`,
  },
  {
    title: "+17 MPH in 2 Years",
    image: `${CDN}/487202088_1161713435746215_8505011286284990966_n.jpg?v=1743605212&width=900`,
  },
];

export default function VideoAssessmentPage() {
  return (
    <>
      <section className="hero">
        <div className="eyebrow">For Baseball &amp; Softball Athletes Ages 9+</div>
        <h1>
          Athlete <em style={{ color: "var(--lime)" }}>Video Assessments</em> + 12-Week Throwing Program
        </h1>
        <p>
          The HLT Team assesses your throw and sends back a detailed report on your mechanics within 24&ndash;48
          hours, along with a 12-week digital throwing program!
        </p>
        <div className="hero-ctas">
          <Link className="btn btn-primary" href={PRODUCT_HREF}>
            Start Assessment — $150
          </Link>
          <Link className="btn btn-outline" href="/contact">
            Ask About Team Pricing
          </Link>
        </div>
      </section>

      <section id="whats-included">
        <div className="split">
          <div className="col-text">
            <div className="section-tag">What You Get</div>
            <h2>How Efficient Are Your Mechanics?</h2>
            <p>Every athlete receives the following:</p>
            <ul className="feature-list">
              {INCLUDES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p style={{ fontSize: "0.88rem" }}>
              *Athletes should measure their starting velocity using a{" "}
              <Link href="/products/coach-package" style={{ color: "var(--lime)", fontWeight: 700 }}>
                Pocket Radar device
              </Link>{" "}
              before the program begins, then again at the end of the 12-week program to see real improvements.
            </p>
          </div>
          <div className="col-media">
            <div className="badge">Start Assessment</div>
            <Image
              className="media-photo"
              src={`${CDN}/scaled_768-1.jpg?v=1738174896&width=900`}
              alt="High Level Throwing video assessment"
              width={900}
              height={675}
            />
            <div className="big-price">
              $150
              <small>1 x Video Assessment · $75 for each additional</small>
            </div>
            <div className="divider" />
            <p style={{ color: "var(--muted)", fontSize: "0.92rem", marginBottom: 22 }}>
              Get your assessment back in 24&ndash;48 hours and work to have the strongest arm on the field.
            </p>
            <Link className="btn btn-primary" href={PRODUCT_HREF}>
              Add to Cart — $150
            </Link>
            <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 16, marginBottom: 0 }}>
              *Team pricing available — <Link href="/contact" style={{ color: "var(--lime)", fontWeight: 700 }}>email for pricing</Link>
            </p>
          </div>
        </div>
      </section>

      <section id="hlt-score">
        <div className="split reverse">
          <div className="col-media">
            <Image
              className="media-photo"
              src={`${CDN}/ScreenShot2024-04-08at6.59.25PM_0fb03d93-5a06-4290-804e-76f291b0037c.png?v=1713496613&width=900`}
              alt="Example High Level Throwing Score report"
              width={900}
              height={675}
            />
            <Image
              className="media-photo"
              src={`${CDN}/HLT_-_New_20232024-11_copy.png?v=1743603246&width=900`}
              alt="High Level Throwing assessment breakdown"
              width={900}
              height={675}
              style={{ marginBottom: 0 }}
            />
          </div>
          <div className="col-text">
            <div className="section-tag">Your HLT Score</div>
            <h2>Get Your HLT Score!</h2>
            <p>
              Athletes receive a High Level Throwing® Score to help determine what movements are efficient and what
              movements need improvement within their throw.
            </p>
            <p>
              Based on the patterns the athlete presents in their throwing video, we provide video drills and
              programming to help improve their overhand throwing mechanics and velocity.
            </p>
            <p>
              In our findings, the higher the score, the more efficient the athlete is at maximizing their movements
              throughout the throwing motion.
            </p>
            <p>
              The lower the score, the less efficient the athlete is — this athlete also tends to present low
              velocity, inaccuracy, or pain and discomfort during or after the throw.
            </p>
          </div>
        </div>
      </section>

      <section id="spotlights">
        <div className="section-head">
          <div className="section-tag">Athlete Spotlights</div>
          <h2>Real Velocity Gains</h2>
          <p>A few of the athletes who have worked through an HLT assessment and program.</p>
        </div>
        <div className="grid grid-3">
          {SPOTLIGHTS.map((s) => (
            <div className="pillar-card" key={s.title} style={{ padding: 20 }}>
              <Image
                className="media-photo"
                src={s.image}
                alt={s.title}
                width={900}
                height={675}
                style={{ marginBottom: 16 }}
              />
              <h3 style={{ fontSize: "1.25rem", fontWeight: 900, margin: 0 }}>{s.title}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-final">
        <h2>Ready to See Your Score?</h2>
        <p>
          Send us your video and get your HLT Report plus a 12-week throwing program back within 24&ndash;48 hours.
        </p>
        <Link className="btn btn-primary" href={PRODUCT_HREF}>
          Start Assessment — $150
        </Link>
      </section>
    </>
  );
}
