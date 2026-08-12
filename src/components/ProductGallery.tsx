"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductMedia } from "@/lib/shopify/types";

function bestVideoSource(sources: { url: string; mimeType: string }[]) {
  return sources.find((s) => s.mimeType === "video/mp4") ?? sources[0];
}

export default function ProductGallery({ media, title }: { media: ProductMedia[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = media[activeIndex];

  if (!active) return null;

  return (
    <div>
      <div className="pdp-gallery">
        {active.type === "VIDEO" ? (
          <video
            key={activeIndex}
            controls
            playsInline
            poster={active.previewImage?.url}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          >
            <source src={bestVideoSource(active.sources)?.url} />
          </video>
        ) : (
          <Image src={active.image.url} alt={active.image.altText ?? title} width={800} height={800} unoptimized />
        )}
      </div>
      {media.length > 1 && (
        <div className="pdp-thumbs">
          {media.map((item, index) => {
            const thumbUrl = item.type === "IMAGE" ? item.image.url : item.previewImage?.url;
            if (!thumbUrl) return null;
            return (
              <button
                key={index}
                type="button"
                className={`pdp-thumb${index === activeIndex ? " active" : ""}`}
                onClick={() => setActiveIndex(index)}
                aria-label={item.type === "VIDEO" ? `Play video ${index + 1}` : `Show image ${index + 1}`}
              >
                <Image src={thumbUrl} alt={title} width={144} height={144} unoptimized />
                {item.type === "VIDEO" && (
                  <span className="pdp-thumb-play" aria-hidden="true">
                    ▶
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
