import { shopifyFetch } from "./client";
import { GET_PAGE_QUERY } from "./queries";

export type ShopifyPage = {
  title: string;
  body: string;
};

export async function getPage(handle: string): Promise<ShopifyPage | null> {
  const data = await shopifyFetch<{ page: ShopifyPage | null }>({
    query: GET_PAGE_QUERY,
    variables: { handle },
    revalidate: 3600,
  });
  return data.page;
}
