"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/shopify/cart";
import type { ProductVariant } from "@/lib/shopify/types";

export default function AddToCart({ variants }: { variants: ProductVariant[] }) {
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const router = useRouter();

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? variants[0];

  function handleAdd() {
    if (!selectedVariant) return;
    startTransition(async () => {
      await addToCart(selectedVariant.id, quantity);
      setAdded(true);
      router.refresh();
    });
  }

  return (
    <div>
      {variants.length > 1 && (
        <div style={{ marginBottom: 20 }}>
          <select
            value={selectedVariantId}
            onChange={(e) => setSelectedVariantId(e.target.value)}
            style={{
              background: "var(--card)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "12px 16px",
              width: "100%",
              fontSize: "0.95rem",
            }}
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id} disabled={!v.availableForSale}>
                {v.title} {!v.availableForSale ? "(Sold out)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="pdp-actions">
        <div className="qty-stepper">
          <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
            −
          </button>
          <span>{quantity}</span>
          <button type="button" onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">
            +
          </button>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAdd}
          disabled={!selectedVariant?.availableForSale || isPending}
        >
          {!selectedVariant?.availableForSale ? "Sold Out" : isPending ? "Adding…" : added ? "Added ✓" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
