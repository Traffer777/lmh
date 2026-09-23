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
  const [telegramId, setTelegramId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [instOpen, setInstOpen] = useState(false);

  // Личный кабинет: предложение создать при оформлении (для гостей).
  const [loggedIn, setLoggedIn] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");

  // СДЭК: выбор города → выбор ПВЗ → живой расчёт цены.
  type City = { code: number; city: string; region: string };
  type Pvz = { code: string; address: string; name: string };
  const [cityQuery, setCityQuery] = useState("");
  const [cityResults, setCityResults] = useState<City[]>([]);
  const [cityOpen, setCityOpen] = useState(false);
  const [citySearching, setCitySearching] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [pvzList, setPvzList] = useState<Pvz[]>([]);
  const [pvzLoading, setPvzLoading] = useState(false);
  const [pvzFilter, setPvzFilter] = useState("");
  const [selectedPvz, setSelectedPvz] = useState<Pvz | null>(null);
  const [cdekQuote, setCdekQuote] = useState<{ cost: number; minDays?: number; maxDays?: number } | null>(null);
  const [cdekLoading, setCdekLoading] = useState(false);
  const [cdekError, setCdekError] = useState<string | null>(null);

  const totalQty = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const freeShipping = itemsTotal >= FREE_SHIPPING_THRESHOLD;

  useEffect(() => setMounted(true), []);

  // Поиск города по мере ввода (СДЭК ищет по полному названию).
  useEffect(() => {
    if (deliveryMethod !== "cdek") return;
    if (selectedCity && cityQuery === selectedCity.city) return; // уже выбран
    const q = cityQuery.trim();
    if (q.length < 2) {
      setCityResults([]);
      return;
    }
    let cancelled = false;
    setCitySearching(true);
    const t = setTimeout(() => {
      fetch(`/api/delivery/cdek/cities?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          setCityResults(d.ok ? d.cities : []);
          setCityOpen(true);
        })
        .catch(() => !cancelled && setCityResults([]))
        .finally(() => !cancelled && setCitySearching(false));
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [cityQuery, deliveryMethod, selectedCity]);

  // При выборе города — грузим список ПВЗ и считаем цену.
  useEffect(() => {
    setPvzList([]);
    setSelectedPvz(null);
    setPvzFilter("");
    setCdekQuote(null);
    setCdekError(null);
    if (deliveryMethod !== "cdek" || !selectedCity) return;
    let cancelled = false;

    setPvzLoading(true);
    fetch(`/api/delivery/cdek/points?city=${selectedCity.code}`)
      .then((r) => r.json())
      .then((d) => !cancelled && setPvzList(d.ok ? d.points : []))
      .catch(() => !cancelled && setPvzList([]))
      .finally(() => !cancelled && setPvzLoading(false));

    if (!freeShipping) {
      setCdekLoading(true);
      fetch(`/api/delivery/cdek?city=${selectedCity.code}&qty=${totalQty}`)
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          if (d.ok) setCdekQuote({ cost: d.cost, minDays: d.minDays, maxDays: d.maxDays });
          else setCdekError(d.error ?? "Не удалось рассчитать доставку.");
        })
        .catch(() => !cancelled && setCdekError("Не удалось рассчитать доставку."))
        .finally(() => !cancelled && setCdekLoading(false));
    }

    return () => {
      cancelled = true;
    };
  }, [selectedCity, deliveryMethod, freeShipping, totalQty]);

  // Если клиент вошёл в кабинет — подставляем его контакты.
  useEffect(() => {
    fetch("/api/account/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.customer) {
          setLoggedIn(true);
          setName((v) => v || d.customer.name);
          setPhone((v) => v || d.customer.phone);
          setEmail((v) => v || d.customer.email);
        }
      })
      .catch(() => {});
  }, []);

  const deliveryDef = DELIVERY_METHODS.find((d) => d.value === deliveryMethod)!;
  // Для СДЭК стоимость — из живого расчёта по городу (null, пока не посчитана).
  const deliveryCost = useMemo<number | null>(() => {
    if (freeShipping) return 0;
    if (deliveryMethod === "cdek") return cdekQuote ? cdekQuote.cost : null;
    return deliveryDef.cost;
  }, [freeShipping, deliveryMethod, cdekQuote, deliveryDef]);
  const total = itemsTotal + (deliveryCost ?? 0);
  // Для СДЭК нужно выбрать город и ПВЗ; если не бесплатно — ещё и рассчитать цену.
  const cdekNotReady =
    deliveryMethod === "cdek" && (!selectedCity || !selectedPvz || (!freeShipping && cdekQuote === null));

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
      // Гость захотел кабинет — сначала регистрируем (сессия привяжет заказ к клиенту).
      if (!loggedIn && createAccount) {
        if (accountPassword.length < 6) {
          setError("Пароль для кабинета — минимум 6 символов.");
          setLoading(false);
          return;
        }
        const reg = await fetch("/api/account/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, email, password: accountPassword }),
        });
        const rd = await reg.json();
        if (!rd.ok) {
          setError(rd.error ?? "Не удалось создать кабинет.");
          setLoading(false);
          return;
        }
        setLoggedIn(true);
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            qty: i.qty,
            ...(i.custom && (i.custom.name || i.custom.number) ? { custom: i.custom } : {}),
          })),
          customer: { name, phone, email },
          delivery:
            deliveryMethod === "cdek"
              ? {
                  method: "cdek",
                  cityCode: selectedCity?.code,
                  cityName: selectedCity?.city,
                  pvzCode: selectedPvz?.code,
                  pvzAddress: selectedPvz?.address,
                }
              : { method: deliveryMethod, address },
          paymentMethod,
          comment,
          telegramId: telegramId.trim() || undefined,
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

            {/* Предложение создать личный кабинет (для гостей) */}
            {!loggedIn && (
              <div className="mt-4 border border-line bg-bg-2 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 accent-[var(--accent)]"
                    checked={createAccount}
                    onChange={(e) => setCreateAccount(e.target.checked)}
                  />
                  <span className="flex-1 text-sm">
                    <span className="font-semibold">Создать личный кабинет</span>
                    <span className="mono mt-1 block text-xs text-fg-dim">
                      Быстрое оформление, история заказов и статусы. Понадобится e-mail и пароль.
                    </span>
                  </span>
                </label>
                {createAccount && (
                  <div className="mt-3">
                    <label className="lbl">Пароль для кабинета *</label>
                    <input
                      type="password"
                      className="field"
                      value={accountPassword}
                      onChange={(e) => setAccountPassword(e.target.value)}
                      placeholder="минимум 6 символов"
                      autoComplete="new-password"
                    />
                    <p className="mono mt-2 text-xs text-fg-dim">
                      Уже есть кабинет?{" "}
                      <Link href="/account/login" className="text-accent hover:underline">
                        Войти
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Доставка */}
          <section>
            <h2 className="display mb-4 text-2xl">2. Доставка</h2>
            <div className="space-y-3">
              {DELIVERY_METHODS.map((d) => {
                const free = itemsTotal >= FREE_SHIPPING_THRESHOLD;
                // Цена в правом столбце для конкретного способа.
                let priceLabel: string;
                if (isSupportDelivery(d.value)) priceLabel = "уточняется";
                else if (free) priceLabel = "бесплатно";
                else if (d.value === "cdek")
                  priceLabel =
                    deliveryMethod === "cdek"
                      ? cdekLoading
                        ? "считаем…"
                        : cdekQuote
                          ? formatPrice(cdekQuote.cost)
                          : "по городу"
                      : "по городу";
                else priceLabel = formatPrice(d.cost);

                const eta =
                  d.value === "cdek" && deliveryMethod === "cdek" && cdekQuote?.minDays
                    ? `${cdekQuote.minDays}–${cdekQuote.maxDays ?? cdekQuote.minDays} дн.`
                    : d.eta;

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
                        <span className="mono text-sm">{priceLabel}</span>
                      </span>
                      <span className="mono text-xs text-fg-dim">Срок: {eta}</span>
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
            ) : deliveryMethod === "cdek" ? (
              <div className="mt-4 space-y-4">
                {/* Город */}
                <div className="relative">
                  <label className="lbl">Город *</label>
                  <input
                    className="field"
                    value={cityQuery}
                    onChange={(e) => {
                      setCityQuery(e.target.value);
                      setSelectedCity(null);
                    }}
                    onFocus={() => cityResults.length && setCityOpen(true)}
                    placeholder="Введите город полностью, напр. Новосибирск"
                    autoComplete="off"
                  />
                  {citySearching && (
                    <p className="mono mt-1 text-xs text-fg-dim">Ищем город…</p>
                  )}
                  {cityOpen && cityResults.length > 0 && !selectedCity && (
                    <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto border border-line bg-bg-2 shadow-lg">
                      {cityResults.map((c) => (
                        <li key={c.code}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCity(c);
                              setCityQuery(c.city);
                              setCityOpen(false);
                            }}
                            className="flex w-full flex-col items-start px-4 py-2 text-left hover:bg-bg"
                          >
                            <span className="text-sm">{c.city}</span>
                            {c.region && <span className="mono text-xs text-fg-dim">{c.region}</span>}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {cityQuery.trim().length >= 2 && !citySearching && !selectedCity && cityResults.length === 0 && (
                    <p className="mono mt-1 text-xs text-fg-dim">
                      Город не найден — введите название полностью.
                    </p>
                  )}
                </div>

                {/* Пункт выдачи */}
                {selectedCity && (
                  <div>
                    <label className="lbl">Пункт выдачи СДЭК *</label>
                    {pvzLoading ? (
                      <p className="mono text-xs text-fg-dim">Загружаем пункты выдачи…</p>
                    ) : pvzList.length === 0 ? (
                      <p className="mono text-xs text-fg-dim">
                        В этом городе не нашлось пунктов выдачи СДЭК. Выберите другой город.
                      </p>
                    ) : (
                      <>
                        {pvzList.length > 8 && (
                          <input
                            className="field mb-2"
                            value={pvzFilter}
                            onChange={(e) => setPvzFilter(e.target.value)}
                            placeholder="Поиск по адресу пункта выдачи"
                          />
                        )}
                        <div className="max-h-56 space-y-2 overflow-auto border border-line bg-bg-2 p-2">
                          {pvzList
                            .filter((p) =>
                              p.address.toLowerCase().includes(pvzFilter.trim().toLowerCase()),
                            )
                            .slice(0, 60)
                            .map((p) => (
                              <label
                                key={p.code}
                                className={`flex cursor-pointer items-start gap-2 border p-2 text-sm transition-colors ${
                                  selectedPvz?.code === p.code
                                    ? "border-accent bg-bg"
                                    : "border-line hover:border-fg-dim"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="pvz"
                                  className="mt-1 accent-[var(--accent)]"
                                  checked={selectedPvz?.code === p.code}
                                  onChange={() => setSelectedPvz(p)}
                                />
                                <span>{p.address}</span>
                              </label>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Стоимость */}
                {freeShipping ? (
                  <p className="mono text-xs text-accent-2">Ваш заказ — бесплатная доставка.</p>
                ) : cdekLoading ? (
                  <p className="mono text-xs text-fg-dim">Рассчитываем стоимость СДЭК…</p>
                ) : cdekQuote ? (
                  <p className="mono text-xs text-fg-dim">
                    Доставка до ПВЗ: {formatPrice(cdekQuote.cost)}
                    {cdekQuote.minDays
                      ? ` · ${cdekQuote.minDays}–${cdekQuote.maxDays ?? cdekQuote.minDays} дн.`
                      : ""}
                  </p>
                ) : cdekError ? (
                  <p className="mono text-xs text-accent">{cdekError}</p>
                ) : (
                  <p className="mono text-xs text-fg-dim">
                    Выберите город — рассчитаем стоимость доставки из Москвы.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-4">
                <label className="lbl">
                  {deliveryMethod === "intl" ? "Страна, город, адрес *" : "Город, адрес *"}
                </label>
                <input
                  className="field"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={
                    deliveryMethod === "intl"
                      ? "Беларусь, Минск, ул. ..., индекс"
                      : "Город, ул. ..., индекс"
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
            <div className="mt-4 border border-line bg-bg-2/60 p-4">
              <label className="lbl">
                🏁 Telegram для конкурса LMH × ГЛЕБАС
                <span className="ml-2 text-xs text-fg-2">(необязательно)</span>
              </label>
              <input
                className="field"
                type="text"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                placeholder="@nickname или числовой ID"
              />
              <p className="mt-2 text-xs text-fg-2">
                Укажи свой Telegram — начислим билеты на розыгрыш{" "}
                <span className="text-fg">стразовой Приоры</span>. Билеты начисляются только за
                товары коллекции LMH × ГЛЕБАС в заказе.
              </p>
            </div>
          </section>
        </div>

        {/* Итог */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 border border-line bg-bg-2 p-6">
            <h2 className="display text-2xl">Ваш заказ</h2>
            <ul className="mt-4 space-y-3">
              {items.map((it) => (
                <li
                  key={`${it.productId}-${it.size}-${it.custom?.name ?? ""}-${it.custom?.number ?? ""}`}
                  className="flex justify-between gap-2 text-sm"
                >
                  <span className="text-fg-dim">
                    {it.title} · {it.size} × {it.qty}
                    {it.custom && (it.custom.name || it.custom.number)
                      ? ` · нанесение: ${it.custom.name ?? ""}${it.custom.number ? ` №${it.custom.number}` : ""}`
                      : ""}
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
                    : deliveryCost === null
                      ? "по городу"
                      : formatPrice(deliveryCost)}
              </span>
            </div>
            <div className="mt-4 flex justify-between border-t border-line pt-4">
              <span className="display text-xl">
                {isSupportDelivery(deliveryMethod) ? "Сумма товаров" : "К оплате"}
              </span>
              <span className="display text-xl text-accent">
                {isSupportDelivery(deliveryMethod)
                  ? formatPrice(itemsTotal)
                  : cdekNotReady
                    ? "—"
                    : formatPrice(total)}
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

            <button
              type="submit"
              disabled={loading || cdekNotReady}
              className="btn btn-accent mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Создаём заказ…"
                : cdekNotReady
                  ? cdekLoading
                    ? "Считаем доставку…"
                    : !selectedCity
                      ? "Выберите город СДЭК"
                      : "Выберите пункт выдачи"
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
