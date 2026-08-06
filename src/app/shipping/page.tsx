import type { Metadata } from "next";
import SimpleEmbed from "@/components/SimpleEmbed";

export const metadata: Metadata = {
  title: "Shipping",
};

export default function ShippingPage() {
  return <SimpleEmbed embedKey="shipping" iframeTitle="Shipping" />;
}
