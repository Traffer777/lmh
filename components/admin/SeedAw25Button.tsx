"use client";

import { useState } from "react";

export default function SeedAw25Button() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/admin/seed-aw25-images", { method: "POST" });
      const data = await r.json();
      if (!r.ok) {
        setMsg(`Ошибка: ${data.error ?? r.status}`);
      } else {
        setMsg(
          `✓ Опубликовано ${data.published} товаров · старт продаж ${new Date(data.releaseAt).toLocaleString("ru-RU")}`,
        );
      }
    } catch (e) {
      setMsg(`Сеть: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 border border-line bg-bg-2 p-6">
      <h3 className="display text-xl">Дроп AW25</h3>
      <p className="mt-2 text-sm text-fg-dim">
        Пересеет фото, поставит published, releaseAt = 18:00 МСК 2026-09-21. До релиза
        карточки показываются с бейджем «Скоро», покупка блокируется.
      </p>
      <button
        onClick={run}
        disabled={busy}
        className="mono mt-4 border border-accent px-6 py-3 text-xs uppercase tracking-widest text-accent hover:bg-accent hover:text-bg disabled:opacity-50"
      >
        {busy ? "Обновляю…" : "Активировать дроп AW25"}
      </button>
      {msg && <p className="mono mt-3 text-xs text-fg-dim">{msg}</p>}
    </div>
  );
}
