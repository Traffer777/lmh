import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { ticketsForOrder } from "@/lib/tickets";

// Отправка события «оплата прошла» боту конкурса LMH × Глебас.
// Бот держится отдельно, магазин только пушит подписанный webhook: order_id,
// telegramId, состав, tickets. Идемпотентность на стороне бота по orderId.

type ContestPayload = {
  orderId: number;
  orderNumber: string;
  telegramId: string;
  amount: number;
  items: { sku: string | null; title: string; category: string | null; qty: number; price: number }[];
  tickets: ReturnType<typeof ticketsForOrder>;
  ts: number;
};

function sign(secret: string, body: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

export async function notifyContestBot(orderId: number): Promise<void> {
  const url = process.env.LMH_BOT_WEBHOOK_URL;
  const secret = process.env.LMH_BOT_SECRET;
  if (!url || !secret) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order?.telegramId) return;

  const tickets = ticketsForOrder(
    order.items.map((i) => ({ category: i.product?.category ?? null, qty: i.qty })),
    order.itemsTotal,
  );

  const payload: ContestPayload = {
    orderId: order.id,
    orderNumber: order.number,
    telegramId: order.telegramId,
    amount: order.itemsTotal,
    items: order.items.map((i) => ({
      sku: i.product?.slug ?? null,
      title: i.title,
      category: i.product?.category ?? null,
      qty: i.qty,
      price: i.price,
    })),
    tickets,
    ts: Date.now(),
  };

  const body = JSON.stringify(payload);
  const signature = sign(secret, body);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-lmh-signature": signature,
    },
    body,
    signal: AbortSignal.timeout(5000),
  }).catch(() => null);

  if (!res || !res.ok) {
    console.warn("[contest] notify failed", res?.status);
  }
}
