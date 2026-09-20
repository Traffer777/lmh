"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Всплывающее окно с предложением создать личный кабинет. Появляется через 15 секунд
// после захода на сайт. Показывается один раз на посетителя (флаг в localStorage) и
// НЕ показывается тем, кто уже вошёл в кабинет.
const SEEN_KEY = "lmh_reg_prompt_v1";

export default function RegisterPrompt() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(SEEN_KEY)) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    (async () => {
      // Уже вошедшим — не предлагаем.
      try {
        const d = await fetch("/api/account/me").then((r) => r.json());
        if (d.ok && d.customer) {
          localStorage.setItem(SEEN_KEY, "1");
          return;
        }
      } catch {
        // нет сети — всё равно предложим позже
      }
      if (cancelled) return;
      timer = setTimeout(() => {
        if (!cancelled) setOpen(true);
      }, 15000);
    })();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  function dismiss() {
    localStorage.setItem(SEEN_KEY, "1");
    setOpen(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, password }),
      });
      const d = await res.json();
      if (!res.ok || !d.ok) {
        setError(d.error ?? "Не удалось создать кабинет.");
        setLoading(false);
        return;
      }
      localStorage.setItem(SEEN_KEY, "1");
      setDone(true);
      setLoading(false);
      // Обновляем страницу, чтобы подтянуть вошедшего пользователя.
      setTimeout(() => window.location.reload(), 1400);
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Создать личный кабинет"
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-md border border-line bg-bg p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Закрыть"
          className="absolute right-3 top-3 p-1 text-fg-dim hover:text-accent"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {done ? (
          <div className="py-6 text-center">
            <h2 className="display text-2xl">Кабинет создан</h2>
            <p className="mono mt-2 text-sm text-fg-dim">Добро пожаловать в LMH.</p>
          </div>
        ) : (
          <>
            <h2 className="display text-2xl md:text-3xl">Свой кабинет LMH</h2>
            <p className="mono mt-2 text-xs text-fg-dim">
              Быстрое оформление, история заказов и статусы доставки — в одном месте.
            </p>

            <form onSubmit={submit} className="mt-5 space-y-3">
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
              <div>
                <label className="lbl">E-mail *</label>
                <input
                  type="email"
                  className="field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="lbl">Пароль *</label>
                <input
                  type="password"
                  className="field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="минимум 6 символов"
                  autoComplete="new-password"
                  required
                />
              </div>

              {error && (
                <p className="mono border border-accent bg-accent/10 p-2 text-xs text-accent">{error}</p>
              )}

              <button type="submit" disabled={loading} className="btn btn-accent w-full disabled:opacity-50">
                {loading ? "Создаём…" : "Создать кабинет"}
              </button>
            </form>

            <p className="mono mt-3 text-center text-xs text-fg-dim">
              Уже есть кабинет?{" "}
              <Link href="/account/login" className="text-accent hover:underline" onClick={dismiss}>
                Войти
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
