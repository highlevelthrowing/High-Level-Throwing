import type { Metadata } from "next";
import ShopifyPageContent from "@/components/ShopifyPageContent";

export const metadata: Metadata = {
  title: "Refund Policy",
};

export default function RefundPolicyPage() {
  return <ShopifyPageContent handle="refund-policy" heading="Refund Policy" tag="Policies" />;
}
