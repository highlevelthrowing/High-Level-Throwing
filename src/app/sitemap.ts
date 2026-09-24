import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getProducts } from "@/lib/shopify/products";
import { getClinics } from "@/lib/clinics";
import { ARTICLE_PATHS } from "@/lib/articles";

// Rebuilt daily — the clinic schedule and catalogue move often enough that a
// build-time snapshot would go stale between deploys.
export const revalidate = 86400;

const STATIC_PATHS: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/clinics", priority: 0.9, changeFrequency: "daily" },
  { path: "/video-assessment", priority: 0.9, changeFrequency: "weekly" },
  { path: "/shop", priority: 0.9, changeFrequency: "weekly" },
  { path: "/books", priority: 0.8, changeFrequency: "weekly" },
  { path: "/leaderboard", priority: 0.8, changeFrequency: "daily" },
  { path: "/articles", priority: 0.7, changeFrequency: "weekly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/college-consulting", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  { path: "/velocity-tracker", priority: 0.5, changeFrequency: "monthly" },
  { path: "/showcase", priority: 0.4, changeFrequency: "monthly" },
  { path: "/terms-of-service", priority: 0.2, changeFrequency: "yearly" },
  { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/shipping", priority: 0.2, changeFrequency: "yearly" },
  { path: "/refund-policy", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  for (const path of ARTICLE_PATHS) {
    entries.push({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    });
  }

  // Clinic registration pages, taken from the live schedule so past clinics
  // drop out of the sitemap on their own.
  const clinics = await getClinics().catch(() => []);
  for (const clinic of clinics) {
    if (!clinic.registerHref || clinic.external) continue;
    if (!clinic.registerHref.startsWith("/pages/")) continue;
    entries.push({
      url: `${SITE_URL}${clinic.registerHref}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  if (isShopifyConfigured()) {
    const products = await getProducts(250).catch(() => []);
    for (const product of products) {
      entries.push({
        url: `${SITE_URL}/products/${encodeURIComponent(product.handle)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  // A handle can appear twice — a clinic session is both a product and linked
  // from its registration page.
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
