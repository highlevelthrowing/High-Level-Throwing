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
      { source: "/blogs/:path*", destination: `${SHOPIFY_STORE}/blogs/:path*`, permanent: false },
      { source: "/collections/:path*", destination: `${SHOPIFY_STORE}/collections/:path*`, permanent: false },
    ];
  },
};

export default nextConfig;
