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
 * scope. Rather than hard-code whether it is granted, ask for it and remember
 * the answer: if the scope is turned on in Shopify later, the next cold start
 * picks it up with no redeploy, and until then queries quietly go without.
 */
let inventoryScopeGranted: boolean | null = null;

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

export function hasInventoryScope(): boolean {
  return inventoryScopeGranted === true;
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
  const sentQuery =
    asksForInventory && inventoryScopeGranted === false ? withoutInventory(query) : query;

  let json = await send(JSON.stringify({ query: sentQuery, variables }));

  if (json.errors && asksForInventory && isInventoryScopeError(json.errors)) {
    inventoryScopeGranted = false;
    json = await send(JSON.stringify({ query: withoutInventory(query), variables }));
  } else if (!json.errors && asksForInventory && sentQuery === query) {
    inventoryScopeGranted = true;
  }

  if (json.errors) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join("\n"));
  }

  return json.data as T;
}
