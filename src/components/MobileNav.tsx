"use client";

import { useState } from "react";
import Link from "next/link";

export type MobileNavLink = { label: string; href: string; external?: boolean };

export default function MobileNav({ links }: { links: MobileNavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobile-nav">
      <button
        type="button"
        className="mobile-nav-toggle"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`mobile-nav-bars${open ? " is-open" : ""}`} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      {open && (
        <div className="mobile-nav-panel">
          {links.map((link) =>
            link.external ? (
              <a key={link.label} href={link.href} target="_blank" rel="noopener" onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
