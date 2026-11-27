import { formatPrice } from "@/lib/format";
import type { Money } from "@/lib/shopify/types";

type Props = {
  price: Money;
  /**
   * Shopify's "Compare at" price. Absent on full-price products, and reported
   * as "0.0" by compareAtPriceRange rather than null, so both are treated as
   * "not on sale".
   */
  compareAt?: Money | null;
  /** Renders the percentage saved beside the price. Off in dense grids. */
  showBadge?: boolean;
};

export default function SalePrice({ price, compareAt, showBadge = true }: Props) {
  const now = Number(price.amount);
  const was = compareAt ? Number(compareAt.amount) : 0;
  const onSale = was > now && now > 0;

  if (!onSale) {
    return <span className="price-now">{formatPrice(price.amount, price.currencyCode)}</span>;
  }

  const percentOff = Math.round(((was - now) / was) * 100);

  return (
    <span className="price-sale">
      <s className="price-was">{formatPrice(compareAt!.amount, compareAt!.currencyCode)}</s>
      <span className="price-now">{formatPrice(price.amount, price.currencyCode)}</span>
      {showBadge && <span className="price-off">{percentOff}% OFF</span>}
    </span>
  );
}
