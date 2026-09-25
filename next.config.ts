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
      // Collections used to render on the Shopify theme. Sending people there
      // now drops them onto the old storefront, so keep them in the shop here.
      { source: "/collections/:path*", destination: "/shop", permanent: false },
    ];
  },
};

export default nextConfig;
