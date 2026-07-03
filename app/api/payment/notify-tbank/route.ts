import { NextRequest, NextResponse } from "next/server";
import { verifyInstallmentNotification } from "@/lib/tbank-installment";
import { markOrderPaid } from "@/lib/orders";

// Вебхук Т-Банк «Долями» (Notification). Тот же формат, что у Tinkoff Acquiring:
// подписан Token'ом (SHA-256 от отсортированных полей + Password терминала).
export async function POST(request: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return new NextResponse("ERROR", { status: 400 });
  }

  if (!verifyInstallmentNotification(payload)) {
    return new NextResponse("BAD TOKEN", { status: 403 });
  }

  const status = String(payload.Status ?? "");
  const orderId = String(payload.OrderId ?? "");
  const paymentId = payload.PaymentId != null ? String(payload.PaymentId) : undefined;

  if ((status === "CONFIRMED" || status === "AUTHORIZED") && orderId) {
    await markOrderPaid(orderId, paymentId);
  }

  // Т-Банк ждёт ровно "OK" в ответ.
  return new NextResponse("OK");
}
