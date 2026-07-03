"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import {
  DELIVERY_METHODS,
  PAYMENT_METHODS,
  FREE_SHIPPING_THRESHOLD,
  isSupportDelivery,
} from "@/lib/constants";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, clear } = useCart();
  const itemsTotal = useCart((s) => s.total());

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("cdek");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("sbp");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [instOpen, setInstOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  // Если клиент вошёл в кабинет — подставляем его контакты.
  useEffect(() => {
    fetch("/api/account/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.customer) {
          setName((v) => v || d.customer.name);
          setPhone((v) => v || d.customer.phone);
          setEmail((v) => v || d.customer.email);
        }
      })
      .catch(() => {});
  }, []);

  const deliveryDef = DELIVERY_METHODS.find((d) => d.value === deliveryMethod)!;
  const deliveryCost = useMemo(
    () => (itemsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : deliveryDef.cost),
    [itemsTotal, deliveryDef],
  );
  const total = itemsTotal + deliveryCost;

  if (!mounted) return <div className="mx-auto max-w-7xl px-4 py-16 md:px-6" />;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center md:px-6">
        <h1 className="display text-4xl">Корзина пуста</h1>
        <Link href="/catalog" className="btn btn-accent mt-8">
          В каталог
        </Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, size: i.size, qty: i.qty })),
          customer: { name, phone, email },
          delivery: { method: deliveryMethod, address },
          paymentMethod,
          comment,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Не удалось оформить заказ.");
        setLoading(false);
        return;
      }
      clear();
      if (data.support) {
        window.location.href = `/checkout/support?order=${encodeURIComponent(data.number)}`;
      } else {
        window.location.href = data.paymentUrl;
      }
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
      setLoading(false);
    }
  }

  const radioRow = (active: boolean) =>
    `flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
      active ? "border-accent bg-bg-2" : "border-line hover:border-fg-dim"
    }`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <h1 className="display text-5xl md:text-6xl">Оформление</h1>

      <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          {/* Контакты */}
          <section>
            <h2 className="display mb-4 text-2xl">1. Контакты</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="lbl">Имя и фамилия *</label>
                <input className="field" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="lbl">Телефон *</label>
                <input
                  className="field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 ___ ___-__-__"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="lbl">E-mail (для чека)</label>
                <input
                  type="email"
                  className="field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Доставка */}
          <section>
            <h2 className="display mb-4 text-2xl">2. Доставка</h2>
            <div className="space-y-3">
              {DELIVERY_METHODS.map((d) => {
                const cost = itemsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : d.cost;
                return (
                  <label key={d.value} className={radioRow(deliveryMethod === d.value)}>
                    <input
                      type="radio"
                      name="delivery"
                      className="mt-1 accent-[var(--accent)]"
                      checked={deliveryMethod === d.value}
                      onChange={() => setDeliveryMethod(d.value)}
                    />
                    <span className="flex-1">
                      <span className="flex justify-between">
                        <span className="font-semibold">{d.label}</span>
                        <span className="mono text-sm">
                          {isSupportDelivery(d.value)
                            ? "уточняется"
                            : cost === 0
                              ? "бесплатно"
                              : formatPrice(cost)}
                        </span>
                      </span>
                      <span className="mono text-xs text-fg-dim">Срок: {d.eta}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {deliveryMethod === "pickup" ? (
              <p className="mono mt-3 text-xs text-fg-dim">
                Адрес самовывоза согласуем после оформления (детали — в Telegram).
              </p>
            ) : deliveryMethod === "telegram" ? (
              <div className="mt-3 border border-line bg-bg-2 p-4">
                <p className="text-sm">
                  Для регионов без СДЭК и Почты РФ оформляем доставку через поддержку.
                  После оформления наша поддержка свяжется с вами в Telegram, подберёт
                  удобный способ доставки и согласует оплату.
                </p>
                <input
                  className="field mt-3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Страна, город (необязательно)"
                />
              </div>
            ) : (
              <div className="mt-4">
                <label className="lbl">
                  {deliveryMethod === "intl"
                    ? "Страна, город, адрес *"
                    : "Город, адрес или пункт выдачи *"}
                </label>
                <input
                  className="field"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={
                    deliveryMethod === "intl"
                      ? "Беларусь, Минск, ул. ..., индекс"
                      : "Москва, СДЭК, ул. ..., индекс"
                  }
                  required
                />
                {deliveryMethod === "intl" && (
                  <p className="mono mt-2 text-xs text-fg-dim">
                    Стоимость международной доставки рассчитаем и согласуем с вами в Telegram.
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Оплата */}
          <section>
            <h2 className="display mb-4 text-2xl">3. Оплата</h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((p) => {
                const isInst = p.value === "installment";
                return (
                  <div
                    key={p.value}
                    className={`border transition-colors ${
                      paymentMethod === p.value ? "border-accent bg-bg-2" : "border-line"
                    }`}
                  >
                    <label className="flex cursor-pointer items-center gap-3 p-4">
                      <input
                        type="radio"
                        name="payment"
                        className="accent-[var(--accent)]"
                        checked={paymentMethod === p.value}
                        onChange={() => setPaymentMethod(p.value)}
                      />
                      <span className="flex-1 font-semibold">{p.label}</span>
                      {isInst && (
                        <button
                          type="button"
                          onClick={() => setInstOpen((v) => !v)}
                          aria-label="Подробнее о платеже частями"
                          aria-expanded={instOpen}
                          className="shrink-0 p-1 text-fg-dim hover:text-accent"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            className={`transition-transform duration-200 ${instOpen ? "rotate-180" : ""}`}
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </button>
                      )}
                    </label>
                    {isInst && instOpen && (
                      <div className="border-t border-line px-4 py-3 text-sm text-fg-dim">
                        <p>
                          Разделите стоимость заказа на 4 равных платежа. Первый платёж — сразу
                          при оформлении, остальные три — автоматически по графику.
                        </p>
                        <p className="mt-2 text-accent-2">
                          Без переплат. Отправка заказа — сразу же после оплаты первого взноса.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <label className="lbl">Комментарий к заказу</label>
              <textarea
                className="field"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Мы растём благодаря вам. Здесь вы можете оставить пожелания по развитию бренда или помощи в его участии."
              />
            </div>
          </section>
        </div>

        {/* Итог */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 border border-line bg-bg-2 p-6">
            <h2 className="display text-2xl">Ваш заказ</h2>
            <ul className="mt-4 space-y-3">
              {items.map((it) => (
                <li key={`${it.productId}-${it.size}`} className="flex justify-between gap-2 text-sm">
                  <span className="text-fg-dim">
                    {it.title} · {it.size} × {it.qty}
                  </span>
                  <span className="mono whitespace-nowrap">{formatPrice(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mono mt-5 flex justify-between border-t border-line pt-4 text-sm text-fg-dim">
              <span>Товары</span>
              <span>{formatPrice(itemsTotal)}</span>
            </div>
            <div className="mono mt-2 flex justify-between text-sm text-fg-dim">
              <span>Доставка</span>
              <span>
                {isSupportDelivery(deliveryMethod)
                  ? "уточняется"
                  : deliveryCost === 0
                    ? "бесплатно"
                    : formatPrice(deliveryCost)}
              </span>
            </div>
            <div className="mt-4 flex justify-between border-t border-line pt-4">
              <span className="display text-xl">
                {isSupportDelivery(deliveryMethod) ? "Сумма товаров" : "К оплате"}
              </span>
              <span className="display text-xl text-accent">
                {formatPrice(isSupportDelivery(deliveryMethod) ? itemsTotal : total)}
              </span>
            </div>
            {isSupportDelivery(deliveryMethod) && (
              <p className="mono mt-2 text-xs text-fg-dim">
                Стоимость доставки и оплату согласуем с вами в Telegram после оформления.
              </p>
            )}

            {error && (
              <p className="mono mt-4 border border-accent bg-accent/10 p-3 text-xs text-accent">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn btn-accent mt-6 w-full">
              {loading
                ? "Создаём заказ…"
                : isSupportDelivery(deliveryMethod)
                  ? "Оформить через поддержку"
                  : "Перейти к оплате"}
            </button>
            <p className="mono mt-3 text-center text-[10px] uppercase tracking-widest text-fg-dim">
              Нажимая, вы соглашаетесь с офертой
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
