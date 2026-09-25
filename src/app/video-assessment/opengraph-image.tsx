import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Athlete Video Assessments";

export default function Image() {
  return ogImage("Athlete Video Assessments");
}
