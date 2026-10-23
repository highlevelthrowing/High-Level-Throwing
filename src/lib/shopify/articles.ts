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
      // Five minutes, not thirty. A newly published article used to take up to
      // half an hour to appear on /articles, which reads as a failed publish
      // and sends you looking for a bug that is not there. The list is cheap
      // to rebuild and the blog is published to often enough to want it fresh.
      revalidate: 300,
    });

    const page = data.blog?.articles;
    if (!page) break;

    out.push(...page.nodes);
    if (!page.pageInfo.hasNextPage || !page.pageInfo.endCursor) break;
    after = page.pageInfo.endCursor;
  }

  return out.slice(0, limit);
}

export type FullArticle = {
  title: string;
  handle: string;
  publishedAt: string;
  excerpt: string | null;
  contentHtml: string;
  image: { url: string; altText: string | null; width: number | null; height: number | null } | null;
  author: string | null;
  seo: { title: string | null; description: string | null } | null;
};

type ArticleResponse = {
  blog: { articleByHandle: FullArticle | null } | null;
};

const ARTICLE_QUERY = /* GraphQL */ `
  query BlogArticle($blog: String!, $handle: String!) {
    blog(handle: $blog) {
      articleByHandle(handle: $handle) {
        title
        handle
        publishedAt
        excerpt
        contentHtml
        image {
          url
          altText
          width
          height
        }
        authorV2 {
          name
        }
        seo {
          title
          description
        }
      }
    }
  }
`;

/**
 * One article, with its body, so the page can be rendered as real HTML.
 *
 * These pages used to be an iframe onto the Shopify-rendered article, which
 * meant a crawler saw a title and an empty frame — about 46,000 words across
 * ninety articles that Google could not read. The Storefront API does not
 * return the theme's rendering of a page, but it does return `contentHtml`,
 * which is the part that carries the meaning.
 */
export async function getArticle(
  handle: string,
  blog = "news"
): Promise<FullArticle | null> {
  const data = await shopifyFetch<ArticleResponse>({
    query: ARTICLE_QUERY,
    variables: { blog, handle },
    revalidate: 300,
  });
  const article = data.blog?.articleByHandle;
  if (!article) return null;
  // authorV2 arrives as an object; the rest of the app wants a plain name.
  const author = (article as unknown as { authorV2?: { name?: string } }).authorV2?.name ?? null;
  return { ...article, author };
}
