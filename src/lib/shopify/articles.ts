import { shopifyFetch } from "./client";

export type BlogArticle = {
  title: string;
  handle: string;
  publishedAt: string;
  excerpt: string | null;
  /** Most articles have no excerpt set, so the body stands in for one. */
  content: string | null;
  image: { url: string; altText: string | null } | null;
};

type ArticlesResponse = {
  blog: {
    articles: {
      nodes: BlogArticle[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  } | null;
};

const ARTICLES_QUERY = /* GraphQL */ `
  query BlogArticles($handle: String!, $after: String) {
    blog(handle: $handle) {
      articles(first: 50, sortKey: PUBLISHED_AT, reverse: true, after: $after) {
        nodes {
          title
          handle
          publishedAt
          excerpt
          content(truncateAt: 220)
          image {
            url
            altText
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

/**
 * Every article on the blog, newest first. The page used to render a hand-kept
 * list of thirteen while the blog held seventy-eight, so most of the writing
 * was unreachable from the site. Paged because the Storefront API caps a single
 * request at 50.
 */
export async function getArticles(limit = 250): Promise<BlogArticle[]> {
  const out: BlogArticle[] = [];
  let after: string | null = null;

  while (out.length < limit) {
    const data: ArticlesResponse = await shopifyFetch<ArticlesResponse>({
      query: ARTICLES_QUERY,
      variables: { handle: "news", after },
      revalidate: 1800,
    });

    const page = data.blog?.articles;
    if (!page) break;

    out.push(...page.nodes);
    if (!page.pageInfo.hasNextPage || !page.pageInfo.endCursor) break;
    after = page.pageInfo.endCursor;
  }

  return out.slice(0, limit);
}
