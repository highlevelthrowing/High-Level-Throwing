import { shopifyFetch } from "./client";
import { GET_COLLECTION_PRODUCTS_QUERY, GET_PRODUCT_BY_HANDLE_QUERY, GET_PRODUCTS_QUERY } from "./queries";
import type { Product } from "./types";

type RawProduct = Omit<Product, "images" | "variants"> & {
  images: { nodes: Product["images"] };
  variants: { nodes: Product["variants"] };
};

function normalizeProduct(raw: RawProduct): Product {
  return {
    ...raw,
    images: raw.images.nodes,
    variants: raw.variants.nodes,
  };
}

export async function getProducts(first = 24, query?: string): Promise<Product[]> {
  const data = await shopifyFetch<{ products: { nodes: RawProduct[] } }>({
    query: GET_PRODUCTS_QUERY,
    variables: { first, query },
    revalidate: 60,
  });
  return data.products.nodes.map(normalizeProduct);
}

// Real, publicly-purchasable physical equipment — excludes digital books/ebooks,
// training programs, coaching sessions, and one-off custom purchase links for
// specific teams/orgs (which share the "Equipment" product type but aren't
// meant for general shop browsing).
export const SHOP_EQUIPMENT_QUERY = "product_type:Equipment AND tag:'SHOP EQUIPMENT'";

export async function getProductByHandle(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<{ product: RawProduct | null }>({
    query: GET_PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
    revalidate: 60,
  });
  return data.product ? normalizeProduct(data.product) : null;
}

export async function getCollectionProducts(handle: string, first = 24): Promise<Product[]> {
  const data = await shopifyFetch<{ collection: { products: { nodes: RawProduct[] } } | null }>({
    query: GET_COLLECTION_PRODUCTS_QUERY,
    variables: { handle, first },
    revalidate: 60,
  });
  return data.collection ? data.collection.products.nodes.map(normalizeProduct) : [];
}
