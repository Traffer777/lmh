"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Верхняя полоса с прогрессом конкурса LMH × ГЛЕБАС.
// Клиентский компонент: считает оплаченные заказы через /api/contest/counter —
// баннер живёт в layout на каждой странице, поэтому не должен трогать БД на этапе
// сборки (в Docker-сборке .env недоступен, только в рантайме контейнера).
const GOAL = 1000;

export default function ContestBanner() {
  const [paidOrders, setPaidOrders] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/contest/counter", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) setPaidOrders(Number(data.paidOrders) || 0);
      } catch {
        // тихо игнорируем — баннер просто не покажет число в этот раз
      }
    }
    load();
    const id = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <Link
      href="/contest"
      className="block border-b border-line bg-black text-white transition hover:bg-neutral-900"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs uppercase tracking-widest sm:text-sm">
        <span className="font-semibold">🏁 LMH × ГЛЕБАС</span>
        {paidOrders !== null && (
          <>
            <span className="hidden sm:inline">
              <span className="font-mono">{paidOrders}</span>
              {" / "}
              <span className="font-mono">{GOAL}</span> заказов до стразовой Приоры
            </span>
            <span className="sm:hidden font-mono">
              {paidOrders}/{GOAL} → 🚗
            </span>
          </>
        )}
        <span className="underline underline-offset-2">Подробнее →</span>
      </div>
    </Link>
  );
}
