import type { Metadata } from "next";
import SimpleEmbed from "@/components/SimpleEmbed";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return <SimpleEmbed embedKey="privacy-policy" iframeTitle="Privacy Policy" />;
}
