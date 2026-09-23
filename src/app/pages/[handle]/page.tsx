import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/shopify/pages";
import { isShopifyConfigured } from "@/lib/shopify/client";
import SimpleEmbed from "@/components/SimpleEmbed";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  if (!isShopifyConfigured()) return { title: "High Level Throwing®" };
  const { handle } = await params;
  const page = await getPage(decodeURIComponent(handle)).catch(() => null);
  return { title: page?.title ?? "High Level Throwing®" };
}

// Clinic pages (and other Shopify-authored pages) are built with theme sections
// rather than page body content, so there is nothing to render natively. They
// are embedded here so visitors stay on this site instead of being sent to the
// Shopify store.
export default async function ShopifyHostedPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const decoded = decodeURIComponent(handle);

  if (isShopifyConfigured()) {
    const page = await getPage(decoded).catch(() => null);
    if (!page) notFound();
  }

  return <SimpleEmbed embedKey={handle} iframeTitle="High Level Throwing" height={2400} />;
}
