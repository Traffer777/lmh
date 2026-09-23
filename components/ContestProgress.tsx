"use client";

import { useEffect, useState } from "react";

const GOAL = 1000;

const PRIZES = [
  { at: 100, title: "Мерч-пак LMH", note: "Стартовый приз — набор из свежего дропа" },
  { at: 250, title: "Лимитка", note: "Эксклюзивная вещь из будущего дропа" },
  { at: 500, title: "Встреча с Глебасом", note: "Личная встреча + подписанная вещь" },
  { at: 750, title: "Совместная съёмка", note: "Камео в клипе / съёмке с Глебасом" },
  { at: 1000, title: "🚗 СТРАЗОВАЯ ПРИОРА", note: "Главный приз — та самая" },
];

// Живой счётчик заказов конкурса. Клиентский компонент — тянет данные через
// /api/contest/counter, а не напрямую из БД, чтобы страница /contest оставалась
// статической и не зависела от DATABASE_URL на этапе сборки Docker-образа.
export default function ContestProgress() {
  const [paidOrders, setPaidOrders] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/contest/counter", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) setPaidOrders(Number(data.paidOrders) || 0);
      } catch {
        // не удалось получить свежие данные — оставляем предыдущее значение
      }
    }
    load();
    const id = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const count = paidOrders ?? 0;
  const progress = Math.min(100, (count / GOAL) * 100);

  return (
    <>
      <div className="mt-8 border border-line bg-bg-2 p-6">
        <div className="mono flex items-baseline justify-between text-sm">
          <span className="text-fg-dim">Прогресс</span>
          <span>
            <span className="text-accent">{paidOrders === null ? "…" : count}</span> / {GOAL} заказов
          </span>
        </div>
        <div className="mt-3 h-2 w-full bg-bg-3">
          <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mono mt-3 text-xs text-fg-dim">
          Финальный розыгрыш стартует, когда мы вместе оплатим 1000 заказов с товарами LMH × ГЛЕБАС.
        </p>
      </div>

      <section className="mt-12">
        <h2 className="display text-3xl">Призы по вехам</h2>
        <div className="mt-4 border border-line">
          {PRIZES.map((p) => {
            const done = count >= p.at;
            return (
              <div
                key={p.at}
                className={`flex items-start justify-between gap-4 border-b border-line px-4 py-4 last:border-b-0 ${
                  done ? "bg-accent/10" : ""
                }`}
              >
                <div>
                  <p className="display text-xl">
                    {done ? "✓ " : ""}
                    {p.at} заказов — {p.title}
                  </p>
                  <p className="mono mt-1 text-xs text-fg-dim">{p.note}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
