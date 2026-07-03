"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export type ProductDTO = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  composition: string | null;
  price: number;
  limited: boolean;
  dropTitle: string | null;
  images: { url: string; alt: string | null }[];
  variants: { size: string; stock: number }[];
};

export default function ProductDetail({ product }: { product: ProductDTO }) {
  const [active, setActive] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);

  // Если в наличии ровно один размер (напр. OS у сумок) — выбираем его сразу.
  useEffect(() => {
    const available = product.variants.filter((v) => v.stock > 0);
    if (available.length === 1) setSize(available[0].size);
  }, [product.variants]);

  const images = product.images.length
    ? product.images
    : [{ url: `/api/placeholder?t=${encodeURIComponent(product.title)}`, alt: product.title }];

  const selectedVariant = product.variants.find((v) => v.size === size) ?? null;
  const anyStock = product.variants.some((v) => v.stock > 0);
  const priceless = product.price <= 0;

  function handleAdd() {
    if (!selectedVariant || selectedVariant.stock <= 0) return;
    add(
      {
        productId: product.id,
        slug: product.slug,
        title: product.title,
        price: product.price,
        size: selectedVariant.size,
        image: images[0]?.url,
        maxStock: selectedVariant.stock,
      },
      1,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="grid gap-10 md:grid-cols-2">
      {/* Галерея */}
      <div className="flex flex-col-reverse gap-4 md:flex-row">
        <div className="flex gap-3 md:flex-col">
          {images.map((im, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative h-20 w-16 shrink-0 overflow-hidden border bg-white ${
                active === i ? "border-accent" : "border-line"
              }`}
              aria-label={`Фото ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.url} alt={im.alt ?? ""} className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
        <div className="relative aspect-[4/5] flex-1 overflow-hidden border border-line bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[active]?.url}
            alt={images[active]?.alt ?? product.title}
            className="h-full w-full object-contain"
          />
          {product.limited && (
            <span className="mono absolute left-0 top-0 bg-accent px-2 py-1 text-[10px] uppercase tracking-widest text-white">
              Лимит
            </span>
          )}
        </div>
      </div>

      {/* Инфо */}
      <div>
        {product.dropTitle && (
          <Link
            href={`/catalog`}
            className="mono text-xs uppercase tracking-widest text-fg-dim hover:text-accent"
          >
            Дроп · {product.dropTitle}
          </Link>
        )}
        <h1 className="display mt-2 text-4xl md:text-5xl">{product.title}</h1>
        <p className="mono mt-3 text-2xl text-accent">
          {product.price > 0 ? formatPrice(product.price) : "Цена уточняется"}
        </p>

        {product.description && (
          <p className="mt-6 leading-relaxed text-fg-dim">{product.description}</p>
        )}

        {/* Размеры */}
        <div className="mt-8">
          <p className="mono mb-3 text-xs uppercase tracking-widest text-fg-dim">
            Размер
          </p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const disabled = v.stock <= 0;
              const sel = size === v.size;
              return (
                <button
                  key={v.size}
                  disabled={disabled}
                  onClick={() => setSize(v.size)}
                  className={`mono min-w-12 border px-3 py-2 text-sm uppercase transition-colors ${
                    sel
                      ? "border-accent bg-accent text-white"
                      : disabled
                        ? "cursor-not-allowed border-line text-fg-dim line-through opacity-40"
                        : "border-line hover:border-fg"
                  }`}
                >
                  {v.size}
                </button>
              );
            })}
          </div>
          {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 3 && (
            <p className="mono mt-2 text-xs text-accent">
              Осталось {selectedVariant.stock} шт.
            </p>
          )}
        </div>

        {/* Купить */}
        <div className="mt-8 flex flex-wrap gap-3">
          {priceless ? (
            <>
              <span className="btn cursor-not-allowed opacity-60">Скоро в продаже</span>
              <a
                href="https://t.me/LmhFuckSleep"
                target="_blank"
                rel="noreferrer"
                className="btn btn-accent"
              >
                Узнать цену в Telegram
              </a>
            </>
          ) : anyStock ? (
            <>
              <button
                onClick={handleAdd}
                disabled={!selectedVariant || selectedVariant.stock <= 0}
                className="btn btn-accent"
              >
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
        {!size && anyStock && !priceless && (
          <p className="mono mt-3 text-xs text-fg-dim">Выберите размер</p>
        )}

        {/* Детали */}
        {product.composition && (
          <div className="mt-10 border-t border-line pt-6">
            <p className="mono mb-2 text-xs uppercase tracking-widest text-fg-dim">
              Состав и уход
            </p>
            <p className="text-sm text-fg-dim">{product.composition}</p>
          </div>
        )}
        <div className="mono mt-6 space-y-1 text-xs text-fg-dim">
          <p>· Доставка по РФ: СДЭК, Почта России, Boxberry, курьер</p>
          <p>· Бесплатная доставка при заказе от 15 000 ₽</p>
          <p>· Оплата: СБП, карты Мир, платёж в 4 части</p>
        </div>
      </div>
    </div>
  );
}
