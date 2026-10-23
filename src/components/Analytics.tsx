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
  // Everywhere. This was a list of pages with a Buy button on them, because a
  // discount modal over Add to Cart blocks the purchase it is meant to
  // encourage. It is now the whole site, for a worse reason found on an
  // article page: Klaviyo's pop-up lays a fixed full-screen backdrop at
  // z-index 90000 over the page, which swallows wheel and touch events, and
  // the form itself is ~957px tall. In any viewport shorter than that the
  // close button scrolls off the top — measured at y:-663 — so the reader can
  // neither scroll the page nor reach the X. That is a dead end, not an offer.
  //
  // Suppressing the form is a class on <body>, not a missing script: Klaviyo
  // still loads everywhere and every event still reaches it. Only the modal is
  // hidden, and the sweep below then clears Klaviyo's scroll lock because no
  // form is visible behind it.
  //
  // To bring the pop-up back on a subset of pages, return false for those
  // paths here — but re-check the close button against a 375px-tall viewport
  // before doing it.
  void pathname;
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
