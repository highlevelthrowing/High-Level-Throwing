import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SimpleEmbed from "@/components/SimpleEmbed";

const SHOPIFY_STORE = "https://high-level-throwing.myshopify.com";
const SEGMENT = /^[a-z0-9®–—_.-]+$/i;

function titleFromSlug(slug: string[]): string {
  const last = decodeURIComponent(slug[slug.length - 1] ?? "");
  if (!last) return "Articles";
  const words = last.split("-").filter(Boolean);
  // Small words stay lower case unless they open the title.
  const minor = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "in", "of", "on", "or", "the", "to", "vs", "with"]);
  return words
    .map((word, i) =>
      i > 0 && minor.has(word.toLowerCase()) ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1)
    )
    .join(" ");
}

/**
 * The slug drops apostrophes and casing, so "we're" comes back as "Were". The
 * article's own <title> is the real one — this reuses the same fetch the page
 * makes, so asking for it costs nothing extra.
 */
async function articleTitle(segments: string[]): Promise<string | null> {
  const res = await fetchArticle(segments);
  if (!res || !res.ok) return null;
  const html = await res.text();
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) return null;
  // Decode before splitting: the separator Shopify uses is the entity
  // "&ndash;", not the character, so splitting first leaves it in the title.
  // "&amp;" goes last so an escaped entity is not decoded twice.
  const raw = match[1]
    .replace(/&(?:ndash|#8211);/g, "\u2013")
    .replace(/&(?:mdash|#8212);/g, "\u2014")
    .replace(/&(?:rsquo|#8217|#39|apos);/g, "\u2019")
    .replace(/&(?:quot|#34);/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  // Strip only the trailing shop name, and only that. Splitting on the first
  // separator truncated real titles that contain one, turning "Softball
  // Throwing Velocity - NEW Leader" into "Softball Throwing Velocity".
  const title = raw.replace(/\s*[|\u2013\u2014-]\s*High Level Throwing\s*$/i, "").trim();
  return title || null;
}

function fetchArticle(segments: string[]) {
  const target = `${SHOPIFY_STORE}/blogs/${segments.map(encodeURIComponent).join("/")}`;
  return fetch(target, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; HLTStorefrontEmbed/1.0)" },
    next: { revalidate: 300 },
  }).catch(() => null);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const segments = (slug ?? []).map((s) => decodeURIComponent(s));
  const real = segments.every((s) => SEGMENT.test(s)) ? await articleTitle(segments) : null;
  return { title: real ?? titleFromSlug(segments) };
}

/**
 * Articles live on the Shopify blog — there is no Storefront API surface that
 * returns a rendered article the way the theme builds it. They used to redirect
 * out to the store, which dropped visitors onto the old site. They are embedded
 * here instead so they open in place, styled to match.
 */
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const segments = (slug ?? []).map((s) => decodeURIComponent(s));

  if (segments.length === 0 || !segments.every((s) => SEGMENT.test(s))) {
    notFound();
  }

  const res = await fetchArticle(segments);

  if (!res || !res.ok) notFound();

  return (
    <SimpleEmbed
      embedKey={`blogs/${slug.join("/")}`}
      iframeTitle={titleFromSlug(segments)}
      height={2400}
    />
  );
}
