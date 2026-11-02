/**
 * Meta and Google mid-funnel events.
 *
 * Purchase is deliberately NOT sent from here. The order only exists after
 * checkout on Shopify's domain, where Shopify's own web pixels already report
 * it — firing a second purchase event would double-count conversions and
 * corrupt ROAS reporting.
 */

type Item = {
  id: string;
  name: string;
  price: number;
  currency: string;
  quantity?: number;
};

function meta(event: string, payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.fbq?.("track", event, payload);
}

function google(event: string, payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, payload);
}

export function trackViewItem(item: Item) {
  meta("ViewContent", {
    content_ids: [item.id],
    content_name: item.name,
    content_type: "product",
    value: item.price,
    currency: item.currency,
  });

  google("view_item", {
    currency: item.currency,
    value: item.price,
    items: [{ item_id: item.id, item_name: item.name, price: item.price }],
  });
}

export function trackAddToCart(item: Item) {
  const quantity = item.quantity ?? 1;
  const value = item.price * quantity;

  meta("AddToCart", {
    content_ids: [item.id],
    content_name: item.name,
    content_type: "product",
    contents: [{ id: item.id, quantity }],
    value,
    currency: item.currency,
  });

  google("add_to_cart", {
    currency: item.currency,
    value,
    items: [{ item_id: item.id, item_name: item.name, price: item.price, quantity }],
  });
}

/**
 * Clinic registrations and the newsletter signup are the lead events this site
 * generates outside of a purchase. Neither platform can optimize ad delivery
 * toward them without this — view/add-to-cart alone isn't the thing being
 * advertised.
 */
export function trackLead(params: {
  leadType: string;
  label?: string;
  value?: number;
  currency?: string;
}) {
  const { leadType, label, value, currency = "USD" } = params;

  meta("Lead", {
    content_name: label ?? leadType,
    content_category: leadType,
    ...(value !== undefined ? { value, currency } : {}),
  });

  google("generate_lead", {
    lead_type: leadType,
    ...(label ? { lead_label: label } : {}),
    ...(value !== undefined ? { value, currency } : {}),
  });
}

export function trackBeginCheckout(items: Item[], total: number, currency: string) {
  meta("InitiateCheckout", {
    content_ids: items.map((i) => i.id),
    contents: items.map((i) => ({ id: i.id, quantity: i.quantity ?? 1 })),
    num_items: items.reduce((n, i) => n + (i.quantity ?? 1), 0),
    value: total,
    currency,
  });

  google("begin_checkout", {
    currency,
    value: total,
    items: items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity ?? 1,
    })),
  });
}
