import { getPage } from "@/lib/shopify/pages";
import { isShopifyConfigured } from "@/lib/shopify/client";

export default async function ShopifyPageContent({
  handle,
  heading,
  tag,
}: {
  handle: string;
  heading: string;
  tag: string;
}) {
  const page = isShopifyConfigured() ? await getPage(handle).catch(() => null) : null;

  return (
    <section>
      <div className="section-head">
        <div className="section-tag">{tag}</div>
        <h2>{heading}</h2>
      </div>
      {page?.body ? (
        <div className="policy-body" dangerouslySetInnerHTML={{ __html: page.body }} />
      ) : (
        <p style={{ textAlign: "center", color: "var(--muted)" }}>
          This content is temporarily unavailable. Please{" "}
          <a href="/contact" style={{ color: "var(--lime)", textDecoration: "underline" }}>
            contact us
          </a>{" "}
          if you need it right away.
        </p>
      )}
    </section>
  );
}
