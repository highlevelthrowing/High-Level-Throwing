const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

export class ShopifyNotConfiguredError extends Error {
  constructor() {
    super(
      "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local."
    );
    this.name = "ShopifyNotConfiguredError";
  }
}

export function isShopifyConfigured(): boolean {
  return Boolean(
    process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  );
}

/**
 * quantityAvailable needs the token's unauthenticated_read_product_inventory
 * scope. It is granted, but rather than depend on that staying true, a query
 * refused for want of it is retried once without the field. No per-server
 * memory of the outcome: that made servers disagree about whether to ask, so
 * the same page showed a count on one request and not the next.
 */
const INVENTORY_FIELD = /^\s*quantityAvailable\s*$/m;

function withoutInventory(query: string): string {
  return query.replace(INVENTORY_FIELD, "");
}

function isInventoryScopeError(errors: { message: string }[]): boolean {
  return errors.some(
    (e) =>
      e.message.includes("quantityAvailable") &&
      e.message.includes("unauthenticated_read_product_inventory")
  );
}

export async function shopifyFetch<T>({
  query,
  variables,
  cache = "force-cache",
  revalidate,
}: {
  query: string;
  variables?: Record<string, unknown>;
  cache?: RequestCache;
  revalidate?: number;
}): Promise<T> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!domain || !token) {
    throw new ShopifyNotConfiguredError();
  }

  const headers = {
    "Content-Type": "application/json",
    // Headless-channel private tokens (shpat_*) authenticate with a different
    // header than public storefront tokens.
    ...(token.startsWith("shpat_")
      ? { "Shopify-Storefront-Private-Token": token }
      : { "X-Shopify-Storefront-Access-Token": token }),
  };

  async function send(body: string) {
    const res = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
      method: "POST",
      headers,
      body,
      cache: revalidate === undefined ? cache : undefined,
      next: revalidate === undefined ? undefined : { revalidate },
    });
    return res.json();
  }

  const asksForInventory = INVENTORY_FIELD.test(query);

  let json = await send(JSON.stringify({ query, variables }));

  if (json.errors && asksForInventory && isInventoryScopeError(json.errors)) {
    json = await send(JSON.stringify({ query: withoutInventory(query), variables }));
  }

  if (json.errors) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join("\n"));
  }

  return json.data as T;
}
