"use client";

import { trackBeginCheckout } from "@/lib/tracking";

export type CheckoutItem = {
  id: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
};

/**
 * Reports InitiateCheckout / begin_checkout on the way out to Shopify.
 *
 * The purchase itself is left to Shopify's own web pixels, which fire on the
 * checkout it hosts — sending a second purchase event from here would
 * double-count conversions.
 */
export default function CheckoutButton({
  href,
  items,
  total,
  currency,
}: {
  href: string;
  items: CheckoutItem[];
  total: number;
  currency: string;
}) {
  return (
    <a
      className="btn btn-primary"
      href={href}
      onClick={() => trackBeginCheckout(items, total, currency)}
      style={{ display: "block", textAlign: "center", marginTop: 16 }}
    >
      Checkout
    </a>
  );
}
