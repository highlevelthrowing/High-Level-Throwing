"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

/**
 * The same handful of questions arrive through the contact form every week.
 * They are answered here with a fixed script rather than a model: the answers
 * quote prices and the refund policy, so they have to be right every time, and
 * the real job is pointing someone at the page that finishes the job.
 *
 * Edit this list to change the widget — nothing else needs touching.
 */
const FAQS: { q: string; a: string; href?: string; cta?: string }[] = [
  {
    q: "My son or daughter needs help with their mechanics — where do we start?",
    a: "A Video Assessment is the place to begin. You send a throwing video, and we come back with a High Level Throwing® Score, a full mechanics breakdown in 24–48 hours and a 12-week program built around what we find — so you are working on the right thing rather than guessing.",
    href: "/video-assessment",
    cta: "Start a Video Assessment",
  },
  {
    q: "I'm a coach — where should I start?",
    a: "Start with the digital books. They lay out the High Level Throwing® system the same way we teach it at clinics — arm care, patterning, drills and progressions — so you can run it with your own athletes straight away. Baseball and softball editions, and youth versions of both.",
    href: "/books",
    cta: "Browse the books",
  },
  {
    q: "Where are your upcoming clinics?",
    a: "Every clinic we have scheduled is listed with its dates, sessions and age groups. Registration opens on each clinic's own page.",
    href: "/clinics",
    cta: "See the clinic schedule",
  },
  {
    q: "Can you bring a clinic to my team or facility?",
    a: "Yes — we run Foundational and Advanced clinics on-site for rec leagues, travel organizations, facilities and colleges, baseball and softball, all ages. Tell us where you are and we'll put together a plan.",
    href: "/contact",
    cta: "Request a clinic",
  },
  {
    q: "What is a Video Assessment?",
    a: "You submit a throwing video and get back a High Level Throwing® Score, a full mechanics breakdown in 24–48 hours and a 12-week digital throwing program. Team and full-roster pricing is available.",
    href: "/video-assessment",
    cta: "Start an assessment",
  },
  {
    q: "What are Lightning Ball Plyos and do you ship?",
    a: "Weighted plyo balls for arm care, patterning and velocity, in baseball and softball sets, each with a digital training guide. We ship anywhere in the US.",
    href: "/shop",
    cta: "Shop equipment",
  },
  {
    q: "How do I get on the velocity leaderboard?",
    a: "Athletes 13 and older are eligible. Throw at a clinic or submit a verified velocity and you'll appear on the live leaderboard.",
    href: "/leaderboard",
    cta: "View the leaderboard",
  },
  {
    q: "I bought a book — where is my download?",
    a: "Your download link is in the confirmation email sent at purchase, under \"Your downloads are ready\". If you can't find it, message us with the name on the order and we'll resend it the same day.",
    href: "/contact",
    cta: "Ask us to resend it",
  },
  {
    q: "Something else",
    a: "Send us a note with what you need and we'll come back to you.",
    href: "/contact",
    cta: "Contact us",
  },
];

const SEEN_KEY = "hlt-help-seen";
// Klaviyo's discount overlay fires on entry. Opening on top of it means two
// panels competing, so wait until that has had its moment.
const AUTO_OPEN_MS = 7000;

/** Pages with a Buy button: the launcher stays, but nothing opens itself over
 *  a purchase. The panel is nearly full width on a phone and would cover Add to
 *  Cart outright. */
function blocksPurchase(pathname: string): boolean {
  return (
    pathname.startsWith("/products/") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/pages/")
  );
}

/**
 * Registration pages get no widget at all, not just no auto-open. Every answer
 * in it routes somewhere else — clinics, books, the shop — so to someone who
 * has already chosen a session and started filling in the form it is only an
 * exit. Nothing in the list answers what they would actually ask at that point,
 * which is about that clinic: age group, times, transfers.
 *
 * Shopify's checkout is a different domain and never had this on it.
 */
function isRegistrationPage(pathname: string): boolean {
  const path = decodeURIComponent(pathname);
  // the registration page itself
  if (path.startsWith("/pages/") && /clinic/i.test(path)) return true;
  // and the session product behind its buttons, which is where payment happens
  if (/^\/products\/hlt-clinic/i.test(path)) return true;
  return false;
}

export default function HelpWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (blocksPurchase(pathname)) return;
    let seen = true;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // private window or storage blocked: behave as though it has been seen
      // rather than reopening on every navigation
    }
    if (seen) return;
    const t = setTimeout(() => {
      setOpen(true);
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
    }, AUTO_OPEN_MS);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
    setActive(null);
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
  }

  if (isRegistrationPage(pathname)) return null;

  return (
    <>
      {open && (
        <div
          className="help-panel"
          role="dialog"
          aria-label="How can we help?"
          tabIndex={-1}
          ref={panelRef}
        >
          <div className="help-head">
            <span>How can we help?</span>
            <button type="button" className="help-x" onClick={close} aria-label="Close">
              ×
            </button>
          </div>

          {active === null ? (
            <ul className="help-list">
              {FAQS.map((f, i) => (
                <li key={f.q}>
                  <button type="button" onClick={() => setActive(i)}>
                    {f.q}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="help-answer">
              <button type="button" className="help-back" onClick={() => setActive(null)}>
                ← All questions
              </button>
              <h4>{FAQS[active].q}</h4>
              <p>{FAQS[active].a}</p>
              {FAQS[active].href && (
                <Link className="btn btn-primary help-cta" href={FAQS[active].href} onClick={close}>
                  {FAQS[active].cta} →
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        className="help-launcher"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
      >
        <svg
          className="help-launcher-icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          {/* Coach in a ball cap, solid rather than outlined because this
              renders at 20px. The cap is left plain: a bolt or a star in it
              is about 3px tall here and reads as a smudge, not a mark. */}
          <circle cx="12" cy="2.5" r="1.25" fill="currentColor" />
          <path
            fill="currentColor"
            d="M12 3.6c-3.55 0-6.15 2.6-6.15 6.1v1.25h12.3V9.7c0-3.5-2.6-6.1-6.15-6.1z"
          />
          <path
            fill="currentColor"
            d="M4.5 11.35h15c.62 0 1.1.47 1.1 1.05s-.48 1.05-1.1 1.05h-15c-.62 0-1.1-.47-1.1-1.05s.48-1.05 1.1-1.05z"
          />
          <path
            d="M7.3 13.6v1.3a4.7 4.7 0 0 0 9.4 0v-1.3"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M4.2 21.6a7.8 7.8 0 0 1 15.6 0"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
        <span>{open ? "Close" : "How can we help?"}</span>
      </button>
    </>
  );
}
