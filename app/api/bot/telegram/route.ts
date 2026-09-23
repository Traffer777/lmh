import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegram } from "@/lib/contest";

export async function POST(request: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
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

  if (!chatId || !text) return new NextResponse("ok");

  if (text === "/start") {
    const reply =
      `Привет${firstName ? `, ${firstName}` : ""}! 👋\n\n` +
      `Это бот конкурса LMH × ГЛЕБАС 🏁\n\n` +
      `Твой Telegram ID: <code>${chatId}</code>\n` +
      `Скопируй его и укажи при оформлении заказа на лмх.com — ` +
      `за каждую покупку начислятся билеты на розыгрыш стразовой Приоры!\n\n` +
      `Команды:\n` +
      `/id — твой ID для копирования\n` +
      `/tickets — сколько билетов у тебя\n` +
      `/rules — правила конкурса`;
    await sendTelegram(token, chatId, reply).catch(() => {});
  } else if (text === "/id") {
    await sendTelegram(token, chatId, `<code>${chatId}</code>`).catch(() => {});
  } else if (text === "/tickets" || text === "/билеты") {
    const result = await prisma.contestTicket.aggregate({
      where: { telegramId: chatId },
      _sum: { tickets: true },
      _count: true,
    });
    const total = result._sum.tickets ?? 0;
    const orders = result._count;
    if (total === 0) {
      await sendTelegram(
        token,
        chatId,
        `У тебя пока нет билетов.\n\nСделай заказ на лмх.com и укажи свой ID (<code>${chatId}</code>) при оформлении!`,
      ).catch(() => {});
    } else {
      await sendTelegram(
        token,
        chatId,
        `🎟 Твои билеты: ${total}\nЗаказов: ${orders}\n\nЧем больше покупок — тем выше шансы выиграть стразовую Приору! 🏁`,
      ).catch(() => {});
    }
  } else if (text === "/rules" || text === "/правила") {
    await sendTelegram(
      token,
      chatId,
      `📋 Правила конкурса LMH × ГЛЕБАС\n\n` +
        `За каждую покупку на лмх.com начисляются билеты:\n` +
        `• Футболка/лонгслив — 1 билет\n` +
        `• Худи/зип-худи — 2 билета\n` +
        `• Пуховик/куртка — 4 билета\n` +
        `• Аксессуары — 1 билет\n\n` +
        `Бонусы:\n` +
        `• Корзина от 30 000₽ → +3 билета\n` +
        `• Корзина от 50 000₽ → ×2 ко всем билетам\n\n` +
        `Призы:\n` +
        `🏁 Главный приз — стразовая Приора!\n\n` +
        `Укажи свой ID (<code>${chatId}</code>) при оформлении заказа.`,
    ).catch(() => {});
  }

  return new NextResponse("ok");
}
