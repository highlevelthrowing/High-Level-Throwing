import type { Metadata } from "next";
import SimpleEmbed from "@/components/SimpleEmbed";

export const metadata: Metadata = {
  title: "Velocity Tracker",
};

export default function VelocityTrackerPage() {
  return <SimpleEmbed embedKey="velocity-tracker" iframeTitle="Velocity Tracker" />;
}
