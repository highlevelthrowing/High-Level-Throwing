import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TrustedByLogos from "@/components/TrustedByLogos";
import TeamGrid from "@/components/TeamGrid";
import ProgramCalculator from "@/components/calculators/ProgramCalculator";

export const metadata: Metadata = {
  title: "Program Partnership",
};

export default function Showcase() {
  return (
    <>
      <section className="hero">
        <div className="eyebrow">For Baseball & Softball Teams, Organizations and Training Facilities</div>
        <h1>
          Build High Level Throwing® into <em>every</em> season, not a separate expense.
        </h1>
        <p>
          Clinics, individual throwing-mechanics video assessments, and Lightning Ball Plyo Sets with a digital
          training guide — built to be rolled directly into your program&apos;s yearly fees, so every athlete gets
          it without an extra ask.
        </p>
        <div className="hero-ctas">
          <a className="btn btn-primary" href="https://www.highlevelthrowing.com/pages/contact" target="_blank" rel="noopener">
            Request a Program Quote
          </a>
          <a className="btn btn-outline" href="#model">
            See How It Fits Your Budget
          </a>
        </div>
      </section>

      <TrustedByLogos />

      <section id="overview">
        <div className="section-head">
          <div className="section-tag">High Level Throwing Program Packages</div>
          <h2>Three Offerings. Built In.</h2>
          <p>
            Pick one, or bundle all three — each is built to scale from a single team to a full organization, and
            priced so it can live inside registration or membership dues instead of an out-of-pocket cost for
            parents.
          </p>
        </div>
        <div className="grid grid-3">
          <div className="pillar-card">
            <div className="pillar-num">01 · ON-SITE</div>
            <h3>Clinics</h3>
            <p>
              Foundational and Advanced in-person sessions delivered directly to your Rec League, Travel
              Organization, College Program, or Training Facility.
            </p>
            <div className="tag-row">
              <span className="tag price-blur">$160 / player</span>
              <span className="tag price-blur">10% Host Revenue Share</span>
            </div>
            <a className="card-link" href="#clinics">
              See clinic formats →
            </a>
          </div>
          <div className="pillar-card">
            <div className="pillar-num">02 · PER ATHLETE</div>
            <h3>Video Assessments</h3>
            <p style={{ textAlign: "center" }}>
              Every athlete on the roster or in the organization submits a throwing video and gets a High Level
              Throwing® Score, a Throwing Report + a Full Breakdown with drills and programming.
            </p>
            <div className="tag-row">
              <span className="tag price-blur">From $30</span>
              <span className="tag price-blur">10% Host Revenue Share</span>
              <span className="tag">Contact Us for Orgs</span>
            </div>
            <a className="card-link" href="#assessment">
              See what&apos;s in the report →
            </a>
          </div>
          <div className="pillar-card">
            <div className="pillar-num">03 · TAKE-HOME</div>
            <h3>Lightning Ball Plyos + Digital Guide</h3>
            <p>
              A Lightning Ball Plyo Set paired with a digital training guide, so every athlete has the tool and the
              instructions to use it correctly, year-round.
            </p>
            <div className="tag-row">
              <span className="tag price-blur">$65 / player</span>
              <span className="tag">No Rev Share</span>
            </div>
            <a className="card-link" href="#plyo">
              See the bundle →
            </a>
          </div>
        </div>
      </section>

      <section id="clinics">
        <div className="split">
          <div className="col-text">
            <div className="section-tag">01 · Clinics</div>
            <h2>On-site coaching for your whole organization</h2>
            <p>
              Founder Austin Wasserman and lead instructor Sarah O&apos;Brien bring HLT directly to your facility —
              one visit can reach an entire travel org, rec league, or college roster at once, making it easy to
              build HLT into your program.
            </p>
            <ul className="feature-list">
              <li>Foundational Sessions — arm care and overhand throwing fundamentals</li>
              <li>Advanced Sessions — deeper mechanics and position based training</li>
              <li>Built for Rec Leagues, Travel Orgs, College Programs & Training Facilities</li>
              <li>Baseball and softball athletes and coaches, all ages</li>
            </ul>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              If you don&apos;t want to build into your fees, we can still do a clinic with the same revenue share
              opportunities.
            </p>
            <a className="btn btn-primary" href="https://www.highlevelthrowing.com/pages/contact" target="_blank" rel="noopener">
              Book a Clinic for Your Program
            </a>
          </div>
          <div className="col-media">
            <div className="badge">Foundational + Advanced Sessions</div>
            <div className="big-price">
              <span className="price-blur">$160</span>
              <small>per player</small>
            </div>
            <div className="divider" />
            <div className="big-price" style={{ fontSize: "1.6rem" }}>
              <span className="price-blur">$2,000 / team</span>
              <small>up to 18 players + 3 coaches</small>
            </div>
            <div className="divider" />
            <div className="big-price" style={{ fontSize: "1.6rem" }}>
              <span className="price-blur">10%</span>
              <small>revenue share kickback to the host</small>
            </div>
            <div className="divider" />
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              Built to be folded into your program&apos;s season fee — hosting organizations earn a revenue share on
              top of running the clinic. Revenue share kickback to the host only if host chooses individual
              registrations. *No kickback for team rate.
            </p>
          </div>
        </div>
      </section>

      <section id="assessment">
        <div className="split">
          <div className="col-text">
            <div className="section-tag">02 · Video Assessments</div>
            <h2>A throwing report on every athlete</h2>
            <p>
              Each athlete receives 2 throwing reports per year! Athlete submits video and gets it assessed — giving
              coaches a shared, objective baseline for every player on the roster. Athletes can purchase additional
              reports through our HLT Coaching Platform.
            </p>
            <ul className="feature-list">
              <li>Individual HLT Report with a High Level Throwing® Score</li>
              <li>Full breakdown of throwing mechanics, explained in plain terms</li>
              <li>15 minute process to get your score and report</li>
              <li>Consistent scoring across an entire roster for coaches to compare and track</li>
            </ul>
            <Link className="btn btn-primary" href="/video-assessment">
              See the Assessment
            </Link>
          </div>
          <div className="col-media">
            <div className="badge">Team / Organization Pricing</div>
            <div className="tier-list">
              <div className="tier-group-label">Team / Organization Rate</div>
              <div className="tier-row" style={{ flexWrap: "wrap" }}>
                <span className="tier-label" style={{ flex: "0 0 auto" }}>
                  Access to 1 year
                </span>
                <span className="tier-price" style={{ flex: "0 0 auto" }}>
                  <span className="price-blur">From $30</span>
                  <br />
                  <span style={{ display: "block", fontWeight: 600, fontSize: "0.7rem", color: "var(--muted)", textTransform: "none", letterSpacing: 0 }}>
                    Customization based on # of athletes
                  </span>
                </span>
              </div>
            </div>
            <div className="divider" />
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              Team & organization rate requires a minimum number of teams or players. Volume pricing for
              organizations includes a 10% revenue share kickback to the host.
            </p>
            <div className="divider" />
            <div className="big-price" style={{ fontSize: "1.3rem" }}>
              Contact Us<small>for large organizations, rec leagues, facilities & college programs</small>
            </div>
          </div>
        </div>
      </section>

      <section id="plyo">
        <div className="split">
          <div className="col-text">
            <div className="section-tag">03 · Lightning Ball Plyos + Digital Guide</div>
            <h2>The tool and the instructions, in every athlete&apos;s hands</h2>
            <p>
              A Lightning Ball Plyo Set paired with a digital training guide means every athlete gets the same
              equipment and the same instruction on how to use it — no guesswork, no gaps between what&apos;s handed
              out and what&apos;s actually trained.
            </p>
            <ul className="feature-list">
              <li>Lightning Ball Plyo Set for arm care and throwing progressions</li>
              <li>Digital training guide included, so athletes and coaches know exactly how to run it</li>
              <li>Available as individual sets or team bundles (6 or 12 sets)</li>
              <li>Built to be issued at the start of a season alongside other team gear</li>
            </ul>
            <a className="btn btn-primary" href="https://www.highlevelthrowing.com/collections/shop-equipment" target="_blank" rel="noopener">
              Get Sets for Your Team
            </a>
          </div>
          <div className="col-media">
            <div className="product-shot-row">
              <Image
                src="https://highlevelthrowing.com/cdn/shop/files/ScreenShot2026-06-05at4.26.40PM.png?v=1780691225&width=600"
                alt="Lightning Ball Plyo Set"
                width={280}
                height={280}
                unoptimized
              />
              <Image
                src="https://highlevelthrowing.com/cdn/shop/files/BlueBestSellerLaptopInstagramPostcopy2_a8eacfea-8c5f-4693-92c2-693b46bae15d.png?v=1780578653&width=600"
                alt="Digital Training Guide"
                width={280}
                height={280}
                unoptimized
              />
            </div>
            <div className="badge">Digital Guide + Plyo Set</div>
            <div className="big-price">
              <span className="price-blur">$65</span>
              <small>per player</small>
            </div>
            <div className="divider" />
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              Digital training guide included with every set — the same resource and equipment for every athlete on
              the roster. No revenue share on this offering — cost is passed through to customer. Already discounted
              from <span className="price-blur">$105</span> to <span className="price-blur">$65</span>, so saving{" "}
              <span className="price-blur">$40</span>.
            </p>
          </div>
        </div>
      </section>

      <section id="model">
        <div className="section-head">
          <div className="section-tag">How It Works</div>
          <h2>Built to live inside your program&apos;s fees, not next to them</h2>
          <p>
            Programs that adopt one or all three offerings typically fold the cost into registration or membership
            dues once, instead of asking parents or athletes to opt in separately.
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <h3>Pick your offerings</h3>
            <p>Choose clinics, video assessments, plyo sets with the digital guide — or all three — based on what your program needs this season.</p>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <h3>Get one quote for the group</h3>
            <p>We price per roster or organization size, so you get a single number to build into your season budget instead of per-athlete signups.</p>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <h3>Roll it into your fees</h3>
            <p>Build the cost into what your athletes already pay each year — every player gets the same training, tools, and reporting by default.</p>
          </div>
        </div>
      </section>

      <section id="calculator">
        <div className="section-head">
          <div className="section-tag">Revenue Share Calculator</div>
          <h2>See what your program could earn</h2>
          <p>
            Clinics and Video Assessments pay a flat 10% revenue share back to the host. Pick an offering and slide
            to match your organization&apos;s size to see what that adds up to.
          </p>
        </div>
        <ProgramCalculator />
      </section>

      <section id="team">
        <div className="section-head">
          <div className="section-tag">Who&apos;s Behind It</div>
          <h2>Coached by people who&apos;ve done it</h2>
          <p>20+ years of athletic training experience, Division 1 and professional playing careers, and Olympic-level credentials behind every offering.</p>
        </div>
        <TeamGrid
          members={[
            {
              name: "Austin Wasserman",
              role: "Founder",
              bio: "Owner and Founder of High Level Throwing. Nationally and Internationally recognized program.",
              image: "/images/austin-wasserman.png",
            },
            {
              name: "Sarah O'Brien",
              role: "Lead Instructor",
              bio: "Eight seasons of collegiate coaching experience, leading clinics and assessments alongside Austin.",
              image:
                "https://highlevelthrowing.com/cdn/shop/files/Screen_Shot_2023-11-20_at_8.32.05_PM.png?v=1700530336&width=200",
            },
            {
              name: "Haylie McCleney",
              role: "Strength Coach",
              bio: "Olympic silver medalist and University of Alabama standout, now training athletes within the HLT system.",
              image: "https://highlevelthrowing.com/cdn/shop/files/McCleneyHaylie-McCleney.jpg?v=1699924802&width=200",
            },
          ]}
        />
      </section>

      <section className="cta-final" style={{ borderBottom: "1px solid var(--border)" }}>
        <h2>Ready to Build This Into Your Program?</h2>
        <p>
          Tell us your roster size and which offerings you want — clinics, video assessments, plyo sets with the
          digital guide, or all three — and we&apos;ll put together a quote sized for your organization&apos;s
          budget.
        </p>
        <div className="hero-ctas">
          <a className="btn btn-primary" href="https://www.highlevelthrowing.com/pages/contact" target="_blank" rel="noopener">
            Request a Program Quote
          </a>
          <a className="btn btn-outline" href="https://www.highlevelthrowing.com" target="_blank" rel="noopener">
            Visit HighLevelThrowing.com
          </a>
        </div>
      </section>
    </>
  );
}
