import type { Metadata } from "next";
import ShopifyPageContent from "@/components/ShopifyPageContent";

export const metadata: Metadata = {
  title: "Shipping",
};

export default function ShippingPage() {
  return <ShopifyPageContent handle="shipping" heading="Shipping" tag="Policies" />;
}
