import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SimpleEmbed from "@/components/SimpleEmbed";

const SHOPIFY_STORE = "https://high-level-throwing.myshopify.com";
const SEGMENT = /^[a-z0-9®–—_.-]+$/i;

function titleFromSlug(slug: string[]): string {
  const last = decodeURIComponent(slug[slug.length - 1] ?? "");
  if (!last) return "Articles";
  return last
    .split("-")
    .filter(Boolean)
    .map((word) => (word.length > 3 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: titleFromSlug(slug ?? []) };
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

  const target = `${SHOPIFY_STORE}/blogs/${segments.map(encodeURIComponent).join("/")}`;
  const res = await fetch(target, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; HLTStorefrontEmbed/1.0)" },
    next: { revalidate: 300 },
  }).catch(() => null);

  if (!res || !res.ok) notFound();

  return (
    <SimpleEmbed
      embedKey={`blogs/${slug.join("/")}`}
      iframeTitle={titleFromSlug(segments)}
      height={2400}
    />
  );
}
