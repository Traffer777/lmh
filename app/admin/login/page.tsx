"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(data.error ?? "Ошибка входa.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm items-center px-4">
      <form onSubmit={submit} className="w-full border border-line bg-bg-2 p-8">
        <div className="display text-3xl">LMH · Админка</div>
        <p className="mono mt-1 text-xs uppercase tracking-widest text-fg-dim">Вход</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="lbl">Логин</label>
            <input className="field" value={login} onChange={(e) => setLogin(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="lbl">Пароль</label>
            <input
              type="password"
              className="field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="mono mt-4 text-xs text-accent">{error}</p>}

        <button type="submit" disabled={loading} className="btn btn-accent mt-6 w-full">
          {loading ? "Вход…" : "Войти"}
        </button>
        <p className="mono mt-4 text-[10px] uppercase leading-relaxed tracking-widest text-fg-dim">
          Демо-доступ: admin / lmh-demo (меняется в .env)
        </p>
      </form>
    </div>
  );
}
