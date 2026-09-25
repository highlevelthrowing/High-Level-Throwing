import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// Read once at module load and inline as a data URI — ImageResponse cannot
// fetch a relative path, and an absolute URL would depend on the very
// deployment that is rendering the card.
function asset(relativePath: string, mime: string): string {
  try {
    const file = readFileSync(join(process.cwd(), "public", relativePath));
    return `data:${mime};base64,${file.toString("base64")}`;
  } catch {
    return "";
  }
}

const BANNER = asset("images/hero-banner.jpg", "image/jpeg");

/**
 * The card every shared link renders as: the action shot darkened behind the
 * page title, with the brand's lime rule and the domain underneath.
 */
export function ogImage(title: string, eyebrow = "High Level Throwing®") {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          position: "relative",
          backgroundColor: "#000000",
        }}
      >
        {BANNER && (
          <img
            src={BANNER}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "1200px",
              height: "630px",
              objectFit: "cover",
              opacity: 0.45,
            }}
          />
        )}

        {/* Darkens the lower half so the title always has contrast. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "1200px",
            height: "630px",
            display: "flex",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0.92) 100%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "0 72px 64px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#38bdf8",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            {eyebrow}
          </div>

          <div
            style={{
              display: "flex",
              color: "#ffffff",
              fontSize: title.length > 42 ? 66 : 84,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              maxWidth: 1040,
            }}
          >
            {title}
          </div>

          <div style={{ display: "flex", height: 10, width: 180, backgroundColor: "#c6ff2e", marginTop: 32 }} />

          <div
            style={{
              display: "flex",
              color: "rgba(255,255,255,0.82)",
              fontSize: 26,
              fontWeight: 600,
              marginTop: 22,
              letterSpacing: 1,
            }}
          >
            highlevelthrowing.com
          </div>
        </div>
      </div>
    ),
    OG_SIZE
  );
}
