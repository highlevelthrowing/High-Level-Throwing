import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import HelpWidget from "@/components/HelpWidget";

export const metadata: Metadata = {
  // metadataBase makes every relative canonical and OG url resolve to the live
  // site, so UTM-tagged ad links and the apex/www split all point at one
  // canonical address rather than splitting Google's index.
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "./" },
  title: {
    default: "High Level Throwing®",
    template: "High Level Throwing® | %s",
  },
  description:
    "High Level Throwing® — nationally recognized clinics, college consulting, video assessments and training gear for baseball and softball athletes.",
  // Facebook reads these to build a link preview. Without og:url it guesses the
  // canonical address from whatever URL was pasted, so a link carrying UTM or
  // Shop Pay parameters gets scraped and cached as its own page; without
  // og:type and og:site_name the preview renders as an untyped, unbranded card.
  // Next fills og:title, og:description and og:image from the metadata above.
  openGraph: {
    type: "website",
    siteName: "High Level Throwing®",
    url: "./",
    locale: "en_US",
  },
  // Meta will not let you control link previews for a domain you have not
  // proven you own, and Google Search Console is where a manual action or
  // security flag is reported — the two places an ad pause or a blocked link
  // actually gets explained. Both are a single token pasted into the
  // environment; read here rather than hard-coded so rotating one does not
  // need a code change, and omitted entirely when unset so no empty meta tag
  // ships.
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.FACEBOOK_DOMAIN_VERIFICATION
      ? { other: { "facebook-domain-verification": process.env.FACEBOOK_DOMAIN_VERIFICATION } }
      : {}),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {/* useSearchParams needs a boundary; analytics must never block a page. */}
        <HelpWidget />
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
