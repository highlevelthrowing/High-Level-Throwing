import type { Metadata } from "next";
import Image from "next/image";
import TrustedByLogos from "@/components/TrustedByLogos";
import TeamGrid from "@/components/TeamGrid";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <>
      <section className="hero">
        <div className="eyebrow">Who We Are</div>
        <h1>About High Level Throwing®</h1>
        <p>
          Founded &amp; Created by Austin Wasserman, High Level Throwing® works with baseball and softball athletes
          from youth leagues to the pros — building the complete defensive player through arm care, mechanics, and
          data applications.
        </p>
      </section>

      <section id="founder">
        <div className="split">
          <div className="col-media">
            <Image
              src="/images/austin-wasserman.png"
              alt="Austin Wasserman"
              width={600}
              height={750}
              className="media-photo"
              style={{ aspectRatio: "4/5" }}
              unoptimized
            />
            <div className="badge">Founder &amp; Creator</div>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              <a href="mailto:austin@highlevelthrowing.com" style={{ color: "var(--lime)", textDecoration: "underline" }}>
                austin@highlevelthrowing.com
              </a>
            </p>
          </div>
          <div className="col-text">
            <div className="section-tag">Founder</div>
            <h2>Austin Wasserman</h2>
            <p>
              Austin is the Founder &amp; Creator of High Level Throwing® and High Level Pitching®. He&apos;s a
              Strength Coach, Performance Coach and Author from Brooklyn, New York, with 20 years of athlete
              training experience — working with everyone from youth athletes to MLB players across baseball and
              softball.
            </p>
            <ul className="feature-list">
              <li>B.S. in Exercise Science (Strength &amp; Conditioning) — University of Connecticut</li>
              <li>Master&apos;s Degree in Human Nutrition — University of Bridgeport</li>
              <li>Certified Strength &amp; Conditioning Specialist (CSCS), NSCA</li>
              <li>2002 Gatorade Player of the Year, New Hampshire</li>
              <li>Division 1 Baseball — University of New Orleans &amp; University of Connecticut</li>
              <li>Two seasons of professional baseball, including a 2007 championship with the Nashua Pride</li>
            </ul>
            <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
              Consults for programs including Alabama, Arizona State, Florida State, FAU, IMG Academy, Minnesota,
              Duke, South Carolina, LSU, Ole Miss, Memphis, Washington, UNCW, Coastal Carolina, Villanova, Texas
              Lutheran, Iowa and Iowa State.
            </p>
          </div>
        </div>
      </section>

      <section id="staff">
        <div className="section-head">
          <div className="section-tag">Staff</div>
          <h2>Coached by people who&apos;ve done it</h2>
          <p>Collegiate coaching experience and Olympic-level credentials behind every athlete we train.</p>
        </div>
        <TeamGrid
          members={[
            {
              name: "Sarah O'Brien",
              role: "Lead HLT Instructor",
              bio: "More than eight seasons at the collegiate level — Texas Lutheran (223-39, five NCAA D3 tournament berths), Houston, and Montana. Based in Salt Lake City, UT, she manages the throwing module for remote online softball athletes.",
              image: "https://highlevelthrowing.com/cdn/shop/files/Screen_Shot_2023-11-20_at_8.32.05_PM.png?v=1700530336&width=200",
            },
            {
              name: "Haylie McCleney",
              role: "Professional Softball Player / Olympian",
              bio: "Tokyo Olympics silver medalist for Team USA. Four-time All-American at Alabama, seven years on the U.S. National Team, and a CSCS with a Master's in Exercise Physiology from FAU. Works with softball strength and outfield remote athletes.",
              image: "https://highlevelthrowing.com/cdn/shop/files/McCleneyHaylie-McCleney.jpg?v=1699924802&width=200",
            },
          ]}
        />
      </section>

      <TrustedByLogos />

      <section className="cta-final" style={{ borderBottom: "1px solid var(--border)" }}>
        <h2>Ready to Work With Us?</h2>
        <div className="hero-ctas">
          <a className="btn btn-primary" href="https://www.highlevelthrowing.com/pages/contact" target="_blank" rel="noopener">
            Schedule a Call
          </a>
        </div>
      </section>
    </>
  );
}
