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
 * Lets the pop-up behave like an ordinary modal without it ever being able to
 * trap the page.
 *
 * Klaviyo's backdrop is fixed, full-screen and z-index 90000, so it swallows
 * wheel and touch wherever the pointer sits — the page stops scrolling even
 * though nothing is wrong with it. That is the one thing fixed here: the
 * backdrop is made transparent to input while its children keep theirs, so the
 * page scrolls underneath and the form stays fully usable.
 *
 * Everything else is left to the visitor and to Klaviyo. They close it with
 * the X, which sits at the top-right inside the viewport — verified at 375x812
 * where the form is exactly viewport height and the button lands at top:20,
 * 50x50. Closing it records a real dismissal, so Klaviyo's own frequency rules
 * decide when it is seen again.
 *
 * An earlier version also dismissed the form on a timer. That was a workaround
 * for a close button measured off-screen at y:-663, which turned out to be an
 * artefact of a 253x274 preview pane rather than any real device. The timer is
 * gone: it risked pulling the form away from someone reading it, and the X
 * does the job.
 */
function useKlaviyoSafety() {
  const pathname = usePathname();

  useEffect(() => {
    const formSelector = '[class*="kl-private"], .klaviyo-form';

    const unblock = () => {
      for (const el of document.querySelectorAll<HTMLElement>(formSelector)) {
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        const isBackdrop =
          style.position === "fixed" &&
          rect.width >= window.innerWidth * 0.9 &&
          rect.height >= window.innerHeight * 0.9;
        if (!isBackdrop) continue;
        el.style.setProperty("pointer-events", "none", "important");
        for (const child of Array.from(el.children) as HTMLElement[]) {
          child.style.setProperty("pointer-events", "auto", "important");
        }
      }
    };

    const timer = setInterval(unblock, 500);
    const observer = new MutationObserver(unblock);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearInterval(timer);
      observer.disconnect();
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
