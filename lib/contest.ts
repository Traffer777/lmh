import { prisma } from "@/lib/prisma";
import { ticketsForOrder } from "@/lib/tickets";

export async function notifyContestBot(orderId: number): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order?.telegramId) return;

  const tgId = order.telegramId.replace(/^@/, "").trim();
  if (!tgId) return;

  const tickets = ticketsForOrder(
    order.items.map((i) => ({ category: i.product?.category ?? null, qty: i.qty })),
    order.itemsTotal,
  );
  if (tickets.total <= 0) return;

  const existing = await prisma.contestTicket.findUnique({ where: { orderId } });
  if (existing) return;

  await prisma.contestTicket.create({
    data: { telegramId: tgId, orderId, tickets: tickets.total },
  });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  const numericId = /^\d+$/.test(tgId) ? tgId : null;
  if (!numericId) return;

  const userTotal = await prisma.contestTicket.aggregate({
    where: { telegramId: tgId },
    _sum: { tickets: true },
  });
  const totalTickets = userTotal._sum.tickets ?? tickets.total;

  const text =
    `🎟 +${tickets.total} билет${plural(tickets.total)} за заказ #${order.number}!\n\n` +
    `Всего у тебя: ${totalTickets} билет${plural(totalTickets)}\n` +
    (tickets.bonusFlat > 0 ? `Бонус +${tickets.bonusFlat} (корзина от 30 000₽)\n` : "") +
    (tickets.multiplier > 1 ? `Множитель ×${tickets.multiplier} (корзина от 50 000₽)\n` : "") +
    `\nУдачи в розыгрыше стразовой Приоры! 🏁`;

  await sendTelegram(token, numericId, text).catch(() => {});
}

function plural(n: number): string {
  const mod = n % 10;
  const mod100 = n % 100;
  if (mod === 1 && mod100 !== 11) return "";
  if (mod >= 2 && mod <= 4 && (mod100 < 12 || mod100 > 14)) return "а";
  return "ов";
}

export async function sendTelegram(token: string, chatId: string, text: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
    signal: AbortSignal.timeout(5000),
  });
}
