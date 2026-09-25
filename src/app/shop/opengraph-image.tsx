import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Shop Training Equipment";

export default function Image() {
  return ogImage("Shop Training Equipment");
}
