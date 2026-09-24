"use client";

import { useEffect, useRef, useState } from "react";

export default function SimpleEmbed({
  embedKey,
  iframeTitle,
  height = 1600,
}: {
  embedKey: string;
  iframeTitle: string;
  height?: number;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [measured, setMeasured] = useState<number | null>(null);

  // The proxied page reports its own document height (see /api/embed/[page]),
  // so the embed grows to fit its content instead of scrolling inside a fixed
  // box — which is what made these pages feel like a separate site.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.source !== frameRef.current?.contentWindow) return;
      const reported = (event.data as { hltEmbedHeight?: unknown })?.hltEmbedHeight;
      if (typeof reported === "number" && reported > 200) {
        setMeasured(Math.ceil(reported));
      }
    }
    window.addEventListener("message", onMessage);

    // The embedded page may have loaded before this listener existed, so ask
    // for its height until it answers.
    const ping = setInterval(() => {
      frameRef.current?.contentWindow?.postMessage({ hltEmbedPing: true }, "*");
    }, 400);
    const stop = setTimeout(() => clearInterval(ping), 15000);

    return () => {
      window.removeEventListener("message", onMessage);
      clearInterval(ping);
      clearTimeout(stop);
    };
  }, []);

  return (
    <section style={{ paddingTop: 0 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", borderRadius: 20, overflow: "hidden" }}>
        <iframe
          ref={frameRef}
          src={`/api/embed/${embedKey}`}
          title={iframeTitle}
          scrolling="no"
          style={{
            width: "100%",
            height: measured ?? height,
            border: "none",
            background: "var(--navy)",
            display: "block",
            overflow: "hidden",
          }}
        />
      </div>
    </section>
  );
}
