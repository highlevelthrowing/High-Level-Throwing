import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nothing to gain from crawling a personal cart or the proxy that serves
      // the embedded Shopify pages — the pages themselves are listed instead.
      disallow: ["/cart", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
