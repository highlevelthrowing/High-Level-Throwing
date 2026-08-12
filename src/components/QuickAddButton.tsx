"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/shopify/cart";

export default function QuickAddButton({
  variantId,
  availableForSale,
}: {
  variantId: string;
  availableForSale: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const router = useRouter();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await addToCart(variantId, 1);
      setAdded(true);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      className="quick-add-btn"
      onClick={handleClick}
      disabled={!availableForSale || isPending}
    >
      {!availableForSale ? "Sold Out" : isPending ? "Adding…" : added ? "Added ✓" : "Add to Cart"}
    </button>
  );
}
