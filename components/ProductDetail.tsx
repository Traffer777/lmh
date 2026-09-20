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
  customizable?: boolean;
  // Тёмная печать имени/номера — для светлых (белых) форм, иначе бело.
  customDark?: boolean;
  // Если задано — товар в статусе «скоро в продаже» до этой даты.
  releaseAt?: string | null;
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function ProductDetail({
  product,
  limitedUntil = null,
}: {
  product: ProductDTO;
  limitedUntil?: string | null;
}) {
  const [active, setActive] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customNumber, setCustomNumber] = useState("");
  const add = useCart((s) => s.add);

  // Таймер лимитированного релиза («только 7 дней в наличии»).
  const [nowTs, setNowTs] = useState<number | null>(null);
  useEffect(() => {
    if (!limitedUntil) return;
    setNowTs(Date.now());
    const t = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(t);
  }, [limitedUntil]);
  const limitMs =
    limitedUntil && nowTs !== null ? new Date(limitedUntil).getTime() - nowTs : null;
  const limitEnded = limitMs !== null && limitMs <= 0;
  const limitLeft =
    limitMs !== null && limitMs > 0
      ? {
          d: Math.floor(limitMs / 86_400_000),
          h: Math.floor(limitMs / 3_600_000) % 24,
          m: Math.floor(limitMs / 60_000) % 60,
          s: Math.floor(limitMs / 1_000) % 60,
        }
      : null;

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
  // «Скоро в продаже»: тикающие часы до старта релиза (releaseAt), если он в будущем.
  const [releaseMs, setReleaseMs] = useState<number | null>(null);
  useEffect(() => {
    if (!product.releaseAt) return;
    const tick = () => setReleaseMs(new Date(product.releaseAt!).getTime() - Date.now());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [product.releaseAt]);
  const notReleased = releaseMs !== null && releaseMs > 0;
  const releaseLeft =
    notReleased && releaseMs !== null
      ? {
          h: Math.floor(releaseMs / 3_600_000),
          m: Math.floor(releaseMs / 60_000) % 60,
          s: Math.floor(releaseMs / 1_000) % 60,
        }
      : null;

  const name = customName.trim();
  const number = customNumber.trim();
  const hasCustom = product.customizable && (name !== "" || number !== "");
  // Спина формы (на неё наносим имя/номер) — второе фото, иначе первое.
  const backIndex = images.length > 1 ? 1 : 0;
  const showPrint = product.customizable && active === backIndex && (name !== "" || number !== "");

  // При вводе имени/номера показываем спину, чтобы клиент видел нанесение вживую.
  function focusBack() {
    if (product.customizable) setActive(backIndex);
  }

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
        ...(hasCustom ? { custom: { name: name || undefined, number: number || undefined } } : {}),
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
          {/* Живое превью нанесения на спине */}
          {showPrint && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              {name && (
                <span
                  className={`display absolute w-full text-center uppercase leading-none ${
                    product.customDark
                      ? "text-neutral-900 [text-shadow:0_1px_2px_rgba(255,255,255,0.6)]"
                      : "text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]"
                  }`}
                  style={{ top: "36%", fontSize: "clamp(14px,5.5vw,34px)", letterSpacing: "0.02em" }}
                >
                  {name}
                </span>
              )}
              {number && (
                <span
                  className={`display absolute w-full text-center leading-none tabular-nums ${
                    product.customDark
                      ? "text-neutral-900 [text-shadow:0_1px_2px_rgba(255,255,255,0.6)]"
                      : "text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]"
                  }`}
                  style={{ top: "52%", fontSize: "clamp(40px,16vw,104px)" }}
                >
                  {number}
                </span>
              )}
            </div>
          )}
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

        {/* Лимит по времени — «только 7 дней в наличии» + отсчёт */}
        {limitedUntil && (
          <div
            className={`mono mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border px-4 py-3 text-xs uppercase tracking-widest ${
              limitEnded
                ? "border-line text-fg-dim"
                : "border-accent bg-accent/10 text-accent"
            }`}
          >
            {limitEnded ? (
              <span>Продажа завершена</span>
            ) : (
              <>
                <span>Только 7 дней в наличии</span>
                <span className="tabular-nums text-fg" suppressHydrationWarning>
                  {limitLeft
                    ? `${limitLeft.d}д ${pad(limitLeft.h)}:${pad(limitLeft.m)}:${pad(limitLeft.s)}`
                    : "—"}
                </span>
              </>
            )}
          </div>
        )}

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

        {/* Нанесение имени и номера (форма со своим номером) */}
        {product.customizable && (
          <div className="mt-8 border border-line bg-bg-2 p-4">
            <p className="mono mb-1 text-xs uppercase tracking-widest text-accent-2">
              Нанесение на спину
            </p>
            <p className="mono mb-4 text-xs text-fg-dim">
              Впиши имя и номер — нанесём как у игроков. Оставь пустым — форма без нанесения.
            </p>
            <div className="flex flex-wrap gap-3">
              <label className="flex-1">
                <span className="mono mb-1 block text-[10px] uppercase tracking-widest text-fg-dim">
                  Имя / фамилия
                </span>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value.toUpperCase().slice(0, 14));
                    focusBack();
                  }}
                  onFocus={focusBack}
                  placeholder="ИМЯ"
                  maxLength={14}
                  className="mono w-full border border-line bg-bg px-3 py-2 text-sm uppercase tracking-wider outline-none focus:border-accent-2"
                />
              </label>
              <label className="w-24">
                <span className="mono mb-1 block text-[10px] uppercase tracking-widest text-fg-dim">
                  Номер
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={customNumber}
                  onChange={(e) => {
                    setCustomNumber(e.target.value.replace(/\D/g, "").slice(0, 3));
                    focusBack();
                  }}
                  onFocus={focusBack}
                  placeholder="10"
                  maxLength={3}
                  className="mono w-full border border-line bg-bg px-3 py-2 text-sm tabular-nums outline-none focus:border-accent-2"
                />
              </label>
            </div>
            {hasCustom && (
              <p className="mono mt-3 text-xs text-fg-dim">
                На спине: <span className="text-fg">{name || "—"}</span>
                {number ? <span className="text-fg"> · №{number}</span> : null}
              </p>
            )}
          </div>
        )}

        {/* Купить */}
        <div className="mt-8 flex flex-wrap gap-3">
          {notReleased ? (
            <>
              <span className="btn cursor-not-allowed opacity-60">
                Скоро в продаже
                {releaseLeft
                  ? ` · ${pad(releaseLeft.h)}:${pad(releaseLeft.m)}:${pad(releaseLeft.s)}`
                  : ""}
              </span>
              <span className="mono self-center text-xs uppercase tracking-widest text-fg-dim">
                Старт 18:00 МСК
              </span>
            </>
          ) : priceless ? (
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
          ) : limitEnded ? (
            <span className="btn cursor-not-allowed opacity-50">Продажа завершена</span>
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
          <p>· Срок доставки: 2–5 рабочих дней</p>
          <p>· Бесплатная доставка при заказе от 15 000 ₽</p>
          <p>· Оплата: СБП, карты Мир, платёж в 4 части</p>
        </div>
      </div>
    </div>
  );
}
