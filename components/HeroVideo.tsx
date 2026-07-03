"use client";

import { useEffect, useRef } from "react";

// Фоновое видео хедера: первые 15 с, зациклено, без звука.
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    // Подстраховка: если файл вдруг длиннее 15 с — зацикливаем первые 15.
    const onTime = () => {
      if (v.currentTime >= 15) v.currentTime = 0;
    };
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, []);

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
    >
      <source src="/hero.mp4" type="video/mp4" />
    </video>
  );
}
