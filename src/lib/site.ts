export const SITE_URL = "https://www.highlevelthrowing.com";

export const SITE_NAME = "High Level Throwing®";

export const SITE_DESCRIPTION =
  "High Level Throwing® — nationally recognized clinics, college consulting, video assessments and training gear for baseball and softball athletes.";

/**
 * Turns a product's own copy into a meta description. Shopify holds real
 * descriptions for every product, so deriving from them keeps each page
 * distinct and in sync with the store rather than freezing hand-written text
 * that goes stale.
 */
export function metaDescription(source: string | null | undefined, fallback = SITE_DESCRIPTION): string {
  const text = (source ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;|&rsquo;/gi, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/gi, '"')
    .replace(/\s+/g, " ")
    .trim()
    // Several descriptions open with this heading from the product template.
    .replace(/^About this item[:\s-]*/i, "")
    .trim();

  if (text.length < 40) return fallback;
  if (text.length <= 155) return text;

  // Trim at a word boundary rather than mid-word.
  const cut = text.slice(0, 155);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 100 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, "")}…`;
}
