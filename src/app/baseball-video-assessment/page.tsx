import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Baseball Video Assessments",
  description:
    "Send us your throwing video and get an HLT Report, your High Level Throwing® Score and a 12-week baseball throwing program back in 24–48 hours.",
};

const CDN = "https://cdn.shopify.com/s/files/1/0771/2948/2547/files";

// Baseball-only twin of /video-assessment. That page stays as it is — it speaks
// to baseball and softball together and keeps the lime treatment. This one is a
// separate route so it can be pointed at from baseball-specific ads and so a
// softball twin can follow the same pattern later.
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

// The Shopify files library has no baseball athlete spotlight cards yet — every
// spotlight graphic in it is a softball athlete. These are the genuine
// baseball-branded assets that do exist, standing in until real baseball
// athlete cards are made. See the note rendered above the grid.
const SPOTLIGHTS = [
  {
    title: "Baseball Training Bundle",
    caption: "Bands, book and balls — the baseball edition kit",
    image: `${CDN}/HLT.BaseballBundle.jpg?v=1697647479&width=900`,
  },
  {
    title: "Baseball Throwing Warm-Up",
    caption: "The warm-up protocol that opens every program",
    image: `${CDN}/BaseballThrowingWarm-UpCoverebook.png?v=1697644942&width=900`,
  },
  {
    title: "Built For Baseball Players",
    caption: "Lightning Ball plyos for arm care and velocity",
    image: `${CDN}/plyoballsbaseball.png?v=1787160318&width=900`,
  },
];

function Baseball({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#ffffff" />
      <path
        d="M5.2 3.4c2.9 3 2.9 14.2 0 17.2M18.8 3.4c-2.9 3-2.9 14.2 0 17.2"
        fill="none"
        stroke="#e11d48"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3.6 6.6l2.2.9M3.1 9.3l2.4.5M3.1 14.7l2.4-.5M3.6 17.4l2.2-.9M20.4 6.6l-2.2.9M20.9 9.3l-2.4.5M20.9 14.7l-2.4-.5M20.4 17.4l-2.2-.9"
        stroke="#e11d48"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function BaseballVideoAssessmentPage() {
  return (
    <div className="accent-baseball">
      <section className="hero">
        <div className="bb-field">
          <Baseball size={92} style={{ top: "12%", left: "6%", opacity: 0.14 }} />
          <Baseball size={54} style={{ top: "62%", left: "14%", opacity: 0.1 }} />
          <Baseball size={120} style={{ top: "18%", right: "5%", opacity: 0.12 }} />
          <Baseball size={44} style={{ top: "72%", right: "16%", opacity: 0.1 }} />
        </div>
        <div className="eyebrow">For Baseball Athletes Ages 9+</div>
        <h1>
          Baseball <em>Video Assessments</em> + 12-Week Throwing Program
        </h1>
        <p>
          The HLT Team assesses your throw and sends back a detailed report on your mechanics within 24&ndash;48
          hours, along with a 12-week digital throwing program built for baseball players.
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

      <div className="bb-seam" />

      <section id="whats-included">
        <div className="split">
          <div className="col-text">
            <div className="section-tag">What You Get</div>
            <h2>How Efficient Are Your Mechanics?</h2>
            <p>Every baseball athlete receives the following:</p>
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
              src={`${CDN}/plyoballsbaseball.png?v=1787160318&width=900`}
              alt="High Level Throwing Lightning Ball plyos built for baseball players"
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
              src={`${CDN}/hlt-app-assessment-scores.png?v=1789056310&width=900`}
              alt="Example High Level Throwing assessment scores and video breakdown"
              width={900}
              height={675}
            />
            <Image
              className="media-photo"
              src={`${CDN}/HLT_-_New_20232024-11_copy.png?v=1743603246&width=900`}
              alt="High Level Throwing Score breakdown"
              width={900}
              height={675}
              style={{ marginBottom: 0 }}
            />
          </div>
          <div className="col-text">
            <div className="section-tag">Your HLT Score</div>
            <h2>Get Your HLT Score!</h2>
            <p>
              Baseball athletes receive a High Level Throwing® Score to help determine what movements are efficient
              and what movements need improvement within their throw.
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
        <div className="bb-note">
          Placeholder images — the Shopify library has no baseball athlete spotlight cards yet, only softball ones.
          Drop the real baseball cards in and this grid is finished.
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
              <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: "8px 0 0" }}>{s.caption}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-final">
        <h2>Ready to See Your Score?</h2>
        <p>
          Send us your video and get your HLT Report plus a 12-week baseball throwing program back within
          24&ndash;48 hours.
        </p>
        <Link className="btn btn-primary" href={PRODUCT_HREF}>
          Start Assessment — $150
        </Link>
      </section>
    </div>
  );
}
