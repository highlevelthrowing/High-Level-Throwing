import Image from "next/image";
import Link from "next/link";

const QUICK_LINKS = [
  { label: "Search", href: "/search" },
  { label: "Terms Of Service", href: "/terms-of-service" },
  { label: "Shipping", href: "/shipping" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Refund Policy", href: "/refund-policy" },
];

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/HighLevelThrowing",
    path: "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/highlevelthrowinghlt",
    path: "M12 2c2.7 0 3.1 0 4.1.1 1 .1 1.7.2 2.3.5.6.2 1.1.6 1.6 1.1.5.5.8 1 1.1 1.6.2.6.4 1.3.5 2.3.1 1 .1 1.4.1 4.1s0 3.1-.1 4.1c-.1 1-.2 1.7-.5 2.3a4.6 4.6 0 0 1-1.1 1.6c-.5.5-1 .8-1.6 1.1-.6.2-1.3.4-2.3.5-1 .1-1.4.1-4.1.1s-3.1 0-4.1-.1c-1-.1-1.7-.2-2.3-.5a4.6 4.6 0 0 1-1.6-1.1 4.6 4.6 0 0 1-1.1-1.6c-.2-.6-.4-1.3-.5-2.3C2 15.1 2 14.7 2 12s0-3.1.1-4.1c.1-1 .2-1.7.5-2.3.2-.6.6-1.1 1.1-1.6.5-.5 1-.8 1.6-1.1.6-.2 1.3-.4 2.3-.5C8.9 2 9.3 2 12 2Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4ZM17.4 6a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z",
  },
  {
    label: "X",
    href: "https://twitter.com/Wass_Strength",
    path: "M18.9 3H22l-7.2 8.2L23 21h-6.9l-5.4-6.6L4.6 21H1.5l7.7-8.8L1 3h7l4.9 6L18.9 3Zm-1.2 16h1.7L7.4 5h-1.8l12.1 14Z",
  },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-quicklinks-label">Quick links</div>
      <div className="footer-quicklinks">
        {QUICK_LINKS.map((link) => (
          <Link href={link.href} key={link.label}>
            {link.label}
          </Link>
        ))}
      </div>

      <div className="footer-glow-row">
        <span className="footer-glow-line" />
        <Image
          src="https://highlevelthrowing.com/cdn/shop/files/HLT-logo.png?v=1692283784&width=200"
          alt="High Level Throwing"
          width={88}
          height={88}
          className="footer-logo-badge"
        />
        <span className="footer-glow-line" />
      </div>

      <div className="footer-social">
        {SOCIAL_LINKS.map((social) => (
          <a href={social.href} key={social.label} target="_blank" rel="noopener" aria-label={social.label}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d={social.path} />
            </svg>
          </a>
        ))}
      </div>

      <p>
        High Level Throwing® —{" "}
        <a href="https://www.highlevelthrowing.com" target="_blank" rel="noopener">
          highlevelthrowing.com
        </a>
      </p>

      <div className="footer-legal">
        <span>© {new Date().getFullYear()} High Level Throwing</span>
        <Link href="/refund-policy">Refund Policy</Link>
        <Link href="/privacy-policy">Privacy Policy</Link>
        <Link href="/terms-of-service">Terms of Service</Link>
        <Link href="/shipping">Shipping Policy</Link>
      </div>
    </footer>
  );
}
