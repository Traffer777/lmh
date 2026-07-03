import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Авторизация клиентов: личный кабинет по телефону + почте.
// Пароль хранится как scrypt-хэш. Сессия — подписанная кука.

const COOKIE = "lmh_customer";

function secret(): string {
  return process.env.ADMIN_SECRET ?? "dev-secret-change-me";
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(password, salt, 64).toString("hex");
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(test, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function sign(value: string): string {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

export async function createCustomerSession(customerId: number): Promise<void> {
  const payload = `${customerId}.${Date.now()}`;
  const token = `${payload}.${sign(payload)}`;
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 дней
  });
}

export async function destroyCustomerSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getCurrentCustomerId(): Promise<number | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const idx = token.lastIndexOf(".");
  if (idx < 0) return null;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  if (sign(payload) !== sig) return null;
  const id = Number(payload.split(".")[0]);
  return Number.isFinite(id) ? id : null;
}

export async function getCurrentCustomer() {
  const id = await getCurrentCustomerId();
  if (!id) return null;
  return prisma.customer.findUnique({ where: { id } });
}
