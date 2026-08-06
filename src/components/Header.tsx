import Image from "next/image";
import Link from "next/link";
import { getCart } from "@/lib/shopify/cart";
import { isShopifyConfigured } from "@/lib/shopify/client";

type NavLeaf = { label: string; href: string; external?: boolean };
type NavItem = NavLeaf | { label: string; children: NavLeaf[] };

const NAV: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Athlete & Coach Training", href: "/video-assessment" },
  { label: "Clinics", href: "/clinics" },
  { label: "Velocity Leaderboard", href: "/leaderboard" },
  { label: "Shop Equipment", href: "/shop" },
  { label: "Books", href: "/books" },
  { label: "Articles", href: "/articles" },
  { label: "Contact", href: "/contact" },
];

function isDropdown(item: NavItem): item is { label: string; children: NavLeaf[] } {
  return "children" in item;
}

function NavLink({ item }: { item: NavLeaf }) {
  return item.external ? (
    <a href={item.href} target="_blank" rel="noopener">
      {item.label}
    </a>
  ) : (
    <Link href={item.href}>{item.label}</Link>
  );
}

export default async function Header() {
  const cart = isShopifyConfigured() ? await getCart().catch(() => null) : null;
  const count = cart?.totalQuantity ?? 0;

  return (
    <header className="site-header">
      <nav>
        <Link href="/" className="logo">
          <Image
            src="https://highlevelthrowing.com/cdn/shop/files/HLT-logo.png?v=1692283784&width=200"
            alt="High Level Throwing"
            width={140}
            height={40}
            className="logo-img"
            priority
          />
        </Link>
        <div className="navlinks">
          {NAV.map((item) =>
            isDropdown(item) ? (
              <div className="nav-item" key={item.label}>
                <button type="button" className="nav-item-trigger">
                  {item.label} <span className="caret">▾</span>
                </button>
                <div className="nav-dropdown">
                  <div className="nav-dropdown-inner">
                    {item.children.map((child) => (
                      <NavLink item={child} key={child.label} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <NavLink item={item} key={item.label} />
            )
          )}
        </div>
        <div className="nav-right">
          <Link href="/velocity-tracker" className="velocity-tracker-link" aria-label="Velocity Tracker">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="6" y1="20" x2="6" y2="12" />
              <line x1="12" y1="20" x2="12" y2="6" />
              <line x1="18" y1="20" x2="18" y2="10" />
            </svg>
          </Link>
          <Link href="/cart" className="cart-link" aria-label="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {count > 0 && <span className="cart-count">{count}</span>}
          </Link>
          <Link className="nav-cta" href="/contact">
            Talk to Us
          </Link>
        </div>
      </nav>
    </header>
  );
}
