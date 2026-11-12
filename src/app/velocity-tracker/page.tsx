import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Velocity Tracker",
};

export default function VelocityTrackerPage() {
  return (
    <section>
      <div className="section-head">
        <div className="section-tag">Velocity Tracker</div>
        <h2>Clinic Velocity Tracker</h2>
      </div>
      {/* Mounted directly rather than framed, for the same reason as
          /leaderboard: the embed document was 68KB of Shopify theme carrying
          43 scripts and 6 stylesheets around a single empty div, and the form
          could not appear until all of it had loaded. Same widget, same two
          SRI hashes -- it just starts a round trip earlier now. */}
      <link rel="preconnect" href="https://highlevelthrowingleaderboard.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://highlevelthrowingleaderboard.com/embed/velocity-widget.css"
        integrity="sha384-E5uKi6hho7tcuj7fBawCcHMnvmFGwTBdtUetQ33NwkaZ8QCQRGTxBKoZcMSHTOav"
        crossOrigin="anonymous"
      />
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div id="vt-form-block" data-api-url="https://highlevelthrowingleaderboard.com" />
      </div>
      <Script
        src="https://highlevelthrowingleaderboard.com/embed/velocity-widget.js"
        integrity="sha384-oP6d+drwlV/IoHse3ymhE7A7F1t6/Ko4sxEktqfjUiVYCUcgVIxW7EheWT955k/0"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </section>
  );
}
