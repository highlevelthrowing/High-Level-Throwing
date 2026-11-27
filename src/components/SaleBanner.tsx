import Link from "next/link";

/**
 * Sale banner. Rendered at h1 scale but deliberately NOT an <h1> element —
 * every page it sits on already has one real h1, and a second would split that
 * page's heading signal.
 */
export default function SaleBanner() {
  return (
    <Link href="/shop" className="bf-banner">
      <span className="bf-banner-title">Black Friday Sale &mdash; 30% Off</span>
      <span className="bf-banner-sub">
        Books &middot; Lightning Ball Plyos &middot; Lightning Bands &middot; Video Assessment
      </span>
    </Link>
  );
}
