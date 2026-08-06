import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import TrustedByLogos from "@/components/TrustedByLogos";
import VideoEmbed from "@/components/VideoEmbed";

export const metadata: Metadata = {
  title: "Clinics & On-Site Sessions",
};

export default function Clinics() {
  return (
    <>
      <section className="hero">
        <div className="eyebrow">For Baseball & Softball Teams, Organizations and Training Facilities</div>
        <h1>
          Bring our Nationally Recognized High Level Throwing® <em style={{ color: "var(--lime)" }}>Clinics</em> to
          your Athletes and Coaches!
        </h1>
        <p>
          Foundational and Advanced in-person clinics delivered directly to your Rec League, Travel Organization, or
          Training Facility.
        </p>
        <div className="hero-ctas">
          <a className="btn btn-primary" href="https://www.highlevelthrowing.com/pages/contact" target="_blank" rel="noopener">
            Schedule a Clinic!
          </a>
          <a className="btn btn-outline" href="#details">
            See How It Fits Your Budget
          </a>
        </div>
      </section>

      <TrustedByLogos />

      <section id="overview">
        <div className="section-head">
          <div className="section-tag">High Level Throwing Clinics</div>
          <h2>On-Site Clinics for Every Program</h2>
          <p>
            Foundational and Advanced clinics for athletes and coaches — priced to live inside registration and
            membership dues, or outside as a separate cost, depending on your organization.
          </p>
        </div>
        <div className="grid" style={{ maxWidth: 420 }}>
          <div className="pillar-card">
            <div className="pillar-num">ON-SITE</div>
            <h3>Clinics</h3>
            <p>
              Foundational and Advanced in-person sessions delivered directly to your Rec League, Travel
              Organization, or Training Facility.
            </p>
            <div className="tag-row">
              <span className="tag price-blur">$160 / player</span>
              <span className="tag price-blur">20% Host Revenue Share</span>
            </div>
            <div
              style={{
                background: "rgba(198,255,46,0.1)",
                border: "1px solid rgba(198,255,46,0.4)",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 18,
              }}
            >
              <p style={{ color: "var(--lime)", fontWeight: 800, fontSize: "0.85rem", margin: 0 }}>
                Minimum of 48 athletes required to host a clinic.
              </p>
            </div>
            <a className="card-link" href="#details">
              See clinic formats →
            </a>
          </div>
        </div>
      </section>

      <section id="details">
        <div className="split">
          <div className="col-text">
            <div className="section-tag">Clinics · On-Site Sessions</div>
            <h2>On-site sessions for your athletes and coaches</h2>
            <p>
              Founder Austin Wasserman and lead instructor Sarah O&apos;Brien bring HLT directly to your facility —
              one visit can reach an entire travel org, rec league, or college roster at once, making it easy to
              build HLT into your program.
            </p>
            <ul className="feature-list">
              <li>Foundational Sessions — arm care and overhand throwing fundamentals</li>
              <li>Advanced Sessions — deeper mechanics and position based training</li>
              <li>Built for Rec Leagues, Travel Orgs & Training Facilities</li>
              <li>Baseball and softball athletes and coaches, all ages</li>
              <li>
                Athletes ages 13+ are eligible to join the{" "}
                <Link href="/leaderboard" style={{ color: "var(--lime)", textDecoration: "underline" }}>
                  HLT Leaderboard
                </Link>
              </li>
              <li>
                Athletes also get access to{" "}
                <a
                  href="https://ntangible.co/"
                  target="_blank"
                  rel="noopener"
                  style={{ color: "var(--lime)", textDecoration: "underline" }}
                >
                  NTangible&apos;s Mental Performance Clutch Factor Assessment
                </a>{" "}
                — at no extra cost
              </li>
              <li>Athletes also receive the digital training guide via email to continue their development!</li>
            </ul>
            <a className="btn btn-primary" href="https://www.highlevelthrowing.com/pages/contact" target="_blank" rel="noopener">
              Book a Clinic for Your Program
            </a>
          </div>
          <div className="col-media">
            <Image
              src="https://highlevelthrowing.com/cdn/shop/files/High_level_throwing-2.jpg?v=1711116525&width=800"
              alt="High Level Throwing clinic session"
              width={600}
              height={450}
              className="media-photo"
              unoptimized
            />
            <div className="badge">Foundational + Advanced Sessions</div>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: 18 }}>
              We can price by Team Rate or Individual Registrations.
            </p>
            <div className="big-price">
              <span className="price-blur">$160</span> <span style={{ fontSize: "1.4rem" }}>per player</span>
              <small>max 16 athletes per session</small>
            </div>
            <div className="divider" />
            <div className="big-price" style={{ fontSize: "1.6rem" }}>
              <span className="price-blur">$2,000 / team</span>
              <small>up to 18 players + 3 coaches</small>
            </div>
            <div className="divider" />
            <div className="big-price" style={{ fontSize: "1.6rem" }}>
              <span className="price-blur">20%</span>
              <small>revenue share kickback to the host</small>
            </div>
            <div className="divider" />
            <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
              *Selecting the Team Rate is not eligible to receive the revenue share kickback.
            </p>
            <div
              style={{
                background: "rgba(198,255,46,0.1)",
                border: "1px solid rgba(198,255,46,0.4)",
                borderRadius: 12,
                padding: "14px 18px",
                marginTop: 18,
              }}
            >
              <p style={{ color: "var(--lime)", fontWeight: 800, fontSize: "0.9rem", margin: 0 }}>
                Minimum of 48 athletes required to host a clinic.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="videos">
        <div className="section-head">
          <div className="section-tag">See It In Action</div>
          <h2>Watch a Clinic Up Close</h2>
          <p>A look at what a High Level Throwing clinic looks like on-site.</p>
        </div>
        <div className="video-grid">
          <VideoEmbed vimeoId="375431966" title="High Level Throwing® Clinic: Training Video" autoEmbed />
          <VideoEmbed
            vimeoId="1061105417"
            title="High Level Throwing® Clinic Highlights"
            poster="https://highlevelthrowing.com/cdn/shop/files/Screen_Shot_2025-05-15_at_10.28.06_PM.png?v=1747362497&width=1500"
          />
        </div>
      </section>

      <section id="schedule">
        <div className="section-head">
          <div className="section-tag">Clinic Schedule</div>
          <h2>Upcoming Clinics</h2>
          <p>See where High Level Throwing is headed next and find a clinic near you.</p>
        </div>
        <div className="tockify-wrap">
          <div data-tockify-component="calendar" data-tockify-calendar="travelclinics" />
        </div>
        <Script src="https://public.tockify.com/browser/embed.js" strategy="lazyOnload" data-cfasync="false" />
      </section>

      <section id="model">
        <div className="section-head">
          <div className="section-tag">How It Works</div>
          <h2>Simple to Add During the Year</h2>
          <p>
            Programs that bring in HLT clinics see stronger, faster and more efficient throws, with arm care
            techniques that last!
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <h3>Pick your Clinic Type</h3>
            <p>
              Confirm a clinic date and choose Foundational, Advanced, or both — based on what your athletes and
              coaches need this season.
            </p>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <h3>Facility/Field & Equipment Requirements</h3>
            <p>Host provides location, bucket of softballs or baseballs and nets/screens if needed.</p>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <h3>We Handle the Rest</h3>
            <p>
              Once we confirm a clinic date, methods of registration/payment, we handle the rest! Newsletter, Email
              & Social Media Marketing.
            </p>
            <p style={{ marginTop: 14 }}>*We book our own travel at no extra cost to you.</p>
          </div>
        </div>
      </section>

      <section className="cta-final" style={{ borderBottom: "1px solid var(--border)" }}>
        <h2>Ready to Bring HLT On-Site?</h2>
        <div className="hero-ctas">
          <a className="btn btn-primary" href="https://www.highlevelthrowing.com/pages/contact" target="_blank" rel="noopener">
            Schedule a Call
          </a>
          <a className="btn btn-outline" href="https://www.highlevelthrowing.com" target="_blank" rel="noopener">
            Visit HighLevelThrowing.com
          </a>
        </div>
      </section>
    </>
  );
}
