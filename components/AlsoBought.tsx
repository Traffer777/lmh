"use client";

import { useRef } from "react";

// Горизонтальная лента «С этим товаром покупают»: листается свайпом/скроллом и стрелками.
export default function AlsoBought({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) =>
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section className="mt-20 border-t border-line pt-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="display text-3xl md:text-4xl">С этим товаром покупают</h2>
        <div className="flex gap-2">
          {([-1, 1] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => scroll(d)}
              aria-label={d < 0 ? "Назад" : "Вперёд"}
              className="mono h-10 w-10 border border-line text-lg transition-colors hover:border-accent hover:text-accent"
            >
              {d < 0 ? "←" : "→"}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={ref}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:thin] md:mx-0 md:px-0"
      >
        {children}
      </div>
    </section>
  );
}
