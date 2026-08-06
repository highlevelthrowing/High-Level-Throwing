import type { Metadata } from "next";
import SimpleEmbed from "@/components/SimpleEmbed";

export const metadata: Metadata = {
  title: "Terms Of Service",
};

export default function TermsOfServicePage() {
  return <SimpleEmbed embedKey="terms-of-service" iframeTitle="Terms Of Service" />;
}
