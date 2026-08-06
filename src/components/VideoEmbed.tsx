"use client";

import { useState } from "react";
import Image from "next/image";

export default function VideoEmbed({
  vimeoId,
  poster,
  title,
  autoEmbed = false,
}: {
  vimeoId: string;
  poster?: string;
  title: string;
  autoEmbed?: boolean;
}) {
  const [playing, setPlaying] = useState(autoEmbed);

  if (playing) {
    return (
      <div className="video-embed">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button type="button" className="video-embed video-embed-poster" onClick={() => setPlaying(true)}>
      {poster && <Image src={poster} alt={title} fill unoptimized />}
      <span className="video-embed-play" aria-hidden="true">
        ▶
      </span>
      <span className="sr-only">{`Play: ${title}`}</span>
    </button>
  );
}
