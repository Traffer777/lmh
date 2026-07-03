import crypto from "crypto";
import { cookies } from "next/headers";

// Простая авторизация админки: логин/пароль из env, подписанная кука-сессия.
// Для прода — усилить (хеш паролей, ротация секрета, rate-limit).

const COOKIE_NAME = "lmh_admin";

function secret(): string {
  return process.env.ADMIN_SECRET ?? "dev-secret-change-me";
}

function sign(value: string): string {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

export function checkCredentials(login: string, password: string): boolean {
  const okLogin = login === (process.env.ADMIN_LOGIN ?? "admin");
  const okPass = password === (process.env.ADMIN_PASSWORD ?? "lmh-demo");
  return okLogin && okPass;
}

export async function createSession(): Promise<void> {
  const payload = `admin.${Date.now()}`;
  const token = `${payload}.${sign(payload)}`;
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // неделя
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx < 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  return sign(payload) === sig;
}
