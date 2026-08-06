import type { Metadata } from "next";
import SimpleEmbed from "@/components/SimpleEmbed";

export const metadata: Metadata = {
  title: "Refund Policy",
};

export default function RefundPolicyPage() {
  return <SimpleEmbed embedKey="refund-policy" iframeTitle="Refund Policy" />;
}
