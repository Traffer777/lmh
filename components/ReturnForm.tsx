"use client";

import { useEffect, useRef, useState } from "react";
import { RETURN_KINDS, RETURNS_EMAIL, mailtoHref } from "@/lib/returns";
import { formatPrice } from "@/lib/format";

type Item = { id: number; title: string; size: string; qty: number; price: number };
type Order = { number: string; date: string; customerName: string; phone: string; email: string; items: Item[] };
type Letter = { number: string; subject: string; body: string };

export default function ReturnForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [contact, setContact] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [kind, setKind] = useState("refund");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [letter, setLetter] = useState<Letter | null>(null);
  const [copied, setCopied] = useState(false);
  const doneRef = useRef<HTMLDivElement>(null);

  // после отправки — прокрутить к блоку «последний шаг», а не в начало страницы
  useEffect(() => {
    if (letter) doneRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [letter]);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/returns/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, contact }),
    });
    const json = await res.json().catch(() => ({ ok: false, error: "Ошибка сети, попробуйте ещё раз." }));
    setBusy(false);
    if (!json.ok) return setError(json.error);
    setOrder(json.order);
    setName(json.order.customerName);
    setEmail(json.order.email);
    // одна позиция — сразу отмечена
    if (json.order.items.length === 1) setPicked({ [json.order.items[0].id]: json.order.items[0].qty });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/returns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderNumber,
        contact,
        kind,
        items: Object.entries(picked).map(([id, qty]) => ({ id: Number(id), qty })),
        customerName: name,
        email,
        reason,
      }),
    });
    const json = await res.json().catch(() => ({ ok: false, error: "Ошибка сети, попробуйте ещё раз." }));
    setBusy(false);
    if (!json.ok) return setError(json.error);
    setLetter({ number: json.number, subject: json.subject, body: json.body });
  }

  async function copy() {
    if (!letter) return;
    try {
      await navigator.clipboard.writeText(`${letter.subject}\n\n${letter.body}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function toggle(it: Item) {
    setPicked((p) => {
      const next = { ...p };
      if (next[it.id]) delete next[it.id];
      else next[it.id] = it.qty;
      return next;
    });
  }

  if (letter) {
    return (
      <div ref={doneRef} className="scroll-mt-24 border border-accent bg-bg-2 p-6">
        <div className="mono text-xs uppercase tracking-[0.3em] text-accent">Заявка {letter.number} зарегистрирована</div>
        <h3 className="display mt-2 text-3xl">Остался последний шаг</h3>
        <p className="mt-3 text-sm text-fg-dim">
          Отправьте заявление на <span className="mono text-fg">{RETURNS_EMAIL}</span>. Нажмите кнопку — откроется
          письмо с готовым текстом. <b className="text-fg">Приложите к письму фото товара и бирок</b>
          {kind === "defect" ? " и крупно — сам дефект" : ""}. Без письма заявка не рассматривается.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a href={mailtoHref(letter.subject, letter.body)} className="btn btn-accent text-center">
            Открыть письмо
          </a>
          <button type="button" onClick={copy} className="btn border border-line">
            {copied ? "Скопировано ✓" : "Скопировать текст"}
          </button>
        </div>
        <p className="mono mt-3 text-xs text-fg-dim">
          Если почта не открылась — скопируйте текст и отправьте вручную. Тема: {letter.subject}
        </p>
        <pre className="mono mt-5 max-h-80 overflow-auto whitespace-pre-wrap break-words border border-line bg-bg p-4 text-xs text-fg-dim">
          {letter.body}
        </pre>
      </div>
    );
  }

  if (!order) {
    return (
      <form onSubmit={lookup} className="space-y-4 border border-line p-6">
        <div className="mono text-xs uppercase tracking-widest text-fg-dim">Шаг 1 из 2 · найдите заказ</div>
        <label className="block">
          <span className="text-sm">Номер заказа</span>
          <input
            className="field mt-1 uppercase"
            placeholder="LMH-…"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm">Телефон или e-mail из заказа</span>
          <input
            className="field mt-1"
            placeholder="+7 999 000-00-00"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />
        </label>
        {error && <p className="mono border border-accent bg-accent/10 p-3 text-xs text-accent">{error}</p>}
        <button className="btn btn-accent w-full" disabled={busy}>
          {busy ? "Ищем…" : "Найти заказ"}
        </button>
        <p className="mono text-xs text-fg-dim">Номер заказа — в письме и на странице после оплаты, вида LMH-XXXX-XXXX.</p>
      </form>
    );
  }

  const total = order.items.reduce((s, it) => s + (picked[it.id] ?? 0) * it.price, 0);

  return (
    <form onSubmit={submit} className="space-y-6 border border-line p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="mono text-xs uppercase tracking-widest text-fg-dim">Шаг 2 из 2 · заявление</div>
        <button type="button" onClick={() => setOrder(null)} className="mono text-xs text-fg-dim hover:text-accent">
          ← другой заказ
        </button>
      </div>
      <div className="text-sm">
        Заказ <span className="mono">{order.number}</span> от {order.date}
      </div>

      <fieldset>
        <legend className="text-sm">Что хотите сделать</legend>
        <div className="mt-2 space-y-2">
          {RETURN_KINDS.map((k) => (
            <label
              key={k.value}
              className={`flex cursor-pointer items-start gap-3 border p-3 ${kind === k.value ? "border-accent bg-bg-2" : "border-line"}`}
            >
              <input
                type="radio"
                name="kind"
                className="mt-1 accent-[var(--accent)]"
                checked={kind === k.value}
                onChange={() => setKind(k.value)}
              />
              <span>
                <span className="font-semibold">{k.label}</span>
                <span className="block text-xs text-fg-dim">{k.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm">Какие товары</legend>
        <div className="mt-2 divide-y divide-line border border-line">
          {order.items.map((it) => (
            <label key={it.id} className="flex cursor-pointer items-center gap-3 p-3">
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={!!picked[it.id]}
                onChange={() => toggle(it)}
              />
              <span className="min-w-0 flex-1 break-words text-sm">
                {it.title} · {it.size}
              </span>
              {it.qty > 1 && picked[it.id] ? (
                <select
                  className="field w-20 py-1"
                  value={picked[it.id]}
                  onChange={(e) => setPicked((p) => ({ ...p, [it.id]: Number(e.target.value) }))}
                >
                  {Array.from({ length: it.qty }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} шт
                    </option>
                  ))}
                </select>
              ) : (
                <span className="mono text-xs text-fg-dim">× {it.qty}</span>
              )}
              <span className="mono shrink-0 text-sm">{formatPrice(it.price * (picked[it.id] || it.qty))}</span>
            </label>
          ))}
        </div>
        {total > 0 && <div className="mono mt-2 text-right text-sm">Сумма: {formatPrice(total)}</div>}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm">ФИО полностью</span>
          <input className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="block">
          <span className="text-sm">E-mail для ответа</span>
          <input
            type="email"
            className="field mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm">Причина</span>
        <textarea
          className="field mt-1 min-h-28"
          placeholder={
            kind === "defect"
              ? "Опишите дефект: где, как выглядит, когда заметили"
              : kind === "exchange"
                ? "На какой размер / модель хотите обменять"
                : "Например: не подошёл размер"
          }
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
      </label>

      {error && <p className="mono border border-accent bg-accent/10 p-3 text-xs text-accent">{error}</p>}
      <button className="btn btn-accent w-full" disabled={busy || total === 0}>
        {busy ? "Отправляем…" : "Сформировать заявление"}
      </button>
    </form>
  );
}
