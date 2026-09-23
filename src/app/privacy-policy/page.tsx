import type { Metadata } from "next";
import ShopifyPageContent from "@/components/ShopifyPageContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return <ShopifyPageContent handle="privacy-policy" heading="Privacy Policy" tag="Policies" />;
}
