"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AccountAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const url = mode === "login" ? "/api/account/login" : "/api/account/register";
    const payload =
      mode === "login" ? { login, password } : { name, phone, email, password };
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      router.push("/account");
      router.refresh();
    } else {
      setError(data.error ?? "Ошибка. Попробуйте ещё раз.");
      setLoading(false);
    }
  }

  const tab = (active: boolean) =>
    `mono flex-1 border px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
      active ? "border-accent bg-accent text-white" : "border-line text-fg-dim hover:text-fg"
    }`;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12 md:px-6">
      <form onSubmit={submit} className="w-full border border-line bg-bg-2 p-8">
        <h1 className="display text-4xl">Личный кабинет</h1>
        <p className="mt-2 text-sm text-fg-dim">
          Заходите по телефону и почте — заказы и история всегда под рукой.
        </p>

        <div className="mt-6 flex gap-2">
          <button type="button" className={tab(mode === "login")} onClick={() => setMode("login")}>
            Вход
          </button>
          <button
            type="button"
            className={tab(mode === "register")}
            onClick={() => setMode("register")}
          >
            Регистрация
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {mode === "register" ? (
            <>
              <div>
                <label className="lbl">Имя *</label>
                <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="lbl">Телефон *</label>
                <input
                  className="field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 ___ ___-__-__"
                />
              </div>
              <div>
                <label className="lbl">E-mail *</label>
                <input
                  type="email"
                  className="field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="lbl">Телефон или e-mail *</label>
              <input className="field" value={login} onChange={(e) => setLogin(e.target.value)} />
            </div>
          )}
          <div>
            <label className="lbl">Пароль *</label>
            <input
              type="password"
              className="field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "register" ? "минимум 6 символов" : ""}
            />
          </div>
        </div>

        {error && <p className="mono mt-4 text-xs text-accent">{error}</p>}

        <button type="submit" disabled={loading} className="btn btn-accent mt-6 w-full">
          {loading ? "Подождите…" : mode === "login" ? "Войти" : "Создать кабинет"}
        </button>

        <Link
          href="/"
          className="mono mt-4 block text-center text-[10px] uppercase tracking-widest text-fg-dim hover:text-fg"
        >
          ← На главную
        </Link>
      </form>
    </div>
  );
}
