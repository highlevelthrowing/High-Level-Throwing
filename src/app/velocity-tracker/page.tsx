import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Clinic Velocity Tracker",
  description:
    "Submit your verified throwing velocity from a High Level Throwing® clinic and " +
    "track arm strength gains on the softball and baseball velocity leaderboard.",
};

export default function VelocityTrackerPage() {
  return (
    <section>
      <div className="section-head">
        <div className="section-tag">Velocity Tracker</div>
        <h1>Clinic Velocity Tracker</h1>
      </div>
      {/* Mounted directly rather than framed, for the same reason as
          /leaderboard: the embed document was 68KB of Shopify theme carrying
          43 scripts and 6 stylesheets around a single empty div, and the form
          could not appear until all of it had loaded. Assets come from /vt for
          the same reason they do there. */}
      <link
        rel="stylesheet"
        href="/vt/velocity-widget.css"
        integrity="sha384-E5uKi6hho7tcuj7fBawCcHMnvmFGwTBdtUetQ33NwkaZ8QCQRGTxBKoZcMSHTOav"
        crossOrigin="anonymous"
      />
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div id="vt-form-block" data-api-url="https://highlevelthrowingleaderboard.com" />
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
