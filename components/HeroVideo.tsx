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
    // На медленной сети запрос куска видео иногда обрывается и браузер сам
    // ставит видео на паузу без ошибки — переигрываем (фон декоративный, controls нет).
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("pause", tryPlay);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("pause", tryPlay);
    };
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
