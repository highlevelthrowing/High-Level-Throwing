"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

// These are the same properties the Shopify theme reports to, read off the live
// store so this site and the store stay in one set of numbers. They are public
// identifiers — they appear in the page source of every site that uses them.
const GA4_ID = "G-S44N64NFZ8";
const GOOGLE_ADS_ID = "AW-11034926553";
const META_PIXEL_ID = "901384321293645";
const KLAVIYO_COMPANY_ID = "QP3GE9";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[] };
    _learnq?: unknown[];
  }
}

/**
 * Client-side navigation does not reload the page, so the page_view that fires
 * when the tag first loads is the only one these tools would ever see. Fire one
 * on every route change instead.
 */
function usePageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    window.gtag?.("event", "page_view", {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });

    window.fbq?.("track", "PageView");
  }, [pathname, searchParams]);
}

/**
 * Klaviyo's signup form shows as soon as its script loads, and the form's own
 * timing lives in the Klaviyo account rather than here. Holding the script back
 * until someone has engaged — scrolled, clicked — or 15 seconds have passed
 * keeps the popup from greeting people on arrival while still always firing.
 *
 * Nothing is lost by waiting: _learnq is a queue, so any event pushed before
 * the script arrives (an Added to Cart, an identify) is flushed once it loads.
 */
// Clinic and registration pages are mid-purchase, and a discount pop-up over a
// registration form costs more than it earns. Holding the whole script back
// used to be how that was done, but that also threw away the tracking: every
// Viewed Product on a clinic page sat unsent in _learnq forever. The script now
// loads everywhere and only the form is suppressed here.
function isPopupFreePath(pathname: string): boolean {
  // The home page is the one place the discount pop-up is allowed. Everywhere
  // else it is suppressed, for two reasons found on 2026-10-23: over a Buy
  // button it blocks the purchase it is meant to encourage, and on a phone it
  // traps the page outright — its backdrop is fixed, full-screen and z-index
  // 90000, so it swallows wheel and touch, while the form is ~957px tall so
  // the close button sits above the top of the screen.
  //
  // On the home page both of those are defused by useKlaviyoSafety below: the
  // backdrop stops capturing input, and the form dismisses itself. A visitor
  // sees the offer and the page keeps working either way.
  if (pathname === "/") return false;
  return true;
}

function useDeferredKlaviyo() {
  const pathname = usePathname();

  // Suppressing the form is a class on <body>, not a missing script, so events
  // still reach Klaviyo from these pages. display:none on the wrapper rather
  // than hiding it visually — a Klaviyo modal carries a full-screen backdrop,
  // and anything short of removing it from layout can still swallow a click on
  // a Buy button underneath.
  useEffect(() => {
    const suppress = isPopupFreePath(pathname);
    document.body.classList.toggle("no-klaviyo-forms", suppress);
    return () => document.body.classList.remove("no-klaviyo-forms");
  }, [pathname]);

  useEffect(() => {
    if (document.getElementById("klaviyo-onsite")) return;

    let done = false;

    const load = () => {
      if (done) return;
      done = true;
      cleanup();

      const script = document.createElement("script");
      script.id = "klaviyo-onsite";
      script.async = true;
      script.src = `https://static.klaviyo.com/onsite/js/${KLAVIYO_COMPANY_ID}/klaviyo.js?company_id=${KLAVIYO_COMPANY_ID}`;
      document.head.appendChild(script);
    };

    const onScroll = () => {
      if (window.scrollY > 300) load();
    };

    function cleanup() {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", load);
      clearTimeout(timer);
    }

    const timer = setTimeout(load, 15000);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", load, { once: true });

    return cleanup;
  }, [pathname]);
}


/**
 * How long the pop-up stays on screen before it closes itself. Austin's call:
 * fifteen seconds — long enough to read the offer and start typing, short
 * enough that nobody is left looking at it. The countdown is cancelled
 * outright the moment someone touches the form, so this never interrupts a
 * signup in progress.
 */
const POPUP_VISIBLE_MS = 15_000;

/**
 * Lets the pop-up show without it ever being able to trap the page.
 *
 * Klaviyo's modal does two things that strand a visitor. Its backdrop is
 * fixed, full-screen and z-index 90000, so it swallows wheel and touch
 * wherever the pointer is; and the form is around 957px tall, so on any
 * viewport shorter than that the close button sits above the top of the
 * screen — measured at y:-663 — leaving nothing to dismiss.
 *
 * So: the backdrop is made transparent to input, which keeps the page
 * scrolling underneath while the form itself stays clickable, and the form
 * takes itself away after a few seconds. Austin's rule is that nothing on the
 * site may stop someone scrolling; this keeps the offer and honours that.
 */
