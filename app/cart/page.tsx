"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, setQty, remove } = useCart();
  const total = useCart((s) => s.total());
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="mx-auto max-w-7xl px-4 py-16 md:px-6" />;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center md:px-6">
        <h1 className="display text-4xl">Корзина пуста</h1>
        <p className="mt-3 text-fg-dim">Самое время выбрать что-нибудь из дропа.</p>
        <Link href="/catalog" className="btn btn-accent mt-8">
          В каталог
        </Link>
      </div>
    );
  }

  const left = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <h1 className="display text-5xl md:text-6xl">Корзина</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ul className="divide-y divide-line border-y border-line">
            {items.map((it) => (
              <li key={`${it.productId}-${it.size}`} className="flex gap-4 py-5">
                <Link
                  href={`/product/${it.slug}`}
                  className="relative h-28 w-24 shrink-0 overflow-hidden border border-line bg-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.image ?? `/api/placeholder?t=${encodeURIComponent(it.title)}`}
                    alt={it.title}
                    className="h-full w-full object-contain"
                  />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/product/${it.slug}`} className="display text-xl hover:text-accent">
                      {it.title}
                    </Link>
                    <span className="mono whitespace-nowrap">{formatPrice(it.price * it.qty)}</span>
                  </div>
                  <p className="mono mt-1 text-xs uppercase tracking-widest text-fg-dim">
                    Размер: {it.size}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-line">
                      <button
                        className="mono px-3 py-1 hover:text-accent"
                        onClick={() => setQty(it.productId, it.size, it.qty - 1)}
                        aria-label="Меньше"
                      >
                        −
                      </button>
                      <span className="mono min-w-8 text-center">{it.qty}</span>
                      <button
                        className="mono px-3 py-1 hover:text-accent disabled:opacity-30"
                        onClick={() => setQty(it.productId, it.size, it.qty + 1)}
                        disabled={it.qty >= it.maxStock}
                        aria-label="Больше"
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="mono text-xs uppercase tracking-widest text-fg-dim hover:text-accent"
                      onClick={() => remove(it.productId, it.size)}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Итог */}
        <aside className="lg:col-span-1">
          <div className="border border-line bg-bg-2 p-6">
            <h2 className="display text-2xl">Итог</h2>

            <div className="mt-4">
              <div className="h-1.5 w-full bg-bg-3">
                <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
              </div>
              <p className="mono mt-2 text-xs text-fg-dim">
                {left > 0
                  ? `До бесплатной доставки: ${formatPrice(left)}`
                  : "Бесплатная доставка ✓"}
              </p>
            </div>

            <div className="mono mt-6 flex justify-between text-sm text-fg-dim">
              <span>Товары</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="mono mt-2 flex justify-between text-sm text-fg-dim">
              <span>Доставка</span>
              <span>рассчитается при оформлении</span>
            </div>
            <div className="mt-4 flex justify-between border-t border-line pt-4">
              <span className="display text-xl">К оплате</span>
              <span className="display text-xl text-accent">{formatPrice(total)}</span>
            </div>

            <Link href="/checkout" className="btn btn-accent mt-6 w-full">
              Оформить заказ
            </Link>
            <Link href="/catalog" className="btn mt-3 w-full">
              Продолжить покупки
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
