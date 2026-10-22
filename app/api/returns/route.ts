import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyReturnRequest } from "@/lib/telegram";
import { RETURN_KINDS, buildReturnLetter, returnKindLabel, returnNumber } from "@/lib/returns";
import { findReturnableOrder } from "./shared";

type Body = {
  orderNumber: string;
  contact: string;
  kind: string;
  items: { id: number; qty: number }[];
  customerName: string;
  email: string;
  reason: string;
};

// Шаг 2: регистрируем заявку, шлём владельцу в Telegram и отдаём текст заявления,
// которое покупатель отправляет на почту.
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Partial<Body>;
  const res = await findReturnableOrder(String(body.orderNumber ?? ""), String(body.contact ?? ""));
  if ("error" in res) return NextResponse.json({ ok: false, error: res.error }, { status: 404 });
  const { order } = res;

  const kind = String(body.kind ?? "");
  if (!RETURN_KINDS.some((k) => k.value === kind))
    return NextResponse.json({ ok: false, error: "Выберите тип заявления." }, { status: 400 });
  const customerName = String(body.customerName ?? "").trim().slice(0, 120);
  const email = String(body.email ?? "").trim().slice(0, 120);
  const reason = String(body.reason ?? "").trim().slice(0, 2000);
  if (customerName.length < 3) return NextResponse.json({ ok: false, error: "Укажите ФИО." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ ok: false, error: "Укажите корректный e-mail." }, { status: 400 });
  if (reason.length < 5) return NextResponse.json({ ok: false, error: "Опишите причину." }, { status: 400 });

  const picked = (Array.isArray(body.items) ? body.items : [])
    .map((p) => {
      const it = order.items.find((i) => i.id === Number(p.id));
      const qty = Math.min(Math.max(1, Math.floor(Number(p.qty) || 0)), it?.qty ?? 0);
      return it && qty > 0 ? { it, qty } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  if (picked.length === 0)
    return NextResponse.json({ ok: false, error: "Отметьте товары для возврата." }, { status: 400 });

  const items = picked.map(({ it, qty }) => `• ${it.title} · ${it.size} × ${qty} — ${it.price * qty} ₽`).join("\n");
  const amount = picked.reduce((s, { it, qty }) => s + it.price * qty, 0);

  const created = await prisma.returnRequest.create({
    data: { number: `tmp-${Date.now()}-${Math.random()}`, orderId: order.id, kind, customerName, phone: order.phone, email, items, amount, reason },
  });
  const number = returnNumber(created.id);
  await prisma.returnRequest.update({ where: { id: created.id }, data: { number } });

  const letter = buildReturnLetter({
    number,
    orderNumber: order.number,
    orderDate: order.createdAt.toLocaleDateString("ru-RU"),
    kind,
    customerName,
    phone: order.phone,
    email,
    items,
    amount,
    reason,
  });

  await notifyReturnRequest({
    number,
    orderNumber: order.number,
    kindLabel: returnKindLabel(kind),
    customerName,
    phone: order.phone,
    email,
    items,
    amount,
    reason,
  }).catch(() => {});

  return NextResponse.json({ ok: true, number, ...letter });
}
