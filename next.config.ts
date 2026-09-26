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
    return [
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
      // Shopify app-proxy paths. Digital download links are issued under
      // /a/downloads/... on the shop's own domain — every link already emailed
      // to a customer points here, and this domain now answers from Vercel, so
      // without this they 404. The token in the path is what authorises the
      // download, and a redirect carries it through untouched.
      { source: "/a/:path*", destination: `${SHOPIFY_STORE}/a/:path*`, permanent: false },
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
};

export default nextConfig;
