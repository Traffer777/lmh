import { NextRequest, NextResponse } from "next/server";
import { verifyAndFetchPayment } from "@/lib/yookassa";
import { markOrderPaid } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { notifyContestBot } from "@/lib/contest";

// Вебхук ЮKassa. Уведомление не подписано — перепроверяем платёж по API
// (verifyAndFetchPayment) и доверяем только этому ответу, а не телу запроса.
export async function POST(request: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return new NextResponse("bad request", { status: 400 });
  }

  const result = await verifyAndFetchPayment(payload);
  if (result.ok && result.paid) {
    const justPaid = await markOrderPaid(result.orderNumber, result.paymentId);
    if (justPaid) {
      const order = await prisma.order.findUnique({ where: { number: result.orderNumber }, select: { id: true } });
      if (order) void notifyContestBot(order.id).catch(() => {});
    }
  }

  return new NextResponse("ok");
}
