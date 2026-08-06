import type { Metadata } from "next";
import SimpleEmbed from "@/components/SimpleEmbed";

export const metadata: Metadata = {
  title: "Video Assessment",
};

export default function VideoAssessmentPage() {
  return <SimpleEmbed embedKey="video-assessment" iframeTitle="High Level Throwing Video Assessment" />;
}
