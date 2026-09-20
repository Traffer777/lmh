"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { getSticker } from "@/lib/stickers";

type Props = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  images: { url: string; alt: string | null }[];
  variants: { size: string; stock: number }[];
};

export default function StickerDetail({ id, slug, title, description, images, variants }: Props) {
  const packs = getSticker(slug)?.packs ?? [];
  const [active, setActive] = useState(0);
  const [packIdx, setPackIdx] = useState(0);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);

  const imgs = images.length ? images : [{ url: "/stickers/demo-lmh.png", alt: title }];
  const pack = packs[packIdx];
  const stock = variants.find((v) => v.size === pack?.size)?.stock ?? 0;
  const perUnit = pack ? Math.round(pack.price / pack.qty) : 0;

  function handleAdd() {
    if (!pack || stock <= 0) return;
    add(
      {
        productId: id,
        slug,
        title,
        price: pack.price,
        size: pack.size,
        image: imgs[0]?.url,
        maxStock: stock,
      },
      1,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="grid gap-10 md:grid-cols-2">
      {/* Галерея (первое фото — переливающееся) */}
      <div className="flex flex-col-reverse gap-4 md:flex-row">
        <div className="flex gap-3 md:flex-col">
          {imgs.map((im, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative h-20 w-16 shrink-0 overflow-hidden border bg-white ${
                active === i ? "border-accent" : "border-line"
              }`}
              aria-label={`Фото ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.url} alt={im.alt ?? ""} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
        <div className="relative aspect-square flex-1 overflow-hidden border border-line bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgs[active]?.url}
            alt={imgs[active]?.alt ?? title}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Инфо */}
      <div>
        <Link
          href="/stickers"
          className="mono text-xs uppercase tracking-widest text-fg-dim hover:text-accent"
        >
          ← Все стикеры
        </Link>
        <h1 className="display mt-2 text-4xl md:text-5xl">{title}</h1>
        <p className="mono mt-3 flex flex-wrap items-baseline gap-2 text-2xl text-accent">
          {pack ? formatPrice(pack.price) : "—"}
          {pack && (
            <span className="text-sm text-fg-dim">
              ≈ {perUnit} ₽/шт · пачка {pack.qty} шт.
            </span>
          )}
        </p>

        {description && <p className="mt-6 leading-relaxed text-fg-dim">{description}</p>}

        {/* Выбор пачки — цена меняется */}
        <div className="mt-8">
          <p className="mono mb-3 text-xs uppercase tracking-widest text-fg-dim">
            Количество в пачке
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {packs.map((p, i) => {
              const st = variants.find((v) => v.size === p.size)?.stock ?? 0;
              const sel = i === packIdx;
              const out = st <= 0;
              return (
                <button
                  key={p.size}
                  disabled={out}
                  onClick={() => setPackIdx(i)}
                  className={`mono border px-3 py-3 text-center transition-colors ${
                    sel
                      ? "border-accent bg-accent text-white"
                      : out
                        ? "cursor-not-allowed border-line text-fg-dim line-through opacity-40"
                        : "border-line hover:border-fg"
                  }`}
                >
                  <span className="block text-sm">{p.qty} шт.</span>
                  <span className="block text-[11px] opacity-80">{formatPrice(p.price)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Купить */}
        <div className="mt-8 flex flex-wrap gap-3">
          {stock > 0 ? (
            <>
              <button onClick={handleAdd} className="btn btn-accent">
                {added ? "Добавлено ✓" : "В корзину"}
              </button>
              <Link href="/cart" className="btn">
                Перейти в корзину
              </Link>
            </>
          ) : (
            <span className="btn cursor-not-allowed opacity-50">Распродано</span>
          )}
        </div>

        {/* Детали */}
        <div className="mono mt-10 space-y-1 border-t border-line pt-6 text-xs text-fg-dim">
          <p>· Голографический винил — переливается на свету</p>
          <p>· Влагостойкие, клеятся на любую гладкую поверхность</p>
          <p>· Доставка по РФ: СДЭК, Почта России, курьер</p>
        </div>
      </div>
    </div>
  );
}
