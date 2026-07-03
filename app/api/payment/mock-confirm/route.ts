import { NextRequest, NextResponse } from "next/server";
import { paymentMode } from "@/lib/payment-mode";
import { markOrderPaid } from "@/lib/orders";

// Демо-подтверждение оплаты. Работает ТОЛЬКО в режиме mock.
export async function POST(request: NextRequest) {
  if (paymentMode() !== "mock") {
    return NextResponse.json({ ok: false, error: "Недоступно вне демо-режима." }, { status: 403 });
  }
  let number = "";
  try {
    const body = await request.json();
    number = String(body.number ?? "");
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный запрос." }, { status: 400 });
  }
  if (!number) return NextResponse.json({ ok: false, error: "Не указан заказ." }, { status: 400 });

  const ok = await markOrderPaid(number, `mock-${number}`);
  if (!ok) return NextResponse.json({ ok: false, error: "Заказ не найден." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
