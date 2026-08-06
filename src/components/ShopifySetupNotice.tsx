export default function ShopifySetupNotice() {
  return (
    <section>
      <div className="section-head">
        <div className="section-tag">Setup Required</div>
        <h2>Connect this storefront to Shopify</h2>
        <p>
          This page pulls live product data from your Shopify store using the Storefront API, but no credentials are
          configured yet.
        </p>
      </div>
      <div className="calc-card" style={{ textAlign: "left" }}>
        <p style={{ color: "var(--muted)", marginBottom: 16 }}>
          Add these two values to <code style={{ color: "var(--lime)" }}>storefront/.env.local</code> and restart the
          dev server:
        </p>
        <ul className="feature-list">
          <li>
            <code style={{ color: "var(--text)" }}>SHOPIFY_STORE_DOMAIN</code> — e.g.{" "}
            <code style={{ color: "var(--lime)" }}>highlevelthrowing.myshopify.com</code>
          </li>
          <li>
            <code style={{ color: "var(--text)" }}>SHOPIFY_STOREFRONT_ACCESS_TOKEN</code> — from a Storefront API
            access token created in Shopify Admin → Settings → Apps and sales channels → Develop apps
          </li>
        </ul>
        <p style={{ color: "var(--muted)" }}>See the project README for step-by-step instructions.</p>
      </div>
    </section>
  );
}