function useKlaviyoSafety() {
  const pathname = usePathname();

  useEffect(() => {
    let dismissAt: number | null = null;
    let engaged = false;

    const formSelector = '[class*="kl-private"], .klaviyo-form';

    const visibleForm = () =>
      Array.from(document.querySelectorAll<HTMLElement>(formSelector)).find((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 120 && r.height > 120 && getComputedStyle(el).display !== "none";
      }) ?? null;

    const dismiss = () => {
      // Klaviyo's own close button first — that records the dismissal with
      // them, so their frequency rules keep working.
      const close = document.querySelector<HTMLElement>(".klaviyo-close-form");
      if (close) close.click();

      // Then make sure, in case the click did not take: hide anything still
      // standing and give the page back.
      requestAnimationFrame(() => {
        const still = visibleForm();
        if (still) {
          const root = still.closest<HTMLElement>("div[class*=\"kl-private\"]") ?? still;
          root.style.setProperty("display", "none", "important");
        }
        document.body.classList.remove("klaviyo-prevent-body-scrolling");
      });
    };

    const tick = () => {
      const form = visibleForm();
      if (!form) {
        dismissAt = null;
        return;
      }

      // Stop the backdrop eating scroll. Only the full-screen fixed layer is
      // touched; the form keeps its own pointer events so it stays usable.
      for (const el of document.querySelectorAll<HTMLElement>(formSelector)) {
        const c = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const fullScreen =
          c.position === "fixed" &&
          r.width >= window.innerWidth * 0.9 &&
          r.height >= window.innerHeight * 0.9;
        if (fullScreen) {
          el.style.setProperty("pointer-events", "none", "important");
          for (const child of Array.from(el.children) as HTMLElement[]) {
            child.style.setProperty("pointer-events", "auto", "important");
          }
        }
      }

      // Someone typing their address must never have the form pulled out from
      // under them — collecting the signup is the entire point of showing it.
      // Any focus or input inside the form cancels the countdown for good.
      if (engaged) {
        dismissAt = null;
        return;
      }

      if (dismissAt === null) {
        dismissAt = Date.now() + POPUP_VISIBLE_MS;
      } else if (Date.now() >= dismissAt) {
        dismiss();
        dismissAt = null;
      }
    };

    // Engagement is sticky: once someone has touched the form we leave it
    // alone until they close it or submit.
    const onEngage = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(formSelector)) engaged = true;
    };
    document.addEventListener("focusin", onEngage, true);
    document.addEventListener("input", onEngage, true);
    document.addEventListener("pointerdown", onEngage, true);

    const timer = setInterval(tick, 500);
    const observer = new MutationObserver(tick);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearInterval(timer);
      observer.disconnect();
      document.removeEventListener("focusin", onEngage, true);
      document.removeEventListener("input", onEngage, true);
      document.removeEventListener("pointerdown", onEngage, true);
    };
  }, [pathname]);
}

/**
 * The path list above is maintained by hand and will go stale the first time a
 * page grows a Buy button without anyone thinking of this file. This is the
 * backstop: if a Klaviyo form ever renders on top of a purchase control
 * anywhere, it gets removed from the layout. A list can be wrong; this cannot.
 */
function useBuyButtonGuard() {
  useEffect(() => {
    const BUY = /add to cart|add to bag|buy now|checkout|register now|i want this/i;

    const sweep = () => {
      const forms = document.querySelectorAll<HTMLElement>(
        '[class*="kl-private"], .klaviyo-form'
      );
      if (!forms.length) return;

      const buys = Array.from(document.querySelectorAll<HTMLElement>("button, a"))
        .filter((el) => BUY.test(el.textContent || ""))
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0 && r.height > 0);

      // A lock with no visible form behind it is just a frozen page.
      const anyVisible = Array.from(forms).some((f) => {
        const r = f.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(f).display !== "none";
      });
      if (!anyVisible) {
        document.body.classList.remove("klaviyo-prevent-body-scrolling");
      }

      forms.forEach((form) => {
        const r = form.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        if (!buys.length) return;
        const covers = buys.some(
          (b) => !(r.bottom < b.top || r.top > b.bottom || r.right < b.left || r.left > b.right)
        );
        if (covers) form.style.setProperty("display", "none", "important");
      });
    };

    const observer = new MutationObserver(sweep);
    observer.observe(document.body, { childList: true, subtree: true });
    const onScroll = () => sweep();
    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = setInterval(sweep, 1000);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      clearInterval(timer);
    };
  }, []);
}

export default function Analytics() {
  usePageViews();
  useBuyButtonGuard();
  useKlaviyoSafety();
  useDeferredKlaviyo();

  return (
    <>
      {/* Google Analytics 4 and Google Ads share one gtag load. */}
      <Script
        id="gtag-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA4_ID}');
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>

      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>

      {/* Klaviyo is loaded by useDeferredKlaviyo below rather than here, so the
          signup popup does not fire the instant a page opens. */}
    </>
  );
}
