import type { Metadata } from "next";
import SimpleEmbed from "@/components/SimpleEmbed";

export const metadata: Metadata = {
  title: "Search",
};

export default function SearchPage() {
  return <SimpleEmbed embedKey="search" iframeTitle="Search" />;
}
