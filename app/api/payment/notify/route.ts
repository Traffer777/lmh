import { NextRequest, NextResponse } from "next/server";
import { verifyAndFetchPayment } from "@/lib/yookassa";
import { markOrderPaid } from "@/lib/orders";

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
    await markOrderPaid(result.orderNumber, result.paymentId);
  }

  return new NextResponse("ok");
}
