"use client";

import { useEffect, useRef } from "react";
import { trackViewedProduct } from "@/lib/klaviyo";

/**
 * Reports a product view to Klaviyo so browse-abandonment flows have something
 * to trigger on. Rendered on the product page; fires once per product, and
 * again if the visitor navigates to a different product without a reload.
 */
export default function TrackProductView({
  title,
  handle,
  price,
  currency,
  image,
}: {
  title: string;
  handle: string;
  price: number;
  currency: string;
  image?: string | null;
}) {
  const reported = useRef<string | null>(null);

  useEffect(() => {
    if (reported.current === handle) return;
    reported.current = handle;
    trackViewedProduct({ title, handle, price, currency, image });
  }, [title, handle, price, currency, image]);

  return null;
}
