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
      { source: "/pages/:path*", destination: `${SHOPIFY_STORE}/pages/:path*`, permanent: false },
      { source: "/blogs/:path*", destination: `${SHOPIFY_STORE}/blogs/:path*`, permanent: false },
      { source: "/collections/:path*", destination: `${SHOPIFY_STORE}/collections/:path*`, permanent: false },
    ];
  },
};

export default nextConfig;
