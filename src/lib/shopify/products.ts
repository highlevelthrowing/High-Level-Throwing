import { shopifyFetch } from "./client";
import { GET_COLLECTION_PRODUCTS_QUERY, GET_PRODUCT_BY_HANDLE_QUERY, GET_PRODUCTS_QUERY } from "./queries";
import type { Product, ProductMedia, ShopifyImage } from "./types";

type RawMediaNode = {
  mediaContentType: string;
  previewImage: ShopifyImage | null;
  image?: ShopifyImage;
  sources?: { url: string; mimeType: string }[];
};

type RawProduct = Omit<Product, "images" | "variants" | "media"> & {
  images: { nodes: Product["images"] };
  variants: { nodes: Product["variants"] };
  media: { nodes: RawMediaNode[] };
};

function normalizeMedia(nodes: RawMediaNode[]): ProductMedia[] {
  return nodes.flatMap((node): ProductMedia[] => {
    if (node.mediaContentType === "IMAGE" && node.image) {
      return [{ type: "IMAGE", image: node.image }];
    }
    if (node.mediaContentType === "VIDEO" && node.sources?.length) {
      return [{ type: "VIDEO", previewImage: node.previewImage, sources: node.sources }];
    }
    return [];
  });
}

function normalizeProduct(raw: RawProduct): Product {
  return {
    ...raw,
    images: raw.images.nodes,
    variants: raw.variants.nodes,
    media: normalizeMedia(raw.media.nodes),
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
// specific teams/orgs. Filtered by tag alone: some legitimate equipment
// (e.g. the Slime Green/Hot Pink lightning bands) has a blank product_type in
// Shopify, so requiring product_type:Equipment incorrectly excluded them.
export const SHOP_EQUIPMENT_QUERY = "tag:'SHOP EQUIPMENT'";

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
