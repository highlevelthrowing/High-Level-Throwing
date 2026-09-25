"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/shopify/cart";
import { trackAddedToCart } from "@/lib/klaviyo";
import { trackAddToCart } from "@/lib/tracking";
import type { ProductVariant } from "@/lib/shopify/types";

// Clinic sessions and video assessments are sold with the athlete's details
// attached to the line item. The Shopify theme collects these via the Globo
// Product Options app and stores them under these keys, so orders placed here
// match the format the existing fulfilment process already reads.
const GPO_OPTION_SET = "747605";

// Clinic sessions are capped at 18 spots, so one order can never exceed that.
const MAX_PER_ORDER = 18;

export default function AddToCart({
  variants,
  collectsAthleteDetails = false,
  product,
}: {
  variants: ProductVariant[];
  collectsAthleteDetails?: boolean;
  /** Passed through to Klaviyo so cart-abandonment flows have something to say. */
  product?: { title: string; handle: string; image?: string | null };
}) {
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const [athlete, setAthlete] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? variants[0];

  // Spots left, when the token's inventory scope lets us read it. Without it
  // this is undefined and only the per-order ceiling applies; Shopify still
  // refuses to oversell at checkout because every session is DENY on stockout.
  const remaining = selectedVariant?.quantityAvailable;
  const knowsRemaining = typeof remaining === "number" && remaining > 0;
  const maxQuantity = knowsRemaining
    ? Math.max(1, Math.min(MAX_PER_ORDER, remaining))
    : MAX_PER_ORDER;
  const atMax = quantity >= maxQuantity;

  // Switching to a variant with fewer spots left must pull the chosen quantity
  // down with it, or the cap could be stepped around by picking a fuller
  // session first.
  useEffect(() => {
    setQuantity((q) => Math.min(q, maxQuantity));
  }, [maxQuantity]);

  function handleAdd() {
    if (!selectedVariant) return;
    if (collectsAthleteDetails && (athlete.trim() === "" || email.trim() === "")) {
      setError("Please add the athlete's name and age, and an email.");
      return;
    }
    setError("");
    startTransition(async () => {
      await addToCart(
        selectedVariant.id,
        quantity,
        collectsAthleteDetails
          ? [
              { key: "_has_gpo", value: GPO_OPTION_SET },
              { key: "text-1", value: athlete },
              { key: "email-1", value: email },
              { key: "textarea-1", value: notes },
            ]
          : undefined
      );
      if (product) {
        trackAddToCart({
          id: product.handle,
          name: product.title,
          price: Number(selectedVariant.price.amount),
          currency: selectedVariant.price.currencyCode,
          quantity,
        });
        trackAddedToCart(
          {
            title: product.title,
            handle: product.handle,
            price: Number(selectedVariant.price.amount),
            currency: selectedVariant.price.currencyCode,
            quantity,
            image: product.image,
            variantTitle: selectedVariant.title,
          },
          collectsAthleteDetails ? email.trim() || undefined : undefined
        );
      }
      setAdded(true);
      router.refresh();
    });
  }

  const fieldStyle = {
    background: "var(--card)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "12px 16px",
    width: "100%",
    fontSize: "0.95rem",
    fontFamily: "inherit",
  } as const;

  return (
    <div>
      {collectsAthleteDetails && (
        <div style={{ marginBottom: 22, display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 800, fontSize: "0.85rem" }}>Athlete Name and Age</span>
            <input
              type="text"
              value={athlete}
              onChange={(e) => setAthlete(e.target.value)}
              placeholder="Athlete name and Age"
              style={fieldStyle}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 800, fontSize: "0.85rem" }}>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email"
              style={fieldStyle}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 800, fontSize: "0.85rem" }}>Additional notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              style={fieldStyle}
            />
          </label>
          {error && (
            <p style={{ color: "var(--pink)", fontSize: "0.85rem", margin: 0 }}>{error}</p>
          )}
        </div>
      )}
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
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
            disabled={atMax}
            aria-label="Increase quantity"
          >
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

      {knowsRemaining && (
        <p className={`spots-left${remaining <= 5 ? " spots-left--low" : ""}`} role="status">
          {remaining === 1 ? "1 spot left" : `${remaining} spots left`}
        </p>
      )}
    </div>
  );
}
