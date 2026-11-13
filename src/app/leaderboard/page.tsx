import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Velocity Leaderboard",
};

export default function LeaderboardPage() {
  return (
    <section>
      <div className="section-head">
        <div className="section-tag">Velocity Leaderboard</div>
        <h2>Join the HLT Leaderboard</h2>
        <p>
          Join the HLT Leaderboard and compete against athletes around the world! Earn your VELOCITY BADGE and
          showcase them in your recruiting profiles! Do you have the strongest arm on the field?
        </p>
        <p style={{ fontSize: "0.85rem", marginTop: 18 }}>
          *To join the leaderboard you must attend a 2026 HLT Clinic, Receive a Video Assessment or be Accepted
          through one of our Partners.
        </p>
        <p style={{ fontSize: "0.85rem", marginTop: 8 }}>*All velocity numbers have been verified.</p>
      </div>
      {/* The widget mounts straight into this page.

          It used to sit in an iframe onto the Shopify theme, so reaching the
          table meant three sequential round trips: this page, then a 62KB
          themed document carrying 44 scripts and 5 stylesheets, and only then
          the widget that actually renders the rows. The theme contributed
          nothing — the embed markup contains no table at all. Loading the
          widget here removes two of those trips and the whole theme.

          The two assets are served from /vt so they ride this page's own
          connection instead of opening a second one; see app/vt/[file]. The
          integrity hashes are unchanged because the bytes are passed through.
          The API calls still cross to the widget host, so the preconnect for
          it lives in the root layout, ahead of everything that uses it. */}
      <link
        rel="stylesheet"
        href="/vt/velocity-widget.css"
        integrity="sha384-E5uKi6hho7tcuj7fBawCcHMnvmFGwTBdtUetQ33NwkaZ8QCQRGTxBKoZcMSHTOav"
        crossOrigin="anonymous"
      />
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div id="vt-leaderboard-block" data-api-url="https://highlevelthrowingleaderboard.com" data-limit="25" />
      </div>
      <Script
        src="/vt/velocity-widget.js"
        integrity="sha384-oP6d+drwlV/IoHse3ymhE7A7F1t6/Ko4sxEktqfjUiVYCUcgVIxW7EheWT955k/0"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </section>
  );
}
