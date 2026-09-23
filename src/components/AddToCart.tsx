"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/shopify/cart";
import type { ProductVariant } from "@/lib/shopify/types";

// Clinic sessions and video assessments are sold with the athlete's details
// attached to the line item. The Shopify theme collects these via the Globo
// Product Options app and stores them under these keys, so orders placed here
// match the format the existing fulfilment process already reads.
const GPO_OPTION_SET = "747605";

export default function AddToCart({
  variants,
  collectsAthleteDetails = false,
}: {
  variants: ProductVariant[];
  collectsAthleteDetails?: boolean;
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
