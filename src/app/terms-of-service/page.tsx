import type { Metadata } from "next";
import ShopifyPageContent from "@/components/ShopifyPageContent";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsOfServicePage() {
  return <ShopifyPageContent handle="terms-of-service" heading="Terms of Service" tag="Policies" />;
}
