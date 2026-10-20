import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "highlevelthrowing.com",
        pathname: "/cdn/shop/**",
      },
      {
        protocol: "https",
        hostname: "*.myshopify.com",
      },
      {
        // Clinic artwork from the Tockify calendar feed.
        protocol: "https",
        hostname: "d3flpus5evl89n.cloudfront.net",
      },
    ],
  },
  // This domain used to serve the Shopify storefront, so links out in the wild
  // (the Tockify clinic calendar, emails, social posts, search results) still
  // point at /pages/... and /blogs/... . Those live on the Shopify store, which
  // now answers on its myshopify domain, so forward them there instead of 404ing.
  async redirects() {
    const SHOPIFY_STORE = "https://high-level-throwing.myshopify.com";

    /**
     * The ® came out of these product handles so the URLs stop needing
     * percent-encoding. An encoded ® arrives as %C2%AE when it survives the
     * trip and as a malformed %AE when something mangles it, and the second
     * form cannot be decoded at all — production threw `failed to decode
     * param` on exactly that.
     *
     * Shopify's own URL redirects only answer on the myshopify domain, so they
     * do nothing for this app. Without these the old addresses returned a soft
     * 404: HTTP 200 carrying not-found content under a self-referencing
     * canonical, which Google reads as a thin duplicate rather than a move.
     *
     * Permanent, so the ranking the old address earned follows it across.
     */
    const RENAMED: [string, string][] = [
      ["high-level-pitching®-youth", "high-level-pitching-youth"],
      ["high-level-pitching®-bundle", "high-level-pitching-bundle-player-coach"],
      ["high-level-pitching®-softball", "high-level-pitching-softball"],
      ["high-level-pitching®-advanced", "high-level-pitching-advanced"],
      [
        "high-level-throwing®-video-assessment-throwing-program",
        "high-level-throwing-video-assessment-throwing-program",
      ],
      [
        "high-level-throwing®-x-pocket-radars-14-day-throwing-program",
        "high-level-throwing-x-pocket-radars-14-day-throwing-program",
      ],
    ];
    const renamedProducts = RENAMED.flatMap(([from, to]) =>
      // Both spellings: the bare character, and the encoding a browser sends.
      [...new Set([`/products/${from}`, `/products/${encodeURIComponent(from)}`])].map(
        (source) => ({ source, destination: `/products/${to}`, permanent: true })
      )
    );

    return [
      ...renamedProducts,
      // /pages/:handle is handled in-app by app/pages/[handle] so Shopify-authored
      // pages (clinics especially) render inside this site rather than sending
      // visitors off to the Shopify store.
      // The video assessment page is now rendered natively, so the old
      // Shopify page handle points at it instead of embedding the store.
      {
        source: "/pages/high-level-throwing-video-breakdown-12-week-throwing-program",
        destination: "/video-assessment",
        permanent: false,
      },
      // Everything else Shopify owns that this domain used to answer for, and
      // that customer emails, marketing links and ads still point at:
      //   /orders/<token>   order status page in every confirmation email
      //   /account*         customer login and order history
      //   /checkouts/*      abandoned-checkout recovery links
      //   /cart/<id>:<qty>  add-to-cart permalinks used in campaigns
      //   /policies/*       the canonical policy pages Shopify links to
      // :path+ on /cart matches only sub-paths, so this site's own cart page
      // is untouched.
      { source: "/orders/:path*", destination: `${SHOPIFY_STORE}/orders/:path*`, permanent: false },
      { source: "/account", destination: `${SHOPIFY_STORE}/account`, permanent: false },
      { source: "/account/:path*", destination: `${SHOPIFY_STORE}/account/:path*`, permanent: false },
      { source: "/checkouts/:path*", destination: `${SHOPIFY_STORE}/checkouts/:path*`, permanent: false },
      { source: "/cart/:path+", destination: `${SHOPIFY_STORE}/cart/:path+`, permanent: false },
      { source: "/policies/:path*", destination: `${SHOPIFY_STORE}/policies/:path*`, permanent: false },
      { source: "/apps/:path*", destination: `${SHOPIFY_STORE}/apps/:path*`, permanent: false },
      { source: "/tools/:path*", destination: `${SHOPIFY_STORE}/tools/:path*`, permanent: false },
      // Collections used to render on the Shopify theme. Sending people there
      // now drops them onto the old storefront, so keep them in the shop here.
      { source: "/collections/:path*", destination: "/shop", permanent: false },
    ];
  },
  // Shopify app-proxy paths. Digital download links are issued under
  // /a/downloads/... on the shop's own domain — every link already emailed to a
  // customer points here, and this domain now answers from Vercel, so without
  // this they 404. The token in the path is what authorises the download.
  //
  // A rewrite rather than a redirect: a redirect moved the customer to
  // high-level-throwing.myshopify.com, so a link that said highlevelthrowing.com
  // in their inbox opened on a domain they did not recognise — which reads as
  // phishing and gets rewritten or flagged by some mail filters. Proxying keeps
  // them on the domain the email promised, and the "Download Now" button on that
  // page is a relative /a/... link, so it comes back through here too.
  // This path used to answer with a redirect, and a browser that cached it kept
  // sending customers to the old destination after the fix went out — the first
  // person to retry saw nothing until they opened a different browser. Telling
  // the browser never to store a response here means the next change to how
  // downloads are served reaches everyone immediately.
  async headers() {
    // Baseline hardening on every response. No CSP here on purpose: this site
    // pulls scripts, images and frames from Shopify's CDN, Vimeo, Klaviyo and
    // the Tockify image host, so a policy written without auditing those would
    // silently break them. That wants its own pass, report-only first.
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // SAMEORIGIN rather than DENY: the clinic registration pages render the
      // proxied Shopify page in an iframe on this same origin.
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    return [
      { source: "/:path*", headers: security },
      { source: "/a/:path*", headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }] },
    ];
  },
};

export default nextConfig;
