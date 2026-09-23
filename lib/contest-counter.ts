// Счётчик конкурса LMH × Глебас — считаем оплаченные заказы напрямую из базы,
// без внешнего бота (раньше тут был запрос к отдельному "бот-серверу", которого
// по факту не существовало — счётчик всегда показывал 0).
import { prisma } from "@/lib/prisma";

export type ContestCounter = {
  paidOrders: number;
  goal: number;
};

const GOAL = 1000;

export async function getContestCounter(): Promise<ContestCounter> {
  // В розыгрыше участвуют только заказы с товарами LMH × Глебас (drop.slug = "glebas").
  const paidOrders = await prisma.order.count({
    where: {
      status: { in: ["paid", "shipped", "done"] },
      items: { some: { product: { drop: { slug: "glebas" } } } },
    },
  });
  return { paidOrders, goal: GOAL };
}
