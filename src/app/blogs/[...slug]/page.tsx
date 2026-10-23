import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SimpleEmbed from "@/components/SimpleEmbed";
import { getArticle, type FullArticle } from "@/lib/shopify/articles";

const SITE = "https://www.highlevelthrowing.com";
const SHOPIFY_STORE = "https://high-level-throwing.myshopify.com";
const SEGMENT = /^[a-z0-9®–—_.-]+$/i;

function titleFromSlug(slug: string[]): string {
  const last = decodeURIComponent(slug[slug.length - 1] ?? "");
  if (!last) return "Articles";
  const words = last.split("-").filter(Boolean);
  // Small words stay lower case unless they open the title.
  const minor = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "in", "of", "on", "or", "the", "to", "vs", "with"]);
  return words
    .map((word, i) =>
      i > 0 && minor.has(word.toLowerCase()) ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1)
    )
    .join(" ");
}

/**
 * `/blogs/news/some-article` is the only shape that resolves to a real article.
 * Anything else — a blog index, a tag listing — keeps the old embed.
 */
function articleHandle(segments: string[]): { blog: string; handle: string } | null {
  if (segments.length !== 2) return null;
  const [blog, handle] = segments;
  if (!blog || !handle) return null;
  return { blog, handle };
}

function fetchArticleHtml(segments: string[]) {
  const target = `${SHOPIFY_STORE}/blogs/${segments.map(encodeURIComponent).join("/")}`;
  return fetch(target, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; HLTStorefrontEmbed/1.0)" },
    next: { revalidate: 300 },
  }).catch(() => null);
}

/**
 * Shopify titles often already end in the shop name, and the layout adds it
 * again as a template — which rendered "High Level Throwing® | Outfield vs.
 * Infield Throwing Mechanics | High Level Throwing®". Strip only a trailing
 * occurrence, so a title that merely mentions the brand keeps it.
 */
function stripShopSuffix(title: string): string {
  return title.replace(/\s*[|\u2013\u2014-]\s*High Level Throwing(?:®)?\s*$/i, "").trim() || title;
}

/** Collapse markup to plain text for a meta description. */
function toText(html: string, limit = 300): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|#160);/g, " ")
    .replace(/&(?:rsquo|#8217);/g, "’")
    .replace(/&(?:ldquo|#8220);/g, "“")
    .replace(/&(?:rdquo|#8221);/g, "”")
    .replace(/&(?:ndash|#8211);/g, "–")
    .replace(/&(?:mdash|#8212);/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

/**
 * Shopify's body HTML, made safe and responsive to drop into the page.
 *
 * - `<script>` goes. React never executes injected script tags, so leaving them
 *   in would be dead weight; both occurrences are Vimeo's optional player API
 *   and the video iframes play perfectly well without it.
 * - `<meta>` inside a body is meaningless and would be invalid where it lands.
 * - Video iframes (135 Vimeo, 2 YouTube across the blog) keep working, wrapped
 *   so they scale with the column instead of overflowing it on a phone.
 * - Images get native lazy loading and are capped to the column width by CSS.
 */
function prepare(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<meta\b[^>]*>/gi, "")
    .replace(/<iframe\b[^>]*><\/iframe>|<iframe\b[^>]*\/?>/gi, (tag) =>
      `<span class="article-video">${tag.replace(/\s(?:width|height)="[^"]*"/gi, "")}</span>`
    )
    .replace(/<img\b(?![^>]*\bloading=)/gi, '<img loading="lazy" ');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const segments = (slug ?? []).map((s) => decodeURIComponent(s));
  if (!segments.every((s) => SEGMENT.test(s))) {
    return { title: titleFromSlug(segments) };
  }

  const ref = articleHandle(segments);
  const article = ref ? await getArticle(ref.handle, ref.blog).catch(() => null) : null;

  if (!article) {
    return { title: titleFromSlug(segments) };
  }

  const url = `${SITE}/blogs/${segments.map(encodeURIComponent).join("/")}`;
  const description =
    article.seo?.description?.trim() ||
    article.excerpt?.trim() ||
    toText(article.contentHtml, 180);
  const image = article.image?.url;

  return {
    title: stripShopSuffix(article.seo?.title?.trim() || article.title),
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: stripShopSuffix(article.title),
      description,
      publishedTime: article.publishedAt,
      authors: article.author ? [article.author] : undefined,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: stripShopSuffix(article.title),
      description,
      images: image ? [image] : undefined,
    },
  };
}

function ArticleJsonLd({ article, url }: { article: FullArticle; url: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: stripShopSuffix(article.title),
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Person", name: article.author || "Austin Wasserman" },
    publisher: {
      "@type": "Organization",
      name: "High Level Throwing",
      url: SITE,
    },
    ...(article.image?.url ? { image: [article.image.url] } : {}),
    description:
      article.seo?.description?.trim() ||
      article.excerpt?.trim() ||
      toText(article.contentHtml, 200),
  };
  return (
    <script
      type="application/ld+json"
      // Server-rendered constant; no user input reaches this.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Articles live on the Shopify blog. They used to be shown through an iframe
 * onto the theme's rendering, which meant a crawler saw a title and an empty
 * frame — roughly 46,000 words across ninety articles that Google could not
 * read, on a store measuring three search sessions in three weeks.
 *
 * The body now comes from the Storefront API and is rendered as part of this
 * document, so the text is in the HTML, the page scrolls natively, and the
 * metadata describes the article rather than the site. Anything that does not
 * resolve to an article — a blog index, an unexpected path — falls back to the
 * old embed, so no route loses its behaviour.
 */
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const segments = (slug ?? []).map((s) => decodeURIComponent(s));

  if (segments.length === 0 || !segments.every((s) => SEGMENT.test(s))) {
    notFound();
  }

  const ref = articleHandle(segments);
  const article = ref ? await getArticle(ref.handle, ref.blog).catch(() => null) : null;

  if (article?.contentHtml?.trim()) {
    const url = `${SITE}/blogs/${segments.map(encodeURIComponent).join("/")}`;
    return (
      <>
        <ArticleJsonLd article={article} url={url} />
        <article className="article-page">
          <header>
            <span className="article-date">{formatDate(article.publishedAt)}</span>
            <h1>{stripShopSuffix(article.title)}</h1>
            {article.author && <p className="article-byline">By {article.author}</p>}
          </header>
          <div
            className="article-body"
            // Shopify's own article body, cleaned by `prepare` above. The blog
            // is authored by Austin through the Shopify admin, not by visitors.
            dangerouslySetInnerHTML={{ __html: prepare(article.contentHtml) }}
          />
          <footer className="article-foot">
            <a className="btn btn-primary" href="/articles">
              ← All articles
            </a>
          </footer>
        </article>
      </>
    );
  }

  // Nothing resolved through the API — keep the previous behaviour rather than
  // 404ing a page that works today.
  const res = await fetchArticleHtml(segments);
  if (!res || !res.ok) notFound();

  return (
    <SimpleEmbed
      embedKey={`blogs/${slug.join("/")}`}
      iframeTitle={titleFromSlug(segments)}
      height={2400}
    />
  );
}
