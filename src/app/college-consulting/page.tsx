import type { Metadata } from "next";
import Link from "next/link";
import TrustedByLogos from "@/components/TrustedByLogos";
import TeamGrid from "@/components/TeamGrid";

export const metadata: Metadata = {
  title: "College Consulting",
};

export default function CollegeConsulting() {
  return (
    <div className="accent-sky">
      <section className="hero">
        <div className="eyebrow">For College Softball Programs</div>
        <h1>
          Bring our Nationally Recognized High Level Throwing® <em>Consulting</em> to Your College Program!
        </h1>
        <p>Elite instruction delivered directly to your coaching staff and full roster — with 2 ways to work HLT into your program.</p>
        <div className="hero-ctas">
          <a className="btn btn-primary" href="https://www.highlevelthrowing.com/pages/contact" target="_blank" rel="noopener">
            Schedule a Consult!
          </a>
          <a className="btn btn-outline" href="#options">
            See Your Options
          </a>
        </div>
      </section>

      <TrustedByLogos />

      <section id="overview">
        <div className="section-head">
          <div className="section-tag">College Consulting</div>
          <h2>Built for College Programs</h2>
          <p>High Level Throwing instruction for your staff and roster, structured around what works for your budget and your calendar.</p>
        </div>
        <div className="grid grid-2">
          <div className="pillar-card">
            <div className="pillar-num">OPTION 1</div>
            <h3>Flat-Rate Team Visit</h3>
            <p>A full day on campus — staff presentation plus dedicated position-group training for your entire roster.</p>
            <div className="tag-row">
              <span className="tag tag-lime price-blur">$3,500 flat rate</span>
              <span className="tag tag-lime">Travel paid by institution</span>
            </div>
            <a className="card-link" href="#sessions">
              See what&apos;s included →
            </a>
          </div>
          <div className="pillar-card option-blue">
            <div className="pillar-num num-blue">OPTION 2</div>
            <h3>Team Training / Facility Trade Partnership</h3>
            <p>We train your team for 3 hours, then return the next day or weekend to run a High Level Throwing clinic using your facilities.</p>
            <div className="tag-row">
              <span className="tag tag-blue">3-hour team session</span>
              <span className="tag tag-blue">No cost to program</span>
            </div>
            <a className="card-link" href="#sessions">
              See what&apos;s included →
            </a>
          </div>
        </div>
      </section>

      <section id="options">
        <div className="split">
          <div className="col-text">
            <div className="section-tag">Two Ways to Work With HLT</div>
            <h2>Pick the option that fits your program</h2>
            <p>
              Founder Austin Wasserman and lead instructor Sarah O&apos;Brien work directly with your coaching staff
              and full roster — either as a flat-rate visit or a facility trade.
            </p>
            <ul className="feature-list">
              <li>
                Option 1: Fixed cost of <span className="price-blur">$3,500</span>, with travel paid for by the
                institution — includes full staff presentation and arm care system, on-site training with the
                athletes + video assessments on each athlete
              </li>
              <li>Option 2: No cash outlay — your facility is the only requirement</li>
              <li>Position-specific training for Infielders, Outfielders and Catchers</li>
              <li>
                Athletes are eligible to join the{" "}
                <Link href="/leaderboard" style={{ color: "var(--sky)", textDecoration: "underline" }}>
                  HLT Leaderboard
                </Link>
              </li>
            </ul>
            <a className="btn btn-primary" href="https://www.highlevelthrowing.com/pages/contact" target="_blank" rel="noopener">
              Talk to Us About Your Program
            </a>
          </div>
          <div className="col-media">
            <div className="badge">Option 1 · Flat Rate</div>
            <div className="big-price">
              <span className="price-blur">$3,500</span> <span style={{ fontSize: "1.4rem" }}>+ travel</span>
              <small>travel paid for by the institution</small>
            </div>
            <div className="divider" />
            <div className="badge badge-blue">Option 2 · Team Training / Facility Trade Partnership</div>
            <div className="big-price blue">
              3 Hours <span style={{ fontSize: "1.4rem" }}>with your team</span>
              <small>then, a High Level Throwing clinic runs the next day or weekend, using your facilities</small>
            </div>
          </div>
        </div>
      </section>

      <section id="sessions">
        <div className="section-head">
          <div className="section-tag">Details For Your Program</div>
          <h2>What Your Team Receives</h2>
          <p>Every visit is built around your coaching staff and your full athlete roster, separated out by small group positional training throughout the day.</p>
        </div>
        <div className="grid-sessions">
          <div className="session-card">
            <div className="session-badge">Staff</div>
            <h3>Staff Presentation</h3>
            <p>Austin and Sarah walk your coaching staff through HLT&apos;s throwing program, arm care philosophy, and how to keep it going after we leave.</p>
          </div>
          <div className="session-card">
            <div className="session-badge">1.5 HRS</div>
            <h3>Infielders</h3>
            <p>Position-specific throwing mechanics, footwork and arm care training built for the infield.</p>
          </div>
          <div className="session-card">
            <div className="session-badge">1.5 HRS</div>
            <h3>Outfielders</h3>
            <p>Long-arm mechanics, footwork and arm care training built for outfield throws.</p>
          </div>
          <div className="session-card">
            <div className="session-badge">1.5 HRS</div>
            <h3>Catchers</h3>
            <p>Pop time, footwork and arm care training built specifically for the catching position.</p>
          </div>
        </div>
      </section>

      <section id="model">
        <div className="section-head">
          <div className="section-tag">How It Works</div>
          <h2>Add to Your Fall/Winter Schedule</h2>
          <p>
            Programs that bring in HLT consulting see stronger, faster and more efficient throws, with arm care
            techniques that last, giving the team a defensive edge over their competition!
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <h3>Choose Your Option</h3>
            <p>Confirm a date and pick Option 1 (flat rate) or Option 2 (facility trade) — based on what fits your budget and calendar.</p>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <h3>Facility & Staff Coordination</h3>
            <p>College Program provides the practice facility, equipment, and staff/roster availability for the day.</p>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <h3>We Handle the Rest</h3>
            <p>Once the date is confirmed, we run the staff presentation in the morning and position sessions — or the team session!</p>
            <p style={{ marginTop: 14 }}>*Option 1 travel is paid for by the institution; Option 2 requires no cash outlay.</p>
          </div>
        </div>
      </section>

      <section id="team">
        <div className="section-head">
          <div className="section-tag">Who&apos;s Behind It</div>
          <h2>Coached by people who&apos;ve done it</h2>
          <p>20+ years of athletic training experience and Division 1 playing careers behind every visit.</p>
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
              bio: "Eight seasons of collegiate coaching experience, leading staff sessions and assessments alongside Austin.",
              image:
                "https://highlevelthrowing.com/cdn/shop/files/Screen_Shot_2023-11-20_at_8.32.05_PM.png?v=1700530336&width=200",
            },
          ]}
        />
      </section>

      <section className="cta-final" style={{ borderBottom: "1px solid var(--border)" }}>
        <h2>Ready to Bring HLT to Your College Program?</h2>
        <div className="hero-ctas">
          <a className="btn btn-primary" href="https://www.highlevelthrowing.com/pages/contact" target="_blank" rel="noopener">
            Schedule a Call
          </a>
          <a className="btn btn-outline" href="https://www.highlevelthrowing.com" target="_blank" rel="noopener">
            Visit HighLevelThrowing.com
          </a>
        </div>
      </section>
    </div>
  );
}
