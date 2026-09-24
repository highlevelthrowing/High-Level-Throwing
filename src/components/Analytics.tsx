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
 * until someone has actually engaged — scrolled, clicked, or stayed a while —
 * keeps the popup from greeting people on arrival.
 *
 * Nothing is lost by waiting: _learnq is a queue, so any event pushed before
 * the script arrives (an Added to Cart, an identify) is flushed once it loads.
 */
function useDeferredKlaviyo() {
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
      if (window.scrollY > 600) load();
    };

    function cleanup() {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", load);
      clearTimeout(timer);
    }

    const timer = setTimeout(load, 20000);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", load, { once: true });

    return cleanup;
  }, []);
}

export default function Analytics() {
  usePageViews();
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
