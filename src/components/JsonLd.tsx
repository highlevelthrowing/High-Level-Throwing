/**
 * Emits a JSON-LD block. Rendered from server components, so the markup is in
 * the HTML Google first sees rather than appearing after hydration.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Escaping "<" keeps a stray tag inside product copy from closing the
      // script element early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
