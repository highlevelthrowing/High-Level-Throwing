"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Testimonial = {
  src: string;
  alt: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    src: "https://cdn.shopify.com/s/files/1/0771/2948/2547/files/High_level_throwing-2.jpg?v=1711116525",
    alt: "Beth Torina, LSU Head Softball Coach, on High Level Throwing",
  },
  {
    src: "https://cdn.shopify.com/s/files/1/0771/2948/2547/files/MccleneyTestimonial-1024x1024.png?v=1718585796",
    alt: "Haylie McCleney, Team USA Softball, on High Level Throwing",
  },
  {
    src: "https://cdn.shopify.com/s/files/1/0771/2948/2547/files/Alliance.png?v=1748136231",
    alt: "Jami Lobpries, Alliance Fastpitch CEO, on High Level Throwing",
  },
  {
    src: "/images/testimonials/caitlyn-cain.png",
    alt: "Caitlyn Cain, Texas Blaze Softball, on High Level Throwing",
  },
  {
    src: "/images/testimonials/cat-osterman.png",
    alt: "Cat Osterman, COSA / RBI Austin, on High Level Throwing",
  },
  {
    src: "/images/testimonials/kevin-hinde.png",
    alt: "Kevin Hinde, Team NC Softball, on High Level Throwing",
  },
  {
    src: "/images/testimonials/heather-tarr.png",
    alt: "Heather Tarr, University of Washington Head Coach, on High Level Throwing",
  },
];

const AUTO_ADVANCE_MS = 6000;

export default function TestimonialSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, []);

  const goTo = (i: number) => setIndex((i + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <div className="testimonial-slider">
      <div
        className="testimonial-slider-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {TESTIMONIALS.map((t) => (
          <div className="testimonial-slide" key={t.src}>
            <Image src={t.src} alt={t.alt} fill unoptimized style={{ objectFit: "contain" }} />
          </div>
        ))}
      </div>
      <button
        type="button"
        className="testimonial-nav testimonial-nav-prev"
        onClick={() => goTo(index - 1)}
        aria-label="Previous testimonial"
      >
        ‹
      </button>
      <button
        type="button"
        className="testimonial-nav testimonial-nav-next"
        onClick={() => goTo(index + 1)}
        aria-label="Next testimonial"
      >
        ›
      </button>
      <div className="testimonial-dots">
        {TESTIMONIALS.map((t, i) => (
          <button
            type="button"
            key={t.src}
            className={`testimonial-dot${i === index ? " active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
