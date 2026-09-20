"use client";

import { useEffect, useState } from "react";

// Показывает трек-номер СДЭК на странице заказа. Трек создаётся асинхронно после
// оплаты, поэтому опрашиваем статус несколько раз, пока он не появится.
export default function CdekTrack({
  orderNumber,
  initialTrack,
}: {
  orderNumber: string;
  initialTrack: string | null;
}) {
  const [track, setTrack] = useState<string | null>(initialTrack);
  const [waiting, setWaiting] = useState(!initialTrack);

  useEffect(() => {
    if (track) return;
    let cancelled = false;
    let tries = 0;
    const poll = async () => {
      tries++;
      try {
        const d = await fetch(`/api/orders/track?number=${encodeURIComponent(orderNumber)}`).then((r) =>
          r.json(),
        );
        if (cancelled) return;
        if (d.ok && d.track) {
          setTrack(d.track);
          setWaiting(false);
          return;
        }
      } catch {
        // повторим
      }
      if (!cancelled && tries < 20) {
        setTimeout(poll, 6000);
      } else if (!cancelled) {
        setWaiting(false);
      }
    };
    const t = setTimeout(poll, 3000);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [orderNumber, track]);

  if (track) {
    return (
      <div className="mx-auto mt-6 max-w-sm border border-line bg-bg-2 p-5 text-left">
        <div className="mono text-xs uppercase tracking-widest text-fg-dim">Трек-номер СДЭК</div>
        <div className="mono mt-1 text-lg text-fg">{track}</div>
        <a
          href={`https://www.cdek.ru/ru/tracking?order_id=${encodeURIComponent(track)}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-sm mt-3 inline-block"
        >
          Отследить на сайте СДЭК ↗
        </a>
      </div>
    );
  }

  if (waiting) {
    return (
      <p className="mono mt-6 text-xs text-fg-dim">
        Трек-номер СДЭК формируется — появится на этой странице через пару минут.
        Сохраните ссылку на заказ.
      </p>
    );
  }

  return (
    <p className="mono mt-6 text-xs text-fg-dim">
      Трек-номер СДЭК появится после сборки заказа. Мы также пришлём его вам.
    </p>
  );
}
