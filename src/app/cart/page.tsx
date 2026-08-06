import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getCart, removeCartLine, updateCartLine } from "@/lib/shopify/cart";
import { formatPrice } from "@/lib/format";
import ShopifySetupNotice from "@/components/ShopifySetupNotice";

export const metadata: Metadata = {
  title: "Cart",
};

export default async function CartPage() {
  if (!isShopifyConfigured()) {
    return <ShopifySetupNotice />;
  }

  const cart = await getCart();

  if (!cart || cart.lines.length === 0) {
    return (
      <section>
        <div className="cart-empty">
          <h2 style={{ marginBottom: 12, color: "var(--text)" }}>Your cart is empty</h2>
          <p style={{ marginBottom: 24 }}>Browse gear and training tools to get started.</p>
          <Link className="btn btn-primary" href="/shop">
            Go to Shop
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="section-head" style={{ marginBottom: 32 }}>
        <div className="section-tag">Your Cart</div>
        <h2>Review &amp; Checkout</h2>
      </div>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {cart.lines.map((line) => (
          <div className="cart-line" key={line.id}>
            {line.merchandise.image && (
              <Image
                src={line.merchandise.image.url}
                alt={line.merchandise.image.altText ?? line.merchandise.product.title}
                width={80}
                height={80}
                unoptimized
              />
            )}
            <div className="cart-line-info">
              <h4>{line.merchandise.product.title}</h4>
              <div className="variant">{line.merchandise.title}</div>
              <form action={updateCartLine.bind(null, line.id, line.quantity + 1)} style={{ display: "inline" }}>
                <button type="submit" className="remove-link" style={{ marginRight: 12 }}>
                  + qty
                </button>
              </form>
              {line.quantity > 1 && (
                <form action={updateCartLine.bind(null, line.id, line.quantity - 1)} style={{ display: "inline" }}>
                  <button type="submit" className="remove-link" style={{ marginRight: 12 }}>
                    − qty
                  </button>
                </form>
              )}
              <span style={{ color: "var(--muted)", fontSize: "0.85rem", marginRight: 12 }}>Qty {line.quantity}</span>
              <form action={removeCartLine.bind(null, line.id)} style={{ display: "inline" }}>
                <button type="submit" className="remove-link">
                  Remove
                </button>
              </form>
            </div>
            <div className="cart-line-price">
              {formatPrice(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}
            </div>
          </div>
        ))}

        <div className="cart-summary">
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}</span>
          </div>
          <div className="cart-summary-row total">
            <span>Total</span>
            <span>{formatPrice(cart.cost.totalAmount.amount, cart.cost.totalAmount.currencyCode)}</span>
          </div>
          <a className="btn btn-primary" href={cart.checkoutUrl} style={{ display: "block", textAlign: "center", marginTop: 16 }}>
            Checkout
          </a>
        </div>
      </div>
    </section>
  );
}
