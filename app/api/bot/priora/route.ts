import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegram } from "@/lib/contest";

// Вебхук @lmhPRIORAbot — отдельный бот-счётчик заказов до Приоры (не путать
// с @lmhworldwide_bot, который для конкурса ГЛЕБАС и уведомлений владельцу).
export async function POST(request: NextRequest) {
  const token = process.env.TELEGRAM_PRIORA_BOT_TOKEN;
  if (!token) return new NextResponse("no token", { status: 500 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new NextResponse("bad json", { status: 400 });
  }

  const message = body.message as Record<string, unknown> | undefined;
  if (!message) return new NextResponse("ok");

  const chat = message.chat as Record<string, unknown> | undefined;
  const text = typeof message.text === "string" ? message.text.trim() : "";
  const chatId = String(chat?.id ?? "");
  const firstName = String((message.from as Record<string, unknown>)?.first_name ?? "");

  if (!chatId) return new NextResponse("ok");

  await prisma.botSubscriber
    .upsert({ where: { chatId }, create: { chatId }, update: {} })
    .catch(() => {});

  if (text === "/start") {
    const paidOrders = await prisma.order.count({ where: { status: { in: ["paid", "shipped", "done"] } } });
    const reply =
      `Привет${firstName ? `, ${firstName}` : ""}! 🏁\n\n` +
      `Я считаю заказы LMH и сообщаю, когда мы становимся ближе к розыгрышу стразовой Приоры.\n\n` +
      `Сейчас: ${paidOrders} / 1000 оплаченных заказов.\n\n` +
      `Раз в 10 заказов буду присылать сюда апдейт — просто оставайся в этом чате.`;
    await sendTelegram(token, chatId, reply).catch(() => {});
  }

  return new NextResponse("ok");
}
