import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";

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
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
