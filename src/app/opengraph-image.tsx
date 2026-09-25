import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Everything you need to build the complete Throwing Athlete";

export default function Image() {
  return ogImage("Everything you need to build the complete Throwing Athlete");
}
